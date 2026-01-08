'use client'
import { useEffect, useState, useMemo } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import {
  AlertTriangle,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Syringe,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react'

interface VaccineReaction {
  id: string
  vaccine_id: string
  vaccine_name?: string
  pet_name?: string
  reaction_type?: string
  reaction_detail: string
  severity?: 'leve' | 'moderada' | 'severa'
  occurred_at: string
  resolved_at?: string
  treatment?: string
}

type SortField = 'vaccine_name' | 'reaction_type' | 'severity' | 'occurred_at'
type SortDirection = 'asc' | 'desc'

const REACTION_TYPES = [
  {
    value: 'local',
    label: 'Reacción Local',
    desc: 'Hinchazón, dolor o enrojecimiento en el sitio de inyección',
  },
  { value: 'sistemica', label: 'Reacción Sistémica', desc: 'Fiebre, letargia, pérdida de apetito' },
  {
    value: 'alergica',
    label: 'Reacción Alérgica',
    desc: 'Urticaria, edema facial, dificultad respiratoria',
  },
  {
    value: 'anafilactica',
    label: 'Anafilaxia',
    desc: 'Reacción severa que requiere atención inmediata',
  },
  { value: 'digestiva', label: 'Alteración Digestiva', desc: 'Vómitos, diarrea' },
  {
    value: 'neurologica',
    label: 'Alteración Neurológica',
    desc: 'Convulsiones, ataxia, cambios de comportamiento',
  },
  { value: 'otra', label: 'Otra', desc: 'Otra reacción no especificada' },
]

const SEVERITY_OPTIONS = [
  { value: 'leve', label: 'Leve', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'moderada', label: 'Moderada', color: 'bg-orange-100 text-orange-700' },
  { value: 'severa', label: 'Severa', color: 'bg-red-100 text-red-700' },
]

export default function VaccineReactionsClient() {
  const { user, loading } = useAuthRedirect()
  const [reactions, setReactions] = useState<VaccineReaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('occurred_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReaction, setEditingReaction] = useState<VaccineReaction | null>(null)

  // Form states
  const [formVaccineId, setFormVaccineId] = useState('')
  const [formVaccineName, setFormVaccineName] = useState('')
  const [formReactionType, setFormReactionType] = useState('')
  const [formDetail, setFormDetail] = useState('')
  const [formSeverity, setFormSeverity] = useState<'leve' | 'moderada' | 'severa'>('leve')
  const [formDate, setFormDate] = useState('')
  const [formTreatment, setFormTreatment] = useState('')

  const fetchReactions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/vaccine_reactions')
      if (res.ok) {
        const data = await res.json()
        setReactions(data)
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching vaccine reactions:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchReactions()
    }
  }, [loading, user])

  // Filter and sort
  const filteredReactions = useMemo(() => {
    let result = [...reactions]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (r) =>
          r.vaccine_name?.toLowerCase().includes(term) ||
          r.reaction_detail.toLowerCase().includes(term) ||
          r.pet_name?.toLowerCase().includes(term)
      )
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter((r) => r.severity === severityFilter)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'vaccine_name') {
        comparison = (a.vaccine_name || '').localeCompare(b.vaccine_name || '')
      } else if (sortField === 'reaction_type') {
        comparison = (a.reaction_type || '').localeCompare(b.reaction_type || '')
      } else if (sortField === 'severity') {
        const severityOrder = { leve: 1, moderada: 2, severa: 3 }
        comparison =
          (severityOrder[a.severity || 'leve'] || 0) - (severityOrder[b.severity || 'leve'] || 0)
      } else if (sortField === 'occurred_at') {
        comparison = new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [reactions, searchTerm, severityFilter, sortField, sortDirection])

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
    setFormVaccineId('')
    setFormVaccineName('')
    setFormReactionType('')
    setFormDetail('')
    setFormSeverity('leve')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormTreatment('')
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (reaction: VaccineReaction) => {
    setEditingReaction(reaction)
    setFormVaccineId(reaction.vaccine_id)
    setFormVaccineName(reaction.vaccine_name || '')
    setFormReactionType(reaction.reaction_type || '')
    setFormDetail(reaction.reaction_detail)
    setFormSeverity(reaction.severity || 'leve')
    setFormDate(reaction.occurred_at?.split('T')[0] || '')
    setFormTreatment(reaction.treatment || '')
    setShowEditModal(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      vaccine_id: formVaccineId,
      vaccine_name: formVaccineName,
      reaction_type: formReactionType,
      reaction_detail: formDetail,
      severity: formSeverity,
      occurred_at: formDate,
      treatment: formTreatment || null,
    }
    const res = await fetch('/api/vaccine_reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowAddModal(false)
      resetForm()
      fetchReactions()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReaction) return

    const payload = {
      id: editingReaction.id,
      vaccine_id: formVaccineId,
      vaccine_name: formVaccineName,
      reaction_type: formReactionType,
      reaction_detail: formDetail,
      severity: formSeverity,
      occurred_at: formDate,
      treatment: formTreatment || null,
    }
    const res = await fetch('/api/vaccine_reactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowEditModal(false)
      setEditingReaction(null)
      resetForm()
      fetchReactions()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de reacción?')) return

    await fetch('/api/vaccine_reactions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchReactions()
  }

  const getSeverityBadge = (severity?: string) => {
    const option = SEVERITY_OPTIONS.find((s) => s.value === severity)
    if (!option) return null
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-bold ${option.color}`}>
        {option.label}
      </span>
    )
  }

  const getReactionTypeLabel = (type?: string) => {
    const option = REACTION_TYPES.find((r) => r.value === type)
    return option?.label || type || 'No especificado'
  }

  // Stats
  const stats = useMemo(() => {
    const total = reactions.length
    const severas = reactions.filter((r) => r.severity === 'severa').length
    const moderadas = reactions.filter((r) => r.severity === 'moderada').length
    const leves = reactions.filter((r) => r.severity === 'leve').length
    return { total, severas, moderadas, leves }
  }, [reactions])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)]">
        <div className="h-64 animate-pulse bg-gradient-to-br from-red-500 to-orange-500" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-red-500 to-orange-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm">
              Farmacovigilancia
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Reacciones Adversas a Vacunas</h1>
          <p className="max-w-2xl text-xl text-white/90">
            Registra y monitorea eventos adversos post-vacunación. Sistema de farmacovigilancia para
            mejorar la seguridad de tus pacientes.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <FileText className="h-5 w-5" />
              <span>{stats.total} registros</span>
            </div>
            {stats.severas > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-red-600/50 px-4 py-2 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5" />
                <span>{stats.severas} severas</span>
              </div>
            )}
            {stats.moderadas > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-orange-600/50 px-4 py-2 backdrop-blur-sm">
                <span>{stats.moderadas} moderadas</span>
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
                placeholder="Buscar por vacuna, mascota o detalle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                aria-label="Filtrar por severidad"
              >
                <option value="all">Todas las severidades</option>
                <option value="leve">Leves</option>
                <option value="moderada">Moderadas</option>
                <option value="severa">Severas</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition-colors hover:bg-red-600"
                aria-label="Registrar nueva reacción adversa"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Registrar Reacción</span>
              </button>
            </div>
          </div>

          {/* Active filters info */}
          {(searchTerm || severityFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando {filteredReactions.length} de {reactions.length} registros
              </span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSeverityFilter('all')
                }}
                className="text-red-500 hover:underline"
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
        ) : filteredReactions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {searchTerm || severityFilter !== 'all'
                ? 'No se encontraron registros'
                : 'Sin reacciones registradas'}
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm || severityFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Esto es bueno - significa que no hay eventos adversos reportados.'}
            </p>
            {!searchTerm && severityFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition-colors hover:bg-red-600"
              >
                <Plus className="h-5 w-5" />
                Registrar Primera Reacción
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
                      onClick={() => handleSort('occurred_at')}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha
                        <SortIcon field="occurred_at" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('vaccine_name')}
                    >
                      <span className="flex items-center gap-2">
                        <Syringe className="h-4 w-4" />
                        Vacuna
                        <SortIcon field="vaccine_name" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('reaction_type')}
                    >
                      <span className="flex items-center gap-2">
                        Tipo
                        <SortIcon field="reaction_type" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('severity')}
                    >
                      <span className="flex items-center gap-2">
                        Severidad
                        <SortIcon field="severity" />
                      </span>
                    </th>
                    <th className="p-4 text-left font-bold text-gray-700">Detalle</th>
                    <th className="p-4 text-right font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReactions.map((reaction, index) => (
                    <tr
                      key={reaction.id}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          {new Date(reaction.occurred_at).toLocaleDateString('es-PY', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {reaction.vaccine_name || reaction.vaccine_id}
                        </div>
                        {reaction.pet_name && (
                          <div className="text-xs text-gray-500">{reaction.pet_name}</div>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">
                        {getReactionTypeLabel(reaction.reaction_type)}
                      </td>
                      <td className="p-4">{getSeverityBadge(reaction.severity)}</td>
                      <td className="max-w-xs truncate p-4 text-sm text-gray-500">
                        {reaction.reaction_detail || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(reaction)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500"
                            aria-label={`Editar reacción de ${reaction.vaccine_name || 'vacuna'}`}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(reaction.id)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={`Eliminar reacción de ${reaction.vaccine_name || 'vacuna'}`}
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
        <div className="mt-8 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Guía de Farmacovigilancia
          </h3>
          <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-2">
            <div>
              <p className="mb-2">
                <strong>¿Cuándo reportar?</strong> Cualquier evento adverso que ocurra después de la
                vacunación, incluso si no está seguro de la relación causal.
              </p>
              <p>
                <strong>Tiempo de observación:</strong> Las reacciones pueden ocurrir desde minutos
                hasta 3-4 semanas post-vacunación.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Reacciones comunes:</strong> Dolor local, letargia leve y fiebre baja son
                normales y suelen resolverse en 24-48 horas.
              </p>
              <p>
                <strong>Urgencia:</strong> Edema facial, dificultad respiratoria o colapso requieren
                atención veterinaria inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-red-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Registrar Reacción Adversa</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-red-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">ID Vacuna *</label>
                  <input
                    type="text"
                    value={formVaccineId}
                    onChange={(e) => setFormVaccineId(e.target.value)}
                    placeholder="ID o lote"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Nombre Vacuna
                  </label>
                  <input
                    type="text"
                    value={formVaccineName}
                    onChange={(e) => setFormVaccineName(e.target.value)}
                    placeholder="Ej: Rabia, Séxtuple"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Tipo de Reacción *
                </label>
                <select
                  value={formReactionType}
                  onChange={(e) => setFormReactionType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  {REACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Severidad *</label>
                  <select
                    value={formSeverity}
                    onChange={(e) =>
                      setFormSeverity(e.target.value as 'leve' | 'moderada' | 'severa')
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                    required
                  >
                    {SEVERITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Fecha *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Descripción Detallada *
                </label>
                <textarea
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="Describa los síntomas observados, tiempo de aparición, evolución..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Tratamiento Aplicado
                </label>
                <textarea
                  value={formTreatment}
                  onChange={(e) => setFormTreatment(e.target.value)}
                  placeholder="Medicamentos administrados, medidas de soporte..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
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
                  className="flex-1 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition-colors hover:bg-red-600"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingReaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-red-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-100 p-2">
                    <Edit2 className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Editar Reacción</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingReaction(null)
                  }}
                  className="rounded-lg p-2 transition-colors hover:bg-red-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">ID Vacuna *</label>
                  <input
                    type="text"
                    value={formVaccineId}
                    onChange={(e) => setFormVaccineId(e.target.value)}
                    placeholder="ID o lote"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Nombre Vacuna
                  </label>
                  <input
                    type="text"
                    value={formVaccineName}
                    onChange={(e) => setFormVaccineName(e.target.value)}
                    placeholder="Ej: Rabia, Séxtuple"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Tipo de Reacción *
                </label>
                <select
                  value={formReactionType}
                  onChange={(e) => setFormReactionType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  {REACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Severidad *</label>
                  <select
                    value={formSeverity}
                    onChange={(e) =>
                      setFormSeverity(e.target.value as 'leve' | 'moderada' | 'severa')
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                    required
                  >
                    {SEVERITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Fecha *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Descripción Detallada *
                </label>
                <textarea
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="Describa los síntomas observados, tiempo de aparición, evolución..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Tratamiento Aplicado
                </label>
                <textarea
                  value={formTreatment}
                  onChange={(e) => setFormTreatment(e.target.value)}
                  placeholder="Medicamentos administrados, medidas de soporte..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingReaction(null)
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition-colors hover:bg-red-600"
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
