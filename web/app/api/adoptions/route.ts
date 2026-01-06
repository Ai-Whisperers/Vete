/**
 * Adoptions API
 *
 * GET /api/adoptions - List adoption listings
 * POST /api/adoptions - Create a new adoption listing
 */

import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth/api-wrapper'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

// GET /api/adoptions - List adoption listings (public for available, all for staff)
export const GET = withApiAuth(async ({ profile, supabase, request }: ApiHandlerContext) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'available'
  const species = searchParams.get('species')
  const featured = searchParams.get('featured') === 'true'
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
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
        weight_kg
      ),
      listed_by_profile:profiles!adoption_listings_listed_by_fkey (
        id,
        full_name
      ),
      applications_count:adoption_applications(count)
    `,
      { count: 'exact' }
    )
    .eq('tenant_id', profile.tenant_id)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Species filter
  if (species) {
    query = query.eq('pet.species', species)
  }

  // Featured filter
  if (featured) {
    query = query.eq('featured', true)
  }

  const { data, error, count } = await query

  if (error) {
    logger.error('Adoptions GET error', {
      tenantId: profile.tenant_id,
      error: error.message,
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json({
    listings: data || [],
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  })
})

// POST /api/adoptions - Create a new adoption listing
export const POST = withApiAuth(
  async ({ profile, supabase, request, user }: ApiHandlerContext) => {
    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const {
      pet_id,
      story,
      personality,
      requirements,
      requirements_checklist,
      adoption_fee,
      includes_vaccines,
      includes_neutering,
      includes_microchip,
      good_with_kids,
      good_with_dogs,
      good_with_cats,
      energy_level,
      special_needs,
      featured,
    } = body

    // Validate required fields
    if (!pet_id) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['pet_id'] },
      })
    }

    // Verify pet exists and belongs to tenant (or is a shelter pet)
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, tenant_id, name')
      .eq('id', pet_id)
      .single()

    if (petError || !pet) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { message: 'Mascota no encontrada' },
      })
    }

    // Check if pet is already listed
    const { data: existingListing } = await supabase
      .from('adoption_listings')
      .select('id')
      .eq('pet_id', pet_id)
      .eq('status', 'available')
      .single()

    if (existingListing) {
      return apiError('CONFLICT', HTTP_STATUS.CONFLICT, {
        details: { message: 'Esta mascota ya está en adopción' },
      })
    }

    // Create listing
    const { data, error } = await supabase
      .from('adoption_listings')
      .insert({
        tenant_id: profile.tenant_id,
        pet_id,
        story,
        personality,
        requirements,
        requirements_checklist: requirements_checklist || [],
        adoption_fee: adoption_fee ? Number(adoption_fee) : 0,
        includes_vaccines: includes_vaccines ?? true,
        includes_neutering: includes_neutering ?? true,
        includes_microchip: includes_microchip ?? true,
        good_with_kids,
        good_with_dogs,
        good_with_cats,
        energy_level,
        special_needs,
        featured: featured ?? false,
        listed_by: user.id,
      })
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
      logger.error('Adoptions POST error', {
        userId: user.id,
        tenantId: profile.tenant_id,
        petId: pet_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(data, { status: 201 })
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
