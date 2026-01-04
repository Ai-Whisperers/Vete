/**
 * Cart Component Tests
 *
 * Tests the shopping cart functionality including:
 * - Cart item management (add, remove, update quantity)
 * - Price calculations with discounts
 * - Stock validation
 * - Prescription product handling
 * - Cart persistence
 *
 * @ticket TICKET-UI-004
 */
import { describe, it, expect } from 'vitest'

describe('Cart Item Management', () => {
  interface CartItem {
    productId: string
    name: string
    quantity: number
    unitPrice: number
    discountPercent: number
    maxStock: number
    requiresPrescription: boolean
    prescriptionUrl?: string
  }

  interface Cart {
    items: CartItem[]
    tenantId: string
    updatedAt: string
  }

  const addItemToCart = (
    cart: Cart,
    item: Omit<CartItem, 'quantity'> & { quantity?: number }
  ): Cart => {
    const existingIndex = cart.items.findIndex((i) => i.productId === item.productId)

    if (existingIndex >= 0) {
      // Update quantity
      const newItems = [...cart.items]
      const newQuantity = newItems[existingIndex].quantity + (item.quantity || 1)
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: Math.min(newQuantity, item.maxStock),
      }
      return { ...cart, items: newItems, updatedAt: new Date().toISOString() }
    }

    // Add new item
    return {
      ...cart,
      items: [...cart.items, { ...item, quantity: item.quantity || 1 }],
      updatedAt: new Date().toISOString(),
    }
  }

  const removeItemFromCart = (cart: Cart, productId: string): Cart => {
    return {
      ...cart,
      items: cart.items.filter((i) => i.productId !== productId),
      updatedAt: new Date().toISOString(),
    }
  }

  const updateItemQuantity = (cart: Cart, productId: string, quantity: number): Cart => {
    const newItems = cart.items.map((item) => {
      if (item.productId === productId) {
        const validQuantity = Math.max(0, Math.min(quantity, item.maxStock))
        return { ...item, quantity: validQuantity }
      }
      return item
    })

    // Remove items with quantity 0
    return {
      ...cart,
      items: newItems.filter((i) => i.quantity > 0),
      updatedAt: new Date().toISOString(),
    }
  }

  const emptyCart: Cart = {
    items: [],
    tenantId: 'tenant-1',
    updatedAt: new Date().toISOString(),
  }

  const sampleItem: CartItem = {
    productId: 'prod-1',
    name: 'Dog Food Premium',
    quantity: 1,
    unitPrice: 150000,
    discountPercent: 0,
    maxStock: 10,
    requiresPrescription: false,
  }

  it('should add item to empty cart', () => {
    const newCart = addItemToCart(emptyCart, sampleItem)

    expect(newCart.items).toHaveLength(1)
    expect(newCart.items[0].productId).toBe('prod-1')
    expect(newCart.items[0].quantity).toBe(1)
  })

  it('should increment quantity when adding same item', () => {
    let cart = addItemToCart(emptyCart, sampleItem)
    cart = addItemToCart(cart, sampleItem)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(2)
  })

  it('should not exceed max stock when adding', () => {
    let cart = addItemToCart(emptyCart, { ...sampleItem, quantity: 8 })
    cart = addItemToCart(cart, { ...sampleItem, quantity: 5 })

    expect(cart.items[0].quantity).toBe(10) // Max stock
  })

  it('should remove item from cart', () => {
    const cart = addItemToCart(emptyCart, sampleItem)
    const newCart = removeItemFromCart(cart, 'prod-1')

    expect(newCart.items).toHaveLength(0)
  })

  it('should update item quantity', () => {
    const cart = addItemToCart(emptyCart, sampleItem)
    const newCart = updateItemQuantity(cart, 'prod-1', 5)

    expect(newCart.items[0].quantity).toBe(5)
  })

  it('should remove item when quantity set to 0', () => {
    const cart = addItemToCart(emptyCart, sampleItem)
    const newCart = updateItemQuantity(cart, 'prod-1', 0)

    expect(newCart.items).toHaveLength(0)
  })

  it('should not exceed max stock when updating quantity', () => {
    const cart = addItemToCart(emptyCart, sampleItem)
    const newCart = updateItemQuantity(cart, 'prod-1', 15)

    expect(newCart.items[0].quantity).toBe(10) // Max stock
  })
})

describe('Cart Price Calculations', () => {
  interface CartItem {
    quantity: number
    unitPrice: number
    discountPercent: number
  }

  const calculateItemSubtotal = (item: CartItem): number => {
    return item.quantity * item.unitPrice
  }

  const calculateItemDiscount = (item: CartItem): number => {
    const subtotal = calculateItemSubtotal(item)
    return Math.round((subtotal * item.discountPercent) / 100)
  }

  const calculateItemTotal = (item: CartItem): number => {
    const subtotal = calculateItemSubtotal(item)
    const discount = calculateItemDiscount(item)
    return subtotal - discount
  }

  interface CartTotals {
    subtotal: number
    totalDiscount: number
    shippingCost: number
    total: number
  }

  const calculateCartTotals = (
    items: CartItem[],
    shippingCost: number = 0
  ): CartTotals => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0)
    const totalDiscount = items.reduce((sum, item) => sum + calculateItemDiscount(item), 0)

    return {
      subtotal,
      totalDiscount,
      shippingCost,
      total: subtotal - totalDiscount + shippingCost,
    }
  }

  it('should calculate item subtotal', () => {
    const item: CartItem = { quantity: 2, unitPrice: 50000, discountPercent: 0 }
    expect(calculateItemSubtotal(item)).toBe(100000)
  })

  it('should calculate item discount', () => {
    const item: CartItem = { quantity: 1, unitPrice: 100000, discountPercent: 15 }
    expect(calculateItemDiscount(item)).toBe(15000)
  })

  it('should calculate item total with discount', () => {
    const item: CartItem = { quantity: 2, unitPrice: 50000, discountPercent: 10 }
    // Subtotal: 100000, Discount: 10000
    expect(calculateItemTotal(item)).toBe(90000)
  })

  it('should calculate cart totals', () => {
    const items: CartItem[] = [
      { quantity: 2, unitPrice: 50000, discountPercent: 0 },
      { quantity: 1, unitPrice: 80000, discountPercent: 10 },
    ]

    const totals = calculateCartTotals(items, 15000)

    expect(totals.subtotal).toBe(180000) // 100000 + 80000
    expect(totals.totalDiscount).toBe(8000) // 0 + 8000
    expect(totals.shippingCost).toBe(15000)
    expect(totals.total).toBe(187000) // 180000 - 8000 + 15000
  })

  it('should handle empty cart', () => {
    const totals = calculateCartTotals([])

    expect(totals.subtotal).toBe(0)
    expect(totals.total).toBe(0)
  })
})

describe('Stock Validation', () => {
  interface StockInfo {
    productId: string
    availableStock: number
    reservedStock: number
  }

  interface StockValidation {
    valid: boolean
    productId: string
    requestedQuantity: number
    availableQuantity: number
    message?: string
  }

  const validateStock = (
    productId: string,
    requestedQuantity: number,
    stockInfo: StockInfo
  ): StockValidation => {
    const available = stockInfo.availableStock - stockInfo.reservedStock

    if (requestedQuantity <= 0) {
      return {
        valid: false,
        productId,
        requestedQuantity,
        availableQuantity: available,
        message: 'La cantidad debe ser mayor a 0',
      }
    }

    if (requestedQuantity > available) {
      return {
        valid: false,
        productId,
        requestedQuantity,
        availableQuantity: available,
        message: `Solo hay ${available} unidades disponibles`,
      }
    }

    return {
      valid: true,
      productId,
      requestedQuantity,
      availableQuantity: available,
    }
  }

  it('should validate available stock', () => {
    const stock: StockInfo = { productId: 'p1', availableStock: 10, reservedStock: 2 }
    const result = validateStock('p1', 5, stock)

    expect(result.valid).toBe(true)
    expect(result.availableQuantity).toBe(8)
  })

  it('should reject when requesting more than available', () => {
    const stock: StockInfo = { productId: 'p1', availableStock: 10, reservedStock: 2 }
    const result = validateStock('p1', 10, stock)

    expect(result.valid).toBe(false)
    expect(result.message).toContain('8 unidades')
  })

  it('should reject zero quantity', () => {
    const stock: StockInfo = { productId: 'p1', availableStock: 10, reservedStock: 0 }
    const result = validateStock('p1', 0, stock)

    expect(result.valid).toBe(false)
    expect(result.message).toContain('mayor a 0')
  })

  it('should consider reserved stock', () => {
    const stock: StockInfo = { productId: 'p1', availableStock: 10, reservedStock: 8 }
    const result = validateStock('p1', 3, stock)

    expect(result.valid).toBe(false)
    expect(result.availableQuantity).toBe(2)
  })
})

describe('Prescription Product Handling', () => {
  interface CartItem {
    productId: string
    name: string
    requiresPrescription: boolean
    prescriptionUrl?: string
  }

  interface PrescriptionValidation {
    valid: boolean
    missingPrescriptions: string[]
    message?: string
  }

  const validatePrescriptions = (items: CartItem[]): PrescriptionValidation => {
    const prescriptionItems = items.filter((i) => i.requiresPrescription)
    const missingPrescriptions = prescriptionItems
      .filter((i) => !i.prescriptionUrl)
      .map((i) => i.name)

    if (missingPrescriptions.length > 0) {
      return {
        valid: false,
        missingPrescriptions,
        message: `Falta receta para: ${missingPrescriptions.join(', ')}`,
      }
    }

    return {
      valid: true,
      missingPrescriptions: [],
    }
  }

  const hasPrescriptionItems = (items: CartItem[]): boolean => {
    return items.some((i) => i.requiresPrescription)
  }

  it('should pass validation when no prescriptions needed', () => {
    const items: CartItem[] = [
      { productId: 'p1', name: 'Dog Food', requiresPrescription: false },
    ]

    const result = validatePrescriptions(items)
    expect(result.valid).toBe(true)
  })

  it('should pass validation when prescriptions provided', () => {
    const items: CartItem[] = [
      {
        productId: 'p1',
        name: 'Antibiotics',
        requiresPrescription: true,
        prescriptionUrl: 'https://example.com/prescription.pdf',
      },
    ]

    const result = validatePrescriptions(items)
    expect(result.valid).toBe(true)
  })

  it('should fail validation when prescription missing', () => {
    const items: CartItem[] = [
      { productId: 'p1', name: 'Antibiotics', requiresPrescription: true },
    ]

    const result = validatePrescriptions(items)
    expect(result.valid).toBe(false)
    expect(result.missingPrescriptions).toContain('Antibiotics')
  })

  it('should detect prescription items in cart', () => {
    const itemsWithPrescription: CartItem[] = [
      { productId: 'p1', name: 'Food', requiresPrescription: false },
      { productId: 'p2', name: 'Medicine', requiresPrescription: true },
    ]

    const itemsWithout: CartItem[] = [
      { productId: 'p1', name: 'Food', requiresPrescription: false },
    ]

    expect(hasPrescriptionItems(itemsWithPrescription)).toBe(true)
    expect(hasPrescriptionItems(itemsWithout)).toBe(false)
  })
})

describe('Cart Badge Count', () => {
  interface CartItem {
    quantity: number
  }

  const getCartBadgeCount = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const formatBadgeCount = (count: number): string => {
    if (count === 0) return ''
    if (count > 99) return '99+'
    return String(count)
  }

  it('should count total items in cart', () => {
    const items: CartItem[] = [{ quantity: 2 }, { quantity: 3 }, { quantity: 1 }]

    expect(getCartBadgeCount(items)).toBe(6)
  })

  it('should return 0 for empty cart', () => {
    expect(getCartBadgeCount([])).toBe(0)
  })

  it('should format badge count', () => {
    expect(formatBadgeCount(0)).toBe('')
    expect(formatBadgeCount(5)).toBe('5')
    expect(formatBadgeCount(99)).toBe('99')
    expect(formatBadgeCount(100)).toBe('99+')
  })
})

describe('Cart Persistence', () => {
  interface Cart {
    items: Array<{ productId: string; quantity: number }>
    tenantId: string
    updatedAt: string
  }

  const serializeCart = (cart: Cart): string => {
    return JSON.stringify(cart)
  }

  const deserializeCart = (json: string): Cart | null => {
    try {
      const parsed = JSON.parse(json)
      if (!parsed.items || !parsed.tenantId) return null
      return parsed as Cart
    } catch {
      return null
    }
  }

  const isCartStale = (cart: Cart, maxAgeHours: number = 24): boolean => {
    const updatedAt = new Date(cart.updatedAt)
    const now = new Date()
    const diffHours = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
    return diffHours > maxAgeHours
  }

  it('should serialize cart to JSON', () => {
    const cart: Cart = {
      items: [{ productId: 'p1', quantity: 2 }],
      tenantId: 't1',
      updatedAt: '2024-01-15T10:00:00Z',
    }

    const json = serializeCart(cart)
    expect(JSON.parse(json)).toEqual(cart)
  })

  it('should deserialize valid JSON', () => {
    const json = '{"items":[{"productId":"p1","quantity":2}],"tenantId":"t1","updatedAt":"2024-01-15T10:00:00Z"}'
    const cart = deserializeCart(json)

    expect(cart).not.toBeNull()
    expect(cart?.items).toHaveLength(1)
  })

  it('should return null for invalid JSON', () => {
    expect(deserializeCart('invalid')).toBeNull()
    expect(deserializeCart('{}')).toBeNull()
    expect(deserializeCart('{"items":[]}')).toBeNull()
  })

  it('should detect stale cart', () => {
    const oldCart: Cart = {
      items: [],
      tenantId: 't1',
      updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
    }

    const recentCart: Cart = {
      items: [],
      tenantId: 't1',
      updatedAt: new Date().toISOString(),
    }

    expect(isCartStale(oldCart)).toBe(true)
    expect(isCartStale(recentCart)).toBe(false)
  })
})

describe('Shipping Cost Calculation', () => {
  interface ShippingRule {
    minOrderValue: number
    shippingCost: number
  }

  const shippingRules: ShippingRule[] = [
    { minOrderValue: 500000, shippingCost: 0 }, // Free shipping over 500k
    { minOrderValue: 200000, shippingCost: 15000 },
    { minOrderValue: 0, shippingCost: 25000 },
  ]

  const calculateShippingCost = (orderValue: number, rules: ShippingRule[]): number => {
    // Sort by minOrderValue descending to find the best matching rule
    const sortedRules = [...rules].sort((a, b) => b.minOrderValue - a.minOrderValue)

    for (const rule of sortedRules) {
      if (orderValue >= rule.minOrderValue) {
        return rule.shippingCost
      }
    }

    return sortedRules[sortedRules.length - 1]?.shippingCost || 0
  }

  const getShippingMessage = (shippingCost: number, orderValue: number): string => {
    if (shippingCost === 0) {
      return '¡Envío gratis!'
    }

    const freeShippingThreshold = 500000
    const remaining = freeShippingThreshold - orderValue

    if (remaining > 0) {
      return `Agrega ₲ ${remaining.toLocaleString('es-PY')} más para envío gratis`
    }

    return `Costo de envío: ₲ ${shippingCost.toLocaleString('es-PY')}`
  }

  it('should apply free shipping for orders over 500k', () => {
    expect(calculateShippingCost(600000, shippingRules)).toBe(0)
    expect(calculateShippingCost(500000, shippingRules)).toBe(0)
  })

  it('should apply reduced shipping for orders over 200k', () => {
    expect(calculateShippingCost(300000, shippingRules)).toBe(15000)
    expect(calculateShippingCost(200000, shippingRules)).toBe(15000)
  })

  it('should apply full shipping for small orders', () => {
    expect(calculateShippingCost(100000, shippingRules)).toBe(25000)
    expect(calculateShippingCost(50000, shippingRules)).toBe(25000)
  })

  it('should show free shipping message', () => {
    expect(getShippingMessage(0, 600000)).toBe('¡Envío gratis!')
  })

  it('should show remaining for free shipping', () => {
    const message = getShippingMessage(15000, 350000)
    expect(message).toContain('150.000')
    expect(message).toContain('envío gratis')
  })
})

describe('Cart Empty States', () => {
  interface CartState {
    isEmpty: boolean
    itemCount: number
    lastAction?: string
  }

  const getEmptyCartMessage = (state: CartState): string => {
    if (state.lastAction === 'checkout_completed') {
      return '¡Gracias por tu compra! Tu carrito está vacío.'
    }

    if (state.lastAction === 'cart_cleared') {
      return 'Has vaciado tu carrito.'
    }

    return 'Tu carrito está vacío. ¡Explora nuestros productos!'
  }

  it('should show default empty message', () => {
    const state: CartState = { isEmpty: true, itemCount: 0 }
    expect(getEmptyCartMessage(state)).toContain('Explora nuestros productos')
  })

  it('should show post-checkout message', () => {
    const state: CartState = { isEmpty: true, itemCount: 0, lastAction: 'checkout_completed' }
    expect(getEmptyCartMessage(state)).toContain('Gracias por tu compra')
  })

  it('should show cleared cart message', () => {
    const state: CartState = { isEmpty: true, itemCount: 0, lastAction: 'cart_cleared' }
    expect(getEmptyCartMessage(state)).toContain('vaciado')
  })
})
