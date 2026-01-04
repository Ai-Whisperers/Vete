import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/sms/send
 * Send an SMS message directly
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

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
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal puede enviar SMS' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { to, message, template_name, variables, client_id, pet_id } = body

    if (!to || (!message && !template_name)) {
      return NextResponse.json(
        {
          error: 'Número de teléfono y mensaje son requeridos',
        },
        { status: 400 }
      )
    }

    // Normalize phone number (Paraguay format)
    const normalizedPhone = normalizePhoneNumber(to)

    // Get message content
    let smsBody = message

    if (template_name && !message) {
      // Fetch template
      const { data: template } = await supabase
        .from('notification_templates')
        .select('body')
        .eq('tenant_id', profile.tenant_id)
        .eq('name', template_name)
        .eq('channel_type', 'sms')
        .single()

      if (template) {
        smsBody = renderTemplate(template.body, variables || {})
      } else {
        return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
      }
    }

    // Truncate if too long
    if (smsBody.length > 160) {
      smsBody = smsBody.substring(0, 157) + '...'
    }

    // Get SMS config from tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('config, name')
      .eq('id', profile.tenant_id)
      .single()

    const config = tenant?.config || {}
    const accountSid = config.sms_api_key || process.env.TWILIO_ACCOUNT_SID
    const authToken = config.sms_api_secret || process.env.TWILIO_AUTH_TOKEN
    const fromNumber = config.sms_from || process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        {
          error: 'SMS no está configurado para esta clínica',
        },
        { status: 500 }
      )
    }

    // Send via Twilio
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: normalizedPhone,
          Body: smsBody,
          StatusCallback: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/sms/webhook`,
        }),
      }
    )

    if (!twilioResponse.ok) {
      const error = await twilioResponse.json()
      console.error('Twilio error:', error)
      return NextResponse.json(
        {
          error: `Error de Twilio: ${error.message || 'Error desconocido'}`,
        },
        { status: 500 }
      )
    }

    const result = await twilioResponse.json()

    // Log to notification_log
    await supabase.from('notification_log').insert({
      tenant_id: profile.tenant_id,
      client_id: client_id || null,
      channel_type: 'sms',
      destination: normalizedPhone,
      body: smsBody,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    // Also log as whatsapp_message for unified messaging history
    await supabase.from('whatsapp_messages').insert({
      tenant_id: profile.tenant_id,
      phone_number: normalizedPhone,
      direction: 'outgoing',
      message_type: 'text',
      content: smsBody,
      status: 'sent',
      external_id: result.sid,
      sent_by: user.id,
    })

    return NextResponse.json({
      success: true,
      message_id: result.sid,
      to: normalizedPhone,
      status: result.status,
    })
  } catch (e) {
    console.error('Error sending SMS:', e)
    return NextResponse.json({ error: 'Error al enviar SMS' }, { status: 500 })
  }
}

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')

  // Paraguay phone numbers
  // Mobile: 09xx xxx xxx (10 digits starting with 09)
  // With country code: +595 9xx xxx xxx

  // If starts with 0, assume local Paraguay number
  if (cleaned.startsWith('0')) {
    cleaned = '595' + cleaned.substring(1)
  }

  // If doesn't have country code, add Paraguay's
  if (!cleaned.startsWith('595') && cleaned.length === 9) {
    cleaned = '595' + cleaned
  }

  return '+' + cleaned
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}
