import { DispenseRepository } from './repository';
import { Dispense, CreateDispenseData, UpdateDispenseData } from './types';

export class DispenseService {
  private repository: DispenseRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new DispenseRepository(supabase);
  }

  async getDispense(id: string, tenantId: string): Promise<Dispense | null> {
    return this.repository.findById(id, tenantId);
  }

  async getDispenses(tenantId: string): Promise<Dispense[]> {
    return this.repository.findMany(tenantId);
  }

  async createDispense(data: CreateDispenseData, userId: string, tenantId: string): Promise<Dispense> {
    return this.repository.create(data, userId, tenantId);
  }

  async updateDispense(id: string, data: UpdateDispenseData, userId: string, tenantId: string): Promise<Dispense> {
    return this.repository.update(id, data, userId, tenantId);
  }
}

#### Server Actions