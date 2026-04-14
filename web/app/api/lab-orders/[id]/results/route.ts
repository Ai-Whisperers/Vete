import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { labResultsSchema } from '@/lib/schemas/lab'

/**
 * POST /api/lab-orders/[id]/results
 * Enter or update lab results for an order
 *
 * Body: {
 *   results: Array<{
 *     test_id: string,      // ID of the lab test from catalog
 *     value: string,        // Text representation of result (required)
 *     numeric_value?: number, // Numeric value if applicable
 *     flag?: 'low' | 'normal' | 'high' | 'critical_low' | 'critical_high'
 *   }>
 * }
 */
export const POST = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const orderId = params.id

    // Parse and validate body
    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch (_error: unknown) {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    const results = labResultsSchema.parse(rawBody)

    // Save results to database
    const { data, error } = await supabase
      .from('lab_results')
      .insert(results.map((result) => ({ ...result, order_id: orderId })))

    if (error) {
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return NextResponse.json({ message: 'Results saved successfully' }, { status: HTTP_STATUS.OK })
  }
)