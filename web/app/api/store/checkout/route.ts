import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { requireFeature } from '@/lib/features/server'
import { checkoutRequestSchema } from '@/lib/schemas/store'

// TICKET-BIZ-003: Checkout API that validates stock and decrements inventory
// TICKET-BIZ-004: Server-side stock validation
// FEAT-013: Prescription verification with pet-specific validation
// Uses atomic process_checkout function for consistency
//
// SEC-024: Client-supplied prices are IGNORED by process_checkout().
// The RPC function looks up actual prices from store_products/services tables.
// Price mismatches are logged to financial_audit_logs for security monitoring.
// See migration 069_fix_checkout_price_validation.sql

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

interface PrescriptionValidationResult {
  product_id: string
  product_name: string
  has_valid_prescription: boolean
}

// POST /api/store/checkout - Process checkout (atomic)
// Rate limited: 5 requests per minute (checkout operations - strict for fraud prevention)
export const POST = withApiAuth(
  async ({ user, profile, supabase, request, log }: ApiHandlerContext) => {
    // Parse and validate request body with Zod schema
    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'JSON inválido' },
      })
    }

    const validationResult = checkoutRequestSchema.safeParse(rawBody)
    if (!validationResult.success) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: {
          message: 'Datos de checkout inválidos',
          errors: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      })
    }

    const { items, clinic, notes, pet_id } = validationResult.data

    // AUDIT-106: Get idempotency key from header or body
    const idempotencyKey = request.headers.get('Idempotency-Key')
      || (rawBody as Record<string, unknown>).idempotencyKey as string | undefined
      || null

    // AUDIT-106: If idempotency key provided, check for existing invoice
    if (idempotencyKey) {
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, status')
        .eq('tenant_id', profile.tenant_id)
        .eq('idempotency_key', idempotencyKey)
        .single()

      if (existingInvoice) {
        log.info('Idempotent checkout - returning existing invoice', {
          action: 'checkout.idempotent',
          invoiceId: existingInvoice.id,
          invoiceNumber: existingInvoice.invoice_number,
        })
        return NextResponse.json({
          success: true,
          invoice: {
            id: existingInvoice.id,
            invoice_number: existingInvoice.invoice_number,
            total: existingInvoice.total,
            status: existingInvoice.status,
          },
          message: 'Pedido existente (respuesta idempotente)',
        })
      }
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

    // Check for prescription items
    const prescriptionItems = items.filter((item) => item.requires_prescription)

    log.info('Processing checkout', {
      action: 'checkout.start',
      itemCount: items.length,
      productCount: productItems.length,
      serviceCount: serviceItems.length,
      prescriptionItemCount: prescriptionItems.length,
    })

    // FEAT-013: Prescription verification for products requiring prescription
    if (prescriptionItems.length > 0) {
      // Require pet_id for prescription items
      if (!pet_id) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: {
            message: 'Debe seleccionar una mascota para productos que requieren receta médica',
            code: 'PET_REQUIRED_FOR_PRESCRIPTION',
          },
        })
      }

      // Verify the pet belongs to this user
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('id, name, owner_id')
        .eq('id', pet_id)
        .eq('owner_id', user.id)
        .single()

      if (petError || !pet) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: {
            message: 'Mascota no encontrada o no pertenece a su cuenta',
            code: 'INVALID_PET',
          },
        })
      }

      // Get prescription product IDs
      const prescriptionProductIds = prescriptionItems.map((item) => item.id)

      // Verify prescriptions using database function
      const { data: prescriptionCheck, error: prescriptionError } = await supabase.rpc(
        'verify_prescription_products',
        {
          p_pet_id: pet_id,
          p_product_ids: prescriptionProductIds,
          p_tenant_id: clinic,
        }
      )

      if (prescriptionError) {
        log.error('Prescription verification failed', {
          action: 'checkout.prescription_error',
          error: prescriptionError instanceof Error ? prescriptionError : new Error(String(prescriptionError)),
        })
        // Fall through to allow order with pending_prescription status
      } else if (prescriptionCheck) {
        const results = prescriptionCheck as PrescriptionValidationResult[]
        const missingPrescriptions = results.filter((r) => !r.has_valid_prescription)

        if (missingPrescriptions.length > 0) {
          // Log which items are missing prescriptions but continue with pending_prescription status
          log.info('Products missing valid prescription', {
            action: 'checkout.prescription_missing',
            products: missingPrescriptions.map((p) => p.product_name),
            petId: pet_id,
          })
        }
      }
    }

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
              prescription_file_url: item.prescription_file_url,
            }))
          ),
          p_notes: notes || 'Pedido desde tienda online',
          // AUDIT-106: Pass idempotency key to store in invoice
          p_idempotency_key: idempotencyKey,
        }
      )

      if (checkoutError) {
        log.error('Atomic checkout failed', {
          action: 'checkout.error',
          itemCount: items.length,
          error: checkoutError instanceof Error ? checkoutError : new Error(String(checkoutError)),
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

      log.info('Checkout completed successfully', {
        action: 'checkout.success',
        resourceType: 'invoice',
        resourceId: result.invoice?.id,
        total: result.invoice?.total,
        itemCount: items.length,
      })

      return NextResponse.json(
        {
          success: true,
          invoice: result.invoice,
        },
        { status: 201 }
      )
    } catch (e) {
      log.error('Checkout error', {
        action: 'checkout.error',
        itemCount: items.length,
        error: e instanceof Error ? e : new Error(String(e)),
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        details: { message: e instanceof Error ? e.message : 'Error al procesar el pedido' },
      })
    }
  },
  { rateLimit: 'checkout' }
)
