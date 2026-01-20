import { NextResponse } from 'next/server'
import { withApiAuthParams, isStaff, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { InvoiceService } from '@/lib/services'

interface InvoiceItem {
  service_id?: string
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  discount_percent?: number
}

/**
 * GET /api/invoices/[id]
 * Get single invoice with items, payments, and refunds
 */
export const GET = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const { id } = params
    const userIsStaff = isStaff(profile)

    // Delegate to service
    const service = new InvoiceService(supabase)
    const result = await service.getById(id, profile.tenant_id, user.id, userIsStaff)

    if (!result.success) {
      if (result.error.includes('no encontrada')) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { reason: result.error },
        })
      }
      if (result.error.includes('permisos')) {
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
          details: { reason: result.error },
        })
      }
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { reason: result.error },
      })
    }

    return NextResponse.json(result.data)
  }
)

/**
 * PATCH /api/invoices/[id]
 * Update invoice (full edit for drafts, status/notes only for sent)
 */
export const PATCH = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const { id } = params

    // Parse request body
    const body = await request.json()

    // Delegate to service
    const service = new InvoiceService(supabase)
    const result = await service.update(id, profile.tenant_id, user.id, body)

    if (!result.success) {
      if (result.error.includes('no encontrada')) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { reason: result.error },
        })
      }
      if (result.error.includes('solo pueden')) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { reason: result.error },
        })
      }
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { reason: result.error },
      })
    }

    return NextResponse.json(result.data)
  },
  { roles: ['vet', 'admin'], rateLimit: 'financial' }
)

/**
 * DELETE /api/invoices/[id]
 * Delete invoice (hard delete for drafts, void for sent)
 */
export const DELETE = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const { id } = params

    // Delegate to service
    const service = new InvoiceService(supabase)
    const result = await service.delete(id, profile.tenant_id, user.id)

    if (!result.success) {
      if (result.error.includes('no encontrada')) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { reason: result.error },
        })
      }
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { reason: result.error },
      })
    }

    return NextResponse.json({ success: true })
  },
  { roles: ['admin'], rateLimit: 'financial' }
)
