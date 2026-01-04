import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/invoices/[id]/send - Send invoice to client
export async function POST(request: Request, { params }: RouteParams) {
  const { id: invoiceId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    // Get invoice with owner info
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(
        `
        id, status, invoice_number, total, tenant_id,
        owner:profiles!invoices_owner_id_fkey(id, email, full_name, phone)
      `
      )
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (invoiceError || !invoice) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    if (invoice.status === 'void') {
      return apiError('CONFLICT', HTTP_STATUS.BAD_REQUEST, {
        details: { reason: 'No se puede enviar una factura anulada' },
      })
    }

    // Update status to sent if draft
    if (invoice.status === 'draft') {
      await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
    }

    // Queue notification
    const owner = invoice.owner as any
    if (owner?.email) {
      await supabase.from('notification_queue').insert({
        tenant_id: profile.tenant_id,
        channel: 'email',
        recipient_id: owner.id,
        recipient_address: owner.email,
        template_id: null, // Will be looked up by type
        subject: `Factura ${invoice.invoice_number}`,
        body: `Hola ${owner.full_name}, tienes una nueva factura por Gs. ${invoice.total.toLocaleString()}. Por favor revísala en tu portal de cliente.`,
        priority: 'normal',
        metadata: {
          invoice_id: invoiceId,
          invoice_number: invoice.invoice_number,
          total: invoice.total,
        },
      })
    }

    // Audit log
    const { logAudit } = await import('@/lib/audit')
    await logAudit('SEND_INVOICE', `invoices/${invoiceId}`, {
      invoice_number: invoice.invoice_number,
      sent_to: owner?.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Factura enviada correctamente',
    })
  } catch (e) {
    console.error('Error sending invoice:', e)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
