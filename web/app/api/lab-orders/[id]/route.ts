import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/lab-orders/[id]
 * Get a single lab order with all related data
 */
export const GET = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const { id } = params

    // Fetch order with all related data
    // Note: lab_results has lab_order_id FK to lab_orders, not through lab_order_items
    const { data: order, error } = await supabase
      .from('lab_orders')
      .select(
        `
        *,
        pets!inner(id, name, species, breed, birth_date, tenant_id),
        lab_order_items(
          id,
          test_id,
          status,
          price,
          lab_test_catalog(id, code, name, category, sample_type, reference_ranges)
        ),
        lab_results(
          id,
          test_id,
          value,
          numeric_value,
          unit,
          reference_min,
          reference_max,
          flag,
          is_abnormal,
          notes,
          entered_by,
          created_at
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Error fetching lab order', {
        tenantId: profile.tenant_id,
        userId: user.id,
        orderId: id,
        error: error.message,
      })
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'lab_order' },
      })
    }

    // Verify order belongs to staff's clinic
    const pet = Array.isArray(order.pets) ? order.pets[0] : order.pets
    if (pet.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    return NextResponse.json(order)
  },
  { roles: ['vet', 'admin'] }
)

/**
 * PATCH /api/lab-orders/[id]
 * Update lab order status and metadata
 */
export const PATCH = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const { id } = params

    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const { status, collected_at, completed_at } = body

    // Verify order belongs to staff's clinic
    const { data: existing } = await supabase
      .from('lab_orders')
      .select('id, pets!inner(tenant_id, owner_id, name)')
      .eq('id', id)
      .single()

    if (!existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'lab_order' },
      })
    }

    const pet = Array.isArray(existing.pets) ? existing.pets[0] : existing.pets
    if (pet.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Build update
    const updates: Record<string, unknown> = {}
    if (status) {
      updates.status = status
      if (status === 'collected' && !collected_at) {
        updates.collected_at = new Date().toISOString()
      }
      if (status === 'completed' && !completed_at) {
        updates.completed_at = new Date().toISOString()
      }
    }
    if (collected_at) updates.collected_at = collected_at
    if (completed_at) updates.completed_at = completed_at

    const { data, error } = await supabase
      .from('lab_orders')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        pets!inner(id, name, owner_id, tenant_id)
      `
      )
      .single()

    if (error) {
      logger.error('Error updating lab order', {
        tenantId: profile.tenant_id,
        userId: user.id,
        orderId: id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Send notification when status changes to completed
    if (status === 'completed') {
      try {
        const petData = Array.isArray(data.pets) ? data.pets[0] : data.pets

        // Create in-app notification for the pet owner
        await supabase.from('notifications').insert({
          user_id: petData.owner_id,
          title: 'Resultados de laboratorio listos',
          message: `Los resultados del laboratorio para ${petData.name} ya están disponibles.`,
          type: 'lab_results',
          link: `/portal/pets/${petData.id}/lab`,
          data: {
            lab_order_id: id,
            pet_id: petData.id,
          },
        })
      } catch (notifyError) {
        // Log but don't fail the request if notification fails
        logger.error('Error sending lab order notification', {
          tenantId: profile.tenant_id,
          userId: user.id,
          orderId: id,
          error: notifyError instanceof Error ? notifyError.message : 'Unknown',
        })
      }
    }

    return NextResponse.json(data)
  },
  { roles: ['vet', 'admin'] }
)

/**
 * DELETE /api/lab-orders/[id]
 * Delete a lab order (admin only)
 */
export const DELETE = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const { id } = params

    // Verify order belongs to admin's clinic
    const { data: existing } = await supabase
      .from('lab_orders')
      .select('id, pets!inner(tenant_id)')
      .eq('id', id)
      .single()

    if (!existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'lab_order' },
      })
    }

    const pet = Array.isArray(existing.pets) ? existing.pets[0] : existing.pets
    if (pet.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Delete order (cascade should handle order items)
    const { error } = await supabase.from('lab_orders').delete().eq('id', id)

    if (error) {
      logger.error('Error deleting lab order', {
        tenantId: profile.tenant_id,
        userId: user.id,
        orderId: id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return new NextResponse(null, { status: 204 })
  },
  { roles: ['admin'] }
)
