/**
 * Authentication utilities for enforcing role-based access control.
 *
 * These utilities handle:
 * - User authentication verification
 * - Role-based access (owner, vet, admin)
 * - Multi-tenant isolation
 * - Automatic redirects for unauthorized access
 *
 * @module lib/auth
 */

export { requireStaff, requireAdmin } from './require-staff'
export { requireOwner } from './require-owner'
