import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth/api-wrapper'
import { VALIDATION_ERRORS, NOT_FOUND_ERRORS, DATABASE_ERRORS } from '@/lib/i18n/errors'

export const dynamic = 'force-dynamic'

type AdjustmentReason =
  | 'physical_count'
  | 'damage'
  | 'theft'
  | 'expired'
  | 'return'
  | 'correction'
  | 'other'

interface AdjustRequest {
  product_id: string
  new_quantity: number
  reason: AdjustmentReason
  notes?: string
}

/**
 * POST /api/inventory/adjust
 * Adjust stock for a product (creates adjustment transaction)
 * Requires vet or admin role
 */
export const POST = withApiAuth(
  async ({ profile, supabase, request, log }: ApiHandlerContext) => {
    // Parse request body
    let body: AdjustRequest
    try {
      body = await request.json()
    } catch (_error: unknown) {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: VALIDATION_ERRORS.INVALID_FORMAT },
      })
    }

    const { product_id, new_quantity, reason, notes } = body

    // Validate required fields
    if (!product_id) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: VALIDATION_ERRORS.REQUIRED_FIELD },
      })
    }

    if (new_quantity === undefined || new_quantity < 0) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: VALIDATION_ERRORS.INVALID_QUANTITY },
      })
    }

    if (!reason) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: VALIDATION_ERRORS.REQUIRED_FIELD },
      })
    }

    try {
      // Use atomic function with proper row locking to prevent race conditions
      const { data: result, error: rpcError } = await supabase.rpc('adjust_inventory_atomic', {
        p_tenant_id: profile.tenant_id,
        p_product_id: product_id,
        p_new_quantity: new_quantity,
        p_reason: reason,
        p_notes: notes,
        p_performed_by: profile.id,
      })

      if (rpcError) {
        log.error('Error adjusting inventory (RPC)', { error: rpcError })
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
        old_stock: result.old_stock,
        new_stock: result.new_stock,
        difference: result.difference,
        type: result.type,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      log.error('Exception in inventory adjust', { error: error.message })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: DATABASE_ERRORS.SERVER_ERROR },
      })
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
