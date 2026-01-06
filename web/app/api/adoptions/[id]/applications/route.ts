/**
 * Adoption Applications API
 *
 * GET /api/adoptions/[id]/applications - Get applications for a listing
 * POST /api/adoptions/[id]/applications - Submit an adoption application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth/api-wrapper'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

type Params = { id: string }

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/adoptions/[id]/applications - Get applications for a listing (staff only)
export const GET = withApiAuthParams(
  async ({ profile, supabase, params }: ApiHandlerContextWithParams<Params>) => {
    const { id: listingId } = params

    // Verify listing exists and belongs to tenant
    const { data: listing, error: listingError } = await supabase
      .from('adoption_listings')
      .select('id, tenant_id')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    if (listing.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    const { data, error } = await supabase
      .from('adoption_applications')
      .select(
        `
        *,
        reviewed_by_profile:profiles!adoption_applications_reviewed_by_fkey (
          id,
          full_name
        )
      `
      )
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Applications GET error', {
        listingId,
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json(data || [])
  },
  { roles: ['vet', 'admin'] }
)

// POST /api/adoptions/[id]/applications - Submit an adoption application (public)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: listingId } = await params
  const supabase = await createClient()

  let body
  try {
    body = await request.json()
  } catch {
    return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
  }

  const {
    applicant_name,
    applicant_email,
    applicant_phone,
    living_situation,
    has_yard,
    yard_fenced,
    own_or_rent,
    landlord_allows_pets,
    household_members,
    has_children,
    children_ages,
    other_pets,
    allergies,
    pet_experience,
    veterinarian_info,
    reason_for_adoption,
    who_will_care,
    hours_alone,
    exercise_plan,
    emergency_plan,
  } = body

  // Validate required fields
  if (!applicant_name || !applicant_email || !applicant_phone || !living_situation || !reason_for_adoption) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: {
        required: ['applicant_name', 'applicant_email', 'applicant_phone', 'living_situation', 'reason_for_adoption'],
      },
    })
  }

  // Verify listing exists and is available
  const { data: listing, error: listingError } = await supabase
    .from('adoption_listings')
    .select('id, status, tenant_id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  if (listing.status !== 'available') {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Esta mascota ya no está disponible para adopción' },
    })
  }

  // Check if applicant already applied
  const { data: existingApp } = await supabase
    .from('adoption_applications')
    .select('id')
    .eq('listing_id', listingId)
    .eq('applicant_email', applicant_email)
    .not('status', 'in', '("rejected","withdrawn")')
    .single()

  if (existingApp) {
    return apiError('CONFLICT', HTTP_STATUS.CONFLICT, {
      details: { message: 'Ya tienes una solicitud pendiente para esta mascota' },
    })
  }

  // Get current user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create application
  const { data, error } = await supabase
    .from('adoption_applications')
    .insert({
      listing_id: listingId,
      tenant_id: listing.tenant_id,
      applicant_id: user?.id || null,
      applicant_name,
      applicant_email,
      applicant_phone,
      living_situation,
      has_yard: has_yard ?? false,
      yard_fenced: yard_fenced ?? false,
      own_or_rent,
      landlord_allows_pets,
      household_members: household_members ? Number(household_members) : 1,
      has_children: has_children ?? false,
      children_ages,
      other_pets,
      allergies,
      pet_experience,
      veterinarian_info,
      reason_for_adoption,
      who_will_care,
      hours_alone: hours_alone ? Number(hours_alone) : null,
      exercise_plan,
      emergency_plan,
    })
    .select()
    .single()

  if (error) {
    logger.error('Application POST error', {
      listingId,
      email: applicant_email,
      error: error.message,
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json(data, { status: 201 })
}
