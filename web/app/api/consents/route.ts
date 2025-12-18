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
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  // Build query based on role
  let query = supabase
    .from('consent_documents')
    .select(`
      *,
      pet:pets!inner(id, name, owner_id, tenant_id),
      owner:profiles!owner_id(id, full_name, email),
      template:consent_templates!template_id(id, name, category),
      signed_by_user:profiles!signed_by_id(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (['vet', 'admin'].includes(profile.role)) {
    // Staff sees all clinic consent documents
    query = query.eq('pet.tenant_id', profile.clinic_id);
  } else {
    // Owners see only their pets' consent documents
    query = query.eq('owner_id', user.id);
  }

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  if (category) {
    query = query.eq('template.category', category);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] consents GET error:', error);
    return NextResponse.json({ error: 'Error al obtener consentimientos' }, { status: 500 });
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
    return NextResponse.json({ error: 'Solo personal autorizado puede crear consentimientos' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    template_id,
    pet_id,
    owner_id,
    custom_content,
    field_values,
    signature_data,
    witness_signature_data,
    witness_name,
    id_verification_type,
    id_verification_number,
    expires_at
  } = body;

  // Validate required fields
  if (!template_id || !pet_id || !owner_id || !signature_data) {
    return NextResponse.json({ error: 'template_id, pet_id, owner_id y signature_data son requeridos' }, { status: 400 });
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

  // Get template to check if it needs witness
  const { data: template } = await supabase
    .from('consent_templates')
    .select('id, requires_witness, can_be_revoked, default_expiry_days')
    .eq('id', template_id)
    .single();

  if (!template) {
    return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }

  // Validate witness signature if required
  if (template.requires_witness && !witness_signature_data) {
    return NextResponse.json({ error: 'Esta plantilla requiere firma de testigo' }, { status: 400 });
  }

  // Calculate expiry date
  let calculatedExpiresAt = null;
  if (expires_at) {
    calculatedExpiresAt = expires_at;
  } else if (template.default_expiry_days) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + template.default_expiry_days);
    calculatedExpiresAt = expiryDate.toISOString();
  }

  // Insert consent document
  const { data, error } = await supabase
    .from('consent_documents')
    .insert({
      template_id,
      pet_id,
      owner_id,
      custom_content: custom_content || null,
      field_values: field_values || {},
      signature_data,
      signed_by_id: user.id,
      signed_at: new Date().toISOString(),
      witness_signature_data: witness_signature_data || null,
      witness_name: witness_name || null,
      id_verification_type: id_verification_type || null,
      id_verification_number: id_verification_number || null,
      expires_at: calculatedExpiresAt,
      status: 'active',
      can_be_revoked: template.can_be_revoked
    })
    .select()
    .single();

  if (error) {
    console.error('[API] consents POST error:', error);
    return NextResponse.json({ error: 'Error al crear consentimiento' }, { status: 500 });
  }

  // Create audit log entry
  await supabase
    .from('consent_audit_log')
    .insert({
      consent_id: data.id,
      action: 'signed',
      performed_by_id: user.id,
      details: { method: 'in_person' }
    });

  return NextResponse.json(data, { status: 201 });
}
