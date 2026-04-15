import { createClient } from '@/lib/supabase/client'
import { TreatmentSheet } from './types'

export class TreatmentSheetRepository {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async createTreatmentSheet(data: any): Promise<TreatmentSheet> {
    const { data: treatmentSheet, error } = await this.supabase
      .from('treatment_sheets')
      .insert([data])
      .select('*')

    if (error) {
      throw error
    }

    return treatmentSheet[0]
  }

  async getTreatmentSheet(id: string): Promise<TreatmentSheet | null> {
    const { data, error } = await this.supabase
      .from('treatment_sheets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async updateTreatmentSheet(id: string, data: any): Promise<TreatmentSheet> {
    const { data: treatmentSheet, error } = await this.supabase
      .from('treatment_sheets')
      .update([data])
      .eq('id', id)
      .select('*')

    if (error) {
      throw error
    }

    return treatmentSheet[0]
  }
}

### Service Layer