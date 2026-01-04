import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuthParams, isStaff, type ApiHandlerContext } from '@/lib/auth'

// TICKET-BIZ-005: POST /api/invoices/[id]/payments - Record a payment (atomic)
// Rate limited: 10 requests per minute (financial operations)
export const POST = withApiAuthParams<{ id: string }>(
  async (ctx: ApiHandlerContext, params: { id: string }) => {
    const { user, profile, supabase, request } = ctx
    const { id: invoiceId } = params

    try {
      const body = await request.json()
      const { amount, payment_method, reference_number, notes } = body

      // Basic validation before calling RPC
      if (!amount || typeof amount !== 'number') {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { field: 'amount' },
        })
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
        p_received_by: user.id,
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
      await logAudit('RECORD_PAYMENT', `invoices/${invoiceId}/payments/${result.payment_id}`, {
        amount,
        payment_method: payment_method || 'cash',
        new_status: result.status,
      })

      return NextResponse.json(
        {
          payment: { id: result.payment_id },
          invoice: {
            amount_paid: result.amount_paid,
            amount_due: result.amount_due,
            status: result.status,
          },
        },
        { status: 201 }
      )
    } catch (e) {
      console.error('Error recording payment:', e)
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'financial' }
)

// GET /api/invoices/[id]/payments - List payments for an invoice
export const GET = withApiAuthParams<{ id: string }>(
  async (ctx: ApiHandlerContext, params: { id: string }) => {
    const { user, profile, supabase } = ctx
    const { id: invoiceId } = params

    try {
      // Verify invoice exists and user has access
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id, owner_id, tenant_id')
        .eq('id', invoiceId)
        .single()

      if (!invoice) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
      }

      const userIsStaff = isStaff(profile)
      if (!userIsStaff && invoice.owner_id !== user.id) {
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
      }

      const { data: payments, error } = await supabase
        .from('payments')
        .select(
          `
            *,
            receiver:profiles!payments_received_by_fkey(full_name)
          `
        )
        .eq('invoice_id', invoiceId)
        .order('paid_at', { ascending: false })

      if (error) throw error

      return NextResponse.json(payments)
    } catch (e) {
      console.error('Error loading payments:', e)
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }
)
