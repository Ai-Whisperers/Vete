import type { SupabaseClient } from '@supabase/supabase-js';
import { LoyaltyRepository } from './repository';
import type { LoyaltyPoints, LoyaltyTransaction } from './types';

export class LoyaltyService {
  private repository: LoyaltyRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new LoyaltyRepository(supabase);
  }

  async getLoyaltyPoints(clientId: string, tenantId: string): Promise<LoyaltyPoints | null> {
    return this.repository.findLoyaltyPoints(clientId, tenantId);
  }

  async createLoyaltyPoints(data: Omit<LoyaltyPoints, 'id'>): Promise<LoyaltyPoints> {
    return this.repository.createLoyaltyPoints(data);
  }

  async updateLoyaltyPoints(id: string, data: Partial<LoyaltyPoints>): Promise<LoyaltyPoints> {
    return this.repository.updateLoyaltyPoints(id, data);
  }

  async getLoyaltyTransactions(clientId: string, tenantId: string): Promise<LoyaltyTransaction[]> {
    return this.repository.findLoyaltyTransactions(clientId, tenantId);
  }

  async createLoyaltyTransaction(data: Omit<LoyaltyTransaction, 'id'>): Promise<LoyaltyTransaction> {
    return this.repository.createLoyaltyTransaction(data);
  }
}

#### Server Actions

We will create server actions to handle loyalty points engine logic.