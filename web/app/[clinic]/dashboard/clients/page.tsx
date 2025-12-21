import { getClinicData } from '@/lib/clinics'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { requireStaff } from '@/lib/auth'
import Link from 'next/link'
import { Users, Search, Phone, Mail, PawPrint, UserPlus, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import ClientSearch from './client-search'

interface Props {
  params: Promise<{ clinic: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateStaticParams() {
  return [{ clinic: 'adris' }, { clinic: 'petlife' }]
}

interface Client {
  id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  pet_count: number
  last_visit: string | null
}

export default async function ClientsPage({ params, searchParams }: Props) {
  const { clinic } = await params
  const { q } = await searchParams

  // SEC-007: Require staff authentication with tenant verification
  const { profile } = await requireStaff(clinic)

  const clinicData = await getClinicData(clinic)
  if (!clinicData) notFound()

  const supabase = await createClient()

  // Fetch clients (pet owners) for this tenant
  // NOTE: Using !owner_id hint to specify the FK relationship since pets has multiple FKs to profiles
  // Appointments are fetched through pets since there's no direct client_id on appointments
  let query = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      phone,
      created_at,
      pets:pets!owner_id(
        id,
        appointments(start_time)
      )
    `)
    .eq('tenant_id', profile.tenant_id)
    .eq('role', 'owner')
    .order('full_name', { ascending: true })

  // Apply search filter if provided
  if (q && q.trim()) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  const { data: rawClients, error } = await query

  if (error) {
    console.error('Error fetching clients:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar clientes. Por favor, intente nuevamente.</p>
        </div>
      </div>
    )
  }

  // Transform data to get pet count and last visit
  const clients: Client[] = (rawClients || []).map((client: any) => {
    const pets = Array.isArray(client.pets) ? client.pets : []
    const petCount = pets.length

    // Collect all appointments from all pets and find the most recent
    const allAppointments = pets.flatMap((pet: any) =>
      Array.isArray(pet.appointments) ? pet.appointments : []
    )
    const lastVisit = allAppointments.length > 0
      ? allAppointments.sort((a: any, b: any) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        )[0]?.start_time
      : null

    return {
      id: client.id,
      full_name: client.full_name || 'Sin nombre',
      email: client.email,
      phone: client.phone,
      created_at: client.created_at,
      pet_count: petCount,
      last_visit: lastVisit
    }
  })

  // Determine if client is active (visited in last 90 days)
  const isClientActive = (lastVisit: string | null): boolean => {
    if (!lastVisit) return false
    const daysSinceVisit = Math.floor(
      (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceVisit <= 90
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const activeClients = clients.filter(c => isClientActive(c.last_visit))
  const inactiveClients = clients.filter(c => !isClientActive(c.last_visit))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[var(--primary)] bg-opacity-10 rounded-lg">
            <Users className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Directorio de Clientes
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Gestiona la información de todos los propietarios de mascotas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--bg-default)] rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Clientes</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{clients.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-default)] rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Clientes Activos</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{activeClients.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-default)] rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Clientes Inactivos</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{inactiveClients.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-[var(--bg-default)] rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <ClientSearch clinic={clinic} initialQuery={q} />

          <Link
            href={`/${clinic}/dashboard/clients/invite`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <UserPlus className="h-5 w-5" />
            Agregar Cliente
          </Link>
        </div>
      </div>

      {/* Clients Table */}
      {clients.length === 0 ? (
        <div className="bg-[var(--bg-default)] rounded-xl shadow-md p-12 text-center">
          <Users className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            {q ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            {q
              ? 'Intenta con otro término de búsqueda'
              : 'Comienza agregando tu primer cliente al sistema'
            }
          </p>
          {!q && (
            <Link
              href={`/${clinic}/dashboard/clients/invite`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <UserPlus className="h-5 w-5" />
              Agregar Primer Cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-[var(--bg-default)] rounded-xl shadow-md overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--primary)] bg-opacity-5 border-b border-[var(--primary)] border-opacity-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Mascotas
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Última Visita
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--primary)] divide-opacity-5">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[var(--primary)] hover:bg-opacity-5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
                          <span className="text-[var(--primary)] font-semibold">
                            {client.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {client.full_name}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Cliente desde {formatDate(client.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <PawPrint className="h-5 w-5 text-[var(--primary)]" />
                        <span className="font-medium text-[var(--text-primary)]">
                          {client.pet_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(client.last_visit)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isClientActive(client.last_visit) ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/${clinic}/dashboard/clients/${client.id}`}
                        className="text-[var(--primary)] hover:underline font-medium text-sm"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-[var(--primary)] divide-opacity-5">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/${clinic}/dashboard/clients/${client.id}`}
                className="block p-4 hover:bg-[var(--primary)] hover:bg-opacity-5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
                      <span className="text-[var(--primary)] font-semibold text-lg">
                        {client.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {client.full_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <PawPrint className="h-4 w-4 text-[var(--primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          {client.pet_count} mascota{client.pet_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isClientActive(client.last_visit) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      <AlertCircle className="h-3 w-3" />
                      Inactivo
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Calendar className="h-4 w-4" />
                    <span>Última visita: {formatDate(client.last_visit)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {clients.length > 0 && (
        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Mostrando {clients.length} cliente{clients.length !== 1 ? 's' : ''}
          {q && ` para "${q}"`}
        </div>
      )}
    </div>
  )
}
