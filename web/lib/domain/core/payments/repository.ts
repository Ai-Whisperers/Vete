/**
 * Payment Repository
 *
 * Data access layer for payment operations.
 * Handles CRUD operations without business logic.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Payment,
  PaymentWithDetails,
  Refund,
  PaymentListFilters,
  PaymentListResult,
} from './types'

export class PaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Find payment by ID
   */
  async findById(
    id: string,
    tenantId: string
  ): Promise<PaymentWithDetails | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        receiver:profiles!payments_received_by_fkey(full_name)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) return null
    return data as PaymentWithDetails
  }

  /**
   * List payments for an invoice
   */
  async findByInvoiceId(
    invoiceId: string,
    tenantId: string
  ): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new Error(`Error al cargar pagos: ${error.message}`)
    }

    return (data || []) as Payment[]
  }

  /**
   * List payments with filters and pagination
   */
  async findMany(
    tenantId: string,
    filters: PaymentListFilters = {}
  ): Promise<PaymentListResult> {
    const {
      invoiceId,
      status,
      paymentMethod,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
    } = filters
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (paymentMethod) {
      query = query.eq('payment_method_name', paymentMethod)
    }
    if (fromDate) {
      query = query.gte('payment_date', fromDate)
    }
    if (toDate) {
      query = query.lte('payment_date', toDate)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error al cargar pagos: ${error.message}`)
    }

    return {
      payments: (data || []) as Payment[],
      count: count || 0,
      page,
      limit,
    }
  }

  /**
   * Create a payment record
   */
  async create(
    tenantId: string,
    data: {
      invoice_id: string
      amount: number
      payment_method_name: string
      payment_reference?: string | null
      status: string
      payment_date: string
      received_by: string
      notes?: string | null
    }
  ): Promise<Payment> {
    const { data: payment, error } = await this.supabase
      .from('payments')
      .insert({
        tenant_id: tenantId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear pago: ${error.message}`)
    }

    return payment as Payment
  }

  /**
   * Update payment status
   */
  async updateStatus(
    id: string,
    tenantId: string,
    status: string
  ): Promise<Payment> {
    const { data: payment, error } = await this.supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar pago: ${error.message}`)
    }

    return payment as Payment
  }

  /**
   * Find refund by ID
   */
  async findRefundById(
    id: string,
    tenantId: string
  ): Promise<Refund | null> {
    const { data, error } = await this.supabase
      .from('refunds')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) return null
    return data as Refund
  }

  /**
   * List refunds for an invoice
   */
  async findRefundsByInvoiceId(
    invoiceId: string,
    tenantId: string
  ): Promise<Refund[]> {
    const { data: payments, error: paymentsError } = await this.supabase
      .from('payments')
      .select('id')
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenantId)

    if (paymentsError) {
      throw new Error(`Error al cargar reembolsos: ${paymentsError.message}`)
    }

    if (!payments || payments.length === 0) {
      return []
    }

    const paymentIds = payments.map((p) => p.id)

    const { data, error } = await this.supabase
      .from('refunds')
      .select('*')
      .in('payment_id', paymentIds)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al cargar reembolsos: ${error.message}`)
    }

    return (data || []) as Refund[]
  }

  /**
   * Create a refund record
   */
  async createRefund(
    tenantId: string,
    data: {
      payment_id: string
      amount: number
      reason: string
      status: string
      processed_by: string
      notes?: string | null
    }
  ): Promise<Refund> {
    const { data: refund, error } = await this.supabase
      .from('refunds')
      .insert({
        tenant_id: tenantId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear reembolso: ${error.message}`)
    }

    return refund as Refund
  }

  /**
   * Get payment totals for a period
   */
  async getPaymentTotals(
    tenantId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<{ total_paid: number; payment_count: number }> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('payment_date', periodStart)
      .lte('payment_date', periodEnd)

    if (error) {
      throw new Error(`Error al calcular totales: ${error.message}`)
    }

    const payments = data || []
    return {
      total_paid: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      payment_count: payments.length,
    }
  }

  /**
   * Get refund totals for a period
   */
  async getRefundTotals(
    tenantId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<{ total_refunded: number; refund_count: number }> {
    const { data, error } = await this.supabase
      .from('refunds')
      .select('amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd)

    if (error) {
      throw new Error(`Error al calcular reembolsos: ${error.message}`)
    }

    const refunds = data || []
    return {
      total_refunded: refunds.reduce((sum, r) => sum + Number(r.amount), 0),
      refund_count: refunds.length,
    }
  }
}
