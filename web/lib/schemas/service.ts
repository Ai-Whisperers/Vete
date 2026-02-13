/**
 * Service validation schemas
 */

import { z } from 'zod'
import { uuidSchema, optionalString } from './common'

/**
 * Schema for service query parameters
 */
export const serviceQuerySchema = z.object({
  clinic: z.string().min(1, 'Clinic slug is required'),
  category: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
})

export type ServiceQueryParams = z.infer<typeof serviceQuerySchema>

/**
 * Schema for creating a new service
 */
export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Service name too long'),
  description: optionalString(500),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  base_price: z.coerce.number().min(0, 'Price must be non-negative'),
  duration_minutes: z.coerce.number().int().min(5).max(480).default(30),
  is_active: z.boolean().default(true),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>

/**
 * Schema for updating a service
 */
export const updateServiceSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(100).optional(),
  description: optionalString(500).optional(),
  category: z.string().min(1).max(50).optional(),
  base_price: z.coerce.number().min(0).optional(),
  duration_minutes: z.coerce.number().int().min(5).max(480).optional(),
  is_active: z.boolean().optional(),
})

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>