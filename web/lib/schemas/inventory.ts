/**
 * Inventory validation schemas
 */

import { z } from 'zod'
import { uuidSchema, optionalString } from './common'

/**
 * Schema for barcode lookup query
 */
export const barcodeLookupQuerySchema = z.object({
  barcode: z.string().min(1, 'Código de barras requerido').max(100),
  clinic: uuidSchema,
})

export type BarcodeLookupQueryInput = z.infer<typeof barcodeLookupQuerySchema>

/**
 * Adjustment reasons
 */
export const ADJUSTMENT_REASONS = [
  'physical_count',
  'damage',
  'theft',
  'expired',
  'return',
  'correction',
  'other',
] as const

export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number]

/**
 * Schema for inventory adjustment
 */
export const inventoryAdjustSchema = z.object({
  product_id: uuidSchema,
  new_quantity: z.number().int().min(0, 'La cantidad no puede ser negativa'),
  reason: z.enum(ADJUSTMENT_REASONS, {
    message: 'Razón de ajuste inválida',
  }),
  notes: optionalString(500),
})

export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>

/**
 * Schema for inventory import preview
 */
export const inventoryImportPreviewSchema = z.object({
  format: z.enum(['csv', 'xlsx']).default('csv'),
})

export type InventoryImportPreviewInput = z.infer<typeof inventoryImportPreviewSchema>
