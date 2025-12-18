'use client';

import { useState } from 'react';
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
  Rocket
} from 'lucide-react';

interface TimelineStep {
  month: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
  payment?: string;
}

const timelineSteps: TimelineStep[] = [
  {
    month: 'Mes 1-3',
    title: 'Periodo de Prueba',
    description: 'Tu sitio funcionando al 100%. Sin costos. Evalualo tranquilo.',
    icon: <Gift className="w-5 h-5" />,
    highlight: true,
    payment: 'Gs 0'
  },
  {
    month: 'Mes 4',
    title: 'Decides',
    description: 'Si te gusta, continuas. Si no, te vas sin pagar nada.',
    icon: <FileCheck className="w-5 h-5" />,
    payment: 'Decision'
  },
  {
    month: 'Mes 4-15',
    title: 'Recuperacion del Setup',
    description: 'La configuracion inicial se divide en 12 cuotas sumadas a la mensualidad.',
    icon: <CreditCard className="w-5 h-5" />,
    payment: 'Mensual + Cuota Setup'
  },
  {
    month: 'Mes 16+',
    title: 'Solo Mensualidad',
    description: 'Una vez pagado el setup, solo pagas la mensualidad del plan.',
    icon: <Rocket className="w-5 h-5" />,
    payment: 'Solo Mensual'
  }
];

const guarantees = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Sin riesgo',
    description: 'Si no te convence, te vas sin pagar un guarani'
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Acceso completo',
    description: 'Todas las funcionalidades del plan, sin limitaciones'
  },
  {
    icon: <Gift className="w-6 h-6" />,
    title: 'Setup incluido',
    description: 'Construimos tu sitio web completo durante la prueba'
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: 'Pago flexible',
    description: 'El setup se divide en 12 cuotas si decides continuar'
  }
];

interface FAQItem {
  question: string;
  answer: string;
}

const trialFAQs: FAQItem[] = [
  {
    question: '¿Realmente no pago nada durante los 3 meses?',
    answer: 'Correcto. Durante los 3 meses de prueba no pagas nada. Nosotros invertimos en construir tu sitio y vos lo probas. Si decides no continuar, te vas sin pagar. Es nuestro riesgo, no el tuyo.'
  },
  {
    question: '¿Que pasa con el setup si decido continuar?',
    answer: 'El costo de configuracion (que varia segun el plan) se divide en 12 cuotas mensuales que se suman a tu mensualidad. Por ejemplo, con Plan Crecimiento: Gs 200.000 + Gs 41.667 (setup) = Gs 241.667 por mes durante 12 meses. Despues, solo Gs 200.000.'
  },
  {
    question: '¿Y si cancelo despues del mes 4?',
    answer: 'Pagas hasta el mes que usaste. No hay penalidad. Solo respetamos el minimo del plan elegido (12 meses para Semilla, 6 para Crecimiento, ninguno para Establecida). Si cancelas antes del minimo, se aplica una pequeña compensacion por el setup invertido.'
  },
  {
    question: '¿Que funcionalidades tengo durante la prueba?',
    answer: 'Todas. No hay versiones limitadas. Tu sitio funciona exactamente igual durante la prueba que despues. Es la unica forma de que puedas evaluarlo de verdad.'
  },
  {
    question: '¿Puedo cambiar de plan durante o despues de la prueba?',
    answer: 'Si! Podes empezar con Semilla y subir a Crecimiento cuando crezcas. O empezar con Crecimiento y ver si necesitas Establecida. El upgrade es inmediato, solo ajustamos la mensualidad.'
  }
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY').format(price);
}

export function TrialOffer() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<'semilla' | 'crecimiento' | 'establecida'>('crecimiento');

  const planPricing = {
    semilla: { setup: 700000, monthly: 150000 },
    crecimiento: { setup: 500000, monthly: 200000 },
    establecida: { setup: 700000, monthly: 300000 }
  };

  const current = planPricing[selectedPlan];
  const monthlySetupInstallment = Math.ceil(current.setup / 12);
  const totalDuringRecovery = current.monthly + monthlySetupInstallment;

  return (
    <section id="prueba-gratis" className="py-20 md:py-28 bg-gradient-to-b from-[#0F172A] via-[#0D1424] to-[#0F172A] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2DCEA3]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#5C6BFF]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DCEA3]/10 border border-[#2DCEA3]/20 mb-4">
            <Gift className="w-5 h-5 text-[#2DCEA3]" />
            <span className="text-[#2DCEA3] font-bold">Prueba Sin Riesgo</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            3 meses gratis para que lo pruebes
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            Nosotros construimos tu sitio, vos lo probas. Si no te convence, te vas sin pagar.
            Si decides quedarte, el setup se paga en <span className="text-[#2DCEA3]">12 cuotas sin interes</span>.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          {/* Timeline */}
          <div className="mb-16">
            <h3 className="text-xl font-bold text-white mb-8 text-center">Como funciona</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {timelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`relative p-6 rounded-2xl border ${
                    step.highlight
                      ? 'bg-[#2DCEA3]/10 border-[#2DCEA3]/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {idx < timelineSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-white/20" />
                  )}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      step.highlight
                        ? 'bg-[#2DCEA3]/20 text-[#2DCEA3]'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-[#2DCEA3] mb-2">{step.month}</div>
                  <h4 className="text-white font-bold mb-2">{step.title}</h4>
                  <p className="text-white/50 text-sm mb-3">{step.description}</p>
                  {step.payment && (
                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                      {step.payment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calculator Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Plan Selector */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#2DCEA3]" />
                Calcula tu inversion
              </h3>

              {/* Plan Tabs */}
              <div className="flex gap-2 mb-6">
                {(['semilla', 'crecimiento', 'establecida'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all capitalize ${
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
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Meses 1-3 (Prueba)</span>
                    <span className="text-[#2DCEA3] font-bold">Gs 0</span>
                  </div>
                  <p className="text-white/40 text-xs">Gratis mientras evaluas</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Meses 4-15 (Recovery)</span>
                    <span className="text-white font-bold">Gs {formatPrice(totalDuringRecovery)}/mes</span>
                  </div>
                  <div className="text-white/40 text-xs space-y-1">
                    <p>Mensualidad: Gs {formatPrice(current.monthly)}</p>
                    <p>+ Cuota setup: Gs {formatPrice(monthlySetupInstallment)} (1/12)</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#2DCEA3]/10 border border-[#2DCEA3]/20">
                  <div className="flex justify-between mb-2">
                    <span className="text-white">Mes 16+ (Normal)</span>
                    <span className="text-[#2DCEA3] font-bold text-xl">Gs {formatPrice(current.monthly)}/mes</span>
                  </div>
                  <p className="text-white/40 text-xs">Solo la mensualidad, setup ya pagado</p>
                </div>
              </div>

              {/* Total first year */}
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Inversion primer año</span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">
                      Gs {formatPrice((totalDuringRecovery * 9))}
                    </div>
                    <p className="text-white/40 text-xs">3 meses gratis + 9 meses de pago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-[#2DCEA3]/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#2DCEA3]" />
                Nuestras garantias
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {guarantees.map((guarantee, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-xl bg-[#2DCEA3]/10 text-[#2DCEA3] flex items-center justify-center mb-3">
                      {guarantee.icon}
                    </div>
                    <h4 className="text-white font-bold mb-1">{guarantee.title}</h4>
                    <p className="text-white/50 text-sm">{guarantee.description}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/595981324569?text=${encodeURIComponent('Hola! Me interesa la prueba de 3 meses gratis de VetePy para mi clinica')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full shadow-lg shadow-[#2DCEA3]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Quiero empezar mi prueba gratis
              </a>

              <p className="text-center text-white/40 text-xs mt-4">
                Sin tarjeta de credito • Sin compromiso • Cancela cuando quieras
              </p>
            </div>
          </div>

          {/* Trial FAQ */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Preguntas sobre la prueba gratis
            </h3>

            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {trialFAQs.map((faq, idx) => (
                <div key={idx} className="border-b border-white/10 last:border-b-0">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left group hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-medium group-hover:text-[#2DCEA3] transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform duration-300 ${
                        expandedFAQ === idx ? 'rotate-180 text-[#2DCEA3]' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedFAQ === idx ? 'max-h-[300px]' : 'max-h-0'
                    }`}
                  >
                    <p className="px-5 pb-5 text-white/60 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
