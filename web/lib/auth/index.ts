/**
 * Centralized authentication and authorization system
 * Provides unified auth patterns across API routes, server actions, and components
 */

// Core types
export type {
  UserRole,
  UserProfile,
  AuthContext,
  UnauthenticatedContext,
  AppAuthContext,
  AuthOptions,
  Permission,
  AuthResult,
} from './types'

// Core service and utilities
export {
  AuthService,
  isStaff,
  isAdmin,
  ownsResource,
  belongsToTenant,
  requireOwnership,
  type MinimalProfile,
} from './core'

// API route wrappers
export {
  withApiAuth,
  withApiAuthParams,
  requireOwnership as requireApiOwnership,
  requireTenantAccess as requireApiTenantAccess,
  type ApiHandlerContext,
  type ApiRouteOptions,
} from './api-wrapper'

// Server action wrappers
export {
  withActionAuth,
  requireOwnership as requireActionOwnership,
  requireTenantAccess as requireActionTenantAccess,
  createTenantQuery,
  type ActionOptions,
} from './action-wrapper'

// Role-based authorization
export { requireStaff, requireAdmin } from './require-staff'
