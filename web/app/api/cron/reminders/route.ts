import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface Reminder {
  id: string
  tenant_id: string
  client_id: string
  pet_id: string | null
  type: string
  reference_type: string | null
  reference_id: string | null
  scheduled_at: string
  status: string
  attempts: number
  max_attempts: number
  custom_subject: string | null
  custom_body: string | null
  client:
    | {
        id: string
        full_name: string
        email: string
        phone: string | null
      }
    | { id: string; full_name: string; email: string; phone: string | null }[]
  pet:
    | {
        id: string
        name: string
        species: string
      }
    | { id: string; name: string; species: string }[]
    | null
}

interface MessageTemplate {
  id: string
  code: string
  name: string
  subject: string | null
  content: string
  content_html: string | null
  variables: string[]
}

/**
 * Process Reminders Cron Job
 *
 * Processes pending reminders that are due and sends notifications.
 * Supports email, SMS (via integration), and WhatsApp.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const now = new Date()

  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  }

  try {
    // 1. Get pending reminders due now or earlier
    const { data: reminders, error: fetchError } = await supabase
      .from('reminders')
      .select(
        `
        id, tenant_id, client_id, pet_id, type,
        reference_type, reference_id, scheduled_at,
        status, attempts, max_attempts,
        custom_subject, custom_body,
        client:profiles!reminders_client_id_fkey(id, full_name, email, phone),
        pet:pets(id, name, species)
      `
      )
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .lt('attempts', 3)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })
      .limit(50)

    if (fetchError) {
      logger.error('Error fetching reminders', {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
      })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ message: 'No pending reminders', ...results })
    }

    // 2. Get message templates
    const { data: templates } = await supabase
      .from('message_templates')
      .select('id, code, name, subject, content, content_html, variables')
      .eq('is_active', true)
      .is('deleted_at', null)

    const templateMap = new Map<string, MessageTemplate>()
    templates?.forEach((t) => templateMap.set(t.code, t))

    // 3. Get tenant details for branding
    const tenantIds = [...new Set(reminders.map((r) => r.tenant_id))]
    const { data: tenants } = await supabase.from('tenants').select('id, name').in('id', tenantIds)

    const tenantMap = new Map<string, { name: string }>()
    tenants?.forEach((t) => tenantMap.set(t.id, { name: t.name }))

    // 4. Process each reminder
    for (const reminder of reminders as Reminder[]) {
      results.processed++

      try {
        // Mark as processing
        await supabase
          .from('reminders')
          .update({
            status: 'processing',
            last_attempt_at: now.toISOString(),
            attempts: (reminder.attempts || 0) + 1,
          })
          .eq('id', reminder.id)

        // Get client and pet info
        const client = Array.isArray(reminder.client) ? reminder.client[0] : reminder.client
        const pet = reminder.pet
          ? Array.isArray(reminder.pet)
            ? reminder.pet[0]
            : reminder.pet
          : null

        if (!client?.email) {
          throw new Error(`No email for client ${reminder.client_id}`)
        }

        // Get tenant info
        const tenant = tenantMap.get(reminder.tenant_id)
        const clinicName = tenant?.name || 'Veterinaria'

        // Build message content
        const { subject, htmlBody, textBody } = await buildReminderContent(
          supabase,
          reminder,
          client,
          pet,
          clinicName,
          templateMap
        )

        // Send email
        const emailResult = await sendEmail({
          to: client.email,
          subject,
          html: htmlBody,
          text: textBody,
        })

        if (!emailResult.success) {
          throw new Error(emailResult.error || 'Email send failed')
        }

        // Mark as sent
        await supabase
          .from('reminders')
          .update({
            status: 'sent',
          })
          .eq('id', reminder.id)

        // Log to notification queue
        await supabase.from('notification_queue').insert({
          tenant_id: reminder.tenant_id,
          reminder_id: reminder.id,
          client_id: reminder.client_id,
          channel_type: 'email',
          destination: client.email,
          subject,
          body: textBody,
          status: 'sent',
          sent_at: now.toISOString(),
        })

        results.sent++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Reminder ${reminder.id}: ${errorMessage}`)
        results.failed++

        // Update reminder with error
        const attempts = (reminder.attempts || 0) + 1
        await supabase
          .from('reminders')
          .update({
            status: attempts >= (reminder.max_attempts || 3) ? 'failed' : 'pending',
            error_message: errorMessage,
            next_attempt_at:
              attempts < (reminder.max_attempts || 3)
                ? new Date(now.getTime() + 60 * 60 * 1000).toISOString() // Retry in 1 hour
                : null,
          })
          .eq('id', reminder.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} reminders`,
      stats: results,
    })
  } catch (error) {
    logger.error('Reminder processing error', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Build reminder content using templates
 */
async function buildReminderContent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reminder: Reminder,
  client: { id: string; full_name: string; email: string; phone: string | null },
  pet: { id: string; name: string; species: string } | null,
  clinicName: string,
  templateMap: Map<string, MessageTemplate>
): Promise<{ subject: string; htmlBody: string; textBody: string }> {
  // Use custom content if provided
  if (reminder.custom_subject && reminder.custom_body) {
    return {
      subject: reminder.custom_subject,
      htmlBody: wrapInEmailTemplate(reminder.custom_body, clinicName),
      textBody: reminder.custom_body,
    }
  }

  // Get template based on reminder type
  const templateCode = getTemplateCode(reminder.type)
  const template = templateMap.get(templateCode)

  // Get reference data for variable substitution
  let referenceData: Record<string, string> = {}
  if (reminder.reference_type && reminder.reference_id) {
    referenceData = await getReferenceData(supabase, reminder.reference_type, reminder.reference_id)
  }

  // Build variables
  const variables: Record<string, string> = {
    owner_name: client.full_name || 'Cliente',
    pet_name: pet?.name || 'tu mascota',
    pet_species: pet?.species || '',
    clinic_name: clinicName,
    ...referenceData,
  }

  if (template) {
    // Substitute variables in template
    let content = template.content
    let htmlContent = template.content_html || template.content
    let subject = template.subject || getDefaultSubject(reminder.type, variables)

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      content = content.replace(pattern, value)
      htmlContent = htmlContent.replace(pattern, value)
      subject = subject.replace(pattern, value)
    }

    return {
      subject,
      htmlBody: wrapInEmailTemplate(htmlContent, clinicName),
      textBody: content,
    }
  }

  // Fallback to default content
  const { subject, body } = getDefaultContent(reminder.type, variables)
  return {
    subject,
    htmlBody: wrapInEmailTemplate(body, clinicName),
    textBody: body,
  }
}

/**
 * Get template code based on reminder type
 */
function getTemplateCode(reminderType: string): string {
  const mapping: Record<string, string> = {
    vaccine_reminder: 'VACCINE_REMINDER',
    vaccine_overdue: 'VACCINE_REMINDER',
    appointment_reminder: 'APPT_REMINDER_24H',
    appointment_confirmation: 'APPT_CONFIRM',
    birthday: 'PET_BIRTHDAY',
    follow_up: 'FOLLOW_UP',
    invoice_sent: 'INVOICE_READY',
    payment_received: 'PAYMENT_CONFIRM',
    payment_overdue: 'PAYMENT_OVERDUE',
    lab_results_ready: 'LAB_RESULTS',
    hospitalization_update: 'HOSP_UPDATE',
  }
  return mapping[reminderType] || 'CUSTOM'
}

/**
 * Get reference data for variable substitution
 */
async function getReferenceData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  referenceType: string,
  referenceId: string
): Promise<Record<string, string>> {
  try {
    switch (referenceType) {
      case 'vaccine': {
        const { data } = await supabase
          .from('vaccines')
          .select('name, next_due_date')
          .eq('id', referenceId)
          .single()
        if (data) {
          return {
            vaccine_name: data.name || '',
            vaccine_due_date: data.next_due_date
              ? new Date(data.next_due_date).toLocaleDateString('es-PY')
              : '',
          }
        }
        break
      }

      case 'appointment': {
        const { data } = await supabase
          .from('appointments')
          .select('start_time, type, notes')
          .eq('id', referenceId)
          .single()
        if (data) {
          const date = new Date(data.start_time)
          return {
            appointment_date: date.toLocaleDateString('es-PY'),
            appointment_time: date.toLocaleTimeString('es-PY', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            appointment_type: data.type || '',
          }
        }
        break
      }

      case 'invoice': {
        const { data } = await supabase
          .from('invoices')
          .select('invoice_number, total, due_date')
          .eq('id', referenceId)
          .single()
        if (data) {
          return {
            invoice_number: data.invoice_number || '',
            amount: data.total ? `Gs. ${data.total.toLocaleString('es-PY')}` : '',
            due_date: data.due_date ? new Date(data.due_date).toLocaleDateString('es-PY') : '',
          }
        }
        break
      }
    }
  } catch {
    // Ignore errors, return empty
  }

  return {}
}

/**
 * Get default subject based on reminder type
 */
function getDefaultSubject(reminderType: string, variables: Record<string, string>): string {
  const subjects: Record<string, string> = {
    vaccine_reminder: `Recordatorio de Vacuna para ${variables.pet_name}`,
    vaccine_overdue: `Vacuna vencida: ${variables.pet_name}`,
    appointment_reminder: `Recordatorio de Cita - ${variables.clinic_name}`,
    birthday: `¡Feliz Cumpleaños ${variables.pet_name}! 🎂`,
    follow_up: `¿Cómo está ${variables.pet_name}?`,
  }
  return subjects[reminderType] || `Recordatorio de ${variables.clinic_name}`
}

/**
 * Get default content based on reminder type
 */
function getDefaultContent(
  reminderType: string,
  variables: Record<string, string>
): { subject: string; body: string } {
  const ownerName = variables.owner_name || 'Cliente'
  const petName = variables.pet_name || 'tu mascota'
  const clinicName = variables.clinic_name || 'Veterinaria'

  switch (reminderType) {
    case 'vaccine_reminder':
      return {
        subject: `Recordatorio de Vacuna para ${petName}`,
        body: `Hola ${ownerName},\n\nTe recordamos que ${petName} tiene una vacuna próxima: ${variables.vaccine_name || 'vacuna programada'}.\n\nFecha: ${variables.vaccine_due_date || 'próximamente'}\n\nPor favor agenda una cita con nosotros.\n\nSaludos,\n${clinicName}`,
      }

    case 'vaccine_overdue':
      return {
        subject: `Vacuna vencida: ${petName}`,
        body: `Hola ${ownerName},\n\n${petName} tiene una vacuna vencida: ${variables.vaccine_name || 'vacuna'}.\n\nEs importante mantener al día las vacunas de tu mascota. Por favor contáctanos para agendar una cita.\n\nSaludos,\n${clinicName}`,
      }

    case 'appointment_reminder':
      return {
        subject: `Recordatorio de Cita - ${clinicName}`,
        body: `Hola ${ownerName},\n\nTe recordamos tu cita para ${petName}:\n\nFecha: ${variables.appointment_date || ''}\nHora: ${variables.appointment_time || ''}\n\n¡Te esperamos!\n\n${clinicName}`,
      }

    case 'birthday':
      return {
        subject: `¡Feliz Cumpleaños ${petName}! 🎂`,
        body: `Hola ${ownerName},\n\n¡Hoy es un día especial! ${petName} cumple años.\n\nTodo el equipo de ${clinicName} le desea un feliz cumpleaños.\n\n🐾 ¡Que tenga un día lleno de cariño y premios!`,
      }

    case 'follow_up':
      return {
        subject: `¿Cómo está ${petName}?`,
        body: `Hola ${ownerName},\n\nQueremos saber cómo se encuentra ${petName} después de su última visita.\n\nSi tienes alguna pregunta o preocupación, no dudes en contactarnos.\n\nSaludos,\n${clinicName}`,
      }

    default:
      return {
        subject: `Recordatorio de ${clinicName}`,
        body: `Hola ${ownerName},\n\nTienes un recordatorio pendiente para ${petName}.\n\nSaludos,\n${clinicName}`,
      }
  }
}

/**
 * Wrap content in email template
 */
function wrapInEmailTemplate(content: string, clinicName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${clinicName}</h1>
  </div>
  <div class="content">
    ${content.replace(/\n/g, '<br>')}
  </div>
  <div class="footer">
    <p>Este es un mensaje automático de ${clinicName}.</p>
    <p>Si no deseas recibir estos recordatorios, puedes configurar tus preferencias en tu portal de cliente.</p>
  </div>
</body>
</html>`
}
