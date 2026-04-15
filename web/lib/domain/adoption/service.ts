import { AdoptionRepository } from './repository'
import { CreateAdoptionApplicationData } from './types'
import { businessRuleViolation } from '@/lib/errors'

export class AdoptionService {
  private repository: AdoptionRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new AdoptionRepository(supabase)
  }

  async createApplication(data: CreateAdoptionApplicationData, userId: string, tenantId: string): Promise<any> {
    // Business rules validation
    // ...

    return this.repository.create(data, userId, tenantId)
  }
}

### Server Actions