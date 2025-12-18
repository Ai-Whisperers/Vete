import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// TICKET-BIZ-005: POST /api/invoices/[id]/payments - Record a payment (atomic)
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
    const body = await request.json();
    const { amount, payment_method, reference_number, notes } = body;

    // Basic validation before calling RPC
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    // Use atomic RPC function to prevent race conditions
    // The function handles row locking, validation, and atomic updates
    const { data: result, error: rpcError } = await supabase.rpc('record_invoice_payment', {
      p_invoice_id: invoiceId,
      p_tenant_id: profile.tenant_id,
      p_amount: amount,
      p_payment_method: payment_method || 'cash',
      p_reference_number: reference_number || null,
      p_notes: notes || null,
      p_received_by: user.id
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return NextResponse.json({ error: 'Error al procesar pago' }, { status: 500 });
    }

    // RPC returns JSONB with success flag
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('RECORD_PAYMENT', `invoices/${invoiceId}/payments/${result.payment_id}`, {
      amount,
      payment_method: payment_method || 'cash',
      new_status: result.status
    });

    return NextResponse.json({
      payment: { id: result.payment_id },
      invoice: {
        amount_paid: result.amount_paid,
        amount_due: result.amount_due,
        status: result.status
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
