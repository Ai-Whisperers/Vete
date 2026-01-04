'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  ChevronDown,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
} from 'lucide-react'
import { OfferSlotModal } from './offer-slot-modal'
import { Badge } from '@/components/ui/badge'

interface WaitlistEntry {
  id: string
  pet: {
    id: string
    name: string
    species: string
    breed: string
    photo_url: string | null
  }
  service: {
    id: string
    name: string
    duration_minutes: number
    base_price: number
  }
  preferred_vet: { id: string; full_name: string } | null
  owner: {
    owner: {
      id: string
      full_name: string
      email: string
      phone: string
    }
  }
  preferred_date: string
  preferred_time_start: string | null
  preferred_time_end: string | null
  is_flexible_date: boolean
  position: number
  status: 'waiting' | 'offered' | 'booked' | 'expired' | 'cancelled'
  offered_appointment_id: string | null
  offer_expires_at: string | null
  notify_via: string[]
  notes: string | null
  created_at: string
}

const statusConfig = {
  waiting: { label: 'Esperando', color: 'bg-amber-100 text-amber-700', icon: Clock },
  offered: { label: 'Ofrecido', color: 'bg-blue-100 text-blue-700', icon: Send },
  booked: { label: 'Reservado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-600', icon: AlertCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-600', icon: XCircle },
}

export function WaitlistManager(): React.ReactElement {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null)
  const [showOfferModal, setShowOfferModal] = useState(false)

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFilter) params.append('date', dateFilter)

      const res = await fetch(`/api/appointments/waitlist?${params}`)
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      setEntries(data.waitlist || [])
    } catch (error) {
      console.error('Error fetching waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [statusFilter, dateFilter])

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const formatTime = (timeStr: string | null): string => {
    if (!timeStr) return ''
    return timeStr.substring(0, 5)
  }

  // Filter entries by search
  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      entry.pet.name.toLowerCase().includes(query) ||
      entry.owner?.owner?.full_name?.toLowerCase().includes(query) ||
      entry.service.name.toLowerCase().includes(query)
    )
  })

  // Group by date
  const groupedByDate = filteredEntries.reduce(
    (acc, entry) => {
      const date = entry.preferred_date
      if (!acc[date]) acc[date] = []
      acc[date].push(entry)
      return acc
    },
    {} as Record<string, WaitlistEntry[]>
  )

  const sortedDates = Object.keys(groupedByDate).sort()

  const handleOfferSuccess = () => {
    setShowOfferModal(false)
    setSelectedEntry(null)
    fetchEntries()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Lista de Espera
          </h2>
          <p className="text-sm text-gray-500">
            {entries.filter((e) => e.status === 'waiting').length} clientes esperando
          </p>
        </div>
        <button
          onClick={fetchEntries}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mascota o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="waiting">Esperando</option>
            <option value="offered">Ofrecido</option>
            <option value="booked">Reservado</option>
            <option value="expired">Expirado</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
        />

        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpiar fecha
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 font-medium text-gray-600">
            No hay entradas en la lista de espera
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--primary)]" />
                <span className="font-medium text-[var(--text-primary)]">
                  {formatDate(date)}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {groupedByDate[date].length} en espera
                </span>
              </div>

              {/* Entries */}
              <div className="space-y-3">
                {groupedByDate[date].map((entry) => {
                  const config = statusConfig[entry.status]
                  const StatusIcon = config.icon

                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-4">
                        {/* Position */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700">
                          #{entry.position}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">
                                {entry.pet.name}
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                  ({entry.pet.species} - {entry.pet.breed})
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                {entry.service.name}
                                {entry.preferred_vet && (
                                  <span className="ml-2">
                                    • Prefiere: {entry.preferred_vet.full_name}
                                  </span>
                                )}
                              </p>
                            </div>
                            <Badge className={config.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                          </div>

                          {/* Time Preference */}
                          {(entry.preferred_time_start || entry.preferred_time_end) && (
                            <p className="mt-1 text-sm text-gray-500">
                              Horario: {formatTime(entry.preferred_time_start)} -{' '}
                              {formatTime(entry.preferred_time_end)}
                              {entry.is_flexible_date && (
                                <span className="ml-2 text-amber-600">
                                  (Fecha flexible)
                                </span>
                              )}
                            </p>
                          )}

                          {/* Owner Contact */}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              <User className="h-3.5 w-3.5" />
                              {entry.owner?.owner?.full_name}
                            </span>
                            {entry.owner?.owner?.phone && (
                              <a
                                href={`tel:${entry.owner.owner.phone}`}
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                {entry.owner.owner.phone}
                              </a>
                            )}
                            {entry.owner?.owner?.email && (
                              <a
                                href={`mailto:${entry.owner.owner.email}`}
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                {entry.owner.owner.email}
                              </a>
                            )}
                          </div>

                          {/* Notes */}
                          {entry.notes && (
                            <p className="mt-2 rounded bg-gray-50 p-2 text-sm italic text-gray-600">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        {entry.status === 'waiting' && (
                          <button
                            onClick={() => {
                              setSelectedEntry(entry)
                              setShowOfferModal(true)
                            }}
                            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white hover:opacity-90"
                          >
                            <Send className="h-4 w-4" />
                            Ofrecer Cita
                          </button>
                        )}

                        {entry.status === 'offered' && entry.offer_expires_at && (
                          <div className="text-right text-sm">
                            <p className="font-medium text-blue-600">Oferta enviada</p>
                            <p className="text-gray-500">
                              Expira:{' '}
                              {new Date(entry.offer_expires_at).toLocaleTimeString('es-PY', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && selectedEntry && (
        <OfferSlotModal
          entry={selectedEntry}
          onClose={() => {
            setShowOfferModal(false)
            setSelectedEntry(null)
          }}
          onSuccess={handleOfferSuccess}
        />
      )}
    </div>
  )
}
