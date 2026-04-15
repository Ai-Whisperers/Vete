import type { SupabaseClient } from '@supabase/supabase-js';
import { LostPetReportRepository } from './repository';
import type { LostPetReport, CreateLostPetReportData, UpdateLostPetReportData } from './types';
import { businessRuleViolation, notFound } from '@/lib/errors';

export class LostPetReportService {
  private repository: LostPetReportRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new LostPetReportRepository(supabase);
  }

  async getLostPetReport(id: string, tenantId: string): Promise<LostPetReport | null> {
    return this.repository.findById(id, tenantId);
  }

  async getLostPetReports(filters: { status?: LostPetStatus } = {}, tenantId: string): Promise<LostPetReport[]> {
    return this.repository.findMany(filters, tenantId);
  }

  async createLostPetReport(data: CreateLostPetReportData, tenantId: string): Promise<LostPetReport> {
    // Validate report data
    this.validateReportData(data);

    return this.repository.create(data, tenantId);
  }

  async updateLostPetReport(id: string, data: UpdateLostPetReportData, tenantId: string): Promise<LostPetReport> {
    const report = await this.repository.findById(id, tenantId);
    if (!report) {
      throw notFound('Lost Pet Report');
    }

    // Validate report data
    this.validateReportData(data);

    return this.repository.update(id, data, tenantId);
  }

  private validateReportData(data: CreateLostPetReportData | UpdateLostPetReportData): void {
    if (data.last_seen_date && data.last_seen_date > new Date()) {
      throw businessRuleViolation('Last seen date cannot be in the future');
    }
  }
}

### Server Actions