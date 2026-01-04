import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/dashboard/coupons/[id]
 * Get a single coupon
 */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const { data: coupon, error } = await supabase
      .from('store_coupons')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single()

    if (error || !coupon) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { message: 'Cupón no encontrado' },
      })
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * PUT /api/dashboard/coupons/[id]
 * Update a coupon
 */
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const body = await request.json()
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      min_purchase_amount,
      max_discount_amount,
      usage_limit,
      usage_limit_per_user,
      valid_from,
      valid_until,
      applicable_products,
      applicable_categories,
      is_active,
    } = body

    // Check if coupon exists
    const { data: existing } = await supabase
      .from('store_coupons')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    // Check for duplicate code if code is being changed
    if (code) {
      const { data: duplicate } = await supabase
        .from('store_coupons')
        .select('id')
        .eq('tenant_id', profile.tenant_id)
        .ilike('code', code)
        .neq('id', id)
        .is('deleted_at', null)
        .single()

      if (duplicate) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'Ya existe un cupón con este código' },
        })
      }
    }

    // Validation
    if (
      discount_type === 'percentage' &&
      discount_value &&
      (discount_value <= 0 || discount_value > 100)
    ) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'El porcentaje debe estar entre 1 y 100' },
      })
    }

    const updateData: Record<string, unknown> = {}
    if (code !== undefined) updateData.code = code.toUpperCase()
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (discount_type !== undefined) updateData.discount_type = discount_type
    if (discount_value !== undefined) updateData.discount_value = discount_value
    if (min_purchase_amount !== undefined) updateData.min_purchase_amount = min_purchase_amount
    if (max_discount_amount !== undefined) updateData.max_discount_amount = max_discount_amount
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit
    if (usage_limit_per_user !== undefined) updateData.usage_limit_per_user = usage_limit_per_user
    if (valid_from !== undefined) updateData.valid_from = valid_from
    if (valid_until !== undefined) updateData.valid_until = valid_until
    if (applicable_products !== undefined) updateData.applicable_products = applicable_products
    if (applicable_categories !== undefined)
      updateData.applicable_categories = applicable_categories
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: coupon, error } = await supabase
      .from('store_coupons')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * DELETE /api/dashboard/coupons/[id]
 * Soft delete a coupon
 */
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const { error } = await supabase
      .from('store_coupons')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
