'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Check,
  X,
  Eye,
  Filter,
  ChevronDown,
  PawPrint,
  Calendar,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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
  reporter_name: string
  reporter_email: string
  sighting_date: string
  sighting_location: string
  sighting_lat: number | null
  sighting_lng: number | null
  description: string
  photo_url: string
  is_verified: boolean
  verified_at: string | null
  created_at: string
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
  found_at: string | null
  found_location: string | null
  pet: Pet
  reported_by_profile: {
    id: string
    full_name: string
  } | null
  sightings: Sighting[]
}

interface Props {
  clinicSlug: string
  clinicConfig: {
    name: string
  }
}

export function LostPetsManagement({ clinicSlug, clinicConfig }: Props) {
  const [reports, setReports] = useState<LostPetReport[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'lost' | 'found' | 'reunited' | 'all'>('all')
  const [selectedReport, setSelectedReport] = useState<LostPetReport | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/lost-found?status=${statusFilter}&include_all=true&limit=100`,
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

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const updateStatus = async (reportId: string, newStatus: 'lost' | 'found' | 'reunited') => {
    setUpdating(reportId)
    try {
      const response = await fetch(`/api/lost-found/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      await fetchReports()
      if (selectedReport?.id === reportId) {
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    } finally {
      setUpdating(null)
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return

    setUpdating(reportId)
    try {
      const response = await fetch(`/api/lost-found/${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to delete')

      await fetchReports()
      if (selectedReport?.id === reportId) {
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Error al eliminar el reporte')
    } finally {
      setUpdating(null)
    }
  }

  const statusColors = {
    lost: {
      bg: 'bg-[var(--status-error-bg,#fef2f2)]',
      text: 'text-[var(--status-error,#ef4444)]',
      border: 'border-[var(--status-error,#ef4444)]',
    },
    found: {
      bg: 'bg-[var(--status-warning-bg,#fffbeb)]',
      text: 'text-[var(--status-warning,#f59e0b)]',
      border: 'border-[var(--status-warning,#f59e0b)]',
    },
    reunited: {
      bg: 'bg-[var(--status-success-bg,#dcfce7)]',
      text: 'text-[var(--status-success,#22c55e)]',
      border: 'border-[var(--status-success,#22c55e)]',
    },
  }

  const statusLabels = {
    lost: 'Perdido',
    found: 'Encontrado',
    reunited: 'Reunido',
  }

  const statusIcons = {
    lost: AlertTriangle,
    found: Eye,
    reunited: CheckCircle,
  }

  // Count by status
  const counts = {
    lost: reports.filter((r) => r.status === 'lost').length,
    found: reports.filter((r) => r.status === 'found').length,
    reunited: reports.filter((r) => r.status === 'reunited').length,
    all: reports.length,
  }

  const filteredReports =
    statusFilter === 'all' ? reports : reports.filter((r) => r.status === statusFilter)

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-paper)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-primary)]">
                <Search className="h-6 w-6 text-[var(--primary)]" />
                Gestión de Mascotas Perdidas
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Administra los reportes de mascotas perdidas y encontradas
              </p>
            </div>

            <button
              onClick={() => fetchReports()}
              className="flex items-center gap-2 rounded-xl bg-[var(--bg-subtle)] px-4 py-2.5 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(['lost', 'found', 'reunited', 'all'] as const).map((status) => {
              const Icon = status === 'all' ? PawPrint : statusIcons[status]
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl p-4 text-left transition-all ${
                    statusFilter === status
                      ? 'ring-2 ring-[var(--primary)] ring-offset-2'
                      : ''
                  } ${status !== 'all' ? statusColors[status].bg : 'bg-[var(--bg-subtle)]'}`}
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      className={`h-5 w-5 ${
                        status !== 'all' ? statusColors[status].text : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {counts[status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                    {status === 'all' ? 'Todos' : statusLabels[status]}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-[var(--bg-subtle)]"
              />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
              <PawPrint className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              No hay reportes
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              No hay reportes de mascotas {statusFilter !== 'all' && statusLabels[statusFilter].toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`overflow-hidden rounded-xl border bg-[var(--bg-paper)] shadow-sm ${
                  statusColors[report.status].border
                }`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {/* Pet Photo */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
                    {report.pet.photo_url ? (
                      <img
                        src={report.pet.photo_url}
                        alt={report.pet.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PawPrint className="h-8 w-8 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {report.pet.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                          statusColors[report.status].bg
                        } ${statusColors[report.status].text}`}
                      >
                        {statusLabels[report.status]}
                      </span>
                      {report.sightings?.length > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                          <Eye className="h-3 w-3" />
                          {report.sightings.length} avistamientos
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[var(--text-secondary)]">
                      {report.pet.breed || report.pet.species} • {report.pet.color || 'Sin color'}
                      {report.pet.microchip_number && ` • Chip: ${report.pet.microchip_number}`}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {report.last_seen_location || 'Sin ubicación'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(report.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      {report.pet.owner && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {report.pet.owner.phone || 'Sin teléfono'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="rounded-lg bg-[var(--bg-subtle)] p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)]"
                      title="Ver detalles"
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    {report.status === 'lost' && (
                      <button
                        onClick={() => updateStatus(report.id, 'found')}
                        disabled={updating === report.id}
                        className="rounded-lg bg-[var(--status-warning-bg,#fffbeb)] p-2 text-[var(--status-warning,#f59e0b)] transition-colors hover:bg-[var(--status-warning,#f59e0b)]/20 disabled:opacity-50"
                        title="Marcar como encontrado"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    )}

                    {(report.status === 'lost' || report.status === 'found') && (
                      <button
                        onClick={() => updateStatus(report.id, 'reunited')}
                        disabled={updating === report.id}
                        className="rounded-lg bg-[var(--status-success-bg,#dcfce7)] p-2 text-[var(--status-success,#22c55e)] transition-colors hover:bg-[var(--status-success,#22c55e)]/20 disabled:opacity-50"
                        title="Marcar como reunido"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteReport(report.id)}
                      disabled={updating === report.id}
                      className="rounded-lg bg-[var(--status-error-bg,#fef2f2)] p-2 text-[var(--status-error,#ef4444)] transition-colors hover:bg-[var(--status-error,#ef4444)]/20 disabled:opacity-50"
                      title="Eliminar reporte"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <DetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={(status) => updateStatus(selectedReport.id, status)}
          updating={updating === selectedReport.id}
        />
      )}
    </div>
  )
}

function DetailModal({
  report,
  onClose,
  onStatusChange,
  updating,
}: {
  report: LostPetReport
  onClose: () => void
  onStatusChange: (status: 'lost' | 'found' | 'reunited') => void
  updating: boolean
}) {
  const statusColors = {
    lost: 'bg-[var(--status-error,#ef4444)]',
    found: 'bg-[var(--status-warning,#f59e0b)]',
    reunited: 'bg-[var(--status-success,#22c55e)]',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[var(--bg-paper)] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-default)] p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
              {report.pet.photo_url ? (
                <img
                  src={report.pet.photo_url}
                  alt={report.pet.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PawPrint className="h-8 w-8 text-[var(--text-muted)]" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {report.pet.name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {report.pet.breed || report.pet.species} • {report.pet.color}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Actions */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-[var(--text-muted)]">
              Cambiar estado
            </h3>
            <div className="flex gap-2">
              {(['lost', 'found', 'reunited'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  disabled={updating || report.status === status}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${statusColors[status]}`}
                >
                  {status === 'lost' && 'Perdido'}
                  {status === 'found' && 'Encontrado'}
                  {status === 'reunited' && 'Reunido'}
                </button>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-[var(--text-primary)]">
                Información del Reporte
              </h3>

              <div className="space-y-3 rounded-xl bg-[var(--bg-subtle)] p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[var(--status-error,#ef4444)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Última ubicación
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {report.last_seen_location || 'No especificada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Fecha de pérdida
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
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

                {report.notes && (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Notas
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {report.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-[var(--text-primary)]">
                Información de Contacto
              </h3>

              <div className="space-y-3 rounded-xl bg-[var(--bg-subtle)] p-4">
                {report.pet.owner && (
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Dueño
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {report.pet.owner.full_name}
                    </p>
                  </div>
                )}

                {(report.contact_phone || report.pet.owner?.phone) && (
                  <a
                    href={`tel:${report.contact_phone || report.pet.owner?.phone}`}
                    className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {report.contact_phone || report.pet.owner?.phone}
                  </a>
                )}

                {(report.contact_email || report.pet.owner?.email) && (
                  <a
                    href={`mailto:${report.contact_email || report.pet.owner?.email}`}
                    className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {report.contact_email || report.pet.owner?.email}
                  </a>
                )}

                {report.pet.microchip_number && (
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Microchip
                    </p>
                    <p className="font-mono text-sm text-[var(--text-secondary)]">
                      {report.pet.microchip_number}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sightings */}
          {report.sightings?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-medium text-[var(--text-primary)]">
                Avistamientos ({report.sightings.length})
              </h3>
              <div className="space-y-3">
                {report.sightings.map((sighting) => (
                  <div
                    key={sighting.id}
                    className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-paper)] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-[var(--status-warning,#f59e0b)]" />
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {sighting.sighting_location}
                          </p>
                          {sighting.description && (
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {sighting.description}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-[var(--text-muted)]">
                            {sighting.reporter_name || 'Anónimo'} •{' '}
                            {new Date(sighting.sighting_date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      {sighting.is_verified && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--status-success-bg,#dcfce7)] px-2 py-0.5 text-xs font-medium text-[var(--status-success,#22c55e)]">
                          <Check className="h-3 w-3" />
                          Verificado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
