/**
 * API Utilities for Vete
 *
 * Provides standardized error handling, response formatting, and debugging
 * utilities for API routes.
 *
 * Usage:
 *   import { apiHandler, ApiError } from '@/lib/api-utils'
 *
 *   export const GET = apiHandler(async (req, { log, supabase, user, profile }) => {
 *     // Your logic here - errors are automatically caught and formatted
 *     const { data, error } = await supabase.from('pets').select('*')
 *     if (error) throw new ApiError(500, 'Failed to fetch pets', error)
 *     return { data }
 *   })
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRequestLogger, logger, type LogContext } from '@/lib/logger'
import type { SupabaseClient, User } from '@supabase/supabase-js'

interface Profile {
  id: string
  tenant_id: string
  role: 'owner' | 'vet' | 'admin'
  full_name: string | null
  email: string | null
}

interface ApiContext {
  log: ReturnType<typeof createRequestLogger>
  supabase: SupabaseClient
  user: User | null
  profile: Profile | null
  tenantId: string | null
}

type ApiHandlerFn<T = unknown> = (
  request: NextRequest,
  context: ApiContext
) => Promise<T | NextResponse>

interface ApiHandlerOptions {
  /** Require authentication (default: true) */
  requireAuth?: boolean
  /** Require specific roles (implies requireAuth) */
  requireRole?: ('owner' | 'vet' | 'admin')[]
  /** Log request body in debug mode */
  logBody?: boolean
}

/**
 * Custom API Error with status code
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public originalError?: unknown,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(400, message, undefined, code)
  }

  static unauthorized(message = 'No autorizado'): ApiError {
    return new ApiError(401, message, undefined, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Acceso denegado'): ApiError {
    return new ApiError(403, message, undefined, 'FORBIDDEN')
  }

  static notFound(message = 'No encontrado'): ApiError {
    return new ApiError(404, message, undefined, 'NOT_FOUND')
  }

  static internal(message: string, originalError?: unknown): ApiError {
    return new ApiError(500, message, originalError, 'INTERNAL_ERROR')
  }
}

/**
 * Wrap API route handler with standardized error handling and context
 */
export function apiHandler<T = unknown>(
  handler: ApiHandlerFn<T>,
  options: ApiHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  const { requireAuth = true, requireRole, logBody = false } = options

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = performance.now()
    const supabase = await createClient()

    // Get user info for logging context
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Build log context
    const logContext: Partial<LogContext> = {
      userId: user?.id,
    }

    // Extract tenant from query or path
    const url = new URL(request.url)
    const tenantFromQuery = url.searchParams.get('clinic') || url.searchParams.get('tenant')
    if (tenantFromQuery) {
      logContext.tenant = tenantFromQuery
    }

    const log = createRequestLogger(request, logContext)

    // Log incoming request
    log.debug('Request received', {
      query: Object.fromEntries(url.searchParams),
      ...(logBody && request.method !== 'GET' ? { hasBody: true } : {}),
    })

    try {
      // Auth check
      if (requireAuth && !user) {
        throw ApiError.unauthorized()
      }

      // Get profile if authenticated
      let profile: Profile | null = null
      let tenantId: string | null = tenantFromQuery

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, tenant_id, role, full_name, email')
          .eq('id', user.id)
          .single()

        profile = profileData as Profile | null
        tenantId = profile?.tenant_id || tenantId

        // Role check
        if (requireRole && profile) {
          if (!requireRole.includes(profile.role)) {
            throw ApiError.forbidden('No tiene permisos para esta acción')
          }
        }
      }

      // Execute handler
      const result = await handler(request, {
        log,
        supabase,
        user,
        profile,
        tenantId,
      })

      const duration = Math.round(performance.now() - startTime)

      // If handler returned NextResponse, use it
      if (result instanceof NextResponse) {
        log.info('Request completed', { duration, status: result.status })
        return result
      }

      // Otherwise wrap in JSON response
      log.info('Request completed', { duration, status: 200 })
      return NextResponse.json(result)
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)

      if (error instanceof ApiError) {
        log.warn('Request failed', {
          duration,
          status: error.status,
          code: error.code,
          error: error.originalError,
        })

        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: error.status }
        )
      }

      // Unexpected error
      log.error('Unhandled error', error as Error)

      return NextResponse.json(
        {
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Extract and validate common query parameters
 */
export function parseQueryParams(request: NextRequest): {
  clinic: string | null
  page: number
  limit: number
  search: string | null
  sort: string | null
  order: 'asc' | 'desc'
} {
  const url = new URL(request.url)

  return {
    clinic: url.searchParams.get('clinic'),
    page: Math.max(1, parseInt(url.searchParams.get('page') || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10))),
    search: url.searchParams.get('search'),
    sort: url.searchParams.get('sort'),
    order: url.searchParams.get('order') === 'desc' ? 'desc' : 'asc',
  }
}

/**
 * Parse and validate JSON body with error handling
 */
export async function parseBody<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw ApiError.badRequest('Cuerpo de solicitud inválido', 'INVALID_JSON')
  }
}

/**
 * Build paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
} {
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}
