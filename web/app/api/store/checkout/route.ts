import { NextRequest } from 'next/server'
import { CartService } from '@/domain/cart/service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const cartService = new CartService(supabase)

  const { items, tenantId } = await request.json()

  const cart = await cartService.createCart({ items, tenantId }, 'user-123')

  return new Response(JSON.stringify(cart), { status: 201 })
}