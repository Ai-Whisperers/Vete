import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/epidemiology/heatmap
 * Get disease outbreak heatmap data from materialized view
 */
export const GET = withApiAuth(async ({ request, profile, supabase }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)
  const species = searchParams.get('species')
  const tenant = searchParams.get('tenant')

  try {
    // Query the materialized view
    let query = supabase.from('mv_disease_heatmap').select('*')

    if (species && species !== 'all') {
      query = query.eq('species', species)
    }

    if (tenant) {
      query = query.eq('tenant_id', tenant)
    }

    const { data, error } = await query.order('week', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (e) {
    logger.error('Error fetching heatmap', {
      tenantId: profile.tenant_id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})
