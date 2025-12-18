import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/invoices/[id]/send - Send invoice to client
export async function POST(request: Request, { params }: RouteParams) {
  const { id: invoiceId } = await params;
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

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede enviar facturas' }, { status: 403 });
  }

  try {
    // Get invoice with owner info
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id, status, invoice_number, total, tenant_id,
        owner:profiles!invoices_owner_id_fkey(id, email, full_name, phone)
      `)
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    if (invoice.status === 'void') {
      return NextResponse.json({ error: 'No se puede enviar una factura anulada' }, { status: 400 });
    }

    // Update status to sent if draft
    if (invoice.status === 'draft') {
      await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
    }

    // Queue notification
    const owner = invoice.owner as any;
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
          total: invoice.total
        }
      });
    }

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('SEND_INVOICE', `invoices/${invoiceId}`, {
      invoice_number: invoice.invoice_number,
      sent_to: owner?.email
    });

    return NextResponse.json({
      success: true,
      message: 'Factura enviada correctamente'
    });
  } catch (e) {
    console.error('Error sending invoice:', e);
    return NextResponse.json({ error: 'Error al enviar factura' }, { status: 500 });
  }
}
