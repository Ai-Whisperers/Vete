import type { SupabaseClient } from '@supabase/supabase-js';
import type { Inventory, InventoryTransaction, InventoryWithProduct } from './types';

export class InventoryRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByProductId(productId: string, tenantId: string): Promise<Inventory | null> {
    const { data, error } = await this.supabase
      .from('store_inventory')
      .select('*')
      .eq('product_id', productId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) return null;

    return data;
  }

  async list(tenantId: string, filters: any = {}): Promise<InventoryWithProduct[]> {
    let query = this.supabase
      .from('store_inventory')
      .select(`
        *,
        product:store_products(name, sku, category, unit)
      `)
      .eq('tenant_id', tenantId);

    // Apply filters
    if (filters.low_stock) {
      query = query.lte('stock_quantity', 'reorder_point');
    }

    if (filters.out_of_stock) {
      query = query.eq('stock_quantity', 0);
    }

    if (filters.product_id) {
      query = query.eq('product_id', filters.product_id);
    }

    if (filters.location) {
      query = query.eq('location', filters.location);
    }

    if (filters.supplier) {
      query = query.eq('supplier_name', filters.supplier);
    }

    if (filters.expiring_soon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(data: any): Promise<Inventory> {
    const { data: result, error } = await this.supabase
      .from('store_inventory')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(productId: string, tenantId: string, data: any): Promise<Inventory> {
    const { data: result, error } = await this.supabase
      .from('store_inventory')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('product_id', productId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return result;
  }
}