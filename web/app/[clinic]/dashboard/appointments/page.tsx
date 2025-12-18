import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppointmentQueue } from '@/components/dashboard/appointments/appointment-queue'
import { DateFilter } from '@/components/dashboard/appointments/date-filter'
import { StatusFilter } from '@/components/dashboard/appointments/status-filter'
import * as Icons from 'lucide-react'

interface Props {
  params: Promise<{ clinic: string }>
  searchParams: Promise<{ date?: string; status?: string }>
}

export default async function StaffAppointmentsPage({ params, searchParams }: Props) {
  const { clinic } = await params
  const { date, status } = await searchParams
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/dashboard`)
  }

  const today = date || new Date().toISOString().split('T')[0]

  // Fetch appointments for the day
  let query = supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      end_time,
      status,
      reason,
      notes,
      checked_in_at,
      started_at,
      pets (
        id,
        name,
        species,
        photo_url,
        owner:profiles!pets_owner_id_fkey (
          id,
          full_name,
          phone
        )
      )
    `)
    .eq('tenant_id', clinic)
    .gte('start_time', `${today}T00:00:00`)
    .lt('start_time', `${today}T23:59:59`)
    .order('start_time', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: appointments, error } = await query

  // Show error state if query failed
  if (error) {
    console.error('Error fetching appointments:', error)
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Icons.AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">Error al cargar citas</h3>
          <p className="text-red-600 mb-4">No se pudieron cargar las citas. Por favor intenta de nuevo.</p>
          <a
            href={`/${clinic}/dashboard/appointments`}
            className="inline-block px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </a>
        </div>
      </div>
    )
  }

  // Transform pets data (Supabase returns arrays from joins)
  const transformedAppointments = appointments?.map(apt => {
    const pets = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets
    // Also transform nested owner (use undefined instead of null for type compatibility)
    const owner = pets?.owner ? (Array.isArray(pets.owner) ? pets.owner[0] : pets.owner) : undefined
    return {
      ...apt,
      pets: {
        ...pets,
        owner
      }
    }
  }) || []

  // Calculate stats
  const stats = {
    total: transformedAppointments.length,
    pending: transformedAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length,
    checkedIn: transformedAppointments.filter(a => a.status === 'checked_in').length,
    inProgress: transformedAppointments.filter(a => a.status === 'in_progress').length,
    completed: transformedAppointments.filter(a => a.status === 'completed').length,
    noShow: transformedAppointments.filter(a => a.status === 'no_show').length
  }

  const isToday = today === new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isToday ? 'Citas de Hoy' : 'Citas del Día'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {new Date(today).toLocaleDateString('es-PY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <DateFilter currentDate={today} clinic={clinic} />
          <StatusFilter currentStatus={status || 'all'} clinic={clinic} currentDate={today} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Icons.Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">En Espera</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Icons.UserCheck className="w-4 h-4" />
            <span className="text-xs font-medium">Registrados</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.checkedIn}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Icons.Stethoscope className="w-4 h-4" />
            <span className="text-xs font-medium">En Consulta</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.inProgress}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Icons.CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Completadas</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.completed}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Icons.UserX className="w-4 h-4" />
            <span className="text-xs font-medium">No Presentados</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.noShow}</p>
        </div>
      </div>

      {/* Appointment Queue */}
      {transformedAppointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Icons.CalendarX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            No hay citas programadas
          </h3>
          <p className="text-[var(--text-secondary)]">
            {status && status !== 'all'
              ? 'No hay citas con este estado para la fecha seleccionada.'
              : 'No hay citas programadas para esta fecha.'}
          </p>
        </div>
      ) : (
        <AppointmentQueue appointments={transformedAppointments} clinic={clinic} />
      )}
    </div>
  )
}
