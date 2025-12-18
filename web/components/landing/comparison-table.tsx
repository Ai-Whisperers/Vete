import { Check, X, Minus, ArrowRight, Zap } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  vetepy: string | boolean;
  traditional: string | boolean;
  diy: string | boolean;
  nothing: string | boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Costo inicial',
    vetepy: '₲700K',
    traditional: '₲10-15M',
    diy: '₲500K-2M',
    nothing: '₲0'
  },
  {
    feature: 'Costo mensual',
    vetepy: '₲200K',
    traditional: '₲500K+',
    diy: '₲100-300K',
    nothing: '₲0'
  },
  {
    feature: 'Tiempo hasta estar online',
    vetepy: '3-7 dias',
    traditional: '2-4 meses',
    diy: '1-3 meses',
    nothing: '-'
  },
  {
    feature: 'Diseno profesional',
    vetepy: true,
    traditional: true,
    diy: false,
    nothing: false
  },
  {
    feature: 'Sistema de citas online',
    vetepy: true,
    traditional: 'Extra',
    diy: false,
    nothing: false
  },
  {
    feature: 'Historial medico digital',
    vetepy: true,
    traditional: 'Extra',
    diy: false,
    nothing: false
  },
  {
    feature: 'Portal para duenos',
    vetepy: true,
    traditional: 'Extra',
    diy: false,
    nothing: false
  },
  {
    feature: 'Actualizaciones incluidas',
    vetepy: true,
    traditional: false,
    diy: false,
    nothing: false
  },
  {
    feature: 'Soporte tecnico',
    vetepy: true,
    traditional: 'Extra',
    diy: false,
    nothing: false
  },
  {
    feature: 'Optimizado para moviles',
    vetepy: true,
    traditional: 'Depende',
    diy: 'Depende',
    nothing: false
  },
  {
    feature: 'SEO optimizado',
    vetepy: true,
    traditional: 'Depende',
    diy: false,
    nothing: false
  },
  {
    feature: 'Seguridad y backups',
    vetepy: true,
    traditional: 'Extra',
    diy: 'Tu problema',
    nothing: false
  }
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-[#2DCEA3]/20 flex items-center justify-center">
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
      <span className={`text-sm ${
        value === 'Extra' ? 'text-yellow-400' :
        value === 'Depende' ? 'text-yellow-400' :
        value === 'Tu problema' ? 'text-red-400' :
        'text-white/40'
      }`}>
        {value}
      </span>
    );
  }
  return <span className="text-white text-sm font-medium">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2DCEA3]/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Comparacion
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            VetePy vs las alternativas
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Compara VetePy con otras opciones y descubri por que somos
            la mejor relacion costo-beneficio del mercado.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full min-w-[700px]">
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
                    <span className="text-white font-bold text-sm">Desarrollo<br/>Tradicional</span>
                    <span className="text-white/40 text-xs">Agencia</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-white font-bold text-sm">Hacerlo<br/>Vos Mismo</span>
                    <span className="text-white/40 text-xs">WordPress/Wix</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-white font-bold text-sm">No hacer<br/>nada</span>
                    <span className="text-white/40 text-xs">Solo redes</span>
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
                  <td className="py-4 px-4 text-white/70 text-sm">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center bg-[#2DCEA3]/5">
                    <CellValue value={row.vetepy} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <CellValue value={row.traditional} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <CellValue value={row.diy} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <CellValue value={row.nothing} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="grid md:grid-cols-3 gap-6">
            {/* VetePy Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-[#2DCEA3]/30">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#2DCEA3]" />
                <h3 className="text-white font-bold">VetePy</h3>
              </div>
              <p className="text-white/60 text-sm mb-4">
                La mejor opcion para clinicas que quieren resultados rapidos
                sin complicaciones tecnicas ni grandes inversiones.
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
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-white font-bold mb-3">Desarrollo Tradicional</h3>
              <p className="text-white/60 text-sm mb-4">
                Buena opcion si tenes presupuesto grande y tiempo para esperar.
                Pero requiere mantenimiento continuo.
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
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-white font-bold mb-3">Hacerlo Vos Mismo</h3>
              <p className="text-white/60 text-sm mb-4">
                Posible si tenes tiempo y conocimientos tecnicos.
                Pero el resultado suele ser limitado.
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
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#precios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full hover:shadow-lg hover:shadow-[#2DCEA3]/20 transition-all"
          >
            Ver Precios de VetePy
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
