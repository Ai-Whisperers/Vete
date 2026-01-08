'use client'
import { useEffect, useState, useMemo } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Pill,
  Clock,
  AlertCircle,
  Printer,
} from 'lucide-react'

interface Prescription {
  id: string
  pet_id?: string
  pet_name?: string
  drug_name: string
  dosage: string
  frequency?: string
  duration?: string
  instructions?: string
  prescribed_by?: string
  prescribed_at?: string
  status?: 'active' | 'completed' | 'cancelled'
}

type SortField = 'drug_name' | 'pet_name' | 'prescribed_at' | 'status'
type SortDirection = 'asc' | 'desc'

const STATUS_CONFIG = {
  active: { label: 'Activa', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
}

export default function PrescriptionsClient() {
  const { user, loading } = useAuthRedirect()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('prescribed_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)

  // Form states
  const [formDrugName, setFormDrugName] = useState('')
  const [formDosage, setFormDosage] = useState('')
  const [formFrequency, setFormFrequency] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formInstructions, setFormInstructions] = useState('')

  const fetchPrescriptions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/prescriptions')
      if (res.ok) {
        const data = await res.json()
        setPrescriptions(data)
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching prescriptions:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchPrescriptions()
    }
  }, [loading, user])

  // Filter and sort
  const filteredPrescriptions = useMemo(() => {
    let result = [...prescriptions]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (p) =>
          p.drug_name.toLowerCase().includes(term) ||
          p.pet_name?.toLowerCase().includes(term) ||
          p.instructions?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'drug_name') {
        comparison = a.drug_name.localeCompare(b.drug_name)
      } else if (sortField === 'pet_name') {
        comparison = (a.pet_name || '').localeCompare(b.pet_name || '')
      } else if (sortField === 'prescribed_at') {
        comparison =
          new Date(a.prescribed_at || 0).getTime() - new Date(b.prescribed_at || 0).getTime()
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '')
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [prescriptions, searchTerm, statusFilter, sortField, sortDirection])

  // Stats
  const stats = useMemo(() => {
    return {
      total: prescriptions.length,
      active: prescriptions.filter((p) => p.status === 'active').length,
      completed: prescriptions.filter((p) => p.status === 'completed').length,
    }
  }, [prescriptions])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
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
    setFormDrugName('')
    setFormDosage('')
    setFormFrequency('')
    setFormDuration('')
    setFormInstructions('')
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (prescription: Prescription) => {
    setEditingPrescription(prescription)
    setFormDrugName(prescription.drug_name)
    setFormDosage(prescription.dosage)
    setFormFrequency(prescription.frequency || '')
    setFormDuration(prescription.duration || '')
    setFormInstructions(prescription.instructions || '')
    setShowEditModal(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      drug_name: formDrugName,
      dosage: formDosage,
      frequency: formFrequency || null,
      duration: formDuration || null,
      instructions: formInstructions || null,
      status: 'active',
    }
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowAddModal(false)
      resetForm()
      fetchPrescriptions()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPrescription) return

    const payload = {
      id: editingPrescription.id,
      drug_name: formDrugName,
      dosage: formDosage,
      frequency: formFrequency || null,
      duration: formDuration || null,
      instructions: formInstructions || null,
    }
    const res = await fetch('/api/prescriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowEditModal(false)
      setEditingPrescription(null)
      resetForm()
      fetchPrescriptions()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta receta?')) return

    await fetch('/api/prescriptions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchPrescriptions()
  }

  const getStatusBadge = (status?: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)]">
        <div className="h-64 animate-pulse bg-gradient-to-br from-blue-600 to-cyan-500" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <FileText className="h-8 w-8" />
            </div>
            <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm">
              Sistema Médico
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Recetas Médicas</h1>
          <p className="max-w-2xl text-xl text-white/90">
            Crea, gestiona e imprime recetas médicas para tus pacientes. Controla dosificaciones y
            seguimiento de tratamientos.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <FileText className="h-5 w-5" />
              <span>{stats.total} recetas</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-green-500/50 px-4 py-2 backdrop-blur-sm">
              <Clock className="h-5 w-5" />
              <span>{stats.active} activas</span>
            </div>
            {stats.completed > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span>{stats.completed} completadas</span>
              </div>
            )}
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
                placeholder="Buscar por medicamento o paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrar por estado"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                aria-label="Crear nueva receta médica"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Nueva Receta</span>
              </button>
            </div>
          </div>

          {/* Active filters info */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando {filteredPrescriptions.length} de {prescriptions.length} recetas
              </span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="text-blue-600 hover:underline"
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
        ) : filteredPrescriptions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {searchTerm || statusFilter !== 'all'
                ? 'No se encontraron recetas'
                : 'Sin recetas registradas'}
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Comienza creando una nueva receta médica.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Crear Primera Receta
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
                      onClick={() => handleSort('prescribed_at')}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Fecha
                        <SortIcon field="prescribed_at" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('drug_name')}
                    >
                      <span className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Medicamento
                        <SortIcon field="drug_name" />
                      </span>
                    </th>
                    <th className="p-4 text-left font-bold text-gray-700">Dosis</th>
                    <th className="p-4 text-left font-bold text-gray-700">Indicaciones</th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <span className="flex items-center gap-2">
                        Estado
                        <SortIcon field="status" />
                      </span>
                    </th>
                    <th className="p-4 text-right font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((prescription, index) => (
                    <tr
                      key={prescription.id}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4 text-sm text-gray-600">
                        {prescription.prescribed_at
                          ? new Date(prescription.prescribed_at).toLocaleDateString('es-PY', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{prescription.drug_name}</div>
                        {prescription.pet_name && (
                          <div className="text-xs text-gray-500">Para: {prescription.pet_name}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-blue-600">{prescription.dosage}</span>
                        {prescription.frequency && (
                          <div className="text-xs text-gray-500">{prescription.frequency}</div>
                        )}
                      </td>
                      <td className="max-w-xs truncate p-4 text-sm text-gray-500">
                        {prescription.instructions || '—'}
                      </td>
                      <td className="p-4">{getStatusBadge(prescription.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.print()}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            aria-label={`Imprimir receta de ${prescription.drug_name}`}
                            title="Imprimir"
                          >
                            <Printer className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(prescription)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            aria-label={`Editar receta de ${prescription.drug_name}`}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prescription.id)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={`Eliminar receta de ${prescription.drug_name}`}
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
        <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Información Importante
          </h3>
          <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-2">
            <div>
              <p className="mb-2">
                <strong>Recetas controladas:</strong> Medicamentos controlados requieren receta
                especial con copia para el propietario.
              </p>
              <p>
                <strong>Validez:</strong> Las recetas tienen validez de 30 días desde su emisión,
                excepto antibióticos (10 días).
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Dosificación:</strong> Siempre verificar peso actual del paciente antes de
                calcular dosis.
              </p>
              <p>
                <strong>Seguimiento:</strong> Programar revisión post-tratamiento para verificar
                eficacia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-blue-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Nueva Receta</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-blue-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Medicamento *</label>
                <input
                  type="text"
                  value={formDrugName}
                  onChange={(e) => setFormDrugName(e.target.value)}
                  placeholder="Nombre del medicamento"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Dosis *</label>
                  <input
                    type="text"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    placeholder="Ej: 5mg/kg"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Frecuencia</label>
                  <input
                    type="text"
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    placeholder="Ej: Cada 12 horas"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Duración del Tratamiento
                </label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="Ej: 7 días"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Indicaciones Adicionales
                </label>
                <textarea
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Instrucciones especiales, precauciones, vía de administración..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                >
                  Crear Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-blue-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2">
                    <Edit2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Editar Receta</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPrescription(null)
                  }}
                  className="rounded-lg p-2 transition-colors hover:bg-blue-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Medicamento *</label>
                <input
                  type="text"
                  value={formDrugName}
                  onChange={(e) => setFormDrugName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Dosis *</label>
                  <input
                    type="text"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Frecuencia</label>
                  <input
                    type="text"
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Duración del Tratamiento
                </label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Indicaciones Adicionales
                </label>
                <textarea
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPrescription(null)
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
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
