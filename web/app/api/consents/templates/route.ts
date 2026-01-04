import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface ConsentField {
  field_name: string
  field_type: string
  field_label: string
  is_required?: boolean
  field_options?: string[] | null
  display_order?: number
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get user profile
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

  if (!['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  // Get templates - global and tenant-specific
  let query = supabase
    .from('consent_templates')
    .select(
      `
      *,
      fields:consent_template_fields(*)
    `
    )
    .or(`tenant_id.is.null,tenant_id.eq.${profile.clinic_id}`)
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('[API] consent templates GET error:', error)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Get user profile - only admins can create templates
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
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('[API] consent templates POST error:', error)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }

  // Insert fields if provided
  if (fields && Array.isArray(fields) && fields.length > 0) {
    const fieldsToInsert = fields.map((field: ConsentField) => ({
      template_id: data.id,
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
      // Don't fail the whole request, just log the error
    }
  }

  return NextResponse.json(data, { status: 201 })
}
