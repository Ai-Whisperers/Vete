/**
 * Kennels API - Refactored with improved logging
 *
 * Example showing before/after with the new api-utils
 */

import { NextRequest } from 'next/server'
import { apiHandler, ApiError } from '@/lib/api-utils'

/**
 * GET /api/kennels
 *
 * List all kennels for the authenticated user's clinic.
 * Requires: vet or admin role
 */
export const GET = apiHandler(
  async (request: NextRequest, { log, supabase, profile, tenantId }) => {
    // Role check is automatic via options below

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const kennelType = searchParams.get('kennel_type')
    const location = searchParams.get('location')

    log.debug('Fetching kennels', { status, kennelType, location })

    // Build query
    let query = supabase
      .from('kennels')
      .select(`
        *,
        current_occupant:hospitalizations!hospitalizations_kennel_id_fkey(
          id,
          hospitalization_number,
          pet:pets(id, name, species, breed)
        )
      `)
      .eq('tenant_id', tenantId)
      .order('location')
      .order('kennel_number')

    // Apply filters
    if (status) query = query.eq('kennel_status', status)
    if (kennelType) query = query.eq('kennel_type', kennelType)
    if (location) query = query.eq('location', location)

    const { data, error } = await query

    if (error) {
      log.error('Database query failed', { error })
      throw ApiError.internal('Error al obtener jaulas', error)
    }

    log.debug('Kennels fetched', { count: data?.length })
    return data
  },
  {
    requireAuth: true,
    requireRole: ['vet', 'admin'], // Automatic role check
  }
)
