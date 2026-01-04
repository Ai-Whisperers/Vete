import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { FilterOptions } from "./types";
import { PatientFilters } from "./PatientFilters";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  resultCount,
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: SearchHeaderProps): React.ReactElement {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="border-b border-[var(--border-color)]">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar propietario o mascota..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-[var(--text-secondary)]">
            {resultCount} propietario{resultCount !== 1 ? "s" : ""}
            {(searchQuery || hasActiveFilters) && ` encontrado${resultCount !== 1 ? "s" : ""}`}
          </p>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors ${
              hasActiveFilters
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
                {[
                  filters.species !== "all",
                  filters.vaccine !== "all",
                  filters.lastVisit !== "all",
                  filters.neutered !== "all",
                ].filter(Boolean).length}
              </span>
            )}
            {showFilters ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Filters Panel */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-[var(--border-color)] pt-3 bg-[var(--bg-subtle)]">
          <PatientFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      )}
    </div>
  );
}
