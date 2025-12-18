import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get('pet_id');

  // Build query based on role
  let query = supabase
    .from('reproductive_cycles')
    .select(`
      *,
      pet:pets!inner(id, name, owner_id, tenant_id)
    `)
    .order('created_at', { ascending: false });

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff sees all clinic data
    query = query.eq('pet.tenant_id', profile.clinic_id);
  } else {
    // Owners see only their pets
    query = query.eq('pet.owner_id', user.id);
  }

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] reproductive_cycles GET error:', error);
    return NextResponse.json({ error: 'Error al obtener ciclos' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only staff can create reproductive cycles
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal veterinario puede registrar ciclos reproductivos' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { pet_id, ...cycleData } = body;

  if (!pet_id) {
    return NextResponse.json({ error: 'pet_id es requerido' }, { status: 400 });
  }

  // Verify pet belongs to staff's clinic
  const { data: pet } = await supabase
    .from('pets')
    .select('id, tenant_id')
    .eq('id', pet_id)
    .single();

  if (!pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
  }

  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('reproductive_cycles')
    .insert({
      pet_id,
      ...cycleData,
      recorded_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('[API] reproductive_cycles POST error:', error);
    return NextResponse.json({ error: 'Error al crear ciclo' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only staff can update
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal veterinario puede modificar ciclos' }, { status: 403 });
  }

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

  // Verify cycle belongs to staff's clinic
  const { data: existing } = await supabase
    .from('reproductive_cycles')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Ciclo no encontrado' }, { status: 404 });
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a este ciclo' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('reproductive_cycles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[API] reproductive_cycles PUT error:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Only admins can delete
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar ciclos' }, { status: 403 });
  }

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

  // Verify belongs to admin's clinic
  const { data: existing } = await supabase
    .from('reproductive_cycles')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Ciclo no encontrado' }, { status: 404 });
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a este ciclo' }, { status: 403 });
  }

  const { error } = await supabase
    .from('reproductive_cycles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[API] reproductive_cycles DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
