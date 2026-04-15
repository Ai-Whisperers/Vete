import { NextRequest } from 'next/server'
import { withApiAuth } from '@/lib/auth'
import { ProcurementService } from '@/lib/domain/core/procurement/service'
import { createClient } from '@/lib/supabase/server'

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = createClient()
  const procurementService = new ProcurementService(supabase)

  const purchaseOrders = await procurementService.getPurchaseOrders()

  return new Response(JSON.stringify(purchaseOrders), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = createClient()
  const procurementService = new ProcurementService(supabase)

  const data = await request.json()

  const purchaseOrder = await procurementService.createPurchaseOrder(data)

  return new Response(JSON.stringify(purchaseOrder), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})