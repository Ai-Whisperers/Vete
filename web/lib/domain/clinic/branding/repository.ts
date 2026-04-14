import type { SupabaseClient } from '@supabase/supabase-js';
import { Branding, BrandingSchema } from './types';

export class BrandingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findBrandingByClinicId(clinicId: string): Promise<Branding | null> {
    const { data, error } = await this.supabase
      .from('branding')
      .select('*')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw new Error(`Error al obtener marca: ${error.message}`);
    return data ? BrandingSchema.parse(data) : null;
  }

  async createBranding(data: Omit<Branding, 'id' | 'created_at' | 'updated_at'>): Promise<Branding> {
    const { data: createdData, error } = await this.supabase
      .from('branding')
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(`Error al crear marca: ${error.message}`);
    return BrandingSchema.parse(createdData);
  }

  async updateBranding(id: string, data: Partial<Omit<Branding, 'id' | 'created_at' | 'updated_at'>>): Promise<Branding> {
    const { data: updatedData, error } = await this.supabase
      .from('branding')
      .update({ id }, data)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar marca: ${error.message}`);
    return BrandingSchema.parse(updatedData);
  }
}