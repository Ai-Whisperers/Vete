import { SupabaseClient } from '@supabase/supabase-js';
import { Claim, CreateClaimData, UpdateClaimData } from './types';

export class ClaimRepository {
  constructor(private supabase: SupabaseClient) {}

  async createClaim(data: CreateClaimData, userId: string, tenantId: string): Promise<Claim> {
    const { data: claimData, error } = await this.supabase
      .from('claims')
      .insert([data])
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return claimData;
  }

  async updateClaim(id: string, data: UpdateClaimData, userId: string, tenantId: string): Promise<Claim> {
    const { data: claimData, error } = await this.supabase
      .from('claims')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return claimData;
  }

  async getClaim(id: string, tenantId: string): Promise<Claim | null> {
    const { data, error } = await this.supabase
      .from('claims')
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