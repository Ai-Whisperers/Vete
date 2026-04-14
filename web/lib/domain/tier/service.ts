import type { SupabaseClient } from '@supabase/supabase-js'
import { TierRepository } from './repository'
import type {
  Tier,
  CreateTierData,
  UpdateTierData,
  TierFilters,
  TierStats,
} from './types'
import { businessRuleViolation, notFound, conflict } from '@/lib/errors'

export class TierService {
  private repository: TierRepository

  constructor(supabase: SupabaseClient) {
    this.repository = new TierRepository(supabase)
  }

  /**
   * Get tier by ID
   */
  async getTier(id: string, tenantId: string): Promise<Tier | null> {
    return this.repository.findById(id, tenantId)
  }

  async getTiers(filters: TierFilters = {}, tenantId: string): Promise<Tier[]> {
    return this.repository.findMany(filters, tenantId)
  }

  /**
   * Create new tier
   */
  async createTier(
    data: CreateTierData,
    userId: string,
    tenantId: string
  ): Promise<Tier> {
    // Business rules validation
    await this.validateTierCreation(data, tenantId)

    return this.repository.create(data, userId, tenantId)
  }

  /**
   * Update tier
   */
  async updateTier(
    id: string,
    data: UpdateTierData,
    userId: string,
    tenantId?: string
  ): Promise<Tier> {
    const tier = await this.repository.findById(id, tenantId || '')
    if (!tier) {
      throw notFound('Tier')
    }

    return this.repository.update(id, data, userId, tenantId)
  }
}