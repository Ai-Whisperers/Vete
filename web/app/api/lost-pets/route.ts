import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/lost-pets
 * List lost pet reports (public board)
 */
export const GET = withApiAuth(async ({ request, profile, supabase }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase.from('lost_pet_reports').select(`
      id,
      status,
      last_seen_location,
      last_seen_date,
      finder_contact,
      finder_notes,
      notes,
      created_at,
      resolved_at,
      pet:pets (
        id,
        name,
        species,
        breed,
        photo_url,
        owner:profiles (
          id,
          full_name,
          phone,
          email
        )
      ),
      reported_by_user:profiles!reported_by (
        full_name
      ),
      resolved_by_user:profiles!resolved_by (
        full_name
      )
    `)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    logger.error('Error fetching lost pet reports', {
      tenantId: profile.tenant_id,
      error: error.message,
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json({ data })
})

/**
 * PATCH /api/lost-pets
 * Update lost pet report status
 */
export const PATCH = withApiAuth(
  async ({ request, profile, supabase }: ApiHandlerContext) => {
    const { id, status } = await request.json()

    if (!id || !status) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['id', 'status'] },
      })
    }

    const { error } = await supabase
      .from('lost_pet_reports')
      .update({
        status,
        resolved_at: status === 'reunited' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) {
      logger.error('Error updating lost pet report', {
        tenantId: profile.tenant_id,
        reportId: id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return apiSuccess({ id }, 'Estado actualizado')
  },
  { roles: ['vet', 'admin'] }
)
