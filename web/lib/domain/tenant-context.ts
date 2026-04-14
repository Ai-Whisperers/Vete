/**
 * Cached Tenant Data Access
 * 
 * Uses React cache() to deduplicate tenant data fetches within a single request.
 * Prevents N+1 queries when multiple components need tenant info.
 */

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { TierId } from '@/lib/pricing/tiers'
import { getTierById } from '@/lib/pricing/tiers'
import type { TenantData } from '@/lib/tenant-content'
import { getTenantData } from '@/lib/tenant-content'

export interface TenantContext {
  tenantId: string
  slug: string
  tier: TierId
  isTrial: boolean
  trialEndDate: string | null
  tenantData: TenantData | null
}

/**
 * Get tenant context - cached per request
 * Combines filesystem tenant data + Supabase subscription tier
 */
export const getTenantContext = cache(async (slug: string): Promise<TenantContext | null> => {
  const tenantData = await getTenantData(slug)
  if (!tenantData) return null

  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, subscription_tier, is_trial, trial_end_date')
    .eq('slug', slug)
    .single()

  if (!tenant) return null

  return {
    tenantId: tenant.id,
    slug,
    tier: (tenant.subscription_tier as TierId) || 'gratis',
    isTrial: tenant.is_trial || false,
    trialEndDate: tenant.trial_end_date,
    tenantData,
  }
})

/**
 * Get tenant subscription tier - cached per request
 * Lightweight version that only fetches tier info
 */
export const getTenantTier = cache(async (slug: string): Promise<TierId> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tenants')
    .select('subscription_tier')
    .eq('slug', slug)
    .single()

  return (data?.subscription_tier as TierId) || 'gratis'
})

/**
 * Check if tenant has a specific feature enabled
 */
export const tenantHasFeature = cache(async (slug: string, feature: string): Promise<boolean> => {
  const tier = await getTenantTier(slug)
  const tierConfig = getTierById(tier)
  if (!tierConfig) return false

  return tierConfig.features[feature as keyof typeof tierConfig.features] === true
})
