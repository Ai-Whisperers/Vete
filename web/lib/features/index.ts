/**
 * Feature Flags System
 *
 * Centralized feature access control based on tenant subscription tier.
 * Works with the pricing tiers defined in @/lib/pricing/tiers.
 *
 * Usage:
 * - Server: Use `getTenantFeatures` in API routes and server components
 * - Client: Use `useFeatureFlags` hook in client components
 * - API: Use `checkFeatureAccess` middleware in API routes
 */

export { getTenantFeatures, checkFeatureAccess, getAllFeatures, requireFeature, clearFeatureCache } from './server'
export {
  useFeatureFlags,
  useTenantTier,
  useHasFeature,
  FeatureGate,
  UpgradePrompt,
  FeatureFlagsProvider,
  type FeatureFlagsContextValue,
} from './client'
export type { TenantFeatureAccess, FeatureName, FeatureCheckResult } from './types'
