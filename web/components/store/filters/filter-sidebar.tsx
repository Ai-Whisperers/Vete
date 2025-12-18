'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Star, Dog, Cat, Bird, Fish, Rabbit } from 'lucide-react';
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
  filters: ProductFilters;
  availableFilters: AvailableFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onClearFilters: () => void;
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

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border-default)] pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-semibold text-[var(--text-primary)]">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  filters,
  availableFilters,
  onFiltersChange,
  onClearFilters,
}: Props) {
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

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (value === undefined || value === false) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (key === 'search') return false;
    return true;
  });

  return (
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-24 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Filtros</h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Categories */}
        {availableFilters.categories.length > 0 && (
          <FilterSection title="Categoría">
            <div className="space-y-2">
              {availableFilters.categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat.slug}
                    onChange={() =>
                      updateFilter('category', filters.category === cat.slug ? undefined : cat.slug)
                    }
                    className="w-4 h-4 text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    {cat.name}
                  </span>
                  {cat.count > 0 && (
                    <span className="text-xs text-[var(--text-muted)]">({cat.count})</span>
                  )}
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Species */}
        <FilterSection title="Mascota">
          <div className="space-y-2">
            {availableFilters.species.map((s) => (
              <label
                key={s.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.species?.includes(s.value) || false}
                  onChange={() => toggleArrayFilter('species', s.value)}
                  className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
                />
                <span className="text-[var(--text-muted)]">
                  {SPECIES_ICONS[s.value]}
                </span>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {SPECIES_LABELS[s.value]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Life Stage */}
        <FilterSection title="Etapa de Vida">
          <div className="space-y-2">
            {availableFilters.life_stages.map((ls) => (
              <label
                key={ls.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.life_stages?.includes(ls.value) || false}
                  onChange={() => toggleArrayFilter('life_stages', ls.value)}
                  className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {LIFE_STAGE_LABELS[ls.value]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Breed Size */}
        <FilterSection title="Tamaño de Raza" defaultOpen={false}>
          <div className="space-y-2">
            {availableFilters.breed_sizes.map((bs) => (
              <label
                key={bs.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.breed_sizes?.includes(bs.value) || false}
                  onChange={() => toggleArrayFilter('breed_sizes', bs.value)}
                  className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {BREED_SIZE_LABELS[bs.value]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Health Conditions */}
        <FilterSection title="Necesidades Especiales" defaultOpen={false}>
          <div className="space-y-2">
            {availableFilters.health_conditions.map((hc) => (
              <label
                key={hc.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.health_conditions?.includes(hc.value) || false}
                  onChange={() => toggleArrayFilter('health_conditions', hc.value)}
                  className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {HEALTH_CONDITION_LABELS[hc.value]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Brands */}
        {availableFilters.brands.length > 0 && (
          <FilterSection title="Marca" defaultOpen={false}>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFilters.brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={filters.brand === brand.slug}
                    onChange={() =>
                      updateFilter('brand', filters.brand === brand.slug ? undefined : brand.slug)
                    }
                    className="w-4 h-4 text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    {brand.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection title="Precio">
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
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Calificación" defaultOpen={false}>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.min_rating === rating}
                  onChange={() =>
                    updateFilter('min_rating', filters.min_rating === rating ? undefined : rating)
                  }
                  className="w-4 h-4 text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
                />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-muted)]">y más</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Quick Filters */}
        <FilterSection title="Filtros Rápidos">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.in_stock_only || false}
                onChange={() => updateFilter('in_stock_only', !filters.in_stock_only)}
                className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                Solo en stock
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.on_sale || false}
                onChange={() => updateFilter('on_sale', !filters.on_sale)}
                className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                En oferta
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.new_arrivals || false}
                onChange={() => updateFilter('new_arrivals', !filters.new_arrivals)}
                className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                Recién llegados
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.best_sellers || false}
                onChange={() => updateFilter('best_sellers', !filters.best_sellers)}
                className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border-default)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                Más vendidos
              </span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
