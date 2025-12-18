"use client";

import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

export interface ServiceCategory {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  description?: string;
}

// Default categories - can be overridden by clinic config
export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { id: "all", label: "Todos", icon: "LayoutGrid", description: "Todos los servicios" },
  { id: "medical", label: "Médico", icon: "Stethoscope", description: "Consultas y especialidades" },
  { id: "preventative", label: "Prevención", icon: "ShieldCheck", description: "Vacunas y control" },
  { id: "diagnostics", label: "Diagnóstico", icon: "Microscope", description: "Laboratorio e imágenes" },
  { id: "surgery", label: "Cirugía", icon: "Scissors", description: "Procedimientos quirúrgicos" },
  { id: "dental", label: "Dental", icon: "Smile", description: "Salud bucal" },
  { id: "grooming", label: "Estética", icon: "Sparkles", description: "Baño y peluquería" },
  { id: "hospitalization", label: "Internación", icon: "BedDouble", description: "Cuidados intensivos" },
  { id: "rehabilitation", label: "Rehabilitación", icon: "Activity", description: "Fisioterapia y recuperación" },
];

interface CategoryFilterProps {
  categories: ServiceCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  serviceCounts?: Record<string, number>;
  variant?: "chips" | "tabs" | "dropdown";
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  serviceCounts,
  variant = "chips",
  className,
}: CategoryFilterProps): React.ReactElement {
  if (variant === "dropdown") {
    return (
      <div className={cn("relative", className)}>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-3 min-h-[48px] rounded-xl bg-white border border-gray-200 text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none appearance-none cursor-pointer"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
              {serviceCounts?.[category.id] !== undefined && ` (${serviceCounts[category.id]})`}
            </option>
          ))}
        </select>
        <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  if (variant === "tabs") {
    return (
      <div className={cn("border-b border-gray-200", className)}>
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide pb-px" role="tablist">
          {categories.map((category) => {
            const IconComponent = Icons[category.icon] as React.ComponentType<{ className?: string }>;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 min-h-[44px] font-bold text-sm whitespace-nowrap border-b-2 transition-colors",
                  isSelected
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{category.label}</span>
                {serviceCounts?.[category.id] !== undefined && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    isSelected ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-gray-100 text-gray-500"
                  )}>
                    {serviceCounts[category.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Default: chips variant
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categories.map((category) => {
        const IconComponent = Icons[category.icon] as React.ComponentType<{ className?: string }>;
        const isSelected = selectedCategory === category.id;
        const count = serviceCounts?.[category.id];

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full font-bold text-sm transition-all",
              isSelected
                ? "bg-[var(--primary)] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[var(--primary)] hover:text-[var(--primary)]"
            )}
            title={category.description}
          >
            {IconComponent && <IconComponent className="w-4 h-4" />}
            <span>{category.label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center",
                isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Utility to extract unique categories from services and count them
export function extractCategories(
  services: Array<{ category?: string }>,
  customCategories?: ServiceCategory[]
): { categories: ServiceCategory[]; counts: Record<string, number> } {
  const categorySet = new Set<string>();
  const counts: Record<string, number> = { all: services.length };

  services.forEach((service) => {
    if (service.category) {
      categorySet.add(service.category);
      counts[service.category] = (counts[service.category] || 0) + 1;
    }
  });

  const baseCategories = customCategories || DEFAULT_CATEGORIES;

  // Filter to only include "all" + categories that exist in services
  const categories = baseCategories.filter(
    (cat) => cat.id === "all" || categorySet.has(cat.id)
  );

  return { categories, counts };
}
