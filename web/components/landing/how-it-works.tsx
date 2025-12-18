import { MessageCircle, Settings, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Contactanos',
    description: 'Escribinos por WhatsApp. Conversamos sobre tu clínica, qué servicios ofrecés y qué necesitás.',
    color: '#2DCEA3'
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configuramos',
    description: 'En pocos días, armamos tu sitio web con tu logo, colores y toda la información de tu clínica.',
    color: '#00C9FF'
  },
  {
    number: '03',
    icon: Rocket,
    title: '¡Listo!',
    description: 'Tu clínica está online. Vos atendés pacientes, nosotros nos encargamos de la tecnología.',
    color: '#5C6BFF'
  }
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Proceso Simple
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            ¿Cómo funciona?
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            En 3 simples pasos, tu clínica veterinaria tiene presencia digital profesional.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Connector line (hidden on mobile, hidden for last item) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[calc(50%+60px)] w-[calc(100%-60px)] h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
              )}

              {/* Card */}
              <div className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group-hover:-translate-y-2">
                {/* Step number */}
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: step.color, color: '#0F172A' }}
                >
                  Paso {step.number}
                </div>

                {/* Icon */}
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <step.icon className="w-10 h-10" style={{ color: step.color }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <a
            href="https://wa.me/595981324569?text=Hola!%20Quiero%20saber%20más%20sobre%20VetePy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all"
          >
            <MessageCircle className="w-5 h-5 text-[#2DCEA3]" />
            Empezar ahora
          </a>
        </div>
      </div>
    </section>
  );
}
