import { SupabaseClient } from '@supabase/supabase-js';
import { RefillRequest } from './types';

export class PrescriptionRepository {
  constructor(private supabase: SupabaseClient) {}

  async createRefillRequest(data: any, tenantId: string): Promise<RefillRequest> {
    const { data: refillRequest, error } = await this.supabase
      .from('refill_requests')
      .insert({
        ...data,
        tenant_id: tenantId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return refillRequest;
  }

  async getRefillRequest(id: string, tenantId: string): Promise<RefillRequest | null> {
    const { data, error } = await this.supabase
      .from('refill_requests')
      .select()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateRefillRequest(id: string, data: any, tenantId: string): Promise<RefillRequest> {
    const { data: refillRequest, error } = await this.supabase
      .from('refill_requests')
      .update({
        ...data,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return refillRequest;
  }
}