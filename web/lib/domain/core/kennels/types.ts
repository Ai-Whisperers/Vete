import { z } from 'zod';

export const KennelType = z.enum(['standard', 'large', 'small', 'icu', 'isolation', 'exotic', 'recovery']);
export const KennelStatus = z.enum(['available', 'occupied', 'cleaning', 'maintenance', 'reserved']);

export type Kennel = {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  location: string;
  kennel_type: KennelType;
  size_category: string;
  max_weight_kg: number;
  species_allowed: string[];
  has_oxygen: boolean;
  has_heating: boolean;
  has_iv_pole: boolean;
  has_camera: boolean;
  daily_rate: number;
  icu_surcharge: number;
  is_active: boolean;
  current_status: KennelStatus;
  notes: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateKennelData = Omit<Kennel, 'id' | 'created_at' | 'updated_at'>;
export type UpdateKennelData = Partial<CreateKennelData>;

export type KennelFilters = {
  tenant_id: string;
  name?: string;
  code?: string;
  location?: string;
  kennel_type?: KennelType;
  size_category?: string;
  max_weight_kg?: number;
  species_allowed?: string[];
  has_oxygen?: boolean;
  has_heating?: boolean;
  has_iv_pole?: boolean;
  has_camera?: boolean;
  daily_rate?: number;
  icu_surcharge?: number;
  is_active?: boolean;
  current_status?: KennelStatus;
};

#### Repository