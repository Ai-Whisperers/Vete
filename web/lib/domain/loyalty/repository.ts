import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoyaltyPoints, LoyaltyTransaction } from './types';

export class LoyaltyRepository {
  constructor(private supabase: SupabaseClient) {}

  async findLoyaltyPoints(clientId: string, tenantId: string): Promise<LoyaltyPoints | null> {
    const { data, error } = await this.supabase
      .from('loyalty_points')
      .select('*')
      .eq('client_id', clientId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) return null;

    return data;
  }

  async createLoyaltyPoints(data: Omit<LoyaltyPoints, 'id'>): Promise<LoyaltyPoints> {
    const { data: createdData, error } = await this.supabase
      .from('loyalty_points')
      .insert([data])
      .select('*')
      .single();

    if (error) throw error;

    return createdData;
  }

  async updateLoyaltyPoints(id: string, data: Partial<LoyaltyPoints>): Promise<LoyaltyPoints> {
    const { data: updatedData, error } = await this.supabase
      .from('loyalty_points')
      .update([data])
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return updatedData;
  }

  async findLoyaltyTransactions(clientId: string, tenantId: string): Promise<LoyaltyTransaction[]> {
    const { data, error } = await this.supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('client_id', clientId)
      .eq('tenant_id', tenantId);

    if (error) throw error;

    return data;
  }

  async createLoyaltyTransaction(data: Omit<LoyaltyTransaction, 'id'>): Promise<LoyaltyTransaction> {
    const { data: createdData, error } = await this.supabase
      .from('loyalty_transactions')
      .insert([data])
      .select('*')
      .single();

    if (error) throw error;

    return createdData;
  }
}