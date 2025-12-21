import { Filter } from 'lucide-react';
import { FilterSection, ActiveFilters } from '@/components/shared';
import { useFilterData } from '@/hooks/use-filter-data';
import { useExpandableSections } from '@/hooks/use-expandable-sections';

interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  count?: number;
}

interface CatalogFiltersProps {
  readonly clinic: string;
  readonly selectedCategory: string;
  readonly selectedBrand: string;
  readonly onCategoryChange: (category: string) => void;
  readonly onBrandChange: (brand: string) => void;
}

export default function CatalogFilters({
  clinic,
  selectedCategory,
  selectedBrand,
  onCategoryChange,
  onBrandChange
}: CatalogFiltersProps) {
  const { categories, brands, isLoading, error } = useFilterData(clinic);
  const { expandedSections, toggleSection } = useExpandableSections({
    categories: true,
    brands: true
  });

  const clearFilters = () => {
    onCategoryChange('all');
    onBrandChange('all');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all';

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-6">
        <div className="text-center text-red-600">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Error al cargar filtros</p>
          <p className="text-sm opacity-75">Inténtalo de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 sticky top-6">
      {/* Header */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Filter className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Filtros</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <FilterSection
          title="Categorías"
          options={categories}
          selectedValue={selectedCategory}
          onChange={onCategoryChange}
          isExpanded={expandedSections.categories}
          onToggle={() => toggleSection('categories')}
          isLoading={isLoading}
          renderOption={(category: Category) => category.name}
          showCounts={true}
        />

        <FilterSection
          title="Marcas"
          options={brands}
          selectedValue={selectedBrand}
          onChange={onBrandChange}
          isExpanded={expandedSections.brands}
          onToggle={() => toggleSection('brands')}
          isLoading={isLoading}
          renderOption={(brand: Brand) => (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {brand.logo_url && (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-4 h-4 object-contain flex-shrink-0"
                />
              )}
              <span className="text-sm truncate">{brand.name}</span>
            </div>
          )}
          showCounts={true}
        />

        {hasActiveFilters && (
          <ActiveFilters
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            categories={categories}
            brands={brands}
            onCategoryChange={onCategoryChange}
            onBrandChange={onBrandChange}
          />
        )}
      </div>
    </div>
  );
}
