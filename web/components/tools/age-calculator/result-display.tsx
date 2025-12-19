'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { CalculationResult } from '@/hooks/use-age-calculation';
import { SPECIES_CONFIG, Species } from '@/lib/age-calculator/configs';
import { LifeStageCard } from './life-stage-card';
import { HealthTips } from './health-tips';
import { MethodologyPanel } from './methodology-panel';
import { MilestonesPanel } from './milestones-panel';

interface ResultDisplayProps {
  result: CalculationResult;
  species: Species;
  ageInYears: number;
  whatsappNumber?: string;
}

// Get icon component
const getIcon = (name: string): React.ComponentType<{ className?: string }> => {
  const icon = (Icons as Record<string, unknown>)[name];
  return (typeof icon === 'function' ? icon : Icons.PawPrint) as React.ComponentType<{ className?: string }>;
};

export function ResultDisplay({ result, species, ageInYears, whatsappNumber }: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<'result' | 'health' | 'milestones'>('result');
  const speciesConfig = SPECIES_CONFIG[species];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-t-2 border-dashed border-gray-200 pt-6 space-y-6"
    >
      {/* Main Result */}
      <div className="text-center">
        <p className="text-[var(--text-muted)] font-medium mb-2">
          Tu {speciesConfig.label.toLowerCase()} de {ageInYears.toFixed(1)} años equivale a:
        </p>
        <div className="flex items-center justify-center gap-4">
          <span className="text-6xl sm:text-8xl font-black text-[var(--primary)]">{result.humanAge}</span>
          <div className="text-left">
            <span className="block text-xl text-gray-400 font-bold">años</span>
            <span className="block text-sm text-gray-400">humanos</span>
          </div>
        </div>

        {/* Life Stage Badge */}
        <div
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold border mt-4 ${result.lifeStage.color}`}
        >
          {(() => {
            const Icon = getIcon(result.lifeStage.icon);
            return <Icon className="w-5 h-5" />;
          })()}
          {result.lifeStage.label}
          <span className="text-xs opacity-70">({result.lifeStage.ageRange})</span>
        </div>

        {/* Life expectancy bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>0 años</span>
            <span>
              Esperanza: {result.lifeExpectancy.min}-{result.lifeExpectancy.max} años
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (ageInYears / result.lifeExpectancy.max) * 100)}%` }}
            />
            <div
              className="absolute top-0 h-full w-1 bg-[var(--primary)] rounded-full shadow-md"
              style={{ left: `${Math.min(98, (ageInYears / result.lifeExpectancy.max) * 100)}%` }}
            />
          </div>
          {result.lifeExpectancy.remaining.max > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Expectativa restante: {result.lifeExpectancy.remaining.min.toFixed(1)} -{' '}
              {result.lifeExpectancy.remaining.max.toFixed(1)} años
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'result', label: 'Cálculo', icon: 'Calculator' },
          { key: 'health', label: 'Salud', icon: 'Heart' },
          { key: 'milestones', label: 'Hitos', icon: 'Flag' },
        ].map((tab) => {
          const Icon = getIcon(tab.icon);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'result' && (
          <motion.div key="result-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MethodologyPanel result={result} speciesConfig={speciesConfig} />
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div
            key="health-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Life stage info */}
            <LifeStageCard lifeStage={result.lifeStage} />

            {/* Health tips */}
            <HealthTips healthTips={result.healthTips} />

            {/* CTA */}
            {whatsappNumber && (
              <div className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--primary)]/10 rounded-xl p-5 border border-[var(--primary)]/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-800">¿Necesita un chequeo?</p>
                    <p className="text-sm text-gray-600">Agenda una consulta veterinaria</p>
                  </div>
                  <Link
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hola, tengo un ${speciesConfig.label.toLowerCase()} de ${ageInYears.toFixed(
                        1
                      )} años (${result.humanAge} años humanos) en etapa ${
                        result.lifeStage.label
                      }. Me gustaría agendar un chequeo.`
                    )}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                  >
                    <Icons.MessageCircle className="w-5 h-5" />
                    Agendar cita
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'milestones' && (
          <motion.div key="milestones-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MilestonesPanel milestones={result.milestones} ageInYears={ageInYears} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
