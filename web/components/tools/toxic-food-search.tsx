'use client'

import { useState, useMemo, useCallback } from 'react'
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
} from 'lucide-react'
import { ToxicFoodItem, Species, SPECIES_LABELS, DATA_SOURCES } from '@/data/toxic-foods'

interface ToxicFoodSearchProps {
  items: ToxicFoodItem[]
}

type SpeciesFilter = Species | 'all'

export function ToxicFoodSearch({ items }: ToxicFoodSearchProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesFilter>('all')
  const [selectedToxicity, setSelectedToxicity] = useState<string>('all')
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Toggle expanded state for an item
  const toggleExpanded = (id: string): void => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search match
      const searchMatch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toxicComponent.toLowerCase().includes(searchTerm.toLowerCase())

      // Species match
      const speciesMatch = selectedSpecies === 'all' || item.species.includes(selectedSpecies)

      // Toxicity match
      const toxicityMatch = selectedToxicity === 'all' || item.toxicity === selectedToxicity

      return searchMatch && speciesMatch && toxicityMatch
    })
  }, [items, searchTerm, selectedSpecies, selectedToxicity])

  // Generate Google AI search URL
  const generateAiSearchUrl = useCallback(
    (query: string): string => {
      const speciesName = selectedSpecies !== 'all' ? SPECIES_LABELS[selectedSpecies] : 'mascotas'

      const searchQuery = encodeURIComponent(
        `es ${query} toxico o malo para ${speciesName}? que sintomas causa y que hacer`
      )

      return `https://www.google.com/search?q=${searchQuery}`
    },
    [selectedSpecies]
  )

  // Handle AI search redirect
  const handleAiSearch = useCallback((): void => {
    if (searchTerm.trim()) {
      const url = generateAiSearchUrl(searchTerm)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [searchTerm, generateAiSearchUrl])

  // Get toxicity styling
  const getToxicityConfig = (level: string): { color: string; bg: string; border: string } => {
    switch (level) {
      case 'Alta':
        return {
          color: 'text-red-700',
          bg: 'bg-red-100',
          border: 'border-red-200',
        }
      case 'Media':
        return {
          color: 'text-orange-700',
          bg: 'bg-orange-100',
          border: 'border-orange-200',
        }
      case 'Baja':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          border: 'border-yellow-200',
        }
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          border: 'border-gray-200',
        }
    }
  }

  // Get urgency styling
  const getUrgencyConfig = (urgency: string): { color: string; bg: string } => {
    switch (urgency) {
      case 'Inmediata':
        return { color: 'text-red-600', bg: 'bg-red-50' }
      case 'Urgente':
        return { color: 'text-orange-600', bg: 'bg-orange-50' }
      default:
        return { color: 'text-yellow-600', bg: 'bg-yellow-50' }
    }
  }

  // Check if user typed a question
  const isQuestion =
    searchTerm.includes('?') ||
    searchTerm.toLowerCase().startsWith('es ') ||
    searchTerm.toLowerCase().startsWith('puede ') ||
    searchTerm.toLowerCase().startsWith('puedo ') ||
    searchTerm.toLowerCase().includes(' malo ') ||
    searchTerm.toLowerCase().includes(' toxico ')

  const hasFilters = selectedSpecies !== 'all' || selectedToxicity !== 'all'

  const clearFilters = (): void => {
    setSelectedSpecies('all')
    setSelectedToxicity('all')
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar alimento (ej: chocolate, uvas, cebolla...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowAiPrompt(e.target.value.length > 2)
            }}
            className="w-full rounded-2xl border border-gray-200 py-4 pl-12 pr-6 text-base shadow-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-red-500"
            aria-label="Buscar alimentos tóxicos"
          />
        </div>

        {/* AI Search Prompt */}
        {showAiPrompt && searchTerm.length > 2 && (isQuestion || filteredItems.length === 0) && (
          <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-gray-800">
                  {filteredItems.length === 0
                    ? `No encontramos "${searchTerm}" en nuestra base de datos`
                    : '¿Necesitas más información?'}
                </p>
                <p className="mb-3 text-sm text-gray-600">
                  Obtén una respuesta detallada de IA sobre la toxicidad de este alimento
                </p>
                <button
                  onClick={handleAiSearch}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Preguntar a IA
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Filtrar:</span>
          </div>

          {/* Species Filter */}
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value as SpeciesFilter)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-red-500"
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
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-red-500"
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
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}

          {/* Results Count */}
          <span className="ml-auto text-sm text-gray-400">
            {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const toxicity = getToxicityConfig(item.toxicity)
          const urgency = getUrgencyConfig(item.treatmentUrgency)
          const isExpanded = expandedItems.has(item.id)

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.nameEn}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${toxicity.bg} ${toxicity.color} ${toxicity.border}`}
                  >
                    {item.toxicity}
                  </span>
                </div>

                {/* Species Tags */}
                <div className="mb-3 flex flex-wrap gap-1">
                  {item.species.map((s) => (
                    <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {SPECIES_LABELS[s]}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-sm">
                  {/* Toxic Component */}
                  <div className="flex items-start gap-2 text-gray-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p>
                      <span className="font-medium">Componente tóxico:</span> {item.toxicComponent}
                    </p>
                  </div>

                  {/* Symptoms */}
                  <div className="flex items-start gap-2 text-gray-600">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <p>
                      <span className="font-medium">Síntomas:</span> {item.symptoms}
                    </p>
                  </div>

                  {/* Onset Time */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Aparición: {item.onsetTime}</span>
                  </div>

                  {/* Urgency */}
                  <div className={`flex items-center gap-2 ${urgency.bg} rounded-lg px-2.5 py-1.5`}>
                    <Clock className={`h-4 w-4 ${urgency.color}`} />
                    <span className={`font-medium ${urgency.color}`}>
                      Atención {item.treatmentUrgency.toLowerCase()}
                    </span>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="border-l-2 border-gray-200 pl-2 text-xs italic text-gray-500">
                      {item.notes}
                    </p>
                  )}

                  {/* Lethal Dose if available */}
                  {item.lethalDose && (
                    <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                      <span className="font-medium">Dosis peligrosa:</span> {item.lethalDose}
                    </p>
                  )}
                </div>
              </div>

              {/* Expandable Section */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="flex w-full items-center justify-between px-5 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    {isExpanded ? 'Ver menos' : 'Ver mecanismo y fuentes'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-3 bg-gray-50 px-5 pb-4">
                    {/* Mechanism of Action */}
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Mecanismo de acción
                      </p>
                      <p className="text-sm text-gray-600">{item.mechanismOfAction}</p>
                    </div>

                    {/* Sources */}
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <BookOpen className="h-3 w-3" />
                        Fuentes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.sources.map((source, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
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
          )
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && searchTerm && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-bold text-gray-600">
            No encontramos &quot;{searchTerm}&quot;
          </h3>
          <p className="mb-4 text-gray-500">Prueba con otro término o usa la búsqueda con IA</p>
          <button
            onClick={handleAiSearch}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4" />
            Preguntar a IA sobre &quot;{searchTerm}&quot;
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Data Sources */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-800">
          <BookOpen className="h-4 w-4" />
          Fuentes Autorizadas
        </p>
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm text-blue-700 transition-colors hover:bg-blue-100"
            >
              {source.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-100 p-2">
            <Phone className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-red-800">¿Tu mascota ingirió algo tóxico?</p>
            <p className="text-sm text-red-700">
              Contacta inmediatamente a tu veterinario o al centro de emergencias más cercano. No
              induzcas el vómito sin consultar primero.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <span className="font-medium text-red-600">ASPCA Poison Control: (888) 426-4435</span>
              <span className="font-medium text-red-600">Pet Poison Helpline: (800) 213-6680</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
