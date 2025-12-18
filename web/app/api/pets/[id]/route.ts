import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET a single pet by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: pet, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
  }

  // Verify ownership or staff access
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const isOwner = pet.owner_id === user.id
  const isStaff = profile?.role === 'vet' || profile?.role === 'admin'
  const sameTenant = profile?.tenant_id === pet.tenant_id

  if (!isOwner && !(isStaff && sameTenant)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  return NextResponse.json(pet)
}

// PATCH update a pet
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Fetch pet to verify ownership
  const { data: pet, error: fetchError } = await supabase
    .from('pets')
    .select('owner_id, tenant_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchError || !pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
  }

  // Verify ownership or staff access
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const isOwner = pet.owner_id === user.id
  const isStaff = profile?.role === 'vet' || profile?.role === 'admin'
  const sameTenant = profile?.tenant_id === pet.tenant_id

  if (!isOwner && !(isStaff && sameTenant)) {
    return NextResponse.json({ error: 'No tienes permiso para editar esta mascota' }, { status: 403 })
  }

  // Parse body and update
  const body = await request.json()

  // Allowlist of updatable fields
  const allowedFields = [
    'name', 'species', 'breed', 'weight_kg', 'microchip_id',
    'diet_category', 'diet_notes', 'sex', 'is_neutered', 'color',
    'temperament', 'allergies', 'existing_conditions', 'photo_url',
    'birth_date', 'notes'
  ]

  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

// DELETE soft-delete a pet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Fetch pet to verify ownership
  const { data: pet, error: fetchError } = await supabase
    .from('pets')
    .select('owner_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchError || !pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
  }

  // Only owner can delete their own pet
  if (pet.owner_id !== user.id) {
    return NextResponse.json({ error: 'No tienes permiso para eliminar esta mascota' }, { status: 403 })
  }

  // Soft delete
  const { error } = await supabase
    .from('pets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
