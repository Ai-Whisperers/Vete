import { supabase } from '@/lib/supabase/server';
import { DiagnosisCode } from './types';

export class DiagnosisCodeRepository {
  async findAll(): Promise<DiagnosisCode[]> {
    const { data, error } = await supabase
      .from('diagnosis_codes')
      .select('id, code, description')
      .eq('tenant_id', supabase.auth.user()?.tenant_id);

    if (error) {
      throw error;
    }

    return data;
  }

  async findByCode(code: string): Promise<DiagnosisCode | null> {
    const { data, error } = await supabase
      .from('diagnosis_codes')
      .select('id, code, description')
      .eq('code', code)
      .eq('tenant_id', supabase.auth.user()?.tenant_id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}