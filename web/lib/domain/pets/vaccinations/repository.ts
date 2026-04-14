import type { SupabaseClient } from '@supabase/supabase-js';
import type { Vaccination, CreateVaccinationData, UpdateVaccinationData, VaccinationFilters } from './types';

export class VaccinationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string, tenantId: string): Promise<Vaccination | null> {
    const { data, error } = await this.supabase
      .from('vaccinations')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      pet_id: data.pet_id,
      type: data.type,
      due_date: new Date(data.due_date),
      status: data.status,
      completed_at: data.completed_at ? new Date(data.completed_at) : null,
    };
  }

  async findMany(filters: VaccinationFilters = {}, tenantId: string): Promise<Vaccination[]> {
    let query = this.supabase.from('vaccinations').select('*').eq('tenant_id', tenantId);

    if (filters.pet_id) {
      query = query.eq('pet_id', filters.pet_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((vaccination) => ({
      id: vaccination.id,
      pet_id: vaccination.pet_id,
      type: vaccination.type,
      due_date: new Date(vaccination.due_date),
      status: vaccination.status,
      completed_at: vaccination.completed_at ? new Date(vaccination.completed_at) : null,
    }));
  }

  async create(data: CreateVaccinationData, tenantId: string): Promise<Vaccination> {
    const { data: vaccination, error } = await this.supabase
      .from('vaccinations')
      .insert({
        ...data,
        tenant_id: tenantId,
        status: 'due',
        completed_at: null,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: vaccination.id,
      pet_id: vaccination.pet_id,
      type: vaccination.type,
      due_date: new Date(vaccination.due_date),
      status: vaccination.status,
      completed_at: vaccination.completed_at ? new Date(vaccination.completed_at) : null,
    };
  }

  async update(id: string, data: UpdateVaccinationData, tenantId: string): Promise<Vaccination> {
    const { data: vaccination, error } = await this.supabase
      .from('vaccinations')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: vaccination.id,
      pet_id: vaccination.pet_id,
      type: vaccination.type,
      due_date: new Date(vaccination.due_date),
      status: vaccination.status,
      completed_at: vaccination.completed_at ? new Date(vaccination.completed_at) : null,
    };
  }
}

#### Service