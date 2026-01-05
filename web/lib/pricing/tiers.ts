/**
 * VetePy Pricing Tiers Configuration
 *
 * Centralized pricing configuration for all subscription tiers.
 * All prices in Paraguayan Guaraníes (PYG).
 *
 * Strategy: Freemium with full features, monetize through ads, commissions, and premium support
 *
 * Last updated: January 2026
 */

export type TierId = 'gratis' | 'basico' | 'crecimiento' | 'profesional' | 'empresarial'

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
  ecommerceCommission: number // percentage (0.03 = 3%)
}

/**
 * All pricing tiers
 */
export const pricingTiers: PricingTier[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    description: 'Para clínicas que quieren presencia digital básica',
    monthlyPrice: 0,
    setupFee: 0,
    includedUsers: Infinity,
    extraUserPrice: 0,
    commitmentMonths: 0,
    ecommerceCommission: 0,
    features: {
      website: true,
      petPortal: true,
      appointments: true,
      medicalRecords: true,
      vaccineTracking: true,
      clinicalTools: true,
      adFree: false, // Shows ads
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
    id: 'basico',
    name: 'Básico',
    description: 'Para clínicas pequeñas que quieren una experiencia sin anuncios',
    monthlyPrice: 100000,
    setupFee: 0,
    includedUsers: 3,
    extraUserPrice: 30000,
    commitmentMonths: 0,
    ecommerceCommission: 0,
    features: {
      website: true,
      petPortal: true,
      appointments: true,
      medicalRecords: true,
      vaccineTracking: true,
      clinicalTools: true,
      adFree: true,
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
      emailSupport: true,
      whatsappSupport: false,
      phoneSupport: false,
      prioritySupport: false,
      responseTimeHours: 48,
    },
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    description: 'Para clínicas en crecimiento que quieren vender productos',
    monthlyPrice: 200000,
    setupFee: 0,
    includedUsers: 5,
    extraUserPrice: 40000,
    commitmentMonths: 0,
    ecommerceCommission: 0.03, // 3%, increases to 5% after 6 months
    popular: true,
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
      emailSupport: true,
      whatsappSupport: false,
      phoneSupport: false,
      prioritySupport: false,
      responseTimeHours: 24,
    },
  },
  {
    id: 'profesional',
    name: 'Profesional',
    description: 'Para clínicas establecidas con hospitalización y laboratorio',
    monthlyPrice: 400000,
    setupFee: 0,
    includedUsers: 10,
    extraUserPrice: 50000,
    commitmentMonths: 0,
    ecommerceCommission: 0.03,
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
      analyticsAI: false,
      whatsappApi: true,
      hospitalization: true,
      laboratory: true,
      multiLocation: false,
      apiAccess: false,
      slaGuarantee: false,
      dedicatedSupport: false,
    },
    support: {
      communityForum: true,
      emailSupport: true,
      whatsappSupport: true,
      phoneSupport: false,
      prioritySupport: false,
      responseTimeHours: 12,
    },
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    description: 'Para cadenas y clínicas con múltiples sucursales',
    monthlyPrice: 0, // Custom pricing
    setupFee: 0,
    includedUsers: 20,
    extraUserPrice: 60000,
    commitmentMonths: 12,
    ecommerceCommission: 0.02, // Negotiated, lower for enterprise
    enterprise: true,
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
 * Trial configuration
 */
export const trialConfig = {
  standardDays: 90, // 3 months
  referralBonusDays: 60, // +2 months for referred clinics
  trialTier: 'profesional' as TierId, // What tier they get during trial
}

/**
 * ROI Guarantee configuration
 */
export const roiGuarantee = {
  evaluationMonths: 6, // Evaluate after 6 months
  freeMonthsIfFailed: 6, // Give 6 free months if ROI not met
  averageClientValue: 50000, // Gs 50,000 average client value
  minClientSpend: 100000, // Gs 100,000 minimum to count as "new client"
}

/**
 * E-commerce commission configuration
 */
export const commissionConfig = {
  initialRate: 0.03, // 3% for first 6 months
  standardRate: 0.05, // 5% after 6 months
  enterpriseRate: 0.02, // 2% for enterprise (negotiated)
  monthsUntilIncrease: 6, // When to increase from initial to standard
}

/**
 * Bulk ordering configuration
 */
export const bulkOrderingConfig = {
  minimumTier: 'crecimiento' as TierId,
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
 * Get commission rate based on tenure
 */
export function getCommissionRate(monthsActive: number, tierId: TierId): number {
  const tier = getTierById(tierId)
  if (!tier) return commissionConfig.standardRate

  if (tier.enterprise) {
    return commissionConfig.enterpriseRate
  }

  if (monthsActive < commissionConfig.monthsUntilIncrease) {
    return commissionConfig.initialRate
  }

  return commissionConfig.standardRate
}

export default pricingTiers
