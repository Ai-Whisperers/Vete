'use client';

import { MessageCircle, Settings, Rocket, ArrowRight, Clock, Check } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Contactanos',
    description: 'Escribinos por WhatsApp. Conversamos sobre tu clinica, servicios y lo que necesitas.',
    duration: '15 min',
    details: ['Charla sin compromiso', 'Evaluamos tus necesidades', 'Respondemos todas tus dudas'],
    color: '#2DCEA3'
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configuramos',
    description: 'Armamos tu sitio web con tu logo, colores y toda la informacion de tu clinica.',
    duration: '3-7 dias',
    details: ['Envianos tu contenido', 'Diseñamos tu sitio', 'Revisas y aprobas'],
    color: '#00C9FF'
  },
  {
    number: '03',
    icon: Rocket,
    title: '¡Listo!',
    description: 'Tu clinica esta online. Vos atendes pacientes, nosotros manejamos la tecnologia.',
    duration: 'Para siempre',
    details: ['Soporte continuo', 'Actualizaciones gratis', 'Sin preocupaciones'],
    color: '#5C6BFF'
  }
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Subtle background circles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-xs md:text-sm mb-3">
            Proceso Simple
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6">
            ¿Como funciona?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base lg:text-lg">
            En 3 simples pasos, tu clinica veterinaria tiene presencia digital profesional.
          </p>
        </div>

        {/* Steps - Mobile: Vertical | Desktop: Horizontal */}
        <div className="max-w-5xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="absolute top-[72px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-0.5 bg-gradient-to-r from-[#2DCEA3]/50 via-[#00C9FF]/50 to-[#5C6BFF]/50" />

            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="relative p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 text-center">
                  {/* Step badge */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: step.color, color: '#0F172A' }}
                  >
                    Paso {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl mx-auto mb-4 lg:mb-5 flex items-center justify-center group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <step.icon className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: step.color }} />
                  </div>

                  {/* Duration badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 mb-3">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-white/50 text-xs">{step.duration}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Detail points */}
                  <div className="space-y-1.5">
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-center justify-center gap-2">
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: step.color }} />
                        <span className="text-white/40 text-xs">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Layout - Vertical Timeline */}
          <div className="md:hidden space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 flex-1 mt-2 bg-gradient-to-b from-white/20 to-transparent min-h-[60px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: step.color, color: '#0F172A' }}
                    >
                      Paso {step.number}
                    </span>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.duration}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-3">{step.description}</p>

                  {/* Condensed details on mobile */}
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail, dIdx) => (
                      <span
                        key={dIdx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-white/50 text-[10px]"
                      >
                        <Check className="w-2.5 h-2.5" style={{ color: step.color }} />
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
        <div className="text-center mt-10 md:mt-14">
          <a
            href="https://wa.me/595981324569?text=Hola!%20Quiero%20saber%20mas%20sobre%20VetePy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full shadow-lg shadow-[#2DCEA3]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm md:text-base"
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            Empezar ahora
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </a>
          <p className="text-white/40 text-xs mt-3">Sin compromiso • Respuesta rapida</p>
        </div>
      </div>
    </section>
  );
}
