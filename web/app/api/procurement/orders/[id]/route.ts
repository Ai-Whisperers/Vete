import { NextRequest } from 'next/server'
import { withApiAuth } from '@/lib/auth'
import { ProcurementService } from '@/lib/domain/core/procurement/service'
import { createClient } from '@/lib/supabase/server'

export const GET = withApiAuth(async (request: NextRequest) => {
  const supabase = createClient()
  const procurementService = new ProcurementService(supabase)

  const id = request.nextUrl.pathname.split('/').pop()

  const purchaseOrder = await procurementService.getPurchaseOrder(id)

  return new Response(JSON.stringify(purchaseOrder), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})

export const PATCH = withApiAuth(async (request: NextRequest) => {
  const supabase = createClient()
  const procurementService = new ProcurementService(supabase)

  const id = request.nextUrl.pathname.split('/').pop()

  const data = await request.json()

  const purchaseOrder = await procurementService.updatePurchaseOrderStatus(id, data)

  return new Response(JSON.stringify(purchaseOrder), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})