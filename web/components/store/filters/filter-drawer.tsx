'use client';

import { useEffect } from 'react';
import { X, SlidersHorizontal, Star, Dog, Cat, Bird, Fish, Rabbit } from 'lucide-react';
import type {
  ProductFilters,
  AvailableFilters,
  Species,
  LifeStage,
  BreedSize,
  HealthCondition,
} from '@/lib/types/store';
import {
  SPECIES_LABELS,
  LIFE_STAGE_LABELS,
  BREED_SIZE_LABELS,
  HEALTH_CONDITION_LABELS,
} from '@/lib/types/store';
import PriceRangeSlider from './price-range-slider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilters;
  availableFilters: AvailableFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onClearFilters: () => void;
  onApply: () => void;
  resultCount: number;
}

const SPECIES_ICONS: Record<Species, React.ReactNode> = {
  perro: <Dog className="w-4 h-4" />,
  gato: <Cat className="w-4 h-4" />,
  ave: <Bird className="w-4 h-4" />,
  reptil: <span className="w-4 h-4 text-center">🦎</span>,
  pez: <Fish className="w-4 h-4" />,
  roedor: <span className="w-4 h-4 text-center">🐹</span>,
  conejo: <Rabbit className="w-4 h-4" />,
  otro: <span className="w-4 h-4 text-center">🐾</span>,
};

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  availableFilters,
  onFiltersChange,
  onClearFilters,
  onApply,
  resultCount,
}: Props) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const updateFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <T extends Species | LifeStage | BreedSize | HealthCondition>(
    key: 'species' | 'life_stages' | 'breed_sizes' | 'health_conditions',
    value: T
  ) => {
    const currentValues = (filters[key] || []) as T[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues.length > 0 ? newValues : undefined);
  };

  const handleApplyAndClose = () => {
    onApply();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold text-lg">Filtros</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-subtle)] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Filters */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Filtros Rápidos</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('in_stock_only', !filters.in_stock_only)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.in_stock_only
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                En Stock
              </button>
              <button
                onClick={() => updateFilter('on_sale', !filters.on_sale)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.on_sale
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                En Oferta
              </button>
              <button
                onClick={() => updateFilter('new_arrivals', !filters.new_arrivals)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.new_arrivals
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                Nuevos
              </button>
              <button
                onClick={() => updateFilter('best_sellers', !filters.best_sellers)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.best_sellers
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                Más Vendidos
              </button>
            </div>
          </div>

          {/* Categories */}
          {availableFilters.categories.length > 0 && (
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Categoría</h3>
              <div className="flex flex-wrap gap-2">
                {availableFilters.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      updateFilter('category', filters.category === cat.slug ? undefined : cat.slug)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.category === cat.slug
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Species */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Mascota</h3>
            <div className="grid grid-cols-4 gap-2">
              {availableFilters.species.map((s) => (
                <button
                  key={s.value}
                  onClick={() => toggleArrayFilter('species', s.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-sm transition-colors ${
                    filters.species?.includes(s.value)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="text-xl">{SPECIES_ICONS[s.value]}</span>
                  <span className="text-xs">{SPECIES_LABELS[s.value]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Life Stage */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Etapa de Vida</h3>
            <div className="flex flex-wrap gap-2">
              {availableFilters.life_stages.map((ls) => (
                <button
                  key={ls.value}
                  onClick={() => toggleArrayFilter('life_stages', ls.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.life_stages?.includes(ls.value)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {LIFE_STAGE_LABELS[ls.value]}
                </button>
              ))}
            </div>
          </div>

          {/* Breed Size */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Tamaño de Raza</h3>
            <div className="flex flex-wrap gap-2">
              {availableFilters.breed_sizes.map((bs) => (
                <button
                  key={bs.value}
                  onClick={() => toggleArrayFilter('breed_sizes', bs.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.breed_sizes?.includes(bs.value)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {BREED_SIZE_LABELS[bs.value]}
                </button>
              ))}
            </div>
          </div>

          {/* Health Conditions */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Necesidades Especiales</h3>
            <div className="flex flex-wrap gap-2">
              {availableFilters.health_conditions.map((hc) => (
                <button
                  key={hc.value}
                  onClick={() => toggleArrayFilter('health_conditions', hc.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.health_conditions?.includes(hc.value)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {HEALTH_CONDITION_LABELS[hc.value]}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          {availableFilters.brands.length > 0 && (
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Marca</h3>
              <div className="flex flex-wrap gap-2">
                {availableFilters.brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() =>
                      updateFilter('brand', filters.brand === brand.slug ? undefined : brand.slug)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.brand === brand.slug
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Precio</h3>
            <PriceRangeSlider
              min={availableFilters.price_range.min}
              max={availableFilters.price_range.max}
              currentMin={filters.price_min}
              currentMax={filters.price_max}
              onChange={(min, max) => {
                onFiltersChange({
                  ...filters,
                  price_min: min,
                  price_max: max,
                });
              }}
            />
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Calificación Mínima</h3>
            <div className="flex gap-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    updateFilter('min_rating', filters.min_rating === rating ? undefined : rating)
                  }
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.min_rating === rating
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${filters.min_rating === rating ? 'fill-current' : ''}`} />
                  {rating}+
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[var(--border-default)] bg-white">
          <button
            onClick={onClearFilters}
            className="flex-1 px-4 py-3 border border-[var(--border-default)] rounded-lg text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={handleApplyAndClose}
            className="flex-1 px-4 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Ver {resultCount} productos
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
