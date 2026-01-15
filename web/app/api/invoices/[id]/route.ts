import { NextResponse } from 'next/server'
import { withApiAuthParams, isStaff, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

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

    try {
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(
          `
        *,
        pets(id, name, species, breed, photo_url, owner:profiles(id, full_name, email, phone)),
        invoice_items(
          id, service_id, product_id, description, quantity, unit_price, discount_percent, line_total,
          services(id, name, category),
          products(id, name, sku)
        ),
        payments(id, amount, payment_method, reference_number, paid_at, received_by),
        refunds(id, amount, reason, refunded_at),
        created_by_user:profiles!invoices_created_by_fkey(full_name)
      `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      if (!invoice) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
      }

      // Check access - staff or owner
      const userIsStaff = isStaff(profile)
      if (!userIsStaff && invoice.owner_id !== user.id) {
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
      }

      return NextResponse.json(invoice)
    } catch (e) {
      logger.error('Error loading invoice', {
        tenantId: profile.tenant_id,
        userId: user.id,
        invoiceId: id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }
)

/**
 * PATCH /api/invoices/[id]
 * Update invoice (full edit for drafts, status/notes only for sent)
 */
export const PATCH = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const { id } = params

    try {
      // Get current invoice
      const { data: existing } = await supabase
        .from('invoices')
        .select('id, status, tenant_id')
        .eq('id', id)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (!existing) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
      }

      // Only draft invoices can be fully edited
      if (existing.status !== 'draft') {
        const body = await request.json()
        // For non-draft, only allow status changes and notes
        const updates: { status?: string; notes?: string } = {}
        if (body.status !== undefined) updates.status = body.status
        if (body.notes !== undefined) updates.notes = body.notes

        if (Object.keys(updates).length === 0) {
          return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
            details: { reason: 'Las facturas enviadas solo pueden cambiar estado o notas' },
          })
        }

        const { data: updated, error } = await supabase
          .from('invoices')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        const { logAudit } = await import('@/lib/audit')
        await logAudit('UPDATE_INVOICE', `invoices/${id}`, { updates })

        return NextResponse.json(updated)
      }

      // Draft invoice - full edit allowed
      const body = await request.json()
      const { items, ...invoiceData } = body

      // Update invoice
      const { data: updated, error: updateError } = await supabase
        .from('invoices')
        .update({
          ...invoiceData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update items if provided
      if (items && Array.isArray(items)) {
        // Import roundCurrency helper for consistent rounding
        const { roundCurrency } = await import('@/lib/types/invoicing')

        // Delete existing items
        await supabase.from('invoice_items').delete().eq('invoice_id', id)

        // Insert new items
        let subtotal = 0
        const newItems = items.map((item: InvoiceItem) => {
          const lineTotal = roundCurrency(
            item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100)
          )
          subtotal += lineTotal
          return {
            invoice_id: id,
            service_id: item.service_id || null,
            product_id: item.product_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent || 0,
            line_total: lineTotal,
          }
        })

        await supabase.from('invoice_items').insert(newItems)

        // Recalculate totals with proper rounding
        subtotal = roundCurrency(subtotal)
        const taxAmount = roundCurrency(subtotal * (updated.tax_rate / 100))
        const total = roundCurrency(subtotal + taxAmount)
        const amountDue = roundCurrency(total - updated.amount_paid)

        await supabase
          .from('invoices')
          .update({
            subtotal,
            tax_amount: taxAmount,
            total,
            amount_due: amountDue,
          })
          .eq('id', id)
      }

      const { logAudit } = await import('@/lib/audit')
      await logAudit('UPDATE_INVOICE', `invoices/${id}`, { status: updated.status })

      return NextResponse.json(updated)
    } catch (e) {
      logger.error('Error updating invoice', {
        tenantId: profile.tenant_id,
        userId: user.id,
        invoiceId: id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
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

    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id, status, invoice_number')
        .eq('id', id)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (!invoice) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
      }

      // If draft, hard delete
      if (invoice.status === 'draft') {
        await supabase.from('invoice_items').delete().eq('invoice_id', id)
        await supabase.from('invoices').delete().eq('id', id)
      } else {
        // Otherwise, void the invoice
        await supabase
          .from('invoices')
          .update({
            status: 'void',
            voided_at: new Date().toISOString(),
            voided_by: user.id,
          })
          .eq('id', id)
      }

      const { logAudit } = await import('@/lib/audit')
      await logAudit('DELETE_INVOICE', `invoices/${id}`, {
        invoice_number: invoice.invoice_number,
        action: invoice.status === 'draft' ? 'deleted' : 'voided',
      })

      return NextResponse.json({ success: true })
    } catch (e) {
      logger.error('Error deleting invoice', {
        tenantId: profile.tenant_id,
        userId: user.id,
        invoiceId: id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'], rateLimit: 'financial' }
)
