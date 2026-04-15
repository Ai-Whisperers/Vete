import { createClient } from '@/lib/supabase/server';
import type { Policy, CreatePolicyData, UpdatePolicyData } from './types';

export class PolicyRepository {
  constructor(private supabase: any) {}

  async createPolicy(data: CreatePolicyData, userId: string, tenantId: string): Promise<Policy> {
    const { data: policyData, error } = await this.supabase
      .from('policies')
      .insert({
        tenant_id: tenantId,
        client_id: data.clientId,
        policy_number: data.policyNumber,
        policy_type: data.policyType,
        coverage_details: data.coverageDetails,
        renewal_date: data.renewalDate,
        document_url: data.documentUrl,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return policyData;
  }

  async updatePolicy(id: string, data: UpdatePolicyData, userId: string, tenantId: string): Promise<Policy> {
    const { data: policyData, error } = await this.supabase
      .from('policies')
      .update({
        policy_number: data.policyNumber,
        policy_type: data.policyType,
        coverage_details: data.coverageDetails,
        renewal_date: data.renewalDate,
        document_url: data.documentUrl,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return policyData;
  }

  async getPolicyById(id: string, tenantId: string): Promise<Policy | null> {
    const { data, error } = await this.supabase
      .from('policies')
      .select()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async getPolicies(tenantId: string): Promise<Policy[]> {
    const { data, error } = await this.supabase
      .from('policies')
      .select()
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    return data;
  }
}