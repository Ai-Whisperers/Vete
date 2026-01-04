import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
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
    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(
        `
        *,
        client:profiles!conversations_client_id_fkey(id, full_name, email, phone, avatar_url),
        pet:pets(id, name, species, photo_url),
        assigned_staff:profiles!conversations_assigned_to_fkey(id, full_name, avatar_url)
      `
      )
      .eq('id', id)
      .single()

    if (convError) throw convError

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }

    // Check access
    const isStaff = ['vet', 'admin'].includes(profile.role)
    if (!isStaff && conversation.client_id !== user.id) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    // Get messages
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const {
      data: messages,
      error: msgError,
      count,
    } = await supabase
      .from('messages')
      .select(
        `
        id, content, content_type, attachment_url, attachment_type, is_internal, created_at,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role)
      `,
        { count: 'exact' }
      )
      .eq('conversation_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (msgError) throw msgError

    // Filter internal messages for non-staff
    const filteredMessages = isStaff ? messages : messages?.filter((m) => !m.is_internal)

    // Mark as read
    const unreadField = isStaff ? 'unread_count_staff' : 'unread_count_client'
    await supabase
      .from('conversations')
      .update({ [unreadField]: 0 })
      .eq('id', id)

    return NextResponse.json({
      conversation,
      messages: filteredMessages,
      total_messages: count || 0,
      page,
      limit,
    })
  } catch (e) {
    logger.error('Error loading conversation', {
      userId: user.id,
      tenantId: profile.tenant_id,
      conversationId: id,
      error: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json({ error: 'Error al cargar conversación' }, { status: 500 })
  }
}

// PATCH /api/conversations/[id] - Update conversation
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
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

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Solo el personal puede actualizar conversaciones' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    // TICKET-TYPE-004: Use proper interface instead of any
    const updates: {
      status?: string
      priority?: string
      assigned_to?: string
      subject?: string
      closed_at?: string
    } = {}

    // Check each allowed field individually for type safety
    if (body.status !== undefined) updates.status = body.status
    if (body.priority !== undefined) updates.priority = body.priority
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to
    if (body.subject !== undefined) updates.subject = body.subject

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    // If closing, set closed_at
    if (updates.status === 'closed') {
      updates.closed_at = new Date().toISOString()
    }

    const { data: updated, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updated)
  } catch (e) {
    logger.error('Error updating conversation', {
      userId: user.id,
      tenantId: profile.tenant_id,
      conversationId: id,
      error: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json({ error: 'Error al actualizar conversación' }, { status: 500 })
  }
}

// DELETE /api/conversations/[id] - Soft delete conversation
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params
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

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json(
      { error: 'Solo administradores pueden eliminar conversaciones' },
      { status: 403 }
    )
  }

  try {
    const { error } = await supabase
      .from('conversations')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    logger.error('Error deleting conversation', {
      userId: user.id,
      tenantId: profile.tenant_id,
      conversationId: id,
      error: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json({ error: 'Error al eliminar conversación' }, { status: 500 })
  }
}
