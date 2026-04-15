import type { SupabaseClient } from '@supabase/supabase-js';
import { KennelRepository } from './repository';
import type { Kennel, CreateKennelData, UpdateKennelData, KennelFilters } from './types';

export class KennelService {
  private repository: KennelRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new KennelRepository(supabase);
  }

  async createKennel(data: CreateKennelData, userId: string, tenantId: string): Promise<Kennel> {
    return this.repository.create(data, userId, tenantId);
  }

  async updateKennel(id: string, data: UpdateKennelData, userId: string, tenantId: string): Promise<Kennel> {
    return this.repository.update(id, data, userId, tenantId);
  }

  async getKennels(filters: KennelFilters = {}, tenantId: string): Promise<Kennel[]> {
    return this.repository.findMany(filters, tenantId);
  }

  async getKennelById(id: string, tenantId: string): Promise<Kennel | null> {
    return this.repository.findById(id, tenantId);
  }
}

### Server Actions