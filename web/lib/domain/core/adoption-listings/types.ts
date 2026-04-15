import { z } from 'zod';

export const AdoptionListingStatus = z.enum(['draft', 'published', 'archived']);

export type AdoptionListingStatus = z.infer<typeof AdoptionListingStatus>;

export interface AdoptionListing {
  id: string;
  pet_id: string;
  title: string;
  description: string;
  status: AdoptionListingStatus;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAdoptionListingData {
  pet_id: string;
  title: string;
  description: string;
}

export interface UpdateAdoptionListingData {
  title?: string;
  description?: string;
  status?: AdoptionListingStatus;
  featured?: boolean;
}

export interface AdoptionListingFilters {
  status?: AdoptionListingStatus;
  featured?: boolean;
}

#### Repository