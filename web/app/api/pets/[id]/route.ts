import { NextResponse } from 'next/server'
import { withAuth, type AuthContext, type RouteContext } from '@/lib/api/with-auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

type Params = { id: string }

// GET a single pet by ID
export const GET = withAuth<Params>(async ({ user, profile, supabase }: AuthContext, context: RouteContext<Params>) => {
  const { id } = await context.params

  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !pet) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  // Verify ownership or staff access
  const isOwner = pet.owner_id === user.id
  const isStaff = (profile.role === 'vet' || profile.role === 'admin') && profile.tenant_id === pet.tenant_id

  if (!isOwner && !isStaff) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  return NextResponse.json(pet)
})

// PATCH update a pet
export const PATCH = withAuth<Params>(async ({ request, user, profile, supabase }: AuthContext, context: RouteContext<Params>) => {
  const { id } = await context.params

  // Fetch pet to verify ownership
  const { data: pet, error: fetchError } = await supabase
    .from('pets')
    .select('owner_id, tenant_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchError || !pet) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  // Verify ownership or staff access
  const isOwner = pet.owner_id === user.id
  const isStaff = (profile.role === 'vet' || profile.role === 'admin') && profile.tenant_id === pet.tenant_id

  if (!isOwner && !isStaff) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // Parse body and update
  const body = await request.json()

  // Allowlist of updatable fields (form names -> database column names)
  const fieldMapping: Record<string, string> = {
    'name': 'name',
    'species': 'species',
    'breed': 'breed',
    'weight_kg': 'weight_kg',
    'microchip_id': 'microchip_number',  // Form uses microchip_id, DB uses microchip_number
    'diet_category': 'diet_category',
    'diet_notes': 'diet_notes',
    'sex': 'sex',
    'is_neutered': 'is_neutered',
    'color': 'color',
    'temperament': 'temperament',
    'allergies': 'allergies',
    'existing_conditions': 'chronic_conditions',  // Form uses existing_conditions, DB uses chronic_conditions
    'photo_url': 'photo_url',
    'birth_date': 'birth_date',
    'notes': 'notes'
  }

  const updates: Record<string, unknown> = {}
  for (const [formField, dbColumn] of Object.entries(fieldMapping)) {
    if (formField in body) {
      let value = body[formField]

      // Convert allergies string to array if needed
      if (dbColumn === 'allergies' && typeof value === 'string') {
        value = value ? value.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0) : []
      }

      // Convert existing_conditions to array for chronic_conditions
      if (dbColumn === 'chronic_conditions' && typeof value === 'string') {
        value = value ? [value] : []
      }

      updates[dbColumn] = value
    }
  }

  if (Object.keys(updates).length === 0) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { reason: 'No hay campos para actualizar' } })
  }

  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return apiError('DATABASE_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { message: error.message } })
  }

  return NextResponse.json(data)
})

// DELETE soft-delete a pet
export const DELETE = withAuth<Params>(async ({ user, supabase }: AuthContext, context: RouteContext<Params>) => {
  const { id } = await context.params

  // Fetch pet to verify ownership
  const { data: pet, error: fetchError } = await supabase
    .from('pets')
    .select('owner_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchError || !pet) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
  }

  // Only owner can delete their own pet
  if (pet.owner_id !== user.id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // Soft delete
  const { error } = await supabase
    .from('pets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return apiError('DATABASE_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { message: error.message } })
  }

  return NextResponse.json({ success: true })
})
