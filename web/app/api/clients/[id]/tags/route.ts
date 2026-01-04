import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic parameter required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { data: tags, error } = await supabase
      .from('client_tags')
      .select('tag_id, tag_name, tag_color, tag_icon')
      .eq('client_id', id)
      .eq('tenant_id', clinic)

    if (error) throw error

    return NextResponse.json({
      tags: (tags || []).map((t) => ({
        id: t.tag_id,
        name: t.tag_name,
        color: t.tag_color,
        icon: t.tag_icon,
      })),
    })
  } catch (error) {
    console.error('Error fetching client tags:', error)
    return NextResponse.json({ error: 'Error al cargar etiquetas' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const body = await request.json()
  const { clinic, tagId } = body

  if (!clinic || !tagId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Check staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { error } = await supabase.from('client_tags').insert({
      client_id: id,
      tag_id: tagId,
      tenant_id: clinic,
      created_by: user.id,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding tag:', error)
    return NextResponse.json({ error: 'Error al agregar etiqueta' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const body = await request.json()
  const { clinic, tagId } = body

  if (!clinic || !tagId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Check staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { error } = await supabase
      .from('client_tags')
      .delete()
      .eq('client_id', id)
      .eq('tag_id', tagId)
      .eq('tenant_id', clinic)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing tag:', error)
    return NextResponse.json({ error: 'Error al eliminar etiqueta' }, { status: 500 })
  }
}
