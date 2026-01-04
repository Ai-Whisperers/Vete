/**
 * Standardized API pagination utilities
 * API-003: Create Standardized Pagination
 */

import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Parse pagination parameters from URL search params
 *
 * @param searchParams - URL search params
 * @returns Pagination parameters with offset calculated
 *
 * @example
 * ```typescript
 * const { searchParams } = new URL(request.url);
 * const { page, limit, offset } = parsePagination(searchParams);
 * ```
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const result = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  })

  const { page, limit } = result.success ? result.data : { page: 1, limit: 20 }
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Create a paginated response with metadata
 *
 * @param data - Array of data items for current page
 * @param total - Total number of items across all pages
 * @param params - Pagination parameters used for the query
 * @returns Paginated response with metadata
 *
 * @example
 * ```typescript
 * const { data, error, count } = await supabase
 *   .from('clients')
 *   .select('*', { count: 'exact' })
 *   .range(offset, offset + limit - 1);
 *
 * return NextResponse.json(paginatedResponse(data, count, { page, limit, offset }));
 * ```
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, limit } = params
  const pages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  }
}
