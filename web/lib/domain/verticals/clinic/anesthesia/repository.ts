import { supabase } from '@/lib/supabase/service'
import { AnesthesiaRecord } from './types'

export class AnesthesiaRepository {
  async create(record: Omit<AnesthesiaRecord, 'id'>, tenantId: string): Promise<AnesthesiaRecord> {
    const { data, error } = await supabase
      .from('anesthesia_records')
      .insert([record])
      .eq('tenant_id', tenantId)
      .select()

    if (error) {
      throw error
    }

    return data[0]
  }

  async getAnesthesiaRecord(id: string, tenantId: string): Promise<AnesthesiaRecord | null> {
    const { data, error } = await supabase
      .from('anesthesia_records')
      .select()
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async updateAnesthesiaRecord(id: string, updates: Partial<AnesthesiaRecord>, tenantId: string): Promise<AnesthesiaRecord> {
    const { data, error } = await supabase
      .from('anesthesia_records')
      .update([updates])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()

    if (error) {
      throw error
    }

    return data[0]
  }
}

#### Service