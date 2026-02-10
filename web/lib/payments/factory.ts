/**
 * Payment Provider Factory
 * 
 * Handles the creation and resolution of payment providers.
 */

import { StripePaymentProvider } from './stripe-provider'
import { MockPaymentProvider } from './mock-provider'
import type { PaymentProvider, PaymentProviderFactory } from './types'
import { logger } from '@/lib/logger'

export class DefaultPaymentProviderFactory implements PaymentProviderFactory {
  /**
   * Resolve a provider by name
   */
  getProvider(name?: string): PaymentProvider {
    const providerName = name || process.env.PAYMENT_PROVIDER || 'mock'

    switch (providerName.toLowerCase()) {
      case 'stripe':
        return new StripePaymentProvider()
      case 'mock':
        return new MockPaymentProvider()
      default:
        logger.warn(`[PaymentProviderFactory] Unknown provider "${providerName}", falling back to mock`, {
          requested: providerName,
          env: process.env.NODE_ENV
        })
        return new MockPaymentProvider()
    }
  }
}

// Global factory instance
export const paymentProviderFactory = new DefaultPaymentProviderFactory()
