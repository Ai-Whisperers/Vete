"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  AlertTriangle,
  Info,
  ExternalLink,
  Sparkles,
  Filter,
  X,
  Clock,
  Phone,
  ChevronDown,
  ChevronUp,
  Beaker,
  BookOpen,
} from "lucide-react";
import {
  ToxicFoodItem,
  Species,
  SPECIES_LABELS,
  DATA_SOURCES,
} from "@/data/toxic-foods";

interface ToxicFoodSearchProps {
  items: ToxicFoodItem[];
}

type SpeciesFilter = Species | "all";

export function ToxicFoodSearch({ items }: ToxicFoodSearchProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesFilter>("all");
  const [selectedToxicity, setSelectedToxicity] = useState<string>("all");
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Toggle expanded state for an item
  const toggleExpanded = (id: string): void => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search match
      const searchMatch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toxicComponent.toLowerCase().includes(searchTerm.toLowerCase());

      // Species match
      const speciesMatch =
        selectedSpecies === "all" ||
        item.species.includes(selectedSpecies);

      // Toxicity match
      const toxicityMatch =
        selectedToxicity === "all" || item.toxicity === selectedToxicity;

      return searchMatch && speciesMatch && toxicityMatch;
    });
  }, [items, searchTerm, selectedSpecies, selectedToxicity]);

  // Generate Google AI search URL
  const generateAiSearchUrl = useCallback((query: string): string => {
    const speciesName = selectedSpecies !== "all"
      ? SPECIES_LABELS[selectedSpecies]
      : "mascotas";

    const searchQuery = encodeURIComponent(
      `es ${query} toxico o malo para ${speciesName}? que sintomas causa y que hacer`
    );

    return `https://www.google.com/search?q=${searchQuery}`;
  }, [selectedSpecies]);

  // Handle AI search redirect
  const handleAiSearch = useCallback((): void => {
    if (searchTerm.trim()) {
      const url = generateAiSearchUrl(searchTerm);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [searchTerm, generateAiSearchUrl]);

  // Get toxicity styling
  const getToxicityConfig = (level: string): { color: string; bg: string; border: string } => {
    switch (level) {
      case "Alta":
        return {
          color: "text-red-700",
          bg: "bg-red-100",
          border: "border-red-200",
        };
      case "Media":
        return {
          color: "text-orange-700",
          bg: "bg-orange-100",
          border: "border-orange-200",
        };
      case "Baja":
        return {
          color: "text-yellow-700",
          bg: "bg-yellow-100",
          border: "border-yellow-200",
        };
      default:
        return {
          color: "text-gray-700",
          bg: "bg-gray-100",
          border: "border-gray-200",
        };
    }
  };

  // Get urgency styling
  const getUrgencyConfig = (urgency: string): { color: string; bg: string } => {
    switch (urgency) {
      case "Inmediata":
        return { color: "text-red-600", bg: "bg-red-50" };
      case "Urgente":
        return { color: "text-orange-600", bg: "bg-orange-50" };
      default:
        return { color: "text-yellow-600", bg: "bg-yellow-50" };
    }
  };

  // Check if user typed a question
  const isQuestion = searchTerm.includes("?") ||
    searchTerm.toLowerCase().startsWith("es ") ||
    searchTerm.toLowerCase().startsWith("puede ") ||
    searchTerm.toLowerCase().startsWith("puedo ") ||
    searchTerm.toLowerCase().includes(" malo ") ||
    searchTerm.toLowerCase().includes(" toxico ");

  const hasFilters = selectedSpecies !== "all" || selectedToxicity !== "all";

  const clearFilters = (): void => {
    setSelectedSpecies("all");
    setSelectedToxicity("all");
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar alimento (ej: chocolate, uvas, cebolla...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowAiPrompt(e.target.value.length > 2);
            }}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-base"
            aria-label="Buscar alimentos tóxicos"
          />
        </div>

        {/* AI Search Prompt */}
        {showAiPrompt && searchTerm.length > 2 && (isQuestion || filteredItems.length === 0) && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 mb-1">
                  {filteredItems.length === 0
                    ? `No encontramos "${searchTerm}" en nuestra base de datos`
                    : "¿Necesitas más información?"}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Obtén una respuesta detallada de IA sobre la toxicidad de este alimento
                </p>
                <button
                  onClick={handleAiSearch}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Preguntar a IA
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filtrar:</span>
          </div>

          {/* Species Filter */}
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value as SpeciesFilter)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            aria-label="Filtrar por especie"
          >
            <option value="all">Todas las mascotas</option>
            {(Object.entries(SPECIES_LABELS) as [Species, string][]).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Toxicity Filter */}
          <select
            value={selectedToxicity}
            onChange={(e) => setSelectedToxicity(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            aria-label="Filtrar por nivel de toxicidad"
          >
            <option value="all">Toda toxicidad</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}

          {/* Results Count */}
          <span className="text-sm text-gray-400 ml-auto">
            {filteredItems.length} {filteredItems.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const toxicity = getToxicityConfig(item.toxicity);
          const urgency = getUrgencyConfig(item.treatmentUrgency);
          const isExpanded = expandedItems.has(item.id);

          return (
            <article
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.nameEn}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${toxicity.bg} ${toxicity.color} ${toxicity.border}`}
                  >
                    {item.toxicity}
                  </span>
                </div>

                {/* Species Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.species.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {SPECIES_LABELS[s]}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-sm">
                  {/* Toxic Component */}
                  <div className="flex gap-2 items-start text-gray-600">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-medium">Componente tóxico:</span>{" "}
                      {item.toxicComponent}
                    </p>
                  </div>

                  {/* Symptoms */}
                  <div className="flex gap-2 items-start text-gray-600">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-medium">Síntomas:</span> {item.symptoms}
                    </p>
                  </div>

                  {/* Onset Time */}
                  <div className="flex gap-2 items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Aparición: {item.onsetTime}</span>
                  </div>

                  {/* Urgency */}
                  <div className={`flex gap-2 items-center ${urgency.bg} rounded-lg px-2.5 py-1.5`}>
                    <Clock className={`w-4 h-4 ${urgency.color}`} />
                    <span className={`font-medium ${urgency.color}`}>
                      Atención {item.treatmentUrgency.toLowerCase()}
                    </span>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-gray-500 text-xs italic border-l-2 border-gray-200 pl-2">
                      {item.notes}
                    </p>
                  )}

                  {/* Lethal Dose if available */}
                  {item.lethalDose && (
                    <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                      <span className="font-medium">Dosis peligrosa:</span> {item.lethalDose}
                    </p>
                  )}
                </div>
              </div>

              {/* Expandable Section */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full px-5 py-2 flex items-center justify-between text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    {isExpanded ? "Ver menos" : "Ver mecanismo y fuentes"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3 bg-gray-50">
                    {/* Mechanism of Action */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Mecanismo de acción
                      </p>
                      <p className="text-sm text-gray-600">{item.mechanismOfAction}</p>
                    </div>

                    {/* Sources */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Fuentes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.sources.map((source, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">
            No encontramos &quot;{searchTerm}&quot;
          </h3>
          <p className="text-gray-500 mb-4">
            Prueba con otro término o usa la búsqueda con IA
          </p>
          <button
            onClick={handleAiSearch}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Preguntar a IA sobre &quot;{searchTerm}&quot;
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Data Sources */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          Fuentes Autorizadas
        </p>
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors border border-blue-200"
            >
              {source.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Phone className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-red-800">
              ¿Tu mascota ingirió algo tóxico?
            </p>
            <p className="text-sm text-red-700">
              Contacta inmediatamente a tu veterinario o al centro de emergencias más cercano.
              No induzcas el vómito sin consultar primero.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <span className="text-red-600 font-medium">
                ASPCA Poison Control: (888) 426-4435
              </span>
              <span className="text-red-600 font-medium">
                Pet Poison Helpline: (800) 213-6680
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
