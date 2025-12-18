/**
 * Service Types
 *
 * TypeScript interfaces for the services JSON-CMS schema
 */

import type { PetSizeCategory } from '@/lib/utils/pet-size';

/**
 * Service variant with optional size-based pricing
 */
export interface ServiceVariant {
  name: string;
  description?: string;
  price_display: string;
  price_value: number;
  /** Whether this variant uses pet-size-based pricing */
  size_dependent?: boolean;
  /** Custom multipliers per size category (defaults to DEFAULT_SIZE_MULTIPLIERS if not specified) */
  size_multipliers?: Record<PetSizeCategory, number>;
}

/**
 * Service details section
 */
export interface ServiceDetails {
  description?: string;
  duration_minutes?: number;
  includes?: string[];
}

/**
 * Booking configuration
 */
export interface ServiceBooking {
  online_enabled?: boolean;
  emergency_available?: boolean;
}

/**
 * Complete service definition (matches services.json structure)
 */
export interface Service {
  id: string;
  visible?: boolean;
  category: string;
  title: string;
  icon?: string;
  summary?: string;
  image?: string;
  details?: ServiceDetails;
  variants?: ServiceVariant[];
  booking?: ServiceBooking;
}

/**
 * Services JSON file structure
 */
export interface ServicesData {
  meta?: {
    title?: string;
    subtitle?: string;
  };
  services: Service[];
}

/**
 * Service cart item - extended info for services in cart
 */
export interface ServiceCartItem {
  service_id: string;
  service_title: string;
  variant_name: string;
  pet_id: string;
  pet_name: string;
  pet_size: PetSizeCategory;
  base_price: number;
  final_price: number;
  size_dependent: boolean;
}

/**
 * Pet info for service selection
 */
export interface PetForService {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  weight_kg: number | null;
  photo_url: string | null;
  size_category: PetSizeCategory;
}

/**
 * Helper type for service selection state
 */
export interface ServiceSelectionState {
  service: Service;
  variant: ServiceVariant;
  selectedPet: PetForService | null;
  calculatedPrice: number;
}
