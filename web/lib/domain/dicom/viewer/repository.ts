import { DicomImage } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

export class DicomViewerRepository {
  constructor(private supabase: SupabaseClient) {}

  async uploadDicomImage(image: string, petId: string, tenantId: string): Promise<DicomImage> {
    const { data, error } = await this.supabase
      .from('dicom_images')
      .insert({
        image,
        pet_id: petId,
        tenant_id: tenantId,
      })
      .select('id, tenant_id, pet_id, image, created_at')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getDicomImage(id: string, tenantId: string): Promise<DicomImage | null> {
    const { data, error } = await this.supabase
      .from('dicom_images')
      .select('id, tenant_id, pet_id, image, created_at')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}