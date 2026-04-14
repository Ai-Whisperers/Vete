import type { SupabaseClient } from '@supabase/supabase-js'
import type { Cart, CartItem } from './types'

export class CartRepository {
  constructor(private supabase: SupabaseClient) {}

  async getCart(tenantId: string): Promise<Cart | null> {
    const { data, error } = await this.supabase
      .from('carts')
      .select('*, items(*)')
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) return null

    return {
      items: data.items,
      tenantId: data.tenant_id,
      updatedAt: data.updated_at,
    }
  }

  async updateCart(cart: Cart, userId: string): Promise<Cart> {
    const { data, error } = await this.supabase
      .from('carts')
      .update({
        items: cart.items,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', cart.tenantId)
      .eq('user_id', userId)
      .single()

    if (error || !data) throw error

    return {
      items: data.items,
      tenantId: data.tenant_id,
      updatedAt: data.updated_at,
    }
  }

  async createCart(cart: Omit<Cart, 'updatedAt'>, userId: string): Promise<Cart> {
    const { data, error } = await this.supabase
      .from('carts')
      .insert({
        tenant_id: cart.tenantId,
        user_id: userId,
        items: cart.items,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .single()

    if (error || !data) throw error

    return {
      items: data.items,
      tenantId: data.tenant_id,
      updatedAt: data.updated_at,
    }
  }
}