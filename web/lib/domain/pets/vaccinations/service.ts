import type { SupabaseClient } from '@supabase/supabase-js';
import { VaccinationRepository } from './repository';
import type { Vaccination, CreateVaccinationData, UpdateVaccinationData, VaccinationFilters } from './types';
import { businessRuleViolation, notFound } from '@/lib/errors';

export class VaccinationService {
  private repository: VaccinationRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new VaccinationRepository(supabase);
  }

  async getVaccination(id: string, tenantId: string): Promise<Vaccination | null> {
    return this.repository.findById(id, tenantId);
  }

  async getVaccinations(filters: VaccinationFilters = {}, tenantId: string): Promise<Vaccination[]> {
    return this.repository.findMany(filters, tenantId);
  }

  async createVaccination(data: CreateVaccinationData, tenantId: string): Promise<Vaccination> {
    // Validate vaccination data
    this.validateVaccinationData(data);

    return this.repository.create(data, tenantId);
  }

  async updateVaccination(id: string, data: UpdateVaccinationData, tenantId: string): Promise<Vaccination> {
    const vaccination = await this.repository.findById(id, tenantId);
    if (!vaccination) {
      throw notFound('Vaccination');
    }

    // Validate vaccination data
    this.validateVaccinationData(data);

    return this.repository.update(id, data, tenantId);
  }

  private validateVaccinationData(data: CreateVaccinationData | UpdateVaccinationData): void {
    if (data.due_date && data.due_date < new Date()) {
      throw businessRuleViolation('Due date cannot be in the past');
    }
  }
}

### Server Actions