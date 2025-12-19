'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import {
  Species,
  DogSize,
  CatType,
  BirdCategory,
  TurtleType,
  FishType,
  DOG_SIZE_CONFIG,
  CAT_TYPE_CONFIG,
  BIRD_CONFIG,
} from '@/lib/age-calculator/configs';

interface SubSpeciesSelectorProps {
  species: Species;
  dogSize: DogSize;
  catType: CatType;
  birdCategory: BirdCategory;
  turtleType: TurtleType;
  fishType: FishType;
  onDogSizeChange: (size: DogSize) => void;
  onCatTypeChange: (type: CatType) => void;
  onBirdCategoryChange: (category: BirdCategory) => void;
  onTurtleTypeChange: (type: TurtleType) => void;
  onFishTypeChange: (type: FishType) => void;
}

export function SubSpeciesSelector({
  species,
  dogSize,
  catType,
  birdCategory,
  turtleType,
  fishType,
  onDogSizeChange,
  onCatTypeChange,
  onBirdCategoryChange,
  onTurtleTypeChange,
  onFishTypeChange,
}: SubSpeciesSelectorProps) {
  return (
    <AnimatePresence mode="wait">
      {species === 'dog' && (
        <motion.div
          key="dog-options"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            2. Tamaño del perro
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(DOG_SIZE_CONFIG) as DogSize[]).map((size) => {
              const cfg = DOG_SIZE_CONFIG[size];
              return (
                <button
                  key={size}
                  onClick={() => onDogSizeChange(size)}
                  className={`py-3 px-2 rounded-xl text-center transition-all border-2 ${
                    dogSize === size
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-sm font-bold">{cfg.label}</span>
                  <span className={`block text-xs mt-0.5 ${dogSize === size ? 'text-white/80' : 'text-gray-400'}`}>
                    {cfg.weightRange}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <Icons.Info className="w-3 h-3" />
            {DOG_SIZE_CONFIG[dogSize].description}
          </p>
        </motion.div>
      )}

      {species === 'cat' && (
        <motion.div
          key="cat-options"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            2. Estilo de vida
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CAT_TYPE_CONFIG) as CatType[]).map((type) => {
              const cfg = CAT_TYPE_CONFIG[type];
              const icons = { indoor: Icons.Home, outdoor: Icons.Trees, mixed: Icons.ArrowLeftRight };
              const Icon = icons[type];
              return (
                <button
                  key={type}
                  onClick={() => onCatTypeChange(type)}
                  className={`py-4 px-3 rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${
                    catType === type
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bold text-sm">{cfg.label}</span>
                  <span className={`text-xs text-center ${catType === type ? 'text-white/80' : 'text-gray-400'}`}>
                    {cfg.description}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {species === 'bird' && (
        <motion.div
          key="bird-options"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            2. Tipo de ave
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(BIRD_CONFIG) as BirdCategory[]).map((cat) => {
              const cfg = BIRD_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => onBirdCategoryChange(cat)}
                  className={`py-3 px-2 rounded-xl text-center transition-all border-2 ${
                    birdCategory === cat
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-sm font-bold">{cfg.label}</span>
                  <span className={`block text-xs mt-0.5 ${birdCategory === cat ? 'text-white/80' : 'text-gray-400'}`}>
                    {cfg.avgLifespan.min}-{cfg.avgLifespan.max}a
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {species === 'turtle' && (
        <motion.div
          key="turtle-options"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            2. Tipo de tortuga
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['aquatic', 'terrestrial'] as TurtleType[]).map((type) => {
              const isAquatic = type === 'aquatic';
              return (
                <button
                  key={type}
                  onClick={() => onTurtleTypeChange(type)}
                  className={`py-4 px-4 rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${
                    turtleType === type
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{isAquatic ? '🐢' : '🐢'}</span>
                  <span className="font-bold">{isAquatic ? 'Acuática' : 'Terrestre'}</span>
                  <span className={`text-xs ${turtleType === type ? 'text-white/80' : 'text-gray-400'}`}>
                    {isAquatic ? 'Orejas rojas, pintadas' : 'Sulcata, mediterránea'}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {species === 'fish' && (
        <motion.div
          key="fish-options"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            2. Tipo de pez
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['tropical', 'goldfish', 'koi'] as FishType[]).map((type) => {
              const labels = { tropical: 'Tropical', goldfish: 'Pez Dorado', koi: 'Koi / Carpa' };
              const descs = { tropical: 'Betta, guppy, tetra', goldfish: 'Común, cometa', koi: 'Estanque' };
              return (
                <button
                  key={type}
                  onClick={() => onFishTypeChange(type)}
                  className={`py-3 px-2 rounded-xl text-center transition-all border-2 ${
                    fishType === type
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-sm font-bold">{labels[type]}</span>
                  <span className={`block text-xs mt-0.5 ${fishType === type ? 'text-white/80' : 'text-gray-400'}`}>
                    {descs[type]}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
