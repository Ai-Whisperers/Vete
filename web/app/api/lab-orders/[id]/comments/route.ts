import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()
  const { id: orderId } = await params

  // Authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get user profile - only vets/admins can comment
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo veterinarios pueden comentar' }, { status: 403 })
  }

  // Parse body
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { comment_text, interpretation } = body

  if (!comment_text) {
    return NextResponse.json({ error: 'comment_text es requerido' }, { status: 400 })
  }

  // Verify order belongs to staff's clinic
  const { data: order } = await supabase
    .from('lab_orders')
    .select('id, pets!inner(tenant_id)')
    .eq('id', orderId)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  const pet = Array.isArray(order.pets) ? order.pets[0] : order.pets
  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta orden' }, { status: 403 })
  }

  // Insert comment
  const { data, error } = await supabase
    .from('lab_result_comments')
    .insert({
      order_id: orderId,
      comment_text,
      interpretation: interpretation || null,
      commented_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('[API] lab_result_comments POST error:', error)
    return NextResponse.json({ error: 'Error al agregar comentario' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
