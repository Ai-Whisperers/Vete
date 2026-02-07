/**
 * Finance validation schemas
 */

import { z } from 'zod'

/**
 * Schema for P&L query
 */
export const plQuerySchema = z.object({
  clinic: z.string().uuid().optional(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
})

export type PLQueryInput = z.infer<typeof plQuerySchema>
