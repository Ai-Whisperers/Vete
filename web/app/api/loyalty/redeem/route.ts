import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS, type ApiErrorType } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

// Generate a unique redemption code
function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'VPY-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * POST /api/loyalty/redeem
 * Redeem a reward - uses atomic database function to prevent race conditions
 */
export const POST = withApiAuth(async ({ request, user, profile, supabase }: ApiHandlerContext) => {
  try {
    const body = await request.json()
    const { reward_id, pet_id } = body

    if (!reward_id) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { field: 'reward_id' },
      })
    }

    // Generate unique redemption code
    let redemptionCode = generateRedemptionCode()
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('loyalty_redemptions')
        .select('id')
        .eq('redemption_code', redemptionCode)
        .maybeSingle()

      if (!existing) break
      redemptionCode = generateRedemptionCode()
      attempts++
    }

    // Call atomic redemption function
    // This prevents race conditions by:
    // 1. Locking reward row (stock check)
    // 2. Locking user's redemptions (max per user check)
    // 3. Locking user's loyalty transactions (points check)
    // 4. Creating redemption + deducting points + decrementing stock atomically
    const { data: result, error: rpcError } = await supabase.rpc('redeem_loyalty_reward', {
      p_tenant_id: profile.tenant_id,
      p_user_id: user.id,
      p_reward_id: reward_id,
      p_pet_id: pet_id || null,
      p_redemption_code: redemptionCode,
    })

    if (rpcError) {
      logger.error('Atomic redemption RPC error', {
        userId: user.id,
        rewardId: reward_id,
        error: rpcError.message,
      })
      throw rpcError
    }

    // Handle atomic function result
    if (!result?.success) {
      const errorMap: Record<string, { code: string; status: number }> = {
        REWARD_NOT_FOUND: { code: 'NOT_FOUND', status: HTTP_STATUS.NOT_FOUND },
        NOT_YET_VALID: { code: 'VALIDATION_ERROR', status: HTTP_STATUS.BAD_REQUEST },
        EXPIRED: { code: 'VALIDATION_ERROR', status: HTTP_STATUS.BAD_REQUEST },
        OUT_OF_STOCK: { code: 'CONFLICT', status: HTTP_STATUS.BAD_REQUEST },
        MAX_REDEMPTIONS_REACHED: { code: 'QUOTA_EXCEEDED', status: HTTP_STATUS.BAD_REQUEST },
        NO_PET_FOUND: { code: 'VALIDATION_ERROR', status: HTTP_STATUS.BAD_REQUEST },
        INSUFFICIENT_POINTS: { code: 'VALIDATION_ERROR', status: HTTP_STATUS.BAD_REQUEST },
      }

      const errorInfo = errorMap[result?.error] || { code: 'SERVER_ERROR' as const, status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      return apiError(errorInfo.code as ApiErrorType, errorInfo.status, {
        details: { reason: result?.message || 'Error al canjear recompensa' },
      })
    }

    // Create notification for user (non-critical, don't fail if this errors)
    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: '🎁 ¡Recompensa canjeada!',
        message: `Has canjeado "${result.reward_name}". Tu código es: ${result.redemption_code}`,
        type: 'loyalty',
        data: {
          redemption_id: result.redemption_id,
          reward_name: result.reward_name,
          code: result.redemption_code,
        },
      })
    } catch (notifError) {
      logger.warn('Failed to create redemption notification', {
        userId: user.id,
        redemptionId: result.redemption_id,
        error: notifError instanceof Error ? notifError.message : 'Unknown',
      })
    }

    return NextResponse.json(
      {
        success: true,
        redemption: {
          id: result.redemption_id,
          code: result.redemption_code,
          reward_name: result.reward_name,
          points_spent: result.points_spent,
          expires_at: result.expires_at,
          new_balance: result.new_balance,
        },
      },
      { status: 201 }
    )
  } catch (e) {
    logger.error('Error redeeming reward', {
      userId: user.id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})

/**
 * GET /api/loyalty/redeem
 * Get user's redemption history
 */
export const GET = withApiAuth(async ({ user, supabase }: ApiHandlerContext) => {
  try {
    const { data: redemptions, error } = await supabase
      .from('loyalty_redemptions')
      .select(
        `
        id, points_spent, status, redemption_code, expires_at, used_at, created_at,
        reward:loyalty_rewards(id, name, description, category, value_display)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching redemptions', {
        userId: user.id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json({ data: redemptions || [] })
  } catch (e) {
    logger.error('Unexpected error fetching redemptions', {
      userId: user.id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})
