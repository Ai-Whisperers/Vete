import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Validation schemas
const couponSchema = z.object({
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').max(50, 'El código no puede exceder 50 caracteres'),
  name: z.string().max(100, 'El nombre no puede exceder 100 caracteres').optional().nullable(),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_shipping'], {
    errorMap: () => ({ message: 'Tipo de descuento inválido' }),
  }),
  discount_value: z.number().min(0, 'El valor del descuento debe ser mayor o igual a 0'),
  min_purchase_amount: z.number().min(0, 'El monto mínimo de compra debe ser mayor o igual a 0').optional().nullable(),
  max_discount_amount: z.number().min(0, 'El descuento máximo debe ser mayor o igual a 0').optional().nullable(),
  usage_limit: z.number().int().min(1, 'El límite de uso debe ser al menos 1').optional().nullable(),
  usage_limit_per_user: z.number().int().min(1, 'El límite por usuario debe ser al menos 1').optional().nullable(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de inicio inválida (formato: YYYY-MM-DD)'),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de vencimiento inválida (formato: YYYY-MM-DD)').optional().nullable(),
  applicable_products: z.array(z.string().uuid('ID de producto inválido')).optional().nullable(),
  applicable_categories: z.array(z.string().uuid('ID de categoría inválido')).optional().nullable(),
  is_active: z.boolean().optional().default(true),
})

export type CouponDiscountType = 'percentage' | 'fixed_amount' | 'free_shipping'

interface Coupon {
  id: string
  tenant_id: string
  code: string
  name: string | null
  description: string | null
  discount_type: CouponDiscountType
  discount_value: number
  min_purchase_amount: number | null
  max_discount_amount: number | null
  usage_limit: number | null
  usage_count: number
  usage_limit_per_user: number | null
  valid_from: string
  valid_until: string | null
  applicable_products: string[] | null
  applicable_categories: string[] | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

/**
 * GET /api/dashboard/coupons
 * List all coupons for the clinic
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')
  const status = searchParams.get('status') || 'all' // all, active, expired, exhausted
  const search = searchParams.get('search') || ''
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
    const now = new Date().toISOString()

    let query = supabase
      .from('store_coupons')
      .select('*', { count: 'exact' })
      .eq('tenant_id', clinic)
      .is('deleted_at', null)

    // Apply search filter
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`)
    }

    // Apply status filter
    // Note: 'exhausted' status requires post-query filtering since Supabase
    // doesn't support comparing two columns directly in WHERE clauses
    const filterExhausted = status === 'exhausted'

    if (status === 'active') {
      query = query.eq('is_active', true).or(`valid_until.is.null,valid_until.gt.${now}`)
    } else if (status === 'expired') {
      query = query.lt('valid_until', now)
    } else if (status === 'exhausted') {
      // Fetch coupons with a usage limit set, filter exhausted ones in JS
      query = query.not('usage_limit', 'is', null)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const {
      data: coupons,
      error,
      count,
    } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) throw error

    // Get creator info for each coupon
    const creatorIds = [...new Set(coupons?.map((c) => c.created_by).filter(Boolean))]
    const { data: creators } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', creatorIds)

    const creatorMap = new Map(creators?.map((c) => [c.id, c.full_name]) || [])

    let enrichedCoupons = coupons?.map((coupon) => ({
      ...coupon,
      creator_name: coupon.created_by ? creatorMap.get(coupon.created_by) : null,
      status: getCouponStatus(coupon, now),
    }))

    // Apply exhausted filter in JS (Supabase can't compare columns)
    if (filterExhausted) {
      enrichedCoupons = enrichedCoupons?.filter(
        (c) => c.usage_limit !== null && c.usage_count >= c.usage_limit
      )
    }

    return NextResponse.json({
      coupons: enrichedCoupons,
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
    logger.error('Error fetching coupons', {
      clinic,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * POST /api/dashboard/coupons
 * Create a new coupon
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch (_error: unknown) {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Formato JSON inválido' },
      })
    }

    const validation = couponSchema.safeParse(body)
    if (!validation.success) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: {
          errors: validation.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      })
    }

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
      is_active = true,
    } = validation.data

    // Check if code already exists
    const { data: existing } = await supabase
      .from('store_coupons')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .ilike('code', code)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Ya existe un cupón con este código' },
      })
    }

    const { data: coupon, error } = await supabase
      .from('store_coupons')
      .insert({
        tenant_id: profile.tenant_id,
        code: code.toUpperCase(),
        name,
        description,
        discount_type,
        discount_value,
        min_purchase_amount: min_purchase_amount || 0,
        max_discount_amount,
        usage_limit,
        usage_limit_per_user: usage_limit_per_user || 1,
        valid_from: valid_from || new Date().toISOString(),
        valid_until,
        applicable_products,
        applicable_categories,
        is_active,
        created_by: user.id,
        usage_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    logger.error('Error creating coupon', {
      tenantId: profile.tenant_id,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

function getCouponStatus(coupon: Coupon, now: string): string {
  if (!coupon.is_active) return 'inactive'
  if (coupon.valid_until && coupon.valid_until < now) return 'expired'
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return 'exhausted'
  if (coupon.valid_from > now) return 'scheduled'
  return 'active'
}
