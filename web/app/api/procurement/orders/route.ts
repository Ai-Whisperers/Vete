import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Validation schema for purchase orders
const purchaseOrderSchema = z.object({
  supplier_id: z.string().uuid('ID de proveedor inválido'),
  items: z
    .array(
      z.object({
        catalog_product_id: z.string().uuid(),
        quantity: z.number().int().positive('Cantidad debe ser positiva'),
        unit_cost: z.number().positive('Costo unitario debe ser positivo'),
      })
    )
    .min(1, 'Debe incluir al menos un item'),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  shipping_address: z.string().optional(),
})

/**
 * GET /api/procurement/orders
 * List purchase orders
 */
export const GET = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
    // Parse query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplier_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    try {
      // Build query
      let query = supabase
        .from('purchase_orders')
        .select(
          `
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
        `,
          { count: 'exact' }
        )
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
        logger.error('Error fetching purchase orders', {
          tenantId: profile.tenant_id,
          userId: user.id,
          error: error.message,
        })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      return NextResponse.json({
        orders,
        total: count || 0,
        limit,
        offset,
      })
    } catch (e) {
      logger.error('Purchase orders GET error', {
        tenantId: profile.tenant_id,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'] }
)

/**
 * POST /api/procurement/orders
 * Create purchase order
 */
export const POST = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
    try {
      // Parse and validate body
      const body = await request.json()
      const validation = purchaseOrderSchema.safeParse(body)

      if (!validation.success) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { errors: validation.error.errors },
        })
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
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'supplier' },
        })
      }

      // Calculate totals
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost,
        0
      )

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
        logger.error('Error creating purchase order', {
          tenantId: profile.tenant_id,
          userId: user.id,
          error: orderError.message,
        })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      // Create order items
      const items = orderData.items.map((item) => ({
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
        logger.error('Error creating order items', {
          tenantId: profile.tenant_id,
          orderId: order.id,
          error: itemsError.message,
        })
        // Rollback order
        await supabase.from('purchase_orders').delete().eq('id', order.id)
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      // Fetch complete order
      const { data: completeOrder } = await supabase
        .from('purchase_orders')
        .select(
          `
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
        `
        )
        .eq('id', order.id)
        .single()

      return NextResponse.json(completeOrder, { status: 201 })
    } catch (e) {
      logger.error('Purchase orders POST error', {
        tenantId: profile.tenant_id,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'] }
)
