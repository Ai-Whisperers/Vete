/**
 * Mock Payment Provider
 * 
 * Implementation of PaymentProvider for testing and development.
 */

import type { 
  PaymentProvider, 
  PaymentIntent, 
  CreatePaymentIntentOptions, 
  ProviderResult 
} from './types'
import { logger } from '@/lib/logger'

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock'

  async createPaymentIntent(options: CreatePaymentIntentOptions): Promise<ProviderResult<PaymentIntent>> {
    logger.info('[MockPaymentProvider] Creating payment intent', options)
    
    const intent: PaymentIntent = {
      id: `mock_pi_${Math.random().toString(36).slice(2)}`,
      clientSecret: `mock_secret_${Math.random().toString(36).slice(2)}`,
      amount: options.amount,
      currency: options.currency,
      status: 'requires_payment_method',
      metadata: options.metadata,
      provider: 'mock',
    }

    return {
      success: true,
      data: intent,
    }
  }

  async getPaymentIntent(intentId: string): Promise<ProviderResult<PaymentIntent>> {
    logger.info('[MockPaymentProvider] Retrieving payment intent', { intentId })
    
    return {
      success: true,
      data: {
        id: intentId,
        clientSecret: 'mock_secret_static',
        amount: 1000,
        currency: 'PYG',
        status: 'succeeded',
        provider: 'mock',
      },
    }
  }

  async refund(paymentIntentId: string, amount?: number, reason?: string): Promise<ProviderResult<{ refundId: string }>> {
    logger.info('[MockPaymentProvider] Processing refund', { paymentIntentId, amount, reason })
    
    return {
      success: true,
      data: { refundId: `mock_re_${Math.random().toString(36).slice(2)}` },
    }
  }

  async verifyWebhook(payload: any, signature: string, secret: string): Promise<ProviderResult<any>> {
    return {
      success: true,
      data: payload,
    }
  }
}
