'use client';

import { X } from 'lucide-react';
import type { ProductFilters, AvailableFilters } from '@/lib/types/store';
import {
  SPECIES_LABELS,
  LIFE_STAGE_LABELS,
  BREED_SIZE_LABELS,
  HEALTH_CONDITION_LABELS,
} from '@/lib/types/store';

interface Props {
  filters: ProductFilters;
  availableFilters: AvailableFilters;
  onRemoveFilter: (key: keyof ProductFilters, value?: string) => void;
  onClearAll: () => void;
}

interface FilterChip {
  key: keyof ProductFilters;
  label: string;
  value?: string;
}

export default function FilterChips({
  filters,
  availableFilters,
  onRemoveFilter,
  onClearAll,
}: Props) {
  const chips: FilterChip[] = [];

  // Category
  if (filters.category) {
    const cat = availableFilters.categories.find(c => c.slug === filters.category);
    chips.push({
      key: 'category',
      label: cat?.name || filters.category,
    });
  }

  // Subcategory
  if (filters.subcategory) {
    const subcat = availableFilters.subcategories.find(s => s.slug === filters.subcategory);
    chips.push({
      key: 'subcategory',
      label: subcat?.name || filters.subcategory,
    });
  }

  // Brand
  if (filters.brand) {
    const brand = availableFilters.brands.find(b => b.slug === filters.brand);
    chips.push({
      key: 'brand',
      label: brand?.name || filters.brand,
    });
  }

  // Species
  if (filters.species && filters.species.length > 0) {
    filters.species.forEach(s => {
      chips.push({
        key: 'species',
        label: SPECIES_LABELS[s] || s,
        value: s,
      });
    });
  }

  // Life Stages
  if (filters.life_stages && filters.life_stages.length > 0) {
    filters.life_stages.forEach(ls => {
      chips.push({
        key: 'life_stages',
        label: LIFE_STAGE_LABELS[ls] || ls,
        value: ls,
      });
    });
  }

  // Breed Sizes
  if (filters.breed_sizes && filters.breed_sizes.length > 0) {
    filters.breed_sizes.forEach(bs => {
      chips.push({
        key: 'breed_sizes',
        label: BREED_SIZE_LABELS[bs] || bs,
        value: bs,
      });
    });
  }

  // Health Conditions
  if (filters.health_conditions && filters.health_conditions.length > 0) {
    filters.health_conditions.forEach(hc => {
      chips.push({
        key: 'health_conditions',
        label: HEALTH_CONDITION_LABELS[hc] || hc,
        value: hc,
      });
    });
  }

  // Price Range
  if (filters.price_min !== undefined || filters.price_max !== undefined) {
    let label = 'Precio: ';
    if (filters.price_min !== undefined && filters.price_max !== undefined) {
      label += `${filters.price_min.toLocaleString()} - ${filters.price_max.toLocaleString()}`;
    } else if (filters.price_min !== undefined) {
      label += `desde ${filters.price_min.toLocaleString()}`;
    } else if (filters.price_max !== undefined) {
      label += `hasta ${filters.price_max.toLocaleString()}`;
    }
    chips.push({
      key: 'price_min', // Will clear both min and max
      label,
    });
  }

  // Rating
  if (filters.min_rating !== undefined) {
    chips.push({
      key: 'min_rating',
      label: `${filters.min_rating}+ estrellas`,
    });
  }

  // Boolean Filters
  if (filters.in_stock_only) {
    chips.push({ key: 'in_stock_only', label: 'En Stock' });
  }
  if (filters.on_sale) {
    chips.push({ key: 'on_sale', label: 'En Oferta' });
  }
  if (filters.new_arrivals) {
    chips.push({ key: 'new_arrivals', label: 'Nuevos' });
  }
  if (filters.best_sellers) {
    chips.push({ key: 'best_sellers', label: 'Más Vendidos' });
  }
  if (filters.featured) {
    chips.push({ key: 'featured', label: 'Destacados' });
  }
  if (filters.prescription_required) {
    chips.push({ key: 'prescription_required', label: 'Con Receta' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[var(--text-muted)]">Filtros activos:</span>

      {chips.map((chip, index) => (
        <button
          key={`${chip.key}-${chip.value || index}`}
          onClick={() => onRemoveFilter(chip.key, chip.value)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm rounded-full hover:bg-[var(--primary)]/20 transition-colors"
        >
          <span>{chip.label}</span>
          <X className="w-3 h-3" />
        </button>
      ))}

      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] underline"
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
}
