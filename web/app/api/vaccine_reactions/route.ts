import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile for tenant context
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Get optional pet_id filter
  const { searchParams } = new URL(request.url);
  const petId = searchParams.get('pet_id');

  // Build query - staff sees all clinic reactions, owners see their pets only
  let query = supabase
    .from('vaccine_reactions')
    .select(`
      *,
      pet:pets!inner(id, name, owner_id, tenant_id),
      vaccine:vaccines(id, vaccine_name)
    `);

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff: filter by clinic
    query = query.eq('pet.tenant_id', profile.clinic_id);
  } else {
    // Owner: filter by ownership
    query = query.eq('pet.owner_id', user.id);
  }

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[API] vaccine_reactions GET error:', error);
    return NextResponse.json({ error: 'Error al obtener reacciones' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { pet_id, vaccine_id, reaction_type, severity, description, occurred_at } = body;

  // Validate required fields
  if (!pet_id || !reaction_type) {
    return NextResponse.json({ error: 'pet_id y reaction_type son requeridos' }, { status: 400 });
  }

  // Verify pet access (owner or staff)
  const { data: pet } = await supabase
    .from('pets')
    .select('id, owner_id, tenant_id')
    .eq('id', pet_id)
    .single();

  if (!pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
  }

  const isOwner = pet.owner_id === user.id;
  const isStaff = ['vet', 'admin'].includes(profile.role) && pet.tenant_id === profile.clinic_id;

  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
  }

  // Insert reaction
  const { data, error } = await supabase
    .from('vaccine_reactions')
    .insert({
      pet_id,
      vaccine_id: vaccine_id || null,
      reaction_type,
      severity: severity || 'mild',
      description: description || null,
      occurred_at: occurred_at || new Date().toISOString(),
      reported_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[API] vaccine_reactions POST error:', error);
    return NextResponse.json({ error: 'Error al registrar reacción' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
  }

  // Get existing reaction with pet info
  const { data: existing } = await supabase
    .from('vaccine_reactions')
    .select('id, pet:pets!inner(owner_id, tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Reacción no encontrada' }, { status: 404 });
  }

  // Verify access
  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { owner_id: string; tenant_id: string };
  const isOwner = pet.owner_id === user.id;
  const isStaff = ['vet', 'admin'].includes(profile.role) && pet.tenant_id === profile.clinic_id;

  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: 'No tienes acceso a esta reacción' }, { status: 403 });
  }

  // Update
  const { data, error } = await supabase
    .from('vaccine_reactions')
    .update({
      reaction_type: updates.reaction_type,
      severity: updates.severity,
      description: updates.description,
      occurred_at: updates.occurred_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[API] vaccine_reactions PUT error:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only staff can delete
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede eliminar reacciones' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
  }

  // Verify reaction belongs to staff's clinic
  const { data: existing } = await supabase
    .from('vaccine_reactions')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Reacción no encontrada' }, { status: 404 });
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta reacción' }, { status: 403 });
  }

  // Delete
  const { error } = await supabase
    .from('vaccine_reactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[API] vaccine_reactions DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
