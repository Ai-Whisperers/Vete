'use client';

import { Check, Server, Users, Palette, ArrowRight, X, Sparkles } from 'lucide-react';

const benefits = [
  'Tu propio sitio web profesional en dias, no meses',
  'URL personalizada (tunombre.vetepy.com o tu dominio)',
  'Tu logo, colores y fotos - tu identidad completa',
  'Citas online 24/7 + historial medico digital',
  'Actualizaciones automaticas sin costo extra',
  'Soporte tecnico incluido en tu plan',
];

const traditionalPains = [
  'Contratar diseñador + programador',
  'Comprar hosting y dominio aparte',
  'Configurar seguridad y backups',
  'Pagar por cada actualizacion',
  'Esperar meses para tener algo',
];

const howItWorks = [
  {
    icon: Server,
    title: 'Una Plataforma Poderosa',
    description: 'Tecnologia de nivel empresarial que mantenemos y actualizamos constantemente.'
  },
  {
    icon: Palette,
    title: 'Tu Marca, Tu Identidad',
    description: 'Cada clinica tiene su propio diseño unico. Nadie sabe que es la misma plataforma.'
  },
  {
    icon: Users,
    title: 'Costos Compartidos',
    description: 'Infraestructura compartida = costos accesibles para todos.'
  }
];

export function SolutionSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#0D1424] to-[#0F172A] relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-0 w-[250px] h-[250px] bg-[#2DCEA3]/8 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-[250px] h-[250px] bg-[#5C6BFF]/8 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DCEA3]/10 border border-[#2DCEA3]/20 mb-4">
            <Sparkles className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-[#2DCEA3] text-sm font-bold">La Solucion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
            Tecnologia profesional,{' '}
            <span className="block sm:inline bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] bg-clip-text text-transparent">
              precio accesible
            </span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
            VetePy es una red de sitios veterinarios que comparten tecnologia.
            Vos obtenes un sitio profesional completo, nosotros manejamos todo lo tecnico.
          </p>
        </div>

        {/* How it works - 3 pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 max-w-4xl mx-auto">
          {howItWorks.map((item, idx) => (
            <div
              key={idx}
              className="text-center p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-[#2DCEA3]/20 to-[#5C6BFF]/20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <item.icon className="w-6 h-6 md:w-7 md:h-7 text-[#2DCEA3]" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/50 text-xs md:text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison: VetePy vs Traditional */}
        <div className="max-w-5xl mx-auto mb-12 md:mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center">
            Compara los numeros
          </h3>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Traditional - Problems */}
            <div className="p-5 md:p-6 rounded-2xl bg-red-500/5 border border-red-500/20 order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Desarrollo Tradicional</h4>
                  <p className="text-white/40 text-xs">Contratar agencia o freelancer</p>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/60 text-sm">Diseño + Desarrollo</span>
                  <span className="text-red-400 font-bold">₲5-10M</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/60 text-sm">Hosting anual</span>
                  <span className="text-red-400 font-bold">₲600K-1.2M</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/60 text-sm">Mantenimiento/mes</span>
                  <span className="text-red-400 font-bold">₲300-500K</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/60 text-sm">Tiempo estimado</span>
                  <span className="text-white/70 font-bold">2-4 meses</span>
                </div>
              </div>

              {/* Pain points */}
              <div className="space-y-2">
                {traditionalPains.map((pain, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-white/50 text-xs">{pain}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VetePy - Solution */}
            <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-[#2DCEA3]/30 order-1 md:order-2 relative">
              <div className="absolute -top-3 right-4">
                <span className="px-3 py-1 rounded-full bg-[#2DCEA3] text-[#0F172A] text-xs font-bold">
                  RECOMENDADO
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2DCEA3]/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#2DCEA3]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">VetePy</h4>
                  <p className="text-white/40 text-xs">Todo incluido, sin sorpresas</p>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Configuracion inicial</span>
                  <div className="text-right">
                    <span className="text-[#2DCEA3] font-bold">desde ₲0*</span>
                    <p className="text-white/30 text-[10px]">*Plan Semilla, diferido</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Mensualidad</span>
                  <div className="text-right">
                    <span className="text-[#2DCEA3] font-bold">desde ₲150K</span>
                    <p className="text-white/30 text-[10px]">Segun tamaño de clinica</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Hosting + Backups + SSL</span>
                  <span className="text-[#2DCEA3] font-bold">INCLUIDO</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/70 text-sm">Tiempo para estar online</span>
                  <span className="text-white font-bold">3-7 dias</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                {benefits.slice(0, 5).map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2DCEA3] flex-shrink-0" />
                    <span className="text-white/70 text-xs">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Savings callout */}
          <div className="mt-6 p-4 rounded-xl bg-[#2DCEA3]/10 border border-[#2DCEA3]/20 text-center">
            <p className="text-white/80 text-sm md:text-base">
              <span className="font-bold text-[#2DCEA3]">Ahorra ₲5M+ el primer año</span>{' '}
              comparado con desarrollo tradicional. Y esta listo en dias, no meses.
            </p>
          </div>
        </div>

        {/* CTA to pricing */}
        <div className="text-center">
          <a
            href="#precios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/30 transition-all group"
          >
            Ver planes y precios
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
