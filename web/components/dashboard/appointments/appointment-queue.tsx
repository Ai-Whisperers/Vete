'use client'

import { useState, useEffect, useMemo } from 'react'
import * as Icons from 'lucide-react'
import Image from 'next/image'
import { StatusButtons } from './status-buttons'
import { statusConfig, formatAppointmentTime } from '@/lib/types/appointments'
import { cn } from '@/lib/utils'

// Calculate time difference in minutes
function getMinutesDiff(fromDate: string): number {
  const from = new Date(fromDate)
  const now = new Date()
  return Math.floor((now.getTime() - from.getTime()) / (1000 * 60))
}

// Format waiting time for display
function formatWaitingTime(minutes: number): string {
  if (minutes < 1) return 'Recién llegó'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Get urgency level based on wait time
function getWaitUrgency(minutes: number): 'normal' | 'warning' | 'urgent' {
  if (minutes >= 45) return 'urgent'
  if (minutes >= 20) return 'warning'
  return 'normal'
}

// Waiting time indicator component
function WaitingTimeIndicator({ checkedInAt }: { checkedInAt: string }) {
  const [minutes, setMinutes] = useState(() => getMinutesDiff(checkedInAt))

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(getMinutesDiff(checkedInAt))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [checkedInAt])

  const urgency = getWaitUrgency(minutes)
  const urgencyStyles = {
    normal: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    urgent: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
        urgencyStyles[urgency]
      )}
      title={`En espera desde ${new Date(checkedInAt).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`}
    >
      <Icons.Timer className="w-3.5 h-3.5" />
      <span>{formatWaitingTime(minutes)}</span>
    </div>
  )
}

// Estimated wait time calculation for queue position
function EstimatedWaitBadge({ position, avgServiceTime = 15 }: { position: number; avgServiceTime?: number }) {
  const estimatedMinutes = position * avgServiceTime

  if (estimatedMinutes === 0) {
    return (
      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
        <Icons.Zap className="w-3 h-3" />
        Siguiente
      </span>
    )
  }

  return (
    <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
      <Icons.Clock className="w-3 h-3" />
      ~{formatWaitingTime(estimatedMinutes)} de espera
    </span>
  )
}

interface Pet {
  id: string
  name: string
  species: string
  photo_url?: string | null
  owner?: {
    id: string
    full_name: string
    phone?: string | null
  }
}

interface Appointment {
  id: string
  tenant_id: string
  start_time: string
  end_time: string
  status: string
  reason: string
  notes?: string | null
  checked_in_at?: string | null
  started_at?: string | null
  pets: Pet
}

interface AppointmentQueueProps {
  appointments: Appointment[]
  clinic: string
}

const speciesIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dog: Icons.Dog,
  cat: Icons.Cat,
  bird: Icons.Bird,
  rabbit: Icons.Rabbit,
  fish: Icons.Fish,
  default: Icons.PawPrint
}

export function AppointmentQueue({ appointments, clinic }: AppointmentQueueProps) {
  // Group by status for better visual organization
  const inProgress = appointments.filter(a => a.status === 'in_progress')
  const checkedIn = appointments.filter(a => a.status === 'checked_in')
  const waiting = appointments.filter(a => ['pending', 'confirmed'].includes(a.status))
  const completed = appointments.filter(a => ['completed', 'no_show', 'cancelled'].includes(a.status))

  // Calculate wait time stats for checked-in patients
  const waitStats = useMemo(() => {
    if (checkedIn.length === 0) return null

    const waitTimes = checkedIn
      .filter(a => a.checked_in_at)
      .map(a => getMinutesDiff(a.checked_in_at!))

    if (waitTimes.length === 0) return null

    const avg = Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
    const max = Math.max(...waitTimes)
    const longestWaiting = checkedIn.reduce((longest, apt) => {
      if (!apt.checked_in_at) return longest
      if (!longest) return apt
      return getMinutesDiff(apt.checked_in_at) > getMinutesDiff(longest.checked_in_at!)
        ? apt
        : longest
    }, null as Appointment | null)

    return { avg, max, longestWaiting }
  }, [checkedIn])

  return (
    <div className="space-y-6">
      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <section aria-labelledby="in-progress-heading">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" aria-hidden="true" />
            <h2 id="in-progress-heading" className="font-bold text-[var(--text-primary)]">En Consulta</h2>
            <span className="text-sm text-[var(--text-secondary)]" aria-label={`${inProgress.length} citas en consulta`}>({inProgress.length})</span>
          </div>
          <div className="space-y-3" role="list">
            {inProgress.map(apt => (
              <AppointmentRow key={apt.id} appointment={apt} clinic={clinic} highlight="purple" />
            ))}
          </div>
        </section>
      )}

      {/* Checked In Section */}
      {checkedIn.length > 0 && (
        <section aria-labelledby="checked-in-heading">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" aria-hidden="true" />
              <h2 id="checked-in-heading" className="font-bold text-[var(--text-primary)]">Cola de Espera</h2>
              <span className="text-sm text-[var(--text-secondary)]" aria-label={`${checkedIn.length} citas en espera`}>({checkedIn.length})</span>
            </div>
            {waitStats && (
              <div className="flex items-center gap-3 text-xs ml-0 sm:ml-auto">
                <span className="text-[var(--text-secondary)] flex items-center gap-1">
                  <Icons.BarChart3 className="w-3 h-3" />
                  Prom: <span className="font-bold text-[var(--text-primary)]">{formatWaitingTime(waitStats.avg)}</span>
                </span>
                {waitStats.max >= 20 && (
                  <span className={cn(
                    'flex items-center gap-1',
                    waitStats.max >= 45 ? 'text-red-600' : 'text-yellow-600'
                  )}>
                    <Icons.AlertTriangle className="w-3 h-3" />
                    Máx: <span className="font-bold">{formatWaitingTime(waitStats.max)}</span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="space-y-3" role="list">
            {checkedIn.map((apt, index) => (
              <AppointmentRow
                key={apt.id}
                appointment={apt}
                clinic={clinic}
                highlight="yellow"
                showWaitTime
                queuePosition={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Waiting Section */}
      {waiting.length > 0 && (
        <section aria-labelledby="waiting-heading">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
            <h2 id="waiting-heading" className="font-bold text-[var(--text-primary)]">Próximas Citas</h2>
            <span className="text-sm text-[var(--text-secondary)]" aria-label={`${waiting.length} citas próximas`}>({waiting.length})</span>
          </div>
          <div className="space-y-3" role="list">
            {waiting.map(apt => (
              <AppointmentRow key={apt.id} appointment={apt} clinic={clinic} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <section aria-labelledby="completed-heading">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-400" aria-hidden="true" />
            <h2 id="completed-heading" className="font-bold text-[var(--text-primary)]">Finalizadas</h2>
            <span className="text-sm text-[var(--text-secondary)]" aria-label={`${completed.length} citas finalizadas`}>({completed.length})</span>
          </div>
          <div className="space-y-3" role="list">
            {completed.map(apt => (
              <AppointmentRow key={apt.id} appointment={apt} clinic={clinic} faded />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function AppointmentRow({
  appointment,
  clinic,
  highlight,
  faded,
  queuePosition,
  showWaitTime = false,
}: {
  appointment: Appointment
  clinic: string
  highlight?: 'purple' | 'yellow'
  faded?: boolean
  queuePosition?: number
  showWaitTime?: boolean
}) {
  const status = statusConfig[appointment.status] || statusConfig.pending
  const SpeciesIcon = speciesIcons[appointment.pets?.species] || speciesIcons.default

  const highlightBorder = highlight === 'purple'
    ? 'border-l-4 border-l-purple-500'
    : highlight === 'yellow'
      ? 'border-l-4 border-l-yellow-500'
      : ''

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-4 ${highlightBorder} ${faded ? 'opacity-60' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Time */}
        <div className="flex items-center gap-3 min-w-[100px]">
          <Icons.Clock className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <p className="font-bold text-[var(--text-primary)]">
              {formatAppointmentTime(appointment.start_time)}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {formatAppointmentTime(appointment.end_time)}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center overflow-hidden shrink-0">
            {appointment.pets?.photo_url ? (
              <Image
                src={appointment.pets.photo_url}
                alt={appointment.pets.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <SpeciesIcon className="w-6 h-6 text-[var(--primary)]" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-[var(--text-primary)] truncate">
              {appointment.pets?.name || 'Sin nombre'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] truncate">
              {appointment.pets?.owner?.full_name || 'Propietario desconocido'}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {appointment.reason}
          </p>
          {appointment.pets?.owner?.phone && (
            <a
              href={`tel:${appointment.pets.owner.phone}`}
              className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <Icons.Phone className="w-3 h-3" />
              {appointment.pets.owner.phone}
            </a>
          )}
        </div>

        {/* Waiting Time / Queue Position */}
        {showWaitTime && appointment.checked_in_at && (
          <div className="shrink-0">
            <WaitingTimeIndicator checkedInAt={appointment.checked_in_at} />
          </div>
        )}

        {queuePosition !== undefined && (
          <div className="shrink-0">
            <EstimatedWaitBadge position={queuePosition} />
          </div>
        )}

        {/* Status Badge */}
        <div className="shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* Actions */}
        {!faded && (
          <div className="shrink-0">
            <StatusButtons
              appointmentId={appointment.id}
              currentStatus={appointment.status}
              clinic={clinic}
            />
          </div>
        )}
      </div>
    </div>
  )
}
