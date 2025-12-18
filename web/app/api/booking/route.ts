import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
  const clinicSlug = searchParams.get('clinic');
  const status = searchParams.get('status');

  // Build query based on role
  let query = supabase
    .from('appointments')
    .select(`
      *,
      pet:pets(id, name, species, owner_id),
      service:services(id, name, price)
    `);

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff sees all clinic appointments
    if (clinicSlug) {
      query = query.eq('clinic_slug', clinicSlug);
    }
  } else {
    // Owners see only their pets' appointments
    query = query.eq('pet.owner_id', user.id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('appointment_date', { ascending: true });

  if (error) {
    console.error('[API] booking GET error:', error);
    return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado. Por favor inicia sesión.' }, { status: 401 });
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

  const { clinic_slug, petId, serviceId, date, time_slot, notes } = body;

  // Validate required fields
  if (!petId || !serviceId || !date || !time_slot) {
    return NextResponse.json({ error: 'Faltan campos requeridos: petId, serviceId, date, time_slot' }, { status: 400 });
  }

  // Verify pet ownership or staff access
  const { data: pet } = await supabase
    .from('pets')
    .select('id, owner_id, tenant_id')
    .eq('id', petId)
    .single();

  if (!pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
  }

  const isOwner = pet.owner_id === user.id;
  const isStaff = ['vet', 'admin'].includes(profile.role);

  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: 'No tienes permiso para agendar citas para esta mascota' }, { status: 403 });
  }

  // Use clinic from pet's tenant if not provided
  const effectiveClinic = clinic_slug || pet.tenant_id;

  // Check for conflicting appointments
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('clinic_slug', effectiveClinic)
    .eq('appointment_date', date)
    .eq('start_time', time_slot)
    .neq('status', 'cancelled');

  if (existingAppointments && existingAppointments.length > 0) {
    return NextResponse.json({ error: 'Este horario ya está ocupado' }, { status: 409 });
  }

  // Insert appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      clinic_slug: effectiveClinic,
      pet_id: petId,
      service_id: serviceId,
      appointment_date: date,
      start_time: time_slot,
      end_time: time_slot, // TODO: Calculate based on service duration
      notes: notes || null,
      status: 'scheduled',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('[API] booking POST error:', error);
    return NextResponse.json({ error: 'Error al crear la cita' }, { status: 500 });
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

  const { id, status, date, time_slot, notes } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID de cita es requerido' }, { status: 400 });
  }

  // Get existing appointment
  const { data: existing } = await supabase
    .from('appointments')
    .select('*, pet:pets(owner_id, tenant_id)')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
  }

  // Verify access
  const pet = existing.pet as { owner_id: string; tenant_id: string };
  const isOwner = pet.owner_id === user.id;
  const isStaff = ['vet', 'admin'].includes(profile.role);

  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: 'No tienes permiso para modificar esta cita' }, { status: 403 });
  }

  // Owners can only cancel, staff can update anything
  if (!isStaff && status && status !== 'cancelled') {
    return NextResponse.json({ error: 'Solo puedes cancelar tu cita' }, { status: 403 });
  }

  // Build update object
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (date) updates.appointment_date = date;
  if (time_slot) {
    updates.start_time = time_slot;
    updates.end_time = time_slot;
  }
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[API] booking PUT error:', error);
    return NextResponse.json({ error: 'Error al actualizar la cita' }, { status: 500 });
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

  // Get user profile - only staff can hard delete
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar citas' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID de cita es requerido' }, { status: 400 });
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[API] booking DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar la cita' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
