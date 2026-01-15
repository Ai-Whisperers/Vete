import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'

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
  async ({ profile, supabase, request }: ApiHandlerContext) => {
    // Parse request body
    let body: ReceiveRequest
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'JSON inválido' },
      })
    }

    const { product_id, quantity, unit_cost, notes, batch_number, expiry_date } = body

    // Validate required fields
    if (!product_id) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'product_id es requerido' },
      })
    }

    if (!quantity || quantity <= 0) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'La cantidad debe ser mayor a 0' },
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
        logger.error('Error receiving inventory (RPC)', { error: rpcError })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          details: { message: 'Error al recibir inventario' },
        })
      }

      if (!result?.success) {
        if (result?.error_code === 'not_found') {
          return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
            details: { message: result?.error || 'Inventario no encontrado' },
          })
        }
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: result?.error || 'Error al recibir inventario' },
        })
      }

      return NextResponse.json({
        success: true,
        new_stock: result.new_stock,
        new_wac: result.new_wac,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.error('Exception in inventory receive', { error: error.message })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: 'Error del servidor' },
      })
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
