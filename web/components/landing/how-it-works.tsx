'use client'

import { MessageCircle, Settings, Rocket, ArrowRight, Clock, Check } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Contactanos',
    description:
      'Escribinos por WhatsApp. Conversamos sobre tu clinica, servicios y lo que necesitas.',
    duration: '15 min',
    details: ['Charla sin compromiso', 'Evaluamos tus necesidades', 'Respondemos todas tus dudas'],
    color: '#2DCEA3',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configuramos',
    description: 'Armamos tu sitio web con tu logo, colores y toda la informacion de tu clinica.',
    duration: '3-7 dias',
    details: ['Envianos tu contenido', 'Diseñamos tu sitio', 'Revisas y aprobas'],
    color: '#00C9FF',
  },
  {
    number: '03',
    icon: Rocket,
    title: '¡Listo!',
    description: 'Tu clinica esta online. Vos atendes pacientes, nosotros manejamos la tecnologia.',
    duration: 'Para siempre',
    details: ['Soporte continuo', 'Actualizaciones gratis', 'Sin preocupaciones'],
    color: '#5C6BFF',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative overflow-hidden bg-[#0F172A] py-16 md:py-24">
      {/* Subtle background circles */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-[#2DCEA3] md:text-sm">
            Proceso Simple
          </span>
          <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl">
            ¿Como funciona?
          </h2>
          <p className="mx-auto max-w-xl text-sm text-white/60 md:text-base lg:text-lg">
            En 3 simples pasos, tu clinica veterinaria tiene presencia digital profesional.
          </p>
        </div>

        {/* Steps - Mobile: Vertical | Desktop: Horizontal */}
        <div className="mx-auto max-w-5xl">
          {/* Desktop Layout */}
          <div className="relative hidden gap-6 md:grid md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] top-[72px] h-0.5 bg-gradient-to-r from-[#2DCEA3]/50 via-[#00C9FF]/50 to-[#5C6BFF]/50" />

            {steps.map((step, idx) => (
              <div key={idx} className="group relative">
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] lg:p-8">
                  {/* Step badge */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: step.color, color: '#0F172A' }}
                  >
                    Paso {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 lg:mb-5 lg:h-20 lg:w-20"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <step.icon className="h-8 w-8 lg:h-10 lg:w-10" style={{ color: step.color }} />
                  </div>

                  {/* Duration badge */}
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
                    <Clock className="h-3 w-3 text-white/40" />
                    <span className="text-xs text-white/50">{step.duration}</span>
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-bold text-white lg:text-xl">{step.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-white/50">{step.description}</p>

                  {/* Detail points */}
                  <div className="space-y-1.5">
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-center justify-center gap-2">
                        <Check className="h-3 w-3 flex-shrink-0" style={{ color: step.color }} />
                        <span className="text-xs text-white/40">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Layout - Vertical Timeline */}
          <div className="space-y-4 md:hidden">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <step.icon className="h-5 w-5" style={{ color: step.color }} />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="mt-2 min-h-[60px] w-0.5 flex-1 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: step.color, color: '#0F172A' }}
                    >
                      Paso {step.number}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Clock className="h-3 w-3" />
                      {step.duration}
                    </span>
                  </div>
                  <h3 className="mb-1 text-base font-bold text-white">{step.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-white/50">{step.description}</p>

                  {/* Condensed details on mobile */}
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail, dIdx) => (
                      <span
                        key={dIdx}
                        className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/50"
                      >
                        <Check className="h-2.5 w-2.5" style={{ color: step.color }} />
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center md:mt-14">
          <a
            href="https://wa.me/595981324569?text=Hola!%20Quiero%20saber%20mas%20sobre%20VetePy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] px-6 py-3 text-sm font-bold text-[#0F172A] shadow-lg shadow-[#2DCEA3]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl md:px-8 md:py-4 md:text-base"
          >
            <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
            Empezar ahora
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </a>
          <p className="mt-3 text-xs text-white/40">Sin compromiso • Respuesta rapida</p>
        </div>
      </div>
    </section>
  )
}
