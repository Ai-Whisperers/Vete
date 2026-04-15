import { z } from 'zod'

export const PaymentStatus = z.enum(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
export type PaymentStatus = z.infer<typeof PaymentStatus>

export const PaymentMethod = z.enum(['cash', 'card', 'transfer', 'check', 'credit', 'other'])
export type PaymentMethod = z.infer<typeof PaymentMethod>

export interface Payment {
  id: string
  tenant_id: string
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  payment_reference: string | null
  status: PaymentStatus
  payment_date: string
  received_by: string
  notes: string | null
}

export interface PaymentWithDetails {
  id: string
  tenant_id: string
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  payment_reference: string | null
  status: PaymentStatus
  payment_date: string
  received_by: string
  notes: string | null
  invoice: {
    id: string
    tenant_id: string
    client_id: string
    pet_id: string | null
    invoice_number: string
    appointment_id: string | null
    medical_record_id: string | null
    hospitalization_id: string | null
    subtotal: number
    discount_amount: number
    discount_reason: string | null
    tax_rate: number
    tax_amount: number
    total_amount: number
    amount_paid: number
    balance_due: number
    status: string
    due_date: string
    paid_at: string | null
    sent_at: string | null
    voided_at: string | null
    voided_by: string | null
    notes: string | null
    internal_notes: string | null
    created_by: string
    created_at: string
    updated_at: string
  }
}

export interface Refund {
  id: string
  tenant_id: string
  payment_id: string
  invoice_id: string
  amount: number
  reason: string
  refund_method: PaymentMethod
  refund_reference: string | null
  status: PaymentStatus
  refunded_at: string
  processed_by: string
  notes: string | null
}

export interface PaymentListFilters {
  invoiceId?: string
  status?: PaymentStatus
  paymentMethod?: PaymentMethod
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface PaymentListResult {
  payments: Payment[]
  count: number
  page: number
  limit: number
}

export interface RecordPaymentInput {
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  payment_reference?: string | null
  notes?: string | null
  paid_at?: string
}

export interface PaymentSummary {
  total_collected: number
  total_refunded: number
  net_revenue: number
  payment_count: number
  refund_count: number
  period_start: string
  period_end: string
}