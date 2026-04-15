import type { SupabaseClient } from '@supabase/supabase-js';
import { SupplierRepository } from './repository';
import type {
  Supplier,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierFilters,
} from './types';

export class SupplierService {
  private repository: SupplierRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new SupplierRepository(supabase);
  }

  async createSupplier(data: CreateSupplierData, tenantId: string): Promise<Supplier> {
    return this.repository.createSupplier(data, tenantId);
  }

  async updateSupplier(id: string, data: UpdateSupplierData, tenantId: string): Promise<Supplier> {
    return this.repository.updateSupplier(id, data, tenantId);
  }

  async deleteSupplier(id: string, tenantId: string): Promise<void> {
    return this.repository.deleteSupplier(id, tenantId);
  }

  async getSupplier(id: string, tenantId: string): Promise<Supplier | null> {
    return this.repository.getSupplier(id, tenantId);
  }

  async getSuppliers(filters: SupplierFilters = {}, tenantId: string): Promise<Supplier[]> {
    return this.repository.getSuppliers(filters, tenantId);
  }
}