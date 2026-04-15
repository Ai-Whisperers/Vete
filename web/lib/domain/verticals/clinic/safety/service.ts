import { SafetyRepository } from './repository';
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
import { businessRuleViolation, notFound } from '@/lib/errors';

export class SafetyService {
  private repository: SafetyRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new SafetyRepository(supabase);
  }

  async reportLostPet(data: ReportLostPetInput, tenantId: string): Promise<LostPet> {
    // Validate input data
    if (!data.pet_id || !data.location || !data.description) {
      throw businessRuleViolation('Invalid input data');
    }

    return this.repository.reportLostPet(data, tenantId);
  }

  async updateLostPet(id: string, data: UpdateLostPetInput, tenantId: string): Promise<LostPet> {
    const lostPet = await this.repository.findById(id, tenantId);
    if (!lostPet) {
      throw notFound('Lost pet');
    }

    return this.repository.updateLostPet(id, data, tenantId);
  }

  async reportSighting(data: ReportSightingInput, tenantId: string): Promise<PetSighting> {
    // Validate input data
    if (!data.lost_pet_id || !data.location || !data.description) {
      throw businessRuleViolation('Invalid input data');
    }

    return this.repository.reportSighting(data, tenantId);
  }

  async reviewMatch(data: ReviewMatchInput, tenantId: string): Promise<MatchReason> {
    // Validate input data
    if (!data.match_id || !data.decision) {
      throw businessRuleViolation('Invalid input data');
    }

    return this.repository.reviewMatch(data, tenantId);
  }

  async createDiseaseReport(data: CreateDiseaseReportInput, tenantId: string): Promise<DiseaseReport> {
    // Validate input data
    if (!data.pet_id || !data.disease || !data.outcome || !data.severity) {
      throw businessRuleViolation('Invalid input data');
    }

    return this.repository.createDiseaseReport(data, tenantId);
  }
}

### Server Actions