import type { SupabaseClient } from '@supabase/supabase-js';
import type { Deployment, CreateDeploymentData, UpdateDeploymentData } from './types';

export class DeploymentRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateDeploymentData): Promise<Deployment> {
    const { data: deployment, error } = await this.supabase
      .from('deployments')
      .insert([data])
      .select('id, url, status, created_at')
      .eq('tenant_id', this.supabase.auth.user().id)
      .single();

    if (error || !deployment) {
      throw error;
    }

    return deployment;
  }

  async update(id: string, data: UpdateDeploymentData): Promise<Deployment> {
    const { data: deployment, error } = await this.supabase
      .from('deployments')
      .update([data])
      .select('id, url, status, created_at')
      .eq('id', id)
      .eq('tenant_id', this.supabase.auth.user().id)
      .single();

    if (error || !deployment) {
      throw error;
    }

    return deployment;
  }

  async findByUrl(url: string): Promise<Deployment | null> {
    const { data, error } = await this.supabase
      .from('deployments')
      .select('id, url, status, created_at')
      .eq('url', url)
      .eq('tenant_id', this.supabase.auth.user().id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}