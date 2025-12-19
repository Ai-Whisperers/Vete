import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';

export const GET = withAuth(async ({ request, profile, supabase }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const kennelId = searchParams.get('kennel_id');
  const petId = searchParams.get('pet_id');

  // Build query
  let query = supabase
    .from('hospitalizations')
    .select(`
      *,
      pet:pets!inner(id, name, species, breed, owner_id, profiles!pets_owner_id_fkey(full_name, phone)),
      kennel:kennels(id, kennel_number, kennel_type, location),
      admitted_by:profiles!hospitalizations_admitted_by_fkey(full_name),
      discharged_by:profiles!hospitalizations_discharged_by_fkey(full_name)
    `)
    .eq('pet.tenant_id', profile.tenant_id)
    .order('admission_date', { ascending: false });

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  if (kennelId) {
    query = query.eq('kennel_id', kennelId);
  }
  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] hospitalizations GET error:', error);
    return NextResponse.json({ error: 'Error al obtener hospitalizaciones' }, { status: 500 });
  }

  return NextResponse.json(data);
}, { roles: ['vet', 'admin'] });

export const POST = withAuth(async ({ request, user, profile, supabase }) => {
  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    pet_id,
    kennel_id,
    hospitalization_type,
    admission_diagnosis,
    treatment_plan,
    diet_instructions,
    acuity_level,
    estimated_discharge_date,
    emergency_contact_name,
    emergency_contact_phone
  } = body;

  // Validate required fields
  if (!pet_id || !kennel_id || !hospitalization_type || !admission_diagnosis) {
    return NextResponse.json({
      error: 'pet_id, kennel_id, hospitalization_type y admission_diagnosis son requeridos'
    }, { status: 400 });
  }

  // Verify pet belongs to staff's clinic
  const { data: pet } = await supabase
    .from('pets')
    .select('id, tenant_id, name')
    .eq('id', pet_id)
    .single();

  if (!pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
  }

  if (pet.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
  }

  // Verify kennel is available
  const { data: kennel } = await supabase
    .from('kennels')
    .select('id, kennel_status, tenant_id')
    .eq('id', kennel_id)
    .single();

  if (!kennel) {
    return NextResponse.json({ error: 'Jaula no encontrada' }, { status: 404 });
  }

  if (kennel.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta jaula' }, { status: 403 });
  }

  if (kennel.kennel_status !== 'available') {
    return NextResponse.json({ error: 'La jaula no está disponible' }, { status: 400 });
  }

  // Generate hospitalization number
  const { data: lastHospitalization } = await supabase
    .from('hospitalizations')
    .select('hospitalization_number')
    .like('hospitalization_number', `H-${new Date().getFullYear()}-%`)
    .order('hospitalization_number', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (lastHospitalization?.hospitalization_number) {
    const match = lastHospitalization.hospitalization_number.match(/H-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const hospitalizationNumber = `H-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

  // Insert hospitalization
  const { data: hospitalization, error: hospError } = await supabase
    .from('hospitalizations')
    .insert({
      hospitalization_number: hospitalizationNumber,
      pet_id,
      kennel_id,
      hospitalization_type,
      admission_date: new Date().toISOString(),
      admission_diagnosis,
      treatment_plan: treatment_plan || null,
      diet_instructions: diet_instructions || null,
      acuity_level: acuity_level || 'routine',
      status: 'active',
      estimated_discharge_date: estimated_discharge_date || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      admitted_by: user.id,
    })
    .select(`
      *,
      pet:pets(id, name, species, breed),
      kennel:kennels(id, kennel_number, kennel_type, location)
    `)
    .single();

  if (hospError) {
    console.error('[API] hospitalizations POST error:', hospError);
    return NextResponse.json({ error: 'Error al crear hospitalización' }, { status: 500 });
  }

  // Update kennel status to occupied
  await supabase
    .from('kennels')
    .update({ kennel_status: 'occupied' })
    .eq('id', kennel_id);

  return NextResponse.json(hospitalization, { status: 201 });
}, { roles: ['vet', 'admin'] });

export const PATCH = withAuth(async ({ request, user, profile, supabase }) => {
  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    id,
    status,
    treatment_plan,
    diet_instructions,
    discharge_notes,
    discharge_instructions,
    acuity_level
  } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
  }

  // Verify hospitalization belongs to staff's clinic
  const { data: existing } = await supabase
    .from('hospitalizations')
    .select(`
      id,
      kennel_id,
      pet:pets!inner(tenant_id)
    `)
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Hospitalización no encontrada' }, { status: 404 });
  }

  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.tenant_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta hospitalización' }, { status: 403 });
  }

  // Build update
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (treatment_plan !== undefined) updates.treatment_plan = treatment_plan;
  if (diet_instructions !== undefined) updates.diet_instructions = diet_instructions;
  if (acuity_level !== undefined) updates.acuity_level = acuity_level;

  if (status) {
    updates.status = status;
    if (status === 'discharged') {
      updates.discharge_date = new Date().toISOString();
      updates.discharged_by = user.id;
      if (discharge_notes) updates.discharge_notes = discharge_notes;
      if (discharge_instructions) updates.discharge_instructions = discharge_instructions;

      // Free up the kennel
      if (existing.kennel_id) {
        await supabase
          .from('kennels')
          .update({ kennel_status: 'available' })
          .eq('id', existing.kennel_id);
      }
    }
  }

  const { data, error } = await supabase
    .from('hospitalizations')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      pet:pets(id, name, species, breed),
      kennel:kennels(id, kennel_number, kennel_type, location)
    `)
    .single();

  if (error) {
    console.error('[API] hospitalizations PATCH error:', error);
    return NextResponse.json({ error: 'Error al actualizar hospitalización' }, { status: 500 });
  }

  return NextResponse.json(data);
}, { roles: ['vet', 'admin'] });
