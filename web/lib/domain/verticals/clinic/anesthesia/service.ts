import { AnesthesiaRepository } from './repository'
import { supabase } from '@/lib/supabase/service'
import { AnesthesiaRecord, CreateAnesthesiaRecordData } from './types'

export class AnesthesiaService {
  private repository: AnesthesiaRepository

  constructor() {
    this.repository = new AnesthesiaRepository()
  }

  async createAnesthesiaRecord(data: CreateAnesthesiaRecordData, tenantId: string): Promise<AnesthesiaRecord> {
    return this.repository.create(data, tenantId)
  }

  async getAnesthesiaRecord(id: string, tenantId: string): Promise<AnesthesiaRecord | null> {
    return this.repository.getAnesthesiaRecord(id, tenantId)
  }

  async updateAnesthesiaRecord(id: string, updates: Partial<AnesthesiaRecord>, tenantId: string): Promise<AnesthesiaRecord> {
    return this.repository.updateAnesthesiaRecord(id, updates, tenantId)
  }
}

### Server Actions