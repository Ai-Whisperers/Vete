import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// TICKET-BIZ-005: POST /api/invoices/[id]/payments - Record a payment (atomic)
export async function POST(request: Request, { params }: RouteParams) {
  const { id: invoiceId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    const body = await request.json();
    const { amount, payment_method, reference_number, notes } = body;

    // Basic validation before calling RPC
    if (!amount || typeof amount !== 'number') {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { field: 'amount' } });
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
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // RPC returns JSONB with success flag
    if (!result.success) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { reason: result.error } });
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
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// GET /api/invoices/[id]/payments - List payments for an invoice
export async function GET(request: Request, { params }: RouteParams) {
  const { id: invoiceId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND);
  }

  try {
    // Verify invoice exists and user has access
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, owner_id, tenant_id')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND);
    }

    const isStaff = ['vet', 'admin'].includes(profile.role);
    if (!isStaff && invoice.owner_id !== user.id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN);
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
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
