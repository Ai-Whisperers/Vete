'use client'

import { useState, useMemo } from 'react'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sparkles,
  Sprout,
  TreeDeciduous,
  Trees,
  Crown,
  Check,
  Info,
} from 'lucide-react'

interface PlanConfig {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  setupCost: number
  monthlyCost: number
  expectedGrowthPercent: number
  targetPatientsMin: number
  targetPatientsMax: number
}

const plans: PlanConfig[] = [
  {
    id: 'semilla',
    name: 'Semilla',
    icon: <Sprout className="h-5 w-5" />,
    color: '#4ADE80',
    setupCost: 700000, // Deferred but still counts for ROI
    monthlyCost: 150000,
    expectedGrowthPercent: 0.1,
    targetPatientsMin: 0,
    targetPatientsMax: 50,
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    icon: <TreeDeciduous className="h-5 w-5" />,
    color: '#2DCEA3',
    setupCost: 500000,
    monthlyCost: 200000,
    expectedGrowthPercent: 0.15,
    targetPatientsMin: 50,
    targetPatientsMax: 150,
  },
  {
    id: 'establecida',
    name: 'Establecida',
    icon: <Trees className="h-5 w-5" />,
    color: '#5C6BFF',
    setupCost: 700000,
    monthlyCost: 300000,
    expectedGrowthPercent: 0.18,
    targetPatientsMin: 150,
    targetPatientsMax: 400,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: <Crown className="h-5 w-5" />,
    color: '#F59E0B',
    setupCost: 1500000,
    monthlyCost: 500000,
    expectedGrowthPercent: 0.2,
    targetPatientsMin: 400,
    targetPatientsMax: 1000,
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
      ) || plans[1]
    ) // Default to Crecimiento
  }, [monthlyConsultations])

  const currentPlan = selectedPlanId
    ? plans.find((p) => p.id === selectedPlanId) || suggestedPlan
    : suggestedPlan

  const calculations = useMemo(() => {
    const { setupCost, monthlyCost, expectedGrowthPercent } = currentPlan

    // New clients per month from having online presence
    const newClientsPerMonth = Math.round(monthlyConsultations * expectedGrowthPercent)

    // Additional revenue per month
    const additionalRevenuePerMonth = newClientsPerMonth * avgConsultationPrice

    // Net monthly benefit
    const netMonthlyBenefit = additionalRevenuePerMonth - monthlyCost

    // Months to recover investment (including setup)
    const monthsToRecover = netMonthlyBenefit > 0 ? setupCost / netMonthlyBenefit : 999

    // First year calculations
    const yearlyAdditionalRevenue = additionalRevenuePerMonth * 12
    const yearlyVetepyCost = setupCost + monthlyCost * 12
    const yearlyNetProfit = yearlyAdditionalRevenue - yearlyVetepyCost
    const yearlyROI = yearlyVetepyCost > 0 ? (yearlyNetProfit / yearlyVetepyCost) * 100 : 0

    // Break-even clients needed per month
    const breakEvenClients = Math.ceil(monthlyCost / avgConsultationPrice)

    // Second year (no setup cost)
    const secondYearProfit = yearlyAdditionalRevenue - monthlyCost * 12

    return {
      newClientsPerMonth,
      additionalRevenuePerMonth,
      netMonthlyBenefit,
      monthsToRecover: Math.max(1, Math.round(monthsToRecover * 10) / 10),
      yearlyROI: Math.round(yearlyROI),
      breakEvenClients,
      yearlyNetProfit,
      secondYearProfit,
      yearlyVetepyCost,
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
            Ingresa los datos de tu clinica y descubri cuanto podes ganar con el plan adecuado para
            vos.
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
                    max="500"
                    step="5"
                    value={monthlyConsultations}
                    onChange={(e) => {
                      setMonthlyConsultations(Number(e.target.value))
                      setSelectedPlanId(null) // Reset to auto-suggest
                    }}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                    style={{
                      // @ts-ignore
                      '--tw-slider-thumb-bg': currentPlan.color,
                    }}
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
                        <div className="text-sm font-medium text-white">{plan.name}</div>
                        <div className="text-xs text-white/40">
                          {formatCurrencyShort(plan.monthlyCost)}/mes
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
                    style={{ color: currentPlan.color }}
                  >
                    {calculations.monthsToRecover}
                  </div>
                  <div className="text-sm text-white/50">Meses para recuperar</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-2xl font-black text-white md:text-3xl">
                    {calculations.breakEvenClients}
                  </div>
                  <div className="text-sm text-white/50">Clientes para empatar</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-white/70">Inversion primer año</span>
                    <span className="font-bold text-white">
                      {formatCurrency(calculations.yearlyVetepyCost)}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    Setup {formatCurrencyShort(currentPlan.setupCost)} + 12 x{' '}
                    {formatCurrencyShort(currentPlan.monthlyCost)}
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-white/70">Ganancia año 1</span>
                    <span
                      className="font-bold"
                      style={{
                        color: calculations.yearlyNetProfit > 0 ? currentPlan.color : '#EF4444',
                      }}
                    >
                      {calculations.yearlyNetProfit > 0 ? '+' : ''}
                      {formatCurrency(calculations.yearlyNetProfit)}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">Despues de pagar VetePy</div>
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
                      {calculations.yearlyROI > 0 ? '+' : ''}
                      {calculations.yearlyROI}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1 text-sm text-white/70">Año 2 (sin setup)</div>
                    <div className="text-2xl font-bold text-white">
                      +{formatCurrency(calculations.secondYearProfit)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
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
                    <p className="text-white/60">
                      VetePy se paga solo con{' '}
                      <strong style={{ color: currentPlan.color }}>
                        {calculations.breakEvenClients} clientes nuevos
                      </strong>{' '}
                      al mes. Con el crecimiento estimado de{' '}
                      {Math.round(currentPlan.expectedGrowthPercent * 100)}%, vas a ganar{' '}
                      <strong className="text-white">
                        +{formatCurrency(calculations.netMonthlyBenefit)}/mes
                      </strong>{' '}
                      extra.
                    </p>
                  </div>
                </div>
              </div>

              {/* Assumptions */}
              <div className="mt-4 flex items-start gap-2 text-xs text-white/40">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Crecimiento estimado basado en clinicas con presencia digital. Resultados pueden
                  variar segun ubicacion, marketing y servicios.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <a
              href={`https://wa.me/595981324569?text=${encodeURIComponent(`Hola! Use la calculadora de ROI de VetePy. Tengo ${monthlyConsultations} pacientes/mes y me interesa el Plan ${currentPlan.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold text-[var(--bg-dark)] transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${currentPlan.color}, ${currentPlan.color}CC)`,
                boxShadow: `0 10px 40px ${currentPlan.color}30`,
              }}
            >
              Quiero el Plan {currentPlan.name}
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
