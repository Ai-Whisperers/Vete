'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { CalculationResult } from '@/hooks/use-age-calculation';
import { SpeciesConfig } from '@/lib/age-calculator/configs';

interface MethodologyPanelProps {
  result: CalculationResult;
  speciesConfig: SpeciesConfig;
}

export function MethodologyPanel({ result, speciesConfig }: MethodologyPanelProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowMethodology(!showMethodology)}
        className="w-full text-left p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.BookOpen className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-bold text-gray-700">Metodología de cálculo</span>
          </div>
          <Icons.ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${showMethodology ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {showMethodology && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Fórmula aplicada</p>
                <code className="block bg-gray-50 px-4 py-2 rounded-lg text-sm text-[var(--primary)] font-mono">
                  {result.formula}
                </code>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pasos del cálculo</p>
                <div className="space-y-2">
                  {result.breakdown.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-600">{step.description}</p>
                        <p className="font-mono text-gray-400 text-xs">
                          {step.calculation} {step.result}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400">
                  <strong>Fuentes:</strong> {speciesConfig.sources.join(', ')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
