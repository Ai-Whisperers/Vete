import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

/**
 * GET /api/dashboard/orders
 * List all orders for the clinic
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')
  const status = searchParams.get('status') || 'all'
  const paymentStatus = searchParams.get('payment_status') || 'all'
  const search = searchParams.get('search') || ''
  const requiresPrescription = searchParams.get('requires_prescription')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '25', 10)

  if (!clinic) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Clinic parameter is required' },
    })
  }

  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Verify staff access
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.tenant_id !== clinic) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  if (profile.role !== 'vet' && profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const offset = (page - 1) * limit

    let query = supabase
      .from('store_orders')
      .select(
        `
        *,
        profiles:customer_id (
          id,
          full_name,
          email,
          phone
        )
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', clinic)
      .is('deleted_at', null)

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply payment status filter
    if (paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus)
    }

    // Apply search filter (order number or customer name)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%`)
    }

    // Apply requires prescription filter
    if (requiresPrescription === 'true') {
      query = query.eq('requires_prescription_review', true)
    }

    // Apply date filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo + 'T23:59:59')
    }

    const {
      data: orders,
      error,
      count,
    } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) throw error

    // Get order items count for each order
    const orderIds = orders?.map((o) => o.id) || []
    const { data: itemCounts } = await supabase
      .from('store_order_items')
      .select('order_id, quantity')
      .in('order_id', orderIds)

    const countMap = new Map<string, number>()
    itemCounts?.forEach((item) => {
      countMap.set(item.order_id, (countMap.get(item.order_id) || 0) + Number(item.quantity))
    })

    // Get prescription requirements for items
    const { data: prescriptionItems } = await supabase
      .from('store_order_items')
      .select('order_id, requires_prescription')
      .in('order_id', orderIds)
      .eq('requires_prescription', true)

    const prescriptionMap = new Set(prescriptionItems?.map((i) => i.order_id) || [])

    const enrichedOrders = orders?.map((order) => ({
      ...order,
      customer: order.profiles,
      item_count: countMap.get(order.id) || 0,
      has_prescription_items: prescriptionMap.has(order.id),
    }))

    // Get summary counts by status
    const { data: statusCounts } = await supabase
      .from('store_orders')
      .select('status')
      .eq('tenant_id', clinic)
      .is('deleted_at', null)

    const summary: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      ready: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    statusCounts?.forEach((order) => {
      summary[order.status] = (summary[order.status] || 0) + 1
    })

    return NextResponse.json({
      orders: enrichedOrders,
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        hasNext: page < Math.ceil((count || 0) / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
