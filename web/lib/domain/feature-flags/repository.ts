import { createClient } from '@/lib/supabase/server';
import { FeatureFlag, TenantFeatureFlags } from './types';

export class FeatureFlagRepository {
  constructor(private supabase: any) {}

  async getFeatureFlags(tenantId: string): Promise<FeatureFlag[]> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('feature, enabled')
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    return data;
  }

  async updateFeatureFlag(tenantId: string, feature: string, enabled: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('feature_flags')
      .update({ enabled })
      .eq('tenant_id', tenantId)
      .eq('feature', feature);

    if (error) {
      throw error;
    }
  }
}