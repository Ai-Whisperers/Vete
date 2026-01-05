import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for purchase orders
const purchaseOrderSchema = z.object({
  supplier_id: z.string().uuid('ID de proveedor inválido'),
  items: z.array(z.object({
    catalog_product_id: z.string().uuid(),
    quantity: z.number().int().positive('Cantidad debe ser positiva'),
    unit_cost: z.number().positive('Costo unitario debe ser positivo'),
  })).min(1, 'Debe incluir al menos un item'),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  shipping_address: z.string().optional(),
})

// GET - List purchase orders
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplier_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (id, name),
        purchase_order_items (
          id,
          catalog_product_id,
          quantity,
          unit_cost,
          received_quantity,
          catalog_products (id, sku, name)
        ),
        profiles!purchase_orders_created_by_fkey (id, full_name)
      `, { count: 'exact' })
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (supplierId) {
      query = query.eq('supplier_id', supplierId)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching purchase orders:', error)
      return NextResponse.json({ error: 'Error al obtener órdenes de compra' }, { status: 500 })
    }

    return NextResponse.json({
      orders,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Purchase orders GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Create purchase order
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Only admin can create purchase orders
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear órdenes de compra' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = purchaseOrderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const orderData = validation.data

    // Verify supplier exists
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('id', orderData.supplier_id)
      .eq('tenant_id', profile.tenant_id)
      .eq('is_active', true)
      .single()

    if (!supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)

    // Generate order number
    const { data: lastOrder } = await supabase
      .from('purchase_orders')
      .select('order_number')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNumber = lastOrder?.order_number?.match(/PO-(\d+)/)?.[1] || '0'
    const newNumber = `PO-${String(parseInt(lastNumber) + 1).padStart(6, '0')}`

    // Create purchase order
    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        tenant_id: profile.tenant_id,
        supplier_id: orderData.supplier_id,
        order_number: newNumber,
        status: 'draft',
        subtotal,
        tax_amount: 0,
        total: subtotal,
        expected_delivery_date: orderData.expected_delivery_date,
        notes: orderData.notes,
        shipping_address: orderData.shipping_address,
        created_by: user.id,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating purchase order:', orderError)
      return NextResponse.json({ error: 'Error al crear orden de compra' }, { status: 500 })
    }

    // Create order items
    const items = orderData.items.map(item => ({
      purchase_order_id: order.id,
      catalog_product_id: item.catalog_product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      line_total: item.quantity * item.unit_cost,
      received_quantity: 0,
    }))

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(items)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback order
      await supabase.from('purchase_orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Error al crear items de orden' }, { status: 500 })
    }

    // Fetch complete order
    const { data: completeOrder } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (id, name),
        purchase_order_items (
          id,
          catalog_product_id,
          quantity,
          unit_cost,
          line_total,
          catalog_products (id, sku, name)
        )
      `)
      .eq('id', order.id)
      .single()

    return NextResponse.json(completeOrder, { status: 201 })
  } catch (error) {
    console.error('Purchase orders POST error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
