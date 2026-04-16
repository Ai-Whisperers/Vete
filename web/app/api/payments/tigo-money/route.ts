import { NextRequest } from 'next/server'
import { TigoMoneyPaymentProvider } from '@/lib/payments/tigo-money-provider'

const tigoMoneyProvider = new TigoMoneyPaymentProvider({
  apiKey: process.env.TIGO_MONEY_API_KEY,
  apiSecret: process.env.TIGO_MONEY_API_SECRET,
  environment: 'production',
})

export async function POST(request: NextRequest) {
  const { invoiceId, amount, currency, customerEmail, tenantId } = await request.json()

  try {
    const paymentIntent = await tigoMoneyProvider.createPaymentIntent({
      amount,
      currency,
      invoiceId,
      customerEmail,
      tenantId,
    })

    return new Response(JSON.stringify(paymentIntent), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create payment intent' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}