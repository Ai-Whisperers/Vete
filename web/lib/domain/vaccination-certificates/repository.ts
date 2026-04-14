import { createRepository } from '../base-repository';
import { supabase } from '@/lib/supabase/service';
import { VaccinationCertificate } from './types';

export class VaccinationCertificateRepository {
  constructor(private supabase: typeof supabase) {}

  async create(data: CreateVaccinationCertificateData, tenantId: string): Promise<VaccinationCertificate> {
    const { data: createdData, error } = await this.supabase
      .from('vaccination_certificates')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select();

    if (error) {
      throw error;
    }

    return createdData[0] as VaccinationCertificate;
  }

  async findById(id: string, tenantId: string): Promise<VaccinationCertificate | null> {
    const { data, error } = await this.supabase
      .from('vaccination_certificates')
      .select()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data as VaccinationCertificate | null;
  }

  async findMany(filters: any = {}, tenantId: string): Promise<VaccinationCertificate[]> {
    const { data, error } = await this.supabase
      .from('vaccination_certificates')
      .select()
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    return data as VaccinationCertificate[];
  }
}

#### Service