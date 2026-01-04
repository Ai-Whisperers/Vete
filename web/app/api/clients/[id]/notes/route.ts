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
    const { data: notes, error } = await supabase
      .from('client_notes')
      .select(
        `
        id,
        content,
        is_private,
        created_by,
        created_at,
        updated_at,
        profiles:created_by (full_name)
      `
      )
      .eq('client_id', id)
      .eq('tenant_id', clinic)
      .or(`is_private.eq.false,created_by.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      notes: (notes || []).map((note) => ({
        ...note,
        created_by_name:
          (note.profiles as unknown as { full_name: string } | null)?.full_name || 'Usuario',
      })),
    })
  } catch (error) {
    console.error('Error fetching client notes:', error)
    return NextResponse.json({ error: 'Error al cargar notas' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const body = await request.json()
  const { clinic, content, is_private } = body

  if (!clinic || !content) {
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
    .select('role, tenant_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const { data: note, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: id,
        tenant_id: clinic,
        content,
        is_private: is_private || false,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      note: {
        ...note,
        created_by_name: profile.full_name || 'Usuario',
      },
    })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Error al crear nota' }, { status: 500 })
  }
}
