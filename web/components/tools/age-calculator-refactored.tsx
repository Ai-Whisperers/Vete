'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Species, DogSize, CatType, BirdCategory, TurtleType, FishType, SPECIES_CONFIG } from '@/lib/age-calculator/configs';
import { useAgeCalculation, FormulaType } from '@/hooks/use-age-calculation';
import { SpeciesSelector } from './age-calculator/species-selector';
import { SubSpeciesSelector } from './age-calculator/sub-species-selector';
import { AgeInput } from './age-calculator/age-input';
import { ResultDisplay } from './age-calculator/result-display';

interface AgeCalculatorConfig {
  contact: {
    whatsapp_number?: string;
  };
}

export function AgeCalculator({ config }: { config: AgeCalculatorConfig }) {
  // State
  const [species, setSpecies] = useState<Species>('dog');
  const [dogSize, setDogSize] = useState<DogSize>('medium');
  const [catType, setCatType] = useState<CatType>('indoor');
  const [birdCategory, setBirdCategory] = useState<BirdCategory>('parakeet');
  const [turtleType, setTurtleType] = useState<TurtleType>('aquatic');
  const [fishType, setFishType] = useState<FishType>('tropical');
  const [age, setAge] = useState<string>('');
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>('years');
  const [formulaType, setFormulaType] = useState<FormulaType>('classic');

  // Get current species config
  const speciesConfig = SPECIES_CONFIG[species];

  // Use the age calculation hook
  const { result, calculate, reset } = useAgeCalculation(
    species,
    dogSize,
    catType,
    birdCategory,
    turtleType,
    fishType
  );

  // Convert age to years
  const ageInYears = useMemo(() => {
    const numAge = parseFloat(age) || 0;
    return ageUnit === 'months' ? numAge / 12 : numAge;
  }, [age, ageUnit]);

  // Handle calculation
  const handleCalculate = () => {
    if (!age || ageInYears <= 0) return;
    calculate(ageInYears, formulaType);
  };

  // Reset when species changes
  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    reset();
    setAge('');
  };

  // Reset result when sub-options change
  const handleSubOptionChange = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value);
      reset();
    };
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Icons.Calculator className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black mb-2">Calculadora de Edad para Mascotas</h2>
            <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
              Conversión precisa a años humanos basada en investigación científica veterinaria.
            </p>

            {/* Formula toggle for dogs */}
            {species === 'dog' && (
              <div className="mt-4 inline-flex items-center bg-white/10 rounded-full p-1">
                <button
                  onClick={() => setFormulaType('classic')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    formulaType === 'classic' ? 'bg-white text-[var(--primary)]' : 'text-white hover:bg-white/10'
                  }`}
                >
                  Clásica
                </button>
                <button
                  onClick={() => setFormulaType('logarithmic')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    formulaType === 'logarithmic' ? 'bg-white text-[var(--primary)]' : 'text-white hover:bg-white/10'
                  }`}
                >
                  Científica 2019
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Step 1: Species Selection */}
          <SpeciesSelector selected={species} onChange={handleSpeciesChange} />

          {/* Step 2: Sub-options */}
          <SubSpeciesSelector
            species={species}
            dogSize={dogSize}
            catType={catType}
            birdCategory={birdCategory}
            turtleType={turtleType}
            fishType={fishType}
            onDogSizeChange={handleSubOptionChange(setDogSize)}
            onCatTypeChange={handleSubOptionChange(setCatType)}
            onBirdCategoryChange={handleSubOptionChange(setBirdCategory)}
            onTurtleTypeChange={handleSubOptionChange(setTurtleType)}
            onFishTypeChange={handleSubOptionChange(setFishType)}
          />

          {/* Step 3: Age Input */}
          <AgeInput
            species={species}
            birdCategory={birdCategory}
            turtleType={turtleType}
            fishType={fishType}
            age={age}
            ageUnit={ageUnit}
            hasSubOptions={speciesConfig.hasSubOptions}
            onAgeChange={setAge}
            onAgeUnitChange={setAgeUnit}
            onCalculate={handleCalculate}
          />

          {/* Results */}
          <AnimatePresence>
            {result && (
              <ResultDisplay
                result={result}
                species={species}
                ageInYears={ageInYears}
                whatsappNumber={config.contact.whatsapp_number}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Icons.Info className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-600">Nota importante</p>
              <p>
                Esta calculadora proporciona una estimación basada en promedios científicos. La edad biológica real puede
                variar según genética, dieta, cuidados y condiciones de salud individuales. Consulta siempre con un
                veterinario para una evaluación precisa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
