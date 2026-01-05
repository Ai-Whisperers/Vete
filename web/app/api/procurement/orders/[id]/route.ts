import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateOrderSchema = z.object({
  status: z.enum(['draft', 'submitted', 'confirmed', 'shipped', 'received', 'cancelled']).optional(),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  shipping_address: z.string().optional(),
})

const receiveItemsSchema = z.object({
  items: z.array(z.object({
    item_id: z.string().uuid(),
    received_quantity: z.number().int().min(0),
    notes: z.string().optional(),
  })),
})

// GET - Get purchase order details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get tenant context
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Only staff can access
    if (!['vet', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { data: order, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (id, name, contact_info, payment_terms, delivery_time_days),
        purchase_order_items (
          id,
          catalog_product_id,
          quantity,
          unit_cost,
          line_total,
          received_quantity,
          catalog_products (id, sku, name, base_unit)
        ),
        profiles!purchase_orders_created_by_fkey (id, full_name, email)
      `)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Orden de compra no encontrada' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Purchase order GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH - Update purchase order status or details
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get tenant context
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Only admin can update orders
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden editar órdenes' }, { status: 403 })
    }

    // Check order exists
    const { data: existing } = await supabase
      .from('purchase_orders')
      .select('id, status')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Orden de compra no encontrada' }, { status: 404 })
    }

    // Parse body
    const body = await request.json()

    // Check if this is a receive items request
    if (body.items && Array.isArray(body.items)) {
      const validation = receiveItemsSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: validation.error.errors },
          { status: 400 }
        )
      }

      // Update received quantities
      for (const item of validation.data.items) {
        const { error: itemError } = await supabase
          .from('purchase_order_items')
          .update({
            received_quantity: item.received_quantity,
            received_at: new Date().toISOString(),
            notes: item.notes,
          })
          .eq('id', item.item_id)
          .eq('purchase_order_id', id)

        if (itemError) {
          console.error('Error updating order item:', itemError)
        }
      }

      // Check if all items fully received
      const { data: items } = await supabase
        .from('purchase_order_items')
        .select('quantity, received_quantity')
        .eq('purchase_order_id', id)

      const allReceived = items?.every(item => item.received_quantity >= item.quantity)

      if (allReceived) {
        await supabase
          .from('purchase_orders')
          .update({
            status: 'received',
            received_at: new Date().toISOString(),
            received_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
      }

      // Fetch updated order
      const { data: order } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          purchase_order_items (
            id,
            quantity,
            received_quantity,
            catalog_products (id, sku, name)
          )
        `)
        .eq('id', id)
        .single()

      return NextResponse.json(order)
    }

    // Regular update
    const validation = updateOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    }

    // Add status-specific timestamps
    if (validation.data.status === 'submitted') {
      updateData.submitted_at = new Date().toISOString()
    } else if (validation.data.status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (validation.data.status === 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    } else if (validation.data.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
      updateData.cancelled_by = user.id
    }

    const { data: order, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating purchase order:', error)
      return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Purchase order PATCH error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Cancel/delete purchase order (only if draft)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get tenant context
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Only admin can delete
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar órdenes' }, { status: 403 })
    }

    // Check order status
    const { data: existing } = await supabase
      .from('purchase_orders')
      .select('id, status')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Orden de compra no encontrada' }, { status: 404 })
    }

    // Only draft orders can be deleted
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Solo órdenes en borrador pueden ser eliminadas' },
        { status: 400 }
      )
    }

    // Delete items first
    await supabase
      .from('purchase_order_items')
      .delete()
      .eq('purchase_order_id', id)

    // Delete order
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) {
      console.error('Error deleting purchase order:', error)
      return NextResponse.json({ error: 'Error al eliminar orden' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Purchase order DELETE error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
