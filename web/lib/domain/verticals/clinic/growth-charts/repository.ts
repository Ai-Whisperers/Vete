import type { SupabaseClient } from '@supabase/supabase-js';
import { GrowthChart, CreateGrowthChartData, UpdateGrowthChartData, GrowthChartFilters } from './types';

export class GrowthChartRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string, tenantId: string): Promise<GrowthChart | null> {
    const { data, error } = await this.supabase
      .from('growth_charts')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      pet_id: data.pet_id,
      type: data.type,
      data_points: data.data_points,
    };
  }

  async findMany(filters: GrowthChartFilters = {}, tenantId: string): Promise<GrowthChart[]> {
    let query = this.supabase.from('growth_charts').select('*').eq('tenant_id', tenantId);

    if (filters.pet_id) {
      query = query.eq('pet_id', filters.pet_id);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((growthChart) => ({
      id: growthChart.id,
      pet_id: growthChart.pet_id,
      type: growthChart.type,
      data_points: growthChart.data_points,
    }));
  }

  async create(data: CreateGrowthChartData, tenantId: string): Promise<GrowthChart> {
    const { data: growthChart, error } = await this.supabase
      .from('growth_charts')
      .insert({
        ...data,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: growthChart.id,
      pet_id: growthChart.pet_id,
      type: growthChart.type,
      data_points: growthChart.data_points,
    };
  }

  async update(id: string, data: UpdateGrowthChartData, tenantId: string): Promise<GrowthChart> {
    const { data: growthChart, error } = await this.supabase
      .from('growth_charts')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: growthChart.id,
      pet_id: growthChart.pet_id,
      type: growthChart.type,
      data_points: growthChart.data_points,
    };
  }
}