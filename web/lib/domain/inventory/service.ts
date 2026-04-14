import type { SupabaseClient } from '@supabase/supabase-js';
import { InventoryRepository } from './repository';
import type { Inventory, InventoryTransaction, InventoryWithProduct } from './types';

export class InventoryService {
  private repository: InventoryRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new InventoryRepository(supabase);
  }

  async getByProductId(productId: string, tenantId: string): Promise<Inventory | null> {
    return this.repository.getByProductId(productId, tenantId);
  }

  async list(tenantId: string, filters: any = {}): Promise<InventoryWithProduct[]> {
    return this.repository.list(tenantId, filters);
  }

  async create(data: any): Promise<Inventory> {
    return this.repository.create(data);
  }

  async update(productId: string, tenantId: string, data: any): Promise<Inventory> {
    return this.repository.update(productId, tenantId, data);
  }
}

#### Server Actions

We will create server actions to handle inventory-related requests.