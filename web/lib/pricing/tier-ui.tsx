/**
 * Tier UI Elements
 *
 * React-specific UI elements for pricing tiers.
 * These are separated from the main config because they contain JSX (not serializable).
 *
 * Single source of truth for all tier-related UI elements across landing pages.
 */

import { Gift, Zap, ShoppingBag, Stethoscope, Crown } from 'lucide-react'
import type { TierId } from './tiers'
import { brandConfig } from '@/lib/branding/config'

// ============================================================================
// Tier Icons
// ============================================================================

/**
 * Standard size icons (h-5 w-5) for cards and selectors
 */
export const tierIcons: Record<TierId, React.ReactNode> = {
  gratis: <Gift className="h-5 w-5" />,
  basico: <Zap className="h-5 w-5" />,
  crecimiento: <ShoppingBag className="h-5 w-5" />,
  profesional: <Stethoscope className="h-5 w-5" />,
  empresarial: <Crown className="h-5 w-5" />,
}

/**
 * Large icons (h-8 w-8) for hero sections and quiz results
 */
export const tierIconsLarge: Record<TierId, React.ReactNode> = {
  gratis: <Gift className="h-8 w-8" />,
  basico: <Zap className="h-8 w-8" />,
  crecimiento: <ShoppingBag className="h-8 w-8" />,
  profesional: <Stethoscope className="h-8 w-8" />,
  empresarial: <Crown className="h-8 w-8" />,
}

/**
 * Get tier icon by size
 */
export function getTierIcon(tierId: TierId, size: 'sm' | 'lg' = 'sm'): React.ReactNode {
  return size === 'lg' ? tierIconsLarge[tierId] : tierIcons[tierId]
}

// ============================================================================
// Feature Descriptions (Marketing Copy)
// ============================================================================

/**
 * Feature descriptions for pricing cards
 * Used in PricingSection and other pricing displays
 */
export const tierFeatureDescriptions: Record<TierId, string[]> = {
  gratis: [
    'Sitio web profesional',
    'Agenda online 24/7',
    'Historial clínico digital',
    'Portal para dueños',
    'Control de vacunas',
    'Herramientas clínicas',
    'Muestra anuncios',
  ],
  basico: [
    'Todo de Gratis',
    'Sin anuncios',
    'Soporte por email',
    '3 usuarios incluidos',
  ],
  crecimiento: [
    'Todo de Básico',
    'Tienda online (3% comisión)',
    'Placas QR de identificación',
    'Pedidos mayoristas',
    'Reportes de ventas',
    '5 usuarios incluidos',
  ],
  profesional: [
    'Todo de Crecimiento',
    'WhatsApp Business API',
    'Módulo de hospitalización',
    'Laboratorio clínico',
    'Reportes avanzados',
    'Soporte WhatsApp 24/7',
    '10 usuarios incluidos',
  ],
  empresarial: [
    'Todo de Profesional',
    'Múltiples sucursales',
    'Acceso API',
    'Análisis con IA',
    'Garantía SLA 99.9%',
    'Soporte dedicado',
    'Comisión reducida (2%)',
    '20+ usuarios',
  ],
}

/**
 * Detailed features with included/not included lists
 * Used in ROI calculator detailed view
 */
export const tierDetailedFeatures: Record<TierId, { included: string[]; notIncluded: string[] }> = {
  gratis: {
    included: [
      'Sitio web profesional',
      'Agenda online 24/7',
      'Historial clinico digital',
      'Portal para duenos',
      'Control de vacunas',
      'Herramientas clinicas',
      'Usuarios ilimitados',
    ],
    notIncluded: [
      'Muestra anuncios',
      'Sin soporte prioritario',
      'Sin tienda online',
      'Sin WhatsApp automatico',
    ],
  },
  basico: {
    included: [
      'Todo de Gratis',
      'Sin anuncios',
      'Soporte por email (48h)',
      '3 usuarios incluidos',
    ],
    notIncluded: [
      'Sin tienda online',
      'Sin WhatsApp automatico',
      'Sin hospitalizacion',
    ],
  },
  crecimiento: {
    included: [
      'Todo de Basico',
      'Tienda online',
      'Placas QR de identificacion',
      'Pedidos mayoristas (pronto)',
      'Reportes de ventas',
      '5 usuarios incluidos',
    ],
    notIncluded: [
      'Sin WhatsApp automatico',
      'Sin hospitalizacion',
      'Sin laboratorio',
    ],
  },
  profesional: {
    included: [
      'Todo de Crecimiento',
      'WhatsApp Business API',
      'Recordatorios automaticos',
      'Modulo de hospitalizacion',
      'Laboratorio clinico',
      'Reportes avanzados',
      'Soporte WhatsApp 24/7',
      '10 usuarios incluidos',
    ],
    notIncluded: [
      'Sin multiples sucursales',
      'Sin acceso API',
    ],
  },
  empresarial: {
    included: [
      'Todo de Profesional',
      'Multiples sucursales',
      'Acceso API completo',
      'Analisis con IA',
      'Garantia SLA 99.9%',
      'Soporte dedicado',
      'Comision reducida (2%)',
      '20+ usuarios',
    ],
    notIncluded: [],
  },
}

// ============================================================================
// Quiz Reasons (Persuasive Copy)
// ============================================================================

/**
 * Reasons shown in quiz results explaining why the plan was recommended
 */
export const tierQuizReasons: Record<TierId, string[]> = {
  gratis: [
    'Sitio web profesional para tu clinica',
    'Portal de mascotas para tus clientes',
    'Citas, fichas medicas y vacunas incluidas',
    'Muestra anuncios - asi se financia',
    'Podes subir a un plan pago cuando quieras',
  ],
  basico: [
    'Sin anuncios - imagen profesional',
    'Incluye 3 usuarios (Gs 30.000/extra)',
    'Soporte por email (48 horas)',
    'Todas las funciones clinicas basicas',
    'Ideal para clinicas pequenas',
  ],
  crecimiento: [
    'Tienda online integrada (3% comision)',
    'Acceso a compras grupales con descuentos',
    'Incluye 5 usuarios (Gs 40.000/extra)',
    'Analiticas basicas de tu negocio',
    'Soporte por email (24 horas)',
  ],
  profesional: [
    'Modulo de hospitalizacion e internacion',
    'Laboratorio con resultados y paneles',
    'WhatsApp Business API integrado',
    'Incluye 10 usuarios (Gs 50.000/extra)',
    'Soporte prioritario por WhatsApp (12 hrs)',
  ],
  empresarial: [
    'Multiples sucursales en una cuenta',
    'API para integraciones personalizadas',
    'Analiticas avanzadas con IA',
    'SLA garantizado con soporte 24/7',
    'Account manager dedicado',
  ],
}

// ============================================================================
// CTA Messages (WhatsApp)
// ============================================================================

/**
 * Call-to-action button labels and WhatsApp pre-filled messages
 */
export const tierCtaMessages: Record<TierId, { cta: string; message: string }> = {
  gratis: {
    cta: 'Empezar Gratis',
    message: `Hola! Quiero crear mi cuenta gratuita en ${brandConfig.name}`,
  },
  basico: {
    cta: 'Elegir Básico',
    message: `Hola! Me interesa el plan Básico de ${brandConfig.name}`,
  },
  crecimiento: {
    cta: 'Elegir Crecimiento',
    message: `Hola! Me interesa el plan Crecimiento de ${brandConfig.name}`,
  },
  profesional: {
    cta: 'Elegir Profesional',
    message: `Hola! Me interesa el plan Profesional de ${brandConfig.name}`,
  },
  empresarial: {
    cta: 'Contactar Ventas',
    message: `Hola! Tengo una clínica con múltiples sucursales y me interesa el plan Empresarial de ${brandConfig.name}`,
  },
}

/**
 * Extended CTA messages for quiz results
 */
export const tierQuizCtaMessages: Record<TierId, string> = {
  gratis: `Hola! Hice el quiz de ${brandConfig.name} y quiero empezar con el Plan Gratis. Me pueden ayudar?`,
  basico: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Basico. Me gustaria saber mas!`,
  crecimiento: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Crecimiento. Me gustaria saber mas!`,
  profesional: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Profesional. Me gustaria saber mas!`,
  empresarial: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Empresarial. Tengo una cadena de clinicas y me gustaria una reunion.`,
}

// ============================================================================
// Taglines
// ============================================================================

/**
 * Short taglines for each tier
 */
export const tierTaglines: Record<TierId, string> = {
  gratis: 'Empieza sin pagar nada',
  basico: 'Sin anuncios, experiencia profesional',
  crecimiento: 'El favorito - vende y crece',
  profesional: 'Para clinicas completas',
  empresarial: 'Solucion a medida para cadenas',
}

// ============================================================================
// Teaser Highlights
// ============================================================================

/**
 * Single-line highlights for compact pricing cards
 */
export const tierHighlights: Record<TierId, string> = {
  gratis: 'Sin costo',
  basico: 'Sin anuncios',
  crecimiento: 'Tienda online',
  profesional: 'Hospital + Lab',
  empresarial: 'Multi-sucursal',
}

/**
 * Short feature lists for teaser cards (3 items max)
 */
export const tierTeaserFeatures: Record<TierId, string[]> = {
  gratis: ['Sitio web propio', 'Agenda de citas', 'Historial clínico'],
  basico: ['Todo de Gratis +', 'Sin anuncios', 'Soporte email'],
  crecimiento: ['Todo de Básico +', 'E-commerce', 'Tags QR para mascotas'],
  profesional: ['Todo de Crecimiento +', 'Hospitalización', 'WhatsApp API'],
  empresarial: ['Todo de Profesional +', 'Multi-sucursal', 'API + IA'],
}

// ============================================================================
// Upgrade Prompts
// ============================================================================

/**
 * What the next tier offers (for upgrade prompts)
 */
export const tierUpgradePrompts: Record<Exclude<TierId, 'empresarial'>, string[]> = {
  gratis: [
    'Sin anuncios en tu sitio',
    'Soporte por email (48h respuesta)',
  ],
  basico: [
    'Tienda online para vender productos',
    'Placas QR de identificacion',
    'Reportes de ventas',
  ],
  crecimiento: [
    'WhatsApp automatico - recupera citas perdidas',
    'Modulo de hospitalizacion',
    'Laboratorio clinico integrado',
  ],
  profesional: [
    'Multiples sucursales',
    'Acceso API completo',
    'Analiticas con IA',
    'SLA garantizado',
  ],
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the next tier for upgrade prompts
 */
export function getNextTierId(currentTierId: TierId): TierId | null {
  const tierOrder: TierId[] = ['gratis', 'basico', 'crecimiento', 'profesional', 'empresarial']
  const currentIndex = tierOrder.indexOf(currentTierId)
  if (currentIndex === -1 || currentIndex >= tierOrder.length - 1) {
    return null
  }
  return tierOrder[currentIndex + 1]
}

/**
 * Get upgrade cost difference (monthly)
 */
export function getUpgradeCostDifference(
  currentTierId: TierId,
  currentPrice: number,
  nextPrice: number
): number {
  if (currentTierId === 'empresarial') return 0
  return nextPrice - currentPrice
}
