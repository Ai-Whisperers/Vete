import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface ConsentField {
  id?: string
  field_name: string
  field_type: string
  field_label: string
  is_required?: boolean
  field_options?: string[] | null
  display_order?: number
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get user profile - only admins can update templates
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'profile' },
    })
  }

  if (profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  // Get template ID from params
  const params = await context.params
  const templateId = params.id

  // Verify template belongs to the tenant
  const { data: existingTemplate, error: fetchError } = await supabase
    .from('consent_templates')
    .select('tenant_id')
    .eq('id', templateId)
    .single()

  if (fetchError || !existingTemplate) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'template' },
    })
  }

  // Only allow editing tenant-specific templates (not global ones)
  if (!existingTemplate.tenant_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Cannot edit global templates' },
    })
  }

  if (existingTemplate.tenant_id !== profile.clinic_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
  }

  const {
    name,
    category,
    content,
    requires_witness,
    requires_id_verification,
    can_be_revoked,
    default_expiry_days,
    fields,
  } = body

  // Validate required fields
  if (!name || !category || !content) {
    return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
      details: { required: ['name', 'category', 'content'] },
    })
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    console.error('[API] consent templates PUT error:', error)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  // Handle fields update
  if (fields && Array.isArray(fields)) {
    // Delete existing fields
    const { error: deleteError } = await supabase
      .from('consent_template_fields')
      .delete()
      .eq('template_id', templateId)

    if (deleteError) {
      console.error('[API] consent template fields DELETE error:', deleteError)
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
        display_order: field.display_order || 0,
      }))

      const { error: fieldsError } = await supabase
        .from('consent_template_fields')
        .insert(fieldsToInsert)

      if (fieldsError) {
        console.error('[API] consent template fields POST error:', fieldsError)
      }
    }
  }

  return NextResponse.json(data, { status: 200 })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get user profile - only admins can delete templates
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'profile' },
    })
  }

  if (profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  // Get template ID from params
  const params = await context.params
  const templateId = params.id

  // Verify template belongs to the tenant
  const { data: existingTemplate, error: fetchError } = await supabase
    .from('consent_templates')
    .select('tenant_id')
    .eq('id', templateId)
    .single()

  if (fetchError || !existingTemplate) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'template' },
    })
  }

  // Only allow deleting tenant-specific templates (not global ones)
  if (!existingTemplate.tenant_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Cannot delete global templates' },
    })
  }

  if (existingTemplate.tenant_id !== profile.clinic_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
  }

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('consent_templates')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', templateId)

  if (error) {
    console.error('[API] consent templates DELETE error:', error)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json({ message: 'Plantilla eliminada correctamente' }, { status: 200 })
}
