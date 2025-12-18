import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { formatParaguayPhone } from '@/lib/types/whatsapp'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const sendMessageSchema = z.object({
  phone: z.string().min(1, 'Número requerido'),
  message: z.string().min(1, 'Mensaje requerido'),
  clientId: z.string().uuid().optional(),
  petId: z.string().uuid().optional(),
  conversationType: z.enum(['appointment_reminder', 'vaccine_reminder', 'general', 'support']).optional(),
  templateId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Apply rate limiting for write endpoints (20 requests per minute)
    const rateLimitResult = await rateLimit(request, 'write', user.id);
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
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

    // Parse and validate body
    const body = await request.json()
    const validation = sendMessageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { phone, message, clientId, petId, conversationType, templateId } = validation.data
    const formattedPhone = formatParaguayPhone(phone)

    // Create message record first
    const { data: messageRecord, error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert({
        tenant_id: profile.tenant_id,
        client_id: clientId || null,
        pet_id: petId || null,
        phone_number: formattedPhone,
        direction: 'outbound',
        content: message,
        status: 'queued',
        conversation_type: conversationType || 'general',
        template_id: templateId || null,
        sent_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating message record:', insertError)
      return NextResponse.json({ error: 'Error al crear registro' }, { status: 500 })
    }

    // Send via Twilio
    const result = await sendWhatsAppMessage({
      to: formattedPhone,
      body: message,
    })

    // Update message status
    if (result.success && result.sid) {
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'sent',
          twilio_sid: result.sid,
          sent_at: new Date().toISOString(),
        })
        .eq('id', messageRecord.id)

      return NextResponse.json({
        success: true,
        messageId: messageRecord.id,
        twilioSid: result.sid,
      })
    } else {
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'failed',
          error_message: result.error || 'Error desconocido',
        })
        .eq('id', messageRecord.id)

      return NextResponse.json({
        success: false,
        error: result.error || 'Error al enviar mensaje',
        messageId: messageRecord.id,
      }, { status: 500 })
    }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
