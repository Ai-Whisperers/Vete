'use client';

import { Check, X, Minus, ArrowRight, Zap, Trophy } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  vetepy: string | boolean;
  traditional: string | boolean;
  diy: string | boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Costo inicial',
    vetepy: 'desde ₲0*',
    traditional: '₲5-10M',
    diy: '₲500K-2M'
  },
  {
    feature: 'Costo mensual',
    vetepy: 'desde ₲150K',
    traditional: '₲300-500K',
    diy: '₲100-200K'
  },
  {
    feature: 'Tiempo hasta estar online',
    vetepy: '3-7 dias',
    traditional: '2-4 meses',
    diy: '1-3 meses'
  },
  {
    feature: 'Diseño profesional',
    vetepy: true,
    traditional: true,
    diy: false
  },
  {
    feature: 'Sistema de citas online',
    vetepy: true,
    traditional: 'Extra',
    diy: false
  },
  {
    feature: 'Historial medico digital',
    vetepy: true,
    traditional: 'Extra',
    diy: false
  },
  {
    feature: 'Portal para dueños',
    vetepy: true,
    traditional: 'Extra',
    diy: false
  },
  {
    feature: 'Actualizaciones incluidas',
    vetepy: true,
    traditional: false,
    diy: false
  },
  {
    feature: 'Soporte tecnico',
    vetepy: true,
    traditional: 'Extra',
    diy: false
  },
  {
    feature: 'Optimizado para moviles',
    vetepy: true,
    traditional: 'Depende',
    diy: 'Depende'
  },
  {
    feature: 'SEO optimizado',
    vetepy: true,
    traditional: 'Depende',
    diy: false
  },
  {
    feature: 'Seguridad y backups',
    vetepy: true,
    traditional: 'Extra',
    diy: 'Tu problema'
  }
];

function CellValue({ value, isVetepy = false }: { value: string | boolean; isVetepy?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isVetepy ? 'bg-[#2DCEA3]/30' : 'bg-[#2DCEA3]/20'}`}>
          <Check className="w-4 h-4 text-[#2DCEA3]" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <X className="w-4 h-4 text-red-400" />
        </div>
      </div>
    );
  }
  if (value === '-' || value === 'Extra' || value === 'Depende' || value === 'Tu problema') {
    return (
      <span className={`text-xs md:text-sm ${
        value === 'Extra' ? 'text-yellow-400' :
        value === 'Depende' ? 'text-yellow-400' :
        value === 'Tu problema' ? 'text-red-400' :
        'text-white/40'
      }`}>
        {value}
      </span>
    );
  }
  return <span className={`text-xs md:text-sm font-medium ${isVetepy ? 'text-[#2DCEA3]' : 'text-white'}`}>{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="py-16 md:py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2DCEA3]/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DCEA3]/10 border border-[#2DCEA3]/20 mb-4">
            <Trophy className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-[#2DCEA3] text-sm font-bold">Comparacion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6">
            VetePy vs las alternativas
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base lg:text-lg">
            Compara y descubri por que somos la mejor relacion costo-beneficio.
          </p>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4 max-w-sm mx-auto">
          {/* VetePy Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-[#2DCEA3]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#2DCEA3]" />
                <span className="text-white font-bold">VetePy</span>
              </div>
              <span className="px-2 py-1 rounded-full bg-[#2DCEA3] text-[#0F172A] text-[10px] font-bold">
                RECOMENDADO
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Costo inicial</span>
                <span className="text-[#2DCEA3] font-bold text-sm">desde ₲0*</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Mensualidad</span>
                <span className="text-[#2DCEA3] font-bold text-sm">desde ₲150K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Tiempo online</span>
                <span className="text-white font-bold text-sm">3-7 dias</span>
              </div>
              <div className="pt-2 border-t border-white/10 space-y-2">
                {['Sistema de citas', 'Historial medico', 'Portal dueños', 'Soporte incluido'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2DCEA3]" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Traditional Card */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-white font-bold block mb-4">Desarrollo Tradicional</span>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Costo inicial</span>
                <span className="text-red-400 font-bold text-sm">₲5-10M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Mensualidad</span>
                <span className="text-red-400 font-bold text-sm">₲300-500K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Tiempo online</span>
                <span className="text-white/70 font-bold text-sm">2-4 meses</span>
              </div>
              <div className="pt-2 border-t border-white/10 space-y-2">
                {['Sistema de citas', 'Historial medico', 'Portal dueños', 'Soporte'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/50 text-sm">{item} = Extra</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DIY Card */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-white font-bold block mb-4">Hacerlo Vos Mismo</span>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Costo inicial</span>
                <span className="text-white/70 font-bold text-sm">₲500K-2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Mensualidad</span>
                <span className="text-white/70 font-bold text-sm">₲100-200K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Tiempo online</span>
                <span className="text-white/70 font-bold text-sm">1-3 meses</span>
              </div>
              <div className="pt-2 border-t border-white/10 space-y-2">
                {['Sistema de citas', 'Historial medico', 'Portal dueños', 'Soporte'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400" />
                    <span className="text-white/50 text-sm">{item} = No incluido</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">
                  Caracteristica
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF]">
                      <span className="text-[#0F172A] font-bold text-sm">VetePy</span>
                    </div>
                    <span className="text-[#2DCEA3] text-xs">Recomendado</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-white font-bold text-sm">Desarrollo Tradicional</span>
                    <span className="text-white/40 text-xs">Agencia/Freelancer</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-white font-bold text-sm">Hacerlo Vos Mismo</span>
                    <span className="text-white/40 text-xs">WordPress/Wix</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-t border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="py-3 px-4 text-white/70 text-sm">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-center bg-[#2DCEA3]/5">
                    <CellValue value={row.vetepy} isVetepy />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CellValue value={row.traditional} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CellValue value={row.diy} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-white/30 text-xs mt-4 text-center">
            *Configuracion diferida en Plan Semilla
          </p>
        </div>

        {/* Bottom Summary - Desktop only */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
          {/* VetePy Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-[#2DCEA3]/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-[#2DCEA3]" />
              <h3 className="text-white font-bold">VetePy</h3>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Resultados rapidos sin complicaciones tecnicas.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-[#2DCEA3]">
                <Check className="w-4 h-4" />
                Listo en dias
              </li>
              <li className="flex items-center gap-2 text-[#2DCEA3]">
                <Check className="w-4 h-4" />
                Todo incluido
              </li>
              <li className="flex items-center gap-2 text-[#2DCEA3]">
                <Check className="w-4 h-4" />
                Sin dolores de cabeza
              </li>
            </ul>
          </div>

          {/* Traditional Summary */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-white font-bold mb-3">Desarrollo Tradicional</h3>
            <p className="text-white/60 text-sm mb-4">
              Requiere presupuesto grande y tiempo para esperar.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-yellow-400">
                <Minus className="w-4 h-4" />
                Costo alto inicial
              </li>
              <li className="flex items-center gap-2 text-yellow-400">
                <Minus className="w-4 h-4" />
                Meses de desarrollo
              </li>
              <li className="flex items-center gap-2 text-yellow-400">
                <Minus className="w-4 h-4" />
                Extras cuestan mas
              </li>
            </ul>
          </div>

          {/* DIY Summary */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-white font-bold mb-3">Hacerlo Vos Mismo</h3>
            <p className="text-white/60 text-sm mb-4">
              Necesitas tiempo y conocimientos tecnicos.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-red-400">
                <X className="w-4 h-4" />
                Requiere tu tiempo
              </li>
              <li className="flex items-center gap-2 text-red-400">
                <X className="w-4 h-4" />
                Resultado amateur
              </li>
              <li className="flex items-center gap-2 text-red-400">
                <X className="w-4 h-4" />
                Sin sistema de gestion
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="#precios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full hover:shadow-lg hover:shadow-[#2DCEA3]/20 transition-all text-sm md:text-base"
          >
            Ver Precios de VetePy
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
