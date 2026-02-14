/**
 * Service Commissions API - Clinic View
 *
 * GET /api/billing/commissions/services - List clinic's service commissions
 *
 * Query params:
 * - clinic: string (optional) - Tenant ID (defaults to user's tenant)
 * - status: 'pending' | 'invoiced' | 'paid' | 'waived' | 'adjusted'
 * - from: ISO date string (filter by calculated_at)
 * - to: ISO date string
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { commissionQuerySchema } from '@/lib/schemas/store'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // 2. Get profile and verify staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
      details: { resource: 'profile' },
    })
  }

  // Only staff (vet/admin) can view commissions
  if (profile.role !== 'vet' && profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { required: ['vet', 'admin'], current: profile.role },
    })
  }

  // 3. Parse and validate query params
  const { searchParams } = new URL(request.url)
  
  const queryResult = commissionQuerySchema.safeParse({
    clinic: searchParams.get('clinic'),
    status: searchParams.get('status'),
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  })

  if (!queryResult.success) {
    return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
      details: { issues: queryResult.error.issues },
    })
  }

  const { clinic, status, from, to, page, limit } = queryResult.data
  const offset = (page - 1) * limit

  // Validate clinic matches user's tenant
  if (clinic && clinic !== profile.tenant_id) {
    return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'No puede acceder a comisiones de otra clínica' },
    })
  }

  const tenantId = clinic || profile.tenant_id

  try {
    // Build query
    let query = supabase
      .from('service_commissions')
      .select(
        `
        id,
        appointment_id,
        invoice_id,
        service_total,
        tax_amount,
        commissionable_amount,
        commission_rate,
        commission_amount,
        rate_type,
        months_active,
        status,
        platform_invoice_id,
        original_commission,
        adjustment_amount,
        adjustment_reason,
        calculated_at,
        invoiced_at,
        paid_at,
        created_at,
        appointments!inner(
          start_time,
          services(name),
          pets(name),
          profiles!appointments_client_id_fkey(full_name, email)
        ),
        invoices(invoice_number, total, paid_at)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId)
      .order('calculated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (from) {
      query = query.gte('calculated_at', from)
    }

    if (to) {
      query = query.lte('calculated_at', to)
    }

    const { data: commissions, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      commissions: commissions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (e) {
    logger.error('Error fetching service commissions', {
      tenantId,
      userId: user.id,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: 'Error al cargar comisiones de servicios' },
    })
  }
}
