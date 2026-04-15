import type { SupabaseClient } from '@supabase/supabase-js';
import { AdoptionListingRepository } from './repository';
import { AdoptionListing, CreateAdoptionListingData, UpdateAdoptionListingData, AdoptionListingFilters } from './types';

export class AdoptionListingService {
  private repository: AdoptionListingRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new AdoptionListingRepository(supabase);
  }

  async createAdoptionListing(data: CreateAdoptionListingData, userId: string, tenantId: string): Promise<AdoptionListing> {
    return this.repository.create(data, userId, tenantId);
  }

  async updateAdoptionListing(id: string, data: UpdateAdoptionListingData, userId: string, tenantId: string): Promise<AdoptionListing> {
    return this.repository.update(id, data, userId, tenantId);
  }

  async getAdoptionListings(filters: AdoptionListingFilters = {}, tenantId: string): Promise<AdoptionListing[]> {
    return this.repository.findMany(filters, tenantId);
  }
}

### Server Actions