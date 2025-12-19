'use client';

import { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Species, BirdCategory, TurtleType, FishType, getAgePresets } from '@/lib/age-calculator/configs';

interface AgeInputProps {
  species: Species;
  birdCategory: BirdCategory;
  turtleType: TurtleType;
  fishType: FishType;
  age: string;
  ageUnit: 'years' | 'months';
  hasSubOptions: boolean;
  onAgeChange: (age: string) => void;
  onAgeUnitChange: (unit: 'years' | 'months') => void;
  onCalculate: () => void;
}

export function AgeInput({
  species,
  birdCategory,
  turtleType,
  fishType,
  age,
  ageUnit,
  hasSubOptions,
  onAgeChange,
  onAgeUnitChange,
  onCalculate,
}: AgeInputProps) {
  // Dynamic age presets based on species
  const agePresets = useMemo(() => {
    return getAgePresets(species, birdCategory, turtleType, fishType);
  }, [species, birdCategory, turtleType, fishType]);

  // Handle preset click
  const handlePresetClick = (preset: { value: number; unit: string }) => {
    if (preset.unit === 'months') {
      onAgeUnitChange('months');
      onAgeChange(preset.value.toString());
    } else {
      onAgeUnitChange('years');
      onAgeChange(preset.value.toString());
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        {hasSubOptions ? '3' : '2'}. Edad de tu mascota
      </label>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2 justify-center">
        {agePresets.map((preset, i) => {
          const isActive = ageUnit === (preset.unit === 'months' ? 'months' : 'years') && parseFloat(age) === preset.value;
          return (
            <button
              key={i}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                isActive ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {preset.unit === 'months' ? `${preset.value}m` : `${preset.value}a`}
            </button>
          );
        })}
      </div>

      {/* Age input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="number"
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
            placeholder="0"
            className="w-full text-3xl sm:text-4xl font-black p-4 pr-20 rounded-xl border-2 border-gray-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 text-center outline-none transition-all"
            min="0"
            max="200"
            step="0.1"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onAgeUnitChange('years')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                ageUnit === 'years' ? 'bg-white shadow text-[var(--primary)]' : 'text-gray-500'
              }`}
            >
              Años
            </button>
            <button
              onClick={() => onAgeUnitChange('months')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                ageUnit === 'months' ? 'bg-white shadow text-[var(--primary)]' : 'text-gray-500'
              }`}
            >
              Meses
            </button>
          </div>
        </div>
        <button
          onClick={onCalculate}
          disabled={!age || parseFloat(age) <= 0}
          className="bg-[var(--primary)] text-white font-bold px-6 sm:px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          <Icons.Sparkles className="w-5 h-5" />
          <span className="hidden sm:inline">Calcular</span>
        </button>
      </div>
    </div>
  );
}
