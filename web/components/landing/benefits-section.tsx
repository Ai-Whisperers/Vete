import {
  Building2, PawPrint, DollarSign, Clock, Shield, Zap,
  HeartHandshake, Smartphone, Globe, Star, Bell, QrCode,
  TrendingUp, Users, Calendar, FileText, MessageCircle, Award
} from 'lucide-react';

const clinicBenefits = [
  {
    icon: TrendingUp,
    title: 'Más Clientes Nuevos',
    description: 'Aparecé en Google cuando busquen "veterinaria cerca de mí". El 90% de la gente busca online antes de elegir veterinario.',
    highlight: 'Hasta 30% más consultas'
  },
  {
    icon: Clock,
    title: 'Ahorrá Horas Cada Semana',
    description: 'Basta de atender llamadas para agendar citas. El sistema recibe reservas 24/7 mientras vos atendés pacientes.',
    highlight: '5+ horas/semana ahorradas'
  },
  {
    icon: DollarSign,
    title: 'Precio que Tiene Sentido',
    description: 'Una fracción de lo que cuesta hacer un sitio desde cero. La inversión se paga con 2-3 clientes nuevos al mes.',
    highlight: '90% menos que desarrollo tradicional'
  },
  {
    icon: Shield,
    title: 'Cero Dolores de Cabeza Técnicos',
    description: 'Hosting, SSL, backups, actualizaciones, seguridad... Todo resuelto. Vos solo atendés animales.',
    highlight: 'Nos encargamos de todo'
  },
  {
    icon: Award,
    title: 'Imagen Profesional',
    description: 'Competí de igual a igual con las grandes cadenas. Tu clínica se ve tan profesional como las mejores del mundo.',
    highlight: 'Diseño de primer nivel'
  },
  {
    icon: Zap,
    title: 'Online en Días, No Meses',
    description: 'No esperes 3 meses a que terminen tu sitio. En una semana ya estás recibiendo clientes online.',
    highlight: '3-7 días hábiles'
  }
];

const ownerBenefits = [
  {
    icon: Smartphone,
    title: 'Todo en tu Celular',
    description: 'Historial médico, vacunas, recetas, facturas. Toda la información de tu mascota en un solo lugar, accesible 24/7.',
    highlight: 'Acceso desde cualquier lugar'
  },
  {
    icon: Bell,
    title: 'Nunca Más Olvides una Vacuna',
    description: 'Te avisamos por WhatsApp cuando se acerca la fecha de vacunación. Tu mascota siempre protegida.',
    highlight: 'Recordatorios automáticos'
  },
  {
    icon: Calendar,
    title: 'Agendá Sin Llamar',
    description: 'Elegí fecha, hora y veterinario desde el celular. Confirmación instantánea. Adiós a las llamadas y esperas.',
    highlight: 'Reservas online 24/7'
  },
  {
    icon: QrCode,
    title: 'Si Se Pierde, Lo Encuentran',
    description: 'Tag QR único para tu mascota. Si alguien lo encuentra, escanea el código y te contacta al instante.',
    highlight: 'Identificación instantánea'
  },
  {
    icon: FileText,
    title: 'Recetas y Facturas Digitales',
    description: 'Todas las recetas del veterinario en tu celular. Facturas organizadas. Todo listo para el seguro si tenés.',
    highlight: 'Documentos siempre a mano'
  },
  {
    icon: Star,
    title: 'Puntos por Cada Visita',
    description: 'Acumulá puntos de lealtad en cada consulta y compra. Canjeálos por descuentos en servicios o productos.',
    highlight: 'Programa de recompensas'
  }
];

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Beneficios Reales
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Todos ganan con VetePy
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            No es solo un sitio web bonito. Es una herramienta que genera resultados medibles
            para tu clínica y mejora la experiencia de tus clientes.
          </p>
        </div>

        {/* Two-column benefits */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Clinics */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2DCEA3] to-[#00C9FF] flex items-center justify-center shadow-lg shadow-[#2DCEA3]/20">
                <Building2 className="w-7 h-7 text-[#0F172A]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Para tu Clínica</h3>
                <p className="text-white/50">Crecé y profesionalizá tu negocio</p>
              </div>
            </div>

            <div className="space-y-4">
              {clinicBenefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#2DCEA3]/30 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#2DCEA3]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2DCEA3]/20 transition-colors">
                    <benefit.icon className="w-5 h-5 text-[#2DCEA3]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-bold">{benefit.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#2DCEA3]/10 text-[#2DCEA3] text-xs font-medium whitespace-nowrap">
                        {benefit.highlight}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Pet Owners */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#5C6BFF] to-[#00C9FF] flex items-center justify-center shadow-lg shadow-[#5C6BFF]/20">
                <PawPrint className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Para los Dueños</h3>
                <p className="text-white/50">Mejor cuidado para sus mascotas</p>
              </div>
            </div>

            <div className="space-y-4">
              {ownerBenefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#5C6BFF]/30 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#5C6BFF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#5C6BFF]/20 transition-colors">
                    <benefit.icon className="w-5 h-5 text-[#5C6BFF]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-bold">{benefit.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#5C6BFF]/10 text-[#5C6BFF] text-xs font-medium whitespace-nowrap">
                        {benefit.highlight}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom callout */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-8 py-6 rounded-2xl bg-gradient-to-r from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#2DCEA3]" />
              <div className="text-left">
                <p className="text-white font-bold">Clínicas más eficientes</p>
                <p className="text-white/50 text-sm">Menos admin, más medicina</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-6 h-6 text-[#5C6BFF]" />
              <div className="text-left">
                <p className="text-white font-bold">Mascotas mejor cuidadas</p>
                <p className="text-white/50 text-sm">Dueños más informados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
