'use client'

import Link from 'next/link'
import * as Icons from 'lucide-react'
import { CancelButton } from './cancel-button'
import { RescheduleDialog } from './reschedule-dialog'
import {
  statusConfig,
  formatAppointmentDate,
  formatAppointmentTime,
  canCancelAppointment,
  canRescheduleAppointment,
  formatAppointmentDateTime
} from '@/lib/types/appointments'

interface AppointmentCardProps {
  appointment: {
    id: string
    tenant_id: string
    start_time: string
    end_time: string
    status: string
    reason: string
    notes?: string | null
    pets: {
      id: string
      name: string
      species: string
      photo_url?: string | null
    }
  }
  clinic: string
  showActions?: boolean
  onUpdate?: () => void
}

const speciesIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dog: Icons.Dog,
  cat: Icons.Cat,
  bird: Icons.Bird,
  rabbit: Icons.Rabbit,
  fish: Icons.Fish,
  default: Icons.PawPrint
}

export function AppointmentCard({
  appointment,
  clinic,
  showActions = true,
  onUpdate
}: AppointmentCardProps) {
  const status = statusConfig[appointment.status] || statusConfig.pending
  const canCancel = canCancelAppointment(appointment)
  const canReschedule = canRescheduleAppointment(appointment)

  const SpeciesIcon = speciesIcons[appointment.pets.species] || speciesIcons.default

  const isPast = new Date(appointment.start_time) < new Date()
  const isToday = new Date(appointment.start_time).toDateString() === new Date().toDateString()

  return (
    <div className={`bg-white rounded-2xl border transition-all hover:shadow-lg ${
      appointment.status === 'cancelled'
        ? 'border-red-100 bg-red-50/30'
        : isPast
          ? 'border-gray-100 opacity-75'
          : 'border-gray-100 hover:border-[var(--primary)]/30'
    }`}>
      <div className="p-5">
        {/* Header with status and date */}
        <div className="flex flex-wrap items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Pet Avatar */}
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center overflow-hidden">
              {appointment.pets.photo_url ? (
                <img
                  src={appointment.pets.photo_url}
                  alt={appointment.pets.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <SpeciesIcon className="w-6 h-6 text-[var(--primary)]" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-[var(--text-primary)]">
                {appointment.pets.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] capitalize">
                {appointment.reason}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* Date and Time */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <Icons.Calendar className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span className={`font-medium ${isToday ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-primary)]'}`}>
              {formatAppointmentDateTime(appointment.start_time)}
            </span>
          </div>
        </div>

        {/* Notes if any */}
        {appointment.notes && !appointment.notes.startsWith('[Cancelado') && (
          <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
            {appointment.notes}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Link
              href={`/${clinic}/portal/appointments/${appointment.id}`}
              className="text-sm text-[var(--primary)] font-medium hover:underline flex items-center gap-1"
            >
              Ver detalles
              <Icons.ChevronRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              {canReschedule && (
                <RescheduleDialog
                  appointmentId={appointment.id}
                  clinicId={clinic}
                  currentDate={appointment.start_time.split('T')[0]}
                  currentTime={formatAppointmentTime(appointment.start_time)}
                  onSuccess={onUpdate}
                />
              )}
              {canCancel && (
                <CancelButton
                  appointmentId={appointment.id}
                  variant="icon"
                  onSuccess={onUpdate}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
