import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// GET /api/conversations - List conversations
export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const isStaff = ['vet', 'admin'].includes(profile.role)

  try {
    let query = supabase
      .from('conversations')
      .select(
        `
        id, subject, status, priority, last_message_at, unread_count_staff, unread_count_client,
        client:profiles!conversations_client_id_fkey(id, full_name, avatar_url),
        pet:pets(id, name, photo_url),
        assigned_staff:profiles!conversations_assigned_to_fkey(id, full_name)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Owners only see their own conversations
    if (!isStaff) {
      query = query.eq('client_id', user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: conversations, error, count } = await query

    if (error) throw error

    // Add unread indicator based on role
    const processed = conversations?.map((conv) => ({
      ...conv,
      unread: isStaff ? conv.unread_count_staff > 0 : conv.unread_count_client > 0,
    }))

    return NextResponse.json({
      data: processed,
      total: count || 0,
      page,
      limit,
    })
  } catch (e) {
    logger.error('Error loading conversations', {
      userId: user.id,
      tenantId: profile.tenant_id,
      error: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json({ error: 'Error al cargar conversaciones' }, { status: 500 })
  }
}

// POST /api/conversations - Start new conversation
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { subject, pet_id, message, client_id } = body

    if (!subject || !message) {
      return NextResponse.json({ error: 'subject y message son requeridos' }, { status: 400 })
    }

    const isStaff = ['vet', 'admin'].includes(profile.role)

    // Determine client_id
    let finalClientId = isStaff ? client_id : user.id

    if (!finalClientId) {
      return NextResponse.json({ error: 'Se requiere client_id' }, { status: 400 })
    }

    // Verify pet belongs to client if provided
    if (pet_id) {
      const { data: pet } = await supabase
        .from('pets')
        .select('id, owner_id')
        .eq('id', pet_id)
        .single()

      if (!pet || pet.owner_id !== finalClientId) {
        return NextResponse.json(
          { error: 'Mascota no encontrada o no pertenece al cliente' },
          { status: 400 }
        )
      }
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        tenant_id: profile.tenant_id,
        client_id: finalClientId,
        pet_id: pet_id || null,
        subject,
        status: 'open',
        priority: 'normal',
        started_by: isStaff ? 'staff' : 'client',
        last_message_at: new Date().toISOString(),
        unread_count_staff: isStaff ? 0 : 1,
        unread_count_client: isStaff ? 1 : 0,
      })
      .select()
      .single()

    if (convError) throw convError

    // Create first message
    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      sender_type: isStaff ? 'staff' : 'client',
      content: message,
      content_type: 'text',
    })

    if (msgError) throw msgError

    return NextResponse.json(conversation, { status: 201 })
  } catch (e) {
    logger.error('Error creating conversation', {
      userId: user.id,
      tenantId: profile.tenant_id,
      error: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json({ error: 'Error al crear conversación' }, { status: 500 })
  }
}
