import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import AppointmentItem from './appointment-item'

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'

interface ScheduleAppointment {
  id: string
  start_time: string
  status: AppointmentStatus
  reason: string
  notes?: string
  pet: {
    name: string
    species: string
    photo_url?: string
    owner?: {
      full_name?: string
      phone?: string
    }
  }
}

export default async function SchedulePage({ params }: { params: Promise<{ clinic: string }> }) {
  const supabase = await createClient()
  const { clinic } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${clinic}/portal/login`)

  // Verify Staff
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acceso Restringido</h1>
        <p className="text-gray-500">Solo el personal veterinario puede ver la agenda.</p>
        <Link
          href={`/${clinic}/portal/dashboard`}
          className="mt-4 block text-blue-500 hover:underline"
        >
          Volver al Inicio
        </Link>
      </div>
    )
  }

  // Fetch Appointments
  // Order by status priority (pending first) then date
  const { data: appointments } = await supabase
    .from('appointments')
    .select(
      `
        *,
        pets (name, species, owner_id),
        profiles:pet_id (full_name, phone) 
        -- Note: profiles link via pet owner is tricky in typical joins without foreign key path explicitly named if multiple.
        -- But here 'pets' has 'owner_id' refs profiles.
        -- supabase-js syntax: pets ( ..., profiles:owner_id ( full_name, phone ) )
    `
    )
    .eq('tenant_id', clinic)
    .order('start_time', { ascending: true })

  // Supabase join syntax correction:
  // pets -> belongs to owner (profiles).
  const { data: rawData, error } = await supabase
    .from('appointments')
    .select(
      `
        *,
        pet:pets (
            name, 
            species, 
            photo_url,
            owner:profiles (
                full_name,
                phone
            )
        )
    `
    )
    .eq('tenant_id', clinic)
    .gte('start_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()) // Only today/future
    .order('start_time', { ascending: true })

  if (error) {
    logger.error('Schedule Error', { error: error.message })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${clinic}/portal/dashboard`}
            className="rounded-xl p-2 transition-colors hover:bg-white"
          >
            <Icons.ArrowLeft className="h-6 w-6 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-black text-[var(--text-primary)]">
              Agenda Veterinaria
            </h1>
            <p className="text-gray-500">Próximas citas programadas</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm font-bold text-gray-500 shadow-sm">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </div>
      </div>

      <div className="space-y-4">
        {!rawData || rawData.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
              <Icons.CalendarCheck className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-gray-600">No hay citas programadas</h3>
            <p className="text-gray-400">La agenda está libre por ahora.</p>
          </div>
        ) : (
          (rawData as ScheduleAppointment[]).map((apt: ScheduleAppointment) => (
            <AppointmentItem key={apt.id} appointment={apt} clinic={clinic} />
          ))
        )}
      </div>
    </div>
  )
}
