import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient()
  const { id } = await params

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
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'profile' },
    })
  }

  // Get consent document with all relations
  const { data, error } = await supabase
    .from('consent_documents')
    .select(
      `
      *,
      pet:pets!inner(id, name, owner_id, tenant_id, species, breed),
      owner:profiles!owner_id(id, full_name, email, phone),
      template:consent_templates!template_id(id, name, category, content, requires_witness, can_be_revoked),
      signed_by_user:profiles!signed_by_id(id, full_name),
      audit_log:consent_audit_log(id, action, performed_by_id, created_at, details, performed_by:profiles!performed_by_id(id, full_name))
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('[API] consent GET error:', error)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!data) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'consent' },
    })
  }

  // Authorization check
  const petData = Array.isArray(data.pet) ? data.pet[0] : data.pet
  const pet = petData as { tenant_id: string; owner_id: string }

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff can only see consents from their clinic
    if (pet.tenant_id !== profile.clinic_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }
  } else {
    // Owners can only see their own consents
    if (data.owner_id !== user.id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient()
  const { id } = await params

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
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'profile' },
    })
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
  }

  const { action, reason } = body

  if (action !== 'revoke') {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'Invalid action' },
    })
  }

  // Get existing consent
  const { data: existing } = await supabase
    .from('consent_documents')
    .select(
      `
      id,
      status,
      can_be_revoked,
      owner_id,
      pet:pets!inner(tenant_id)
    `
    )
    .eq('id', id)
    .single()

  if (!existing) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'consent' },
    })
  }

  // Authorization check
  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet
  const pet = petData as { tenant_id: string }

  const isStaff = ['vet', 'admin'].includes(profile.role)
  const isOwner = existing.owner_id === user.id

  if (isStaff) {
    if (pet.tenant_id !== profile.clinic_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }
  } else if (!isOwner) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // Check if can be revoked
  if (!existing.can_be_revoked) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { message: 'This consent cannot be revoked' },
    })
  }

  if (existing.status === 'revoked') {
    return apiError('CONFLICT', HTTP_STATUS.CONFLICT, {
      details: { message: 'Consent already revoked' },
    })
  }

  // Update consent document
  const { data, error } = await supabase
    .from('consent_documents')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by_id: user.id,
      revocation_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[API] consent PATCH error:', error)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  // Create audit log entry
  await supabase.from('consent_audit_log').insert({
    consent_id: id,
    action: 'revoked',
    performed_by_id: user.id,
    details: { reason: reason || 'No especificado' },
  })

  return NextResponse.json(data)
}
