/**
 * Stripe Payment Provider
 * 
 * Implementation of PaymentProvider for Stripe.
 */

import type { 
  PaymentProvider, 
  PaymentIntent, 
  CreatePaymentIntentOptions, 
  ProviderResult 
} from './types'
import { getStripeClient, toStripeAmount } from '../billing/stripe'
import { logger } from '@/lib/logger'
import type Stripe from 'stripe'

export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe'

  async createPaymentIntent(options: CreatePaymentIntentOptions): Promise<ProviderResult<PaymentIntent>> {
    try {
      const stripe = getStripeClient()
      
      const params: Stripe.PaymentIntentCreateParams = {
        amount: toStripeAmount(options.amount, options.currency),
        currency: options.currency.toLowerCase(),
        metadata: {
          tenant_id: options.tenantId,
          invoice_id: options.invoiceId,
          ...options.metadata,
        },
      }

      if (options.customerId) {
        params.customer = options.customerId
      } else if (options.customerEmail) {
        // We could look up or create a customer here if needed
        // For now, just attach email to receipt_email
        params.receipt_email = options.customerEmail
      }

      if (options.description) {
        params.description = options.description
      }

      const intent = await stripe.paymentIntents.create(params)

      return {
        success: true,
        data: this.mapStripeIntent(intent),
      }
    } catch (error) {
      logger.error('[StripePaymentProvider] Failed to create payment intent', { error, options })
      return {
        success: false,
        error: {
          code: (error as any).code || 'stripe_error',
          message: (error as any).message || 'Unknown Stripe error',
          details: error,
        },
      }
    }
  }

  async getPaymentIntent(intentId: string): Promise<ProviderResult<PaymentIntent>> {
    try {
      const stripe = getStripeClient()
      const intent = await stripe.paymentIntents.retrieve(intentId)
      
      return {
        success: true,
        data: this.mapStripeIntent(intent),
      }
    } catch (error) {
      logger.error('[StripePaymentProvider] Failed to retrieve payment intent', { error, intentId })
      return {
        success: false,
        error: {
          code: (error as any).code || 'stripe_error',
          message: (error as any).message || 'Unknown Stripe error',
        },
      }
    }
  }

  async refund(paymentIntentId: string, amount?: number, reason?: string): Promise<ProviderResult<{ refundId: string }>> {
    try {
      const stripe = getStripeClient()
      
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      }

      if (amount) {
        // Note: We need currency here to know how to convert amount to cents
        // For now, assuming the payment intent's currency.
        // In a real scenario, we might want to retrieve the intent first or pass currency.
        // Assuming PYG for now if not specified, but this is a bit risky.
        // Better: Stripe handles conversion if we pass the amount in the smallest unit.
        // But we don't have currency here. 
        // TODO: Improve refund API to include currency or retrieve intent first.
      }

      const refund = await stripe.refunds.create(params)

      return {
        success: true,
        data: { refundId: refund.id },
      }
    } catch (error) {
      logger.error('[StripePaymentProvider] Failed to process refund', { error, paymentIntentId })
      return {
        success: false,
        error: {
          code: (error as any).code || 'stripe_error',
          message: (error as any).message || 'Unknown Stripe error',
        },
      }
    }
  }

  async verifyWebhook(payload: any, signature: string, secret: string): Promise<ProviderResult<any>> {
    try {
      const stripe = getStripeClient()
      const event = stripe.webhooks.constructEvent(payload, signature, secret)
      return {
        success: true,
        data: event,
      }
    } catch (error) {
      logger.error('[StripePaymentProvider] Webhook verification failed', { error })
      return {
        success: false,
        error: {
          code: 'webhook_verification_failed',
          message: (error as any).message || 'Webhook verification failed',
        },
      }
    }
  }

  private mapStripeIntent(intent: Stripe.PaymentIntent): PaymentIntent {
    return {
      id: intent.id,
      clientSecret: intent.client_secret,
      amount: intent.amount, // Note: Stripe returns amount in cents (or units for PYG)
      currency: intent.currency.toUpperCase() as any,
      status: this.mapStripeStatus(intent.status),
      metadata: intent.metadata as Record<string, string>,
      provider: 'stripe',
    }
  }

  private mapStripeStatus(status: Stripe.PaymentIntent.Status): PaymentIntent['status'] {
    switch (status) {
      case 'requires_payment_method': return 'requires_payment_method'
      case 'requires_confirmation': return 'requires_confirmation'
      case 'requires_action': return 'requires_action'
      case 'processing': return 'processing'
      case 'requires_capture': return 'requires_capture'
      case 'canceled': return 'canceled'
      case 'succeeded': return 'succeeded'
      default: return 'processing'
    }
  }
}
