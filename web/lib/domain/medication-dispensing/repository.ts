import { SupabaseClient } from '@supabase/supabase-js';
import { Dispense, CreateDispenseData, UpdateDispenseData } from './types';

export class DispenseRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMany(tenantId: string): Promise<Dispense[]> {
    const { data, error } = await this.supabase
      .from('dispenses')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    if (error) {
      throw error;
    }

    return data;
  }

  async findById(id: string, tenantId: string): Promise<Dispense | null> {
    const { data, error } = await this.supabase
      .from('dispenses')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async create(data: CreateDispenseData, userId: string, tenantId: string): Promise<Dispense> {
    const { data: dispense, error } = await this.supabase
      .from('dispenses')
      .insert([{
        ...data,
        tenant_id: tenantId,
        created_by: userId,
      }])
      .single();

    if (error) {
      throw error;
    }

    return dispense;
  }

  async update(id: string, data: UpdateDispenseData, userId: string, tenantId: string): Promise<Dispense> {
    const { data: dispense, error } = await this.supabase
      .from('dispenses')
      .update([{
        ...data,
        updated_by: userId,
      }])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return dispense;
  }
}