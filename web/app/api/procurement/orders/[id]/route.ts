import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateOrderSchema = z.object({
  status: z
    .enum(['draft', 'submitted', 'confirmed', 'shipped', 'received', 'cancelled'])
    .optional(),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  shipping_address: z.string().optional(),
})

const receiveItemsSchema = z.object({
  items: z.array(
    z.object({
      item_id: z.string().uuid(),
      received_quantity: z.number().int().min(0),
      notes: z.string().optional(),
    })
  ),
})

/**
 * GET /api/procurement/orders/[id]
 * Get purchase order details
 */
export const GET = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const orderId = params.id

    try {
      const { data: order, error } = await supabase
        .from('purchase_orders')
        .select(
          `
          *,
          suppliers (id, name, contact_info, payment_terms, delivery_time_days),
          purchase_order_items (
            id,
            catalog_product_id,
            quantity,
            unit_cost,
            line_total,
            received_quantity,
            catalog_products (id, sku, name, base_unit)
          ),
          profiles!purchase_orders_created_by_fkey (id, full_name, email)
        `
        )
        .eq('id', orderId)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (error || !order) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'purchase_order' },
        })
      }

      return NextResponse.json(order)
    } catch (e) {
      logger.error('Purchase order GET error', {
        tenantId: profile.tenant_id,
        orderId,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'] }
)

/**
 * PATCH /api/procurement/orders/[id]
 * Update purchase order status or details
 */
export const PATCH = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const orderId = params.id

    try {
      // Check order exists
      const { data: existing } = await supabase
        .from('purchase_orders')
        .select('id, status')
        .eq('id', orderId)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (!existing) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'purchase_order' },
        })
      }

      // Parse body
      const body = await request.json()

      // Check if this is a receive items request
      if (body.items && Array.isArray(body.items)) {
        const validation = receiveItemsSchema.safeParse(body)
        if (!validation.success) {
          return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
            details: { errors: validation.error.errors },
          })
        }

        // Update received quantities
        for (const item of validation.data.items) {
          const { error: itemError } = await supabase
            .from('purchase_order_items')
            .update({
              received_quantity: item.received_quantity,
              received_at: new Date().toISOString(),
              notes: item.notes,
            })
            .eq('id', item.item_id)
            .eq('purchase_order_id', orderId)

          if (itemError) {
            logger.error('Error updating order item', {
              tenantId: profile.tenant_id,
              orderId,
              itemId: item.item_id,
              error: itemError.message,
            })
          }
        }

        // Check if all items fully received
        const { data: items } = await supabase
          .from('purchase_order_items')
          .select('quantity, received_quantity')
          .eq('purchase_order_id', orderId)

        const allReceived = items?.every((item) => item.received_quantity >= item.quantity)

        if (allReceived) {
          await supabase
            .from('purchase_orders')
            .update({
              status: 'received',
              received_at: new Date().toISOString(),
              received_by: user.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
        }

        // Fetch updated order
        const { data: order } = await supabase
          .from('purchase_orders')
          .select(
            `
            *,
            purchase_order_items (
              id,
              quantity,
              received_quantity,
              catalog_products (id, sku, name)
            )
          `
          )
          .eq('id', orderId)
          .single()

        return NextResponse.json(order)
      }

      // Regular update
      const validation = updateOrderSchema.safeParse(body)
      if (!validation.success) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { errors: validation.error.errors },
        })
      }

      const updateData: Record<string, unknown> = {
        ...validation.data,
        updated_at: new Date().toISOString(),
      }

      // Add status-specific timestamps
      if (validation.data.status === 'submitted') {
        updateData.submitted_at = new Date().toISOString()
      } else if (validation.data.status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      } else if (validation.data.status === 'shipped') {
        updateData.shipped_at = new Date().toISOString()
      } else if (validation.data.status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
        updateData.cancelled_by = user.id
      }

      const { data: order, error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('tenant_id', profile.tenant_id)
        .select()
        .single()

      if (error) {
        logger.error('Error updating purchase order', {
          tenantId: profile.tenant_id,
          orderId,
          error: error.message,
        })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      return NextResponse.json(order)
    } catch (e) {
      logger.error('Purchase order PATCH error', {
        tenantId: profile.tenant_id,
        orderId,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'] }
)

/**
 * DELETE /api/procurement/orders/[id]
 * Cancel/delete purchase order (only if draft)
 */
export const DELETE = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const orderId = params.id

    try {
      // Check order status
      const { data: existing } = await supabase
        .from('purchase_orders')
        .select('id, status')
        .eq('id', orderId)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (!existing) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'purchase_order' },
        })
      }

      // Only draft orders can be deleted
      if (existing.status !== 'draft') {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'Solo órdenes en borrador pueden ser eliminadas' },
        })
      }

      // Delete items first
      await supabase.from('purchase_order_items').delete().eq('purchase_order_id', orderId)

      // Delete order
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', orderId)
        .eq('tenant_id', profile.tenant_id)

      if (error) {
        logger.error('Error deleting purchase order', {
          tenantId: profile.tenant_id,
          orderId,
          error: error.message,
        })
        return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }

      return NextResponse.json({ success: true })
    } catch (e) {
      logger.error('Purchase order DELETE error', {
        tenantId: profile.tenant_id,
        orderId,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'] }
)
