import { createClient } from '@/lib/supabase/service';
import { LoyaltyPointsSchema, LoyaltyTransactionSchema, LoyaltyRewardSchema } from './types';

export class LoyaltyRepository {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async getLoyaltyPoints(clientId: string, tenantId: string): Promise<LoyaltyPoints | null> {
    const { data, error } = await this.supabase
      .from('loyalty_points')
      .select('*')
      .eq('client_id', clientId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) return null;

    return LoyaltyPointsSchema.parse(data);
  }

  async getLoyaltyTransactions(clientId: string, tenantId: string): Promise<LoyaltyTransaction[]> {
    const { data, error } = await this.supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('client_id', clientId)
      .eq('tenant_id', tenantId);

    if (error) throw error;

    return data.map((transaction: any) => LoyaltyTransactionSchema.parse(transaction));
  }

  async getAvailableRewards(tenantId: string): Promise<LoyaltyReward[]> {
    const { data, error } = await this.supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    return data.map((reward: any) => LoyaltyRewardSchema.parse(reward));
  }
}