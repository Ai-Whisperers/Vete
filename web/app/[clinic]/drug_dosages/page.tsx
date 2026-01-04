'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Pill,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  X,
  AlertCircle,
  Check,
  ChevronUp,
  ChevronDown,
  Filter,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface DrugDosage {
  id: string
  drug_name: string
  species?: string
  dosage_per_kg: number
  unit: string
  route?: string
  frequency?: string
  notes?: string
}

type SortField = 'drug_name' | 'dosage_per_kg' | 'species'
type SortDirection = 'asc' | 'desc'

export default function DrugDosagesPage() {
  const params = useParams()
  const clinic = params.clinic as string

  const [dosages, setDosages] = useState<DrugDosage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('drug_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [editingDrug, setEditingDrug] = useState<DrugDosage | null>(null)
  const [calculatorDrug, setCalculatorDrug] = useState<DrugDosage | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    drug_name: '',
    species: 'perro',
    dosage_per_kg: '',
    unit: 'mg',
    route: 'oral',
    frequency: '',
    notes: '',
  })

  // Calculator state
  const [petWeight, setPetWeight] = useState('')

  const fetchDosages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/drug_dosages')
      if (res.ok) {
        const data = await res.json()
        setDosages(data)
      }
    } catch (error) {
      console.error('Error fetching dosages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDosages()
  }, [])

  // Filter and sort dosages
  const filteredDosages = useMemo(() => {
    let result = [...dosages]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (d) => d.drug_name.toLowerCase().includes(term) || d.notes?.toLowerCase().includes(term)
      )
    }

    // Species filter
    if (speciesFilter !== 'all') {
      result = result.filter((d) => d.species === speciesFilter || !d.species)
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal === undefined || bVal === undefined) return 0
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [dosages, searchTerm, speciesFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const resetForm = () => {
    setFormData({
      drug_name: '',
      species: 'perro',
      dosage_per_kg: '',
      unit: 'mg',
      route: 'oral',
      frequency: '',
      notes: '',
    })
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      drug_name: formData.drug_name,
      species: formData.species,
      dosage_per_kg: Number(formData.dosage_per_kg),
      unit: formData.unit,
      route: formData.route,
      frequency: formData.frequency,
      notes: formData.notes,
    }

    const res = await fetch('/api/drug_dosages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      resetForm()
      setIsAddModalOpen(false)
      fetchDosages()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDrug) return

    const payload = {
      id: editingDrug.id,
      drug_name: formData.drug_name,
      species: formData.species,
      dosage_per_kg: Number(formData.dosage_per_kg),
      unit: formData.unit,
      route: formData.route,
      frequency: formData.frequency,
      notes: formData.notes,
    }

    const res = await fetch('/api/drug_dosages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      resetForm()
      setIsEditModalOpen(false)
      setEditingDrug(null)
      fetchDosages()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este medicamento?')) return

    await fetch('/api/drug_dosages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchDosages()
  }

  const openEditModal = (drug: DrugDosage) => {
    setEditingDrug(drug)
    setFormData({
      drug_name: drug.drug_name,
      species: drug.species || 'perro',
      dosage_per_kg: String(drug.dosage_per_kg),
      unit: drug.unit,
      route: drug.route || 'oral',
      frequency: drug.frequency || '',
      notes: drug.notes || '',
    })
    setIsEditModalOpen(true)
  }

  const openCalculator = (drug: DrugDosage) => {
    setCalculatorDrug(drug)
    setPetWeight('')
    setIsCalculatorOpen(true)
  }

  const calculatedDose = useMemo(() => {
    if (!calculatorDrug || !petWeight) return null
    const weight = parseFloat(petWeight)
    if (isNaN(weight) || weight <= 0) return null
    return (weight * calculatorDrug.dosage_per_kg).toFixed(2)
  }, [calculatorDrug, petWeight])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 inline h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 inline h-4 w-4" />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] py-16 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-32 w-32 rounded-full border-4 border-white" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full border-4 border-white" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Pill className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-white/80">
                Herramienta Clínica
              </p>
              <h1 className="text-3xl font-black md:text-4xl">Dosificación de Medicamentos</h1>
            </div>
          </div>
          <p className="max-w-2xl text-lg text-white/80">
            Consulta y calcula dosis de medicamentos según el peso del paciente. Base de datos
            actualizable para uso veterinario.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Species Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="all">Todas las especies</option>
                <option value="perro">Perros</option>
                <option value="gato">Gatos</option>
                <option value="ave">Aves</option>
                <option value="exotico">Exóticos</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                resetForm()
                setIsAddModalOpen(true)
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              Agregar Medicamento
            </button>
          </div>
        </div>

        {/* Results Count */}
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          {filteredDosages.length} medicamento{filteredDosages.length !== 1 ? 's' : ''} encontrado
          {filteredDosages.length !== 1 ? 's' : ''}
        </p>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
              <p className="text-[var(--text-muted)]">Cargando medicamentos...</p>
            </div>
          ) : filteredDosages.length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="mx-auto mb-4 h-16 w-16 text-gray-200" />
              <p className="font-medium text-[var(--text-muted)]">No se encontraron medicamentos</p>
              <p className="mt-1 text-sm text-gray-400">
                Intenta con otro término de búsqueda o agrega uno nuevo
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-[var(--text-primary)] transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('drug_name')}
                    >
                      Medicamento <SortIcon field="drug_name" />
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-[var(--text-primary)] transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('species')}
                    >
                      Especie <SortIcon field="species" />
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-[var(--text-primary)] transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('dosage_per_kg')}
                    >
                      Dosis/kg <SortIcon field="dosage_per_kg" />
                    </th>
                    <th className="p-4 text-left font-bold text-[var(--text-primary)]">Vía</th>
                    <th className="p-4 text-left font-bold text-[var(--text-primary)]">
                      Frecuencia
                    </th>
                    <th className="p-4 text-right font-bold text-[var(--text-primary)]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDosages.map((drug) => (
                    <tr
                      key={drug.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <p className="font-bold text-[var(--text-primary)]">{drug.drug_name}</p>
                        {drug.notes && (
                          <p className="mt-1 text-xs text-[var(--text-muted)]">{drug.notes}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-[var(--primary)]/10 rounded-full px-3 py-1 text-sm font-medium capitalize text-[var(--primary)]">
                          {drug.species || 'General'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          {drug.dosage_per_kg} {drug.unit}
                        </span>
                      </td>
                      <td className="p-4 capitalize text-[var(--text-secondary)]">
                        {drug.route || '-'}
                      </td>
                      <td className="p-4 text-[var(--text-secondary)]">{drug.frequency || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openCalculator(drug)}
                            className="hover:bg-[var(--primary)]/10 rounded-lg p-2 text-[var(--primary)] transition-colors"
                            title="Calcular dosis"
                            aria-label={`Calcular dosis de ${drug.drug_name}`}
                          >
                            <Calculator className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(drug)}
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title="Editar"
                            aria-label={`Editar ${drug.drug_name}`}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(drug.id)}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Eliminar"
                            aria-label={`Eliminar ${drug.drug_name}`}
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
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-bold text-amber-800">Aviso Importante</p>
            <p className="text-sm text-amber-700">
              Esta herramienta es de referencia. Siempre consulte la literatura actualizada y ajuste
              las dosis según el estado clínico del paciente, función renal/hepática y otras
              consideraciones individuales.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isEditModalOpen ? 'Editar Medicamento' : 'Agregar Medicamento'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                  setEditingDrug(null)
                  resetForm()
                }}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEdit : handleAdd} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Nombre del Medicamento *
                </label>
                <input
                  type="text"
                  value={formData.drug_name}
                  onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Amoxicilina"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                    Especie
                  </label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="ave">Ave</option>
                    <option value="exotico">Exótico</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                    Vía de Administración
                  </label>
                  <select
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="oral">Oral</option>
                    <option value="iv">Intravenosa (IV)</option>
                    <option value="im">Intramuscular (IM)</option>
                    <option value="sc">Subcutánea (SC)</option>
                    <option value="topica">Tópica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                    Dosis por kg *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dosage_per_kg}
                    onChange={(e) => setFormData({ ...formData, dosage_per_kg: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                    Unidad *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="UI">UI</option>
                    <option value="mcg">mcg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Frecuencia
                </label>
                <input
                  type="text"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: Cada 12 horas"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-24 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Contraindicaciones, precauciones, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setIsEditModalOpen(false)
                    setEditingDrug(null)
                    resetForm()
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-[var(--text-secondary)] transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Check className="h-5 w-5" />
                  {isEditModalOpen ? 'Guardar Cambios' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {isCalculatorOpen && calculatorDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Calculadora de Dosis</h2>
              <button
                onClick={() => {
                  setIsCalculatorOpen(false)
                  setCalculatorDrug(null)
                  setPetWeight('')
                }}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-[var(--primary)]/5 mb-6 rounded-xl p-4">
                <p className="mb-1 text-sm text-[var(--text-muted)]">Medicamento</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {calculatorDrug.drug_name}
                </p>
                <p className="mt-1 text-sm text-[var(--primary)]">
                  {calculatorDrug.dosage_per_kg} {calculatorDrug.unit}/kg
                </p>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-[var(--text-primary)]">
                  Peso del paciente (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={petWeight}
                  onChange={(e) => setPetWeight(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ej: 10"
                  autoFocus
                />
              </div>

              {calculatedDose && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                  <p className="mb-2 text-sm text-green-700">Dosis Calculada</p>
                  <p className="text-4xl font-black text-green-700">
                    {calculatedDose} {calculatorDrug.unit}
                  </p>
                  {calculatorDrug.frequency && (
                    <p className="mt-2 text-sm text-green-600">{calculatorDrug.frequency}</p>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setIsCalculatorOpen(false)
                  setCalculatorDrug(null)
                  setPetWeight('')
                }}
                className="mt-6 w-full rounded-xl bg-gray-100 px-6 py-3 font-bold text-[var(--text-secondary)] transition-colors hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
