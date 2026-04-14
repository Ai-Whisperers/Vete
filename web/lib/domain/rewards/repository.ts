import type { SupabaseClient } from '@supabase/supabase-js';
import { Reward, Redemption, CreateRedemptionData } from './types';

export class RewardRepository {
  constructor(private supabase: SupabaseClient) {}

  async findMany(filters: any = {}, tenantId: string): Promise<Reward[]> {
    const { data, error } = await this.supabase
      .from('rewards')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('points_required', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string, tenantId: string): Promise<Reward | null> {
    const { data, error } = await this.supabase
      .from('rewards')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data || null;
  }

  async create(data: any, userId: string, tenantId: string): Promise<Reward> {
    const { data: created, error } = await this.supabase
      .from('rewards')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return created;
  }

  async redeem(rewardId: string, userId: string, tenantId: string): Promise<Redemption> {
    const { data: redemption, error } = await this.supabase
      .from('redemptions')
      .insert([CreateRedemptionData.parse({ reward_id: rewardId, user_id: userId })])
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return redemption;
  }
}

#### Service