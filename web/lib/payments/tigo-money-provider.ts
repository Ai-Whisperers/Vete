import { AbstractPaymentProvider } from './abstract-provider'
import type { 
  PaymentIntent, 
  CreatePaymentIntentOptions, 
  ProviderResult,
  PaymentError,
  WebhookEvent,
  Currency
} from './types'
import crypto from 'crypto'

interface TigoMoneyConfig {
  apiKey: string
  apiSecret: string
  environment: 'sandbox' | 'production'
}

interface TigoMoneyPaymentResponse {
  status: string
  transaction_id?: string
  qr_code?: string
  qr_code_expires_at?: string
  payment_url?: string
  response_code?: string
  response_details?: string
}

interface TigoMoneyStatusResponse {
  status: string
  transaction_id: string
  amount: number
  currency: string
  paid_at?: string
  response_code?: string
  response_details?: string
}

interface TigoMoneyRefundResponse {
  status: string
  refund_id?: string
  response_code?: string
  response_details?: string
}

export class TigoMoneyPaymentProvider extends AbstractPaymentProvider {
  readonly name = 'tigo_money'
  
  private config: TigoMoneyConfig

  constructor(config: TigoMoneyConfig) {
    super()
    this.config = config
  }

  protected async doCreatePaymentIntent(options: CreatePaymentIntentOptions): Promise<PaymentIntent> {
    const endpoint = this.getEndpoint('generate_qr')
    
    const payload = {
      api_key: this.config.apiKey,
      transaction: {
        external_id: this.generateExternalId(),
        amount: options.amount,
        currency: options.currency,
        description: options.description || `Pago Vete - Factura ${options.invoiceId}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payments/tigo_money`,
        expires_in: 3600,
        metadata: {
          invoice_id: options.invoiceId,
          tenant_id: options.tenantId,
          customer_email: options.customerEmail,
          ...options.metadata,
        },
      },
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.generateApiToken()}`,
        },
        body: JSON.stringify(payload),
      })

      const result: TigoMoneyPaymentResponse = await response.json()

      if (result.status !== 'success' && result.response_code !== '00') {
        throw new Error(`Tigo Money QR generation failed: ${result.response_details || 'Unknown error'}`)
      }

      return {
        id: result.transaction_id || '',
        clientSecret: result.qr_code || null,
        amount: options.amount,
        currency: options.currency,
        status: 'requires_payment_method',
        metadata: {
          ...options.metadata,
          qr_code: result.qr_code || '',
          qr_code_expires_at: result.qr_code_expires_at || '',
          payment_url: result.payment_url || '',
        },
        provider: 'tigo_money',
      }
    } catch (error) {
      throw new Error(`Tigo Money API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  protected async doGetPaymentIntent(intentId: string): Promise<PaymentIntent> {
    const endpoint = this.getEndpoint('check_status')
    
    const payload = {
      api_key: this.config.apiKey,
      transaction_id: intentId,
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.generateApiToken()}`,
        },
        body: JSON.stringify(payload),
      })

      const result: TigoMoneyStatusResponse = await response.json()

      if (result.status !== 'success' && result.response_code !== '00') {
        throw new Error(`Tigo Money status check failed: ${result.response_details || 'Unknown error'}`)
      }

      let status: PaymentIntent['status'] = 'requires_payment_method'
      if (result.paid_at) {
        status = 'succeeded'
      } else if (result.response_code === '01') {
        status = 'requires_action'
      }

      return {
        id: intentId,
        clientSecret: null,
        amount: result.amount,
        currency: result.currency as Currency,
        status,
        metadata: {
          paid_at: result.paid_at || '',
          response_code: result.response_code || '',
        },
      }
    } catch (error) {
      throw new Error(`Tigo Money API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private generateApiToken(): string {
    // Implement API token generation logic here
    // For example, using the API key and secret
    return crypto.createHmac('sha256', this.config.apiSecret).update(this.config.apiKey).digest('hex')
  }

  private getEndpoint(endpoint: string): string {
    // Implement endpoint URL construction logic here
    // For example, using the environment and API key
    return `https://api.tigo.money/${endpoint}`
  }
}