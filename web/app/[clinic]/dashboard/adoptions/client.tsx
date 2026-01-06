'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  RefreshCw,
  PawPrint,
  X,
  FileText,
  Mail,
  Phone,
  Home,
  Calendar,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  sex: string
  photo_url: string
}

interface AdoptionListing {
  id: string
  status: 'available' | 'pending' | 'adopted' | 'withdrawn'
  story: string
  personality: string
  requirements: string
  adoption_fee: number
  includes_vaccines: boolean
  includes_neutering: boolean
  includes_microchip: boolean
  good_with_kids: boolean | null
  good_with_dogs: boolean | null
  good_with_cats: boolean | null
  energy_level: string | null
  special_needs: string | null
  featured: boolean
  views_count: number
  listed_at: string
  pet: Pet
  applications_count: { count: number }[]
}

interface Application {
  id: string
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  living_situation: string
  has_yard: boolean
  household_members: number
  has_children: boolean
  other_pets: string
  pet_experience: string
  reason_for_adoption: string
  hours_alone: number
  status: 'pending' | 'reviewing' | 'interview_scheduled' | 'approved' | 'rejected' | 'withdrawn'
  created_at: string
  interview_scheduled_at: string | null
  interview_notes: string | null
}

interface Props {
  clinicSlug: string
}

export function AdoptionsManagement({ clinicSlug }: Props) {
  const [listings, setListings] = useState<AdoptionListing[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'pending' | 'adopted' | 'withdrawn'>('all')
  const [selectedListing, setSelectedListing] = useState<AdoptionListing | null>(null)
  const [showApplications, setShowApplications] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        limit: '100',
      })

      const response = await fetch(`/api/adoptions?${params}`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Error fetching adoptions:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const fetchApplications = useCallback(async (listingId: string) => {
    setLoadingApplications(true)
    try {
      const response = await fetch(`/api/adoptions/${listingId}/applications`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  useEffect(() => {
    if (selectedListing && showApplications) {
      fetchApplications(selectedListing.id)
    }
  }, [selectedListing, showApplications, fetchApplications])

  const updateListingStatus = async (listingId: string, newStatus: string) => {
    setUpdating(listingId)
    try {
      const response = await fetch(`/api/adoptions/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      await fetchListings()
    } catch (error) {
      console.error('Error updating listing:', error)
      alert('Error al actualizar el listado')
    } finally {
      setUpdating(null)
    }
  }

  const toggleFeatured = async (listingId: string, currentFeatured: boolean) => {
    setUpdating(listingId)
    try {
      const response = await fetch(`/api/adoptions/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ featured: !currentFeatured }),
      })

      if (!response.ok) throw new Error('Failed to update')

      await fetchListings()
    } catch (error) {
      console.error('Error toggling featured:', error)
    } finally {
      setUpdating(null)
    }
  }

  const updateApplicationStatus = async (appId: string, newStatus: string, notes?: string) => {
    setUpdating(appId)
    try {
      const body: Record<string, unknown> = { status: newStatus }
      if (notes) body.interview_notes = notes

      const response = await fetch(`/api/adoptions/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('Failed to update')

      if (selectedListing) {
        await fetchApplications(selectedListing.id)
        await fetchListings()
      }
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Error al actualizar la solicitud')
    } finally {
      setUpdating(null)
    }
  }

  const statusColors = {
    available: {
      bg: 'bg-[var(--status-success-bg,#dcfce7)]',
      text: 'text-[var(--status-success,#22c55e)]',
    },
    pending: {
      bg: 'bg-[var(--status-warning-bg,#fffbeb)]',
      text: 'text-[var(--status-warning,#f59e0b)]',
    },
    adopted: {
      bg: 'bg-[var(--primary-bg,#dbeafe)]',
      text: 'text-[var(--primary)]',
    },
    withdrawn: {
      bg: 'bg-[var(--bg-subtle)]',
      text: 'text-[var(--text-muted)]',
    },
  }

  const statusLabels = {
    available: 'Disponible',
    pending: 'En Proceso',
    adopted: 'Adoptado',
    withdrawn: 'Retirado',
  }

  const appStatusLabels = {
    pending: 'Pendiente',
    reviewing: 'En Revisión',
    interview_scheduled: 'Entrevista',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    withdrawn: 'Retirada',
  }

  const appStatusColors = {
    pending: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
    reviewing: 'bg-[var(--status-warning-bg,#fffbeb)] text-[var(--status-warning,#f59e0b)]',
    interview_scheduled: 'bg-[var(--primary-bg,#dbeafe)] text-[var(--primary)]',
    approved: 'bg-[var(--status-success-bg,#dcfce7)] text-[var(--status-success,#22c55e)]',
    rejected: 'bg-[var(--status-error-bg,#fef2f2)] text-[var(--status-error,#ef4444)]',
    withdrawn: 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
  }

  // Stats
  const stats = {
    available: listings.filter((l) => l.status === 'available').length,
    pending: listings.filter((l) => l.status === 'pending').length,
    adopted: listings.filter((l) => l.status === 'adopted').length,
    totalApplications: listings.reduce(
      (sum, l) => sum + (l.applications_count?.[0]?.count || 0),
      0
    ),
  }

  const filteredListings =
    statusFilter === 'all' ? listings : listings.filter((l) => l.status === statusFilter)

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-paper)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--text-primary)]">
                <Heart className="h-6 w-6 text-[var(--primary)]" />
                Gestión de Adopciones
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Administra los listados de adopción y solicitudes
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchListings()}
                className="flex items-center gap-2 rounded-xl bg-[var(--bg-subtle)] px-4 py-2.5 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[var(--primary-dark)]">
                <Plus className="h-5 w-5" />
                Nuevo Listado
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-[var(--status-success-bg,#dcfce7)] p-4">
              <div className="flex items-center gap-2 text-[var(--status-success,#22c55e)]">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Disponibles</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{stats.available}</p>
            </div>
            <div className="rounded-xl bg-[var(--status-warning-bg,#fffbeb)] p-4">
              <div className="flex items-center gap-2 text-[var(--status-warning,#f59e0b)]">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">En Proceso</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{stats.pending}</p>
            </div>
            <div className="rounded-xl bg-[var(--primary-bg,#dbeafe)] p-4">
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">Adoptados</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{stats.adopted}</p>
            </div>
            <div className="rounded-xl bg-[var(--bg-subtle)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Solicitudes</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{stats.totalApplications}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex gap-2">
            {(['all', 'available', 'pending', 'adopted', 'withdrawn'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                {status === 'all' ? 'Todos' : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--bg-subtle)]" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
              <PawPrint className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">No hay listados</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Crea un nuevo listado para empezar a recibir solicitudes de adopción.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-paper)] shadow-sm"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {/* Pet Photo */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
                    {listing.pet.photo_url ? (
                      <img
                        src={listing.pet.photo_url}
                        alt={listing.pet.name}
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
                        {listing.pet.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusColors[listing.status].bg} ${statusColors[listing.status].text}`}
                      >
                        {statusLabels[listing.status]}
                      </span>
                      {listing.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--status-warning,#f59e0b)] px-2 py-0.5 text-xs font-bold text-white">
                          <Star className="h-3 w-3" /> Destacado
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[var(--text-secondary)]">
                      {listing.pet.breed || listing.pet.species} •{' '}
                      {listing.pet.sex === 'male' ? 'Macho' : 'Hembra'} •{' '}
                      {listing.adoption_fee > 0
                        ? `${listing.adoption_fee.toLocaleString()} Gs`
                        : 'Gratis'}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing.views_count} vistas
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {listing.applications_count?.[0]?.count || 0} solicitudes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(listing.listed_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setSelectedListing(listing)
                        setShowApplications(true)
                      }}
                      className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-dark)]"
                    >
                      <Users className="h-4 w-4" />
                      Ver Solicitudes
                    </button>

                    <button
                      onClick={() => toggleFeatured(listing.id, listing.featured)}
                      disabled={updating === listing.id}
                      className={`rounded-lg p-2 transition-colors ${
                        listing.featured
                          ? 'bg-[var(--status-warning,#f59e0b)] text-white'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                      }`}
                      title={listing.featured ? 'Quitar destacado' : 'Destacar'}
                    >
                      <Star className="h-5 w-5" />
                    </button>

                    {listing.status === 'available' && (
                      <button
                        onClick={() => updateListingStatus(listing.id, 'withdrawn')}
                        disabled={updating === listing.id}
                        className="rounded-lg bg-[var(--status-error-bg,#fef2f2)] p-2 text-[var(--status-error,#ef4444)] transition-colors hover:bg-[var(--status-error,#ef4444)]/20"
                        title="Retirar listado"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications Modal */}
      {showApplications && selectedListing && (
        <ApplicationsModal
          listing={selectedListing}
          applications={applications}
          loading={loadingApplications}
          onClose={() => {
            setShowApplications(false)
            setSelectedListing(null)
          }}
          onUpdateStatus={updateApplicationStatus}
          updating={updating}
          statusLabels={appStatusLabels}
          statusColors={appStatusColors}
        />
      )}
    </div>
  )
}

// Applications Modal Component
function ApplicationsModal({
  listing,
  applications,
  loading,
  onClose,
  onUpdateStatus,
  updating,
  statusLabels,
  statusColors,
}: {
  listing: AdoptionListing
  applications: Application[]
  loading: boolean
  onClose: () => void
  onUpdateStatus: (appId: string, status: string, notes?: string) => void
  updating: string | null
  statusLabels: Record<string, string>
  statusColors: Record<string, string>
}) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const livingSituationLabels: Record<string, string> = {
    house: 'Casa',
    apartment: 'Departamento',
    farm: 'Chacra/Finca',
    other: 'Otro',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-[var(--bg-paper)] shadow-xl">
        <div className="sticky top-0 border-b border-[var(--border-default)] bg-[var(--bg-paper)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
                {listing.pet.photo_url ? (
                  <img
                    src={listing.pet.photo_url}
                    alt={listing.pet.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PawPrint className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Solicitudes para {listing.pet.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {applications.length} solicitudes
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
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--bg-subtle)]" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
              <p className="text-[var(--text-secondary)]">No hay solicitudes aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-paper)] p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[var(--text-primary)]">
                          {app.applicant_name}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[app.status]}`}>
                          {statusLabels[app.status]}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                        <a
                          href={`mailto:${app.applicant_email}`}
                          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)]"
                        >
                          <Mail className="h-4 w-4" />
                          {app.applicant_email}
                        </a>
                        <a
                          href={`tel:${app.applicant_phone}`}
                          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)]"
                        >
                          <Phone className="h-4 w-4" />
                          {app.applicant_phone}
                        </a>
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Home className="h-4 w-4" />
                          {livingSituationLabels[app.living_situation]}
                          {app.has_yard ? ' con patio' : ''}
                        </span>
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(app.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>

                      {app.reason_for_adoption && (
                        <p className="mt-3 text-sm text-[var(--text-secondary)]">
                          <strong className="text-[var(--text-primary)]">Motivación:</strong>{' '}
                          {app.reason_for_adoption.slice(0, 200)}
                          {app.reason_for_adoption.length > 200 ? '...' : ''}
                        </p>
                      )}
                    </div>

                    {/* Status Actions */}
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(app.id, 'reviewing')}
                            disabled={updating === app.id}
                            className="rounded-lg bg-[var(--status-warning-bg,#fffbeb)] px-3 py-1.5 text-sm font-medium text-[var(--status-warning,#f59e0b)] transition-colors hover:bg-[var(--status-warning,#f59e0b)]/20"
                          >
                            Revisar
                          </button>
                          <button
                            onClick={() => onUpdateStatus(app.id, 'rejected')}
                            disabled={updating === app.id}
                            className="rounded-lg bg-[var(--status-error-bg,#fef2f2)] px-3 py-1.5 text-sm font-medium text-[var(--status-error,#ef4444)] transition-colors hover:bg-[var(--status-error,#ef4444)]/20"
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {app.status === 'reviewing' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(app.id, 'interview_scheduled')}
                            disabled={updating === app.id}
                            className="rounded-lg bg-[var(--primary-bg,#dbeafe)] px-3 py-1.5 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20"
                          >
                            Agendar Entrevista
                          </button>
                          <button
                            onClick={() => onUpdateStatus(app.id, 'approved')}
                            disabled={updating === app.id}
                            className="rounded-lg bg-[var(--status-success-bg,#dcfce7)] px-3 py-1.5 text-sm font-medium text-[var(--status-success,#22c55e)] transition-colors hover:bg-[var(--status-success,#22c55e)]/20"
                          >
                            Aprobar
                          </button>
                        </>
                      )}

                      {app.status === 'interview_scheduled' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(app.id, 'approved')}
                            disabled={updating === app.id}
                            className="rounded-lg bg-[var(--status-success-bg,#dcfce7)] px-3 py-1.5 text-sm font-medium text-[var(--status-success,#22c55e)] transition-colors hover:bg-[var(--status-success,#22c55e)]/20"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => onUpdateStatus(app.id, 'rejected')}
                            disabled={updating === app.id}
                            className="rounded-lg bg-[var(--status-error-bg,#fef2f2)] px-3 py-1.5 text-sm font-medium text-[var(--status-error,#ef4444)] transition-colors hover:bg-[var(--status-error,#ef4444)]/20"
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedApp(app)}
                        className="rounded-lg bg-[var(--bg-subtle)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
