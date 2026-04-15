import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiAuth, withApiAuthParams, type ApiHandlerContext, type ApiHandlerContextWithParams } from '@/lib/auth/api-wrapper'
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors'
import type { UserRole } from '@/lib/auth/types'
import type { RateLimitType } from '@/lib/rate-limit'

/**
 * Generic CRUD Handler Factory
 * 
 * Creates standardized REST API handlers for database tables with:
 * - Automatic tenant isolation (tenant_id filtering)
 * - Zod schema validation
 * - Standardized error responses
 * - Pagination support
 * - Soft delete support
 * - Role-based access control
 * 
 * @example
 * ```typescript
 * // api/suppliers/route.ts
 * import { createCrudHandler } from '@/lib/api/crud-handler'
 * import { supplierSchema, updateSupplierSchema } from '@/lib/schemas/supplier'
 * 
 * const { GET, POST, PUT, DELETE } = createCrudHandler({
 *   table: 'suppliers',
 *   schemas: {
 *     create: supplierSchema,
 *     update: updateSupplierSchema,
 *   },
 *   roles: {
 *     read: ['client', 'practitioner', 'admin'],
 *     write: ['admin'],
 *   },
 *   defaultSelect: '*, contact_info',
 *   searchFields: ['name', 'email'],
 * })
 * 
 * export { GET, POST, PUT, DELETE }
 * ```
 */
export function createCrudHandler<
  TCreate extends z.ZodTypeAny = z.ZodTypeAny,
  TUpdate extends z.ZodTypeAny = z.ZodTypeAny,
  TQuery extends z.ZodTypeAny = z.ZodTypeAny,
>({
  table,
  schemas,
  roles,
  defaultSelect,
  searchFields,
  softDelete,
  primaryKey,
  filterKey,
  rateLimit,
  hooks,
  queryModifier,
  orderBy,
  maxLimit,
}: CrudHandlerOptions<
  TCreate,
  TUpdate,
  TQuery
>): {
  GET: (ctx: ApiHandlerContext) => Promise<NextResponse>
  POST: (ctx: ApiHandlerContextWithParams) => Promise<NextResponse>
  PUT: (ctx: ApiHandlerContextWithParams) => Promise<NextResponse>
  DELETE: (ctx: ApiHandlerContext) => Promise<NextResponse>
} {
  // ... (rest of the file remains the same)