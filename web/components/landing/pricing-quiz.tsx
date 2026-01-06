'use client'

import { useState } from 'react'
import {
  HelpCircle,
  Users,
  PawPrint,
  Building2,
  Laptop,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  MessageCircle,
  Gift,
  Zap,
  ShoppingBag,
  Stethoscope,
  Crown,
  RotateCcw,
  Megaphone,
} from 'lucide-react'
import {
  pricingTiers,
  discounts,
  trialConfig,
  roiGuarantee,
  getTierById,
  formatTierPrice,
  type TierId,
} from '@/lib/pricing/tiers'
import { brandConfig } from '@/lib/branding/config'

interface TierPoints {
  gratis: number
  basico: number
  crecimiento: number
  profesional: number
  empresarial: number
}

interface QuizQuestion {
  id: string
  question: string
  description: string
  icon: React.ReactNode
  options: {
    label: string
    value: string
    description?: string
    points: TierPoints
  }[]
}

interface RecommendedPlan {
  id: TierId
  name: string
  icon: React.ReactNode
  color: string
  monthlyPrice: number
  priceDisplay: string
  tagline: string
  reasons: string[]
  ctaMessage: string
  showAds?: boolean
  freeMonths?: number
}

const questions: QuizQuestion[] = [
  {
    id: 'patients',
    question: '¿Cuantos pacientes atienden por mes?',
    description: 'Contando consultas, vacunas, emergencias, cirugias, etc.',
    icon: <PawPrint className="h-6 w-6" />,
    options: [
      {
        label: 'Menos de 30',
        value: 'very_low',
        description: 'Clinica muy nueva o tiempo parcial',
        points: { gratis: 3, basico: 2, crecimiento: 0, profesional: 0, empresarial: 0 },
      },
      {
        label: '30 - 80',
        value: 'low',
        description: 'Clinica nueva o de bajo volumen',
        points: { gratis: 2, basico: 3, crecimiento: 1, profesional: 0, empresarial: 0 },
      },
      {
        label: '80 - 200',
        value: 'medium',
        description: 'Volumen moderado, creciendo',
        points: { gratis: 0, basico: 1, crecimiento: 3, profesional: 1, empresarial: 0 },
      },
      {
        label: '200 - 500',
        value: 'high',
        description: 'Clinica establecida',
        points: { gratis: 0, basico: 0, crecimiento: 1, profesional: 3, empresarial: 1 },
      },
      {
        label: 'Mas de 500',
        value: 'very_high',
        description: 'Alto volumen o multiples sucursales',
        points: { gratis: 0, basico: 0, crecimiento: 0, profesional: 1, empresarial: 3 },
      },
    ],
  },
  {
    id: 'staff',
    question: '¿Cuantas personas usaran el sistema?',
    description: 'Veterinarios, recepcionistas, administradores',
    icon: <Users className="h-6 w-6" />,
    options: [
      {
        label: '1 - 2 personas',
        value: 'tiny',
        description: 'Solo yo o con un asistente',
        points: { gratis: 3, basico: 2, crecimiento: 0, profesional: 0, empresarial: 0 },
      },
      {
        label: '3 - 4 personas',
        value: 'small',
        description: 'Equipo pequeno',
        points: { gratis: 1, basico: 3, crecimiento: 2, profesional: 0, empresarial: 0 },
      },
      {
        label: '5 - 8 personas',
        value: 'medium',
        description: 'Equipo mediano',
        points: { gratis: 0, basico: 0, crecimiento: 3, profesional: 2, empresarial: 0 },
      },
      {
        label: '9 - 15 personas',
        value: 'large',
        description: 'Equipo grande',
        points: { gratis: 0, basico: 0, crecimiento: 0, profesional: 3, empresarial: 1 },
      },
      {
        label: 'Mas de 15',
        value: 'enterprise',
        description: 'Equipo muy grande o multiples turnos',
        points: { gratis: 0, basico: 0, crecimiento: 0, profesional: 1, empresarial: 3 },
      },
    ],
  },
  {
    id: 'ads_tolerance',
    question: '¿Te molestaria ver anuncios en tu sitio?',
    description: 'El plan gratuito muestra anuncios para financiarse',
    icon: <Megaphone className="h-6 w-6" />,
    options: [
      {
        label: 'No me molesta',
        value: 'ok',
        description: 'Entiendo que es gratis por algo',
        points: { gratis: 3, basico: 0, crecimiento: 0, profesional: 0, empresarial: 0 },
      },
      {
        label: 'Prefiero sin anuncios',
        value: 'prefer_no',
        description: 'Quiero una experiencia mas profesional',
        points: { gratis: 0, basico: 3, crecimiento: 2, profesional: 1, empresarial: 1 },
      },
      {
        label: 'Definitivamente sin anuncios',
        value: 'no_ads',
        description: 'Mis clientes no deben ver anuncios',
        points: { gratis: 0, basico: 1, crecimiento: 2, profesional: 3, empresarial: 2 },
      },
    ],
  },
  {
    id: 'ecommerce',
    question: '¿Te interesa vender productos online?',
    description: 'Tienda integrada con comision del 3-5%',
    icon: <ShoppingBag className="h-6 w-6" />,
    options: [
      {
        label: 'No por ahora',
        value: 'no',
        description: 'Solo necesito gestion clinica',
        points: { gratis: 2, basico: 3, crecimiento: 0, profesional: 0, empresarial: 0 },
      },
      {
        label: 'Me interesa',
        value: 'interested',
        description: 'Quiero poder vender productos',
        points: { gratis: 0, basico: 0, crecimiento: 3, profesional: 2, empresarial: 1 },
      },
      {
        label: 'Es prioritario',
        value: 'priority',
        description: 'Es una parte importante de mi negocio',
        points: { gratis: 0, basico: 0, crecimiento: 2, profesional: 3, empresarial: 2 },
      },
    ],
  },
  {
    id: 'features',
    question: '¿Que modulos necesitas?',
    description: 'Algunos modulos solo estan en planes superiores',
    icon: <Stethoscope className="h-6 w-6" />,
    options: [
      {
        label: 'Lo basico',
        value: 'basic',
        description: 'Citas, fichas, vacunas',
        points: { gratis: 3, basico: 2, crecimiento: 1, profesional: 0, empresarial: 0 },
      },
      {
        label: 'Con tienda y analiticas',
        value: 'growth',
        description: 'E-commerce, reportes, QR tags',
        points: { gratis: 0, basico: 0, crecimiento: 3, profesional: 1, empresarial: 0 },
      },
      {
        label: 'Hospitalizacion y laboratorio',
        value: 'professional',
        description: 'Internacion, lab, WhatsApp API',
        points: { gratis: 0, basico: 0, crecimiento: 0, profesional: 3, empresarial: 1 },
      },
      {
        label: 'Todo y mas',
        value: 'enterprise',
        description: 'Multi-sucursal, API, personalizaciones',
        points: { gratis: 0, basico: 0, crecimiento: 0, profesional: 0, empresarial: 3 },
      },
    ],
  },
  {
    id: 'priority',
    question: '¿Que es lo mas importante para vos?',
    description: 'Tu prioridad principal ahora',
    icon: <Building2 className="h-6 w-6" />,
    options: [
      {
        label: 'Empezar gratis',
        value: 'free',
        description: 'Probar sin compromiso',
        points: { gratis: 3, basico: 1, crecimiento: 0, profesional: 0, empresarial: 0 },
      },
      {
        label: 'Bajo costo sin anuncios',
        value: 'budget',
        description: 'Economico pero profesional',
        points: { gratis: 0, basico: 3, crecimiento: 1, profesional: 0, empresarial: 0 },
      },
      {
        label: 'Crecer y vender mas',
        value: 'growth',
        description: 'Tienda, compras grupales',
        points: { gratis: 0, basico: 0, crecimiento: 3, profesional: 1, empresarial: 0 },
      },
      {
        label: 'Funcionalidades completas',
        value: 'features',
        description: 'Todas las herramientas clinicas',
        points: { gratis: 0, basico: 0, crecimiento: 0, profesional: 3, empresarial: 1 },
      },
      {
        label: 'Solucion empresarial',
        value: 'enterprise',
        description: 'A medida para mi cadena',
        points: { gratis: 0, basico: 0, crecimiento: 0, profesional: 0, empresarial: 3 },
      },
    ],
  },
]

const plans: Record<TierId, RecommendedPlan> = {
  gratis: {
    id: 'gratis',
    name: 'Plan Gratis',
    icon: <Gift className="h-8 w-8" />,
    color: '#94A3B8',
    monthlyPrice: 0,
    priceDisplay: 'Gratis',
    tagline: 'Empieza sin pagar nada',
    showAds: true,
    freeMonths: 0,
    reasons: [
      'Sitio web profesional para tu clinica',
      'Portal de mascotas para tus clientes',
      'Citas, fichas medicas y vacunas incluidas',
      'Muestra anuncios - asi se financia',
      'Podes subir a un plan pago cuando quieras',
    ],
    ctaMessage: `Hola! Hice el quiz de ${brandConfig.name} y quiero empezar con el Plan Gratis. Me pueden ayudar?`,
  },
  basico: {
    id: 'basico',
    name: 'Plan Basico',
    icon: <Zap className="h-8 w-8" />,
    color: '#60A5FA',
    monthlyPrice: 100000,
    priceDisplay: 'Gs 100.000',
    tagline: 'Sin anuncios, experiencia profesional',
    freeMonths: trialConfig.freeMonths,
    reasons: [
      'Sin anuncios - imagen profesional',
      'Incluye 3 usuarios (Gs 30.000/extra)',
      'Soporte por email (48 horas)',
      'Todas las funciones clinicas basicas',
      'Ideal para clinicas pequenas',
    ],
    ctaMessage: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Basico. Me gustaria saber mas!`,
  },
  crecimiento: {
    id: 'crecimiento',
    name: 'Plan Crecimiento',
    icon: <ShoppingBag className="h-8 w-8" />,
    color: '#2DCEA3',
    monthlyPrice: 200000,
    priceDisplay: 'Gs 200.000',
    tagline: 'El favorito - vende y crece',
    freeMonths: trialConfig.freeMonths,
    reasons: [
      'Tienda online integrada (3% comision)',
      'Acceso a compras grupales con descuentos',
      'Incluye 5 usuarios (Gs 40.000/extra)',
      'Analiticas basicas de tu negocio',
      'Soporte por email (24 horas)',
    ],
    ctaMessage: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Crecimiento. Me gustaria saber mas!`,
  },
  profesional: {
    id: 'profesional',
    name: 'Plan Profesional',
    icon: <Stethoscope className="h-8 w-8" />,
    color: '#5C6BFF',
    monthlyPrice: 400000,
    priceDisplay: 'Gs 400.000',
    tagline: 'Para clinicas completas',
    freeMonths: trialConfig.freeMonths,
    reasons: [
      'Modulo de hospitalizacion e internacion',
      'Laboratorio con resultados y paneles',
      'WhatsApp Business API integrado',
      'Incluye 10 usuarios (Gs 50.000/extra)',
      'Soporte prioritario por WhatsApp (12 hrs)',
    ],
    ctaMessage: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Profesional. Me gustaria saber mas!`,
  },
  empresarial: {
    id: 'empresarial',
    name: 'Plan Empresarial',
    icon: <Crown className="h-8 w-8" />,
    color: '#F59E0B',
    monthlyPrice: 0,
    priceDisplay: 'Personalizado',
    tagline: 'Solucion a medida para cadenas',
    freeMonths: 0,
    reasons: [
      'Multiples sucursales en una cuenta',
      'API para integraciones personalizadas',
      'Analiticas avanzadas con IA',
      'SLA garantizado con soporte 24/7',
      'Account manager dedicado',
    ],
    ctaMessage: `Hola! Hice el quiz de ${brandConfig.name} y me recomendaron el Plan Empresarial. Tengo una cadena de clinicas y me gustaria una reunion.`,
  },
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY').format(price)
}

export function PricingQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setShowResult(true)
      }
    }, 300)
  }

  const calculateRecommendation = (): TierId => {
    const scores: TierPoints = {
      gratis: 0,
      basico: 0,
      crecimiento: 0,
      profesional: 0,
      empresarial: 0,
    }

    questions.forEach((question) => {
      const answer = answers[question.id]
      if (answer) {
        const option = question.options.find((o) => o.value === answer)
        if (option) {
          scores.gratis += option.points.gratis
          scores.basico += option.points.basico
          scores.crecimiento += option.points.crecimiento
          scores.profesional += option.points.profesional
          scores.empresarial += option.points.empresarial
        }
      }
    })

    // Find highest score
    let maxScore = 0
    let recommended: TierId = 'crecimiento' // Default to popular tier

    const tierOrder: TierId[] = ['gratis', 'basico', 'crecimiento', 'profesional', 'empresarial']
    tierOrder.forEach((tier) => {
      if (scores[tier] > maxScore) {
        maxScore = scores[tier]
        recommended = tier
      }
    })

    return recommended
  }

  const resetQuiz = () => {
    setCurrentStep(0)
    setAnswers({})
    setShowResult(false)
  }

  const recommendedPlanId = calculateRecommendation()
  const recommendedPlan = plans[recommendedPlanId]

  if (showResult) {
    return (
      <section id="quiz" className="relative overflow-hidden bg-[#0F172A] py-20 md:py-28">
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
          style={{ backgroundColor: `${recommendedPlan.color}10` }}
        />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            {/* Result Card */}
            <div
              className="rounded-3xl border-2 bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-10"
              style={{ borderColor: `${recommendedPlan.color}50` }}
            >
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-[#2DCEA3]" />
                  <span className="text-sm text-white/70">Tu plan recomendado</span>
                </div>

                <div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `${recommendedPlan.color}20`,
                    color: recommendedPlan.color,
                  }}
                >
                  {recommendedPlan.icon}
                </div>

                <h2 className="mb-2 text-3xl font-black text-white md:text-4xl">
                  {recommendedPlan.name}
                </h2>
                <p className="text-white/60">{recommendedPlan.tagline}</p>
              </div>

              {/* Pricing */}
              <div
                className="mb-8 rounded-2xl p-6"
                style={{ backgroundColor: `${recommendedPlan.color}15` }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-white/70">Precio mensual</span>
                  <div>
                    <span className="text-3xl font-black" style={{ color: recommendedPlan.color }}>
                      {recommendedPlan.priceDisplay}
                    </span>
                    {recommendedPlan.monthlyPrice > 0 && (
                      <span className="text-white/50">/mes</span>
                    )}
                  </div>
                </div>

                {/* Annual discount callout */}
                {recommendedPlan.monthlyPrice > 0 && (
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-white/70">Plan anual</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-white">
                        Gs {formatPrice(Math.round(recommendedPlan.monthlyPrice * (1 - discounts.annual)))}
                      </span>
                      <span className="text-white/50">/mes</span>
                      <span className="ml-2 rounded-full bg-[#2DCEA3]/20 px-2 py-0.5 text-xs font-bold text-[#2DCEA3]">
                        -{Math.round(discounts.annual * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* 2026 Promotion info */}
                {recommendedPlan.freeMonths && recommendedPlan.freeMonths > 0 && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-white/5 p-3">
                    <Gift className="h-4 w-4 text-[#2DCEA3]" />
                    <span className="text-sm text-white/70">
                      {recommendedPlan.freeMonths} meses GRATIS - Se cobra a partir del {trialConfig.chargesStartMonth}er mes
                    </span>
                  </div>
                )}

                {/* Ads warning for free tier */}
                {recommendedPlan.showAds && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 p-3">
                    <Megaphone className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-amber-300">
                      Este plan muestra anuncios en tu sitio
                    </span>
                  </div>
                )}
              </div>

              {/* Reasons */}
              <div className="mb-8">
                <h3 className="mb-4 font-bold text-white">Por que te lo recomendamos:</h3>
                <div className="space-y-3">
                  {recommendedPlan.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        style={{ color: recommendedPlan.color }}
                      />
                      <span className="text-white/70">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI Guarantee for paid plans */}
              {recommendedPlan.monthlyPrice > 0 && recommendedPlan.id !== 'empresarial' && (
                <div className="mb-8 rounded-xl border border-[#2DCEA3]/30 bg-[#2DCEA3]/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2DCEA3]/20">
                      <Sparkles className="h-5 w-5 text-[#2DCEA3]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Garantia de ROI</h4>
                      <p className="text-sm text-white/60">
                        Si no conseguis al menos{' '}
                        <span className="font-bold text-[#2DCEA3]">
                          {Math.ceil(recommendedPlan.monthlyPrice / roiGuarantee.averageClientValue)} clientes nuevos
                        </span>{' '}
                        en {roiGuarantee.evaluationMonths} meses, los proximos {roiGuarantee.freeMonthsIfFailed} meses son gratis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/595981324569?text=${encodeURIComponent(recommendedPlan.ctaMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-bold text-[#0F172A] transition-all hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${recommendedPlan.color}, ${recommendedPlan.color}CC)`,
                    boxShadow: `0 10px 40px ${recommendedPlan.color}30`,
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  {recommendedPlan.id === 'gratis' ? 'Empezar gratis' : 'Quiero este plan'}
                </a>

                <button
                  onClick={resetQuiz}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white/70 transition-colors hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Volver a hacer el quiz
                </button>
              </div>
            </div>

            {/* See all plans link */}
            <div className="mt-6 text-center">
              <a
                href="#precios"
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                Ver todos los planes →
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="quiz" className="relative overflow-hidden bg-[#0F172A] py-20 md:py-28">
      {/* Background */}
      <div className="absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full bg-[#5C6BFF]/10 blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 h-[300px] w-[300px] rounded-full bg-[#2DCEA3]/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#5C6BFF]/20 bg-[#5C6BFF]/10 px-4 py-2">
            <HelpCircle className="h-4 w-4 text-[#5C6BFF]" />
            <span className="text-sm font-medium text-[#5C6BFF]">
              Quiz de {questions.length} preguntas
            </span>
          </div>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            ¿Que plan te conviene?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Responde estas preguntas y te recomendamos el plan perfecto para tu clinica.
            Desde gratis hasta empresarial.
          </p>
        </div>

        {/* Quiz Card */}
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            {/* Progress */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-sm text-white/50">
                <span>
                  Pregunta {currentStep + 1} de {questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#5C6BFF] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2DCEA3]/10 text-[#2DCEA3]">
                  {currentQuestion.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentQuestion.question}</h3>
                  <p className="text-sm text-white/50">{currentQuestion.description}</p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="mb-8 space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-[#2DCEA3] bg-[#2DCEA3]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">{option.label}</span>
                      {option.description && (
                        <p className="mt-1 text-sm text-white/50">{option.description}</p>
                      )}
                    </div>
                    {answers[currentQuestion.id] === option.value && (
                      <Check className="h-5 w-5 text-[#2DCEA3]" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  currentStep === 0
                    ? 'cursor-not-allowed text-white/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </button>

              {answers[currentQuestion.id] && currentStep < questions.length - 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2DCEA3] px-6 py-2 font-bold text-[#0F172A] transition-colors hover:bg-[#2DCEA3]/90"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {answers[currentQuestion.id] && currentStep === questions.length - 1 && (
                <button
                  onClick={() => setShowResult(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#5C6BFF] px-6 py-2 font-bold text-[#0F172A] transition-all hover:shadow-lg"
                >
                  Ver mi recomendacion
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Skip quiz link */}
          <div className="mt-6 text-center">
            <a
              href="#precios"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Prefiero ver todos los planes directamente →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
