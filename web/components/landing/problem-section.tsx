'use client';

import { Search, DollarSign, Clock, TrendingDown, ArrowDown, AlertTriangle } from 'lucide-react';

const problems = [
  {
    icon: Search,
    title: 'Invisibles Online',
    description: 'Cuando buscan "veterinaria cerca", tu clinica no aparece. Los clientes van a la competencia.',
    stat: '90%',
    statLabel: 'buscan online primero',
    color: '#EF4444'
  },
  {
    icon: DollarSign,
    title: 'Sitios Web Carisimos',
    description: 'Un sitio web propio cuesta Gs 10-15 millones. Mas hosting. Mas mantenimiento. Inaccesible.',
    stat: '₲10M+',
    statLabel: 'costo tipico',
    color: '#F97316'
  },
  {
    icon: Clock,
    title: 'Citas por Telefono',
    description: 'Atendiendo llamadas todo el dia mientras las cadenas grandes tienen reservas online 24/7.',
    stat: '5+',
    statLabel: 'llamadas perdidas/dia',
    color: '#FBBF24'
  },
  {
    icon: TrendingDown,
    title: 'Perdiendo Clientes',
    description: 'Los duenos quieren ver vacunas online. Historial digital. Si no lo ofreces, se van.',
    stat: '40%',
    statLabel: 'esperan acceso digital',
    color: '#EF4444'
  },
];

export function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#0F172A] to-[#0D1424] relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header - More concise */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-bold">El Problema</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
            Las veterinarias independientes
            <span className="block text-red-400">estan perdiendo terreno</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
            Las grandes cadenas invierten en tecnologia. Las clinicas independientes siguen igual.
          </p>
        </div>

        {/* Problem Cards - 2x2 grid, cleaner design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto mb-10 md:mb-14">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className="group relative p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Top row: Icon + Stat */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${problem.color}15` }}
                >
                  <problem.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: problem.color }} />
                </div>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-black" style={{ color: problem.color }}>
                    {problem.stat}
                  </div>
                  <div className="text-[10px] md:text-xs text-white/40">{problem.statLabel}</div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-base md:text-lg font-bold text-white mb-2">
                {problem.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Urgency callout - Simpler */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
            <p className="text-white/80 text-sm md:text-base">
              <span className="font-bold text-red-400">Cada mes sin presencia digital</span>{' '}
              = clientes que van a la competencia
            </p>
          </div>
        </div>

        {/* Transition to solution */}
        <div className="flex flex-col items-center mt-12 md:mt-16">
          <p className="text-white/40 text-sm mb-3">Pero hay una solucion</p>
          <ArrowDown className="w-5 h-5 text-[#2DCEA3] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
