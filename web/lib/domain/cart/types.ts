import type { PetSizeCategory } from '@/lib/utils/pet-size'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
  pet_id?: string
  pet_name?: string
  pet_size?: PetSizeCategory
  service_id?: string
  variant_name?: string
}

export interface Cart {
  items: CartItem[]
  tenantId: string
  updatedAt: string
}

export interface CartTotals {
  subtotal: number
  totalDiscount: number
  shippingCost: number
  total: number
}