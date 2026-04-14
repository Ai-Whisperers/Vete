export type TierStatus = 'active' | 'inactive'

export interface Tier {
  id: string
  name: string
  description: string
  status: TierStatus
  benefits: string[]
  tenantId: string
}

export interface CreateTierData {
  name: string
  description: string
  benefits: string[]
}

export interface UpdateTierData {
  name?: string
  description?: string
  benefits?: string[]
}

export interface TierFilters {
  // Add filter fields here
}

export interface TierStats {
  // Add stats fields here
}