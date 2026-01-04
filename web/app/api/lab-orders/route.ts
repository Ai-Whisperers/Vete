import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { rateLimit } from '@/lib/rate-limit'
import { parsePagination, paginatedResponse } from '@/lib/api/pagination'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

export const GET = withAuth(
  async ({ request, profile, supabase }) => {
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('pet_id')
    const status = searchParams.get('status')
    const { page, limit, offset } = parsePagination(searchParams)

    // Build query
    let query = supabase
      .from('lab_orders')
      .select(
        `
      *,
      pets!inner(id, name, species)
    `,
        { count: 'exact' }
      )
      .eq('tenant_id', profile.tenant_id)
      .order('ordered_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (petId) {
      query = query.eq('pet_id', petId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[API] lab_orders GET error:', error)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(paginatedResponse(data || [], count || 0, { page, limit, offset }))
  },
  { roles: ['vet', 'admin'] }
)

export const POST = withAuth(
  async ({ request, user, profile, supabase }) => {
    // Apply rate limiting for write endpoints (20 requests per minute)
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

    const { pet_id, test_ids, panel_ids, priority, lab_type, fasting_status, clinical_notes } = body

    // Validate required fields
    if (!pet_id || !test_ids || test_ids.length === 0) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        field_errors: {
          pet_id: !pet_id ? ['El ID de la mascota es requerido'] : [],
          test_ids: !test_ids || test_ids.length === 0 ? ['Al menos un test es requerido'] : [],
        },
      })
    }

    // Verify pet belongs to staff's clinic
    const { data: pet } = await supabase
      .from('pets')
      .select('id, tenant_id')
      .eq('id', pet_id)
      .single()

    if (!pet) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    if (pet.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Generate order number (format: LAB-YYYYMMDD-XXXX)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const { count } = await supabase
      .from('lab_orders')
      .select('id', { count: 'exact', head: true })
      .like('order_number', `LAB-${today}-%`)

    const orderNumber = `LAB-${today}-${String((count || 0) + 1).padStart(4, '0')}`

    // Insert lab order
    const { data: order, error: orderError } = await supabase
      .from('lab_orders')
      .insert({
        tenant_id: profile.tenant_id,
        pet_id,
        order_number: orderNumber,
        ordered_by: user.id,
        ordered_at: new Date().toISOString(),
        status: 'ordered',
        priority: priority || 'routine',
        lab_type: lab_type || 'in_house',
        fasting_status: fasting_status || null,
        clinical_notes: clinical_notes || null,
        has_critical_values: false,
      })
      .select()
      .single()

    if (orderError) {
      console.error('[API] lab_orders POST error:', orderError)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Insert order items for each test
    const orderItems = test_ids.map((testId: string) => ({
      order_id: order.id,
      test_id: testId,
    }))

    const { error: itemsError } = await supabase.from('lab_order_items').insert(orderItems)

    if (itemsError) {
      console.error('[API] lab_order_items POST error:', itemsError)
      // Rollback order creation
      await supabase.from('lab_orders').delete().eq('id', order.id)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // If panel_ids provided, insert them as well
    if (panel_ids && panel_ids.length > 0) {
      const panelItems = panel_ids.map((panelId: string) => ({
        order_id: order.id,
        panel_id: panelId,
      }))

      await supabase.from('lab_order_panels').insert(panelItems)
    }

    return NextResponse.json(order, { status: HTTP_STATUS.CREATED })
  },
  { roles: ['vet', 'admin'] }
)
