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

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal autorizado puede ver plantillas' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  // Get templates - global and tenant-specific
  let query = supabase
    .from('consent_templates')
    .select(`
      *,
      fields:consent_template_fields(*)
    `)
    .or(`tenant_id.is.null,tenant_id.eq.${profile.clinic_id}`)
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] consent templates GET error:', error);
    return NextResponse.json({ error: 'Error al obtener plantillas' }, { status: 500 });
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

  // Get user profile - only admins can create templates
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden crear plantillas' }, { status: 403 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    name,
    category,
    content,
    requires_witness,
    requires_id_verification,
    can_be_revoked,
    default_expiry_days,
    fields
  } = body;

  // Validate required fields
  if (!name || !category || !content) {
    return NextResponse.json({ error: 'name, category y content son requeridos' }, { status: 400 });
  }

  // Insert template
  const { data, error } = await supabase
    .from('consent_templates')
    .insert({
      tenant_id: profile.clinic_id,
      name,
      category,
      content,
      requires_witness: requires_witness || false,
      requires_id_verification: requires_id_verification || false,
      can_be_revoked: can_be_revoked || true,
      default_expiry_days: default_expiry_days || null,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('[API] consent templates POST error:', error);
    return NextResponse.json({ error: 'Error al crear plantilla' }, { status: 500 });
  }

  // Insert fields if provided
  if (fields && Array.isArray(fields) && fields.length > 0) {
    const fieldsToInsert = fields.map((field: any) => ({
      template_id: data.id,
      field_name: field.field_name,
      field_type: field.field_type,
      field_label: field.field_label,
      is_required: field.is_required || false,
      field_options: field.field_options || null,
      display_order: field.display_order || 0
    }));

    const { error: fieldsError } = await supabase
      .from('consent_template_fields')
      .insert(fieldsToInsert);

    if (fieldsError) {
      console.error('[API] consent template fields POST error:', fieldsError);
      // Don't fail the whole request, just log the error
    }
  }

  return NextResponse.json(data, { status: 201 });
}
