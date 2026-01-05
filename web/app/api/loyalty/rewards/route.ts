import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/loyalty/rewards
 * Get available rewards for a clinic
 */
export const GET = withApiAuth(async ({ request, user, profile, supabase }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')

  if (!clinic) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'clinic' } })
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
    logger.error('Error fetching loyalty rewards', {
      tenantId: profile.tenant_id,
      userId: user.id,
      clinicParam: clinic,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})

/**
 * POST /api/loyalty/rewards
 * Create a new reward (admin only)
 */
export const POST = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
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
      logger.error('Error creating loyalty reward', {
        tenantId: profile.tenant_id,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'] }
)
