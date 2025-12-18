"use client";

import { useState } from "react";
import { ServiceCard } from "./service-card";
import { Search } from "lucide-react";
import { ClinicConfig } from "@/lib/clinics";

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = services.filter((service) => {
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
  });

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-xl mx-auto relative mb-12">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar servicios (ej: Vacunas, Consulta...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-full bg-white border border-gray-200 shadow-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all text-lg text-[var(--text-primary)]"
        />
      </div>

      {/* Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} config={config} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-xl text-gray-500 font-medium">No se encontraron servicios que coincidan con &quot;{searchTerm}&quot;.</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="mt-4 text-[var(--primary)] font-bold hover:underline"
          >
            Ver todos los servicios
          </button>
        </div>
      )}
    </div>
  );
}
