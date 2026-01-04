'use client'

import { useState } from 'react'
import {
  Gift,
  Calendar,
  Check,
  ArrowRight,
  Clock,
  Shield,
  CreditCard,
  MessageCircle,
  Sparkles,
  ChevronDown,
  X,
  DollarSign,
  FileCheck,
  Rocket,
} from 'lucide-react'

interface TimelineStep {
  month: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: boolean
  payment?: string
}

const timelineSteps: TimelineStep[] = [
  {
    month: 'Mes 1-3',
    title: 'Periodo de Prueba',
    description: 'Tu sitio funcionando al 100%. Sin costos. Evalualo tranquilo.',
    icon: <Gift className="h-5 w-5" />,
    highlight: true,
    payment: 'Gs 0',
  },
  {
    month: 'Mes 4',
    title: 'Decides',
    description: 'Si te gusta, continuas. Si no, te vas sin pagar nada.',
    icon: <FileCheck className="h-5 w-5" />,
    payment: 'Decision',
  },
  {
    month: 'Mes 4-15',
    title: 'Recuperacion del Setup',
    description: 'La configuracion inicial se divide en 12 cuotas sumadas a la mensualidad.',
    icon: <CreditCard className="h-5 w-5" />,
    payment: 'Mensual + Cuota Setup',
  },
  {
    month: 'Mes 16+',
    title: 'Solo Mensualidad',
    description: 'Una vez pagado el setup, solo pagas la mensualidad del plan.',
    icon: <Rocket className="h-5 w-5" />,
    payment: 'Solo Mensual',
  },
]

const guarantees = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Sin riesgo',
    description: 'Si no te convence, te vas sin pagar un guarani',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Acceso completo',
    description: 'Todas las funcionalidades del plan, sin limitaciones',
  },
  {
    icon: <Gift className="h-6 w-6" />,
    title: 'Setup incluido',
    description: 'Construimos tu sitio web completo durante la prueba',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Pago flexible',
    description: 'El setup se divide en 12 cuotas si decides continuar',
  },
]

interface FAQItem {
  question: string
  answer: string
}

const trialFAQs: FAQItem[] = [
  {
    question: '¿Realmente no pago nada durante los 3 meses?',
    answer:
      'Correcto. Durante los 3 meses de prueba no pagas nada. Nosotros invertimos en construir tu sitio y vos lo probas. Si decides no continuar, te vas sin pagar. Es nuestro riesgo, no el tuyo.',
  },
  {
    question: '¿Que pasa con el setup si decido continuar?',
    answer:
      'El costo de configuracion (que varia segun el plan) se divide en 12 cuotas mensuales que se suman a tu mensualidad. Por ejemplo, con Plan Crecimiento: Gs 200.000 + Gs 41.667 (setup) = Gs 241.667 por mes durante 12 meses. Despues, solo Gs 200.000.',
  },
  {
    question: '¿Y si cancelo despues del mes 4?',
    answer:
      'Pagas hasta el mes que usaste. No hay penalidad. Solo respetamos el minimo del plan elegido (12 meses para Semilla, 6 para Crecimiento, ninguno para Establecida). Si cancelas antes del minimo, se aplica una pequeña compensacion por el setup invertido.',
  },
  {
    question: '¿Que funcionalidades tengo durante la prueba?',
    answer:
      'Todas. No hay versiones limitadas. Tu sitio funciona exactamente igual durante la prueba que despues. Es la unica forma de que puedas evaluarlo de verdad.',
  },
  {
    question: '¿Puedo cambiar de plan durante o despues de la prueba?',
    answer:
      'Si! Podes empezar con Semilla y subir a Crecimiento cuando crezcas. O empezar con Crecimiento y ver si necesitas Establecida. El upgrade es inmediato, solo ajustamos la mensualidad.',
  },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY').format(price)
}

export function TrialOffer() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0)
  const [selectedPlan, setSelectedPlan] = useState<'semilla' | 'crecimiento' | 'establecida'>(
    'crecimiento'
  )

  const planPricing = {
    semilla: { setup: 700000, monthly: 150000 },
    crecimiento: { setup: 500000, monthly: 200000 },
    establecida: { setup: 700000, monthly: 300000 },
  }

  const current = planPricing[selectedPlan]
  const monthlySetupInstallment = Math.ceil(current.setup / 12)
  const totalDuringRecovery = current.monthly + monthlySetupInstallment

  return (
    <section
      id="prueba-gratis"
      className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0D1424] to-[#0F172A] py-20 md:py-28"
    >
      {/* Background decorations */}
      <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[#2DCEA3]/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#5C6BFF]/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2DCEA3]/20 bg-[#2DCEA3]/10 px-4 py-2">
            <Gift className="h-5 w-5 text-[#2DCEA3]" />
            <span className="font-bold text-[#2DCEA3]">Prueba Sin Riesgo</span>
          </div>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            3 meses gratis para que lo pruebes
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-white/60">
            Nosotros construimos tu sitio, vos lo probas. Si no te convence, te vas sin pagar. Si
            decides quedarte, el setup se paga en{' '}
            <span className="text-[#2DCEA3]">12 cuotas sin interes</span>.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="mx-auto max-w-6xl">
          {/* Timeline */}
          <div className="mb-16">
            <h3 className="mb-8 text-center text-xl font-bold text-white">Como funciona</h3>
            <div className="grid gap-4 md:grid-cols-4">
              {timelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-2xl border p-6 ${
                    step.highlight
                      ? 'border-[#2DCEA3]/30 bg-[#2DCEA3]/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {idx < timelineSteps.length - 1 && (
                    <div className="absolute -right-2 top-1/2 hidden h-0.5 w-4 bg-white/20 md:block" />
                  )}
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                      step.highlight
                        ? 'bg-[#2DCEA3]/20 text-[#2DCEA3]'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="mb-2 text-xs font-bold text-[#2DCEA3]">{step.month}</div>
                  <h4 className="mb-2 font-bold text-white">{step.title}</h4>
                  <p className="mb-3 text-sm text-white/50">{step.description}</p>
                  {step.payment && (
                    <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                      {step.payment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calculator Section */}
          <div className="mb-16 grid gap-8 lg:grid-cols-2">
            {/* Plan Selector */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                <DollarSign className="h-5 w-5 text-[#2DCEA3]" />
                Calcula tu inversion
              </h3>

              {/* Plan Tabs */}
              <div className="mb-6 flex gap-2">
                {(['semilla', 'crecimiento', 'establecida'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`flex-1 rounded-xl px-4 py-3 font-medium capitalize transition-all ${
                      selectedPlan === plan
                        ? 'bg-[#2DCEA3] text-[#0F172A]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="mb-2 flex justify-between">
                    <span className="text-white/70">Meses 1-3 (Prueba)</span>
                    <span className="font-bold text-[#2DCEA3]">Gs 0</span>
                  </div>
                  <p className="text-xs text-white/40">Gratis mientras evaluas</p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <div className="mb-2 flex justify-between">
                    <span className="text-white/70">Meses 4-15 (Recovery)</span>
                    <span className="font-bold text-white">
                      Gs {formatPrice(totalDuringRecovery)}/mes
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-white/40">
                    <p>Mensualidad: Gs {formatPrice(current.monthly)}</p>
                    <p>+ Cuota setup: Gs {formatPrice(monthlySetupInstallment)} (1/12)</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#2DCEA3]/20 bg-[#2DCEA3]/10 p-4">
                  <div className="mb-2 flex justify-between">
                    <span className="text-white">Mes 16+ (Normal)</span>
                    <span className="text-xl font-bold text-[#2DCEA3]">
                      Gs {formatPrice(current.monthly)}/mes
                    </span>
                  </div>
                  <p className="text-xs text-white/40">Solo la mensualidad, setup ya pagado</p>
                </div>
              </div>

              {/* Total first year */}
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Inversion primer año</span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">
                      Gs {formatPrice(totalDuringRecovery * 9)}
                    </div>
                    <p className="text-xs text-white/40">3 meses gratis + 9 meses de pago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="rounded-3xl border border-[#2DCEA3]/20 bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 p-8">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                <Shield className="h-5 w-5 text-[#2DCEA3]" />
                Nuestras garantias
              </h3>

              <div className="mb-8 grid grid-cols-2 gap-4">
                {guarantees.map((guarantee, idx) => (
                  <div key={idx} className="rounded-xl bg-white/5 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2DCEA3]/10 text-[#2DCEA3]">
                      {guarantee.icon}
                    </div>
                    <h4 className="mb-1 font-bold text-white">{guarantee.title}</h4>
                    <p className="text-sm text-white/50">{guarantee.description}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/595981324569?text=${encodeURIComponent('Hola! Me interesa la prueba de 3 meses gratis de VetePy para mi clinica')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] px-6 py-4 font-bold text-[#0F172A] shadow-lg shadow-[#2DCEA3]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                Quiero empezar mi prueba gratis
              </a>

              <p className="mt-4 text-center text-xs text-white/40">
                Sin tarjeta de credito • Sin compromiso • Cancela cuando quieras
              </p>
            </div>
          </div>

          {/* Trial FAQ */}
          <div className="mx-auto max-w-3xl">
            <h3 className="mb-6 text-center text-xl font-bold text-white">
              Preguntas sobre la prueba gratis
            </h3>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {trialFAQs.map((faq, idx) => (
                <div key={idx} className="border-b border-white/10 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                    className="group flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="font-medium text-white transition-colors group-hover:text-[#2DCEA3]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-white/50 transition-transform duration-300 ${
                        expandedFAQ === idx ? 'rotate-180 text-[#2DCEA3]' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedFAQ === idx ? 'max-h-[300px]' : 'max-h-0'
                    }`}
                  >
                    <p className="px-5 pb-5 leading-relaxed text-white/60">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
