import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// TICKET-BIZ-005: POST /api/invoices/[id]/refund - Process a refund (atomic)
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

  // Only admins can process refunds
  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    const body = await request.json();
    const { amount, reason, payment_id } = body;

    // Basic validation before calling RPC
    if (!amount || typeof amount !== 'number') {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { field: 'amount' } });
    }

    if (!reason || typeof reason !== 'string') {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'reason' } });
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
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // RPC returns JSONB with success flag
    if (!result.success) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { reason: result.error } });
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
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
