import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/clients/[id]/loyalty
 * Get loyalty points and transactions for a client
 */
export const GET = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const clientId = params.id
    const { searchParams } = new URL(request.url)
    const clinic = searchParams.get('clinic') || profile.tenant_id

    try {
      // Get loyalty points balance
      const { data: loyalty } = await supabase
        .from('loyalty_points')
        .select('balance, lifetime_earned')
        .eq('user_id', clientId)
        .eq('tenant_id', clinic)
        .single()

      // Get recent transactions
      const { data: transactions } = await supabase
        .from('loyalty_transactions')
        .select('id, points, description, type, created_at')
        .eq('user_id', clientId)
        .eq('clinic_id', clinic)
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({
        balance: loyalty?.balance || 0,
        lifetime_earned: loyalty?.lifetime_earned || 0,
        transactions: transactions || [],
      })
    } catch (e) {
      logger.error('Error fetching client loyalty data', {
        tenantId: profile.tenant_id,
        clientId,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }
)

/**
 * POST /api/clients/[id]/loyalty
 * Add or deduct loyalty points (staff only)
 */
export const POST = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const clientId = params.id

    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const { points, description, type } = body

    if (points === undefined) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['points'] },
      })
    }

    try {
      // Get or create loyalty record
      const { data: existing } = await supabase
        .from('loyalty_points')
        .select('id, balance, lifetime_earned')
        .eq('user_id', clientId)
        .eq('tenant_id', profile.tenant_id)
        .single()

      const currentBalance = existing?.balance || 0
      const currentLifetime = existing?.lifetime_earned || 0
      const newBalance = currentBalance + points

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('loyalty_points')
          .update({
            balance: newBalance,
            lifetime_earned: points > 0 ? currentLifetime + points : currentLifetime,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (updateError) throw updateError
      } else {
        // Create new record
        const { error: insertError } = await supabase.from('loyalty_points').insert({
          user_id: clientId,
          tenant_id: profile.tenant_id,
          balance: points,
          lifetime_earned: points > 0 ? points : 0,
        })

        if (insertError) throw insertError
      }

      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
          clinic_id: profile.tenant_id,
          user_id: clientId,
          points,
          description: description || (points > 0 ? 'Puntos agregados' : 'Puntos canjeados'),
          type: type || (points > 0 ? 'earned' : 'redeemed'),
          created_by: user.id,
        })
        .select()
        .single()

      if (txError) throw txError

      return NextResponse.json({
        newBalance,
        transaction,
      })
    } catch (e) {
      logger.error('Error updating client loyalty points', {
        tenantId: profile.tenant_id,
        clientId,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
