import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'

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
  async ({ profile, supabase, request }: ApiHandlerContext) => {
    // Parse request body
    let body: AdjustRequest
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'JSON inválido' },
      })
    }

    const { product_id, new_quantity, reason, notes } = body

    // Validate required fields
    if (!product_id) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'product_id es requerido' },
      })
    }

    if (new_quantity === undefined || new_quantity < 0) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'new_quantity debe ser 0 o mayor' },
      })
    }

    if (!reason) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'reason es requerido' },
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
        logger.error('Error adjusting inventory (RPC)', { error: rpcError })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          details: { message: 'Error al ajustar inventario' },
        })
      }

      if (!result?.success) {
        if (result?.error_code === 'not_found') {
          return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
            details: { message: result?.error || 'Inventario no encontrado' },
          })
        }
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: result?.error || 'Error al ajustar inventario' },
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
      logger.error('Exception in inventory adjust', { error: error.message })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: 'Error del servidor' },
      })
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
