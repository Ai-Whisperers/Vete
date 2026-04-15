import { NextRequest } from 'next/server'
import { withApiAuth } from '@/lib/auth'
import { ProcurementService } from '@/lib/domain/core/procurement/service'
import { createClient } from '@/lib/supabase/server'

export const POST = withApiAuth(async (request: NextRequest) => {
  const supabase = createClient()
  const procurementService = new ProcurementService(supabase)

  const id = request.nextUrl.pathname.split('/').pop()

  const data = await request.json()

  const purchaseOrderItem = await procurementService.receivePurchaseOrderItem(data)

  return new Response(JSON.stringify(purchaseOrderItem), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
})