/**
 * Authentication middleware wrapper for API routes
 * ARCH-006: Create Auth Middleware Wrapper
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError, ApiErrorResponse } from './errors';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * User profile from the profiles table
 */
export interface UserProfile {
  id: string;
  tenant_id: string;
  role: 'owner' | 'vet' | 'admin';
  full_name: string | null;
  email: string | null;
}

/**
 * Authentication context passed to handlers
 */
export interface AuthContext {
  /** Authenticated Supabase user */
  user: User;
  /** User's profile with tenant and role info */
  profile: UserProfile;
  /** Supabase client for database operations */
  supabase: SupabaseClient;
  /** Request object */
  request: NextRequest;
}

/**
 * Options for the withAuth wrapper
 */
export interface WithAuthOptions {
  /**
   * Required roles to access this route
   * If empty or undefined, any authenticated user can access
   */
  roles?: Array<'owner' | 'vet' | 'admin'>;
  /**
   * Require a specific tenant ID (from URL params)
   * If true, validates user belongs to that tenant
   */
  requireTenant?: boolean;
}

type ApiResponse<T> = NextResponse<T | ApiErrorResponse>;

/**
 * Wrap an API route handler with authentication and authorization
 *
 * @param handler - The async handler function to wrap
 * @param options - Optional configuration for roles and tenant validation
 * @returns Wrapped handler that validates auth before executing
 *
 * @example
 * ```typescript
 * // Basic auth check
 * export const GET = withAuth(async ({ profile, supabase }) => {
 *   const { data } = await supabase
 *     .from('pets')
 *     .select('*')
 *     .eq('tenant_id', profile.tenant_id);
 *   return NextResponse.json(data);
 * });
 *
 * // Admin-only route
 * export const DELETE = withAuth(
 *   async ({ supabase }, { params }) => {
 *     await supabase.from('pets').delete().eq('id', params.id);
 *     return new NextResponse(null, { status: 204 });
 *   },
 *   { roles: ['admin'] }
 * );
 *
 * // Staff-only route (vet or admin)
 * export const POST = withAuth(
 *   async (ctx) => {
 *     // ...
 *   },
 *   { roles: ['vet', 'admin'] }
 * );
 * ```
 */
export function withAuth<T, P = unknown>(
  handler: (
    ctx: AuthContext,
    params?: { params: Promise<P> }
  ) => Promise<NextResponse<T>>,
  options?: WithAuthOptions
) {
  return async (
    request: NextRequest,
    params?: { params: Promise<P> }
  ): Promise<ApiResponse<T>> => {
    try {
      // Create Supabase client
      const supabase = await createClient();

      // Validate user authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return apiError('UNAUTHORIZED', 401);
      }

      // Get user profile with tenant and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, tenant_id, role, full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return apiError('UNAUTHORIZED', 401, {
          details: { reason: 'Profile not found' },
        });
      }

      // Check role authorization
      if (options?.roles && options.roles.length > 0) {
        if (!options.roles.includes(profile.role as UserProfile['role'])) {
          return apiError('INSUFFICIENT_ROLE', 403, {
            details: {
              required: options.roles,
              current: profile.role,
            },
          });
        }
      }

      // Optional: Validate tenant from URL params
      if (options?.requireTenant && params) {
        const resolvedParams = await params.params;
        const tenantParam = (resolvedParams as Record<string, string>)?.clinic;

        if (tenantParam && tenantParam !== profile.tenant_id) {
          return apiError('FORBIDDEN', 403, {
            details: { reason: 'Tenant mismatch' },
          });
        }
      }

      // Execute the wrapped handler
      const context: AuthContext = {
        user,
        profile: profile as UserProfile,
        supabase,
        request,
      };

      return await handler(context, params);
    } catch (error) {
      console.error('API route error:', error);
      return apiError('SERVER_ERROR', 500);
    }
  };
}

/**
 * Check if user is staff (vet or admin)
 */
export function isStaff(profile: UserProfile): boolean {
  return profile.role === 'vet' || profile.role === 'admin';
}

/**
 * Check if user is admin
 */
export function isAdmin(profile: UserProfile): boolean {
  return profile.role === 'admin';
}

/**
 * Helper to get tenant-filtered query
 */
export function tenantQuery<T extends { tenant_id: string }>(
  supabase: SupabaseClient,
  table: string,
  tenantId: string
) {
  return supabase.from(table).select('*').eq('tenant_id', tenantId);
}
