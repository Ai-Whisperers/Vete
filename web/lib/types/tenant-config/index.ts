/**
 * Clinic Configuration Types - Barrel Export
 *
 * This file re-exports all types from the split modules for backward compatibility.
 * Import from '@/lib/types/tenant-config' or '@/lib/types/tenant-config.ts' (legacy)
 */

// Labels
export * from './labels'
export * from './dashboard-labels'
export * from './ui-labels'

// Config
export * from './config'

// Theme
export * from './theme'

// Content
export * from './content'

// ============================================================================
// Complete Clinic Data Type
// ============================================================================

import type { TenantConfig } from './config'
import type { TenantTheme } from './theme'
import type { TenantImages, HomeData, ServicesData, AboutData, TestimonialsData, FaqData, LegalData, PortfolioData } from './content'

export interface TenantData {
  config: TenantConfig
  theme: TenantTheme
  images?: TenantImages
  home: HomeData
  services: ServicesData
  about: AboutData
  testimonials?: TestimonialsData
  faq?: FaqData
  legal?: LegalData
  portfolio?: PortfolioData
}
