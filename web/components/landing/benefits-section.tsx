'use client';

import {
  Building2, PawPrint, DollarSign, Clock, Shield, Zap,
  HeartHandshake, Smartphone, Bell, Star, QrCode,
  TrendingUp, Users, Calendar, FileText, Award, Heart
} from 'lucide-react';

const clinicBenefits = [
  {
    icon: TrendingUp,
    title: 'Mas Clientes Nuevos',
    description: 'Aparece en Google cuando busquen "veterinaria cerca de mi". El 90% busca online antes de elegir.',
    highlight: '+30% consultas'
  },
  {
    icon: Clock,
    title: 'Ahorra Horas',
    description: 'El sistema recibe reservas 24/7 mientras vos atendes pacientes. Basta de llamadas.',
    highlight: '5h/semana'
  },
  {
    icon: DollarSign,
    title: 'Precio Accesible',
    description: 'Una fraccion del costo de un sitio desde cero. Se paga con 2-3 clientes nuevos al mes.',
    highlight: '90% menos'
  },
  {
    icon: Shield,
    title: 'Cero Tecnicismos',
    description: 'Hosting, SSL, backups, actualizaciones, seguridad... Todo resuelto. Vos solo atendes animales.',
    highlight: 'Todo incluido'
  },
  {
    icon: Award,
    title: 'Imagen Profesional',
    description: 'Competi de igual a igual con las grandes cadenas. Tu clinica se ve profesional.',
    highlight: 'Primer nivel'
  },
  {
    icon: Zap,
    title: 'Online Rapido',
    description: 'No esperes meses. En una semana ya estas recibiendo clientes online.',
    highlight: '3-7 dias'
  }
];

const ownerBenefits = [
  {
    icon: Smartphone,
    title: 'Todo en tu Celular',
    description: 'Historial medico, vacunas, recetas, facturas. Toda la info de tu mascota, accesible 24/7.',
    highlight: 'Siempre accesible'
  },
  {
    icon: Bell,
    title: 'Recordatorios',
    description: 'Te avisamos por WhatsApp cuando se acerca la fecha de vacunacion. Mascota siempre protegida.',
    highlight: 'Automaticos'
  },
  {
    icon: Calendar,
    title: 'Agenda Sin Llamar',
    description: 'Elegi fecha, hora y veterinario desde el celular. Confirmacion instantanea.',
    highlight: 'Online 24/7'
  },
  {
    icon: QrCode,
    title: 'Tag de Identificacion',
    description: 'Tag QR unico. Si alguien encuentra tu mascota, escanea el codigo y te contacta.',
    highlight: 'Anti-perdida'
  },
  {
    icon: FileText,
    title: 'Documentos Digitales',
    description: 'Todas las recetas y facturas en tu celular. Todo listo para el seguro.',
    highlight: 'Organizados'
  },
  {
    icon: Star,
    title: 'Puntos de Lealtad',
    description: 'Acumula puntos en cada consulta y compra. Canjealos por descuentos.',
    highlight: 'Recompensas'
  }
];

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DCEA3]/10 border border-[#2DCEA3]/20 mb-4">
            <Heart className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-[#2DCEA3] text-sm font-bold">Beneficios</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6">
            Todos ganan con VetePy
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base lg:text-lg">
            No es solo un sitio web. Es una herramienta que genera resultados medibles.
          </p>
        </div>

        {/* Two-column benefits */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* For Clinics */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#2DCEA3] to-[#00C9FF] flex items-center justify-center shadow-lg shadow-[#2DCEA3]/20">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-[#0F172A]" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Para tu Clinica</h3>
                <p className="text-white/50 text-xs md:text-sm">Crece y profesionaliza tu negocio</p>
              </div>
            </div>

            <div className="space-y-3">
              {clinicBenefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#2DCEA3]/30 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#2DCEA3]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2DCEA3]/20 transition-colors">
                    <benefit.icon className="w-4 h-4 md:w-5 md:h-5 text-[#2DCEA3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-sm md:text-base">{benefit.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#2DCEA3]/10 text-[#2DCEA3] text-[10px] md:text-xs font-medium whitespace-nowrap">
                        {benefit.highlight}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs md:text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Pet Owners */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#5C6BFF] to-[#00C9FF] flex items-center justify-center shadow-lg shadow-[#5C6BFF]/20">
                <PawPrint className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Para los Dueños</h3>
                <p className="text-white/50 text-xs md:text-sm">Mejor cuidado para sus mascotas</p>
              </div>
            </div>

            <div className="space-y-3">
              {ownerBenefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#5C6BFF]/30 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#5C6BFF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#5C6BFF]/20 transition-colors">
                    <benefit.icon className="w-4 h-4 md:w-5 md:h-5 text-[#5C6BFF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-sm md:text-base">{benefit.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#5C6BFF]/10 text-[#5C6BFF] text-[10px] md:text-xs font-medium whitespace-nowrap">
                        {benefit.highlight}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs md:text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom callout */}
        <div className="mt-10 md:mt-14 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-6 py-5 rounded-2xl bg-gradient-to-r from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-white/10">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#2DCEA3]" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">Clinicas mas eficientes</p>
                <p className="text-white/50 text-xs">Menos admin, mas medicina</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-5 h-5 text-[#5C6BFF]" />
              <div className="text-left">
                <p className="text-white font-bold text-sm">Mascotas mejor cuidadas</p>
                <p className="text-white/50 text-xs">Dueños mas informados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
