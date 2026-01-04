'use client'

import { Search, DollarSign, Clock, TrendingDown, ArrowDown, AlertTriangle } from 'lucide-react'

const problems = [
  {
    icon: Search,
    title: 'Invisibles Online',
    description:
      'Cuando buscan "veterinaria cerca", tu clinica no aparece. Los clientes van a la competencia.',
    stat: '90%',
    statLabel: 'buscan online primero',
    color: '#EF4444',
  },
  {
    icon: DollarSign,
    title: 'Sitios Web Carisimos',
    description:
      'Un sitio web propio cuesta Gs 10-15 millones. Mas hosting. Mas mantenimiento. Inaccesible.',
    stat: '₲10M+',
    statLabel: 'costo tipico',
    color: '#F97316',
  },
  {
    icon: Clock,
    title: 'Citas por Telefono',
    description:
      'Atendiendo llamadas todo el dia mientras las cadenas grandes tienen reservas online 24/7.',
    stat: '5+',
    statLabel: 'llamadas perdidas/dia',
    color: '#FBBF24',
  },
  {
    icon: TrendingDown,
    title: 'Perdiendo Clientes',
    description:
      'Los duenos quieren ver vacunas online. Historial digital. Si no lo ofreces, se van.',
    stat: '40%',
    statLabel: 'esperan acceso digital',
    color: '#EF4444',
  },
]

export function ProblemSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#0D1424] py-16 md:py-24">
      {/* Top accent line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header - More concise */}
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-bold text-red-400">El Problema</span>
          </div>
          <h2 className="mb-4 text-2xl font-black leading-tight text-white sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl">
            Las veterinarias independientes
            <span className="block text-red-400">estan perdiendo terreno</span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-white/60 md:text-base lg:text-lg">
            Las grandes cadenas invierten en tecnologia. Las clinicas independientes siguen igual.
          </p>
        </div>

        {/* Problem Cards - 2x2 grid, cleaner design */}
        <div className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:mb-14 md:gap-6">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] md:p-6"
            >
              {/* Top row: Icon + Stat */}
              <div className="mb-4 flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 md:h-12 md:w-12"
                  style={{ backgroundColor: `${problem.color}15` }}
                >
                  <problem.icon
                    className="h-5 w-5 md:h-6 md:w-6"
                    style={{ color: problem.color }}
                  />
                </div>
                <div className="text-right">
                  <div className="text-xl font-black md:text-2xl" style={{ color: problem.color }}>
                    {problem.stat}
                  </div>
                  <div className="text-[10px] text-white/40 md:text-xs">{problem.statLabel}</div>
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-2 text-base font-bold text-white md:text-lg">{problem.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{problem.description}</p>
            </div>
          ))}
        </div>

        {/* Urgency callout - Simpler */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/10 px-6 py-4">
            <p className="text-sm text-white/80 md:text-base">
              <span className="font-bold text-red-400">Cada mes sin presencia digital</span> =
              clientes que van a la competencia
            </p>
          </div>
        </div>

        {/* Transition to solution */}
        <div className="mt-12 flex flex-col items-center md:mt-16">
          <p className="mb-3 text-sm text-white/40">Pero hay una solucion</p>
          <ArrowDown className="h-5 w-5 animate-bounce text-[#2DCEA3]" />
        </div>
      </div>
    </section>
  )
}
