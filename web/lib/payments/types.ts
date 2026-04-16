export interface PaymentIntent {
  id: string
  clientSecret: string | null
  amount: number
  currency: string
  status: string
  metadata: Record<string, unknown>
  provider: string
}

export interface CreatePaymentIntentOptions {
  amount: number
  currency: string
  description?: string
  invoiceId: string
  tenantId: string
  customerEmail: string
  metadata?: Record<string, unknown>
}

export interface ProviderResult {
  success: boolean
  message: string
}

export interface PaymentError {
  message: string
  code: string
}

export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, unknown>
}

export type Currency = 'PYG' | 'USD' | 'EUR'