/**
 * Payment Service
 * 
 * Orchestrates payment operations across different providers and 
 * manages the integration with the application's database.
 */

import { logger } from '@/lib/logger'
import { StripePaymentProvider } from './stripe-provider'
import { MockPaymentProvider } from './mock-provider'
import type { 
  PaymentProvider, 
  PaymentIntent, 
  CreatePaymentIntentOptions, 
  ProviderResult 
} from './types'

export class PaymentService {
  private provider: PaymentProvider

  constructor(providerName?: string) {
    this.provider = this.createProvider(providerName || process.env.PAYMENT_PROVIDER)
  }

  private createProvider(name?: string): PaymentProvider {
    switch (name) {
      case 'stripe':
        return new StripePaymentProvider()
      case 'mock':
        return new MockPaymentProvider()
      default:
        if (process.env.NODE_ENV === 'production' && !name) {
          logger.error('No payment provider configured in production!')
        }
        return new MockPaymentProvider()
    }
  }

  /**
   * Get the current provider name
   */
  get providerName(): string {
    return this.provider.name
  }

  /**
   * Initialize a payment transaction
   */
  async createPaymentIntent(options: CreatePaymentIntentOptions): Promise<ProviderResult<PaymentIntent>> {
    const startTime = Date.now()
    
    try {
      const result = await this.provider.createPaymentIntent(options)
      
      const duration = Date.now() - startTime
      logger.info('[PaymentService] Created payment intent', {
        provider: this.provider.name,
        success: result.success,
        duration,
        invoiceId: options.invoiceId,
        amount: options.amount,
        currency: options.currency,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('[PaymentService] Failed to create payment intent', {
        provider: this.provider.name,
        duration,
        invoiceId: options.invoiceId,
        error,
      })

      return {
        success: false,
        error: {
          code: 'service_error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(intentId: string): Promise<ProviderResult<PaymentIntent>> {
    return this.provider.getPaymentIntent(intentId)
  }

  /**
   * Process a refund
   */
  async refund(paymentIntentId: string, amount?: number, reason?: string): Promise<ProviderResult<{ refundId: string }>> {
    return this.provider.refund(paymentIntentId, amount, reason)
  }

  /**
   * Verify a webhook
   */
  async verifyWebhook(payload: any, signature: string, secret: string): Promise<ProviderResult<any>> {
    return this.provider.verifyWebhook(payload, signature, secret)
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let paymentService: PaymentService | null = null

export function getPaymentService(): PaymentService {
  if (!paymentService) {
    paymentService = new PaymentService()
  }
  return paymentService
}
