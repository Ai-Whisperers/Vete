import { useServer } from 'next/server'
import { PaymentService } from '../../../lib/domain/core/payments/service'
import { createClient } from '../../../lib/supabase/client'

export async function GET() {
  const supabase = createClient()
  const paymentService = new PaymentService(supabase)

  const payments = await paymentService.list('tenant-id')

  return new Response(JSON.stringify(payments), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST() {
  const supabase = createClient()
  const paymentService = new PaymentService(supabase)

  const input = await useServer().request.json()

  const payment = await paymentService.recordPayment('tenant-id', 'user-id', input)

  return new Response(JSON.stringify(payment), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
Note: The above code is a basic implementation of the payment feature. You may need to modify it to fit your specific requirements. Additionally, you will need to create the necessary database tables and relationships in your Supabase instance.