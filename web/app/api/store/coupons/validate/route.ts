import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

// POST - Validate a coupon code
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Apply rate limiting for write endpoints (20 requests per minute)
  const rateLimitResult = await rateLimit(request, 'write', user.id)
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }

  try {
    const body = await request.json()
    const { code, clinic, cart_total } = body

    if (!code || !clinic || cart_total === undefined) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Faltan parámetros requeridos' },
      })
    }

    // Use the database function for validation
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_tenant_id: clinic,
      p_code: code.toUpperCase(),
      p_user_id: user.id,
      p_cart_total: cart_total,
    })

    if (error) throw error

    if (!data || !data.valid) {
      return NextResponse.json({
        valid: false,
        error: data?.error || 'Cupón no válido',
      })
    }

    return NextResponse.json({
      valid: true,
      coupon_id: data.coupon_id,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      calculated_discount: data.calculated_discount,
      name: data.name,
    })
  } catch (e) {
    console.error('Error validating coupon', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'No se pudo validar el cupón' },
    })
  }
}
