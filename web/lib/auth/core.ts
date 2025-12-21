/**
 * Core authentication service
 * Handles user authentication, profile loading, and basic authorization
 */

import { createClient } from '@/lib/supabase/server'
import type { UserRole, UserProfile, AuthContext, UnauthenticatedContext, AppAuthContext, AuthResult } from './types'
import { apiError } from '@/lib/api/errors'

export class AuthService {
  /**
   * Get the current authentication context
   */
  static async getContext(): Promise<AppAuthContext> {
    const supabase = await createClient()

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          user: null,
          profile: null,
          supabase,
          isAuthenticated: false
        }
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.warn('Profile not found for authenticated user:', user.id)
        return {
          user: null,
          profile: null,
          supabase,
          isAuthenticated: false
        }
      }

      return {
        user,
        profile: profile as UserProfile,
        supabase,
        isAuthenticated: true
      }
    } catch (error) {
      console.error('Auth context error:', error)
      return {
        user: null,
        profile: null,
        supabase,
        isAuthenticated: false
      }
    }
  }

  /**
   * Validate authentication and authorization for API routes
   */
  static async validateAuth(options: {
    roles?: UserRole[]
    requireTenant?: boolean
    tenantId?: string
    requireActive?: boolean
  } = {}): Promise<AuthResult> {
    const context = await this.getContext()

    if (!context.isAuthenticated) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          statusCode: 401
        }
      }
    }

    const { profile } = context

    // Check if user is active
    if (options.requireActive && !profile.is_active) {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive',
          statusCode: 403
        }
      }
    }

    // Check role authorization
    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(profile.role)) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_ROLE',
            message: 'Insufficient permissions',
            statusCode: 403
          }
        }
      }
    }

    // Check tenant authorization
    if (options.requireTenant && options.tenantId) {
      if (profile.tenant_id !== options.tenantId) {
        return {
          success: false,
          error: {
            code: 'TENANT_MISMATCH',
            message: 'Access denied for this tenant',
            statusCode: 403
          }
        }
      }
    }

    return {
      success: true,
      context
    }
  }

  /**
   * Check if user has specific permissions
   */
  static hasPermission(profile: UserProfile, permission: string): boolean {
    // Simple role-based permissions for now
    // TODO: Implement more granular permission system
    switch (permission) {
      case 'manage_appointments':
        return ['vet', 'admin'].includes(profile.role)
      case 'manage_inventory':
        return ['vet', 'admin'].includes(profile.role)
      case 'manage_staff':
        return profile.role === 'admin'
      case 'manage_billing':
        return profile.role === 'admin'
      case 'view_reports':
        return ['vet', 'admin'].includes(profile.role)
      case 'manage_own_appointments':
        return profile.role === 'owner'
      default:
        return false
    }
  }

  /**
   * Check if user is staff (vet or admin)
   */
  static isStaff(profile: UserProfile): boolean {
    return ['vet', 'admin'].includes(profile.role)
  }

  /**
   * Check if user is admin
   */
  static isAdmin(profile: UserProfile): boolean {
    return profile.role === 'admin'
  }

  /**
   * Check if user owns a resource
   */
  static ownsResource(profile: UserProfile, resourceOwnerId: string): boolean {
    return profile.id === resourceOwnerId
  }

  /**
   * Check if user belongs to tenant
   */
  static belongsToTenant(profile: UserProfile, tenantId: string): boolean {
    return profile.tenant_id === tenantId
  }
}
