'use client'
import { useEffect, useState, useMemo } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import {
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  LineChart,
  Dog,
  Cat,
  Scale,
  Calendar,
} from 'lucide-react'

interface GrowthChart {
  id: string
  breed: string
  species?: string
  age_months: number
  weight_kg: number
  percentile?: number
  notes?: string
}

type SortField = 'breed' | 'species' | 'age_months' | 'weight_kg'
type SortDirection = 'asc' | 'desc'

export default function GrowthChartsClient() {
  const { user, loading } = useAuthRedirect()
  const [charts, setCharts] = useState<GrowthChart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('breed')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingChart, setEditingChart] = useState<GrowthChart | null>(null)

  // Form states
  const [formBreed, setFormBreed] = useState('')
  const [formSpecies, setFormSpecies] = useState('perro')
  const [formAge, setFormAge] = useState('')
  const [formWeight, setFormWeight] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const fetchCharts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/growth_charts')
      if (res.ok) {
        const data = await res.json()
        setCharts(data)
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching growth charts:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchCharts()
    }
  }, [loading, user])

  // Filter and sort charts
  const filteredCharts = useMemo(() => {
    let result = [...charts]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (c) => c.breed.toLowerCase().includes(term) || c.notes?.toLowerCase().includes(term)
      )
    }

    // Species filter
    if (speciesFilter !== 'all') {
      result = result.filter((c) => c.species === speciesFilter)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'breed') {
        comparison = a.breed.localeCompare(b.breed)
      } else if (sortField === 'species') {
        comparison = (a.species || '').localeCompare(b.species || '')
      } else if (sortField === 'age_months') {
        comparison = a.age_months - b.age_months
      } else if (sortField === 'weight_kg') {
        comparison = a.weight_kg - b.weight_kg
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [charts, searchTerm, speciesFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 inline h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 inline h-4 w-4" />
    )
  }

  const resetForm = () => {
    setFormBreed('')
    setFormSpecies('perro')
    setFormAge('')
    setFormWeight('')
    setFormNotes('')
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (chart: GrowthChart) => {
    setEditingChart(chart)
    setFormBreed(chart.breed)
    setFormSpecies(chart.species || 'perro')
    setFormAge(chart.age_months.toString())
    setFormWeight(chart.weight_kg.toString())
    setFormNotes(chart.notes || '')
    setShowEditModal(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      breed: formBreed,
      species: formSpecies,
      age_months: Number(formAge),
      weight_kg: Number(formWeight),
      notes: formNotes || null,
    }
    const res = await fetch('/api/growth_charts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowAddModal(false)
      resetForm()
      fetchCharts()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingChart) return

    const payload = {
      id: editingChart.id,
      breed: formBreed,
      species: formSpecies,
      age_months: Number(formAge),
      weight_kg: Number(formWeight),
      notes: formNotes || null,
    }
    const res = await fetch('/api/growth_charts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowEditModal(false)
      setEditingChart(null)
      resetForm()
      fetchCharts()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return

    await fetch('/api/growth_charts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchCharts()
  }

  const getSpeciesIcon = (species?: string) => {
    if (species === 'gato') return <Cat className="h-4 w-4" />
    return <Dog className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)]">
        {/* Hero Skeleton */}
        <div className="h-64 animate-pulse bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <TrendingUp className="h-8 w-8" />
            </div>
            <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm">
              Herramienta Clínica
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Curvas de Crecimiento</h1>
          <p className="max-w-2xl text-xl text-white/90">
            Registra y monitorea el crecimiento de tus pacientes. Compara pesos por edad y raza para
            detectar anomalías tempranas.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <LineChart className="h-5 w-5" />
              <span>{charts.length} registros</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Dog className="h-5 w-5" />
              <span>Perros y Gatos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative w-full max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por raza o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Species Filter */}
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                aria-label="Filtrar por especie"
              >
                <option value="all">Todas las especies</option>
                <option value="perro">🐕 Perros</option>
                <option value="gato">🐱 Gatos</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                aria-label="Agregar nuevo registro de crecimiento"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Agregar Registro</span>
              </button>
            </div>
          </div>

          {/* Active filters info */}
          {(searchTerm || speciesFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando {filteredCharts.length} de {charts.length} registros
              </span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSpeciesFilter('all')
                }}
                className="text-[var(--primary)] hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
        ) : filteredCharts.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {searchTerm || speciesFilter !== 'all'
                ? 'No se encontraron registros'
                : 'Sin registros de crecimiento'}
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm || speciesFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Comienza agregando registros de peso y edad de tus pacientes.'}
            </p>
            {!searchTerm && speciesFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-5 w-5" />
                Agregar Primer Registro
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('species')}
                    >
                      <span className="flex items-center gap-2">
                        Especie
                        <SortIcon field="species" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('breed')}
                    >
                      <span className="flex items-center gap-2">
                        Raza
                        <SortIcon field="breed" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('age_months')}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Edad (meses)
                        <SortIcon field="age_months" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('weight_kg')}
                    >
                      <span className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Peso (kg)
                        <SortIcon field="weight_kg" />
                      </span>
                    </th>
                    <th className="p-4 text-left font-bold text-gray-700">Notas</th>
                    <th className="p-4 text-right font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharts.map((chart, index) => (
                    <tr
                      key={chart.id}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-lg p-2 ${
                              chart.species === 'gato'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {getSpeciesIcon(chart.species)}
                          </span>
                          <span className="capitalize">{chart.species || 'perro'}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-900">{chart.breed}</td>
                      <td className="p-4 text-gray-600">{chart.age_months}</td>
                      <td className="p-4">
                        <span className="font-bold text-[var(--primary)]">
                          {chart.weight_kg} kg
                        </span>
                      </td>
                      <td className="max-w-xs truncate p-4 text-sm text-gray-500">
                        {chart.notes || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(chart)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[var(--primary)]"
                            aria-label={`Editar registro de ${chart.breed}`}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(chart.id)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={`Eliminar registro de ${chart.breed}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <LineChart className="h-5 w-5 text-[var(--primary)]" />
            Sobre las Curvas de Crecimiento
          </h3>
          <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-2">
            <div>
              <p className="mb-2">
                <strong>¿Para qué sirven?</strong> Las curvas de crecimiento permiten monitorear el
                desarrollo de cachorros y gatitos, comparando su peso con valores de referencia por
                raza y edad.
              </p>
              <p>
                <strong>Frecuencia recomendada:</strong> Registrar peso semanalmente durante los
                primeros 6 meses, luego mensualmente hasta el año de edad.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Señales de alerta:</strong> Pérdida de peso, estancamiento prolongado, o
                crecimiento excesivamente rápido pueden indicar problemas de salud.
              </p>
              <p>
                <strong>Tip:</strong> Pesar siempre a la misma hora del día, preferiblemente antes
                de alimentar al paciente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Agregar Registro</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Especie *</label>
                <select
                  value={formSpecies}
                  onChange={(e) => setFormSpecies(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  <option value="perro">🐕 Perro</option>
                  <option value="gato">🐱 Gato</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Raza *</label>
                <input
                  type="text"
                  value={formBreed}
                  onChange={(e) => setFormBreed(e.target.value)}
                  placeholder="Ej: Golden Retriever, Siamés"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Edad (meses) *
                  </label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="240"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Notas (opcional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Editar Registro</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingChart(null)
                  }}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Especie *</label>
                <select
                  value={formSpecies}
                  onChange={(e) => setFormSpecies(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  <option value="perro">🐕 Perro</option>
                  <option value="gato">🐱 Gato</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Raza *</label>
                <input
                  type="text"
                  value={formBreed}
                  onChange={(e) => setFormBreed(e.target.value)}
                  placeholder="Ej: Golden Retriever, Siamés"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Edad (meses) *
                  </label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="240"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Notas (opcional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingChart(null)
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
