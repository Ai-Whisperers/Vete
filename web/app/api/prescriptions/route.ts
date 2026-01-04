import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  const { searchParams } = new URL(request.url)
  const petId = searchParams.get('pet_id')

  // Build query based on role
  let query = supabase
    .from('prescriptions')
    .select(
      `
      *,
      pet:pets!inner(id, name, owner_id, tenant_id),
      vet:profiles!vet_id(id, full_name)
    `
    )
    .order('created_at', { ascending: false })

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff sees all clinic prescriptions
    query = query.eq('pet.tenant_id', profile.clinic_id)
  } else {
    // Owners see only their pets' prescriptions
    query = query.eq('pet.owner_id', user.id)
  }

  if (petId) {
    query = query.eq('pet_id', petId)
  }

  const { data, error } = await query

  if (error) {
    logger.error('Prescriptions GET error', {
      userId: user.id,
      tenantId: profile.clinic_id,
      petId,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Apply rate limiting for write endpoints (20 requests per minute)
  const { rateLimit } = await import('@/lib/rate-limit')
  const rateLimitResult = await rateLimit(request, 'write', user.id)
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }

  // Get user profile - only vets/admins can create prescriptions
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
  }

  const { pet_id, drugs, notes, signature_hash, qr_code_url } = body

  // Validate required fields
  if (!pet_id || !drugs || drugs.length === 0) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { required: ['pet_id', 'drugs'] },
    })
  }

  // Verify pet belongs to staff's clinic
  const { data: pet } = await supabase
    .from('pets')
    .select('id, tenant_id')
    .eq('id', pet_id)
    .single()

  if (!pet) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  if (pet.tenant_id !== profile.clinic_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // Insert prescription with authenticated vet
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      pet_id,
      vet_id: user.id, // Use authenticated user, not body param
      drugs,
      notes: notes || null,
      digital_signature_hash: signature_hash || null,
      qr_code_url: qr_code_url || null,
    })
    .select()
    .single()

  if (error) {
    logger.error('Prescriptions POST error', {
      userId: user.id,
      tenantId: profile.clinic_id,
      petId: pet_id,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Apply rate limiting for write endpoints (20 requests per minute)
  const { rateLimit } = await import('@/lib/rate-limit')
  const rateLimitResult = await rateLimit(request, 'write', user.id)
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }

  // Get user profile - only vets/admins can update
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
  }

  const { id, drugs, notes, status } = body

  if (!id) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { required: ['id'] } })
  }

  // Verify prescription belongs to staff's clinic
  const { data: existing } = await supabase
    .from('prescriptions')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', id)
    .single()

  if (!existing) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet
  const pet = petData as { tenant_id: string }
  if (pet.tenant_id !== profile.clinic_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // Build update
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (drugs) updates.drugs = drugs
  if (notes !== undefined) updates.notes = notes
  if (status) updates.status = status

  const { data, error } = await supabase
    .from('prescriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error('Prescriptions PUT error', {
      userId: user.id,
      tenantId: profile.clinic_id,
      prescriptionId: id,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Only admins can delete prescriptions
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { required: ['id'] } })
  }

  // Verify prescription belongs to admin's clinic
  const { data: existing } = await supabase
    .from('prescriptions')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', id)
    .single()

  if (!existing) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet
  const pet = petData as { tenant_id: string }
  if (pet.tenant_id !== profile.clinic_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  const { error } = await supabase.from('prescriptions').delete().eq('id', id)

  if (error) {
    logger.error('Prescriptions DELETE error', {
      userId: user.id,
      tenantId: profile.clinic_id,
      prescriptionId: id,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return new NextResponse(null, { status: 204 })
}
