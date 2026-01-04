/**
 * Store, products, cart, and inventory schemas
 */

import { z } from 'zod'
import { uuidSchema, optionalString, requiredString, currencySchema, enumSchema } from './common'

// ============================================
// Products
// ============================================

/**
 * Product categories
 */
export const PRODUCT_CATEGORIES = [
  'food',
  'treats',
  'toys',
  'health',
  'grooming',
  'accessories',
  'bedding',
  'carriers',
  'cleaning',
  'other',
] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

/**
 * Product status
 */
export const PRODUCT_STATUSES = ['active', 'inactive', 'discontinued'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

/**
 * Schema for creating a product
 */
export const createProductSchema = z.object({
  sku: requiredString('SKU', 50),
  name: requiredString('Nombre', 200),
  description: optionalString(2000),
  category: enumSchema(PRODUCT_CATEGORIES, 'Categoría'),
  price: currencySchema,
  cost: currencySchema.optional(),
  brand: optionalString(100),
  species: z.array(z.enum(['dog', 'cat', 'bird', 'fish', 'small_animal', 'all'])).optional(),
  weight_kg: z.coerce.number().min(0).optional(),
  barcode: optionalString(50),
  image_url: z.string().url('URL de imagen inválida').optional().nullable(),
  is_prescription_required: z.coerce.boolean().default(false),
  is_refrigerated: z.coerce.boolean().default(false),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

/**
 * Schema for updating a product
 */
export const updateProductSchema = createProductSchema.partial().extend({
  id: uuidSchema,
  status: enumSchema(PRODUCT_STATUSES, 'Estado').optional(),
})

export type UpdateProductInput = z.infer<typeof updateProductSchema>

/**
 * Schema for product query parameters
 */
export const productQuerySchema = z.object({
  category: enumSchema(PRODUCT_CATEGORIES, 'Categoría').optional(),
  status: enumSchema(PRODUCT_STATUSES, 'Estado').optional(),
  search: z.string().max(100).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  in_stock: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ProductQueryParams = z.infer<typeof productQuerySchema>

// ============================================
// Cart
// ============================================

/**
 * Schema for cart item
 */
export const cartItemSchema = z.object({
  product_id: uuidSchema,
  quantity: z.coerce.number().int().min(1, 'Cantidad mínima es 1').max(99, 'Cantidad máxima es 99'),
})

export type CartItem = z.infer<typeof cartItemSchema>

/**
 * Schema for adding to cart
 */
export const addToCartSchema = cartItemSchema

export type AddToCartInput = z.infer<typeof addToCartSchema>

/**
 * Schema for updating cart item
 */
export const updateCartItemSchema = z.object({
  product_id: uuidSchema,
  quantity: z.coerce.number().int().min(0).max(99), // 0 = remove
})

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>

/**
 * Schema for checkout
 */
export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'El carrito está vacío'),
  payment_method: z.enum(['cash', 'card', 'transfer', 'qr'], {
    message: 'Método de pago inválido',
  }),
  notes: optionalString(500),
  delivery_address: optionalString(500),
  contact_phone: z
    .string()
    .regex(/^(\+595|0)?[9][0-9]{8}$/, 'Número inválido')
    .optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

// ============================================
// Inventory
// ============================================

/**
 * Inventory transaction types
 */
export const INVENTORY_TRANSACTION_TYPES = [
  'purchase',
  'sale',
  'adjustment',
  'return',
  'damage',
  'expired',
  'transfer',
] as const
export type InventoryTransactionType = (typeof INVENTORY_TRANSACTION_TYPES)[number]

/**
 * Schema for inventory adjustment
 */
export const inventoryAdjustmentSchema = z.object({
  product_id: uuidSchema,
  quantity: z.coerce.number().int(), // Can be negative for removals
  type: enumSchema(INVENTORY_TRANSACTION_TYPES, 'Tipo de transacción'),
  cost_per_unit: currencySchema.optional(),
  reason: optionalString(500),
  reference_number: optionalString(50), // PO number, invoice, etc.
})

export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>

/**
 * Schema for stock take (inventory count)
 */
export const stockTakeSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: uuidSchema,
        counted_quantity: z.coerce.number().int().min(0),
        notes: optionalString(200),
      })
    )
    .min(1, 'Ingrese al menos un producto'),
  performed_by: optionalString(100),
  notes: optionalString(500),
})

export type StockTakeInput = z.infer<typeof stockTakeSchema>

/**
 * Schema for low stock alert settings
 */
export const lowStockAlertSchema = z.object({
  product_id: uuidSchema,
  reorder_level: z.coerce.number().int().min(0),
  reorder_quantity: z.coerce.number().int().min(1),
  notify_email: z.string().email().optional(),
})

export type LowStockAlertInput = z.infer<typeof lowStockAlertSchema>

// ============================================
// Invoices / Orders
// ============================================

/**
 * Order status
 */
export const ORDER_STATUSES = [
  'pending',
  'pending_prescription',
  'confirmed',
  'processing',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
  'prescription_rejected',
  'refunded',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/**
 * Schema for order query
 */
export const orderQuerySchema = z.object({
  status: enumSchema(ORDER_STATUSES, 'Estado').optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type OrderQueryParams = z.infer<typeof orderQuerySchema>

/**
 * Schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
  id: uuidSchema,
  status: enumSchema(ORDER_STATUSES, 'Estado'),
  notes: optionalString(500),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

// ============================================
// Loyalty Points
// ============================================

/**
 * Schema for loyalty point operations
 */
export const loyaltyPointsOperationSchema = z.object({
  user_id: uuidSchema,
  points: z.coerce.number().int(),
  operation: z.enum(['add', 'subtract', 'redeem'], {
    message: 'Operación inválida',
  }),
  reason: optionalString(200),
  reference_id: uuidSchema.optional(), // Order or transaction ID
})

export type LoyaltyPointsOperationInput = z.infer<typeof loyaltyPointsOperationSchema>
