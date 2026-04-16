import { supabase } from '@/lib/supabase/server';
import { UploadDocument } from './types';

export class UploadRepository {
  async createDocument(input: CreateUploadDocumentInput): Promise<UploadDocument> {
    const { data, error } = await supabase.from('upload_documents').insert([input]).select('*');
    if (error) {
      throw error;
    }
    return data[0];
  }

  async getDocumentsByPetId(petId: string, tenantId: string): Promise<UploadDocument[]> {
    const { data, error } = await supabase
      .from('upload_documents')
      .select('*')
      .eq('pet_id', petId)
      .eq('tenant_id', tenantId);
    if (error) {
      throw error;
    }
    return data;
  }
}