import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'userId' } })
  }

  const supabase = await createClient()

  // Get user's tenant_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single()

  if (!profile) {
    // User has no profile yet - return 0 points
    return NextResponse.json({ points: 0, tier: null }, { status: 200 })
  }

  // Query loyalty_points with correct column names: balance (not points), client_id (not profile_id)
  const { data, error } = await supabase
    .from('loyalty_points')
    .select('balance, tier, lifetime_earned, lifetime_redeemed')
    .eq('client_id', userId)
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle()

  if (error) {
    logger.error('Error fetching loyalty points', {
      userId,
      tenantId: profile.tenant_id,
      error: error.message,
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json(
    {
      points: data?.balance || 0,
      tier: data?.tier || null,
      lifetime_earned: data?.lifetime_earned || 0,
      lifetime_redeemed: data?.lifetime_redeemed || 0,
    },
    { status: 200 }
  )
}
