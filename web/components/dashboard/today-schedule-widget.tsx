import * as Icons from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
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
  start_time: string
  end_time: string
  status: string
  reason: string
  pets: Pet | null
}

interface TodayScheduleWidgetProps {
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

export function TodayScheduleWidget({ appointments, clinic }: TodayScheduleWidgetProps) {
  // Group appointments by status priority
  const activeAppointments = appointments.filter(a =>
    ['in_progress', 'checked_in', 'pending', 'confirmed'].includes(a.status)
  )
  const completedCount = appointments.filter(a =>
    ['completed', 'no_show', 'cancelled'].includes(a.status)
  ).length

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Find the next upcoming appointment
  const nextAppointment = activeAppointments.find(apt => {
    const aptTime = new Date(apt.start_time)
    return aptTime > now
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Icons.CalendarClock className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Agenda de Hoy</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {new Date().toLocaleDateString('es-PY', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>
        <Link
          href={`/${clinic}/dashboard/appointments`}
          className="text-[var(--primary)] text-sm font-medium hover:underline flex items-center gap-1"
        >
          Ver todo
          <Icons.ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="px-5 py-3 bg-gray-50 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[var(--text-secondary)]">
            {activeAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length} pendientes
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[var(--text-secondary)]">
            {activeAppointments.filter(a => a.status === 'in_progress').length} en consulta
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[var(--text-secondary)]">
            {completedCount} completadas
          </span>
        </div>
      </div>

      {/* Appointments List */}
      {activeAppointments.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Icons.CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[var(--text-secondary)] text-sm">
            No hay citas pendientes para hoy
          </p>
          <Link
            href={`/${clinic}/dashboard/appointments/new`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Icons.Plus className="w-4 h-4" />
            Nueva Cita
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {activeAppointments.slice(0, 8).map((apt) => {
            const status = statusConfig[apt.status] || statusConfig.pending
            const SpeciesIcon = speciesIcons[apt.pets?.species || 'default'] || speciesIcons.default
            const aptTime = new Date(apt.start_time)
            const isNext = nextAppointment?.id === apt.id
            const isPast = aptTime < now && !['in_progress', 'checked_in'].includes(apt.status)

            return (
              <div
                key={apt.id}
                className={`px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  apt.status === 'in_progress' ? 'bg-purple-50/50' : ''
                } ${isNext ? 'bg-blue-50/50' : ''}`}
              >
                {/* Time Column */}
                <div className={`w-16 shrink-0 ${isPast ? 'opacity-50' : ''}`}>
                  <p className={`font-bold text-sm ${
                    apt.status === 'in_progress' ? 'text-purple-600' :
                    isNext ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {formatAppointmentTime(apt.start_time)}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    {formatAppointmentTime(apt.end_time)}
                  </p>
                </div>

                {/* Pet Avatar */}
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center overflow-hidden shrink-0">
                  {apt.pets?.photo_url ? (
                    <Image
                      src={apt.pets.photo_url}
                      alt={apt.pets.name || 'Mascota'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <SpeciesIcon className="w-5 h-5 text-[var(--primary)]" />
                  )}
                </div>

                {/* Pet & Owner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {apt.pets?.name || 'Sin nombre'}
                    </p>
                    {isNext && (
                      <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">
                        SIGUIENTE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {apt.pets?.owner?.full_name || 'Propietario desconocido'}
                  </p>
                </div>

                {/* Reason */}
                <div className="hidden md:block flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {apt.reason}
                  </p>
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold shrink-0 ${status.className}`}>
                  {status.label}
                </span>

                {/* Phone Quick Action */}
                {apt.pets?.owner?.phone && (
                  <a
                    href={`tel:${apt.pets.owner.phone}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                    title={`Llamar a ${apt.pets.owner.phone}`}
                    aria-label={`Llamar a ${apt.pets.owner.full_name || 'propietario'} al ${apt.pets.owner.phone}`}
                  >
                    <Icons.Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Footer - Show more link if there are more appointments */}
      {activeAppointments.length > 8 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <Link
            href={`/${clinic}/dashboard/appointments`}
            className="text-[var(--primary)] text-sm font-medium hover:underline flex items-center justify-center gap-1"
          >
            +{activeAppointments.length - 8} citas más
            <Icons.ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
