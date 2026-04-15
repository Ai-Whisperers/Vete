import type { SupabaseClient } from '@supabase/supabase-js';
import { GrowthChartRepository } from './repository';
import { GrowthChart, CreateGrowthChartData, UpdateGrowthChartData, GrowthChartFilters } from './types';
import { businessRuleViolation, notFound } from '@/lib/errors';

export class GrowthChartService {
  private repository: GrowthChartRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new GrowthChartRepository(supabase);
  }

  async getGrowthChart(id: string, tenantId: string): Promise<GrowthChart | null> {
    return this.repository.findById(id, tenantId);
  }

  async getGrowthCharts(filters: GrowthChartFilters = {}, tenantId: string): Promise<GrowthChart[]> {
    return this.repository.findMany(filters, tenantId);
  }

  async createGrowthChart(data: CreateGrowthChartData, tenantId: string): Promise<GrowthChart> {
    // Validate growth chart data
    this.validateGrowthChartData(data);

    return this.repository.create(data, tenantId);
  }

  async updateGrowthChart(id: string, data: UpdateGrowthChartData, tenantId: string): Promise<GrowthChart> {
    const growthChart = await this.repository.findById(id, tenantId);
    if (!growthChart) {
      throw notFound('Growth Chart');
    }

    // Validate growth chart data
    this.validateGrowthChartData(data);

    return this.repository.update(id, data, tenantId);
  }

  private validateGrowthChartData(data: CreateGrowthChartData | UpdateGrowthChartData): void {
    if (data.data_points.length === 0) {
      throw businessRuleViolation('Growth chart must have at least one data point');
    }
  }
}