import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const templateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  category: z.enum([
    'appointment_reminder',
    'vaccine_reminder',
    'general',
    'promotional',
    'follow_up',
  ]),
  content: z.string().min(1, 'Contenido requerido'),
  variables: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Staff check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile || !['vet', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Solo personal autorizado' }, { status: 403 })
    }

    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') === 'true'

    let query = supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('name')

    if (category) {
      query = query.eq('category', category)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'Error al obtener plantillas' }, { status: 500 })
    }

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Admin only for template creation
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = templateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { name, category, content, variables } = validation.data

    // Check for duplicate name
    const { data: existing } = await supabase
      .from('whatsapp_templates')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una plantilla con este nombre' },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('whatsapp_templates')
      .insert({
        tenant_id: profile.tenant_id,
        name,
        category,
        content,
        variables: variables || [],
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: 'Error al crear plantilla' }, { status: 500 })
    }

    return NextResponse.json({ data: template }, { status: 201 })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
