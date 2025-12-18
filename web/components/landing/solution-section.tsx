import { Globe, Layers, Shield, Zap, Check, Server, Users, Palette, ArrowRight } from 'lucide-react';

const benefits = [
  { text: 'Tu propio sitio web en días, no meses', highlight: true },
  { text: 'URL personalizada (tunombre.vetepy.com o tu dominio)', highlight: false },
  { text: 'Tu logo, colores y fotos - tu identidad completa', highlight: false },
  { text: 'Sin programadores, sin hosting, sin complicaciones', highlight: true },
  { text: 'Actualizaciones automáticas sin costo extra', highlight: false },
  { text: 'Soporte técnico cuando lo necesites', highlight: false },
];

const comparisons = [
  { label: 'Desarrollo tradicional', price: '₲10-15M', time: '2-4 meses', ongoing: '₲500K+/mes' },
  { label: 'VetePy', price: '₲700K', time: '3-7 días', ongoing: '₲200K/mes', highlight: true },
];

const howItWorks = [
  {
    icon: Server,
    title: 'Una Plataforma Poderosa',
    description: 'Construimos y mantenemos una plataforma de nivel empresarial con la mejor tecnología del mercado.'
  },
  {
    icon: Palette,
    title: 'Tu Marca, Tu Identidad',
    description: 'Cada clínica tiene su propio diseño, colores, logo y contenido. Nadie sabe que es la misma plataforma.'
  },
  {
    icon: Users,
    title: 'Costos Compartidos',
    description: 'Al compartir infraestructura entre múltiples clínicas, el costo para cada una es mínimo.'
  }
];

export function SolutionSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#0F172A] to-[#0F172A]/95 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#2DCEA3]/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-[#5C6BFF]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Nuestra Solución
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            Una plataforma profesional,{' '}
            <span className="bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] bg-clip-text text-transparent">
              precio de emprendedor
            </span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            VetePy es una red de sitios web veterinarios que comparten la misma tecnología de base.
            Vos te llevás un sitio profesional completo, nosotros nos encargamos de todo lo técnico.
            <span className="text-white font-medium"> Así de simple.</span>
          </p>
        </div>

        {/* How it works - 3 pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {howItWorks.map((item, idx) => (
            <div key={idx} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2DCEA3]/20 to-[#5C6BFF]/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-[#2DCEA3]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Benefits */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Todo lo que necesitás, sin lo que no querés
            </h3>
            <p className="text-white/60 mb-8">
              Olvidate de contratar diseñadores, programadores, hosting, seguridad, backups...
              Nosotros nos encargamos de todo. Vos solo decinos qué querés mostrar.
            </p>

            {/* Benefits List */}
            <div className="space-y-3 mb-8">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    benefit.highlight ? 'bg-[#2DCEA3]' : 'bg-[#2DCEA3]/20'
                  }`}>
                    <Check className={`w-3 h-3 ${benefit.highlight ? 'text-[#0F172A]' : 'text-[#2DCEA3]'}`} />
                  </div>
                  <span className={`text-sm ${benefit.highlight ? 'text-white font-medium' : 'text-white/70'}`}>
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#precios"
              className="inline-flex items-center gap-2 text-[#2DCEA3] font-bold hover:underline"
            >
              Ver precios
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right: Cost Comparison */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Compará los números
            </h3>
            <p className="text-white/60 mb-8">
              Un sitio web desarrollado desde cero vs. VetePy.
              Los números hablan solos.
            </p>

            <div className="space-y-4">
              {comparisons.map((comp, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border ${
                    comp.highlight
                      ? 'bg-gradient-to-r from-[#2DCEA3]/10 to-[#5C6BFF]/10 border-[#2DCEA3]/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-bold ${comp.highlight ? 'text-[#2DCEA3]' : 'text-white/70'}`}>
                      {comp.label}
                    </span>
                    {comp.highlight && (
                      <span className="px-2 py-1 rounded-full bg-[#2DCEA3] text-[#0F172A] text-xs font-bold">
                        RECOMENDADO
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/40 text-xs block mb-1">Costo inicial</span>
                      <span className={`font-bold ${comp.highlight ? 'text-white' : 'text-red-400'}`}>
                        {comp.price}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs block mb-1">Tiempo</span>
                      <span className={`font-bold ${comp.highlight ? 'text-white' : 'text-white/70'}`}>
                        {comp.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs block mb-1">Mensual</span>
                      <span className={`font-bold ${comp.highlight ? 'text-white' : 'text-red-400'}`}>
                        {comp.ongoing}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Savings callout */}
            <div className="mt-6 p-4 rounded-xl bg-[#2DCEA3]/10 border border-[#2DCEA3]/20">
              <p className="text-white/80 text-sm">
                <span className="font-bold text-[#2DCEA3]">Ahorrás ₲9M+</span> en el primer año
                comparado con desarrollo tradicional. Y tu sitio está listo en días, no meses.
              </p>
            </div>
          </div>
        </div>

        {/* Technology trust badges */}
        <div className="mt-16 text-center">
          <p className="text-white/40 text-sm mb-4">Tecnología de nivel empresarial</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Shield className="w-4 h-4 text-[#2DCEA3]" />
              <span className="text-white/70 text-sm">Seguridad Bancaria</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Zap className="w-4 h-4 text-[#2DCEA3]" />
              <span className="text-white/70 text-sm">Carga Ultra Rápida</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Globe className="w-4 h-4 text-[#2DCEA3]" />
              <span className="text-white/70 text-sm">Disponible 24/7</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Server className="w-4 h-4 text-[#2DCEA3]" />
              <span className="text-white/70 text-sm">Backups Diarios</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
