'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Calculator,
  ArrowRight,
  Check,
  Info,
  Megaphone,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  PieChart,
  MinusCircle,
  PlusCircle,
  Receipt,
  Percent,
  Wallet,
  Building2,
  AlertCircle,
  BarChart3,
} from 'lucide-react'
import {
  pricingTiers,
  discounts,
  trialConfig,
  commissionConfig,
  bulkOrderingConfig,
  type TierId,
  type PricingTier,
} from '@/lib/pricing/tiers'
import { tierIcons, tierDetailedFeatures } from '@/lib/pricing/tier-ui'
import { brandConfig } from '@/lib/branding/config'
import { getWhatsAppUrl, pricingMessages } from '@/lib/whatsapp'

// ============ Types ============
interface DerivedPlanConfig {
  id: TierId
  name: string
  icon: React.ReactNode
  color: string
  monthlyCost: number
  isCustomPricing?: boolean // For Empresarial - show "Personalizado"
  expectedGrowthPercent: number
  expectedNoShowReduction: number // % reduction in no-shows
  timeSavingsPercent: number // % admin time saved
  targetPatientsMin: number
  targetPatientsMax: number
  includedUsers: number
  hasEcommerce: boolean
  hasBulkOrdering: boolean
  hasWhatsappReminders: boolean
  showAds: boolean
  ecommerceCommission: number // current commission rate
}

interface ClinicInputs {
  monthlyConsultations: number
  avgConsultationPrice: number
  monthlyNoShows: number
  adminHoursPerWeek: number
  currentMonthlyStoreSales: number
  monthlySupplySpend: number
  monthsOnPlatform: number
}

interface RevenueBreakdown {
  label: string
  icon: React.ReactNode
  amount: number
  description: string
  isAvailable: boolean
  planRequired?: string
}

interface CostBreakdown {
  label: string
  amount: number
  description: string
  type: 'subscription' | 'commission' | 'markup'
}

// ============ Plan Feature Lists ============
// Using centralized tier features from tier-ui.tsx
const planFeatures = tierDetailedFeatures

// ============ Plan Configurations ============
// Derived from central pricing config with calculator-specific properties
// NOTE: All percentages are USER-ADJUSTABLE ESTIMATES, not guarantees.

/**
 * Calculator-specific properties per tier
 * These are component-specific and not part of the central config
 */
const tierCalculatorProps: Record<TierId, {
  expectedGrowthPercent: number
  expectedNoShowReduction: number
  timeSavingsPercent: number
}> = {
  gratis: { expectedGrowthPercent: 0, expectedNoShowReduction: 0, timeSavingsPercent: 0.15 },
  profesional: { expectedGrowthPercent: 0, expectedNoShowReduction: 0.20, timeSavingsPercent: 0.30 },
}

/**
 * Derive plan configs from central pricing tiers
 * All base data comes from lib/pricing/tiers.ts - single source of truth
 */
const plans: DerivedPlanConfig[] = pricingTiers.map((tier: PricingTier) => ({
  id: tier.id,
  name: tier.name,
  icon: tierIcons[tier.id],
  color: tier.color,
  monthlyCost: tier.monthlyPrice,
  isCustomPricing: tier.enterprise,
  expectedGrowthPercent: tierCalculatorProps[tier.id].expectedGrowthPercent,
  expectedNoShowReduction: tierCalculatorProps[tier.id].expectedNoShowReduction,
  timeSavingsPercent: tierCalculatorProps[tier.id].timeSavingsPercent,
  targetPatientsMin: tier.targetPatientsMin,
  targetPatientsMax: tier.targetPatientsMax,
  includedUsers: tier.includedUsers,
  hasEcommerce: tier.features.ecommerce,
  hasBulkOrdering: tier.features.bulkOrdering,
  hasWhatsappReminders: tier.features.whatsappApi,
  showAds: !tier.features.adFree,
  ecommerceCommission: tier.ecommerceCommission,
}))

// ============ Formatting Helpers ============
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `Gs ${(value / 1000000).toFixed(1)}M`
  }
  return `Gs ${new Intl.NumberFormat('es-PY').format(Math.round(value))}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

// ============ Main Component ============
export function ROICalculatorDetailed() {
  // Clinic inputs
  const [inputs, setInputs] = useState<ClinicInputs>({
    monthlyConsultations: 100,
    avgConsultationPrice: 150000,
    monthlyNoShows: 10,
    adminHoursPerWeek: 15,
    currentMonthlyStoreSales: 3000000,
    monthlySupplySpend: 2000000,
    monthsOnPlatform: 0, // New users start at month 0 (3% commission)
  })

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  // Auto-suggest plan based on patient count
  const suggestedPlan = useMemo(() => {
    return (
      plans.find(
        (p) =>
          inputs.monthlyConsultations >= p.targetPatientsMin &&
          inputs.monthlyConsultations < p.targetPatientsMax
      ) || plans[2]
    )
  }, [inputs.monthlyConsultations])

  const currentPlan = selectedPlanId
    ? plans.find((p) => p.id === selectedPlanId) || suggestedPlan
    : suggestedPlan

  // Auto-open advanced config for e-commerce plans (store sales is relevant)
  useEffect(() => {
    if (currentPlan.hasEcommerce) {
      setShowAdvanced(true)
    }
  }, [currentPlan.hasEcommerce])

  // Get current commission rate based on months on platform
  const currentCommissionRate = useMemo(() => {
    if (!currentPlan.hasEcommerce) return 0
    // Use initialRate for first 6 months, then standardRate
    return inputs.monthsOnPlatform < commissionConfig.monthsUntilIncrease
      ? commissionConfig.initialRate
      : commissionConfig.standardRate
  }, [currentPlan, inputs.monthsOnPlatform])

  // ============ All Calculations ============
  const calculations = useMemo(() => {
    const hourlyRate = 50000 // Gs per hour of admin time

    // === REVENUE/SAVINGS STREAMS ===

    // 1. New clients from digital presence
    const newClientsPerMonth = Math.round(inputs.monthlyConsultations * currentPlan.expectedGrowthPercent)
    const revenueFromNewClients = newClientsPerMonth * inputs.avgConsultationPrice

    // 2. Recovered revenue from reduced no-shows
    const recoveredNoShows = Math.round(inputs.monthlyNoShows * currentPlan.expectedNoShowReduction)
    const revenueFromRecoveredNoShows = recoveredNoShows * inputs.avgConsultationPrice

    // 3. Time savings (admin hours)
    const hoursSavedPerMonth = inputs.adminHoursPerWeek * 4 * currentPlan.timeSavingsPercent
    const valueSavedFromTime = hoursSavedPerMonth * hourlyRate

    // 4. E-commerce - we only count the commission cost, NOT promise growth
    // Store sales remain the same; we just enable online ordering
    const totalStoreSales = currentPlan.hasEcommerce ? inputs.currentMonthlyStoreSales : 0

    // Total gross benefit - ONLY count what we can actually deliver
    const totalGrossBenefit =
      revenueFromNewClients + // Will be 0 since we don't promise growth
      revenueFromRecoveredNoShows + // Only for plans with WhatsApp reminders
      valueSavedFromTime // Conservative time savings from digital records

    // === VETIC COSTS ===

    // 1. Monthly subscription
    const subscriptionCost = currentPlan.monthlyCost

    // 2. E-commerce commission (on ALL store sales, not just additional)
    const ecommerceCommission = currentPlan.hasEcommerce
      ? totalStoreSales * currentCommissionRate
      : 0

    // 3. Bulk ordering markup (we add 10% to delivery)
    const bulkDeliveryMarkup = currentPlan.hasBulkOrdering
      ? inputs.monthlySupplySpend * bulkOrderingConfig.deliveryMarkup
      : 0

    // Total Vetic costs
    const totalVeticCosts = subscriptionCost + ecommerceCommission + bulkDeliveryMarkup

    // Net monthly benefit
    const netMonthlyBenefit = totalGrossBenefit - totalVeticCosts

    // Annual calculations
    const yearlyGrossBenefit = totalGrossBenefit * 12
    const yearlyVeticCosts = totalVeticCosts * 12
    const yearlyNetBenefit = netMonthlyBenefit * 12

    // ROI calculation
    const yearlyROI = yearlyVeticCosts > 0
      ? ((yearlyGrossBenefit - yearlyVeticCosts) / yearlyVeticCosts) * 100
      : Infinity

    // Break-even clients (how many new clients to cover subscription)
    const breakEvenClients = subscriptionCost > 0
      ? Math.ceil(subscriptionCost / inputs.avgConsultationPrice)
      : 0

    // Annual discount calculation
    const annualPrice = subscriptionCost * 12 * (1 - discounts.annual)
    const annualSavings = subscriptionCost * 12 - annualPrice

    // Revenue breakdown items - ONLY things we can actually deliver
    const revenueBreakdown: RevenueBreakdown[] = [
      {
        label: 'Citas recuperadas (con recordatorios)',
        icon: <Clock className="h-4 w-4" />,
        amount: revenueFromRecoveredNoShows,
        description: currentPlan.hasWhatsappReminders
          ? `Estimado: ${recoveredNoShows} citas/mes × ${formatCurrency(inputs.avgConsultationPrice)}`
          : 'Requiere plan con recordatorios WhatsApp',
        isAvailable: currentPlan.hasWhatsappReminders && revenueFromRecoveredNoShows > 0,
        planRequired: currentPlan.hasWhatsappReminders ? undefined : 'Profesional',
      },
      {
        label: 'Ahorro tiempo admin (estimado)',
        icon: <Clock className="h-4 w-4" />,
        amount: valueSavedFromTime,
        description: `~${hoursSavedPerMonth.toFixed(0)}h/mes con registros digitales`,
        isAvailable: valueSavedFromTime > 0,
      },
    ]

    // Cost breakdown items
    const costBreakdown: CostBreakdown[] = [
      {
        label: 'Suscripcion mensual',
        amount: subscriptionCost,
        description: `Plan ${currentPlan.name}`,
        type: 'subscription',
      },
    ]

    if (currentPlan.hasEcommerce && ecommerceCommission > 0) {
      costBreakdown.push({
        label: `Comision tienda (${formatPercent(currentCommissionRate)})`,
        amount: ecommerceCommission,
        description: `${formatPercent(currentCommissionRate)} de ${formatCurrency(totalStoreSales)} en ventas`,
        type: 'commission',
      })
    }

    if (currentPlan.hasBulkOrdering && bulkDeliveryMarkup > 0) {
      costBreakdown.push({
        label: 'Logistica compras volumen',
        amount: bulkDeliveryMarkup,
        description: 'Costo de coordinacion y entrega',
        type: 'markup',
      })
    }

    return {
      // Revenue items (conservative estimates only)
      newClientsPerMonth,
      revenueFromNewClients,
      recoveredNoShows,
      revenueFromRecoveredNoShows,
      hoursSavedPerMonth,
      valueSavedFromTime,
      totalStoreSales,

      // Totals
      totalGrossBenefit,
      totalVeticCosts,
      netMonthlyBenefit,

      // Annual
      yearlyGrossBenefit,
      yearlyVeticCosts,
      yearlyNetBenefit,
      yearlyROI: yearlyROI === Infinity ? 999 : Math.round(yearlyROI),

      // Other metrics
      breakEvenClients,
      annualPrice,
      annualSavings,
      currentCommissionRate,

      // Payback period (months to recover investment)
      paybackMonths: totalGrossBenefit > 0 && totalVeticCosts > 0
        ? totalVeticCosts / totalGrossBenefit
        : null,

      // Breakdown arrays
      revenueBreakdown,
      costBreakdown,

      // Store sales for display
      ecommerceCommission,
      subscriptionCost,
    }
  }, [inputs, currentPlan, currentCommissionRate])

  return (
    <section
      id="calculadora-roi"
      className="relative overflow-hidden bg-[var(--landing-bg-white)] py-20 md:py-28"
    >
      {/* Background gradient */}
      <div
        className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[200px] opacity-10 transition-colors duration-500"
        style={{ backgroundColor: currentPlan.color }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="bg-[var(--landing-primary-lighter)] border-[var(--landing-primary-light)] mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2">
            <Calculator className="h-4 w-4 text-[var(--landing-primary)]" />
            <span className="text-sm font-medium text-[var(--landing-primary)]">
              Calculadora de Costos
            </span>
          </div>
          <h2 className="mb-6 text-3xl font-black text-[var(--landing-text-primary)] md:text-4xl lg:text-5xl">
            ¿Cuanto{' '}
            <span className="text-3xl md:text-4xl lg:text-5xl" style={{ color: currentPlan.color }}>cuesta</span>{' '}
            realmente?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[var(--landing-text-secondary)]">
            Sin letra chica. Te mostramos exactamente lo que pagas: suscripcion,
            comisiones, y cualquier otro costo.
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
            {billingPeriod === 'yearly' && !currentPlan.isCustomPricing && currentPlan.monthlyCost > 0 && (
              <p className="text-sm font-medium text-green-600">
                Con pago anual ahorrás {formatCurrency(calculations.annualSavings)} por año
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* ============ INPUT PANEL ============ */}
            <div className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-bg)] p-6 lg:col-span-4">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-[var(--landing-text-primary)]">
                <Building2 className="h-5 w-5 text-[var(--landing-primary)]" />
                Tu Clinica Hoy
              </h3>

              {/* Basic Inputs */}
              <div className="space-y-5">
                {/* Monthly Consultations */}
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm text-[var(--landing-text-secondary)]">
                    <span>Consultas mensuales</span>
                    <span className="font-bold text-[var(--landing-text-primary)]">{inputs.monthlyConsultations}</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="600"
                    step="10"
                    value={inputs.monthlyConsultations}
                    onChange={(e) => {
                      setInputs({ ...inputs, monthlyConsultations: Number(e.target.value) })
                      setSelectedPlanId(null)
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--landing-border)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--landing-primary)]"
                  />
                </div>

                {/* Average Price */}
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm text-[var(--landing-text-secondary)]">
                    <span>Precio promedio consulta</span>
                    <span className="font-bold text-[var(--landing-text-primary)]">{formatCurrency(inputs.avgConsultationPrice)}</span>
                  </label>
                  <input
                    type="range"
                    min="50000"
                    max="500000"
                    step="10000"
                    value={inputs.avgConsultationPrice}
                    onChange={(e) => setInputs({ ...inputs, avgConsultationPrice: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--landing-border)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--landing-primary)]"
                  />
                </div>

                {/* No-shows */}
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm text-[var(--landing-text-secondary)]">
                    <span>Citas perdidas/mes (no-shows)</span>
                    <span className="font-bold text-[var(--landing-text-primary)]">{inputs.monthlyNoShows}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={inputs.monthlyNoShows}
                    onChange={(e) => setInputs({ ...inputs, monthlyNoShows: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--landing-border)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--landing-primary)]"
                  />
                </div>

                {/* Advanced Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex w-full items-center justify-between rounded-lg bg-[var(--landing-bg-muted)] px-4 py-3 text-sm text-[var(--landing-text-secondary)] transition-colors hover:bg-[var(--landing-border)]"
                >
                  <span>Configuracion avanzada</span>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {/* Advanced Inputs */}
                {showAdvanced && (
                  <div className="space-y-5 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg-white)] p-4">
                    {/* Admin Hours */}
                    <div>
                      <label className="mb-2 flex items-center justify-between text-sm text-[var(--landing-text-secondary)]">
                        <span>Horas admin/semana</span>
                        <span className="font-bold text-[var(--landing-text-primary)]">{inputs.adminHoursPerWeek}h</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="1"
                        value={inputs.adminHoursPerWeek}
                        onChange={(e) => setInputs({ ...inputs, adminHoursPerWeek: Number(e.target.value) })}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--landing-border)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--landing-text-muted)]"
                      />
                    </div>

                    {/* Current Store Sales */}
                    <div>
                      <label className="mb-2 flex items-center justify-between text-sm text-[var(--landing-text-secondary)]">
                        <span>Ventas tienda/mes</span>
                        <span className="font-bold text-[var(--landing-text-primary)]">{formatCurrency(inputs.currentMonthlyStoreSales)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20000000"
                        step="500000"
                        value={inputs.currentMonthlyStoreSales}
                        onChange={(e) => setInputs({ ...inputs, currentMonthlyStoreSales: Number(e.target.value) })}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--landing-border)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--landing-text-muted)]"
                      />
                    </div>

                    {/* Monthly Supply Spend */}
                    <div>
                      <label className="mb-2 flex items-center justify-between text-sm text-[var(--landing-text-secondary)]">
                        <span>Gasto insumos/mes</span>
                        <span className="font-bold text-[var(--landing-text-primary)]">{formatCurrency(inputs.monthlySupplySpend)}</span>
                      </label>
                      <input
                        type="range"
                        min="500000"
                        max="10000000"
                        step="250000"
                        value={inputs.monthlySupplySpend}
                        onChange={(e) => setInputs({ ...inputs, monthlySupplySpend: Number(e.target.value) })}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--landing-border)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--landing-text-muted)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Plan Selector */}
              <div className="mt-6">
                <label className="mb-3 block text-sm text-[var(--landing-text-secondary)]">
                  Plan {!selectedPlanId && <span className="text-xs text-[var(--landing-primary)]">(sugerido)</span>}
                </label>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                        currentPlan.id === plan.id
                          ? 'bg-[var(--landing-bg-white)]'
                          : 'border-transparent bg-[var(--landing-bg-muted)] hover:bg-[var(--landing-border-light)]'
                      }`}
                      style={{
                        borderColor: currentPlan.id === plan.id ? plan.color : 'transparent',
                      }}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                      >
                        {plan.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--landing-text-primary)]">{plan.name}</span>
                          {plan.showAds && (
                            <span title="Con anuncios">
                              <Megaphone className="h-3 w-3 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--landing-text-muted)]">
                          {plan.isCustomPricing ? 'Personalizado' : plan.monthlyCost === 0 ? 'Gratis' : `${formatCurrency(plan.monthlyCost)}/mes`}
                        </div>
                      </div>
                      {currentPlan.id === plan.id && suggestedPlan.id === plan.id && !selectedPlanId && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-bold"
                          style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                        >
                          Ideal
                        </span>
                      )}
                      {currentPlan.id === plan.id && (
                        <Check className="h-4 w-4" style={{ color: plan.color }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ============ RESULTS PANEL ============ */}
            <div className="lg:col-span-8">
              {/* Main Results Card */}
              <div
                className="rounded-2xl border-2 bg-[var(--landing-bg)] p-6"
                style={{ borderColor: `${currentPlan.color}30` }}
              >
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-[var(--landing-text-primary)]">
                  <BarChart3 className="h-5 w-5" style={{ color: currentPlan.color }} />
                  Resultados con Plan {currentPlan.name}
                </h3>

                {/* Summary Metrics Row - Focus on COSTS (what we CAN guarantee) */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-[var(--landing-bg-white)] border border-[var(--landing-border)] p-4">
                    <div className="text-2xl font-black text-[var(--landing-text-primary)] md:text-3xl">
                      {currentPlan.isCustomPricing
                        ? 'Personalizado'
                        : billingPeriod === 'yearly'
                          ? formatCurrency(Math.round(calculations.subscriptionCost * (1 - discounts.annual)))
                          : formatCurrency(calculations.subscriptionCost)}
                    </div>
                    <div className="text-sm text-[var(--landing-text-muted)]">
                      Suscripcion/mes
                      {billingPeriod === 'yearly' && !currentPlan.isCustomPricing && currentPlan.monthlyCost > 0 && (
                        <span className="ml-1 text-green-600">(-{Math.round(discounts.annual * 100)}%)</span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[var(--landing-bg-white)] border border-[var(--landing-border)] p-4">
                    <div className="text-2xl font-black text-[var(--landing-text-primary)] md:text-3xl">
                      {currentPlan.hasEcommerce ? `${(calculations.currentCommissionRate * 100).toFixed(0)}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-[var(--landing-text-muted)]">Comision tienda</div>
                  </div>
                  <div className="rounded-xl bg-[var(--landing-bg-white)] border border-[var(--landing-border)] p-4">
                    <div className="text-2xl font-black text-[var(--landing-text-primary)] md:text-3xl">
                      {currentPlan.isCustomPricing
                        ? 'Contactar'
                        : billingPeriod === 'yearly'
                          ? formatCurrency(calculations.annualPrice + (calculations.ecommerceCommission * 12))
                          : formatCurrency(calculations.yearlyVeticCosts)}
                    </div>
                    <div className="text-sm text-[var(--landing-text-muted)]">
                      Total anual
                      {billingPeriod === 'yearly' && !currentPlan.isCustomPricing && currentPlan.monthlyCost > 0 && (
                        <span className="ml-1 text-green-600">(ahorrás {formatCurrency(calculations.annualSavings)})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Detailed Breakdown */}
                <button
                  onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                  className="mb-4 flex w-full items-center justify-between rounded-lg bg-[var(--landing-bg-muted)] px-4 py-3 text-sm font-medium text-[var(--landing-text-primary)] transition-colors hover:bg-[var(--landing-border)]"
                >
                  <span className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Ver desglose completo
                  </span>
                  {showDetailedBreakdown ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showDetailedBreakdown && (
                  <div className="space-y-6">
                    {/* ============ POTENTIAL BENEFITS (with disclaimer) ============ */}
                    <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-white)] p-4">
                      <h4 className="mb-2 flex items-center gap-2 font-bold text-[var(--landing-text-primary)]">
                        <PlusCircle className="h-5 w-5 text-[var(--landing-text-muted)]" />
                        Beneficios potenciales (estimados)
                      </h4>
                      <p className="mb-4 text-xs text-[var(--landing-text-light)]">
                        Estos son estimados conservadores. Los resultados reales dependen de tu clinica.
                      </p>
                      <div className="space-y-3">
                        {calculations.revenueBreakdown.map((item, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between rounded-lg p-3 ${
                              item.isAvailable ? 'bg-[var(--landing-bg-muted)]' : 'bg-[var(--landing-bg)] opacity-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  item.isAvailable ? 'bg-[var(--landing-primary-light)] text-[var(--landing-primary)]' : 'bg-[var(--landing-border)] text-[var(--landing-text-light)]'
                                }`}
                              >
                                {item.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-[var(--landing-text-primary)]">
                                  {item.label}
                                  {!item.isAvailable && item.planRequired && (
                                    <span className="rounded-full bg-[var(--landing-border)] px-2 py-0.5 text-xs text-[var(--landing-text-light)]">
                                      Plan {item.planRequired}+
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[var(--landing-text-muted)]">{item.description}</div>
                              </div>
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                item.isAvailable ? 'text-[var(--landing-text-primary)]' : 'text-[var(--landing-text-light)]'
                              }`}
                            >
                              ~{formatCurrency(item.amount)}
                            </div>
                          </div>
                        ))}

                        {/* Total - with disclaimer */}
                        {calculations.totalGrossBenefit > 0 && (
                          <div className="mt-2 flex items-center justify-between border-t border-[var(--landing-border)] pt-3">
                            <span className="font-bold text-[var(--landing-text-secondary)]">Potencial estimado/mes</span>
                            <span className="text-lg font-bold text-[var(--landing-text-secondary)]">
                              ~{formatCurrency(calculations.totalGrossBenefit)}
                            </span>
                          </div>
                        )}
                        {calculations.totalGrossBenefit === 0 && (
                          <div className="mt-2 rounded-lg bg-[var(--landing-bg-muted)] p-3 text-center text-sm text-[var(--landing-text-muted)]">
                            Los beneficios medibles (como recordatorios) requieren Plan Profesional o superior.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ============ COST BREAKDOWN ============ */}
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <h4 className="mb-4 flex items-center gap-2 font-bold text-red-600">
                        <MinusCircle className="h-5 w-5" />
                        Lo que nos pagas a nosotros
                      </h4>
                      <div className="space-y-3">
                        {calculations.costBreakdown.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-white p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                {item.type === 'subscription' && <Receipt className="h-4 w-4" />}
                                {item.type === 'commission' && <Percent className="h-4 w-4" />}
                                {item.type === 'markup' && <Package className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[var(--landing-text-primary)]">{item.label}</div>
                                <div className="text-xs text-[var(--landing-text-muted)]">{item.description}</div>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-red-600">
                              -{formatCurrency(item.amount)}
                            </div>
                          </div>
                        ))}

                        {/* Commission Timeline */}
                        {currentPlan.hasEcommerce && (
                          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-800">
                                Cronograma de Comisiones
                              </span>
                            </div>
                            <div className="space-y-2">
                              {/* Timeline visual */}
                              <div className="flex items-center gap-2 text-xs">
                                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
                                  inputs.monthsOnPlatform < commissionConfig.monthsUntilIncrease
                                    ? 'bg-green-100 text-green-700 font-bold ring-2 ring-green-300'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  <span>Meses 1-6:</span>
                                  <span>{Math.round(commissionConfig.initialRate * 100)}%</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-amber-400" />
                                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
                                  inputs.monthsOnPlatform >= commissionConfig.monthsUntilIncrease
                                    ? 'bg-amber-100 text-amber-700 font-bold ring-2 ring-amber-300'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                  <span>Mes 7+:</span>
                                  <span>{Math.round(commissionConfig.standardRate * 100)}%</span>
                                </div>
                              </div>

                              {/* Cost comparison */}
                              <div className="text-xs text-amber-700 mt-2">
                                {inputs.monthsOnPlatform < commissionConfig.monthsUntilIncrease ? (
                                  <div className="flex flex-col gap-1">
                                    <span>
                                      <span className="font-bold text-green-700">Ahora ({Math.round(commissionConfig.initialRate * 100)}%):</span>
                                      {' '}-{formatCurrency(inputs.currentMonthlyStoreSales * commissionConfig.initialRate)}/mes
                                    </span>
                                    <span>
                                      <span className="font-bold text-amber-700">Despues de 6 meses ({Math.round(commissionConfig.standardRate * 100)}%):</span>
                                      {' '}-{formatCurrency(inputs.currentMonthlyStoreSales * commissionConfig.standardRate)}/mes
                                    </span>
                                    <span className="text-amber-600 italic">
                                      Aumento de {formatCurrency(inputs.currentMonthlyStoreSales * (commissionConfig.standardRate - commissionConfig.initialRate))}/mes
                                    </span>
                                  </div>
                                ) : (
                                  <span>
                                    Tarifa estandar del {Math.round(commissionConfig.standardRate * 100)}% sobre ventas de tienda online.
                                  </span>
                                )}
                              </div>

                              {/* Clarification */}
                              <p className="text-[10px] text-amber-600 mt-2 pt-2 border-t border-amber-200">
                                La comision aplica solo a ventas de la tienda online, no a consultas ni servicios veterinarios.
                              </p>
                            </div>
                          </div>
                        )}


                        {/* Total Costs */}
                        <div className="mt-2 flex items-center justify-between border-t border-red-200 pt-3">
                          <span className="font-bold text-[var(--landing-text-primary)]">Total costos {brandConfig.name}</span>
                          <span className="text-xl font-black text-red-600">
                            -{formatCurrency(calculations.totalVeticCosts)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ============ WHAT YOU GET ============ */}
                    <div
                      className="rounded-xl border-2 p-4"
                      style={{
                        borderColor: `${currentPlan.color}40`,
                        backgroundColor: `${currentPlan.color}10`,
                      }}
                    >
                      <h4 className="mb-4 flex items-center gap-2 font-bold text-[var(--landing-text-primary)]">
                        <Wallet className="h-5 w-5" style={{ color: currentPlan.color }} />
                        Resumen de costos
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-white/80 p-4 text-center">
                          <div className="mb-1 text-sm text-[var(--landing-text-muted)]">
                            Costo mensual {billingPeriod === 'yearly' && '(equiv.)'}
                          </div>
                          <div className="text-3xl font-black text-[var(--landing-text-primary)]">
                            {currentPlan.isCustomPricing
                              ? 'Personalizado'
                              : currentPlan.monthlyCost === 0
                                ? 'Gratis'
                                : billingPeriod === 'yearly'
                                  ? formatCurrency(Math.round(calculations.subscriptionCost * (1 - discounts.annual)) + calculations.ecommerceCommission)
                                  : formatCurrency(calculations.totalVeticCosts)}
                          </div>
                          {billingPeriod === 'yearly' && !currentPlan.isCustomPricing && currentPlan.monthlyCost > 0 && (
                            <div className="mt-1 text-xs text-[var(--landing-text-muted)] line-through">
                              {formatCurrency(calculations.totalVeticCosts)}/mes
                            </div>
                          )}
                        </div>
                        <div className="rounded-lg bg-white/80 p-4 text-center">
                          <div className="mb-1 text-sm text-[var(--landing-text-muted)]">Costo anual</div>
                          <div className="text-3xl font-black text-[var(--landing-text-primary)]">
                            {currentPlan.isCustomPricing
                              ? 'Contactar'
                              : currentPlan.monthlyCost === 0
                                ? 'Gratis'
                                : billingPeriod === 'yearly'
                                  ? formatCurrency(calculations.annualPrice + (calculations.ecommerceCommission * 12))
                                  : formatCurrency(calculations.yearlyVeticCosts)}
                          </div>
                          {billingPeriod === 'yearly' && !currentPlan.isCustomPricing && currentPlan.monthlyCost > 0 && (
                            <div className="mt-1 text-xs font-bold text-green-600">
                              Ahorrás {formatCurrency(calculations.annualSavings)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payback Period - only show when there's measurable benefit */}
                      {calculations.paybackMonths !== null && calculations.totalGrossBenefit > 0 && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-bold text-green-800">
                                Recuperacion de inversion
                              </div>
                              <div className="text-xs text-green-600">
                                Basado en beneficios estimados
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-green-700">
                                {calculations.paybackMonths < 1 ? (
                                  'Inmediato'
                                ) : calculations.paybackMonths < 12 ? (
                                  `${calculations.paybackMonths.toFixed(1)} meses`
                                ) : (
                                  `${(calculations.paybackMonths / 12).toFixed(1)} años`
                                )}
                              </div>
                              {calculations.paybackMonths <= 1 && (
                                <div className="text-xs text-green-600">
                                  Los beneficios superan el costo
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* What's included - comprehensive list */}
                      <div className="mt-4 rounded-lg bg-white/80 p-4">
                        <p className="mb-3 text-sm font-bold text-[var(--landing-text-primary)]">
                          Incluido en Plan {currentPlan.name}:
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Included features */}
                          <div className="space-y-1.5">
                            {planFeatures[currentPlan.id].included.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                                <span className="text-[var(--landing-text-secondary)]">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Not included features (if any) */}
                          {planFeatures[currentPlan.id].notIncluded.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-medium text-[var(--landing-text-muted)] mb-2">
                                Disponible en planes superiores:
                              </p>
                              {planFeatures[currentPlan.id].notIncluded.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <span className="h-4 w-4 flex-shrink-0 text-center text-[var(--landing-text-light)]">–</span>
                                  <span className="text-[var(--landing-text-light)]">{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* User limit info - Profesional has unlimited users */}
                        {currentPlan.id === 'gratis' && (
                          <div className="mt-3 pt-3 border-t border-[var(--landing-border-light)] text-xs text-[var(--landing-text-muted)]">
                            1 usuario incluido • Actualiza a Profesional para usuarios ilimitados
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upgrade Comparison - Show what Profesional offers */}
                {currentPlan.id === 'gratis' && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800">
                      <ArrowRight className="h-4 w-4" />
                      Con Plan Profesional obtienes:
                    </h4>
                    <div className="grid gap-2 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500" />
                        <span>Sin anuncios en tu sitio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500" />
                        <span>Tienda online para vender productos (3% comision)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500" />
                        <span>WhatsApp automatico - recupera citas perdidas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500" />
                        <span>Modulo de hospitalizacion y laboratorio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500" />
                        <span>Usuarios ilimitados</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-blue-600">
                      Por solo{' '}
                      <span className="font-bold">{formatCurrency(250000)}</span>{' '}
                      por mes
                    </p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="mt-4 flex items-start gap-2 text-xs text-[var(--landing-text-light)]">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Los beneficios mostrados son estimados y no estan garantizados. Los resultados
                    reales dependen de cada clinica. La comision de tienda aplica sobre todas las
                    ventas. El plan Gratis muestra anuncios.
                  </p>
                </div>

              </div>

              {/* CTA Button */}
              <div className="mt-8 text-center">
                <a
                  href={getWhatsAppUrl(
                    `Hola! Vi los precios de ${brandConfig.name}.\n\nMi clinica tiene aproximadamente ${inputs.monthlyConsultations} consultas/mes.\n\nMe interesa el Plan ${currentPlan.name}.\n\nQuiero saber mas!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${currentPlan.color}, ${currentPlan.color}CC)`,
                    boxShadow: `0 10px 40px ${currentPlan.color}30`,
                  }}
                >
                  {currentPlan.id === 'gratis' ? 'Empezar Gratis' : `Quiero el Plan ${currentPlan.name}`}
                  <ArrowRight className="h-5 w-5" />
                </a>
                {currentPlan.monthlyCost > 0 && (
                  <p className="mt-3 text-sm text-[var(--landing-text-light)]">
                    {trialConfig.freeMonths} meses gratis • Sin tarjeta de credito
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ROICalculatorDetailed
