import type { SupabaseClient } from '@supabase/supabase-js';
import { AdoptionListing, CreateAdoptionListingData, UpdateAdoptionListingData, AdoptionListingFilters } from './types';

export class AdoptionListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(data: CreateAdoptionListingData, userId: string, tenantId: string): Promise<AdoptionListing> {
    const { data: createdListing, error } = await this.supabase
      .from('adoption_listings')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('id, pet_id, title, description, status, featured, created_at, updated_at');

    if (error || !createdListing) {
      throw error;
    }

    return createdListing[0];
  }

  async update(id: string, data: UpdateAdoptionListingData, userId: string, tenantId: string): Promise<AdoptionListing> {
    const { data: updatedListing, error } = await this.supabase
      .from('adoption_listings')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, pet_id, title, description, status, featured, created_at, updated_at');

    if (error || !updatedListing) {
      throw error;
    }

    return updatedListing[0];
  }

  async findMany(filters: AdoptionListingFilters = {}, tenantId: string): Promise<AdoptionListing[]> {
    const { data, error } = await this.supabase
      .from('adoption_listings')
      .select('id, pet_id, title, description, status, featured, created_at, updated_at')
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    return data;
  }
}

#### Service