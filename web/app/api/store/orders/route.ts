import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { requireFeature } from '@/lib/features/server'

// Order statuses
const ORDER_STATUSES = [
  'pending',
  'pending_prescription',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const
type OrderStatus = (typeof ORDER_STATUSES)[number]

interface OrderItem {
  product_id: string
  variant_id?: string
  quantity: number
  unit_price: number
  discount_amount?: number
}

interface CreateOrderInput {
  clinic: string
  items: OrderItem[]
  coupon_code?: string
  shipping_address?: {
    street: string
    city: string
    state?: string
    postal_code?: string
    country?: string
    phone?: string
    notes?: string
  }
  billing_address?: {
    full_name: string
    ruc?: string
    email: string
    phone?: string
  }
  shipping_method?: string
  payment_method?: string
  notes?: string
}

// GET - Get user's orders
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')
  const status = searchParams.get('status') as OrderStatus | null
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  if (!clinic) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Falta parámetro clinic' },
    })
  }

  // Check if tenant has ecommerce feature enabled
  const featureCheck = await requireFeature(clinic, 'ecommerce')
  if (featureCheck) return featureCheck

  try {
    let query = supabase
      .from('store_orders')
      .select(
        `
        *,
        store_order_items(
          id,
          product_id,
          variant_id,
          product_name,
          variant_name,
          quantity,
          unit_price,
          discount_amount,
          line_total,
          store_products(id, name, image_url)
        )
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', clinic)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && ORDER_STATUSES.includes(status)) {
      query = query.eq('status', status)
    }

    const { data: orders, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (e) {
    logger.error('Error fetching orders', {
      tenantId: clinic,
      userId: user.id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al cargar pedidos' },
    })
  }
}

// POST - Create new order
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  try {
    const body: CreateOrderInput = await request.json()
    const {
      clinic,
      items,
      coupon_code,
      shipping_address,
      billing_address,
      shipping_method,
      payment_method,
      notes,
    } = body

    if (!clinic || !items || items.length === 0) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Faltan parámetros requeridos' },
      })
    }

    // Validate products and get current prices
    const productIds = items.map((item) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('store_products')
      .select(
        `
        id,
        name,
        base_price,
        is_prescription_required,
        store_inventory(stock_quantity)
      `
      )
      .in('id', productIds)
      .eq('tenant_id', clinic)
      .eq('is_active', true)

    if (productsError) throw productsError

    if (!products || products.length !== productIds.length) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Uno o más productos no están disponibles' },
      })
    }

    // Fetch variant names if any variant_ids are provided
    const variantIds = items.filter((i) => i.variant_id).map((i) => i.variant_id!)
    let variantMap: Record<string, string> = {}
    if (variantIds.length > 0) {
      const { data: variants } = await supabase
        .from('store_product_variants')
        .select('id, name')
        .in('id', variantIds)

      if (variants) {
        variantMap = variants.reduce(
          (acc, v) => ({ ...acc, [v.id]: v.name }),
          {} as Record<string, string>
        )
      }
    }

    // Check stock availability and prescription requirements
    let requiresPrescriptionReview = false
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) {
        return apiError('NOT_FOUND', HTTP_STATUS.BAD_REQUEST, {
          details: { message: `Producto no encontrado: ${item.product_id}` },
        })
      }

      const inventory = product.store_inventory as unknown as { stock_quantity: number } | null
      if (!inventory || inventory.stock_quantity < item.quantity) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: {
            message: `Stock insuficiente para: ${product.name}`,
            available: inventory?.stock_quantity || 0,
          },
        })
      }

      // Check prescription requirement
      if (product.is_prescription_required) {
        // Check if user has a valid prescription for this product type
        const { data: prescriptions } = await supabase
          .from('prescriptions')
          .select('id, valid_until')
          .eq('client_id', user.id)
          .gte('valid_until', new Date().toISOString())
          .limit(1)

        if (!prescriptions || prescriptions.length === 0) {
          // No valid prescription - flag for review but allow order
          requiresPrescriptionReview = true
        }
      }
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!
      const unitPrice = item.unit_price || product.base_price
      const discount = item.discount_amount || 0
      const lineTotal = unitPrice * item.quantity - discount
      subtotal += lineTotal

      return {
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: product.name,
        variant_name: item.variant_id ? variantMap[item.variant_id] || null : null,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_amount: discount,
        line_total: lineTotal,
        requires_prescription: product.is_prescription_required || false,
      }
    })

    // Apply coupon if provided
    let couponDiscount = 0
    let couponId = null
    if (coupon_code) {
      const { data: couponResult } = await supabase.rpc('validate_coupon', {
        p_tenant_id: clinic,
        p_code: coupon_code.toUpperCase(),
        p_user_id: user.id,
        p_cart_total: subtotal,
      })

      if (couponResult?.valid) {
        couponDiscount = couponResult.calculated_discount || 0
        couponId = couponResult.coupon_id
      }
    }

    // Calculate shipping (simplified)
    const shippingCost = subtotal >= 150000 ? 0 : 15000 // Free shipping over 150k

    // Calculate tax (IVA 10%)
    const taxRate = 10
    const taxAmount = Math.round(((subtotal - couponDiscount) * taxRate) / 100)

    // Total
    const total = subtotal - couponDiscount + shippingCost + taxAmount

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create order - flag for prescription review if needed
    const orderStatus = requiresPrescriptionReview ? 'pending_prescription' : 'pending'
    const { data: order, error: orderError } = await supabase
      .from('store_orders')
      .insert({
        tenant_id: clinic,
        user_id: user.id,
        order_number: orderNumber,
        status: orderStatus,
        subtotal,
        discount_amount: couponDiscount,
        coupon_id: couponId,
        coupon_code: coupon_code?.toUpperCase() || null,
        shipping_cost: shippingCost,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        shipping_address,
        billing_address,
        shipping_method: shipping_method || 'standard',
        payment_method: payment_method || 'cash_on_delivery',
        notes,
        requires_prescription_review: requiresPrescriptionReview,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
      tenant_id: clinic,
    }))

    const { error: itemsError } = await supabase
      .from('store_order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) throw itemsError

    // Update inventory (reserve stock)
    for (const item of items) {
      const { error: inventoryError } = await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })

      if (inventoryError) {
        logger.error('Stock update error', {
          tenantId: clinic,
          productId: item.product_id,
          quantity: item.quantity,
          error: inventoryError instanceof Error ? inventoryError.message : String(inventoryError),
        })
        // Don't fail the order, but log for manual review
      }
    }

    // Record coupon usage if applied
    if (couponId && couponDiscount > 0) {
      await supabase.from('store_coupon_usage').insert({
        coupon_id: couponId,
        user_id: user.id,
        tenant_id: clinic,
        order_id: order.id,
        discount_applied: couponDiscount,
      })

      // Update coupon used_count
      await supabase.rpc('increment_coupon_usage', { p_coupon_id: couponId })
    }

    // Update product sales_count
    for (const item of items) {
      await supabase.rpc('increment_product_sales', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total: order.total,
          requires_prescription_review: requiresPrescriptionReview,
        },
        message: requiresPrescriptionReview
          ? 'Pedido creado. Algunos productos requieren receta médica. Un veterinario revisará tu pedido.'
          : undefined,
      },
      { status: 201 }
    )
  } catch (e) {
    logger.error('Error creating order', {
      userId: user.id,
      operation: 'create_order',
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al crear pedido' },
    })
  }
}
