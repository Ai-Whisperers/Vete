import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/invoices/[id]/payments - Record a payment
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
    return NextResponse.json({ error: 'Solo el personal puede registrar pagos' }, { status: 403 });
  }

  try {
    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status, total, amount_paid, amount_due, tenant_id')
      .eq('id', invoiceId)
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    if (invoice.status === 'void') {
      return NextResponse.json({ error: 'No se puede pagar una factura anulada' }, { status: 400 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Esta factura ya está pagada' }, { status: 400 });
    }

    const body = await request.json();
    const { amount, payment_method, reference_number, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 });
    }

    if (amount > invoice.amount_due) {
      return NextResponse.json({
        error: `El monto excede el saldo pendiente (${invoice.amount_due})`
      }, { status: 400 });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        tenant_id: profile.tenant_id,
        invoice_id: invoiceId,
        amount,
        payment_method: payment_method || 'cash',
        reference_number,
        notes,
        received_by: user.id,
        paid_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update invoice totals
    const newAmountPaid = invoice.amount_paid + amount;
    const newAmountDue = invoice.total - newAmountPaid;
    const newStatus = newAmountDue <= 0 ? 'paid' : 'partial';

    await supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', invoiceId);

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('RECORD_PAYMENT', `invoices/${invoiceId}/payments/${payment.id}`, {
      amount,
      payment_method,
      new_status: newStatus
    });

    return NextResponse.json({
      payment,
      invoice: {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newStatus
      }
    }, { status: 201 });
  } catch (e) {
    console.error('Error recording payment:', e);
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 });
  }
}

// GET /api/invoices/[id]/payments - List payments for an invoice
export async function GET(request: Request, { params }: RouteParams) {
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

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  try {
    // Verify invoice exists and user has access
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, owner_id, tenant_id')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    const isStaff = ['vet', 'admin'].includes(profile.role);
    if (!isStaff && invoice.owner_id !== user.id) {
      return NextResponse.json({ error: 'No tienes acceso a esta factura' }, { status: 403 });
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        receiver:profiles!payments_received_by_fkey(full_name)
      `)
      .eq('invoice_id', invoiceId)
      .order('paid_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(payments);
  } catch (e) {
    console.error('Error loading payments:', e);
    return NextResponse.json({ error: 'Error al cargar pagos' }, { status: 500 });
  }
}
