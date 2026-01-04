'use client'
import { useEffect, useState, useMemo } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Star,
  User,
  Gift,
  TrendingUp,
} from 'lucide-react'

interface LoyaltyPoint {
  id: string
  profile_id: string
  profile_name?: string
  profile_email?: string
  points: number
  lifetime_points?: number
  tier?: 'bronce' | 'plata' | 'oro' | 'platino'
  updated_at?: string
}

type SortField = 'profile_name' | 'points' | 'tier' | 'updated_at'
type SortDirection = 'asc' | 'desc'

const TIER_CONFIG = {
  bronce: { label: 'Bronce', color: 'bg-amber-100 text-amber-700', minPoints: 0 },
  plata: { label: 'Plata', color: 'bg-gray-200 text-gray-700', minPoints: 500 },
  oro: { label: 'Oro', color: 'bg-yellow-100 text-yellow-700', minPoints: 1500 },
  platino: { label: 'Platino', color: 'bg-purple-100 text-purple-700', minPoints: 5000 },
}

export default function LoyaltyPointsClient() {
  const { user, loading } = useAuthRedirect()
  const [points, setPoints] = useState<LoyaltyPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('points')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [editingPoint, setEditingPoint] = useState<LoyaltyPoint | null>(null)

  // Form states
  const [formProfileId, setFormProfileId] = useState('')
  const [formPoints, setFormPoints] = useState('')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const fetchPoints = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/loyalty_points')
      if (res.ok) {
        const data = await res.json()
        setPoints(data)
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchPoints()
    }
  }, [loading, user])

  // Calculate tier based on lifetime points
  const calculateTier = (lifetimePoints: number): 'bronce' | 'plata' | 'oro' | 'platino' => {
    if (lifetimePoints >= 5000) return 'platino'
    if (lifetimePoints >= 1500) return 'oro'
    if (lifetimePoints >= 500) return 'plata'
    return 'bronce'
  }

  // Filter and sort
  const filteredPoints = useMemo(() => {
    let result = [...points]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (p) =>
          p.profile_name?.toLowerCase().includes(term) ||
          p.profile_email?.toLowerCase().includes(term) ||
          p.profile_id.toLowerCase().includes(term)
      )
    }

    // Tier filter
    if (tierFilter !== 'all') {
      result = result.filter((p) => {
        const tier = p.tier || calculateTier(p.lifetime_points || p.points)
        return tier === tierFilter
      })
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'profile_name') {
        comparison = (a.profile_name || '').localeCompare(b.profile_name || '')
      } else if (sortField === 'points') {
        comparison = a.points - b.points
      } else if (sortField === 'tier') {
        const tierOrder = { bronce: 1, plata: 2, oro: 3, platino: 4 }
        const tierA = a.tier || calculateTier(a.lifetime_points || a.points)
        const tierB = b.tier || calculateTier(b.lifetime_points || b.points)
        comparison = (tierOrder[tierA] || 0) - (tierOrder[tierB] || 0)
      } else if (sortField === 'updated_at') {
        comparison = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime()
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [points, searchTerm, tierFilter, sortField, sortDirection])

  // Stats
  const stats = useMemo(() => {
    const total = points.length
    const totalPoints = points.reduce((sum, p) => sum + p.points, 0)
    const tiers = {
      platino: points.filter(
        (p) => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'platino'
      ).length,
      oro: points.filter((p) => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'oro')
        .length,
      plata: points.filter(
        (p) => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'plata'
      ).length,
      bronce: points.filter(
        (p) => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'bronce'
      ).length,
    }
    return { total, totalPoints, tiers }
  }, [points])

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
    setFormProfileId('')
    setFormPoints('')
    setAdjustmentAmount('')
    setAdjustmentType('add')
    setAdjustmentReason('')
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (point: LoyaltyPoint) => {
    setEditingPoint(point)
    setFormProfileId(point.profile_id)
    setFormPoints(point.points.toString())
    setShowEditModal(true)
  }

  const openAdjustModal = (point: LoyaltyPoint) => {
    setEditingPoint(point)
    setAdjustmentAmount('')
    setAdjustmentType('add')
    setAdjustmentReason('')
    setShowAdjustModal(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { profile_id: formProfileId, points: Number(formPoints) }
    const res = await fetch('/api/loyalty_points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowAddModal(false)
      resetForm()
      fetchPoints()
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPoint) return

    const payload = {
      id: editingPoint.id,
      profile_id: formProfileId,
      points: Number(formPoints),
    }
    const res = await fetch('/api/loyalty_points', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowEditModal(false)
      setEditingPoint(null)
      resetForm()
      fetchPoints()
    }
  }

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPoint) return

    const amount = Number(adjustmentAmount)
    const newPoints =
      adjustmentType === 'add'
        ? editingPoint.points + amount
        : Math.max(0, editingPoint.points - amount)

    const payload = {
      id: editingPoint.id,
      profile_id: editingPoint.profile_id,
      points: newPoints,
    }
    const res = await fetch('/api/loyalty_points', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowAdjustModal(false)
      setEditingPoint(null)
      resetForm()
      fetchPoints()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de puntos?')) return

    await fetch('/api/loyalty_points', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchPoints()
  }

  const getTierBadge = (point: LoyaltyPoint) => {
    const tier = point.tier || calculateTier(point.lifetime_points || point.points)
    const config = TIER_CONFIG[tier]
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)]">
        <div className="h-64 animate-pulse bg-gradient-to-br from-amber-500 to-yellow-500" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-yellow-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-white blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <Award className="h-8 w-8" />
            </div>
            <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm">
              Programa de Fidelidad
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Puntos de Lealtad</h1>
          <p className="max-w-2xl text-xl text-white/90">
            Gestiona el programa de recompensas de tus clientes. Premia su fidelidad y aumenta la
            retención.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <User className="h-5 w-5" />
              <span>{stats.total} miembros</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Star className="h-5 w-5" />
              <span>{stats.totalPoints.toLocaleString()} pts totales</span>
            </div>
            {stats.tiers.platino > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-purple-600/50 px-4 py-2 backdrop-blur-sm">
                <Gift className="h-5 w-5" />
                <span>{stats.tiers.platino} Platino</span>
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
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                aria-label="Filtrar por nivel"
              >
                <option value="all">Todos los niveles</option>
                <option value="platino">Platino</option>
                <option value="oro">Oro</option>
                <option value="plata">Plata</option>
                <option value="bronce">Bronce</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
                aria-label="Agregar nuevo miembro al programa de fidelidad"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Agregar Miembro</span>
              </button>
            </div>
          </div>

          {/* Active filters info */}
          {(searchTerm || tierFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando {filteredPoints.length} de {points.length} miembros
              </span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setTierFilter('all')
                }}
                className="text-amber-600 hover:underline"
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
        ) : filteredPoints.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <Award className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {searchTerm || tierFilter !== 'all'
                ? 'No se encontraron miembros'
                : 'Sin miembros en el programa'}
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm || tierFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Comienza agregando clientes al programa de fidelidad.'}
            </p>
            {!searchTerm && tierFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
              >
                <Plus className="h-5 w-5" />
                Agregar Primer Miembro
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
                      onClick={() => handleSort('profile_name')}
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Cliente
                        <SortIcon field="profile_name" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('tier')}
                    >
                      <span className="flex items-center gap-2">
                        Nivel
                        <SortIcon field="tier" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('points')}
                    >
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Puntos
                        <SortIcon field="points" />
                      </span>
                    </th>
                    <th
                      className="cursor-pointer p-4 text-left font-bold text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => handleSort('updated_at')}
                    >
                      <span className="flex items-center gap-2">
                        Actualizado
                        <SortIcon field="updated_at" />
                      </span>
                    </th>
                    <th className="p-4 text-right font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoints.map((point, index) => (
                    <tr
                      key={point.id}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {point.profile_name || 'Cliente'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {point.profile_email || point.profile_id}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getTierBadge(point)}</td>
                      <td className="p-4">
                        <span className="text-lg font-bold text-amber-600">
                          {point.points.toLocaleString()}
                        </span>
                        <span className="ml-1 text-sm text-gray-400">pts</span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {point.updated_at
                          ? new Date(point.updated_at).toLocaleDateString('es-PY', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAdjustModal(point)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
                            aria-label={`Ajustar puntos de ${point.profile_name || 'cliente'}`}
                            title="Ajustar puntos"
                          >
                            <TrendingUp className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(point)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                            aria-label={`Editar puntos de ${point.profile_name || 'cliente'}`}
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(point.id)}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={`Eliminar puntos de ${point.profile_name || 'cliente'}`}
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

        {/* Tier Info */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {Object.entries(TIER_CONFIG).map(([key, config]) => (
            <div key={key} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className={`h-4 w-4 rounded-full ${config.color.split(' ')[0]}`} />
                <span className="font-bold text-gray-900">{config.label}</span>
              </div>
              <p className="text-sm text-gray-600">
                {config.minPoints === 0
                  ? 'Nivel inicial'
                  : `Desde ${config.minPoints.toLocaleString()} pts`}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.tiers[key as keyof typeof stats.tiers]}
                <span className="ml-1 text-sm font-normal text-gray-500">miembros</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-amber-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-2">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Agregar Miembro</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-amber-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">ID de Perfil *</label>
                <input
                  type="text"
                  value={formProfileId}
                  onChange={(e) => setFormProfileId(e.target.value)}
                  placeholder="UUID del perfil"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Puntos Iniciales *
                </label>
                <input
                  type="number"
                  value={formPoints}
                  onChange={(e) => setFormPoints(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  required
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
                  className="flex-1 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-amber-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-2">
                    <Edit2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Editar Puntos</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPoint(null)
                  }}
                  className="rounded-lg p-2 transition-colors hover:bg-amber-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">ID de Perfil *</label>
                <input
                  type="text"
                  value={formProfileId}
                  onChange={(e) => setFormProfileId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Puntos Totales *
                </label>
                <input
                  type="number"
                  value={formPoints}
                  onChange={(e) => setFormPoints(e.target.value)}
                  min="0"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPoint(null)
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && editingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-green-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-100 p-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Ajustar Puntos</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAdjustModal(false)
                    setEditingPoint(null)
                  }}
                  className="rounded-lg p-2 transition-colors hover:bg-green-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdjust} className="space-y-4 p-6">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Puntos actuales:</p>
                <p className="text-2xl font-bold text-amber-600">
                  {editingPoint.points.toLocaleString()} pts
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Tipo de Ajuste *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`rounded-xl px-4 py-3 font-bold transition-colors ${
                      adjustmentType === 'add'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    + Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('subtract')}
                    className={`rounded-xl px-4 py-3 font-bold transition-colors ${
                      adjustmentType === 'subtract'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    - Restar
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Cantidad *</label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Ej: Compra, canje, promoción..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                />
              </div>

              {adjustmentAmount && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm text-blue-600">Nuevo saldo:</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {(adjustmentType === 'add'
                      ? editingPoint.points + Number(adjustmentAmount)
                      : Math.max(0, editingPoint.points - Number(adjustmentAmount))
                    ).toLocaleString()}{' '}
                    pts
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false)
                    setEditingPoint(null)
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-green-500 px-6 py-3 font-bold text-white transition-colors hover:bg-green-600"
                >
                  Aplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
