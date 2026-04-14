import { createClient } from '@/lib/supabase/server';
import { FeatureFlagRepository } from './repository';
import { FeatureFlag, TenantFeatureFlags } from './types';

export class FeatureFlagService {
  private repository: FeatureFlagRepository;

  constructor(supabase: any) {
    this.repository = new FeatureFlagRepository(supabase);
  }

  async getFeatureFlags(tenantId: string): Promise<FeatureFlag[]> {
    return this.repository.getFeatureFlags(tenantId);
  }

  async updateFeatureFlag(tenantId: string, feature: string, enabled: boolean): Promise<void> {
    return this.repository.updateFeatureFlag(tenantId, feature, enabled);
  }
}

#### Supabase Client

We will update the Supabase client to include the feature flag repository and service.