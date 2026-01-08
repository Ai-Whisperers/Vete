import {
  Plus,
  Dog,
  Cat,
  PawPrint,
  Syringe,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import { getClinicData } from '@/lib/clinics'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MandatoryVaccinesAlert } from '@/components/portal/mandatory-vaccines-alert'
import { PortalWelcomeHero } from '@/components/portal/welcome-hero'
import { PortalQuickActions } from '@/components/portal/quick-actions'
import { PortalActivitySummary } from '@/components/portal/activity-summary'
import { UpcomingAppointmentsCard } from '@/components/portal/upcoming-appointments-card'

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

// Count total pending vaccines across all pets
function countPendingVaccines(pets: Pet[] | null): number {
  if (!pets) return 0
  return pets.reduce((total, pet) => total + filterPendingVaccines(pet.vaccines).length, 0)
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

  // Get Profile Role with full_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, tenant_id')
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

  // Calculate stats for welcome hero
  const pendingVaccinesCount = countPendingVaccines(pets)

  // Import search component
  const PetSearch = (await import('./PetSearch')).default

  return (
    <div className="space-y-0">
      {/* Welcome Hero */}
      <PortalWelcomeHero
        userName={profile?.full_name || user.email || ''}
        petCount={pets?.length || 0}
        upcomingAppointments={myAppointments.length}
        pendingVaccines={pendingVaccinesCount}
        clinicName={data.config.name}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
        {/* Quick Actions */}
        <PortalQuickActions clinic={clinic} />

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

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Pets (2 cols on lg) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Search Bar */}
            {pets && pets.length > 3 && (
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                  <PawPrint className="h-5 w-5 text-[var(--primary)]" />
                  Mis Mascotas
                </h2>
                <PetSearch />
              </div>
            )}

            {/* Empty State */}
            {(!pets || pets.length === 0) && !query && (
              <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-default)] py-16 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                  <Dog className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-secondary)]">
                  {data.config.ui_labels?.portal?.empty_states?.no_pets ||
                    'No tienes mascotas registradas'}
                </h3>
                <p className="mb-6 text-[var(--text-muted)]">
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

            {/* Pet Cards Grid */}
            {pets && pets.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="group overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-default)] shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Pet Header */}
                    <div className="flex items-center gap-4 bg-[var(--bg-subtle)] p-4">
                      <Link
                        href={`/${clinic}/portal/pets/${pet.id}`}
                        className="relative shrink-0 transition-transform group-hover:scale-105"
                      >
                        {pet.photo_url ? (
                          <Image
                            src={pet.photo_url}
                            alt={pet.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--bg-default)] bg-[var(--bg-default)] text-[var(--text-muted)] shadow-sm">
                            <PawPrint className="h-8 w-8" />
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/${clinic}/portal/pets/${pet.id}`} className="hover:underline">
                          <h2 className="truncate text-xl font-bold text-[var(--text-primary)]">
                            {pet.name}
                          </h2>
                        </Link>
                        <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          {pet.species === 'dog' ? (
                            <Dog className="h-4 w-4" />
                          ) : (
                            <Cat className="h-4 w-4" />
                          )}
                          {pet.breed || 'Mestizo'}
                        </p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 divide-x divide-[var(--border-light)] border-b border-[var(--border-light)] text-center text-sm">
                      <div className="p-3">
                        <span className="block text-xs font-medium text-[var(--text-muted)]">Peso</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {pet.weight_kg ? `${pet.weight_kg} kg` : '-'}
                        </span>
                      </div>
                      <div className="p-3">
                        <span className="block text-xs font-medium text-[var(--text-muted)]">Vacunas</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {pet.vaccines?.filter((v) => v.status === 'verified').length || 0} activas
                        </span>
                      </div>
                    </div>

                    {/* Pending Vaccines Summary */}
                    <div className="p-4">
                      {(() => {
                        const pendingVaccines = filterPendingVaccines(pet.vaccines)

                        if (pendingVaccines.length === 0) {
                          return (
                            <p className="flex items-center justify-center gap-2 rounded-lg bg-[var(--status-success-bg)] p-3 text-sm font-medium text-[var(--status-success-text)]">
                              <CheckCircle2 className="h-4 w-4" />
                              Todo al día con vacunas
                            </p>
                          )
                        }

                        return (
                          <div className="space-y-2">
                            {pendingVaccines.slice(0, 2).map((v: Vaccine) => (
                              <div
                                key={v.id}
                                className="flex items-center justify-between rounded-lg bg-[var(--bg-subtle)] p-2.5 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <Syringe className="h-4 w-4 text-[var(--text-muted)]" />
                                  <span className="font-medium text-[var(--text-primary)]">{v.name}</span>
                                </div>
                                {v.status === 'pending' && (
                                  <span className="flex items-center gap-1 text-xs text-[var(--status-warning)]">
                                    <Clock className="h-3 w-3" /> Revisión
                                  </span>
                                )}
                                {v.status === 'rejected' && (
                                  <span className="flex items-center gap-1 text-xs text-[var(--status-error)]">
                                    <XCircle className="h-3 w-3" /> Rechazada
                                  </span>
                                )}
                                {v.status === 'verified' && isUpcoming(v.next_due_date) && (
                                  <span className="flex items-center gap-1 text-xs text-[var(--status-info)]">
                                    <AlertCircle className="h-3 w-3" /> Vence pronto
                                  </span>
                                )}
                              </div>
                            ))}
                            {pendingVaccines.length > 2 && (
                              <p className="text-center text-xs text-[var(--text-muted)]">
                                +{pendingVaccines.length - 2} más
                              </p>
                            )}
                          </div>
                        )
                      })()}

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/${clinic}/portal/pets/${pet.id}/vaccines/new`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)]"
                        >
                          <Plus className="h-4 w-4" />
                          Vacuna
                        </Link>
                        <Link
                          href={`/${clinic}/portal/pets/${pet.id}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]"
                        >
                          Ver perfil
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <UpcomingAppointmentsCard appointments={myAppointments} clinic={clinic} />

            {/* Activity Summary */}
            <PortalActivitySummary userId={user.id} clinic={clinic} />
          </div>
        </div>
      </div>
    </div>
  )
}
