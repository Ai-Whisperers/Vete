import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * POST /api/lab-orders/[id]/results
 * Enter or update lab results for an order
 */
export const POST = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const orderId = params.id

    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const { results, specimen_quality, specimen_issues } = body

    if (!results || !Array.isArray(results)) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['results (array)'] },
      })
    }

    // Verify order belongs to staff's clinic
    const { data: order } = await supabase
      .from('lab_orders')
      .select('id, pets!inner(tenant_id)')
      .eq('id', orderId)
      .single()

    if (!order) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'lab_order' },
      })
    }

    const pet = Array.isArray(order.pets) ? order.pets[0] : order.pets
    if (pet.tenant_id !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    // Insert or update results
    let hasCriticalValues = false
    const resultPromises = results.map(
      async (result: {
        order_item_id: string
        value_numeric?: number | null
        value_text?: string | null
        flag?: string
      }) => {
        if (result.flag === 'critical_low' || result.flag === 'critical_high') {
          hasCriticalValues = true
        }

        // Check if result already exists
        const { data: existing } = await supabase
          .from('lab_results')
          .select('id')
          .eq('order_item_id', result.order_item_id)
          .single()

        if (existing) {
          // Update existing result
          return supabase
            .from('lab_results')
            .update({
              value_numeric: result.value_numeric,
              value_text: result.value_text,
              flag: result.flag || 'normal',
              result_date: new Date().toISOString(),
              entered_by: user.id,
            })
            .eq('id', existing.id)
        } else {
          // Insert new result
          return supabase.from('lab_results').insert({
            order_item_id: result.order_item_id,
            value_numeric: result.value_numeric,
            value_text: result.value_text,
            flag: result.flag || 'normal',
            result_date: new Date().toISOString(),
            entered_by: user.id,
          })
        }
      }
    )

    try {
      await Promise.all(resultPromises)
    } catch (error) {
      logger.error('Error saving lab results', {
        tenantId: profile.tenant_id,
        userId: user.id,
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Update order with specimen quality and critical values flag
    const { error: updateError } = await supabase
      .from('lab_orders')
      .update({
        specimen_quality: specimen_quality || 'acceptable',
        specimen_issues: specimen_issues || null,
        has_critical_values: hasCriticalValues,
        status: 'in_progress', // Move to in_progress when results are entered
      })
      .eq('id', orderId)

    if (updateError) {
      logger.error('Error updating lab order after results', {
        tenantId: profile.tenant_id,
        userId: user.id,
        orderId,
        error: updateError.message,
      })
    }

    return NextResponse.json({ success: true, has_critical_values: hasCriticalValues })
  },
  { roles: ['vet', 'admin'] }
)
