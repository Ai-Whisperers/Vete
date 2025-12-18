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
  Calendar
} from "lucide-react";
import Image from "next/image";
import { getClinicData } from '@/lib/clinics';
import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation";
import Link from "next/link";

interface Appointment {
  id: string;
  start_time: string;
  status: string;
  reason: string;
  pets: { name: string } | null;
}

interface Vaccine {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'rejected';
  administered_date: string;
  next_due_date: string | null;
}

// Helper to check if a date is upcoming (within 30 days)
function isUpcoming(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const dueDate = new Date(dateStr);
  const today = new Date();
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntil >= 0 && daysUntil <= 30;
}

// Helper to filter vaccines to only pending/rejected/upcoming
function filterPendingVaccines(vaccines: Vaccine[] | null): Vaccine[] {
  if (!vaccines) return [];
  return vaccines.filter(v =>
    v.status === 'pending' ||
    v.status === 'rejected' ||
    isUpcoming(v.next_due_date)
  );
}

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string | null;
  weight_kg: number | null;
  photo_url: string | null;
  vaccines: Vaccine[] | null;
}

export default async function OwnerDashboardPage({ params, searchParams }: {
    params: Promise<{ clinic: string }>,
    searchParams: Promise<{ query?: string }>
}) {
  const supabase = await createClient();
  const { clinic } = await params;
  const { query } = await searchParams;

  // Fetch User & Profile
  const { data: { user } } = await supabase.auth.getUser();
  const data = await getClinicData(clinic);

  if (!data) return null;

  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  // Get Profile Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'owner';
  const isStaff = role === 'vet' || role === 'admin';

  // Redirect staff to clinical dashboard
  if (isStaff) {
    redirect(`/${clinic}/dashboard`);
  }

  // Fetch Owner's upcoming appointments
  const { data: appointmentsData } = await supabase
    .from('appointments')
    .select('id, start_time, status, reason, pets(name)')
    .eq('tenant_id', clinic)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5);

  const myAppointments = (appointmentsData || []) as Appointment[];

  // Fetch Owner's pets
  let petQuery = supabase
    .from('pets')
    .select(`*, vaccines (*)`)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (query) {
    petQuery = petQuery.textSearch('name', query, {
      type: 'websearch',
      config: 'english'
    });
  }

  const { data: petsData } = await petQuery;
  const pets = petsData as Pet[] | null;

  // Import search component
  const PetSearch = (await import('./PetSearch')).default;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">
            {data.config.ui_labels?.portal?.dashboard?.owner_title || 'Mis Mascotas'}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {data.config.ui_labels?.portal?.dashboard?.welcome?.replace('{name}', user.email) || `Bienvenido, ${user.email}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          {pets && pets.length > 0 && <PetSearch />}

          <Link
            href={`/${clinic}/services`}
            className="flex items-center justify-center gap-2 text-[var(--primary)] font-bold bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white px-6 py-3 rounded-xl transition-all shrink-0"
          >
            <CalendarPlus className="w-5 h-5" />
            <span className="hidden md:inline">Agendar Cita</span>
          </Link>
          <Link
            href={`/${clinic}/portal/pets/new`}
            className="flex items-center justify-center gap-2 text-[var(--text-secondary)] font-bold hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors shrink-0"
            title="Nueva Mascota"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Nueva Mascota</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {myAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            {data.config.ui_labels?.portal?.appointment_widget?.title || 'Próximas Citas'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[var(--primary)]/10 text-[var(--primary)] w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold leading-none">
                    <span>{new Date(apt.start_time).getDate()}</span>
                    <span className="uppercase text-[10px]">
                      {new Date(apt.start_time).toLocaleDateString('es-ES', { month: 'short' }).slice(0,3)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{apt.reason}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {apt.pets?.name}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {apt.status === 'confirmed'
                    ? (data.config.ui_labels?.portal?.appointment_widget?.status?.confirmed || 'Confirmada')
                    : apt.status === 'pending'
                      ? (data.config.ui_labels?.portal?.appointment_widget?.status?.pending || 'Pendiente')
                      : apt.status
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!pets || pets.length === 0) && !query && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Dog className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-600">
            {data.config.ui_labels?.portal?.empty_states?.no_pets || 'No tienes mascotas registradas'}
          </h3>
          <p className="text-gray-500 mb-6">
            {data.config.ui_labels?.portal?.empty_states?.no_pets_desc || 'Registra tu primera mascota para comenzar'}
          </p>
          <Link
            href={`/${clinic}/portal/pets/new`}
            className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all inline-block"
          >
            {data.config.ui_labels?.portal?.empty_states?.add_pet_btn || 'Agregar Mascota'}
          </Link>
        </div>
      )}

      {/* Pet List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets?.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow"
          >
            {/* Pet Header */}
            <div className="p-6 flex items-center gap-4 bg-[var(--bg-subtle)]">
              <Link
                href={`/${clinic}/portal/pets/${pet.id}`}
                className="shrink-0 relative group-hover:scale-105 transition-transform"
              >
                {pet.photo_url ? (
                  <Image
                    src={pet.photo_url}
                    alt={pet.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-sm text-gray-300">
                    <PawPrint className="w-10 h-10" />
                  </div>
                )}
              </Link>
              <div>
                <Link href={`/${clinic}/portal/pets/${pet.id}`} className="hover:underline">
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">{pet.name}</h2>
                </Link>
                <p className="text-[var(--text-secondary)] font-medium flex items-center gap-2 text-sm uppercase">
                  {pet.species === 'dog' ? <Dog className="w-4 h-4" /> : <Cat className="w-4 h-4" />}
                  {pet.breed || 'Mestizo'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-4 text-center">
                <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">
                  {data.config.ui_labels?.portal?.pet_card?.weight || 'Peso'}
                </span>
                <span className="font-bold text-[var(--text-primary)]">
                  {pet.weight_kg ? `${pet.weight_kg} kg` : '-'}
                </span>
              </div>
              <div className="p-4 text-center">
                <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">
                  {data.config.ui_labels?.portal?.pet_card?.chip || 'Chip'}
                </span>
                <span className="font-bold text-[var(--text-primary)]">-</span>
              </div>
            </div>

            {/* Vaccines */}
            <div className="p-6">
              <h3 className="font-bold text-[var(--text-secondary)] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Syringe className="w-4 h-4" /> Pendientes
              </h3>

              {(() => {
                const pendingVaccines = filterPendingVaccines(pet.vaccines);

                if (pendingVaccines.length === 0) {
                  return (
                    <p className="text-sm text-gray-400 italic flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Todo al día
                    </p>
                  );
                }

                return (
                  <div className="space-y-3">
                    {pendingVaccines.map((v: Vaccine) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[var(--text-primary)] block text-sm">{v.name}</span>
                            {v.status === 'pending' && (
                              <span className="bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3"/> Revisión
                              </span>
                            )}
                            {v.status === 'rejected' && (
                              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3"/> Rechazada
                              </span>
                            )}
                            {v.status === 'verified' && isUpcoming(v.next_due_date) && (
                              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3"/> Vence pronto
                              </span>
                            )}
                          </div>
                          {v.next_due_date && isUpcoming(v.next_due_date) ? (
                            <span className="text-xs text-blue-600 font-medium">Vence: {v.next_due_date}</span>
                          ) : (
                            <span className="text-xs text-gray-500">Puesta: {v.administered_date}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Link
                  href={`/${clinic}/portal/pets/${pet.id}/vaccines/new`}
                  className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex justify-center items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {data.config.ui_labels?.portal?.pet_card?.add_vaccine || 'Agregar Vacuna'}
                </Link>

                <Link
                  href={`/${clinic}/portal/pets/${pet.id}`}
                  className="w-full py-3 border-2 border-dashed border-[var(--primary)] text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--primary)]/5 transition-colors flex justify-center items-center gap-2 text-sm"
                >
                  Ver historial completo
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
