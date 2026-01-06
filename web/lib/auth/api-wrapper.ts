/**
 * Unified API route wrapper with centralized authentication
 * Replaces the old withAuth wrapper with improved error handling and consistency
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './core'
import { apiError, type ApiErrorType } from '@/lib/api/errors'
import type { AuthContext, UserRole } from './types'
import { scopedQueries, type ScopedQueries } from '@/lib/supabase/scoped'
import { rateLimit, type RateLimitType } from '@/lib/rate-limit'

export interface ApiHandlerContext extends AuthContext {
  request: NextRequest
  /**
   * Tenant-scoped query builders - automatically filter by tenant_id
   * Use this instead of raw supabase client to ensure tenant isolation
   */
  scoped: ScopedQueries
}

/**
 * API handler context with route params for dynamic routes
 * @template P - The params type (e.g., { id: string })
 */
export type ApiHandlerContextWithParams<P = Record<string, string>> = ApiHandlerContext & {
  params: P
}

export interface ApiRouteOptions {
  roles?: UserRole[]
  requireTenant?: boolean
  requireActive?: boolean
  /** Rate limit type for this endpoint */
  rateLimit?: RateLimitType
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiHandler = (context: ApiHandlerContext) => Promise<NextResponse<any>>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiHandlerWithParams<P> = (context: ApiHandlerContextWithParams<P>) => Promise<NextResponse<any>>

/**
 * Enhanced API route wrapper with centralized authentication
 *
 * @example
 * ```typescript
 * export const GET = withApiAuth(
 *   async ({ profile, supabase }) => {
 *     const data = await supabase.from('pets').select('*')
 *     return NextResponse.json(data)
 *   },
 *   { roles: ['vet', 'admin'] }
 * )
 * ```
 */
export function withApiAuth(
  handler: ApiHandler,
  options: ApiRouteOptions = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (request: NextRequest) => Promise<NextResponse<any>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest): Promise<NextResponse<any>> => {
    try {
      // Validate authentication
      const authResult = await AuthService.validateAuth(options)

      if (!authResult.success || !authResult.context) {
        return apiError(authResult.error!.code as ApiErrorType, authResult.error!.statusCode, {
          details: authResult.error,
        })
      }

      // Apply rate limiting if configured
      if (options.rateLimit) {
        const rateLimitResult = await rateLimit(request, options.rateLimit, authResult.context.user.id)
        if (!rateLimitResult.success) {
          return rateLimitResult.response
        }
      }

      // Set tenant context for optimized RLS performance
      // This enables is_staff_of_fast() to use session variables instead of subqueries
      await authResult.context.supabase.rpc('set_tenant_context', {
        p_tenant_id: authResult.context.profile.tenant_id,
        p_user_role: authResult.context.profile.role,
      })

      // Execute handler with scoped queries for tenant isolation
      const context: ApiHandlerContext = {
        ...authResult.context,
        request,
        scoped: scopedQueries(authResult.context.supabase, authResult.context.profile.tenant_id),
      }

      return await handler(context)
    } catch (error) {
      console.error('API route error:', error)
      return apiError('SERVER_ERROR', 500)
    }
  }
}

/**
 * API route wrapper for routes with dynamic parameters
 */
export function withApiAuthParams<P extends Record<string, string>>(
  handler: ApiHandlerWithParams<P>,
  options: ApiRouteOptions & {
    paramName?: keyof P
  } = {}
): (
  request: NextRequest,
  context: { params: Promise<P> }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<NextResponse<any>> {
  return async (
    request: NextRequest,
    context: { params: Promise<P> }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<NextResponse<any>> => {
    try {
      const params = await context.params

      // Extract tenant ID from params if needed
      const tenantId =
        options.requireTenant && options.paramName
          ? (params[options.paramName] as string)
          : undefined

      // Validate authentication
      const authResult = await AuthService.validateAuth({
        ...options,
        tenantId,
      })

      if (!authResult.success || !authResult.context) {
        return apiError(authResult.error!.code as ApiErrorType, authResult.error!.statusCode, {
          details: authResult.error,
        })
      }

      // Apply rate limiting if configured
      if (options.rateLimit) {
        const rateLimitResult = await rateLimit(request, options.rateLimit, authResult.context.user.id)
        if (!rateLimitResult.success) {
          return rateLimitResult.response
        }
      }

      // Set tenant context for optimized RLS performance
      // This enables is_staff_of_fast() to use session variables instead of subqueries
      await authResult.context.supabase.rpc('set_tenant_context', {
        p_tenant_id: authResult.context.profile.tenant_id,
        p_user_role: authResult.context.profile.role,
      })

      // Execute handler with scoped queries for tenant isolation
      const handlerContext: ApiHandlerContextWithParams<P> = {
        ...authResult.context,
        request,
        scoped: scopedQueries(authResult.context.supabase, authResult.context.profile.tenant_id),
        params,
      }

      return await handler(handlerContext)
    } catch (error) {
      console.error('API route error:', error)
      return apiError('SERVER_ERROR', 500)
    }
  }
}

// Re-export from core
export { requireOwnership } from './core'

/**
 * Utility function to check tenant access within handlers
 */
export function requireTenantAccess(tenantId: string, context: AuthContext): boolean {
  return (
    AuthService.belongsToTenant(context.profile, tenantId) || AuthService.isAdmin(context.profile)
  )
}
