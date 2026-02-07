/**
 * Ambassador validation schemas
 */

import { z } from 'zod'
import { requiredString, uuidSchema } from './common'

/**
 * Schema for ambassador code validation query
 */
export const validateCodeQuerySchema = z.object({
  code: requiredString('Código', 50),
})

export type ValidateCodeQueryInput = z.infer<typeof validateCodeQuerySchema>

/**
 * Schema for ambassador conversion processing
 */
export const processConversionSchema = z.object({
  tenantId: uuidSchema,
  subscriptionAmount: z.number().positive('El monto debe ser positivo'),
})

export type ProcessConversionInput = z.infer<typeof processConversionSchema>
