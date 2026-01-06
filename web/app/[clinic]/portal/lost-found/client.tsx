'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Check,
  Plus,
  Eye,
  MessageCircle,
  Filter,
  ChevronDown,
  PawPrint,
  Calendar,
  X,
} from 'lucide-react'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  color: string
  photo_url: string
  microchip_number: string
  owner: {
    id: string
    full_name: string
    phone: string
    email: string
  }
}

interface Sighting {
  id: string
  sighting_date: string
  sighting_location: string
  is_verified: boolean
}

interface LostPetReport {
  id: string
  status: 'lost' | 'found' | 'reunited'
  last_seen_location: string
  last_seen_at: string
  contact_phone: string
  contact_email: string
  notes: string
  created_at: string
  pet: Pet
  sightings: Sighting[]
}

interface Props {
  clinicSlug: string
  clinicConfig: {
    name: string
  }
}

export function LostFoundBoard({ clinicSlug, clinicConfig }: Props) {
  const [reports, setReports] = useState<LostPetReport[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'lost' | 'found' | 'all'>('lost')
  const [selectedReport, setSelectedReport] = useState<LostPetReport | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showSightingModal, setShowSightingModal] = useState(false)
  const [userPets, setUserPets] = useState<Pet[]>([])
  const supabase = createClient()
  const router = useRouter()

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/lost-found?status=${statusFilter}&limit=50`,
        { credentials: 'include' }
      )

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching lost pet reports:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const fetchUserPets = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('pets')
      .select('id, name, species, breed, color, photo_url, microchip_number')
      .eq('owner_id', user.id)
      .is('deleted_at', null)

    setUserPets((data as Pet[]) || [])
  }, [supabase])

  useEffect(() => {
    fetchReports()
    fetchUserPets()
  }, [fetchReports, fetchUserPets])

  const statusColors = {
    lost: {
      bg: 'bg-[var(--status-error-bg,#fef2f2)]',
      text: 'text-[var(--status-error,#ef4444)]',
      border: 'border-[var(--status-error,#ef4444)]',
      badge: 'bg-[var(--status-error,#ef4444)] text-white',
    },
    found: {
      bg: 'bg-[var(--status-warning-bg,#fffbeb)]',
      text: 'text-[var(--status-warning,#f59e0b)]',
      border: 'border-[var(--status-warning,#f59e0b)]',
      badge: 'bg-[var(--status-warning,#f59e0b)] text-white',
    },
    reunited: {
      bg: 'bg-[var(--status-success-bg,#dcfce7)]',
      text: 'text-[var(--status-success,#22c55e)]',
      border: 'border-[var(--status-success,#22c55e)]',
      badge: 'bg-[var(--status-success,#22c55e)] text-white',
    },
  }

  const statusLabels = {
    lost: 'Perdido',
    found: 'Encontrado',
    reunited: 'Reunido',
  }

  const speciesEmoji = {
    dog: '🐕',
    cat: '🐱',
    bird: '🐦',
    rabbit: '🐰',
    hamster: '🐹',
    other: '🐾',
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-paper)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-primary)]">
                <Search className="h-6 w-6 text-[var(--status-error,#ef4444)]" />
                Mascotas Perdidas
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Ayuda a reunir mascotas con sus familias
              </p>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-[var(--primary-dark)]"
            >
              <Plus className="h-5 w-5" />
              Reportar Mascota Perdida
            </button>
          </div>

          {/* Status Filter */}
          <div className="mt-6 flex gap-2">
            {(['lost', 'found', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                {status === 'lost' && 'Perdidos'}
                {status === 'found' && 'Encontrados'}
                {status === 'all' && 'Todos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-[var(--bg-subtle)]"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--status-success-bg,#dcfce7)]">
              <Check className="h-8 w-8 text-[var(--status-success,#22c55e)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {statusFilter === 'lost'
                ? 'No hay mascotas perdidas'
                : statusFilter === 'found'
                  ? 'No hay mascotas encontradas'
                  : 'No hay reportes'}
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              ¡Buenas noticias! No hay reportes activos.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`overflow-hidden rounded-2xl border bg-[var(--bg-paper)] shadow-sm transition-shadow hover:shadow-md ${statusColors[report.status].border}`}
              >
                {/* Pet Photo */}
                <div className="relative aspect-[4/3] bg-[var(--bg-subtle)]">
                  {report.pet.photo_url ? (
                    <img
                      src={report.pet.photo_url}
                      alt={report.pet.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <PawPrint className="h-16 w-16 text-[var(--text-muted)]" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[report.status].badge}`}
                  >
                    {statusLabels[report.status]}
                  </div>

                  {/* Sightings Badge */}
                  {report.sightings?.length > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                      <Eye className="h-3 w-3" />
                      {report.sightings.length} avistamientos
                    </div>
                  )}
                </div>

                {/* Pet Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                        {speciesEmoji[report.pet.species as keyof typeof speciesEmoji] || '🐾'}
                        {report.pet.name}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {report.pet.breed || report.pet.species} • {report.pet.color || 'Sin color'}
                      </p>
                    </div>
                  </div>

                  {/* Last Seen */}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-error,#ef4444)]" />
                      <span className="text-[var(--text-secondary)]">
                        {report.last_seen_location || 'Ubicación no especificada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)]">
                        {report.last_seen_at
                          ? new Date(report.last_seen_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Fecha no especificada'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </button>
                    {report.status === 'lost' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report)
                          setShowSightingModal(true)
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-dark)]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Reportar Avistamiento
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && !showSightingModal && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onReportSighting={() => setShowSightingModal(true)}
        />
      )}

      {/* Sighting Report Modal */}
      {showSightingModal && selectedReport && (
        <SightingModal
          report={selectedReport}
          onClose={() => {
            setShowSightingModal(false)
            setSelectedReport(null)
          }}
          onSuccess={() => {
            setShowSightingModal(false)
            setSelectedReport(null)
            fetchReports()
          }}
        />
      )}

      {/* Report Lost Pet Modal */}
      {showReportModal && (
        <ReportLostPetModal
          pets={userPets}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false)
            fetchReports()
          }}
        />
      )}
    </div>
  )
}

// Report Detail Modal Component
function ReportDetailModal({
  report,
  onClose,
  onReportSighting,
}: {
  report: LostPetReport
  onClose: () => void
  onReportSighting: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--bg-paper)] shadow-xl">
        {/* Header */}
        <div className="relative">
          <div className="aspect-video bg-[var(--bg-subtle)]">
            {report.pet.photo_url ? (
              <img
                src={report.pet.photo_url}
                alt={report.pet.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PawPrint className="h-24 w-24 text-[var(--text-muted)]" />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {report.pet.name}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {report.pet.breed || report.pet.species} • {report.pet.color || 'Sin color'}
          </p>

          {/* Details Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--bg-subtle)] p-4">
              <h3 className="mb-2 text-sm font-medium text-[var(--text-muted)]">
                Última ubicación
              </h3>
              <p className="flex items-start gap-2 text-[var(--text-primary)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-error,#ef4444)]" />
                {report.last_seen_location || 'No especificada'}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--bg-subtle)] p-4">
              <h3 className="mb-2 text-sm font-medium text-[var(--text-muted)]">
                Fecha de pérdida
              </h3>
              <p className="flex items-center gap-2 text-[var(--text-primary)]">
                <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                {report.last_seen_at
                  ? new Date(report.last_seen_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'No especificada'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          {(report.contact_phone || report.contact_email) && (
            <div className="mt-4 rounded-xl border border-[var(--border-default)] p-4">
              <h3 className="mb-3 font-medium text-[var(--text-primary)]">
                Información de contacto
              </h3>
              <div className="space-y-2">
                {report.contact_phone && (
                  <a
                    href={`tel:${report.contact_phone}`}
                    className="flex items-center gap-2 text-[var(--primary)] hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {report.contact_phone}
                  </a>
                )}
                {report.contact_email && (
                  <a
                    href={`mailto:${report.contact_email}`}
                    className="flex items-center gap-2 text-[var(--primary)] hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {report.contact_email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {report.notes && (
            <div className="mt-4">
              <h3 className="mb-2 font-medium text-[var(--text-primary)]">
                Notas adicionales
              </h3>
              <p className="text-[var(--text-secondary)]">{report.notes}</p>
            </div>
          )}

          {/* Sightings */}
          {report.sightings?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-medium text-[var(--text-primary)]">
                Avistamientos ({report.sightings.length})
              </h3>
              <div className="space-y-2">
                {report.sightings.map((sighting) => (
                  <div
                    key={sighting.id}
                    className="flex items-center justify-between rounded-lg bg-[var(--bg-subtle)] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--status-warning,#f59e0b)]" />
                      <span className="text-sm text-[var(--text-primary)]">
                        {sighting.sighting_location}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(sighting.sighting_date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {report.status === 'lost' && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={onReportSighting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-dark)]"
              >
                <Eye className="h-5 w-5" />
                Reportar Avistamiento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Sighting Modal Component
function SightingModal({
  report,
  onClose,
  onSuccess,
}: {
  report: LostPetReport
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    sighting_location: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/lost-found/${report.id}/sightings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to submit')

      onSuccess()
    } catch (error) {
      console.error('Error submitting sighting:', error)
      alert('Error al enviar el avistamiento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-paper)] shadow-xl">
        <div className="border-b border-[var(--border-default)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Reportar Avistamiento
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            ¿Viste a {report.pet.name}? Ayúdanos a encontrarlo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                Tu nombre (opcional)
              </label>
              <input
                type="text"
                value={formData.reporter_name}
                onChange={(e) =>
                  setFormData({ ...formData, reporter_name: e.target.value })
                }
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                Ubicación del avistamiento <span className="text-[var(--status-error,#ef4444)]">*</span>
              </label>
              <input
                type="text"
                value={formData.sighting_location}
                onChange={(e) =>
                  setFormData({ ...formData, sighting_location: e.target.value })
                }
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                placeholder="Ej: Parque de la Salud, cerca del kiosco"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                rows={3}
                placeholder="¿Hacia dónde iba? ¿Cómo se veía?"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.reporter_email}
                  onChange={(e) =>
                    setFormData({ ...formData, reporter_email: e.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.reporter_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, reporter_phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="0981 123 456"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-3 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.sighting_location}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Avistamiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Report Lost Pet Modal Component
function ReportLostPetModal({
  pets,
  onClose,
  onSuccess,
}: {
  pets: Pet[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pet_id: '',
    last_seen_location: '',
    last_seen_at: new Date().toISOString().split('T')[0],
    contact_phone: '',
    contact_email: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          last_seen_at: new Date(formData.last_seen_at).toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Failed to create report')

      onSuccess()
    } catch (error) {
      console.error('Error creating report:', error)
      alert('Error al crear el reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--bg-paper)] shadow-xl">
        <div className="border-b border-[var(--border-default)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Reportar Mascota Perdida
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {pets.length === 0 ? (
            <div className="rounded-xl bg-[var(--status-warning-bg,#fffbeb)] p-4 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-[var(--status-warning,#f59e0b)]" />
              <p className="mt-2 font-medium text-[var(--text-primary)]">
                No tienes mascotas registradas
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Primero debes registrar tu mascota en el portal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Mascota <span className="text-[var(--status-error,#ef4444)]">*</span>
                </label>
                <select
                  value={formData.pet_id}
                  onChange={(e) =>
                    setFormData({ ...formData, pet_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  required
                >
                  <option value="">Selecciona tu mascota</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} - {pet.breed || pet.species}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Última ubicación conocida <span className="text-[var(--status-error,#ef4444)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_seen_location}
                  onChange={(e) =>
                    setFormData({ ...formData, last_seen_location: e.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  placeholder="Ej: Barrio Los Laureles, frente al supermercado"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Fecha de pérdida <span className="text-[var(--status-error,#ef4444)]">*</span>
                </label>
                <input
                  type="date"
                  value={formData.last_seen_at}
                  onChange={(e) =>
                    setFormData({ ...formData, last_seen_at: e.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                    Teléfono de contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="0981 123 456"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
                  rows={3}
                  placeholder="Detalles adicionales que puedan ayudar..."
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-3 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.pet_id || !formData.last_seen_location || pets.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Crear Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
