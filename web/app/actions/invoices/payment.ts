'use server'

import { withActionAuth, actionSuccess, actionError } from '@/lib/actions'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import type { RecordPaymentData } from '@/lib/types/invoicing'

/**
 * Record a payment for an invoice
 * Staff only
 *
 * @param paymentData - Payment data including invoice_id
 */
export const recordPayment = withActionAuth(
  async ({ profile, supabase, user }, paymentData: RecordPaymentData) => {
    const invoiceId = paymentData.invoice_id

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status, total, amount_paid, amount_due, tenant_id')
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (invoiceError || !invoice) {
      return actionError('Factura no encontrada')
    }

    // Validate status
    if (invoice.status === 'void' || invoice.status === 'cancelled') {
      return actionError('No se puede registrar pago en una factura anulada o cancelada')
    }

    if (invoice.status === 'paid') {
      return actionError('Esta factura ya está completamente pagada')
    }

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      return actionError('El monto debe ser mayor a 0')
    }

    if (paymentData.amount > invoice.amount_due) {
      return actionError(
        `El monto (${paymentData.amount.toLocaleString()}) excede el saldo pendiente (${invoice.amount_due.toLocaleString()})`
      )
    }

    try {
      // Create payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        tenant_id: profile.tenant_id,
        invoice_id: invoiceId,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
        notes: paymentData.notes,
        received_by: user.id,
        paid_at: new Date().toISOString(),
      })

      if (paymentError) {
        logger.error('Create payment error', {
          tenantId: profile.tenant_id,
          invoiceId,
          error: paymentError instanceof Error ? paymentError.message : String(paymentError),
        })
        return actionError('Error al registrar el pago')
      }

      // Update invoice totals with proper rounding
      const { roundCurrency } = await import('@/lib/types/invoicing')
      const newAmountPaid = roundCurrency(invoice.amount_paid + paymentData.amount)
      const newAmountDue = roundCurrency(invoice.total - newAmountPaid)
      const newStatus = newAmountDue <= 0 ? 'paid' : 'partial'

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          amount_due: newAmountDue,
          status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', invoiceId)

      if (updateError) {
        logger.error('Update invoice after payment error', {
          tenantId: profile.tenant_id,
          invoiceId,
          error: updateError instanceof Error ? updateError.message : String(updateError),
        })
        return actionError('Error al actualizar la factura')
      }

      revalidatePath('/[clinic]/dashboard/invoices')
      revalidatePath(`/[clinic]/dashboard/invoices/${invoiceId}`)

      return actionSuccess()
    } catch (e) {
      logger.error('Record payment exception', {
        tenantId: profile.tenant_id,
        invoiceId,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return actionError('Error inesperado al registrar pago')
    }
  },
  { requireStaff: true }
)
