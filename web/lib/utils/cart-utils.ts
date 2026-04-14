import type { CartItem } from '@/domain/cart/types'

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
}

export function calculateTotalDiscount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + (item.price * item.quantity * item.discount), 0)
}

export function calculateShippingCost(items: CartItem[]): number {
  // Implement shipping cost calculation logic here
  return 0
}

export function calculateTotal(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items)
  const totalDiscount = calculateTotalDiscount(items)
  const shippingCost = calculateShippingCost(items)

  return subtotal - totalDiscount + shippingCost
}