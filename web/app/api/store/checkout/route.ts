import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { requireFeature } from '@/lib/features/server'

// TICKET-BIZ-003: Checkout API that validates stock and decrements inventory
// TICKET-BIZ-004: Server-side stock validation
// Uses atomic process_checkout function for consistency
//
// CRITICAL: process_checkout function updated in migration 100_fix_checkout_product_lookup.sql
// to lookup products by UUID ID (not SKU) since cart sends product.id

interface CartItem {
  id: string
  name: string
  price: number
  type: 'service' | 'product'
  quantity: number
  requires_prescription?: boolean
  prescription_file?: string
}

interface CheckoutRequest {
  items: CartItem[]
  clinic: string
  notes?: string
}

interface StockError {
  id: string
  name: string
  requested: number
  available: number
}

interface PrescriptionError {
  id: string
  name: string
  error: string
}

// POST /api/store/checkout - Process checkout (atomic)
// Rate limited: 5 requests per minute (checkout operations - strict for fraud prevention)
export const POST = withApiAuth(
  async ({ user, profile, supabase, request }: ApiHandlerContext) => {
    // Parse request body
    let body: CheckoutRequest
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'JSON inválido' },
      })
    }

    const { items, clinic, notes } = body

    if (!items || items.length === 0) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'El carrito está vacío' },
      })
    }

    // Validate clinic matches user's tenant
    if (clinic !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
        details: { message: 'Clínica no válida' },
      })
    }

    // Check if tenant has ecommerce feature enabled
    const featureCheck = await requireFeature(profile.tenant_id, 'ecommerce')
    if (featureCheck) return featureCheck

    // Separate products and services for logging/metrics
    const productItems = items.filter((item) => item.type === 'product')
    const serviceItems = items.filter((item) => item.type === 'service')

    // Attempt atomic checkout using database function
    // This ensures all operations (validation, invoice creation, stock decrement) happen atomically
    try {
      const { data: checkoutResult, error: checkoutError } = await supabase.rpc(
        'process_checkout',
        {
          p_tenant_id: clinic,
          p_user_id: user.id,
          p_items: JSON.stringify(
            items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              type: item.type,
              requires_prescription: item.requires_prescription,
              prescription_file: item.prescription_file,
            }))
          ),
          p_notes: notes || 'Pedido desde tienda online',
        }
      )

      if (checkoutError) {
        logger.error('Atomic checkout failed', {
          userId: user.id,
          tenantId: clinic,
          itemCount: items.length,
          error: checkoutError instanceof Error ? checkoutError.message : String(checkoutError),
        })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          details: { message: checkoutError.message },
        })
      }

      // Parse the result from the database function
      const result = checkoutResult as {
        success: boolean
        error?: string
        stock_errors?: StockError[]
        prescription_errors?: PrescriptionError[]
        invoice?: {
          id: string
          invoice_number: string
          total: number
          status: string
        }
      }

      // Handle stock errors returned by the function
      if (!result.success) {
        if (result.stock_errors && result.stock_errors.length > 0) {
          return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
            details: {
              message: result.error || 'Stock insuficiente para algunos productos',
              stockErrors: result.stock_errors,
            },
          })
        }

        if (result.prescription_errors && result.prescription_errors.length > 0) {
          return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
            details: {
              message: result.error || 'Falta receta médica para algunos productos',
              prescriptionErrors: result.prescription_errors,
            },
          })
        }

        return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          details: { message: result.error || 'Error al procesar el pedido' },
        })
      }

      // Success - cart clearing and reservation conversion now handled atomically
      // in the process_checkout database function (migration 021)

      // Log the transaction
      const { logAudit } = await import('@/lib/audit')
      await logAudit('CHECKOUT', `invoices/${result.invoice?.id}`, {
        total: result.invoice?.total,
        item_count: items.length,
        product_count: productItems.length,
        service_count: serviceItems.length,
      })

      return NextResponse.json(
        {
          success: true,
          invoice: result.invoice,
        },
        { status: 201 }
      )
    } catch (e) {
      logger.error('Checkout error', {
        userId: user.id,
        tenantId: profile.tenant_id,
        itemCount: items.length,
        error: e instanceof Error ? e.message : String(e),
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: e instanceof Error ? e.message : 'Error al procesar el pedido' },
      })
    }
  },
  { rateLimit: 'checkout' }
)
