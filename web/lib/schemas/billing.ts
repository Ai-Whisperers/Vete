/**
 * Billing validation schemas
 */

import { z } from 'zod'

// Platform invoice status
export const platformInvoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'paid',
  'overdue',
  'void',
  'waived',
])

// Platform invoice query schema
export const platformInvoiceQuerySchema = z.object({
  clinic: z.string().uuid().optional(),
  status: platformInvoiceStatusSchema.optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Payment method schema
export const paymentMethodSchema = z.enum([
  'credit_card',
  'debit_card',
  'bank_transfer',
  'cash',
  'check',
  'mobile_payment',
  'other',
])

// Create platform invoice schema
export const createPlatformInvoiceSchema = z.object({
  tenant_id: z.string().uuid(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  subscription_amount: z.coerce.number().min(0),
  store_commission_amount: z.coerce.number().min(0),
  service_commission_amount: z.coerce.number().min(0),
  tax_rate: z.coerce.number().min(0).max(100).default(10),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  grace_period_days: z.coerce.number().int().min(0).max(30).default(7),
})

// Update platform invoice schema
export const updatePlatformInvoiceSchema = z.object({
  status: platformInvoiceStatusSchema.optional(),
  paid_at: z.string().datetime().optional(),
  payment_method: paymentMethodSchema.optional(),
  reminder_count: z.coerce.number().int().min(0).optional(),
  last_reminder_at: z.string().datetime().optional(),
})

// Send reminder schema
export const sendReminderSchema = z.object({
  invoice_ids: z.array(z.string().uuid()).min(1),
  reminder_type: z.enum(['email', 'whatsapp', 'sms']).default('email'),
  custom_message: z.string().max(500).optional(),
})

// Pay invoice schema
export const payInvoiceSchema = z.object({
  invoice_id: z.string().uuid(),
  payment_method_id: z.string().uuid().optional(),
})

// Billing overview query schema
export const billingOverviewQuerySchema = z.object({
  clinic: z.string().uuid().optional(),
})

// Export types
export type PlatformInvoiceStatus = z.infer<typeof platformInvoiceStatusSchema>
export type PlatformInvoiceQueryInput = z.infer<typeof platformInvoiceQuerySchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type CreatePlatformInvoiceInput = z.infer<typeof createPlatformInvoiceSchema>
export type UpdatePlatformInvoiceInput = z.infer<typeof updatePlatformInvoiceSchema>
export type SendReminderInput = z.infer<typeof sendReminderSchema>
export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>
export type BillingOverviewQueryInput = z.infer<typeof billingOverviewQuerySchema>