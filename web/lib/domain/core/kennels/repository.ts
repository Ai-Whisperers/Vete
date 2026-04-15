import type { SupabaseClient } from '@supabase/supabase-js';
import type { Kennel, CreateKennelData, UpdateKennelData, KennelFilters } from './types';

export class KennelRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateKennelData, userId: string, tenantId: string): Promise<Kennel> {
    const { data: kennel, error } = await this.supabase
      .from('kennels')
      .insert([data])
      .eq('tenant_id', tenantId)
      .single();

    if (error || !kennel) {
      throw error;
    }

    return kennel;
  }

  async update(id: string, data: UpdateKennelData, userId: string, tenantId: string): Promise<Kennel> {
    const { data: kennel, error } = await this.supabase
      .from('kennels')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !kennel) {
      throw error;
    }

    return kennel;
  }

  async findMany(filters: KennelFilters = {}, tenantId: string): Promise<Kennel[]> {
    const { data, error } = await this.supabase
      .from('kennels')
      .select('*')
      .eq('tenant_id', tenantId)
      .filter(filters);

    if (error) {
      throw error;
    }

    return data;
  }

  async findById(id: string, tenantId: string): Promise<Kennel | null> {
    const { data, error } = await this.supabase
      .from('kennels')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}

#### Service