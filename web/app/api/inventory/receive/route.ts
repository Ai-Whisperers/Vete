import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth/api-wrapper'
import { VALIDATION_ERRORS, NOT_FOUND_ERRORS, DATABASE_ERRORS } from '@/lib/i18n/errors'

export const dynamic = 'force-dynamic'

interface ReceiveRequest {
  product_id: string
  quantity: number
  unit_cost?: number
  notes?: string
  batch_number?: string
  expiry_date?: string
}

/**
 * POST /api/inventory/receive
 * Receive stock for a product (creates purchase transaction)
 * Requires vet or admin role
 */
export const POST = withApiAuth(
  async ({ profile, supabase, request, log }: ApiHandlerContext) => {
    // Parse request body
    let body: ReceiveRequest
    try {
      body = await request.json()
    } catch (_error: unknown) {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: VALIDATION_ERRORS.INVALID_FORMAT },
      })
    }

    const { product_id, quantity, unit_cost, notes, batch_number, expiry_date } = body

    // Validate required fields
    if (!product_id) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: VALIDATION_ERRORS.REQUIRED_FIELD },
      })
    }

    if (!quantity || quantity <= 0) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: VALIDATION_ERRORS.INVALID_QUANTITY },
      })
    }

    try {
      // Use atomic function with proper row locking to prevent race conditions
      const { data: result, error: rpcError } = await supabase.rpc('receive_inventory_atomic', {
        p_tenant_id: profile.tenant_id,
        p_product_id: product_id,
        p_quantity: quantity,
        p_unit_cost: unit_cost,
        p_notes: notes,
        p_batch_number: batch_number,
        p_expiry_date: expiry_date,
        p_performed_by: profile.id,
      })

      if (rpcError) {
        log.error('Error receiving inventory (RPC)', { error: rpcError })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          details: { message: DATABASE_ERRORS.QUERY_FAILED },
        })
      }

      if (!result?.success) {
        if (result?.error_code === 'not_found') {
          return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
            details: { message: result?.error || NOT_FOUND_ERRORS.PRODUCT },
          })
        }
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: result?.error || VALIDATION_ERRORS.INVALID_FORMAT },
        })
      }

      return NextResponse.json({
        success: true,
        new_stock: result.new_stock,
        new_wac: result.new_wac,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      log.error('Exception in inventory receive', { error: error.message })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: DATABASE_ERRORS.SERVER_ERROR },
      })
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
