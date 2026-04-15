import type { SupabaseClient } from '@supabase/supabase-js'
import { PaymentRepository } from './repository'
import type {
  Payment,
  Refund,
  RecordPaymentInput,
  PaymentListFilters,
  PaymentListResult,
  PaymentSummary,
} from './types'
import { roundCurrency } from '@/lib/types/invoicing'
import { logAudit } from '@/lib/audit'
import { logger } from '@/lib/logger'

export class PaymentService {
  private repository: PaymentRepository

  constructor(private supabase: SupabaseClient) {
    this.repository = new PaymentRepository(supabase)
  }

  /**
   * List payments for an invoice
   */
  async getPaymentsByInvoice(
    invoiceId: string,
    tenantId: string
  ): Promise<Payment[]> {
    return this.repository.findByInvoiceId(invoiceId, tenantId)
  }

  /**
   * List payments with filters
   */
  async list(
    tenantId: string,
    filters: PaymentListFilters = {}
  ): Promise<PaymentListResult> {
    return this.repository.findMany(tenantId, filters)
  }

  /**
   * Record a payment for an invoice
   */
  async recordPayment(
    tenantId: string,
    userId: string,
    input: RecordPaymentInput
  ): Promise<Payment> {
    // Validate required fields
    if (!input.invoice_id) {
      throw new Error('Se requiere factura')
    }
    if (!input.amount || input.amount <= 0) {
      throw new Error('El monto del pago debe ser mayor a cero')
    }
    if (!input.payment_method) {
      throw new Error('Se requiere método de pago')
    }

    // Get invoice to validate
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .select('id, tenant_id, total, amount_paid, balance_due, status')
      .eq('id', input.invoice_id)
      .eq('tenant_id', tenantId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Factura no encontrada')
    }

    if (input.amount > invoice.balance_due) {
      throw new Error('El monto del pago excede el saldo pendiente')
    }

    const payment = await this.repository.create(tenantId, {
      invoice_id: input.invoice_id,
      amount: input.amount,
      payment_method: input.payment_method,
      payment_reference: input.payment_reference || null,
      status: 'completed',
      payment_date: input.payment_date || new Date().toISOString(),
      received_by: userId,
      notes: input.notes || null,
    })

    // Update invoice amounts
    const newAmountPaid = roundCurrency(invoice.amount_paid + input.amount)
    const newBalanceDue = roundCurrency(invoice.total - newAmountPaid)
    const isPaid = newBalanceDue === 0

    await this.supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: isPaid ? 'paid' : invoice.status,
        paid_at: isPaid ? new Date().toISOString() : null,
      })
      .eq('id', input.invoice_id)

    await logAudit('RECORD_PAYMENT', `payments/${payment.id}`, {
      invoice_id: input.invoice_id,
      amount: input.amount,
      payment_method: input.payment_method,
    })

    logger.info('[PaymentService] Payment recorded', {
      paymentId: payment.id,
      invoiceId: input.invoice_id,
      amount: input.amount,
    })

    return payment
  }

  /**
   * Process a refund for a payment
   */
  async refundPayment(
    tenantId: string,
    userId: string,
    paymentId: string,
    amount: number,
    reason: string
  ): Promise<Refund> {
    // Validate amount
    if (amount <= 0) {
      throw new Error('El monto del reembolso debe ser mayor a cero')
    }

    if (!reason || reason.trim() === '') {
      throw new Error('Se requiere motivo del reembolso')
    }

    // Get payment
    const { data: payment, error: paymentError } = await this.supabase
      .from('payments')
      .select('id, tenant_id, invoice_id, amount, payment_method')
      .eq('id', paymentId)
      .eq('tenant_id', tenantId)
      .single()

    if (paymentError || !payment) {
      throw new Error('Pago no encontrado')
    }

    const refund = await this.repository.refund(tenantId, paymentId, amount, reason)

    await logAudit('REFUND_PAYMENT', `refunds/${refund.id}`, {
      payment_id: paymentId,
      amount,
      reason,
    })

    logger.info('[PaymentService] Refund processed', {
      refundId: refund.id,
      paymentId: paymentId,
      amount,
    })

    return refund
  }

  /**
   * Get payment summary for a period
   */
  async getPaymentSummary(
    tenantId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<PaymentSummary> {
    const [paymentTotals, refundTotals] = await Promise.all([
      this.repository.getPaymentTotals(tenantId, periodStart, periodEnd),
      this.repository.getRefundTotals(tenantId, periodStart, periodEnd),
    ])

    return {
      total_collected: roundCurrency(paymentTotals.total_paid),
      total_refunded: roundCurrency(refundTotals.total_refunded),
      net_revenue: roundCurrency(paymentTotals.total_paid - refundTotals.total_refunded),
      payment_count: paymentTotals.payment_count,
      refund_count: refundTotals.refund_count,
      period_start: periodStart,
      period_end: periodEnd,
    }
  }
}