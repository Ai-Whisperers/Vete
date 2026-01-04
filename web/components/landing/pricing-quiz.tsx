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
  Sprout,
  TreeDeciduous,
  Trees,
  Crown,
  RotateCcw,
} from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  description: string
  icon: React.ReactNode
  options: {
    label: string
    value: string
    description?: string
    points: {
      semilla: number
      crecimiento: number
      establecida: number
      premium: number
    }
  }[]
}

interface RecommendedPlan {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  monthlyPrice: number
  setupPrice: string
  tagline: string
  reasons: string[]
  ctaMessage: string
}

const questions: QuizQuestion[] = [
  {
    id: 'patients',
    question: '¿Cuantos pacientes atienden por mes?',
    description: 'Contando consultas, vacunas, emergencias, cirugias, etc.',
    icon: <PawPrint className="h-6 w-6" />,
    options: [
      {
        label: 'Menos de 50',
        value: 'low',
        description: 'Clinica nueva o de bajo volumen',
        points: { semilla: 3, crecimiento: 1, establecida: 0, premium: 0 },
      },
      {
        label: '50 - 150',
        value: 'medium',
        description: 'Volumen moderado, creciendo',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 },
      },
      {
        label: '150 - 400',
        value: 'high',
        description: 'Clinica establecida',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 },
      },
      {
        label: 'Mas de 400',
        value: 'very_high',
        description: 'Alto volumen o multiples sucursales',
        points: { semilla: 0, crecimiento: 0, establecida: 1, premium: 3 },
      },
    ],
  },
  {
    id: 'staff',
    question: '¿Cuantos veterinarios trabajan en la clinica?',
    description: 'Incluyendo veterinarios a tiempo parcial',
    icon: <Users className="h-6 w-6" />,
    options: [
      {
        label: '1 - 2 veterinarios',
        value: 'small',
        description: 'Equipo pequeno',
        points: { semilla: 3, crecimiento: 1, establecida: 0, premium: 0 },
      },
      {
        label: '3 - 4 veterinarios',
        value: 'medium',
        description: 'Equipo mediano',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 },
      },
      {
        label: '5 - 8 veterinarios',
        value: 'large',
        description: 'Equipo grande',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 },
      },
      {
        label: 'Mas de 8',
        value: 'enterprise',
        description: 'Equipo muy grande o multiples turnos',
        points: { semilla: 0, crecimiento: 0, establecida: 1, premium: 3 },
      },
    ],
  },
  {
    id: 'current_system',
    question: '¿Que sistema usan actualmente?',
    description: 'Como manejan los registros de pacientes hoy',
    icon: <Laptop className="h-6 w-6" />,
    options: [
      {
        label: 'Papel / Excel',
        value: 'manual',
        description: 'Registros fisicos o planillas',
        points: { semilla: 2, crecimiento: 2, establecida: 1, premium: 0 },
      },
      {
        label: 'Software basico',
        value: 'basic',
        description: 'Sistema simple de gestion',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 },
      },
      {
        label: 'Software completo',
        value: 'advanced',
        description: 'Sistema veterinario profesional',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 },
      },
      {
        label: 'Multiple sistemas',
        value: 'multiple',
        description: 'Varios sistemas que quieren integrar',
        points: { semilla: 0, crecimiento: 0, establecida: 2, premium: 3 },
      },
    ],
  },
  {
    id: 'needs',
    question: '¿Que es lo mas importante para tu clinica?',
    description: 'Tu prioridad principal ahora',
    icon: <Building2 className="h-6 w-6" />,
    options: [
      {
        label: 'Empezar barato',
        value: 'budget',
        description: 'Necesito una solucion economica',
        points: { semilla: 3, crecimiento: 1, establecida: 0, premium: 0 },
      },
      {
        label: 'Crecer y profesionalizar',
        value: 'growth',
        description: 'Quiero modernizar mi clinica',
        points: { semilla: 1, crecimiento: 3, establecida: 1, premium: 0 },
      },
      {
        label: 'Funcionalidades completas',
        value: 'features',
        description: 'Necesito todas las herramientas',
        points: { semilla: 0, crecimiento: 1, establecida: 3, premium: 1 },
      },
      {
        label: 'Solucion empresarial',
        value: 'enterprise',
        description: 'Necesito algo a medida',
        points: { semilla: 0, crecimiento: 0, establecida: 1, premium: 3 },
      },
    ],
  },
]

const plans: Record<string, RecommendedPlan> = {
  semilla: {
    id: 'semilla',
    name: 'Plan Semilla',
    icon: <Sprout className="h-8 w-8" />,
    color: '#4ADE80',
    monthlyPrice: 150000,
    setupPrice: 'Gs 0 (diferido)',
    tagline: 'Perfecto para empezar sin riesgo',
    reasons: [
      'Sin costo inicial - el setup se difiere en 12 meses',
      'Todas las funcionalidades esenciales incluidas',
      'Soporte incluido para arrancar bien',
      'Podes crecer a otro plan cuando estes listo',
    ],
    ctaMessage:
      'Hola! Hice el quiz de VetePy y me recomendaron el Plan Semilla. Me gustaria saber mas!',
  },
  crecimiento: {
    id: 'crecimiento',
    name: 'Plan Crecimiento',
    icon: <TreeDeciduous className="h-8 w-8" />,
    color: '#2DCEA3',
    monthlyPrice: 200000,
    setupPrice: 'Gs 500.000',
    tagline: 'El favorito de clinicas en expansion',
    reasons: [
      'Balance perfecto entre precio y funcionalidades',
      'Soporte por WhatsApp en horario laboral',
      'Todas las herramientas clinicas incluidas',
      'Modulos adicionales disponibles cuando los necesites',
    ],
    ctaMessage:
      'Hola! Hice el quiz de VetePy y me recomendaron el Plan Crecimiento. Me gustaria saber mas!',
  },
  establecida: {
    id: 'establecida',
    name: 'Plan Establecida',
    icon: <Trees className="h-8 w-8" />,
    color: '#5C6BFF',
    monthlyPrice: 300000,
    setupPrice: 'Gs 700.000',
    tagline: 'Para clinicas que quieren lo mejor',
    reasons: [
      'Soporte prioritario 24/7 por WhatsApp',
      'WhatsApp Business API incluido',
      'Modulos de laboratorio y hospitalizacion',
      'Account manager dedicado para tu clinica',
    ],
    ctaMessage:
      'Hola! Hice el quiz de VetePy y me recomendaron el Plan Establecida. Me gustaria saber mas!',
  },
  premium: {
    id: 'premium',
    name: 'Plan Premium',
    icon: <Crown className="h-8 w-8" />,
    color: '#F59E0B',
    monthlyPrice: 500000,
    setupPrice: 'A medida',
    tagline: 'Solucion empresarial completa',
    reasons: [
      'Soporte para multiples sucursales',
      'API personalizada e integraciones',
      'Desarrollo a medida segun necesidades',
      'SLA garantizado y revisiones trimestrales',
    ],
    ctaMessage:
      'Hola! Hice el quiz de VetePy y me recomendaron el Plan Premium. Tengo una clinica grande y me gustaria saber mas!',
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

  const calculateRecommendation = (): string => {
    const scores = { semilla: 0, crecimiento: 0, establecida: 0, premium: 0 }

    questions.forEach((question) => {
      const answer = answers[question.id]
      if (answer) {
        const option = question.options.find((o) => o.value === answer)
        if (option) {
          scores.semilla += option.points.semilla
          scores.crecimiento += option.points.crecimiento
          scores.establecida += option.points.establecida
          scores.premium += option.points.premium
        }
      }
    })

    // Find highest score
    let maxScore = 0
    let recommended = 'crecimiento'
    Object.entries(scores).forEach(([plan, score]) => {
      if (score > maxScore) {
        maxScore = score
        recommended = plan
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
                  <span className="text-white/70">Mensualidad</span>
                  <div>
                    <span className="text-3xl font-black" style={{ color: recommendedPlan.color }}>
                      Gs {formatPrice(recommendedPlan.monthlyPrice)}
                    </span>
                    <span className="text-white/50">/mes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Configuracion</span>
                  <span className="text-xl font-bold text-white">{recommendedPlan.setupPrice}</span>
                </div>
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
                  Quiero este plan
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
            <span className="text-sm font-medium text-[#5C6BFF]">Quiz de 4 preguntas</span>
          </div>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            ¿Que plan te conviene?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Responde estas preguntas rapidas y te recomendamos el plan perfecto para tu clinica.
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
        </div>
      </div>
    </section>
  )
}
