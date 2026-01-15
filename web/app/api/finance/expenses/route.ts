import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/finance/expenses
 * Get all expenses for the clinic (staff only)
 */
export const GET = withApiAuth(
  async ({ request, profile, supabase }: ApiHandlerContext) => {
    const { searchParams } = new URL(request.url)
    const clinic = searchParams.get('clinic') || profile.tenant_id

    // Verify user belongs to the requested clinic
    if (clinic !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('clinic_id', clinic)
      .order('date', { ascending: false })

    if (error) {
      logger.error('Error fetching expenses', {
        tenantId: profile.tenant_id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'financial' }
)

/**
 * POST /api/finance/expenses
 * Create a new expense record (staff only)
 */
export const POST = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
    let body
    try {
      body = await request.json()
    } catch {
      return apiError('INVALID_FORMAT', HTTP_STATUS.BAD_REQUEST)
    }

    // Explicitly destructure allowed fields - don't spread body
    const { amount, category, description, date, vendor, notes, receipt_url } = body

    // Validate required fields
    if (!amount || !category || !date) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
        details: { required: ['amount', 'category', 'date'] },
      })
    }

    // Validate amount is positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { field: 'amount', reason: 'Must be a positive number' },
      })
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        clinic_id: profile.tenant_id, // Server-controlled tenant_id
        amount,
        category,
        description: description || null,
        date,
        vendor: vendor || null,
        notes: notes || null,
        receipt_url: receipt_url || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating expense', {
        tenantId: profile.tenant_id,
        userId: user.id,
        error: error.message,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    // Audit Log
    const { logAudit } = await import('@/lib/audit')
    await logAudit('CREATE_EXPENSE', `expenses/${data.id}`, { amount, category })

    return apiSuccess(data, 'Gasto creado', HTTP_STATUS.CREATED)
  },
  { roles: ['vet', 'admin'] }
)
