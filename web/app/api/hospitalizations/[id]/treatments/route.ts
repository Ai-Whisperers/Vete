import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient();
  const { id: hospitalizationId } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only vets/admins can add treatments
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden agregar tratamientos' }, { status: 403 });
  }

  // Verify hospitalization exists and belongs to clinic
  const { data: hospitalization } = await supabase
    .from('hospitalizations')
    .select('id, pet:pets!inner(tenant_id)')
    .eq('id', hospitalizationId)
    .single();

  if (!hospitalization) {
    return NextResponse.json({ error: 'Hospitalización no encontrada' }, { status: 404 });
  }

  const petData = Array.isArray(hospitalization.pet) ? hospitalization.pet[0] : hospitalization.pet;
  const pet = petData as { tenant_id: string };
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta hospitalización' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    treatment_type,
    medication_name,
    dosage,
    route,
    frequency,
    scheduled_time,
    notes
  } = body;

  // Validate required fields
  if (!treatment_type || !scheduled_time) {
    return NextResponse.json({
      error: 'treatment_type y scheduled_time son requeridos'
    }, { status: 400 });
  }

  // Insert treatment
  const { data, error } = await supabase
    .from('hospitalization_treatments')
    .insert({
      hospitalization_id: hospitalizationId,
      treatment_type,
      medication_name: medication_name || null,
      dosage: dosage || null,
      route: route || null,
      frequency: frequency || null,
      scheduled_time,
      status: 'scheduled',
      notes: notes || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[API] treatments POST error:', error);
    return NextResponse.json({ error: 'Error al agregar tratamiento' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const supabase = await createClient();
  const { id: hospitalizationId } = await params;

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only vets/admins can update treatments
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden actualizar tratamientos' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { treatment_id, status, notes } = body;

  if (!treatment_id) {
    return NextResponse.json({ error: 'treatment_id es requerido' }, { status: 400 });
  }

  // Verify treatment belongs to staff's clinic
  const { data: treatment } = await supabase
    .from('hospitalization_treatments')
    .select(`
      id,
      hospitalization:hospitalizations!inner(
        pet:pets!inner(tenant_id)
      )
    `)
    .eq('id', treatment_id)
    .single();

  if (!treatment) {
    return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 });
  }

  // Build update
  const updates: Record<string, unknown> = {};
  if (status) {
    updates.status = status;
    if (status === 'administered') {
      updates.administered_at = new Date().toISOString();
      updates.administered_by_id = user.id;
    }
  }
  if (notes !== undefined) {
    updates.notes = notes;
  }

  const { data, error } = await supabase
    .from('hospitalization_treatments')
    .update(updates)
    .eq('id', treatment_id)
    .select(`
      *,
      administered_by:profiles!hospitalization_treatments_administered_by_id_fkey(full_name)
    `)
    .single();

  if (error) {
    console.error('[API] treatments PATCH error:', error);
    return NextResponse.json({ error: 'Error al actualizar tratamiento' }, { status: 500 });
  }

  return NextResponse.json(data);
}
