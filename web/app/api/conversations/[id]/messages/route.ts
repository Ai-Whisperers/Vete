import { NextResponse } from 'next/server'
import { withApiAuthParams } from '@/lib/auth/api-wrapper'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

type Params = { id: string }

interface Attachment {
  url: string
  name: string
  type: string
  size: number
}

// POST /api/conversations/[id]/messages - Send a message
export const POST = withApiAuthParams<Params>(async (ctx) => {
  const { id: conversationId } = ctx.params
  const { supabase, user, profile, log, request } = ctx
  const isStaff = ['vet', 'admin'].includes(profile.role)

  try {
    // Get conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, client_id, tenant_id, status')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { message: 'Conversación no encontrada' },
      })
    }

    // Check access
    if (!isStaff && conversation.client_id !== user.id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
        details: { message: 'No tienes acceso a esta conversación' },
      })
    }

    if (conversation.status === 'closed') {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Esta conversación está cerrada' },
      })
    }

    const body = await request.json()
    const { content, content_type, attachments, is_internal } = body

    // Support both single attachment (legacy) and multiple attachments
    const attachmentList: Attachment[] = attachments || []
    const hasAttachments = attachmentList.length > 0

    if (!content && !hasAttachments) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Se requiere contenido o adjunto' },
      })
    }

    // Non-staff cannot send internal messages
    const finalIsInternal = isStaff ? is_internal || false : false

    // Determine message type based on content
    let messageType = content_type || 'text'
    if (hasAttachments && !content) {
      // Pure attachment message
      const firstType = attachmentList[0].type
      if (firstType.startsWith('image/')) {
        messageType = 'image'
      } else {
        messageType = 'file'
      }
    }

    // Create message with attachments JSONB
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: isStaff ? 'staff' : 'client',
        content: content || '',
        message_type: messageType,
        attachments: attachmentList,
      })
      .select(
        `
        id, content, message_type, attachments, created_at,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role)
      `
      )
      .single()

    if (msgError) throw msgError

    // Update conversation
    const updateData: {
      last_message_at: string
      unread_count_client?: number
      unread_count_staff?: number
      status?: string
      closed_at?: string | null
    } = {
      last_message_at: new Date().toISOString(),
    }

    // Simple approach - just increment the counter
    const unreadField = isStaff ? 'unread_count_client' : 'unread_count_staff'
    if (!finalIsInternal) {
      // Get current count and increment
      const { data: currentConv } = await supabase
        .from('conversations')
        .select('unread_count_staff, unread_count_client')
        .eq('id', conversationId)
        .single()

      const currentCount =
        (currentConv as { unread_count_staff?: number; unread_count_client?: number } | null)?.[
          unreadField
        ] || 0
      updateData[unreadField] = currentCount + 1
    }

    // Reopen if closed and client replies
    if (!isStaff && conversation.status === 'closed') {
      updateData.status = 'open'
      updateData.closed_at = null
    }

    await supabase.from('conversations').update(updateData).eq('id', conversationId)

    // Queue notification for new message (if not internal)
    if (!finalIsInternal) {
      const recipientId = isStaff ? conversation.client_id : null // Will notify assigned staff

      if (recipientId) {
        // Get recipient email
        const { data: recipient } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', recipientId)
          .single()

        if (recipient?.email) {
          await supabase.from('notification_queue').insert({
            tenant_id: profile.tenant_id,
            channel: 'email',
            recipient_id: recipientId,
            recipient_address: recipient.email,
            subject: 'Nuevo mensaje en tu conversación',
            body: `Hola ${recipient.full_name}, tienes un nuevo mensaje. Revisa tu portal para más detalles.`,
            priority: 'normal',
            metadata: {
              conversation_id: conversationId,
              message_preview: content?.substring(0, 100),
            },
          })
        }
      }
    }

    return NextResponse.json(message, { status: 201 })
  } catch (e) {
    log.error('Error sending message', {
      conversationId,
      error: e instanceof Error ? e.message : String(e),
    })
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al enviar mensaje' },
    })
  }
})
