'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Users, ArrowRight, Sparkles } from 'lucide-react';

export function ROICalculator() {
  const [monthlyConsultations, setMonthlyConsultations] = useState(50);
  const [avgConsultationPrice, setAvgConsultationPrice] = useState(150000);

  const calculations = useMemo(() => {
    // VetePy costs
    const setupCost = 700000;
    const monthlyCost = 200000;

    // Expected growth from having online presence (conservative 10-20%)
    const expectedGrowthPercent = 0.15; // 15% average

    // New clients per month
    const newClientsPerMonth = Math.round(monthlyConsultations * expectedGrowthPercent);

    // Additional revenue per month
    const additionalRevenuePerMonth = newClientsPerMonth * avgConsultationPrice;

    // Months to recover investment
    const monthsToRecover = setupCost / (additionalRevenuePerMonth - monthlyCost);

    // ROI after 1 year
    const yearlyAdditionalRevenue = additionalRevenuePerMonth * 12;
    const yearlyVetepyCost = setupCost + (monthlyCost * 12);
    const yearlyROI = ((yearlyAdditionalRevenue - yearlyVetepyCost) / yearlyVetepyCost) * 100;

    // Break-even clients
    const breakEvenClients = Math.ceil(monthlyCost / avgConsultationPrice);

    return {
      newClientsPerMonth,
      additionalRevenuePerMonth,
      monthsToRecover: Math.max(1, Math.round(monthsToRecover * 10) / 10),
      yearlyROI: Math.round(yearlyROI),
      breakEvenClients,
      yearlyAdditionalRevenue,
      yearlyVetepyCost
    };
  }, [monthlyConsultations, avgConsultationPrice]);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `₲${(value / 1000000).toFixed(1)}M`;
    }
    return `₲${(value / 1000).toFixed(0)}K`;
  };

  return (
    <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2DCEA3]/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2DCEA3]/10 border border-[#2DCEA3]/20 mb-4">
            <Calculator className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-[#2DCEA3] text-sm font-medium">Calculadora de ROI</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            ¿Vale la pena la inversion?
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Ingresa los datos de tu clinica y descubri cuanto podes ganar
            con una presencia digital profesional.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#2DCEA3]" />
                Datos de tu Clinica
              </h3>

              {/* Monthly Consultations */}
              <div className="mb-8">
                <label className="block text-white/70 text-sm mb-2">
                  Consultas mensuales actuales
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={monthlyConsultations}
                    onChange={(e) => setMonthlyConsultations(Number(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2DCEA3] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="w-20 text-center">
                    <span className="text-2xl font-bold text-white">{monthlyConsultations}</span>
                  </div>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  Consultas que atendes por mes actualmente
                </p>
              </div>

              {/* Average Price */}
              <div className="mb-8">
                <label className="block text-white/70 text-sm mb-2">
                  Precio promedio de consulta (Gs)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50000"
                    max="400000"
                    step="10000"
                    value={avgConsultationPrice}
                    onChange={(e) => setAvgConsultationPrice(Number(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2DCEA3] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="w-24 text-center">
                    <span className="text-xl font-bold text-white">{formatCurrency(avgConsultationPrice)}</span>
                  </div>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  Incluye consultas generales, vacunas, emergencias, etc.
                </p>
              </div>

              {/* Assumptions */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-white/70 text-sm font-medium mb-2">Supuestos del calculo:</h4>
                <ul className="text-white/40 text-xs space-y-1">
                  <li>• Crecimiento estimado del 15% en clientes nuevos</li>
                  <li>• Basado en estudios de clinicas con presencia digital vs sin ella</li>
                  <li>• Resultados pueden variar segun ubicacion y servicios</li>
                </ul>
              </div>
            </div>

            {/* Results Panel */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-[#2DCEA3]/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2DCEA3]" />
                Resultados Estimados
              </h3>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-3xl font-black text-[#2DCEA3]">
                    +{calculations.newClientsPerMonth}
                  </div>
                  <div className="text-white/50 text-sm">Clientes nuevos/mes</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-3xl font-black text-white">
                    {formatCurrency(calculations.additionalRevenuePerMonth)}
                  </div>
                  <div className="text-white/50 text-sm">Ingreso extra/mes</div>
                </div>
              </div>

              {/* Highlight Metrics */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-white/70">Recuperas la inversion en:</span>
                  <span className="text-2xl font-bold text-[#2DCEA3]">
                    {calculations.monthsToRecover} {calculations.monthsToRecover === 1 ? 'mes' : 'meses'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-white/70">Clientes para cubrir mensualidad:</span>
                  <span className="text-2xl font-bold text-white">
                    {calculations.breakEvenClients}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#2DCEA3]/10 border border-[#2DCEA3]/20">
                  <span className="text-white">ROI primer ano:</span>
                  <span className="text-3xl font-black text-[#2DCEA3]">
                    +{calculations.yearlyROI}%
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#2DCEA3] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-white mb-1">
                      Con {monthlyConsultations} consultas mensuales a {formatCurrency(avgConsultationPrice)} promedio:
                    </p>
                    <p className="text-white/60">
                      VetePy se paga solo con apenas <strong className="text-[#2DCEA3]">{calculations.breakEvenClients} clientes nuevos</strong> al mes.
                      El resto es ganancia neta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-white/50 mb-4">
              ¿Listo para empezar a crecer?
            </p>
            <a
              href="https://wa.me/595981324569?text=Hola!%20Use%20la%20calculadora%20de%20ROI%20y%20me%20interesa%20VetePy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full hover:shadow-lg hover:shadow-[#2DCEA3]/20 transition-all"
            >
              Quiero Empezar
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
