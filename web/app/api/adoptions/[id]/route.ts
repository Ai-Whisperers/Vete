/**
 * Adoptions API - Single Listing
 *
 * GET /api/adoptions/[id] - Get a single adoption listing
 * PUT /api/adoptions/[id] - Update an adoption listing
 * DELETE /api/adoptions/[id] - Remove an adoption listing
 */

import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth/api-wrapper'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

type Params = { id: string }

// GET /api/adoptions/[id] - Get a single adoption listing with full details
export const GET = withApiAuthParams<Params>(async ({ profile, supabase, params }: ApiHandlerContextWithParams<Params>) => {
  const { id } = params

  const { data, error } = await supabase
    .from('adoption_listings')
    .select(
      `
      *,
      pet:pets!inner (
        id,
        name,
        species,
        breed,
        sex,
        birth_date,
        color,
        photo_url,
        photos,
        weight_kg,
        allergies,
        chronic_conditions,
        notes
      ),
      listed_by_profile:profiles!adoption_listings_listed_by_fkey (
        id,
        full_name
      ),
      applications:adoption_applications (
        id,
        applicant_name,
        applicant_email,
        applicant_phone,
        living_situation,
        status,
        created_at
      )
    `
    )
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }
    logger.error('Adoption GET error', {
      listingId: id,
      tenantId: profile.tenant_id,
      error: error.message,
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  // Increment view count (fire and forget)
  supabase
    .from('adoption_listings')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', id)
    .then(() => {})

  return NextResponse.json(data)
})

// PUT /api/adoptions/[id] - Update an adoption listing
export const PUT = withApiAuthParams<Params>(
  async ({ profile, supabase, request, user, params }: ApiHandlerContextWithParams<Params>) => {
    const { id } = params

    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    // Verify listing exists
    const { data: existing, error: fetchError } = await supabase
      .from('adoption_listings')
      .select('id, tenant_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    if (existing.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Build update object
    const allowedFields = [
      'status',
      'story',
      'personality',
      'requirements',
      'requirements_checklist',
      'adoption_fee',
      'includes_vaccines',
      'includes_neutering',
      'includes_microchip',
      'good_with_kids',
      'good_with_dogs',
      'good_with_cats',
      'energy_level',
      'special_needs',
      'featured',
    ]

    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'adoption_fee') {
          updates[field] = Number(body[field])
        } else {
          updates[field] = body[field]
        }
      }
    }

    const { data, error } = await supabase
      .from('adoption_listings')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        pet:pets (
          id,
          name,
          species,
          breed,
          photo_url
        )
      `
      )
      .single()

    if (error) {
      logger.error('Adoption PUT error', {
        listingId: id,
        userId: user.id,
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(data)
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)

// DELETE /api/adoptions/[id] - Remove an adoption listing
export const DELETE = withApiAuthParams<Params>(
  async ({ profile, supabase, user, params }: ApiHandlerContextWithParams<Params>) => {
    const { id } = params

    // Verify listing exists
    const { data: existing, error: fetchError } = await supabase
      .from('adoption_listings')
      .select('id, tenant_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    if (existing.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Don't delete if already adopted - mark as withdrawn instead
    if (existing.status === 'adopted') {
      return apiError('CONFLICT', HTTP_STATUS.CONFLICT, {
        details: { message: 'No se puede eliminar un listado de mascota ya adoptada' },
      })
    }

    // Soft delete by changing status to withdrawn
    const { error } = await supabase.from('adoption_listings').update({ status: 'withdrawn' }).eq('id', id)

    if (error) {
      logger.error('Adoption DELETE error', {
        listingId: id,
        userId: user.id,
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return new NextResponse(null, { status: 204 })
  },
  { roles: ['vet', 'admin'] }
)
