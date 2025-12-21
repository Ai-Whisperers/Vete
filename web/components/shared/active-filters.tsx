import React from 'react';
import { X } from 'lucide-react';
import { Category, Brand } from '@/hooks/use-filter-data';

interface ActiveFiltersProps {
  selectedCategory: string;
  selectedBrand: string;
  categories: Category[];
  brands: Brand[];
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
}

export function ActiveFilters({
  selectedCategory,
  selectedBrand,
  categories,
  brands,
  onCategoryChange,
  onBrandChange
}: ActiveFiltersProps) {
  const activeFilters = [];

  if (selectedCategory !== 'all') {
    const category = categories.find(c => c.slug === selectedCategory);
    if (category) {
      activeFilters.push({
        type: 'category' as const,
        label: `Categoría: ${category.name}`,
        onRemove: () => onCategoryChange('all'),
        color: 'blue'
      });
    }
  }

  if (selectedBrand !== 'all') {
    const brand = brands.find(b => b.slug === selectedBrand);
    if (brand) {
      activeFilters.push({
        type: 'brand' as const,
        label: `Marca: ${brand.name}`,
        onRemove: () => onBrandChange('all'),
        color: 'green'
      });
    }
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-gray-50">
      <h4 className="font-bold text-gray-900 mb-3">Filtros Activos</h4>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <span
            key={filter.type}
            className={`inline-flex items-center gap-1 px-3 py-1 bg-${filter.color}-50 text-${filter.color}-700 text-xs font-bold rounded-full`}
          >
            {filter.label}
            <button
              onClick={filter.onRemove}
              className={`ml-1 hover:bg-${filter.color}-100 rounded-full p-0.5 transition-colors`}
              aria-label={`Remover filtro de ${filter.type}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
