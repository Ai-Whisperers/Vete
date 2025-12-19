"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ServiceCard } from "./service-card";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { ClinicConfig } from "@/lib/clinics";
import { CategoryFilter, extractCategories } from "./category-filter";
import { EmptyStateNoSearchResults } from "@/components/ui/empty-state";

interface ServiceVariant {
  name: string;
  description?: string;
  price_display?: string;
}

interface Service {
  id: string;
  title: string;
  summary?: string;
  icon?: string;
  category?: string;
  details?: {
    description?: string;
    includes?: string[];
  };
  variants?: ServiceVariant[];
}

interface ServicesGridProps {
  services: Service[];
  config: ClinicConfig;
}

export function ServicesGrid({ services, config }: ServicesGridProps) {
  const { clinic } = useParams() as { clinic: string };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  // Extract categories and counts from services
  const { categories, counts } = useMemo(
    () => extractCategories(services),
    [services]
  );

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Category filter
      if (selectedCategory !== "all" && service.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();

        // Check Title
        if (service.title.toLowerCase().includes(term)) return true;

        // Check Summary/Description
        if (service.summary?.toLowerCase().includes(term)) return true;
        if (service.details?.description?.toLowerCase().includes(term)) return true;

        // Check Includes List
        if (service.details?.includes?.some((item: string) => item.toLowerCase().includes(term))) return true;

        // Check Variants (Sub-services)
        if (service.variants?.some((variant: ServiceVariant) => variant.name.toLowerCase().includes(term))) return true;

        return false;
      }

      return true;
    });
  }, [services, searchTerm, selectedCategory]);

  const clearFilters = (): void => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all";

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <section aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">Filtros de búsqueda</h2>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Search className="w-5 h-5" aria-hidden="true" />
              </div>
              <input
                type="search"
                placeholder="Buscar servicios (ej: Vacunas, Consulta...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar servicios"
                className="w-full pl-12 pr-12 py-3 sm:py-4 min-h-[48px] rounded-full bg-white border border-gray-200 shadow-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all text-base text-[var(--text-primary)]"
              />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full font-bold text-sm transition-all ${
              showFilters
                ? "bg-[var(--primary)] text-white shadow-lg"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[var(--primary)]"
            }`}
            aria-expanded={showFilters}
            aria-controls="category-filters"
            aria-label={showFilters ? "Ocultar filtros de categoría" : "Mostrar filtros de categoría"}
          >
            <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Category Filter */}
        {showFilters && categories.length > 1 && (
          <div id="category-filters" className="animate-in slide-in-from-top-2 duration-200">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              serviceCounts={counts}
              variant="chips"
              className="justify-center"
            />
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500" role="status" aria-live="polite">
            <span>
              Mostrando {filteredServices.length} de {services.length} servicios
            </span>
            <button
              onClick={clearFilters}
              className="text-[var(--primary)] font-bold hover:underline flex items-center gap-1"
              aria-label="Limpiar todos los filtros"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Limpiar filtros
            </button>
          </div>
        )}
        </div>
      </section>

      {/* Grid */}
      <section aria-labelledby="services-heading">
        <h2 id="services-heading" className="sr-only">Lista de servicios</h2>
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" role="list">
            {filteredServices.map((service) => (
              <div key={service.id} role="listitem">
                <ServiceCard service={service} config={config} clinic={clinic} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyStateNoSearchResults
            query={searchTerm || selectedCategory}
            onClear={clearFilters}
            className="py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200"
          />
        )}
      </section>
    </div>
  );
}
