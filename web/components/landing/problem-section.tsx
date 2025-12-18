import { XCircle, Clock, DollarSign, Users, TrendingDown, Search } from 'lucide-react';

const problems = [
  {
    icon: Search,
    title: 'Invisibles en Google',
    description: 'Cuando alguien busca "veterinaria cerca de mí", tu clínica no aparece. Los clientes encuentran a tu competencia primero.',
    stat: '90%',
    statLabel: 'de dueños buscan veterinarias online'
  },
  {
    icon: DollarSign,
    title: 'Sitios Web Carísimos',
    description: 'Cotizaste un sitio web y te pidieron 5-15 millones de guaraníes. Más hosting mensual. Más cada cambio que necesites hacer.',
    stat: '₲10M+',
    statLabel: 'costo típico de desarrollo'
  },
  {
    icon: Clock,
    title: 'Citas por Teléfono',
    description: 'Seguís atendiendo llamadas para agendar turnos. Mientras tanto, las cadenas grandes permiten reservas online 24/7.',
    stat: '3-5',
    statLabel: 'llamadas perdidas por día'
  },
  {
    icon: TrendingDown,
    title: 'Sin Historial Digital',
    description: 'Los dueños quieren ver las vacunas de su mascota online. No pueden. Se van a una clínica que sí lo ofrece.',
    stat: '40%',
    statLabel: 'esperan acceso digital'
  },
  {
    icon: Users,
    title: 'Competencia Desleal',
    description: 'Las franquicias veterinarias tienen presupuesto para marketing digital. Vos no. Cada año pierdes más mercado.',
    stat: '2x',
    statLabel: 'crecimiento de cadenas vs independientes'
  },
  {
    icon: XCircle,
    title: 'Tecnología Complicada',
    description: 'No sos programador. No tenés tiempo de aprender WordPress. Y contratar a alguien es caro e inseguro.',
    stat: '80%',
    statLabel: 'de vets sin conocimientos técnicos'
  }
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2DCEA3]/30 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-red-400 font-bold tracking-widest uppercase text-sm mb-3">
            El Problema
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Las veterinarias independientes{' '}
            <span className="text-red-400">están perdiendo terreno</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            Mientras las grandes cadenas veterinarias invierten en tecnología y marketing digital,
            las clínicas independientes en Paraguay siguen operando como hace 20 años.
            <span className="text-white font-medium"> Eso tiene que cambiar.</span>
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-400/30 transition-all duration-300"
            >
              {/* Stat badge */}
              <div className="absolute -top-3 right-4">
                <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                  <span className="text-red-400 font-bold text-sm">{problem.stat}</span>
                </div>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                <problem.icon className="w-6 h-6 text-red-400" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2">
                {problem.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-3">
                {problem.description}
              </p>
              <p className="text-red-400/70 text-xs font-medium">
                {problem.statLabel}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom urgency message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <p className="text-white/80 text-sm md:text-base">
              <span className="font-bold text-red-400">Cada mes sin presencia digital</span>{' '}
              son clientes que van a tu competencia y no vuelven.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
