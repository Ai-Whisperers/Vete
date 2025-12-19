'use client';

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Species, SPECIES_CONFIG } from '@/lib/age-calculator/configs';

interface SpeciesSelectorProps {
  selected: Species;
  onChange: (species: Species) => void;
}

export function SpeciesSelector({ selected, onChange }: SpeciesSelectorProps) {
  const speciesConfig = SPECIES_CONFIG[selected];

  // Get icon component
  const getIcon = (name: string): React.ComponentType<{ className?: string }> => {
    const icon = (Icons as Record<string, unknown>)[name];
    return (typeof icon === 'function' ? icon : Icons.PawPrint) as React.ComponentType<{ className?: string }>;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          1. Tipo de mascota
        </label>
        <span className="text-xs text-gray-400">
          {speciesConfig.avgLifespan.min}-{speciesConfig.avgLifespan.max} años promedio
        </span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {(Object.keys(SPECIES_CONFIG) as Species[]).map((s) => {
          const cfg = SPECIES_CONFIG[s];
          const IconComp = getIcon(cfg.icon);
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={`relative p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                selected === s
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]'
                  : 'border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600'
              }`}
              title={cfg.label}
            >
              <span className="text-lg sm:text-xl">{cfg.emoji}</span>
              <span className="text-[10px] sm:text-xs font-bold truncate w-full text-center">{cfg.label}</span>
              {selected === s && (
                <motion.div layoutId="species-check" className="absolute -top-1 -right-1">
                  <Icons.CheckCircle2 className="w-4 h-4 text-[var(--primary)] bg-white rounded-full" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
