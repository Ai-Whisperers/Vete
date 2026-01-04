import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withAuth } from '@/lib/api/with-auth'

// TICKET-BIZ-005: POST /api/invoices/[id]/refund - Process a refund (atomic)
// Rate limited: 5 requests per hour (refund operations - very strict for fraud prevention)
export const POST = withAuth<{ id: string }>(
  async ({ user, profile, supabase, request }, { params }) => {
    const { id: invoiceId } = await params

    try {
      const body = await request.json()
      const { amount, reason, payment_id } = body

      // Basic validation before calling RPC
      if (!amount || typeof amount !== 'number') {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { field: 'amount' },
        })
      }

      if (!reason || typeof reason !== 'string') {
        return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { field: 'reason' } })
      }

      // Use atomic RPC function to prevent race conditions
      // The function handles row locking, validation, and atomic updates
      const { data: result, error: rpcError } = await supabase.rpc('process_invoice_refund', {
        p_invoice_id: invoiceId,
        p_tenant_id: profile.tenant_id,
        p_amount: amount,
        p_reason: reason,
        p_payment_id: payment_id || null,
        p_processed_by: user.id,
      })

      if (rpcError) {
        console.error('RPC error:', rpcError)
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      // RPC returns JSONB with success flag
      if (!result.success) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { reason: result.error },
        })
      }

      // Audit log
      const { logAudit } = await import('@/lib/audit')
      await logAudit('PROCESS_REFUND', `invoices/${invoiceId}/refunds/${result.refund_id}`, {
        amount,
        reason,
        new_status: result.status,
      })

      return NextResponse.json(
        {
          refund: { id: result.refund_id },
          invoice: {
            amount_paid: result.amount_paid,
            amount_due: result.amount_due,
            status: result.status,
          },
        },
        { status: 201 }
      )
    } catch (e) {
      console.error('Error processing refund:', e)
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  // Only admins can process refunds, with very strict rate limiting
  { roles: ['admin'], rateLimit: 'refund' }
)
