/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for:
 * - Payment confirmation (payment_intent.succeeded)
 * - Payment failure (payment_intent.payment_failed)
 * - Refunds (charge.refunded)
 * - Setup completion (setup_intent.succeeded)
 *
 * Environment variables required:
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret from Stripe dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { constructWebhookEvent } from '@/lib/billing/stripe'
import { logger } from '@/lib/logger'
import type Stripe from 'stripe'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  // Get raw body for signature verification
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logger.warn('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Webhook signature verification failed', { error: message })
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Use service client for admin operations (bypasses RLS)
  const supabase = await createClient('service_role')

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(supabase, event.data.object as Stripe.Charge)
        break

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(supabase, event.data.object as Stripe.SetupIntent)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Future: Handle subscription events
        logger.info('Subscription event received', {
          type: event.type,
          subscriptionId: (event.data.object as Stripe.Subscription).id,
        })
        break

      default:
        logger.info('Unhandled webhook event', { type: event.type })
    }

    return NextResponse.json({ received: true })

  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    logger.error('Error processing webhook', {
      eventType: event.type,
      eventId: event.id,
      error: message,
    })

    // Return 200 to acknowledge receipt even on processing error
    // This prevents Stripe from retrying indefinitely
    return NextResponse.json({ received: true, error: message })
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const metadata = paymentIntent.metadata
  const transactionId = metadata.transaction_id
  const invoiceId = metadata.platform_invoice_id
  const tenantId = metadata.tenant_id

  logger.info('Payment intent succeeded', {
    paymentIntentId: paymentIntent.id,
    transactionId,
    invoiceId,
    amount: paymentIntent.amount,
  })

  if (!transactionId || !invoiceId) {
    logger.warn('Missing metadata in payment intent', { paymentIntentId: paymentIntent.id })
    return
  }

  const now = new Date().toISOString()

  // Update transaction
  const { error: txError } = await supabase
    .from('billing_payment_transactions')
    .update({
      status: 'succeeded',
      stripe_charge_id: paymentIntent.latest_charge as string || null,
      completed_at: now,
    })
    .eq('id', transactionId)

  if (txError) {
    logger.error('Error updating transaction', { error: txError.message, transactionId })
  }

  // Update invoice
  const { data: existingInvoice } = await supabase
    .from('platform_invoices')
    .select('status')
    .eq('id', invoiceId)
    .single()

  // Only update if not already paid (avoid duplicate webhooks)
  if (existingInvoice && existingInvoice.status !== 'paid') {
    await supabase
      .from('platform_invoices')
      .update({
        status: 'paid',
        paid_at: now,
        payment_reference: paymentIntent.id,
        updated_at: now,
      })
      .eq('id', invoiceId)

    // Mark commissions as paid
    await supabase
      .from('store_commissions')
      .update({ status: 'paid', paid_at: now })
      .eq('platform_invoice_id', invoiceId)

    await supabase
      .from('service_commissions')
      .update({ status: 'paid', paid_at: now })
      .eq('platform_invoice_id', invoiceId)

    // Send notification
    if (tenantId) {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('role', 'admin')
        .limit(1)
        .single()

      if (adminProfile) {
        await supabase.from('notifications').insert({
          user_id: adminProfile.id,
          title: 'Pago confirmado',
          message: `Su pago de ₲${(paymentIntent.amount).toLocaleString('es-PY')} ha sido procesado exitosamente.`,
        })
      }
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const metadata = paymentIntent.metadata
  const transactionId = metadata.transaction_id
  const invoiceId = metadata.platform_invoice_id
  const tenantId = metadata.tenant_id

  const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error'

  logger.warn('Payment intent failed', {
    paymentIntentId: paymentIntent.id,
    transactionId,
    invoiceId,
    error: failureMessage,
  })

  if (!transactionId) {
    return
  }

  const now = new Date().toISOString()

  // Update transaction
  await supabase
    .from('billing_payment_transactions')
    .update({
      status: 'failed',
      failure_reason: failureMessage,
      completed_at: now,
    })
    .eq('id', transactionId)

  // Create failure notification
  if (tenantId) {
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (adminProfile) {
      await supabase.from('notifications').insert({
        user_id: adminProfile.id,
        title: 'Error en el pago',
        message: `No se pudo procesar el pago. Razon: ${failureMessage}`,
      })
    }

    // Create reminder for failed payment
    if (invoiceId) {
      await supabase.from('billing_reminders').insert({
        tenant_id: tenantId,
        platform_invoice_id: invoiceId,
        reminder_type: 'overdue_gentle',
        channel: 'email',
        subject: 'Error al procesar su pago',
        content: `Hubo un problema al procesar su pago. Por favor intente nuevamente o utilice otro metodo de pago.`,
      })
    }
  }
}

/**
 * Handle refund
 */
async function handleChargeRefunded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  charge: Stripe.Charge
): Promise<void> {
  const paymentIntentId = charge.payment_intent as string

  logger.info('Charge refunded', {
    chargeId: charge.id,
    paymentIntentId,
    amountRefunded: charge.amount_refunded,
  })

  if (!paymentIntentId) {
    return
  }

  // Find transaction by Stripe payment intent ID
  const { data: transaction } = await supabase
    .from('billing_payment_transactions')
    .select('id, tenant_id, platform_invoice_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!transaction) {
    logger.warn('Transaction not found for refunded charge', { paymentIntentId })
    return
  }

  const now = new Date().toISOString()

  // Check if fully refunded
  if (charge.refunded) {
    await supabase
      .from('billing_payment_transactions')
      .update({
        status: 'refunded',
        completed_at: now,
      })
      .eq('id', transaction.id)

    // Revert invoice to unpaid if fully refunded
    if (transaction.platform_invoice_id) {
      await supabase
        .from('platform_invoices')
        .update({
          status: 'sent', // Back to unpaid/sent
          paid_at: null,
          updated_at: now,
        })
        .eq('id', transaction.platform_invoice_id)

      // Revert commissions to invoiced (not paid)
      await supabase
        .from('store_commissions')
        .update({ status: 'invoiced', paid_at: null })
        .eq('platform_invoice_id', transaction.platform_invoice_id)

      await supabase
        .from('service_commissions')
        .update({ status: 'invoiced', paid_at: null })
        .eq('platform_invoice_id', transaction.platform_invoice_id)
    }

    // Notify admin
    if (transaction.tenant_id) {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', transaction.tenant_id)
        .eq('role', 'admin')
        .limit(1)
        .single()

      if (adminProfile) {
        await supabase.from('notifications').insert({
          user_id: adminProfile.id,
          title: 'Reembolso procesado',
          message: `Se ha procesado un reembolso de ₲${charge.amount_refunded.toLocaleString('es-PY')}.`,
        })
      }
    }
  }
}

/**
 * Handle successful setup (card saved)
 * Note: We're saving payment methods via POST /api/billing/payment-methods
 * This handler is for redundancy/webhooks-first flows
 */
async function handleSetupIntentSucceeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  setupIntent: Stripe.SetupIntent
): Promise<void> {
  const metadata = setupIntent.metadata
  const tenantId = metadata.tenant_id
  const paymentMethodId = setupIntent.payment_method as string

  logger.info('Setup intent succeeded', {
    setupIntentId: setupIntent.id,
    tenantId,
    paymentMethodId,
  })

  // We could auto-save the payment method here, but our current flow
  // has the client call POST /api/billing/payment-methods after confirmation.
  // This webhook ensures we have a record even if client-side fails.

  if (!tenantId || !paymentMethodId) {
    return
  }

  // Check if payment method already saved
  const { data: existing } = await supabase
    .from('tenant_payment_methods')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('stripe_payment_method_id', paymentMethodId)
    .single()

  if (existing) {
    logger.info('Payment method already saved', { paymentMethodId })
    return
  }

  // Optional: Auto-save payment method from webhook
  // For now, we just log it since client handles this
  logger.info('Payment method not yet saved, client should call API', {
    tenantId,
    paymentMethodId,
    setupIntentId: setupIntent.id,
  })
}
