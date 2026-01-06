/**
 * Platform Admin - Mark Commission Invoice as Sent
 *
 * POST /api/platform/commission-invoices/[id]/send
 *
 * Body:
 * {
 *   notes?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function isPlatformAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'platform_admin'
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id: invoiceId } = await params
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // 2. Platform admin check
  const isAdmin = await isPlatformAdmin(supabase, user.id)
  if (!isAdmin) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Acceso restringido a administradores de plataforma' },
    })
  }

  try {
    // Parse body (optional notes)
    let notes: string | undefined
    try {
      const body = await request.json()
      notes = body.notes
    } catch {
      // No body is fine
    }

    // Get invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('store_commission_invoices')
      .select('id, status, tenant_id, invoice_number')
      .eq('id', invoiceId)
      .single()

    if (fetchError || !invoice) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'invoice', message: 'Factura no encontrada' },
      })
    }

    // Check status
    if (invoice.status !== 'draft') {
      return apiError('CONFLICT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: `No se puede enviar una factura en estado "${invoice.status}"` },
      })
    }

    // Update status to sent
    const { data: updated, error: updateError } = await supabase
      .from('store_commission_invoices')
      .update({
        status: 'sent',
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (updateError) throw updateError

    // TODO: Send actual email/notification to clinic
    // This would integrate with the notification system

    // Log audit
    await supabase.from('audit_logs').insert({
      tenant_id: invoice.tenant_id,
      user_id: user.id,
      action: 'commission_invoice_sent',
      resource: 'store_commission_invoices',
      resource_id: invoiceId,
      details: {
        invoice_number: invoice.invoice_number,
        notes,
      },
    })

    logger.info('Commission invoice marked as sent', {
      invoiceId,
      tenantId: invoice.tenant_id,
      adminId: user.id,
      invoiceNumber: invoice.invoice_number,
    })

    return NextResponse.json({
      success: true,
      invoice: updated,
      message: 'Factura marcada como enviada',
    })
  } catch (e) {
    logger.error('Platform admin: Error marking invoice as sent', {
      invoiceId,
      userId: user.id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al actualizar factura' },
    })
  }
}
