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
        invoice:invoices!payments_invoice_id_fkey(
          id,
          tenant_id,
          client_id,
          pet_id,
          invoice_number,
          appointment_id,
          medical_record_id,
          hospitalization_id,
          subtotal,
          discount_amount,
          discount_reason,
          tax_rate,
          tax_amount,
          total_amount,
          amount_paid,
          balance_due,
          status,
          due_date,
          paid_at,
          sent_at,
          voided_at,
          voided_by,
          notes,
          internal_notes,
          created_by,
          created_at,
          updated_at
        )
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
      query = query.eq('payment_method', paymentMethod)
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
      payment_method: PaymentMethod
      payment_reference?: string | null
      status: PaymentStatus
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
    status: PaymentStatus
  ): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .update({
        status,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar pago: ${error.message}`)
    }

    return data as Payment
  }

  /**
   * Process a refund for a payment
   */
  async refund(
    tenantId: string,
    paymentId: string,
    amount: number,
    reason: string
  ): Promise<Refund> {
    const { data, error } = await this.supabase
      .from('refunds')
      .insert({
        tenant_id: tenantId,
        payment_id: paymentId,
        amount,
        reason,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al procesar reembolso: ${error.message}`)
    }

    return data as Refund
  }
}