import { supabase } from '@/lib/supabase/client';
import type { PromoCode, CreatePromoCodeData, UpdatePromoCodeData } from './types';

export class PromoCodeRepository {
  async create(data: CreatePromoCodeData, tenantId: string): Promise<PromoCode> {
    const { data: createdData, error } = await supabase
      .from('promo_codes')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select();

    if (error) {
      throw error;
    }

    return createdData[0];
  }

  async update(id: string, data: UpdatePromoCodeData, tenantId: string): Promise<PromoCode> {
    const { data: updatedData, error } = await supabase
      .from('promo_codes')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select();

    if (error) {
      throw error;
    }

    return updatedData[0];
  }

  async findById(id: string, tenantId: string): Promise<PromoCode | null> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      throw error;
    }

    return data || null;
  }

  async findMany(tenantId: string): Promise<PromoCode[]> {
    const { data, error } = await supabase
      .from('promo_codes')
      .select()
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    return data;
  }
}