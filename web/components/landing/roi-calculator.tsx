'use client'

import { useState, useMemo } from 'react'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sparkles,
  Gift,
  Zap,
  ShoppingBag,
  Stethoscope,
  Crown,
  Check,
  Info,
  Megaphone,
} from 'lucide-react'
import {
  discounts,
  trialConfig,
  type TierId,
} from '@/lib/pricing/tiers'
import { brandConfig } from '@/lib/branding/config'

interface PlanConfig {
  id: TierId
  name: string
  icon: React.ReactNode
  color: string
  monthlyCost: number
  expectedGrowthPercent: number
  targetPatientsMin: number
  targetPatientsMax: number
  includedUsers: number
  hasEcommerce: boolean
  hasBulkOrdering: boolean
  showAds: boolean
}

// NOTE: Growth percentages set to 0 to match detailed calculator's conservative approach
// We don't promise growth - only show what we can actually deliver
const plans: PlanConfig[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    icon: <Gift className="h-5 w-5" />,
    color: '#94A3B8',
    monthlyCost: 0,
    expectedGrowthPercent: 0, // Conservative - no promises
    targetPatientsMin: 0,
    targetPatientsMax: 30,
    includedUsers: Infinity,
    hasEcommerce: false,
    hasBulkOrdering: false,
    showAds: true,
  },
  {
    id: 'basico',
    name: 'Basico',
    icon: <Zap className="h-5 w-5" />,
    color: '#60A5FA',
    monthlyCost: 100000,
    expectedGrowthPercent: 0, // Conservative - no promises
    targetPatientsMin: 30,
    targetPatientsMax: 80,
    includedUsers: 3,
    hasEcommerce: false,
    hasBulkOrdering: false,
    showAds: false,
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    icon: <ShoppingBag className="h-5 w-5" />,
    color: '#2DCEA3',
    monthlyCost: 200000,
    expectedGrowthPercent: 0, // Conservative - no promises
    targetPatientsMin: 80,
    targetPatientsMax: 200,
    includedUsers: 5,
    hasEcommerce: true,
    hasBulkOrdering: false, // Not launched yet
    showAds: false,
  },
  {
    id: 'profesional',
    name: 'Profesional',
    icon: <Stethoscope className="h-5 w-5" />,
    color: '#5C6BFF',
    monthlyCost: 400000,
    expectedGrowthPercent: 0, // Conservative - no promises
    targetPatientsMin: 200,
    targetPatientsMax: 500,
    includedUsers: 10,
    hasEcommerce: true,
    hasBulkOrdering: false, // Not launched yet
    showAds: false,
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    icon: <Crown className="h-5 w-5" />,
    color: '#F59E0B',
    monthlyCost: 0, // Custom pricing - negotiated per client
    expectedGrowthPercent: 0, // Conservative - no promises
    targetPatientsMin: 500,
    targetPatientsMax: 2000,
    includedUsers: 20,
    hasEcommerce: true,
    hasBulkOrdering: false, // Not launched yet
    showAds: false,
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `Gs ${(value / 1000000).toFixed(1)}M`
  }
  return `Gs ${new Intl.NumberFormat('es-PY').format(value)}`
}

function formatCurrencyShort(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toString()
}

export function ROICalculator() {
  const [monthlyConsultations, setMonthlyConsultations] = useState(80)
  const [avgConsultationPrice, setAvgConsultationPrice] = useState(150000)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  // Auto-suggest plan based on patient count
  const suggestedPlan = useMemo(() => {
    return (
      plans.find(
        (p) =>
          monthlyConsultations >= p.targetPatientsMin && monthlyConsultations < p.targetPatientsMax
      ) || plans[2]
    ) // Default to Crecimiento
  }, [monthlyConsultations])

  const currentPlan = selectedPlanId
    ? plans.find((p) => p.id === selectedPlanId) || suggestedPlan
    : suggestedPlan

  const calculations = useMemo(() => {
    const { monthlyCost, expectedGrowthPercent } = currentPlan

    // New clients per month from having online presence
    const newClientsPerMonth = Math.round(monthlyConsultations * expectedGrowthPercent)

    // Additional revenue per month
    const additionalRevenuePerMonth = newClientsPerMonth * avgConsultationPrice

    // Net monthly benefit
    const netMonthlyBenefit = additionalRevenuePerMonth - monthlyCost

    // First year calculations (no setup costs in new model)
    const yearlyAdditionalRevenue = additionalRevenuePerMonth * 12
    const yearlyVeticCost = monthlyCost * 12
    const yearlyNetProfit = yearlyAdditionalRevenue - yearlyVeticCost
    const yearlyROI = yearlyVeticCost > 0 ? (yearlyNetProfit / yearlyVeticCost) * 100 : Infinity

    // Break-even clients needed per month
    const breakEvenClients = monthlyCost > 0 ? Math.ceil(monthlyCost / avgConsultationPrice) : 0

    // Months to recover (no setup cost, just see when monthly benefit > cost)
    const monthsToRecover = netMonthlyBenefit > 0 ? 1 : 999

    // With annual discount
    const annualPrice = monthlyCost * 12 * (1 - discounts.annual)
    const annualSavings = (monthlyCost * 12) - annualPrice

    return {
      newClientsPerMonth,
      additionalRevenuePerMonth,
      netMonthlyBenefit,
      monthsToRecover,
      yearlyROI: yearlyROI === Infinity ? 999 : Math.round(yearlyROI),
      breakEvenClients,
      yearlyNetProfit,
      yearlyVeticCost,
      annualPrice,
      annualSavings,
    }
  }, [monthlyConsultations, avgConsultationPrice, currentPlan])

  return (
    <section
      id="calculadora"
      className="relative overflow-hidden bg-[var(--bg-dark)] py-20 md:py-28"
    >
      {/* Background */}
      <div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] transition-colors duration-500"
        style={{ backgroundColor: `${currentPlan.color}08` }}
      />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="bg-[var(--primary)]/10 border-[var(--primary)]/20 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2">
            <Calculator className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--primary)]">Calculadora de ROI</span>
          </div>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            ¿Vale la pena la inversion?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Ingresa los datos de tu clinica y descubri cuanto podes ganar.
            <strong className="text-[var(--primary)]"> Con garantia de resultados.</strong>
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Input Panel */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-1">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <DollarSign className="h-5 w-5 text-[var(--primary)]" />
                Tu Clinica
              </h3>

              {/* Monthly Consultations */}
              <div className="mb-6">
                <label className="mb-2 block text-sm text-white/70">Pacientes mensuales</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="600"
                    step="5"
                    value={monthlyConsultations}
                    onChange={(e) => {
                      setMonthlyConsultations(Number(e.target.value))
                      setSelectedPlanId(null) // Reset to auto-suggest
                    }}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
                  />
                  <div className="w-16 text-center">
                    <span className="text-xl font-bold text-white">{monthlyConsultations}</span>
                  </div>
                </div>
              </div>

              {/* Average Price */}
              <div className="mb-6">
                <label className="mb-2 block text-sm text-white/70">Precio promedio consulta</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50000"
                    max="400000"
                    step="10000"
                    value={avgConsultationPrice}
                    onChange={(e) => setAvgConsultationPrice(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
                  />
                  <div className="w-20 text-center">
                    <span className="text-lg font-bold text-white">
                      {formatCurrencyShort(avgConsultationPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Selector */}
              <div>
                <label className="mb-3 block text-sm text-white/70">
                  Plan
                  {!selectedPlanId && (
                    <span className="ml-2 text-xs text-[var(--primary)]">(auto-sugerido)</span>
                  )}
                </label>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                        currentPlan.id === plan.id
                          ? 'bg-white/10'
                          : 'border-transparent bg-white/5 hover:bg-white/[0.07]'
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
                          <span className="text-sm font-medium text-white">{plan.name}</span>
                          {plan.showAds && (
                            <span title="Muestra anuncios">
                              <Megaphone className="h-3 w-3 text-amber-400" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/40">
                          {plan.id === 'empresarial' ? 'Personalizado' : plan.monthlyCost === 0 ? 'Gratis' : `${formatCurrencyShort(plan.monthlyCost)}/mes`}
                        </div>
                      </div>
                      {currentPlan.id === plan.id &&
                        suggestedPlan.id === plan.id &&
                        !selectedPlanId && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-bold"
                            style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                          >
                            Sugerido
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

            {/* Results Panel */}
            <div
              className="rounded-2xl border-2 bg-gradient-to-br from-white/10 to-white/5 p-6 lg:col-span-2"
              style={{ borderColor: `${currentPlan.color}30` }}
            >
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <TrendingUp className="h-5 w-5" style={{ color: currentPlan.color }} />
                Resultados con Plan {currentPlan.name}
              </h3>

              {/* Free tier notice */}
              {currentPlan.id === 'gratis' && (
                <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Megaphone className="h-5 w-5 flex-shrink-0 text-amber-400" />
                    <div className="text-sm">
                      <p className="font-bold text-white">Plan Gratis con anuncios</p>
                      <p className="text-white/60">
                        El plan gratuito muestra anuncios en tu sitio web. Es una excelente forma de empezar
                        sin costo y subir a un plan pago cuando estes listo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ROI Guarantee Banner - DEPRECATED: Discontinued as of January 2026 */}
              {/* Keeping code for reference but not rendering */}

              {/* Key Metrics Grid */}
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <div
                    className="text-2xl font-black md:text-3xl"
                    style={{ color: currentPlan.color }}
                  >
                    +{calculations.newClientsPerMonth}
                  </div>
                  <div className="text-sm text-white/50">Clientes nuevos/mes</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-2xl font-black text-white md:text-3xl">
                    {formatCurrencyShort(calculations.additionalRevenuePerMonth)}
                  </div>
                  <div className="text-sm text-white/50">Ingreso extra/mes</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <div
                    className="text-2xl font-black md:text-3xl"
                    style={{
                      color: calculations.netMonthlyBenefit >= 0 ? currentPlan.color : '#EF4444'
                    }}
                  >
                    {calculations.netMonthlyBenefit >= 0 ? '+' : ''}
                    {formatCurrencyShort(calculations.netMonthlyBenefit)}
                  </div>
                  <div className="text-sm text-white/50">Ganancia neta/mes</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-2xl font-black text-white md:text-3xl">
                    {currentPlan.monthlyCost === 0 ? '0' : calculations.breakEvenClients}
                  </div>
                  <div className="text-sm text-white/50">
                    {currentPlan.monthlyCost === 0 ? 'Sin costo' : 'Clientes para empatar'}
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-white/70">Costo anual</span>
                    <span className="font-bold text-white">
                      {currentPlan.monthlyCost === 0 ? 'Gratis' : formatCurrency(calculations.yearlyVeticCost)}
                    </span>
                  </div>
                  {currentPlan.monthlyCost > 0 && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>Con plan anual: {formatCurrency(calculations.annualPrice)}</span>
                      <span className="rounded-full bg-[#2DCEA3]/20 px-2 py-0.5 text-xs font-bold text-[#2DCEA3]">
                        Ahorras {formatCurrencyShort(calculations.annualSavings)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-white/70">Ganancia año 1</span>
                    <span
                      className="font-bold"
                      style={{
                        color: calculations.yearlyNetProfit >= 0 ? currentPlan.color : '#EF4444',
                      }}
                    >
                      {calculations.yearlyNetProfit >= 0 ? '+' : ''}
                      {formatCurrency(calculations.yearlyNetProfit)}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    Despues de pagar {brandConfig.name}
                  </div>
                </div>
              </div>

              {/* ROI Highlight */}
              <div
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: `${currentPlan.color}10`,
                  borderColor: `${currentPlan.color}30`,
                }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-1 text-sm text-white/70">Retorno de inversion año 1</div>
                    <div
                      className="text-4xl font-black md:text-5xl"
                      style={{ color: currentPlan.color }}
                    >
                      {currentPlan.monthlyCost === 0 ? '∞' : (
                        <>
                          {calculations.yearlyROI > 0 ? '+' : ''}
                          {calculations.yearlyROI}%
                        </>
                      )}
                    </div>
                  </div>
                  {currentPlan.hasEcommerce && (
                    <div className="text-right">
                      <div className="mb-1 text-sm text-white/70">Tienda online</div>
                      <div className="text-lg font-bold text-white">
                        + Ingresos por ventas
                      </div>
                      <div className="text-xs text-white/40">3-5% comision</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary - Conservative messaging aligned with detailed calculator */}
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    style={{ color: currentPlan.color }}
                  />
                  <div className="text-sm">
                    <p className="mb-1 text-white">
                      Con {monthlyConsultations} pacientes/mes y el Plan {currentPlan.name}:
                    </p>
                    {currentPlan.id === 'gratis' ? (
                      <p className="text-white/60">
                        Empezas <strong className="text-[#2DCEA3]">gratis</strong> con todas las herramientas esenciales:
                        sitio web, agenda online, historiales digitales y portal para duenos.
                        El plan muestra anuncios. Cuando estes listo, podes subir a un plan pago.
                      </p>
                    ) : currentPlan.id === 'empresarial' ? (
                      <p className="text-white/60">
                        Plan personalizado para clinicas con multiples sucursales. Incluye todas las funciones, comision reducida,
                        acceso API y soporte dedicado. <strong className="text-[#F59E0B]">Contactanos para una cotizacion.</strong>
                      </p>
                    ) : (
                      <p className="text-white/60">
                        {brandConfig.name} te da presencia digital profesional por solo{' '}
                        <strong style={{ color: currentPlan.color }}>
                          {formatCurrency(currentPlan.monthlyCost)}/mes
                        </strong>.
                        Con {calculations.breakEvenClients} cliente{calculations.breakEvenClients === 1 ? '' : 's'} nuevo{calculations.breakEvenClients === 1 ? '' : 's'} al mes, se paga solo.
                        {currentPlan.hasEcommerce && (
                          <span> Incluye tienda online (comision 3-5% sobre ventas).</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2026 Promotion notice for paid plans */}
              {currentPlan.monthlyCost > 0 && currentPlan.id !== 'empresarial' && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-white/5 p-3">
                  <Gift className="h-4 w-4 text-[#2DCEA3]" />
                  <span className="text-sm text-white/70">
                    {trialConfig.freeMonths} meses GRATIS - {trialConfig.promotionDescription}
                  </span>
                </div>
              )}

              {/* Assumptions */}
              <div className="mt-4 flex items-start gap-2 text-xs text-white/40">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Crecimiento estimado basado en clinicas con presencia digital. Resultados pueden
                  variar segun ubicacion, marketing y servicios. El plan Gratis muestra anuncios.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <a
              href={`https://wa.me/595981324569?text=${encodeURIComponent(`Hola! Use la calculadora de ROI de ${brandConfig.name}. Tengo ${monthlyConsultations} pacientes/mes y me interesa el Plan ${currentPlan.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold text-[var(--bg-dark)] transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${currentPlan.color}, ${currentPlan.color}CC)`,
                boxShadow: `0 10px 40px ${currentPlan.color}30`,
              }}
            >
              {currentPlan.id === 'gratis' ? 'Empezar Gratis' : `Quiero el Plan ${currentPlan.name}`}
              <ArrowRight className="h-5 w-5" />
            </a>
            {currentPlan.monthlyCost > 0 && (
              <p className="mt-3 text-sm text-white/40">
                {trialConfig.freeMonths} meses gratis • Sin tarjeta de credito
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
