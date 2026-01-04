/**
 * Common validation schemas shared across the application
 */

import { z } from 'zod'

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('ID inválido')

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email es requerido')
  .email('Formato de email inválido')

/**
 * Phone number validation (Paraguay format)
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+595|0)?[9][0-9]{8}$/, 'Número de teléfono inválido')

/**
 * Date string validation (ISO format)
 */
export const dateStringSchema = z.string().datetime('Fecha inválida')

/**
 * Future date validation
 */
export const futureDateSchema = z
  .string()
  .datetime('Fecha inválida')
  .refine((date) => new Date(date) > new Date(), 'La fecha debe ser futura')

/**
 * Past date validation
 */
export const pastDateSchema = z
  .string()
  .datetime('Fecha inválida')
  .refine((date) => new Date(date) <= new Date(), 'La fecha debe ser pasada o actual')

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * Sort parameters
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Search/filter parameters
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  filter: z.record(z.string(), z.string()).optional(),
})

/**
 * Currency amount (positive number with 2 decimal places)
 */
export const currencySchema = z
  .number()
  .min(0, 'El monto debe ser positivo')
  .transform((val) => Math.round(val * 100) / 100)

/**
 * Percentage (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Porcentaje debe ser entre 0 y 100')
  .max(100, 'Porcentaje debe ser entre 0 y 100')

/**
 * Non-empty string with max length
 */
export function requiredString(fieldName: string, maxLength: number = 255) {
  return z
    .string()
    .min(1, `${fieldName} es requerido`)
    .max(maxLength, `${fieldName} muy largo (máx ${maxLength} caracteres)`)
}

/**
 * Optional string with max length
 */
export function optionalString(maxLength: number = 255) {
  return z
    .string()
    .max(maxLength, `Texto muy largo (máx ${maxLength} caracteres)`)
    .optional()
    .transform((val) => val || undefined)
}

/**
 * Helper to create enum schema with Spanish error message
 */
export function enumSchema<T extends string>(values: readonly T[], fieldName: string) {
  return z.enum(values as [T, ...T[]], {
    message: `${fieldName} inválido`,
  })
}
