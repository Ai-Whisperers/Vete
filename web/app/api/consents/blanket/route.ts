import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
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
  const ownerId = searchParams.get('owner_id');

  // Build query
  let query = supabase
    .from('blanket_consents')
    .select(`
      *,
      pet:pets!pet_id(id, name, owner_id, tenant_id),
      owner:profiles!owner_id(id, full_name, email),
      granted_by:profiles!granted_by_id(id, full_name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff sees all clinic blanket consents
    query = query.eq('pet.tenant_id', profile.clinic_id);
  } else {
    // Owners see only their own blanket consents
    query = query.eq('owner_id', user.id);
  }

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] blanket consents GET error:', error);
    return NextResponse.json({ error: 'Error al obtener consentimientos permanentes' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal autorizado puede crear consentimientos permanentes' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    pet_id,
    owner_id,
    consent_type,
    scope,
    conditions,
    signature_data,
    expires_at
  } = body;

  // Validate required fields
  if (!pet_id || !owner_id || !consent_type || !scope || !signature_data) {
    return NextResponse.json({
      error: 'pet_id, owner_id, consent_type, scope y signature_data son requeridos'
    }, { status: 400 });
  }

  // Verify pet belongs to staff's clinic
  const { data: pet } = await supabase
    .from('pets')
    .select('id, tenant_id, owner_id')
    .eq('id', pet_id)
    .single();

  if (!pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
  }

  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
  }

  // Verify owner
  if (pet.owner_id !== owner_id) {
    return NextResponse.json({ error: 'El dueño no coincide con la mascota' }, { status: 400 });
  }

  // Insert blanket consent
  const { data, error } = await supabase
    .from('blanket_consents')
    .insert({
      pet_id,
      owner_id,
      consent_type,
      scope,
      conditions: conditions || null,
      signature_data,
      granted_by_id: user.id,
      granted_at: new Date().toISOString(),
      expires_at: expires_at || null,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('[API] blanket consents POST error:', error);
    return NextResponse.json({ error: 'Error al crear consentimiento permanente' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
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

  const { id, action, reason } = body;

  if (!id || action !== 'revoke') {
    return NextResponse.json({ error: 'id y action=revoke son requeridos' }, { status: 400 });
  }

  // Get existing blanket consent
  const { data: existing } = await supabase
    .from('blanket_consents')
    .select(`
      id,
      owner_id,
      is_active,
      pet:pets!inner(tenant_id)
    `)
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Consentimiento permanente no encontrado' }, { status: 404 });
  }

  // Authorization check
  const petData = Array.isArray(existing.pet) ? existing.pet[0] : existing.pet;
  const pet = petData as { tenant_id: string };

  const isStaff = ['vet', 'admin'].includes(profile.role);
  const isOwner = existing.owner_id === user.id;

  if (isStaff) {
    if (pet.tenant_id !== profile.clinic_id) {
      return NextResponse.json({ error: 'No tienes acceso a este consentimiento' }, { status: 403 });
    }
  } else if (!isOwner) {
    return NextResponse.json({ error: 'No tienes acceso a este consentimiento' }, { status: 403 });
  }

  // Update blanket consent
  const { data, error } = await supabase
    .from('blanket_consents')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by_id: user.id,
      revocation_reason: reason || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[API] blanket consents PATCH error:', error);
    return NextResponse.json({ error: 'Error al revocar consentimiento permanente' }, { status: 500 });
  }

  return NextResponse.json(data);
}
