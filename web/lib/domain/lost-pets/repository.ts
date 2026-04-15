import type { SupabaseClient } from '@supabase/supabase-js';
import type { LostPetReport, CreateLostPetReportData, UpdateLostPetReportData } from './types';

export class LostPetReportRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string, tenantId: string): Promise<LostPetReport | null> {
    const { data, error } = await this.supabase
      .from('lost_pet_reports')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      pet_id: data.pet_id,
      tenant_id: data.tenant_id,
      status: data.status,
      last_seen_location: data.last_seen_location,
      last_seen_date: new Date(data.last_seen_date),
      finder_contact: data.finder_contact,
      finder_notes: data.finder_notes,
      notes: data.notes,
      created_at: new Date(data.created_at),
      resolved_at: data.resolved_at ? new Date(data.resolved_at) : null,
      reported_by_user: data.reported_by_user,
      resolved_by_user: data.resolved_by_user,
    };
  }

  async findMany(filters: { status?: LostPetStatus } = {}, tenantId: string): Promise<LostPetReport[]> {
    let query = this.supabase.from('lost_pet_reports').select('*').eq('tenant_id', tenantId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((report) => ({
      id: report.id,
      pet_id: report.pet_id,
      tenant_id: report.tenant_id,
      status: report.status,
      last_seen_location: report.last_seen_location,
      last_seen_date: new Date(report.last_seen_date),
      finder_contact: report.finder_contact,
      finder_notes: report.finder_notes,
      notes: report.notes,
      created_at: new Date(report.created_at),
      resolved_at: report.resolved_at ? new Date(report.resolved_at) : null,
      reported_by_user: report.reported_by_user,
      resolved_by_user: report.resolved_by_user,
    }));
  }

  async create(data: CreateLostPetReportData, tenantId: string): Promise<LostPetReport> {
    const { data: report, error } = await this.supabase
      .from('lost_pet_reports')
      .insert({
        ...data,
        tenant_id: tenantId,
        status: 'lost',
        created_at: new Date(),
        resolved_at: null,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: report.id,
      pet_id: report.pet_id,
      tenant_id: report.tenant_id,
      status: report.status,
      last_seen_location: report.last_seen_location,
      last_seen_date: new Date(report.last_seen_date),
      finder_contact: report.finder_contact,
      finder_notes: report.finder_notes,
      notes: report.notes,
      created_at: new Date(report.created_at),
      resolved_at: report.resolved_at ? new Date(report.resolved_at) : null,
      reported_by_user: report.reported_by_user,
      resolved_by_user: report.resolved_by_user,
    };
  }

  async update(id: string, data: UpdateLostPetReportData, tenantId: string): Promise<LostPetReport> {
    const { data: report, error } = await this.supabase
      .from('lost_pet_reports')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: report.id,
      pet_id: report.pet_id,
      tenant_id: report.tenant_id,
      status: report.status,
      last_seen_location: report.last_seen_location,
      last_seen_date: new Date(report.last_seen_date),
      finder_contact: report.finder_contact,
      finder_notes: report.finder_notes,
      notes: report.notes,
      created_at: new Date(report.created_at),
      resolved_at: report.resolved_at ? new Date(report.resolved_at) : null,
      reported_by_user: report.reported_by_user,
      resolved_by_user: report.resolved_by_user,
    };
  }
}

#### Service