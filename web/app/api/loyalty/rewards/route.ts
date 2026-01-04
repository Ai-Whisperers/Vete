import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

/**
 * GET /api/loyalty/rewards
 * Get available rewards for a clinic
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')

  if (!clinic) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'clinic' } })
  }

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  try {
    // Get active rewards
    const { data: rewards, error } = await supabase
      .from('loyalty_rewards')
      .select(
        `
        id, name, description, category, points_cost, value_display,
        stock, max_per_user, valid_from, valid_to, image_url, display_order,
        service:services(id, name),
        product:store_products(id, name)
      `
      )
      .eq('tenant_id', clinic)
      .eq('is_active', true)
      .or('valid_from.is.null,valid_from.lte.now()')
      .or('valid_to.is.null,valid_to.gte.now()')
      .order('display_order')
      .order('points_cost')

    if (error) throw error

    // Get user's redemption counts for max_per_user check
    const rewardIds = rewards?.map((r) => r.id) || []
    if (rewardIds.length > 0) {
      const { data: userRedemptions } = await supabase
        .from('loyalty_redemptions')
        .select('reward_id')
        .eq('user_id', user.id)
        .in('reward_id', rewardIds)
        .in('status', ['pending', 'approved', 'used'])

      // Add redemption count to each reward
      const redemptionCounts: Record<string, number> = {}
      userRedemptions?.forEach((r) => {
        redemptionCounts[r.reward_id] = (redemptionCounts[r.reward_id] || 0) + 1
      })

      rewards?.forEach((reward) => {
        ;(reward as Record<string, unknown>).user_redemption_count =
          redemptionCounts[reward.id] || 0
      })
    }

    return NextResponse.json({ data: rewards || [] })
  } catch (e) {
    console.error('Error fetching rewards:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * POST /api/loyalty/rewards
 * Create a new reward (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      points_cost,
      value_display,
      stock,
      max_per_user,
      valid_from,
      valid_to,
      service_id,
      product_id,
      discount_percentage,
      discount_amount,
      image_url,
      display_order,
    } = body

    if (!name || !points_cost) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['name', 'points_cost'] },
      })
    }

    const { data, error } = await supabase
      .from('loyalty_rewards')
      .insert({
        tenant_id: profile.tenant_id,
        name,
        description,
        category: category || 'discount',
        points_cost,
        value_display,
        stock: stock || null,
        max_per_user: max_per_user || null,
        valid_from: valid_from || null,
        valid_to: valid_to || null,
        service_id: service_id || null,
        product_id: product_id || null,
        discount_percentage: discount_percentage || null,
        discount_amount: discount_amount || null,
        image_url: image_url || null,
        display_order: display_order || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    console.error('Error creating reward:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
