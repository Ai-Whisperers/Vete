import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/loyalty/transactions
 * Get current user's loyalty transaction history
 */
export const GET = withApiAuth(async ({ request, user, profile, supabase }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  try {
    // Get total count
    const { count } = await supabase
      .from('loyalty_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('tenant_id', profile.tenant_id)

    // Get transactions with pagination
    const { data: transactions, error } = await supabase
      .from('loyalty_transactions')
      .select(
        `
        id,
        type,
        points,
        description,
        balance_after,
        invoice_id,
        order_id,
        created_at
      `
      )
      .eq('client_id', user.id)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('Error fetching loyalty transactions', {
        userId: user.id,
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json({
      data: transactions || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (e) {
    logger.error('Unexpected error fetching loyalty transactions', {
      userId: user.id,
      tenantId: profile.tenant_id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})
