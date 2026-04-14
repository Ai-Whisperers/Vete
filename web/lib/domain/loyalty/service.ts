import { createClient } from '@/lib/supabase/service';
import { LoyaltyRepository } from './repository';
import { LoyaltyPoints, LoyaltyTransaction, LoyaltyReward } from './types';

export class LoyaltyService {
  private repository: LoyaltyRepository;

  constructor(supabase: any) {
    this.repository = new LoyaltyRepository(supabase);
  }

  async getLoyaltyPoints(clientId: string, tenantId: string): Promise<LoyaltyPoints | null> {
    return this.repository.getLoyaltyPoints(clientId, tenantId);
  }

  async getLoyaltyTransactions(clientId: string, tenantId: string): Promise<LoyaltyTransaction[]> {
    return this.repository.getLoyaltyTransactions(clientId, tenantId);
  }

  async getAvailableRewards(tenantId: string): Promise<LoyaltyReward[]> {
    return this.repository.getAvailableRewards(tenantId);
  }
}