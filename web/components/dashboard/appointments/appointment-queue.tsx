'use client'

import * as Icons from 'lucide-react'
import { StatusButtons } from './status-buttons'
import { statusConfig, formatAppointmentTime } from '@/lib/types/appointments'

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

  return (
    <div className="space-y-6">
      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <h2 className="font-bold text-[var(--text-primary)]">En Consulta</h2>
            <span className="text-sm text-[var(--text-secondary)]">({inProgress.length})</span>
          </div>
          <div className="space-y-3">
            {inProgress.map(apt => (
              <AppointmentRow key={apt.id} appointment={apt} clinic={clinic} highlight="purple" />
            ))}
          </div>
        </section>
      )}

      {/* Checked In Section */}
      {checkedIn.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <h2 className="font-bold text-[var(--text-primary)]">Cola de Espera</h2>
            <span className="text-sm text-[var(--text-secondary)]">({checkedIn.length})</span>
          </div>
          <div className="space-y-3">
            {checkedIn.map(apt => (
              <AppointmentRow key={apt.id} appointment={apt} clinic={clinic} highlight="yellow" />
            ))}
          </div>
        </section>
      )}

      {/* Waiting Section */}
      {waiting.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="font-bold text-[var(--text-primary)]">Próximas Citas</h2>
            <span className="text-sm text-[var(--text-secondary)]">({waiting.length})</span>
          </div>
          <div className="space-y-3">
            {waiting.map(apt => (
              <AppointmentRow key={apt.id} appointment={apt} clinic={clinic} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <h2 className="font-bold text-[var(--text-primary)]">Finalizadas</h2>
            <span className="text-sm text-[var(--text-secondary)]">({completed.length})</span>
          </div>
          <div className="space-y-3">
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
  faded
}: {
  appointment: Appointment
  clinic: string
  highlight?: 'purple' | 'yellow'
  faded?: boolean
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
              <img
                src={appointment.pets.photo_url}
                alt={appointment.pets.name}
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
