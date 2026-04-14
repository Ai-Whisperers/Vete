import type { SupabaseClient } from '@supabase/supabase-js'
import { CartRepository } from './repository'
import type { Cart, CartItem } from './types'

export class CartService {
  private repository: CartRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new CartRepository(supabase)
  }

  async getCart(tenantId: string, userId: string): Promise<Cart | null> {
    return this.repository.getCart(tenantId)
  }

  async updateCart(cart: Cart, userId: string): Promise<Cart> {
    return this.repository.updateCart(cart, userId)
  }

  async createCart(cart: Omit<Cart, 'updatedAt'>, userId: string): Promise<Cart> {
    return this.repository.createCart(cart, userId)
  }
}