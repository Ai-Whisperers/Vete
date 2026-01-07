/**
 * Vetic Pricing Tiers Configuration
 *
 * Centralized pricing configuration for all subscription tiers.
 * All prices in Paraguayan Guaraníes (PYG).
 *
 * Strategy: Simple 2-tier model - Free (minimal) and Professional (everything)
 *
 * Last updated: January 2026
 */

export type TierId = 'gratis' | 'profesional'

export interface TierFeatures {
  // Core features (all tiers)
  website: boolean
  petPortal: boolean
  appointments: boolean
  medicalRecords: boolean
  vaccineTracking: boolean
  clinicalTools: boolean

  // Premium features
  adFree: boolean
  ecommerce: boolean
  qrTags: boolean
  bulkOrdering: boolean
  analyticsBasic: boolean
  analyticsAdvanced: boolean
  analyticsAI: boolean
  whatsappApi: boolean
  hospitalization: boolean
  laboratory: boolean

  // Enterprise features
  multiLocation: boolean
  apiAccess: boolean
  slaGuarantee: boolean
  dedicatedSupport: boolean
}

export interface TierSupport {
  communityForum: boolean
  emailSupport: boolean
  whatsappSupport: boolean
  phoneSupport: boolean
  prioritySupport: boolean
  responseTimeHours: number | null // null = best effort
}

export interface PricingTier {
  id: TierId
  name: string
  description: string
  monthlyPrice: number // in PYG, 0 for free
  setupFee: number // in PYG, 0 for none
  includedUsers: number // Infinity for unlimited
  extraUserPrice: number // in PYG per additional user
  commitmentMonths: number // 0 for none
  features: TierFeatures
  support: TierSupport
  popular?: boolean // highlight this tier
  enterprise?: boolean // custom pricing
  ecommerceCommission: number // percentage (0.03 = 3%) on store orders
  serviceCommission: number // percentage (0.03 = 3%) on paid appointment invoices

  // UI Metadata
  color: string // Brand color for charts/UI elements (hex)
  targetPatientsMin: number // Min monthly patients for auto-suggest
  targetPatientsMax: number // Max monthly patients for auto-suggest
}

/**
 * All pricing tiers
 *
 * Simple 2-tier model:
 * - Gratis: Website + WhatsApp booking only (minimal features, ads disabled for now)
 * - Profesional: Everything included, 250,000 Gs/month, 3% commission
 */
export const pricingTiers: PricingTier[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    description: 'Sitio web básico con reservas por WhatsApp',
    monthlyPrice: 0,
    setupFee: 0,
    includedUsers: Infinity,
    extraUserPrice: 0,
    commitmentMonths: 0,
    ecommerceCommission: 0,
    serviceCommission: 0,
    color: '#94A3B8', // Slate gray
    targetPatientsMin: 0,
    targetPatientsMax: 50,
    features: {
      website: true,
      petPortal: false,
      appointments: true, // WhatsApp booking link only
      medicalRecords: false,
      vaccineTracking: false,
      clinicalTools: false,
      adFree: true, // Ads disabled for now
      ecommerce: false,
      qrTags: false,
      bulkOrdering: false,
      analyticsBasic: false,
      analyticsAdvanced: false,
      analyticsAI: false,
      whatsappApi: false,
      hospitalization: false,
      laboratory: false,
      multiLocation: false,
      apiAccess: false,
      slaGuarantee: false,
      dedicatedSupport: false,
    },
    support: {
      communityForum: true,
      emailSupport: false,
      whatsappSupport: false,
      phoneSupport: false,
      prioritySupport: false,
      responseTimeHours: null,
    },
  },
  {
    id: 'profesional',
    name: 'Profesional',
    description: 'Todo incluido para clínicas profesionales',
    monthlyPrice: 250000,
    setupFee: 0,
    includedUsers: Infinity,
    extraUserPrice: 0,
    commitmentMonths: 0,
    ecommerceCommission: 0.03, // 3% flat rate on store orders
    serviceCommission: 0.03, // 3% flat rate on service invoices
    popular: true,
    color: '#2DCEA3', // Teal/Green (primary brand color)
    targetPatientsMin: 50,
    targetPatientsMax: 10000,
    features: {
      website: true,
      petPortal: true,
      appointments: true,
      medicalRecords: true,
      vaccineTracking: true,
      clinicalTools: true,
      adFree: true,
      ecommerce: true,
      qrTags: true,
      bulkOrdering: true,
      analyticsBasic: true,
      analyticsAdvanced: true,
      analyticsAI: true,
      whatsappApi: true,
      hospitalization: true,
      laboratory: true,
      multiLocation: true,
      apiAccess: true,
      slaGuarantee: true,
      dedicatedSupport: true,
    },
    support: {
      communityForum: true,
      emailSupport: true,
      whatsappSupport: true,
      phoneSupport: true,
      prioritySupport: true,
      responseTimeHours: 4,
    },
  },
]

/**
 * Discount configuration
 */
export const discounts = {
  annual: 0.20, // 20% off for annual prepay
  semiAnnual: 0.10, // 10% off for 6-month prepay
  referral: 0.30, // 30% off per referral (stackable)
  maxReferralDiscount: 1.0, // Max 100% off (free month)
  earlyAdopterLimit: 300, // First 300 clinics get locked rates
}

/**
 * Trial/Promotion configuration
 * 2026 Promotion: 2 months free Professional tier for all new subscribers
 * Charges start on the 3rd month
 */
export const trialConfig = {
  freeMonths: 2, // 2 months free for 2026
  trialTier: 'profesional' as TierId, // Professional tier during trial
  chargesStartMonth: 3, // Billing starts on month 3
  promotionYear: 2026, // Year this promotion is valid
  promotionDescription: 'Primeros 2 meses GRATIS. Se cobra a partir del 3er mes.',
}

/**
 * ROI Guarantee configuration
 * @deprecated ROI Guarantee discontinued as of January 2026
 * Keeping for backwards compatibility but not used in UI
 */
export const roiGuarantee = {
  evaluationMonths: 6,
  freeMonthsIfFailed: 6,
  averageClientValue: 50000,
  minClientSpend: 100000,
  discontinued: true, // Flag to indicate this is no longer offered
}

/**
 * Commission rates are now defined per-tier directly in the pricingTiers array.
 * Flat rates by tier (no time-based escalation):
 * - Gratis: 0%
 * - Profesional: 3%
 *
 * @deprecated Use tier.ecommerceCommission and tier.serviceCommission directly
 */
export const commissionConfig = {
  /** @deprecated Use getTierById(tierId).ecommerceCommission instead */
  get initialRate() {
    return 0.03 // Profesional tier rate as default
  },
  /** @deprecated Commission rates no longer escalate */
  get standardRate() {
    return 0.03 // Same as initial - no escalation
  },
  /** @deprecated No longer applicable - only 2 tiers */
  get enterpriseRate() {
    return 0.03
  },
  /** @deprecated Commission rates are now flat per tier */
  monthsUntilIncrease: Infinity, // Never increases
}

/**
 * @deprecated Use tier.serviceCommission directly
 */
export const serviceCommissionConfig = {
  /** @deprecated Use getTierById(tierId).serviceCommission instead */
  get initialRate() {
    return 0.03
  },
  /** @deprecated Commission rates no longer escalate */
  get standardRate() {
    return 0.03
  },
  /** @deprecated No longer applicable - only 2 tiers */
  get enterpriseRate() {
    return 0.03
  },
  /** @deprecated Commission rates are now flat per tier */
  monthsUntilIncrease: Infinity,
}

/**
 * Bulk ordering configuration
 */
export const bulkOrderingConfig = {
  minimumTier: 'profesional' as TierId,
  minimumOrderValue: 0, // No minimum - aggregate all orders
  deliveryMarkup: 0.10, // 10% markup on delivery costs
  targetMargin: 0.20, // 20% target margin on products
}

// ============ Helper Functions ============

/**
 * Get tier by ID
 */
export function getTierById(id: TierId): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.id === id)
}

/**
 * Get all paid tiers
 */
export function getPaidTiers(): PricingTier[] {
  return pricingTiers.filter((tier) => tier.monthlyPrice > 0 || tier.enterprise)
}

/**
 * Get the popular/recommended tier
 */
export function getPopularTier(): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.popular)
}

/**
 * Calculate price with discount
 */
export function calculateDiscountedPrice(
  monthlyPrice: number,
  discountType: 'annual' | 'semiAnnual' | 'referral',
  referralCount: number = 1
): number {
  let discount = 0

  switch (discountType) {
    case 'annual':
      discount = discounts.annual
      break
    case 'semiAnnual':
      discount = discounts.semiAnnual
      break
    case 'referral':
      discount = Math.min(discounts.referral * referralCount, discounts.maxReferralDiscount)
      break
  }

  return Math.round(monthlyPrice * (1 - discount))
}

export type BillingPeriod = 'monthly' | 'semiAnnual' | 'annual'

export interface StackedDiscountResult {
  /** Monthly equivalent price after all discounts */
  monthlyEquivalent: number
  /** Total price for the billing period */
  total: number
  /** Total savings compared to full price */
  savings: number
  /** Breakdown of discounts applied */
  breakdown: {
    originalMonthly: number
    referralDiscount: number
    afterReferral: number
    periodDiscount: number
    periodMonths: number
  }
}

/**
 * Calculate price with stacked discounts
 *
 * For annual/semi-annual billing, discounts are stacked correctly:
 * 1. Apply referral discounts FIRST (30% per referral, max 100%)
 * 2. Then apply billing period discount (20% annual, 10% semi-annual)
 *
 * Example: ₲200,000/month + 2 referrals (60% off) + annual (20% off)
 * - Step 1: ₲200,000 × 0.4 = ₲80,000/month after referrals
 * - Step 2: ₲80,000 × 12 × 0.8 = ₲768,000/year
 * - Effective monthly: ₲64,000 (68% total savings!)
 *
 * @param monthlyPrice - Base monthly price before any discounts
 * @param billingPeriod - 'monthly', 'semiAnnual', or 'annual'
 * @param referralCount - Number of referrals (each gives 30% off)
 * @returns Object with monthly equivalent, total, and savings
 */
export function calculateStackedDiscount(
  monthlyPrice: number,
  billingPeriod: BillingPeriod,
  referralCount: number = 0
): StackedDiscountResult {
  // Step 1: Apply referral discount (capped at 100%)
  const referralDiscountPercent = Math.min(
    discounts.referral * referralCount,
    discounts.maxReferralDiscount
  )
  const afterReferral = monthlyPrice * (1 - referralDiscountPercent)

  // Step 2: Determine billing period multiplier and discount
  let periodMonths = 1
  let periodDiscountPercent = 0

  switch (billingPeriod) {
    case 'annual':
      periodMonths = 12
      periodDiscountPercent = discounts.annual
      break
    case 'semiAnnual':
      periodMonths = 6
      periodDiscountPercent = discounts.semiAnnual
      break
    default:
      periodMonths = 1
      periodDiscountPercent = 0
  }

  // Step 3: Calculate final totals
  const subtotal = afterReferral * periodMonths
  const total = Math.round(subtotal * (1 - periodDiscountPercent))
  const monthlyEquivalent = Math.round(total / periodMonths)
  const fullPrice = monthlyPrice * periodMonths
  const savings = fullPrice - total

  return {
    monthlyEquivalent,
    total,
    savings,
    breakdown: {
      originalMonthly: monthlyPrice,
      referralDiscount: referralDiscountPercent,
      afterReferral: Math.round(afterReferral),
      periodDiscount: periodDiscountPercent,
      periodMonths,
    },
  }
}

/**
 * Calculate ROI guarantee threshold
 * Returns the minimum number of new clients needed
 */
export function calculateRoiThreshold(monthlyPrice: number): number {
  return Math.ceil(monthlyPrice / roiGuarantee.averageClientValue)
}

/**
 * Calculate total price including extra users
 */
export function calculateTotalPrice(tierId: TierId, userCount: number): number {
  const tier = getTierById(tierId)
  if (!tier) return 0

  const includedUsers = tier.includedUsers === Infinity ? userCount : tier.includedUsers
  const extraUsers = Math.max(0, userCount - includedUsers)

  return tier.monthlyPrice + extraUsers * tier.extraUserPrice
}

/**
 * Check if a feature is available in a tier
 */
export function hasFeature(tierId: TierId, feature: keyof TierFeatures): boolean {
  const tier = getTierById(tierId)
  return tier?.features[feature] ?? false
}

/**
 * Get the minimum tier that has a specific feature
 */
export function getMinimumTierForFeature(feature: keyof TierFeatures): TierId | null {
  for (const tier of pricingTiers) {
    if (tier.features[feature]) {
      return tier.id
    }
  }
  return null
}

/**
 * Format price for display
 */
export function formatTierPrice(tier: PricingTier): string {
  if (tier.enterprise) {
    return 'Personalizado'
  }
  if (tier.monthlyPrice === 0) {
    return 'Gratis'
  }
  return `Gs ${tier.monthlyPrice.toLocaleString('es-PY')}`
}

/**
 * Get store commission rate for a tier
 * Commission rates are now flat per tier (no time-based escalation)
 *
 * @param tierId - The tier ID to get commission rate for
 * @param _monthsActive - DEPRECATED: No longer used, rates are flat
 * @returns Commission rate as decimal (e.g., 0.03 = 3%)
 */
export function getCommissionRate(tierId: TierId, _monthsActive?: number): number {
  const tier = getTierById(tierId)
  return tier?.ecommerceCommission ?? 0.03 // Default to Profesional rate
}

/**
 * Get service commission rate for a tier
 * Commission rates are now flat per tier (no time-based escalation)
 *
 * @param tierId - The tier ID to get commission rate for
 * @param _monthsActive - DEPRECATED: No longer used, rates are flat
 * @returns Commission rate as decimal (e.g., 0.03 = 3%)
 */
export function getServiceCommissionRate(tierId: TierId, _monthsActive?: number): number {
  const tier = getTierById(tierId)
  return tier?.serviceCommission ?? 0.03 // Default to Profesional rate
}

/**
 * Suggest a tier based on monthly patient count
 * Returns the most appropriate tier for the clinic's size
 *
 * With 2 tiers:
 * - < 50 patients: Free tier is sufficient
 * - >= 50 patients: Recommend Professional
 */
export function suggestTierByPatients(monthlyPatients: number): PricingTier {
  // Simple 2-tier logic
  if (monthlyPatients < 50) {
    return pricingTiers[0] // Gratis
  }
  return pricingTiers[1] // Profesional
}

/**
 * Get all tier colors for charts/UI
 */
export function getTierColors(): Record<TierId, string> {
  return Object.fromEntries(pricingTiers.map((t) => [t.id, t.color])) as Record<TierId, string>
}

export default pricingTiers
