import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/invoices/[id]/refund - Process a refund
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

  // Only admins can process refunds
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden procesar reembolsos' }, { status: 403 });
  }

  try {
    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status, total, amount_paid, tenant_id, invoice_number')
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    if (invoice.amount_paid <= 0) {
      return NextResponse.json({ error: 'No hay pagos para reembolsar' }, { status: 400 });
    }

    const body = await request.json();
    const { amount, reason, payment_id } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 });
    }

    if (amount > invoice.amount_paid) {
      return NextResponse.json({
        error: `El monto excede lo pagado (${invoice.amount_paid})`
      }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Se requiere una razón para el reembolso' }, { status: 400 });
    }

    // Create refund record
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        tenant_id: profile.tenant_id,
        invoice_id: invoiceId,
        payment_id: payment_id || null,
        amount,
        reason,
        refunded_by: user.id,
        refunded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (refundError) throw refundError;

    // Update invoice totals
    const newAmountPaid = invoice.amount_paid - amount;
    const newAmountDue = invoice.total - newAmountPaid;
    let newStatus = invoice.status;

    if (newAmountPaid <= 0) {
      newStatus = 'refunded';
    } else if (newAmountDue > 0) {
      newStatus = 'partial';
    }

    await supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newStatus
      })
      .eq('id', invoiceId);

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('PROCESS_REFUND', `invoices/${invoiceId}/refunds/${refund.id}`, {
      amount,
      reason,
      invoice_number: invoice.invoice_number,
      new_status: newStatus
    });

    return NextResponse.json({
      refund,
      invoice: {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newStatus
      }
    }, { status: 201 });
  } catch (e) {
    console.error('Error processing refund:', e);
    return NextResponse.json({ error: 'Error al procesar reembolso' }, { status: 500 });
  }
}
