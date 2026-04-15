import type { SupabaseClient } from '@supabase/supabase-js';
import type { Supplier, CreateSupplierData, UpdateSupplierData, SupplierFilters } from './types';

export class SupplierRepository {
  constructor(private supabase: SupabaseClient) {}

  async createSupplier(data: CreateSupplierData, tenantId: string): Promise<Supplier> {
    const { data: supplier, error } = await this.supabase
      .from('suppliers')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return supplier;
  }

  async updateSupplier(id: string, data: UpdateSupplierData, tenantId: string): Promise<Supplier> {
    const { data: supplier, error } = await this.supabase
      .from('suppliers')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return supplier;
  }

  async deleteSupplier(id: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }
  }

  async getSupplier(id: string, tenantId: string): Promise<Supplier | null> {
    const { data, error } = await this.supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  }

  async getSuppliers(filters: SupplierFilters = {}, tenantId: string): Promise<Supplier[]> {
    const { data, error } = await this.supabase
      .from('suppliers')
      .select('*')
      .eq('tenant_id', tenantId)
      .filter(filters)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}