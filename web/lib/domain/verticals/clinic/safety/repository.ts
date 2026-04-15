import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  LostPet,
  PetSighting,
  MatchReason,
  PetMatchSuggestion,
  DiseaseReport,
  DiseaseAlert,
  ReportLostPetInput,
  UpdateLostPetInput,
  ReportSightingInput,
  ReviewMatchInput,
  CreateDiseaseReportInput,
  LostPetFilters,
  DiseaseReportFilters,
} from './types';

export class SafetyRepository {
  constructor(private supabase: SupabaseClient) {}

  async reportLostPet(data: ReportLostPetInput, tenantId: string): Promise<LostPet> {
    const { data: lostPet, error } = await this.supabase
      .from('lost_pets')
      .insert({
        ...data,
        tenant_id: tenantId,
        status: 'lost',
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: lostPet.id,
      pet_id: lostPet.pet_id,
      owner_id: lostPet.owner_id,
      status: lostPet.status,
      location: lostPet.location,
      description: lostPet.description,
      created_at: new Date(lostPet.created_at),
    };
  }

  async updateLostPet(id: string, data: UpdateLostPetInput, tenantId: string): Promise<LostPet> {
    const { data: lostPet, error } = await this.supabase
      .from('lost_pets')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: lostPet.id,
      pet_id: lostPet.pet_id,
      owner_id: lostPet.owner_id,
      status: lostPet.status,
      location: lostPet.location,
      description: lostPet.description,
      created_at: new Date(lostPet.created_at),
    };
  }

  async reportSighting(data: ReportSightingInput, tenantId: string): Promise<PetSighting> {
    const { data: petSighting, error } = await this.supabase
      .from('pet_sightings')
      .insert({
        ...data,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: petSighting.id,
      lost_pet_id: petSighting.lost_pet_id,
      location: petSighting.location,
      photo_url: petSighting.photo_url,
      description: petSighting.description,
      created_at: new Date(petSighting.created_at),
    };
  }

  async reviewMatch(data: ReviewMatchInput, tenantId: string): Promise<MatchReason> {
    const { data: matchReason, error } = await this.supabase
      .from('match_reasons')
      .insert({
        ...data,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: matchReason.id,
      lost_pet_id: matchReason.lost_pet_id,
      pet_sighting_id: matchReason.pet_sighting_id,
      reason: matchReason.reason,
      created_at: new Date(matchReason.created_at),
    };
  }

  async createDiseaseReport(data: CreateDiseaseReportInput, tenantId: string): Promise<DiseaseReport> {
    const { data: diseaseReport, error } = await this.supabase
      .from('disease_reports')
      .insert({
        ...data,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: diseaseReport.id,
      pet_id: diseaseReport.pet_id,
      disease: diseaseReport.disease,
      outcome: diseaseReport.outcome,
      severity: diseaseReport.severity,
      created_at: new Date(diseaseReport.created_at),
    };
  }
}

#### Service