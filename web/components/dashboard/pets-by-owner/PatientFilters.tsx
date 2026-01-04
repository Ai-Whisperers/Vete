"use client";

import { Dog, Cat, Rabbit, X, ChevronDown } from "lucide-react";
import type { FilterOptions } from "./types";

interface PatientFiltersProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function PatientFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: PatientFiltersProps): React.ReactElement {
  return (
    <div className="space-y-3">
      {/* Species Filter - Toggle Buttons */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
          Especie
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onFilterChange("species", "all")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filters.species === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("species", "dog")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
              filters.species === "dog"
                ? "bg-blue-600 text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            <Dog className="w-3 h-3" />
            Perros
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("species", "cat")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
              filters.species === "cat"
                ? "bg-purple-600 text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            <Cat className="w-3 h-3" />
            Gatos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("species", "other")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
              filters.species === "other"
                ? "bg-teal-600 text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            <Rabbit className="w-3 h-3" />
            Otros
          </button>
        </div>
      </div>

      {/* Vaccine Filter - Dropdown */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
          Vacunas
        </label>
        <div className="relative">
          <select
            value={filters.vaccine}
            onChange={(e) => onFilterChange("vaccine", e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 text-sm bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="overdue">Vencidas</option>
            <option value="due-soon">Proximas (14 dias)</option>
            <option value="up-to-date">Al dia</option>
            <option value="none">Sin vacunas</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
        </div>
      </div>

      {/* Last Visit Filter - Dropdown */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
          Ultima visita
        </label>
        <div className="relative">
          <select
            value={filters.lastVisit}
            onChange={(e) => onFilterChange("lastVisit", e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 text-sm bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="recent">&lt;30 dias</option>
            <option value="1-3">1-3 meses</option>
            <option value="3-6">3-6 meses</option>
            <option value="6+">&gt;6 meses</option>
            <option value="never">Nunca</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
        </div>
      </div>

      {/* Neutered Filter - Toggle Buttons */}
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
          Esterilizado
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onFilterChange("neutered", "all")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filters.neutered === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("neutered", "yes")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filters.neutered === "yes"
                ? "bg-green-600 text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            Si
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("neutered", "no")}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              filters.neutered === "no"
                ? "bg-gray-600 text-white"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <X className="w-3 h-3" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
