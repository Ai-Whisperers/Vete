import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { parsePagination, paginatedResponse } from '@/lib/api/pagination'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/procurement/orders
 * List purchase orders for the tenant
 * Query params:
 *   - status: Filter by order status
 *   - supplier_id: Filter by supplier
 *   - page, limit: Pagination
 */
export const GET = withApiAuth(
  async ({ request, profile, supabase }: ApiHandlerContext) => {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplier_id')
    const { page, limit, offset } = parsePagination(searchParams)

    // Build query
    let query = supabase
      .from('purchase_orders')
      .select(
        `
        *,
        suppliers(id, name, contact_name, email),
        purchase_order_items(
          id,
          catalog_product_id,
          quantity,
          unit_cost,
          line_total,
          received_quantity,
          store_products(id, name, sku)
        ),
        created_by_profile:profiles!purchase_orders_created_by_fkey(id, full_name)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (supplierId) {
      query = query.eq('supplier_id', supplierId)
    }

    const { data, error, count } = await query

    if (error) {
      logger.error('Error fetching purchase orders', {
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(paginatedResponse(data || [], count || 0, { page, limit, offset }))
  },
  { roles: ['vet', 'admin'] }
)

/**
 * POST /api/procurement/orders
 * Create a new purchase order
 * Body: {
 *   supplier_id: string,
 *   items: [{ catalog_product_id: string, quantity: number, unit_cost: number }],
 *   expected_delivery_date?: string,
 *   shipping_address?: string,
 *   notes?: string
 * }
 */
export const POST = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
    // Apply rate limiting for write endpoints
    const rateLimitResult = await rateLimit(request, 'write', user.id)
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const { supplier_id, items, expected_delivery_date, shipping_address, notes } = body

    // Validate required fields
    if (!supplier_id) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        field_errors: {
          supplier_id: ['El ID del proveedor es requerido'],
        },
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        field_errors: {
          items: ['Al menos un producto es requerido'],
        },
      })
    }

    // Validate items
    for (const item of items) {
      if (!item.catalog_product_id) {
        return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
          field_errors: {
            catalog_product_id: ['El ID del producto es requerido'],
          },
        })
      }
      if (!item.quantity || item.quantity <= 0) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          field_errors: {
            quantity: ['La cantidad debe ser mayor a 0'],
          },
        })
      }
      if (item.unit_cost === undefined || item.unit_cost < 0) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          field_errors: {
            unit_cost: ['El costo unitario debe ser mayor o igual a 0'],
          },
        })
      }
    }

    // Verify supplier exists and belongs to tenant
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id, tenant_id')
      .eq('id', supplier_id)
      .single()

    if (!supplier) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'supplier' },
      })
    }

    if (supplier.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Verify all products exist
    const productIds = items.map((item: { catalog_product_id: string }) => item.catalog_product_id)
    const { data: products } = await supabase
      .from('store_products')
      .select('id')
      .in('id', productIds)

    if (!products || products.length !== productIds.length) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'catalog_product' },
      })
    }

    // Generate order number using database function
    const { data: orderNumber, error: numError } = await supabase.rpc('generate_purchase_order_number', {
      p_tenant_id: profile.tenant_id,
    })

    if (numError) {
      logger.error('Error generating order number', {
        tenantId: profile.tenant_id,
        error: numError.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Insert purchase order
    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        tenant_id: profile.tenant_id,
        supplier_id,
        order_number: orderNumber,
        status: 'draft',
        expected_delivery_date: expected_delivery_date || null,
        shipping_address: shipping_address || null,
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (orderError) {
      logger.error('Error creating purchase order', {
        tenantId: profile.tenant_id,
        userId: user.id,
        supplierId: supplier_id,
        error: orderError.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Insert order items
    const orderItems = items.map(
      (item: { catalog_product_id: string; quantity: number; unit_cost: number; notes?: string }) => ({
        purchase_order_id: order.id,
        catalog_product_id: item.catalog_product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        notes: item.notes || null,
      })
    )

    const { error: itemsError } = await supabase.from('purchase_order_items').insert(orderItems)

    if (itemsError) {
      logger.error('Error creating purchase order items', {
        tenantId: profile.tenant_id,
        orderId: order.id,
        error: itemsError.message,
      })
      // Rollback order creation
      await supabase.from('purchase_orders').delete().eq('id', order.id)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Fetch complete order with items
    const { data: completeOrder } = await supabase
      .from('purchase_orders')
      .select(
        `
        *,
        suppliers(id, name),
        purchase_order_items(
          id,
          catalog_product_id,
          quantity,
          unit_cost,
          line_total,
          store_products(id, name, sku)
        )
      `
      )
      .eq('id', order.id)
      .single()

    return NextResponse.json(completeOrder, { status: HTTP_STATUS.CREATED })
  },
  { roles: ['admin'] }
)
