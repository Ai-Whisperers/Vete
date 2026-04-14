import type { SupabaseClient } from '@supabase/supabase-js';
import { BrandingRepository } from './repository';
import { Branding, BrandingSchema } from './types';

export class BrandingService {
  private repository: BrandingRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new BrandingRepository(supabase);
  }

  async getBrandingByClinicId(clinicId: string): Promise<Branding | null> {
    return this.repository.findBrandingByClinicId(clinicId);
  }

  async createBranding(data: Omit<Branding, 'id' | 'created_at' | 'updated_at'>): Promise<Branding> {
    return this.repository.createBranding(data);
  }

  async updateBranding(id: string, data: Partial<Omit<Branding, 'id' | 'created_at' | 'updated_at'>>): Promise<Branding> {
    return this.repository.updateBranding(id, data);
  }
}