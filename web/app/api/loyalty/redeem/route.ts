import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

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
 * Redeem a reward
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

  try {
    const body = await request.json()
    const { reward_id, pet_id } = body

    if (!reward_id) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { field: 'reward_id' },
      })
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('is_active', true)
      .single()

    if (rewardError || !reward) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    // Check validity dates
    const now = new Date()
    if (reward.valid_from && new Date(reward.valid_from) > now) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { reason: 'Esta recompensa aún no está disponible' },
      })
    }
    if (reward.valid_to && new Date(reward.valid_to) < now) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { reason: 'Esta recompensa ha expirado' },
      })
    }

    // Check stock
    if (reward.stock !== null && reward.stock <= 0) {
      return apiError('CONFLICT', HTTP_STATUS.BAD_REQUEST, {
        details: { reason: 'Esta recompensa está agotada' },
      })
    }

    // Check max per user
    if (reward.max_per_user !== null) {
      const { count } = await supabase
        .from('loyalty_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('reward_id', reward_id)
        .in('status', ['pending', 'approved', 'used'])

      if (count && count >= reward.max_per_user) {
        return apiError('QUOTA_EXCEEDED', HTTP_STATUS.BAD_REQUEST, {
          details: {
            reason: `Ya has canjeado esta recompensa el máximo de ${reward.max_per_user} veces`,
          },
        })
      }
    }

    // Get user's points balance
    const { data: transactions } = await supabase
      .from('loyalty_transactions')
      .select('points')
      .eq('pet_id', pet_id || null)

    // If no pet_id, sum all user's pets' points
    let pointsBalance = 0
    if (pet_id) {
      pointsBalance = transactions?.reduce((sum, t) => sum + t.points, 0) || 0
    } else {
      // Get all user's pets
      const { data: pets } = await supabase.from('pets').select('id').eq('owner_id', user.id)

      if (pets && pets.length > 0) {
        const petIds = pets.map((p) => p.id)
        const { data: allTxns } = await supabase
          .from('loyalty_transactions')
          .select('points')
          .in('pet_id', petIds)

        pointsBalance = allTxns?.reduce((sum, t) => sum + t.points, 0) || 0
      }
    }

    if (pointsBalance < reward.points_cost) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: {
          reason: `Puntos insuficientes. Tienes ${pointsBalance} puntos, necesitas ${reward.points_cost}`,
        },
      })
    }

    // Generate unique code
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

    // Calculate expiry (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create redemption
    const { data: redemption, error: redemptionError } = await supabase
      .from('loyalty_redemptions')
      .insert({
        tenant_id: reward.tenant_id,
        reward_id,
        user_id: user.id,
        pet_id: pet_id || null,
        points_spent: reward.points_cost,
        status: 'approved',
        redemption_code: redemptionCode,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (redemptionError) throw redemptionError

    // Deduct points from first pet or specified pet
    const targetPetId =
      pet_id ||
      (await supabase.from('pets').select('id').eq('owner_id', user.id).limit(1).single()).data?.id

    if (targetPetId) {
      const { error: txnError } = await supabase.from('loyalty_transactions').insert({
        clinic_id: reward.tenant_id,
        pet_id: targetPetId,
        points: -reward.points_cost,
        description: `Canje: ${reward.name}`,
        created_by: user.id,
      })

      if (txnError) {
        console.error('Error creating transaction:', txnError)
        // Rollback redemption
        await supabase.from('loyalty_redemptions').delete().eq('id', redemption.id)
        throw txnError
      }
    }

    // Decrement stock if applicable
    if (reward.stock !== null) {
      await supabase
        .from('loyalty_rewards')
        .update({ stock: reward.stock - 1 })
        .eq('id', reward_id)
    }

    // Create notification for user
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: '🎁 ¡Recompensa canjeada!',
      message: `Has canjeado "${reward.name}". Tu código es: ${redemptionCode}`,
      type: 'loyalty',
      data: {
        redemption_id: redemption.id,
        reward_name: reward.name,
        code: redemptionCode,
      },
    })

    return NextResponse.json(
      {
        success: true,
        redemption: {
          id: redemption.id,
          code: redemptionCode,
          reward_name: reward.name,
          points_spent: reward.points_cost,
          expires_at: expiresAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('Error redeeming reward:', e)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * GET /api/loyalty/redeem
 * Get user's redemption history
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

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

    if (error) throw error

    return NextResponse.json({ data: redemptions || [] })
  } catch (e) {
    console.error('Error fetching redemptions:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
