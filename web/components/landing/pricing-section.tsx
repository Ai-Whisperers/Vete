'use client'

import { useState } from 'react'
import { Check, MessageCircle, Sparkles, Building2, Gift } from 'lucide-react'
import {
  pricingTiers,
  discounts,
  trialConfig,
  calculateStackedDiscount,
  type PricingTier,
  type BillingPeriod,
} from '@/lib/pricing/tiers'
import { tierFeatureDescriptions, tierCtaMessages } from '@/lib/pricing/tier-ui'
import { getWhatsAppUrl, pricingMessages } from '@/lib/whatsapp'

// Map UI billing period to tiers.ts BillingPeriod
type UIBillingPeriod = 'monthly' | 'yearly'
const billingPeriodMap: Record<UIBillingPeriod, BillingPeriod> = {
  monthly: 'monthly',
  yearly: 'annual',
}

/**
 * Format price for display with billing period
 * Uses the centralized calculateStackedDiscount for accurate calculations
 */
function formatPrice(tier: PricingTier, billingPeriod: UIBillingPeriod): string {
  if (tier.enterprise) return 'Personalizado'
  if (tier.monthlyPrice === 0) return 'Gratis'

  const period = billingPeriodMap[billingPeriod]
  const { monthlyEquivalent } = calculateStackedDiscount(tier.monthlyPrice, period, 0)

  return `Gs ${monthlyEquivalent.toLocaleString('es-PY')}`
}

/**
 * Get pricing details for a tier using centralized discount function
 */
function getPricingDetails(tier: PricingTier, billingPeriod: UIBillingPeriod) {
  if (tier.enterprise || tier.monthlyPrice === 0) {
    return { monthlyEquivalent: 0, total: 0, savings: 0, monthlySavings: 0 }
  }

  const period = billingPeriodMap[billingPeriod]
  const result = calculateStackedDiscount(tier.monthlyPrice, period, 0)

  return {
    ...result,
    monthlySavings: tier.monthlyPrice - result.monthlyEquivalent,
  }
}

// Feature descriptions and CTA messages imported from lib/pricing/tier-ui.tsx
// Single source of truth for all tier UI elements

interface PricingCardProps {
  tier: PricingTier
  features: string[]
  cta: { cta: string; message: string }
  billingPeriod: UIBillingPeriod
}

function PricingCard({ tier, features, cta, billingPeriod }: PricingCardProps): React.ReactElement {
  const isEnterprise = tier.enterprise
  const isFree = tier.monthlyPrice === 0 && !isEnterprise
  const pricing = getPricingDetails(tier, billingPeriod)
  const showSavings = billingPeriod === 'yearly' && !isFree && !isEnterprise

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 bg-[var(--landing-bg-white)] p-6 transition-all hover:shadow-lg md:p-8 ${
        tier.popular
          ? 'border-[var(--landing-primary)] ring-2 ring-[var(--landing-primary)] ring-offset-2'
          : isEnterprise
            ? 'border-[var(--landing-text-light)]'
            : 'border-[var(--landing-border)]'
      }`}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--landing-primary)] px-3 py-1 text-xs font-bold text-white">
            <Sparkles className="h-3 w-3" />
            Recomendado
          </span>
        </div>
      )}

      {/* Enterprise badge */}
      {isEnterprise && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--landing-dark)] px-3 py-1 text-xs font-bold text-white">
            <Building2 className="h-3 w-3" />
            Empresas
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="mb-1 text-xl font-bold text-[var(--landing-text-primary)]">{tier.name}</h3>
        <p className="text-sm text-[var(--landing-text-muted)]">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-[var(--landing-text-primary)]">
            {formatPrice(tier, billingPeriod)}
          </span>
          {!isFree && !isEnterprise && <span className="text-[var(--landing-text-muted)]">/mes</span>}
        </div>

        {/* Original price strikethrough for yearly */}
        {showSavings && (
          <div className="mt-1">
            <span className="text-sm text-[var(--landing-text-muted)] line-through">
              Gs {tier.monthlyPrice.toLocaleString('es-PY')}/mes
            </span>
            <span className="ml-2 text-sm font-bold text-green-600">
              Ahorrás Gs {pricing.monthlySavings.toLocaleString('es-PY')}/mes
            </span>
          </div>
        )}

        {/* Yearly totals comparison */}
        {showSavings && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[var(--landing-text-muted)]">Total anual:</span>
              <div className="text-right">
                <span className="text-lg font-black text-[var(--landing-text-primary)]">
                  Gs {pricing.total.toLocaleString('es-PY')}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--landing-text-muted)]">Sin descuento:</span>
              <span className="text-[var(--landing-text-muted)] line-through">
                Gs {(tier.monthlyPrice * 12).toLocaleString('es-PY')}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1 rounded bg-green-100 py-1">
              <span className="text-xs font-bold text-green-700">
                💰 Ahorrás Gs {pricing.savings.toLocaleString('es-PY')}/año
              </span>
            </div>
          </div>
        )}

        {/* User info */}
        {tier.includedUsers !== Infinity && (
          <p className="mt-1 text-xs text-[var(--landing-text-muted)]">
            {tier.includedUsers} usuarios incluidos
            {tier.extraUserPrice > 0 && ` • +Gs ${tier.extraUserPrice.toLocaleString('es-PY')}/usuario extra`}
          </p>
        )}
        {tier.includedUsers === Infinity && isFree && (
          <p className="mt-1 text-xs text-[var(--landing-text-muted)]">Usuarios ilimitados</p>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 shrink-0 text-[var(--landing-primary)]" />
            <span className="text-[var(--landing-text-secondary)]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={getWhatsAppUrl(cta.message)}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
          tier.popular
            ? 'bg-[var(--landing-primary)] text-white shadow-lg hover:-translate-y-0.5 hover:bg-[var(--landing-primary-hover)]'
            : isEnterprise
              ? 'bg-[var(--landing-dark)] text-white shadow-lg hover:-translate-y-0.5 hover:opacity-90'
              : isFree
                ? 'bg-[var(--landing-primary-lighter)] text-[var(--landing-primary-hover)] hover:bg-[var(--landing-primary-light)]'
                : 'border border-[var(--landing-border)] bg-[var(--landing-bg-white)] text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg)]'
        }`}
      >
        <MessageCircle className="h-4 w-4" />
        {cta.cta}
      </a>
    </div>
  )
}

export function PricingSection(): React.ReactElement {
  const [billingPeriod, setBillingPeriod] = useState<UIBillingPeriod>('monthly')

  // Split tiers into main (first 4) and enterprise (last 1) for layout
  const mainTiers = pricingTiers.slice(0, 4)
  const enterpriseTier = pricingTiers.find((t) => t.enterprise)

  // Calculate total savings across all paid tiers for yearly using centralized function
  const totalYearlySavings = mainTiers
    .filter((t) => t.monthlyPrice > 0)
    .reduce((sum, tier) => sum + getPricingDetails(tier, 'yearly').savings, 0)

  return (
    <section id="precios" className="relative overflow-hidden bg-[var(--landing-bg)] py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-4 text-3xl font-black text-[var(--landing-text-primary)] md:text-4xl lg:text-5xl">
            Empieza gratis, <span className="text-3xl md:text-4xl lg:text-5xl text-[var(--landing-primary)]">crece con nosotros.</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-[var(--landing-text-secondary)]">
            Sin tarjeta de crédito. Sin compromisos. Solo resultados.
          </p>

          {/* Billing Period Toggle */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="inline-flex items-center rounded-full bg-[var(--landing-bg-white)] p-1 shadow-sm ring-1 ring-[var(--landing-border)]">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-[var(--landing-primary)] text-white shadow-md'
                    : 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-[var(--landing-primary)] text-white shadow-md'
                    : 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
                }`}
              >
                Anual
                <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700">
                  -{Math.round(discounts.annual * 100)}%
                </span>
              </button>
            </div>

            {/* Savings summary for yearly */}
            {billingPeriod === 'yearly' && (
              <p className="text-sm font-medium text-green-600">
                🎉 Con pago anual ahorrás hasta Gs {totalYearlySavings.toLocaleString('es-PY')} por año
              </p>
            )}
          </div>

          {/* 2026 Promotion Badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-primary-hover)] px-5 py-2.5 text-sm font-bold text-white shadow-lg">
            <Gift className="h-5 w-5" />
            <span>
              Promocion {trialConfig.promotionYear}: {trialConfig.freeMonths} meses GRATIS en Plan Profesional
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--landing-text-muted)]">
            {trialConfig.promotionDescription}
          </p>
        </div>

        {/* Main Pricing Cards - 4 columns on lg, 2 on md, 1 on mobile */}
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mainTiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              features={tierFeatureDescriptions[tier.id] || []}
              cta={tierCtaMessages[tier.id] || { cta: 'Contactar', message: 'Hola!' }}
              billingPeriod={billingPeriod}
            />
          ))}
        </div>

        {/* Enterprise Tier - Full width card */}
        {enterpriseTier && (
          <div className="mx-auto mt-8 max-w-2xl">
            <PricingCard
              tier={enterpriseTier}
              features={tierFeatureDescriptions[enterpriseTier.id] || []}
              cta={tierCtaMessages[enterpriseTier.id] || { cta: 'Contactar', message: 'Hola!' }}
              billingPeriod={billingPeriod}
            />
          </div>
        )}

        {/* Additional discount info */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-center">
          <div className="rounded-lg bg-[var(--landing-bg-white)] px-4 py-2 shadow-sm">
            <span className="text-sm text-[var(--landing-text-secondary)]">Pago semestral:</span>{' '}
            <span className="font-bold text-[var(--landing-primary)]">{Math.round(discounts.semiAnnual * 100)}% descuento</span>
          </div>
          <div className="rounded-lg bg-[var(--landing-bg-white)] px-4 py-2 shadow-sm">
            <span className="text-sm text-[var(--landing-text-secondary)]">Referidos:</span>{' '}
            <span className="font-bold text-[var(--landing-primary)]">
              {Math.round(discounts.referral * 100)}% descuento por referido
            </span>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--landing-text-muted)]">
            ¿Necesitas algo especial?{' '}
            <a
              href={getWhatsAppUrl(pricingMessages.generalInquiry())}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[var(--landing-primary)] hover:underline"
            >
              Hablemos por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
