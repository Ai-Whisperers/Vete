import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { CancelButton, RescheduleDialog } from '@/components/appointments'
import {
  statusConfig,
  formatAppointmentDate,
  formatAppointmentTime,
  canCancelAppointment,
  canRescheduleAppointment
} from '@/lib/types/appointments'

interface PageProps {
  params: Promise<{ clinic: string; id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { clinic } = await params
  return {
    title: `Detalle de Cita - ${clinic}`,
    description: 'Ver detalle de tu cita veterinaria'
  }
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { clinic, id } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Fetch appointment with pet details
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      end_time,
      status,
      reason,
      notes,
      created_at,
      pets!inner(
        id,
        name,
        species,
        breed,
        photo_url,
        owner_id
      )
    `)
    .eq('id', id)
    .eq('tenant_id', clinic)
    .single()

  if (error || !appointment) {
    notFound()
  }

  // Transform pets array to single object (Supabase returns array from join)
  const pet = Array.isArray(appointment.pets) ? appointment.pets[0] : appointment.pets
  const appointmentWithPet = { ...appointment, pets: pet }

  // Check ownership
  if (pet.owner_id !== user.id) {
    redirect(`/${clinic}/portal/appointments`)
  }

  const status = statusConfig[appointmentWithPet.status] || statusConfig.pending
  const canCancel = canCancelAppointment(appointmentWithPet)
  const canReschedule = canRescheduleAppointment(appointmentWithPet)
  const isPast = new Date(appointmentWithPet.start_time) < new Date()

  const speciesIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    dog: Icons.Dog,
    cat: Icons.Cat,
    bird: Icons.Bird,
    rabbit: Icons.Rabbit,
    fish: Icons.Fish,
    default: Icons.PawPrint
  }
  const SpeciesIcon = speciesIcons[pet.species] || speciesIcons.default

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/${clinic}/portal/appointments`}
          className="p-2 rounded-xl hover:bg-white transition-colors"
        >
          <Icons.ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            Detalle de Cita
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Creada el {new Date(appointmentWithPet.created_at).toLocaleDateString('es-PY')}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Pet Info Header */}
        <div className="p-6 bg-gradient-to-r from-[var(--primary)]/5 to-transparent border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <SpeciesIcon className="w-8 h-8 text-[var(--primary)]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {pet.name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] capitalize">
                {pet.species}
                {pet.breed && ` - ${pet.breed}`}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Calendar className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Fecha
                </span>
              </div>
              <p className="font-bold text-[var(--text-primary)]">
                {formatAppointmentDate(appointmentWithPet.start_time)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Clock className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Hora
                </span>
              </div>
              <p className="font-bold text-[var(--text-primary)]">
                {formatAppointmentTime(appointmentWithPet.start_time)} - {formatAppointmentTime(appointmentWithPet.end_time)}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Stethoscope className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Motivo
              </span>
            </div>
            <p className="font-medium text-[var(--text-primary)] capitalize">
              {appointmentWithPet.reason}
            </p>
          </div>

          {/* Notes */}
          {appointmentWithPet.notes && !appointmentWithPet.notes.startsWith('[Cancelado') && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Icons.FileText className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Notas
                </span>
              </div>
              <p className="text-[var(--text-secondary)]">
                {appointmentWithPet.notes}
              </p>
            </div>
          )}

          {/* Cancellation info */}
          {appointmentWithPet.status === 'cancelled' && appointmentWithPet.notes?.startsWith('[Cancelado') && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Icons.XCircle className="w-5 h-5 text-red-500" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Cancelación
                </span>
              </div>
              <p className="text-red-600">
                {appointmentWithPet.notes.replace('[Cancelado] ', '').replace('[Cancelado por el cliente]', 'Cancelada por el propietario')}
              </p>
            </div>
          )}

          {/* Past appointment notice */}
          {isPast && appointmentWithPet.status !== 'cancelled' && (
            <div className="p-4 bg-gray-100 rounded-xl flex items-center gap-3">
              <Icons.CheckCircle className="w-5 h-5 text-gray-500" />
              <p className="text-gray-600 text-sm">
                Esta cita ya ha pasado.
              </p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {(canCancel || canReschedule) && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Acciones disponibles
            </p>
            <div className="flex items-center gap-3">
              {canReschedule && (
                <RescheduleDialog
                  appointmentId={appointmentWithPet.id}
                  clinicId={clinic}
                  currentDate={appointmentWithPet.start_time.split('T')[0]}
                  currentTime={formatAppointmentTime(appointmentWithPet.start_time)}
                />
              )}
              {canCancel && (
                <CancelButton
                  appointmentId={appointmentWithPet.id}
                  variant="button"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-8 text-center">
        <Link
          href={`/${clinic}/portal/appointments`}
          className="text-[var(--primary)] font-medium hover:underline inline-flex items-center gap-2"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Volver a Mis Citas
        </Link>
      </div>
    </div>
  )
}
