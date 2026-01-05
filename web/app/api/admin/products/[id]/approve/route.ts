import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * POST /api/admin/products/[id]/approve
 * Approve or reject a product for the global catalog
 */
export const POST = withApiAuthParams(
  async ({ request, user, profile, supabase }: ApiHandlerContext, params: { id: string }) => {
    const { id } = params

    try {
      const body = await request.json()
      const { action, rejection_reason } = body

      if (!action || !['verify', 'reject', 'needs_review'].includes(action)) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'Acción inválida. Use: verify, reject, needs_review' },
        })
      }

      // Get the product
      const { data: product, error: fetchError } = await supabase
        .from('store_products')
        .select('id, name, created_by_tenant_id, verification_status')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (fetchError || !product) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { message: 'Producto no encontrado' },
        })
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        verification_status:
          action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'needs_review',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      }

      // If verified, mark as global catalog and clear tenant_id
      if (action === 'verify') {
        updateData.is_global_catalog = true
        // Keep created_by_tenant_id for reference but product becomes global
        // Don't change tenant_id if it was already null
      }

      // Store rejection reason in attributes if rejected
      if (action === 'reject' && rejection_reason) {
        updateData.attributes = {
          rejection_reason,
          rejected_at: new Date().toISOString(),
        }
      }

      const { data: updated, error } = await supabase
        .from('store_products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // TODO: Send notification to the clinic that submitted the product

      return NextResponse.json({
        success: true,
        product: updated,
        message:
          action === 'verify'
            ? 'Producto verificado y añadido al catálogo global'
            : action === 'reject'
              ? 'Producto rechazado'
              : 'Producto marcado para revisión',
      })
    } catch (error) {
      logger.error('Error approving product', {
        tenantId: profile.tenant_id,
        userId: user.id,
        productId: id,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'] }
)
