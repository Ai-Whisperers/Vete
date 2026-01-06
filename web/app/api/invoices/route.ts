import { NextResponse } from 'next/server'
import { withApiAuth, isStaff, type ApiHandlerContext } from '@/lib/auth'
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors'
import { parsePagination, paginatedResponse } from '@/lib/api/pagination'
import { logger } from '@/lib/logger'

interface InvoiceItem {
  service_id?: string
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  discount_percent?: number
  line_total?: number
}

// GET /api/invoices - List invoices for a clinic
export const GET = withApiAuth(async ({ user, profile, supabase, request }) => {
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic') || profile.tenant_id
  const status = searchParams.get('status')
  const petId = searchParams.get('pet_id')
  const { page, limit, offset } = parsePagination(searchParams)

  // Staff can see all invoices, owners only see their own tenant's
  const userIsStaff = isStaff(profile)

  if (!userIsStaff && clinic !== profile.tenant_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
      details: { reason: 'Tenant access denied' },
    })
  }

  try {
    let query = supabase
      .from('invoices')
      .select(
        `
        *,
        pets(id, name, species),
        invoice_items(
          id, service_id, product_id, description, quantity, unit_price, discount_percent, line_total,
          services(name),
          products(name)
        ),
        payments(id, amount, payment_method, paid_at)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', clinic)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Owners can only see invoices for their pets
    if (!userIsStaff) {
      const { data: ownerPets } = await supabase.from('pets').select('id').eq('owner_id', user.id)

      const petIds = ownerPets?.map((p) => p.id) || []
      if (petIds.length === 0) {
        return NextResponse.json(paginatedResponse([], 0, { page, limit, offset }))
      }
      query = query.in('pet_id', petIds)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (petId) {
      query = query.eq('pet_id', petId)
    }

    const { data: invoices, error, count } = await query

    if (error) throw error

    return NextResponse.json(paginatedResponse(invoices || [], count || 0, { page, limit, offset }))
  } catch (e) {
    logger.error('Error loading invoices', {
      tenantId: profile.tenant_id,
      userId: user.id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
})

// POST /api/invoices - Create new invoice (staff only)
// Rate limited: 10 requests per minute (financial operations)
// Supports idempotency via Idempotency-Key header to prevent duplicates on retry
export const POST = withApiAuth(
  async ({ user, profile, supabase, request }: ApiHandlerContext) => {
    try {
      // Check for idempotency key (prevents duplicate invoices on retry)
      const idempotencyKey = request.headers.get('Idempotency-Key')

      if (idempotencyKey) {
        // Check if invoice with this key already exists
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select(
            `
            *,
            invoice_items(
              id, service_id, product_id, description, quantity, unit_price, discount_percent, line_total
            )
          `
          )
          .eq('tenant_id', profile.tenant_id)
          .eq('idempotency_key', idempotencyKey)
          .single()

        if (existingInvoice) {
          // Return existing invoice (idempotent response)
          logger.info('Idempotent invoice request - returning existing', {
            invoiceId: existingInvoice.id,
            idempotencyKey,
            tenantId: profile.tenant_id,
          })
          return apiSuccess(existingInvoice, 'Factura ya existente', HTTP_STATUS.OK)
        }
      }

      const body = await request.json()
      const { pet_id, items, notes, due_date } = body

      if (!pet_id || !items || !Array.isArray(items) || items.length === 0) {
        return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
          details: { required: ['pet_id', 'items'] },
        })
      }

      // Verify pet belongs to clinic
      const { data: pet } = await supabase
        .from('pets')
        .select('id, tenant_id, owner_id')
        .eq('id', pet_id)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (!pet) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, { details: { resource: 'pet' } })
      }

      // Generate invoice number using database function
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', {
        p_tenant_id: profile.tenant_id,
      })

      // Calculate totals with proper rounding
      const { roundCurrency } = await import('@/lib/types/invoicing')

      let subtotal = 0
      const processedItems = items.map((item: InvoiceItem) => {
        const discount = item.discount_percent || 0
        const lineTotal = roundCurrency(item.quantity * item.unit_price * (1 - discount / 100))
        subtotal += lineTotal
        return {
          ...item,
          line_total: lineTotal,
        }
      })

      subtotal = roundCurrency(subtotal)

      const taxRate = body.tax_rate || 10 // Default 10% IVA
      const taxAmount = roundCurrency(subtotal * (taxRate / 100))
      const total = roundCurrency(subtotal + taxAmount)

      // Create invoice (with idempotency key if provided)
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          tenant_id: profile.tenant_id,
          invoice_number: invoiceNumber || `INV-${Date.now()}`,
          pet_id,
          owner_id: pet.owner_id,
          status: 'draft',
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          amount_paid: 0,
          amount_due: total,
          notes,
          due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: user.id,
          idempotency_key: idempotencyKey || null,
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const invoiceItems = processedItems.map((item: InvoiceItem) => ({
        invoice_id: invoice.id,
        service_id: item.service_id || null,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        line_total: item.line_total,
      }))

      const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems)

      if (itemsError) throw itemsError

      // Audit log
      const { logAudit } = await import('@/lib/audit')
      await logAudit('CREATE_INVOICE', `invoices/${invoice.id}`, {
        invoice_number: invoice.invoice_number,
        total,
        pet_id,
      })

      return apiSuccess(invoice, 'Factura creada exitosamente', HTTP_STATUS.CREATED)
    } catch (e) {
      logger.error('Error creating invoice', {
        tenantId: profile.tenant_id,
        userId: user.id,
        operation: 'create_invoice',
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'financial' }
)
