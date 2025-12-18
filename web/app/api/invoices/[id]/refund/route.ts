import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// TICKET-BIZ-005: POST /api/invoices/[id]/refund - Process a refund (atomic)
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
    const body = await request.json();
    const { amount, reason, payment_id } = body;

    // Basic validation before calling RPC
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Se requiere una razón para el reembolso' }, { status: 400 });
    }

    // Use atomic RPC function to prevent race conditions
    // The function handles row locking, validation, and atomic updates
    const { data: result, error: rpcError } = await supabase.rpc('process_invoice_refund', {
      p_invoice_id: invoiceId,
      p_tenant_id: profile.tenant_id,
      p_amount: amount,
      p_reason: reason,
      p_payment_id: payment_id || null,
      p_processed_by: user.id
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return NextResponse.json({ error: 'Error al procesar reembolso' }, { status: 500 });
    }

    // RPC returns JSONB with success flag
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Audit log
    const { logAudit } = await import('@/lib/audit');
    await logAudit('PROCESS_REFUND', `invoices/${invoiceId}/refunds/${result.refund_id}`, {
      amount,
      reason,
      new_status: result.status
    });

    return NextResponse.json({
      refund: { id: result.refund_id },
      invoice: {
        amount_paid: result.amount_paid,
        amount_due: result.amount_due,
        status: result.status
      }
    }, { status: 201 });
  } catch (e) {
    console.error('Error processing refund:', e);
    return NextResponse.json({ error: 'Error al procesar reembolso' }, { status: 500 });
  }
}
