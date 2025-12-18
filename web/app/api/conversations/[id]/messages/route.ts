import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/conversations/[id]/messages - Send a message
export async function POST(request: Request, { params }: RouteParams) {
  const { id: conversationId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  try {
    // Get conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, client_id, tenant_id, status')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
    }

    // Check access
    const isStaff = ['vet', 'admin'].includes(profile.role);
    if (!isStaff && conversation.client_id !== user.id) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 });
    }

    if (conversation.status === 'closed') {
      return NextResponse.json({ error: 'Esta conversación está cerrada' }, { status: 400 });
    }

    const body = await request.json();
    const { content, content_type, attachment_url, attachment_type, is_internal } = body;

    if (!content && !attachment_url) {
      return NextResponse.json({ error: 'Se requiere contenido o adjunto' }, { status: 400 });
    }

    // Non-staff cannot send internal messages
    const finalIsInternal = isStaff ? (is_internal || false) : false;

    // Create message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: isStaff ? 'staff' : 'client',
        content: content || '',
        content_type: content_type || 'text',
        attachment_url,
        attachment_type,
        is_internal: finalIsInternal
      })
      .select(`
        id, content, content_type, attachment_url, attachment_type, is_internal, created_at,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role)
      `)
      .single();

    if (msgError) throw msgError;

    // Update conversation
    // TICKET-TYPE-004: Use proper interface instead of any
    const updateData: { last_message_at: string } = {
      last_message_at: new Date().toISOString()
    };

    // Update unread count for the other party (unless internal message)
    if (!finalIsInternal) {
      if (isStaff) {
        updateData.unread_count_client = supabase.rpc('increment_unread_client', { conv_id: conversationId });
        // Actually, we need to do this differently
      }
    }

    // Simple approach - just increment the counter
    const unreadField = isStaff ? 'unread_count_client' : 'unread_count_staff';
    if (!finalIsInternal) {
      // Get current count and increment
      const { data: currentConv } = await supabase
        .from('conversations')
        .select('unread_count_staff, unread_count_client')
        .eq('id', conversationId)
        .single();

      const currentCount = (currentConv as Record<string, number> | null)?.[unreadField] || 0;
      updateData[unreadField] = currentCount + 1;
    }

    // Reopen if closed and client replies
    if (!isStaff && conversation.status === 'closed') {
      updateData.status = 'open';
      updateData.closed_at = null;
    }

    await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    // Queue notification for new message (if not internal)
    if (!finalIsInternal) {
      const recipientId = isStaff ? conversation.client_id : null; // Will notify assigned staff

      if (recipientId) {
        // Get recipient email
        const { data: recipient } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', recipientId)
          .single();

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
              message_preview: content?.substring(0, 100)
            }
          });
        }
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (e) {
    console.error('Error sending message:', e);
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 });
  }
}
