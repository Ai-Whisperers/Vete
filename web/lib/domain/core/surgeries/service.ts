import { supabase } from '@/lib/supabase/client';
import { SurgeryRepository } from './repository';
import type {
  Surgery,
  CreateSurgeryData,
  UpdateSurgeryData,
  SurgeryType,
  SurgeryStatus,
} from './types';

export class SurgeryService {
  private repository: SurgeryRepository;

  constructor() {
    this.repository = new SurgeryRepository();
  }

  async getSurgery(id: string, tenantId: string): Promise<Surgery | null> {
    return this.repository.findById(id, tenantId);
  }

  async getSurgeries(filters: any = {}, tenantId: string): Promise<Surgery[]> {
    return this.repository.findMany(filters, tenantId);
  }

  async createSurgery(data: CreateSurgeryData, userId: string, tenantId: string): Promise<Surgery> {
    return this.repository.create(data, userId, tenantId);
  }

  async updateSurgery(id: string, data: UpdateSurgeryData, userId: string, tenantId: string): Promise<Surgery> {
    return this.repository.update(id, data, userId, tenantId);
  }
}