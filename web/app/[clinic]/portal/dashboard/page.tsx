import {
  Plus,
  CalendarPlus,
  Dog,
  Cat,
  PawPrint,
  Syringe,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'
import { getClinicData } from '@/lib/clinics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MandatoryVaccinesAlert } from '@/components/portal/mandatory-vaccines-alert'

interface Appointment {
  id: string
  start_time: string
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  reason: string
  pets: { name: string } | null
}

interface Vaccine {
  id: string
  name: string
  status: 'verified' | 'pending' | 'rejected'
  administered_date: string
  next_due_date: string | null
}

// Helper to check if a date is upcoming (within 30 days)
function isUpcoming(dateStr: string | null): boolean {
  if (!dateStr) return false
  const dueDate = new Date(dateStr)
  const today = new Date()
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntil >= 0 && daysUntil <= 30
}

// Helper to filter vaccines to only pending/rejected/upcoming
function filterPendingVaccines(vaccines: Vaccine[] | null): Vaccine[] {
  if (!vaccines) return []
  return vaccines.filter(
    (v) => v.status === 'pending' || v.status === 'rejected' || isUpcoming(v.next_due_date)
  )
}

interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat'
  breed: string | null
  birth_date: string | null
  weight_kg: number | null
  photo_url: string | null
  vaccines: Vaccine[] | null
}

export default async function OwnerDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinic: string }>
  searchParams: Promise<{ query?: string }>
}) {
  const supabase = await createClient()
  const { clinic } = await params
  const { query } = await searchParams

  // Fetch User & Profile
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const data = await getClinicData(clinic)

  if (!data) return null

  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Get Profile Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'owner'
  const isStaff = role === 'vet' || role === 'admin'

  // Redirect staff to clinical dashboard
  if (isStaff) {
    redirect(`/${clinic}/dashboard`)
  }

  // Fetch Owner's upcoming appointments
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, start_time, status, reason, pets(name)')
    .eq('tenant_id', clinic)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5)

  const myAppointments = (appointmentsData || []) as unknown as Appointment[]

  // Fetch Owner's pets
  let petQuery = supabase
    .from('pets')
    .select(`*, vaccines (*)`)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (query) {
    petQuery = petQuery.textSearch('name', query, {
      type: 'websearch',
      config: 'english',
    })
  }

  const { data: petsData, error: petsError } = await petQuery
  const pets = petsData as Pet[] | null

  // UX-003: Show error state when data fetching fails
  const hasDataError = appointmentsError || petsError
  if (hasDataError) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[var(--status-error)]" />
          <h2 className="mb-2 text-xl font-bold text-[var(--status-error-text)]">Error al cargar datos</h2>
          <p className="mb-4 text-[var(--status-error)]">
            Hubo un problema al cargar tu información. Por favor, intenta recargar la página.
          </p>
          <a
            href={`/${clinic}/portal/dashboard`}
            className="inline-block rounded-xl bg-[var(--status-error)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--status-error-dark)]"
          >
            Recargar página
          </a>
        </div>
      </div>
    )
  }

  // Import search component
  const PetSearch = (await import('./PetSearch')).default

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-3xl font-black text-[var(--text-primary)]">
            {data.config.ui_labels?.portal?.dashboard?.owner_title || 'Mis Mascotas'}
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            {data.config.ui_labels?.portal?.dashboard?.welcome?.replace(
              '{name}',
              user.email || ''
            ) || `Bienvenido, ${user.email || ''}`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search Bar */}
          {pets && pets.length > 0 && <PetSearch />}

          <Link
            href={`/${clinic}/services`}
            className="bg-[var(--primary)]/10 flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white"
          >
            <CalendarPlus className="h-5 w-5" />
            <span className="hidden md:inline">Agendar Cita</span>
          </Link>
          <Link
            href={`/${clinic}/portal/pets/new`}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-[var(--text-secondary)] transition-colors hover:bg-gray-100"
            title="Nueva Mascota"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">Nueva Mascota</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Vaccine Alerts - Prominent at top */}
      {pets && pets.length > 0 && (
        <MandatoryVaccinesAlert
          clinic={clinic}
          pets={pets.map((p) => ({
            id: p.id,
            name: p.name,
            species: p.species,
            birth_date: p.birth_date,
          }))}
        />
      )}

      {/* Upcoming Appointments */}
      {myAppointments.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
            <Calendar className="h-5 w-5 text-[var(--primary)]" />
            {data.config.ui_labels?.portal?.appointment_widget?.title || 'Próximas Citas'}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {myAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[var(--primary)]/10 flex h-12 w-12 flex-col items-center justify-center rounded-xl text-xs font-bold leading-none text-[var(--primary)]">
                    <span>{new Date(apt.start_time).getDate()}</span>
                    <span className="text-[10px] uppercase">
                      {new Date(apt.start_time)
                        .toLocaleDateString('es-ES', { month: 'short' })
                        .slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{apt.reason}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      - {apt.pets?.name}
                    </p>
                  </div>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                    apt.status === 'confirmed'
                      ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]'
                      : apt.status === 'scheduled'
                        ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {apt.status === 'confirmed'
                    ? data.config.ui_labels?.portal?.appointment_widget?.status?.confirmed ||
                      'Confirmada'
                    : apt.status === 'scheduled'
                      ? data.config.ui_labels?.portal?.appointment_widget?.status?.scheduled ||
                        'Programada'
                      : apt.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!pets || pets.length === 0) && !query && (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <Dog className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-600">
            {data.config.ui_labels?.portal?.empty_states?.no_pets ||
              'No tienes mascotas registradas'}
          </h3>
          <p className="mb-6 text-gray-500">
            {data.config.ui_labels?.portal?.empty_states?.no_pets_desc ||
              'Registra tu primera mascota para comenzar'}
          </p>
          <Link
            href={`/${clinic}/portal/pets/new`}
            className="inline-block rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            {data.config.ui_labels?.portal?.empty_states?.add_pet_btn || 'Agregar Mascota'}
          </Link>
        </div>
      )}

      {/* Pet List */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pets?.map((pet) => (
          <div
            key={pet.id}
            className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-shadow hover:shadow-xl"
          >
            {/* Pet Header */}
            <div className="flex items-center gap-4 bg-[var(--bg-subtle)] p-6">
              <Link
                href={`/${clinic}/portal/pets/${pet.id}`}
                className="relative shrink-0 transition-transform group-hover:scale-105"
              >
                {pet.photo_url ? (
                  <Image
                    src={pet.photo_url}
                    alt={pet.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white text-gray-300 shadow-sm">
                    <PawPrint className="h-10 w-10" />
                  </div>
                )}
              </Link>
              <div>
                <Link href={`/${clinic}/portal/pets/${pet.id}`} className="hover:underline">
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">{pet.name}</h2>
                </Link>
                <p className="flex items-center gap-2 text-sm font-medium uppercase text-[var(--text-secondary)]">
                  {pet.species === 'dog' ? (
                    <Dog className="h-4 w-4" />
                  ) : (
                    <Cat className="h-4 w-4" />
                  )}
                  {pet.breed || 'Mestizo'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-4 text-center">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  {data.config.ui_labels?.portal?.pet_card?.weight || 'Peso'}
                </span>
                <span className="font-bold text-[var(--text-primary)]">
                  {pet.weight_kg ? `${pet.weight_kg} kg` : '-'}
                </span>
              </div>
              <div className="p-4 text-center">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  {data.config.ui_labels?.portal?.pet_card?.chip || 'Chip'}
                </span>
                <span className="font-bold text-[var(--text-primary)]">-</span>
              </div>
            </div>

            {/* Vaccines */}
            <div className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <Syringe className="h-4 w-4" /> Pendientes
              </h3>

              {(() => {
                const pendingVaccines = filterPendingVaccines(pet.vaccines)

                if (pendingVaccines.length === 0) {
                  return (
                    <p className="flex items-center gap-2 text-sm italic text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                      Todo al día
                    </p>
                  )
                }

                return (
                  <div className="space-y-3">
                    {pendingVaccines.map((v: Vaccine) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="block text-sm font-bold text-[var(--text-primary)]">
                              {v.name}
                            </span>
                            {v.status === 'pending' && (
                              <span className="flex items-center gap-1 rounded-full bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-warning)]">
                                <Clock className="h-3 w-3" /> Revisión
                              </span>
                            )}
                            {v.status === 'rejected' && (
                              <span className="flex items-center gap-1 rounded-full bg-[var(--status-error-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-error)]">
                                <XCircle className="h-3 w-3" /> Rechazada
                              </span>
                            )}
                            {v.status === 'verified' && isUpcoming(v.next_due_date) && (
                              <span className="flex items-center gap-1 rounded-full bg-[var(--status-info-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-info)]">
                                <AlertCircle className="h-3 w-3" /> Vence pronto
                              </span>
                            )}
                          </div>
                          {v.next_due_date && isUpcoming(v.next_due_date) ? (
                            <span className="text-xs font-medium text-[var(--status-info)]">
                              Vence: {v.next_due_date}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Puesta: {v.administered_date}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href={`/${clinic}/portal/pets/${pet.id}/vaccines/new`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  {data.config.ui_labels?.portal?.pet_card?.add_vaccine || 'Agregar Vacuna'}
                </Link>

                <Link
                  href={`/${clinic}/portal/pets/${pet.id}`}
                  className="hover:bg-[var(--primary)]/5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--primary)] py-3 text-sm font-bold text-[var(--primary)] transition-colors"
                >
                  Ver historial completo
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
