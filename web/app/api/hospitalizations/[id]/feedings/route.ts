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

  // Get user profile - only vets/admins can record feedings
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden registrar alimentación' }, { status: 403 });
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
    food_type,
    amount_offered,
    amount_consumed,
    appetite_level,
    notes
  } = body;

  // Validate required fields
  if (!food_type || amount_offered === undefined) {
    return NextResponse.json({
      error: 'food_type y amount_offered son requeridos'
    }, { status: 400 });
  }

  // Insert feeding
  const { data, error } = await supabase
    .from('hospitalization_feedings')
    .insert({
      hospitalization_id: hospitalizationId,
      feeding_time: new Date().toISOString(),
      food_type,
      amount_offered,
      amount_consumed: amount_consumed || 0,
      appetite_level: appetite_level || 'normal',
      notes: notes || null,
      fed_by: user.id,
    })
    .select(`
      *,
      fed_by:profiles!hospitalization_feedings_fed_by_fkey(full_name)
    `)
    .single();

  if (error) {
    console.error('[API] feedings POST error:', error);
    return NextResponse.json({ error: 'Error al registrar alimentación' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
