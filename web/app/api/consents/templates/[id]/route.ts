import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ConsentField {
  id?: string;
  field_name: string;
  field_type: string;
  field_label: string;
  is_required?: boolean;
  field_options?: string[] | null;
  display_order?: number;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only admins can update templates
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden editar plantillas' }, { status: 403 });
  }

  // Get template ID from params
  const params = await context.params;
  const templateId = params.id;

  // Verify template belongs to the tenant
  const { data: existingTemplate, error: fetchError } = await supabase
    .from('consent_templates')
    .select('tenant_id')
    .eq('id', templateId)
    .single();

  if (fetchError || !existingTemplate) {
    return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }

  // Only allow editing tenant-specific templates (not global ones)
  if (!existingTemplate.tenant_id) {
    return NextResponse.json({ error: 'No se pueden editar plantillas globales' }, { status: 403 });
  }

  if (existingTemplate.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No autorizado para editar esta plantilla' }, { status: 403 });
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

  // Update template
  const { data, error } = await supabase
    .from('consent_templates')
    .update({
      name,
      category,
      content,
      requires_witness: requires_witness || false,
      requires_id_verification: requires_id_verification || false,
      can_be_revoked: can_be_revoked !== undefined ? can_be_revoked : true,
      default_expiry_days: default_expiry_days || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('[API] consent templates PUT error:', error);
    return NextResponse.json({ error: 'Error al actualizar plantilla' }, { status: 500 });
  }

  // Handle fields update
  if (fields && Array.isArray(fields)) {
    // Delete existing fields
    const { error: deleteError } = await supabase
      .from('consent_template_fields')
      .delete()
      .eq('template_id', templateId);

    if (deleteError) {
      console.error('[API] consent template fields DELETE error:', deleteError);
    }

    // Insert new fields
    if (fields.length > 0) {
      const fieldsToInsert = fields.map((field: ConsentField) => ({
        template_id: templateId,
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
      }
    }
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile - only admins can delete templates
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar plantillas' }, { status: 403 });
  }

  // Get template ID from params
  const params = await context.params;
  const templateId = params.id;

  // Verify template belongs to the tenant
  const { data: existingTemplate, error: fetchError } = await supabase
    .from('consent_templates')
    .select('tenant_id')
    .eq('id', templateId)
    .single();

  if (fetchError || !existingTemplate) {
    return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }

  // Only allow deleting tenant-specific templates (not global ones)
  if (!existingTemplate.tenant_id) {
    return NextResponse.json({ error: 'No se pueden eliminar plantillas globales' }, { status: 403 });
  }

  if (existingTemplate.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No autorizado para eliminar esta plantilla' }, { status: 403 });
  }

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('consent_templates')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', templateId);

  if (error) {
    console.error('[API] consent templates DELETE error:', error);
    return NextResponse.json({ error: 'Error al eliminar plantilla' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Plantilla eliminada correctamente' }, { status: 200 });
}
