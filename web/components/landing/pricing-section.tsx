import { Check, X, MessageCircle, Sparkles, HelpCircle } from 'lucide-react';

const includedFeatures = [
  { text: 'Sitio web profesional completo', included: true },
  { text: 'Tu logo, colores y contenido personalizado', included: true },
  { text: 'URL: tunombre.vetepy.com', included: true },
  { text: 'Sistema de citas online', included: true },
  { text: 'Portal de mascotas para clientes', included: true },
  { text: 'Historial médico digital', included: true },
  { text: 'Carnet de vacunas con recordatorios', included: true },
  { text: 'Herramientas clínicas (dosis, diagnósticos)', included: true },
  { text: 'Tags QR para mascotas', included: true },
  { text: 'Soporte técnico por WhatsApp', included: true },
  { text: 'Hosting, SSL y backups incluidos', included: true },
  { text: 'Actualizaciones de plataforma', included: true },
];

const optionalModules = [
  { text: 'Tu propio dominio (.com.py)', note: 'Solo comprás el dominio, config gratis' },
  { text: 'Tienda online (e-commerce)', note: 'Cotización según catálogo' },
  { text: 'Sistema de facturación avanzado', note: 'Cotización según volumen' },
  { text: 'Integración WhatsApp Business API', note: 'Cotización según uso' },
  { text: 'Módulos de hospitalización/lab', note: 'Cotización según necesidad' },
  { text: 'Desarrollos personalizados', note: 'Cotización según requerimiento' },
];

export function PricingSection() {
  return (
    <section id="precios" className="py-20 md:py-28 bg-gradient-to-b from-[#0F172A] via-[#131B2E] to-[#0F172A] relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-[#2DCEA3]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-[#5C6BFF]/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Inversión
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Precio transparente, sin sorpresas
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Un precio base que incluye todo lo esencial para empezar.
            Módulos adicionales disponibles según tu crecimiento.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Main pricing card */}
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-[#2DCEA3]/30 backdrop-blur-sm">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  Plan Base
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6 pt-4">
                {/* Setup fee */}
                <div className="mb-4">
                  <span className="text-white/50 text-sm">Configuración inicial (único)</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black text-white">₲700.000</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-sm">+</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Monthly fee */}
                <div>
                  <span className="text-white/50 text-sm">Mensualidad</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] bg-clip-text text-transparent">
                      ₲200.000
                    </span>
                    <span className="text-white/50">/mes</span>
                  </div>
                </div>
              </div>

              {/* What's included */}
              <div className="space-y-2 mb-6">
                <p className="text-white font-bold text-sm mb-3">Incluye:</p>
                {includedFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2DCEA3] flex-shrink-0" />
                    <span className="text-white/70 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="https://wa.me/595981324569?text=Hola!%20Quiero%20contratar%20el%20Plan%20Base%20de%20VetePy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full shadow-lg shadow-[#2DCEA3]/20 hover:shadow-xl hover:shadow-[#2DCEA3]/30 transition-all hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                Empezar Ahora
              </a>
            </div>

            {/* Optional modules card */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">Módulos Opcionales</h3>
              <p className="text-white/50 text-sm mb-6">
                Agregá funcionalidades según las necesidades de tu clínica.
                Cotización personalizada.
              </p>

              <div className="space-y-4">
                {optionalModules.map((module, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <HelpCircle className="w-4 h-4 text-[#5C6BFF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{module.text}</p>
                      <p className="text-white/40 text-xs">{module.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#5C6BFF]/10 border border-[#5C6BFF]/20">
                <p className="text-white/70 text-sm">
                  <span className="font-bold text-white">¿Necesitás algo especial?</span>{' '}
                  Contanos qué querés lograr y te armamos una propuesta a medida.
                </p>
              </div>
            </div>
          </div>

          {/* ROI Calculator hint */}
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-white/70 mb-2">
              <span className="font-bold text-white">¿Vale la pena?</span>{' '}
              Con una consulta promedio de ₲150.000, necesitás solo{' '}
              <span className="text-[#2DCEA3] font-bold">2 clientes nuevos al mes</span>{' '}
              para cubrir la inversión. El resto es ganancia.
            </p>
            <p className="text-white/40 text-sm">
              Y vas a conseguir muchos más de 2 con tu nuevo sitio profesional.
            </p>
          </div>

          {/* Payment flexibility */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm mb-2">
              ¿Necesitás facilidades de pago? Escribinos y lo coordinamos.
            </p>
            <p className="text-white/40 text-sm">
              Sin contratos de permanencia. Cancelás cuando quieras.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
