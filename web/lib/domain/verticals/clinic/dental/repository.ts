import { supabase } from '@/lib/supabase/server';
import { DentalChart, CreateDentalChartData, UpdateDentalChartData } from './types';

export class DentalChartRepository {
  async create(data: CreateDentalChartData, userId: string, tenantId: string): Promise<DentalChart> {
    const { data: createdData, error } = await supabase
      .from('dental_charts')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('id, pet_id, created_at, updated_at, tooth_diagram, conditions, procedures')
      .single();

    if (error) {
      throw error;
    }

    return createdData;
  }

  async update(id: string, data: UpdateDentalChartData, userId: string, tenantId: string): Promise<DentalChart> {
    const { data: updatedData, error } = await supabase
      .from('dental_charts')
      .update({ id, ...data })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('id, pet_id, created_at, updated_at, tooth_diagram, conditions, procedures')
      .single();

    if (error) {
      throw error;
    }

    return updatedData;
  }

  async findById(id: string, tenantId: string): Promise<DentalChart | null> {
    const { data, error } = await supabase
      .from('dental_charts')
      .select('id, pet_id, created_at, updated_at, tooth_diagram, conditions, procedures')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  }
}