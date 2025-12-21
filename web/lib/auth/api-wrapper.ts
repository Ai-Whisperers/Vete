/**
 * Unified API route wrapper with centralized authentication
 * Replaces the old withAuth wrapper with improved error handling and consistency
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './core'
import { apiError } from '@/lib/api/errors'
import type { AuthContext, UserRole } from './types'

export interface ApiHandlerContext extends AuthContext {
  request: NextRequest
}

export interface ApiRouteOptions {
  roles?: UserRole[]
  requireTenant?: boolean
  requireActive?: boolean
}

type ApiHandler<T = any> = (context: ApiHandlerContext) => Promise<NextResponse<T>>
type ApiHandlerWithParams<P, T = any> = (
  context: ApiHandlerContext,
  params: P
) => Promise<NextResponse<T>>

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
export function withApiAuth<T = any>(
  handler: ApiHandler<T>,
  options: ApiRouteOptions = {}
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      // Validate authentication
      const authResult = await AuthService.validateAuth(options)

      if (!authResult.success || !authResult.context) {
        return apiError(
          authResult.error!.code,
          authResult.error!.statusCode,
          { details: authResult.error }
        )
      }

      // Execute handler
      const context: ApiHandlerContext = {
        ...authResult.context,
        request
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
export function withApiAuthParams<P extends Record<string, string>, T = any>(
  handler: ApiHandlerWithParams<P, T>,
  options: ApiRouteOptions & {
    paramName?: keyof P
  } = {}
): (request: NextRequest, context: { params: Promise<P> }) => Promise<NextResponse<T>> {
  return async (
    request: NextRequest,
    context: { params: Promise<P> }
  ): Promise<NextResponse<T>> => {
    try {
      const params = await context.params

      // Extract tenant ID from params if needed
      const tenantId = options.requireTenant && options.paramName
        ? params[options.paramName] as string
        : undefined

      // Validate authentication
      const authResult = await AuthService.validateAuth({
        ...options,
        tenantId
      })

      if (!authResult.success || !authResult.context) {
        return apiError(
          authResult.error!.code,
          authResult.error!.statusCode,
          { details: authResult.error }
        )
      }

      // Execute handler
      const handlerContext: ApiHandlerContext = {
        ...authResult.context,
        request
      }

      return await handler(handlerContext, params)
    } catch (error) {
      console.error('API route error:', error)
      return apiError('SERVER_ERROR', 500)
    }
  }
}

/**
 * Utility function to check resource ownership within handlers
 */
export function requireOwnership(resourceOwnerId: string, context: AuthContext): boolean {
  if (AuthService.isAdmin(context.profile)) return true
  if (AuthService.isStaff(context.profile) && AuthService.belongsToTenant(context.profile, context.profile.tenant_id)) return true
  return AuthService.ownsResource(context.profile, resourceOwnerId)
}

/**
 * Utility function to check tenant access within handlers
 */
export function requireTenantAccess(tenantId: string, context: AuthContext): boolean {
  return AuthService.belongsToTenant(context.profile, tenantId) || AuthService.isAdmin(context.profile)
}
