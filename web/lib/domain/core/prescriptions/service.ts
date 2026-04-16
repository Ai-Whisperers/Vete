import { PrescriptionRepository } from './repository';
import { CreateRefillRequestData, RefillRequest } from './types';

export class PrescriptionService {
  private repository: PrescriptionRepository;

  constructor(supabase: any) {
    this.repository = new PrescriptionRepository(supabase);
  }

  async createRefillRequest(data: CreateRefillRequestData, tenantId: string): Promise<RefillRequest> {
    return this.repository.createRefillRequest(data, tenantId);
  }

  async getRefillRequest(id: string, tenantId: string): Promise<RefillRequest | null> {
    return this.repository.getRefillRequest(id, tenantId);
  }

  async updateRefillRequest(id: string, data: any, tenantId: string): Promise<RefillRequest> {
    return this.repository.updateRefillRequest(id, data, tenantId);
  }
}

#### Server Actions