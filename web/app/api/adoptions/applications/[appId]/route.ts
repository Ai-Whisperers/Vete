/**
 * Adoption Application Management API
 *
 * GET /api/adoptions/applications/[appId] - Get a single application
 * PUT /api/adoptions/applications/[appId] - Update application status
 */

import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth/api-wrapper'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

type Params = { appId: string }

// GET /api/adoptions/applications/[appId] - Get a single application with full details
export const GET = withApiAuthParams<Params>(
  async ({ profile, supabase, params }: ApiHandlerContextWithParams<Params>) => {
    const { appId } = params

    const { data, error } = await supabase
      .from('adoption_applications')
      .select(
        `
        *,
        listing:adoption_listings!inner (
          id,
          tenant_id,
          status,
          pet:pets (
            id,
            name,
            species,
            breed,
            photo_url
          )
        ),
        reviewed_by_profile:profiles!adoption_applications_reviewed_by_fkey (
          id,
          full_name
        )
      `
      )
      .eq('id', appId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
      }
      logger.error('Application GET error', {
        appId,
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Verify tenant access
    if (data.listing.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    return NextResponse.json(data)
  },
  { roles: ['vet', 'admin'] }
)

// PUT /api/adoptions/applications/[appId] - Update application status
export const PUT = withApiAuthParams<Params>(
  async ({ profile, supabase, request, user, params }: ApiHandlerContextWithParams<Params>) => {
    const { appId } = params

    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    // Verify application exists and belongs to tenant
    const { data: existing, error: fetchError } = await supabase
      .from('adoption_applications')
      .select(
        `
        id,
        listing:adoption_listings!inner (
          id,
          tenant_id,
          pet_id
        )
      `
      )
      .eq('id', appId)
      .single()

    if (fetchError || !existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    const listing = Array.isArray(existing.listing) ? existing.listing[0] : existing.listing

    if (!listing || listing.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Build update object
    const allowedFields = [
      'status',
      'status_reason',
      'interview_scheduled_at',
      'interview_notes',
      'requirements_met',
    ]

    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Track review metadata
    if (body.status && body.status !== 'pending') {
      updates.reviewed_by = user.id
      updates.reviewed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('adoption_applications')
      .update(updates)
      .eq('id', appId)
      .select()
      .single()

    if (error) {
      logger.error('Application PUT error', {
        appId,
        userId: user.id,
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // If approved, update listing status to pending
    if (body.status === 'approved') {
      await supabase.from('adoption_listings').update({ status: 'pending' }).eq('id', listing.id)
    }

    return NextResponse.json(data)
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
