import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/lab-catalog
 * Fetch lab test catalog and panels
 * Staff only
 */
export const GET = withApiAuth(
  async ({ request, profile, supabase }: ApiHandlerContext) => {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('include_inactive') === 'true'

    // Build query for test catalog
    let query = supabase.from('lab_test_catalog').select('*').order('category').order('name')

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: tests, error: testsError } = await query

    if (testsError) {
      logger.error('Error fetching lab test catalog', {
        tenantId: profile.tenant_id,
        error: testsError.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Fetch panels
    let panelsQuery = supabase
      .from('lab_test_panels')
      .select(
        `
        id,
        name,
        description,
        category,
        lab_test_panel_items(
          test_id,
          lab_test_catalog(id, code, name)
        )
      `
      )
      .order('category')
      .order('name')

    if (!includeInactive) {
      panelsQuery = panelsQuery.eq('active', true)
    }

    if (category) {
      panelsQuery = panelsQuery.eq('category', category)
    }

    const { data: panels, error: panelsError } = await panelsQuery

    if (panelsError) {
      logger.error('Error fetching lab test panels', {
        tenantId: profile.tenant_id,
        error: panelsError.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json({ tests, panels })
  },
  { roles: ['vet', 'admin'] }
)
