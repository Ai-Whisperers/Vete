import { NextRequest } from 'next/server'
import { TigoMoneyPaymentProvider } from '@/lib/payments/tigo-money-provider'

const tigoMoneyProvider = new TigoMoneyPaymentProvider({
  apiKey: process.env.TIGO_MONEY_API_KEY,
  apiSecret: process.env.TIGO_MONEY_API_SECRET,
  environment: 'production',
})

export async function POST(request: NextRequest) {
  const { transactionId } = await request.json()

  try {
    const paymentIntent = await tigoMoneyProvider.getPaymentIntent(transactionId)

    // Handle payment intent status update
    if (paymentIntent.status === 'succeeded') {
      // Update invoice status to paid
    } else if (paymentIntent.status === 'requires_action') {
      // Handle requires action status
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to handle webhook event' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}