import { createClient } from '@/lib/supabase/client'
import { TreatmentSheetRepository } from './repository'
import { TreatmentSheet } from './types'

export class TreatmentSheetService {
  private repository: TreatmentSheetRepository

  constructor(supabase: any) {
    this.repository = new TreatmentSheetRepository(supabase)
  }

  async createTreatmentSheet(data: any): Promise<TreatmentSheet> {
    return this.repository.createTreatmentSheet(data)
  }

  async getTreatmentSheet(id: string): Promise<TreatmentSheet | null> {
    return this.repository.getTreatmentSheet(id)
  }

  async updateTreatmentSheet(id: string, data: any): Promise<TreatmentSheet> {
    return this.repository.updateTreatmentSheet(id, data)
  }
}

### Server Actions