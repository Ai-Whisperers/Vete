import type { SupabaseClient } from '@supabase/supabase-js';
import { DeploymentRepository } from './repository';
import type { Deployment, CreateDeploymentData, UpdateDeploymentData } from './types';

export class DeploymentService {
  private repository: DeploymentRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new DeploymentRepository(supabase);
  }

  async createDeployment(data: CreateDeploymentData): Promise<Deployment> {
    return this.repository.create(data);
  }

  async updateDeployment(id: string, data: UpdateDeploymentData): Promise<Deployment> {
    return this.repository.update(id, data);
  }

  async getDeploymentByUrl(url: string): Promise<Deployment | null> {
    return this.repository.findByUrl(url);
  }
}