import { createClient } from '@/lib/supabase/server';
import { PolicyRepository } from './repository';
import type { Policy, CreatePolicyData, UpdatePolicyData } from './types';

export class PolicyService {
  private repository: PolicyRepository;

  constructor(supabase: any) {
    this.repository = new PolicyRepository(supabase);
  }

  async createPolicy(data: CreatePolicyData, userId: string, tenantId: string): Promise<Policy> {
    return this.repository.createPolicy(data, userId, tenantId);
  }

  async updatePolicy(id: string, data: UpdatePolicyData, userId: string, tenantId: string): Promise<Policy> {
    return this.repository.updatePolicy(id, data, userId, tenantId);
  }

  async getPolicyById(id: string, tenantId: string): Promise<Policy | null> {
    return this.repository.getPolicyById(id, tenantId);
  }

  async getPolicies(tenantId: string): Promise<Policy[]> {
    return this.repository.getPolicies(tenantId);
  }
}

#### Server Actions