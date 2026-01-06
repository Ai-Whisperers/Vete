/**
 * Billing Reminders Cron Job
 *
 * POST /api/cron/billing/send-reminders
 *
 * Sends billing reminder emails at appropriate intervals.
 *
 * Schedule: Daily at 09:00 local time (13:00 UTC for Paraguay)
 *
 * Reminder types:
 * - upcoming_invoice: 7 days before due date
 * - invoice_due: On due date
 * - overdue_gentle: 7 days after due date
 * - overdue_reminder: 14 days after due date
 * - overdue_urgent: 30 days after due date
 * - grace_period_warning: When grace period is ending (7 days before)
 *
 * Authorization: Requires CRON_SECRET header
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCronHandler, CronContext } from '@/lib/cron/handler'
import { logger } from '@/lib/logger'

interface ReminderResult {
  tenant_id: string
  invoice_id: string
  invoice_number: string
  reminder_type: string
  status: 'sent' | 'skipped' | 'error'
  reason?: string
}

async function handler(_request: NextRequest, _context: CronContext): Promise<NextResponse> {
  const supabase = await createClient('service_role')
  const results: ReminderResult[] = []
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  logger.info('Starting billing reminders cron', { date: today })

  try {
    // Get all unpaid invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('platform_invoices')
      .select(`
        id,
        invoice_number,
        tenant_id,
        total,
        due_date,
        status,
        grace_period_days,
        issued_at,
        tenants (
          name,
          email,
          billing_email
        )
      `)
      .in('status', ['draft', 'sent', 'overdue'])
      .order('due_date', { ascending: true })

    if (invoicesError) {
      throw new Error(`Error fetching invoices: ${invoicesError.message}`)
    }

    if (!invoices || invoices.length === 0) {
      logger.info('No unpaid invoices to process')
      return NextResponse.json({
        success: true,
        message: 'No unpaid invoices',
        sent: 0,
      })
    }

    // Process each invoice
    for (const invoice of invoices) {
      const reminderResults = await processInvoiceReminders(supabase, invoice, now)
      results.push(...reminderResults)
    }

    // Summary
    const sent = results.filter((r) => r.status === 'sent').length
    const skipped = results.filter((r) => r.status === 'skipped').length
    const errors = results.filter((r) => r.status === 'error').length

    logger.info('Billing reminders completed', {
      total: results.length,
      sent,
      skipped,
      errors,
    })

    return NextResponse.json({
      success: true,
      message: 'Reminders processed',
      summary: { sent, skipped, errors },
      results,
    })

  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    logger.error('Billing reminders cron failed', { error: message })

    return NextResponse.json(
      {
        success: false,
        error: message,
        results,
      },
      { status: 500 }
    )
  }
}

/**
 * Process reminders for a single invoice
 */
async function processInvoiceReminders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: {
    id: string
    invoice_number: string
    tenant_id: string
    total: number
    due_date: string
    status: string
    grace_period_days: number | null
    issued_at: string | null
    tenants: { name: string; email: string; billing_email: string | null } | null
  },
  now: Date
): Promise<ReminderResult[]> {
  const results: ReminderResult[] = []
  const dueDate = new Date(invoice.due_date)
  const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

  const baseResult = {
    tenant_id: invoice.tenant_id,
    invoice_id: invoice.id,
    invoice_number: invoice.invoice_number,
  }

  // Check existing reminders to avoid duplicates
  const { data: existingReminders } = await supabase
    .from('billing_reminders')
    .select('reminder_type, sent_at')
    .eq('platform_invoice_id', invoice.id)

  const sentTypes = new Set(existingReminders?.map((r) => r.reminder_type) || [])

  // Determine which reminders to send
  const remindersToSend: { type: string; subject: string; content: string }[] = []

  // 7 days before due date
  if (daysDiff === 7 && !sentTypes.has('upcoming_invoice')) {
    remindersToSend.push({
      type: 'upcoming_invoice',
      subject: `Proxima factura - ${invoice.invoice_number}`,
      content: `Su factura ${invoice.invoice_number} por ₲${Number(invoice.total).toLocaleString('es-PY')} vence en 7 dias (${dueDate.toLocaleDateString('es-PY')}). Puede realizar el pago desde su panel de administracion.`,
    })
  }

  // On due date
  if (daysDiff === 0 && !sentTypes.has('invoice_due')) {
    remindersToSend.push({
      type: 'invoice_due',
      subject: `Factura vence hoy - ${invoice.invoice_number}`,
      content: `Su factura ${invoice.invoice_number} por ₲${Number(invoice.total).toLocaleString('es-PY')} vence hoy. Por favor realice el pago para evitar cargos adicionales.`,
    })
  }

  // 7 days overdue
  if (daysDiff === -7 && !sentTypes.has('overdue_gentle')) {
    remindersToSend.push({
      type: 'overdue_gentle',
      subject: `Factura vencida - ${invoice.invoice_number}`,
      content: `Su factura ${invoice.invoice_number} por ₲${Number(invoice.total).toLocaleString('es-PY')} esta vencida hace 7 dias. Por favor regularice su situacion a la brevedad.`,
    })
  }

  // 14 days overdue
  if (daysDiff === -14 && !sentTypes.has('overdue_reminder')) {
    remindersToSend.push({
      type: 'overdue_reminder',
      subject: `Recordatorio urgente - Factura ${invoice.invoice_number}`,
      content: `Su factura ${invoice.invoice_number} por ₲${Number(invoice.total).toLocaleString('es-PY')} esta vencida hace 14 dias. Le pedimos contactarnos si tiene inconvenientes con el pago.`,
    })
  }

  // 30 days overdue
  if (daysDiff === -30 && !sentTypes.has('overdue_urgent')) {
    remindersToSend.push({
      type: 'overdue_urgent',
      subject: `URGENTE: Factura vencida - ${invoice.invoice_number}`,
      content: `Su factura ${invoice.invoice_number} por ₲${Number(invoice.total).toLocaleString('es-PY')} esta vencida hace 30 dias. Es importante regularizar su situacion. Contactenos si necesita asistencia.`,
    })
  }

  // Grace period ending (7 days before grace expires)
  if (invoice.grace_period_days && invoice.status === 'overdue') {
    const graceEndDate = new Date(dueDate)
    graceEndDate.setDate(graceEndDate.getDate() + invoice.grace_period_days)
    const daysUntilGraceEnds = Math.floor((graceEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

    if (daysUntilGraceEnds === 7 && !sentTypes.has('grace_period_warning')) {
      remindersToSend.push({
        type: 'grace_period_warning',
        subject: `Periodo de gracia por terminar - ${invoice.invoice_number}`,
        content: `Su periodo de gracia para la factura ${invoice.invoice_number} termina en 7 dias (${graceEndDate.toLocaleDateString('es-PY')}). Por favor realice el pago antes de esa fecha.`,
      })
    }
  }

  // Send each reminder
  for (const reminder of remindersToSend) {
    try {
      await sendReminder(supabase, invoice, reminder)
      results.push({
        ...baseResult,
        reminder_type: reminder.type,
        status: 'sent',
      })
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      results.push({
        ...baseResult,
        reminder_type: reminder.type,
        status: 'error',
        reason: errorMsg,
      })
    }
  }

  // If no reminders were needed
  if (remindersToSend.length === 0) {
    results.push({
      ...baseResult,
      reminder_type: 'none',
      status: 'skipped',
      reason: 'No reminders due',
    })
  }

  return results
}

/**
 * Send a reminder (save to database and notify)
 */
async function sendReminder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: {
    id: string
    invoice_number: string
    tenant_id: string
    tenants: { name: string; email: string; billing_email: string | null } | null
  },
  reminder: { type: string; subject: string; content: string }
): Promise<void> {
  const now = new Date().toISOString()

  // Save reminder record
  await supabase.from('billing_reminders').insert({
    tenant_id: invoice.tenant_id,
    platform_invoice_id: invoice.id,
    reminder_type: reminder.type,
    channel: 'email',
    sent_at: now,
    subject: reminder.subject,
    content: reminder.content,
  })

  // Create notification for clinic admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('tenant_id', invoice.tenant_id)
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (adminProfile) {
    await supabase.from('notifications').insert({
      user_id: adminProfile.id,
      title: reminder.subject,
      message: reminder.content,
    })
  }

  // In production, this would integrate with an email service
  // e.g., Resend, SendGrid, AWS SES
  logger.info('Reminder sent', {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    tenantId: invoice.tenant_id,
    reminderType: reminder.type,
    email: invoice.tenants?.billing_email || invoice.tenants?.email,
  })
}

export const POST = createCronHandler(handler)
