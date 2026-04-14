import { PromoCodeRepository } from './repository';
import type { PromoCode, CreatePromoCodeData, UpdatePromoCodeData } from './types';

export class PromoCodeService {
  private repository: PromoCodeRepository;

  constructor(supabase: any) {
    this.repository = new PromoCodeRepository(supabase);
  }

  async createPromoCode(data: CreatePromoCodeData, tenantId: string): Promise<PromoCode> {
    return this.repository.create(data, tenantId);
  }

  async updatePromoCode(id: string, data: UpdatePromoCodeData, tenantId: string): Promise<PromoCode> {
    return this.repository.update(id, data, tenantId);
  }

  async getPromoCode(id: string, tenantId: string): Promise<PromoCode | null> {
    return this.repository.findById(id, tenantId);
  }

  async getPromoCodes(tenantId: string): Promise<PromoCode[]> {
    return this.repository.findMany(tenantId);
  }
}