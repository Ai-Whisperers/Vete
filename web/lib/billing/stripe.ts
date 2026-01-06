/**
 * Stripe Client Wrapper
 *
 * Provides typed Stripe client for server-side operations.
 * All Stripe API calls should go through this module.
 *
 * Environment variables required:
 * - STRIPE_SECRET_KEY: Stripe secret key
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Stripe publishable key (for frontend)
 *
 * @see https://stripe.com/docs/api
 */

import Stripe from 'stripe'

// Stripe API version - must match installed stripe package types
const STRIPE_API_VERSION = '2025-12-15.clover'

// Initialize Stripe client (lazy initialization)
let stripeClient: Stripe | null = null

/**
 * Get Stripe client instance
 * Uses lazy initialization to avoid issues during build time
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    })
  }

  return stripeClient
}

/**
 * Get Stripe publishable key for frontend
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is not set')
  }
  return key
}

// =============================================================================
// CUSTOMER OPERATIONS
// =============================================================================

/**
 * Create or get existing Stripe customer for a tenant
 */
export async function getOrCreateCustomer(
  tenantId: string,
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  const stripe = getStripeClient()

  // Search for existing customer by tenant ID in metadata
  const existingCustomers = await stripe.customers.search({
    query: `metadata['tenant_id']:'${tenantId}'`,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      tenant_id: tenantId,
      ...metadata,
    },
  })

  return customer
}

/**
 * Update Stripe customer details
 */
export async function updateCustomer(
  customerId: string,
  data: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  const stripe = getStripeClient()
  return stripe.customers.update(customerId, data)
}

// =============================================================================
// SETUP INTENT (for saving payment methods)
// =============================================================================

/**
 * Create a SetupIntent for adding a payment method
 * Used when customer wants to save a card without immediate payment
 */
export async function createSetupIntent(
  customerId: string,
  metadata?: Record<string, string>
): Promise<Stripe.SetupIntent> {
  const stripe = getStripeClient()

  return stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    metadata: {
      ...metadata,
    },
  })
}

/**
 * Retrieve a SetupIntent by ID
 */
export async function getSetupIntent(setupIntentId: string): Promise<Stripe.SetupIntent> {
  const stripe = getStripeClient()
  return stripe.setupIntents.retrieve(setupIntentId)
}

// =============================================================================
// PAYMENT METHOD OPERATIONS
// =============================================================================

/**
 * List payment methods for a customer
 */
export async function listPaymentMethods(
  customerId: string,
  type: Stripe.PaymentMethodListParams.Type = 'card'
): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripeClient()

  const methods = await stripe.paymentMethods.list({
    customer: customerId,
    type,
  })

  return methods.data
}

/**
 * Get a single payment method
 */
export async function getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient()
  return stripe.paymentMethods.retrieve(paymentMethodId)
}

/**
 * Detach a payment method from customer
 */
export async function detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient()
  return stripe.paymentMethods.detach(paymentMethodId)
}

/**
 * Set default payment method for customer
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  const stripe = getStripeClient()

  return stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })
}

// =============================================================================
// PAYMENT INTENT (for one-time payments)
// =============================================================================

/**
 * Create a PaymentIntent for charging a customer
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  customerId: string,
  paymentMethodId?: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient()

  const params: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: currency.toLowerCase(),
    customer: customerId,
    metadata: {
      ...metadata,
    },
  }

  // If payment method specified, attach it and confirm immediately
  if (paymentMethodId) {
    params.payment_method = paymentMethodId
    params.confirm = true
    params.off_session = true
  }

  return stripe.paymentIntents.create(params)
}

/**
 * Confirm a PaymentIntent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient()

  const params: Stripe.PaymentIntentConfirmParams = {}
  if (paymentMethodId) {
    params.payment_method = paymentMethodId
  }

  return stripe.paymentIntents.confirm(paymentIntentId, params)
}

/**
 * Retrieve a PaymentIntent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient()
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

// =============================================================================
// REFUNDS
// =============================================================================

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  const stripe = getStripeClient()

  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  }

  if (amount) {
    params.amount = amount
  }

  if (reason) {
    params.reason = reason
  }

  return stripe.refunds.create(params)
}

// =============================================================================
// WEBHOOK UTILITIES
// =============================================================================

/**
 * Construct and verify Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient()
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convert amount to Stripe's smallest currency unit
 * For PYG (Paraguayan Guarani), no conversion needed as it has no decimal places
 */
export function toStripeAmount(amount: number, currency: string): number {
  // PYG has no decimal places
  if (currency.toUpperCase() === 'PYG') {
    return Math.round(amount)
  }

  // For currencies with 2 decimal places (USD, EUR, etc.)
  return Math.round(amount * 100)
}

/**
 * Convert Stripe amount back to regular amount
 */
export function fromStripeAmount(amount: number, currency: string): number {
  if (currency.toUpperCase() === 'PYG') {
    return amount
  }
  return amount / 100
}

/**
 * Format card brand for display
 */
export function formatCardBrand(brand: string): string {
  const brands: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
  }
  return brands[brand.toLowerCase()] || brand
}

/**
 * Get display name for a payment method
 */
export function getPaymentMethodDisplayName(method: Stripe.PaymentMethod): string {
  if (method.type === 'card' && method.card) {
    return `${formatCardBrand(method.card.brand)} ···· ${method.card.last4}`
  }
  return method.type
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  Stripe,
}

export type StripeCustomer = Stripe.Customer
export type StripePaymentMethod = Stripe.PaymentMethod
export type StripePaymentIntent = Stripe.PaymentIntent
export type StripeSetupIntent = Stripe.SetupIntent
export type StripeEvent = Stripe.Event
export type StripeRefund = Stripe.Refund
