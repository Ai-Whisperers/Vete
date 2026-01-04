import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

/**
 * GET /api/store/orders/pending-prescriptions
 * List orders pending prescription review (staff only)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get user's profile and verify staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { message: 'Perfil no encontrado' },
    })
  }

  if (profile.role !== 'vet' && profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Solo personal autorizado' },
    })
  }

  // Build query
  let query = supabase
    .from('store_orders')
    .select(
      `
      id,
      invoice_number,
      status,
      total,
      requires_prescription_review,
      prescription_file_url,
      created_at,
      customer:profiles!store_orders_customer_id_fkey(id, full_name, email, phone),
      items:store_order_items(
        id,
        product_id,
        quantity,
        unit_price,
        requires_prescription,
        prescription_file_url,
        product:store_products(id, name, image_url)
      )
    `,
      { count: 'exact' }
    )
    .eq('tenant_id', profile.tenant_id)
    .eq('status', 'pending_prescription')
    .order('created_at', { ascending: false })

  // Date filters
  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data: orders, error: ordersError, count } = await query

  if (ordersError) {
    console.error('Error fetching pending prescriptions:', ordersError)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al obtener pedidos' },
    })
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  })
}
