import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tier, CreateTierData, UpdateTierData, TierFilters } from './types'

export class TierRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get the Supabase client for complex queries in the service layer
   */
  getClient(): SupabaseClient {
    return this.supabase
  }

  /**
   * Find tier by ID with full relations
   */
  async findById(id: string, tenantId: string): Promise<Tier | null> {
    const { data, error } = await this.supabase
      .from('tiers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) return null

    return this.transformTier(data)
  }

  async findMany(filters: TierFilters = {}, tenantId: string): Promise<Tier[]> {
    const { data, error } = await this.supabase
      .from('tiers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('id', { ascending: true })

    if (error) throw error

    return data.map((tier) => this.transformTier(tier))
  }

  /**
   * Create new tier
   */
  async create(data: CreateTierData, userId: string, tenantId: string): Promise<Tier> {
    const { data: tierData, error } = await this.supabase
      .from('tiers')
      .insert([data])
      .eq('tenant_id', tenantId)
      .select('*')
      .single()

    if (error) throw error

    return this.transformTier(tierData)
  }

  /**
   * Update tier
   */
  async update(
    id: string,
    data: UpdateTierData,
    userId: string,
    tenantId: string
  ): Promise<Tier> {
    const { data: tierData, error } = await this.supabase
      .from('tiers')
      .update([data])
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single()

    if (error) throw error

    return this.transformTier(tierData)
  }

  private transformTier(data: any): Tier {
    // Implement transformation logic here
    return data
  }
}