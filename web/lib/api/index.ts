/**
 * API utilities and helpers
 * Centralized API functionality
 */

// Authentication wrappers (new system)
export { withApiAuth, withApiAuthParams } from '@/lib/auth'

// Error handling
export { apiSuccess, handleApiError } from '@/lib/errors'

// Response patterns
export * from './responses'

// Legacy exports (for gradual migration)
export { withAuth, type AuthContext, type RouteContext } from './with-auth'
export { apiError, validationError, type ApiErrorResponse } from './errors'