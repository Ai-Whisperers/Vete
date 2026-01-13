import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// BUG-013: API endpoint for customers to cancel pending orders

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get user's tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  // Get the order and verify ownership
  const { data: order, error: orderError } = await supabase
    .from('store_orders')
    .select('id, status, customer_id, tenant_id')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  // Verify ownership - user must own the order
  if (order.customer_id !== user.id) {
    return NextResponse.json({ error: 'No autorizado para este pedido' }, { status: 403 })
  }

  // Verify tenant isolation
  if (order.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  // Only pending orders can be cancelled by customer
  if (order.status !== 'pending') {
    return NextResponse.json(
      { error: 'Solo pedidos pendientes pueden ser cancelados' },
      { status: 400 }
    )
  }

  // Update order status
  const { error: updateError } = await supabase
    .from('store_orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: 'Cancelado por el cliente',
    })
    .eq('id', orderId)

  if (updateError) {
    logger.error('Error cancelling order', {
      orderId,
      userId: user.id,
      error: updateError.message,
    })
    return NextResponse.json({ error: 'Error al cancelar el pedido' }, { status: 500 })
  }

  // TODO: In a full implementation, we would also:
  // 1. Restore inventory stock for each item
  // 2. Release any payment holds
  // 3. Send notification to clinic staff
  // 4. Send confirmation email to customer

  logger.info('Order cancelled by customer', {
    orderId,
    userId: user.id,
    tenantId: profile.tenant_id,
  })

  return NextResponse.json({ success: true })
}
