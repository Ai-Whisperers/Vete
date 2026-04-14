import { z } from 'zod'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'voided' | 'cancelled'

export interface Invoice {
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
  tax_rate: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  balance_due: number
  status: InvoiceStatus
  due_date: string | null
  paid_at: string | null
  sent_at: string | null
  voided_at: string | null
  voided_by: string | null
  notes: string | null
  internal_notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface InvoiceWithDetails extends Invoice {
  pet: {
    id: string
    name: string
    species: string
    breed: string
    photo_url: string | null
    owner: {
      id: string
      full_name: string
      email: string
      phone: string
    }
  }
  invoice_items: {
    id: string
    service_id: string | null
    product_id: string | null
    description: string
    quantity: number
    unit_price: number
    discount_amount: number
    total: number
    services: {
      id: string
      name: string
      category: string
    } | null
    products: {
      id: string
      name: string
      sku: string
    } | null
  }[]
  payments: {
    id: string
    amount: number
    payment_method_name: string
    reference_number: string
    payment_date: string
  }[]
  refunds: {
    id: string
    amount: number
    reason: string
    created_at: string
  }[]
  created_by_user: {
    full_name: string
  }
}

export interface CreateInvoiceInput {
  pet_id: string
  items: {
    service_id: string | null
    product_id: string | null
    description: string
    quantity: number
    unit_price: number
    discount_percent: number | null
  }[]
  tax_rate: number | null
  notes: string | null
  due_date: string | null
  idempotency_key: string | null
}

export interface UpdateInvoiceInput {
  status: InvoiceStatus
  notes: string | null
  internal_notes: string | null
}

export interface InvoiceListFilters {
  status: InvoiceStatus | null
  petId: string | null
  ownerId: string | null
  fromDate: string | null
  toDate: string | null
  page: number
  limit: number
}

export interface InvoiceListResult {
  invoices: InvoiceWithDetails[]
  count: number
  page: number
  limit: number
}

export const invoiceSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  client_id: z.string(),
  pet_id: z.string().nullish(),
  invoice_number: z.string(),
  appointment_id: z.string().nullish(),
  medical_record_id: z.string().nullish(),
  hospitalization_id: z.string().nullish(),
  subtotal: z.number(),
  discount_amount: z.number(),
  tax_rate: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  amount_paid: z.number(),
  balance_due: z.number(),
  status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'voided', 'cancelled']),
  due_date: z.string().nullish(),
  paid_at: z.string().nullish(),
  sent_at: z.string().nullish(),
  voided_at: z.string().nullish(),
  voided_by: z.string().nullish(),
  notes: z.string().nullish(),
  internal_notes: z.string().nullish(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullish(),
})

export const invoiceWithDetailsSchema = z.object({
  ...invoiceSchema.shape,
  pet: z.object({
    id: z.string(),
    name: z.string(),
    species: z.string(),
    breed: z.string(),
    photo_url: z.string().nullish(),
    owner: z.object({
      id: z.string(),
      full_name: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
  }),
  invoice_items: z.array(
    z.object({
      id: z.string(),
      service_id: z.string().nullish(),
      product_id: z.string().nullish(),
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
      discount_amount: z.number(),
      total: z.number(),
      services: z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
      }).nullish(),
      products: z.object({
        id: z.string(),
        name: z.string(),
        sku: z.string(),
      }).nullish(),
    })
  ),
  payments: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      payment_method_name: z.string(),
      reference_number: z.string(),
      payment_date: z.string(),
    })
  ),
  refunds: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
      reason: z.string(),
      created_at: z.string(),
    })
  ),
  created_by_user: z.object({
    full_name: z.string(),
  }),
})

export const createInvoiceInputSchema = z.object({
  pet_id: z.string(),
  items: z.array(
    z.object({
      service_id: z.string().nullish(),
      product_id: z.string().nullish(),
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
      discount_percent: z.number().nullish(),
    })
  ),
  tax_rate: z.number().nullish(),
  notes: z.string().nullish(),
  due_date: z.string().nullish(),
  idempotency_key: z.string().nullish(),
})

export const updateInvoiceInputSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'voided', 'cancelled']),
  notes: z.string().nullish(),
  internal_notes: z.string().nullish(),
})