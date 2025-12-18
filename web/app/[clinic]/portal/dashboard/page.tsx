import {
  Users,
  Calendar,
  Package,
  Globe,
  Plus,
  CalendarPlus,
  Dog,
  Cat,
  PawPrint,
  Syringe,
  CheckCircle2,
  Clock,
  XCircle,
  Download
} from "lucide-react";
import Image from "next/image";
import { getClinicData } from '@/lib/clinics';
import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation";
import Link from "next/link";
import { LostFoundWidget } from "@/components/safety/lost-found-widget";

interface ClinicStats {
  pets: number;
  pending_vaccines: number;
  upcoming_appointments: number;
}

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

export default async function DashboardPage({ params, searchParams }: { 
    params: Promise<{ clinic: string }>,
    searchParams: Promise<{ query?: string }> 
}) {
  const supabase =  await createClient();
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
  const isAdmin = role === 'admin';

  // 1. Fetch Stats (RPC) - Only for Staff
    let stats: ClinicStats | null = null;
    let myAppointments: Appointment[] = [];

    if (isStaff) {
        const { data } = await supabase.rpc('get_clinic_stats', { clinic_id: clinic });
        stats = data as ClinicStats | null;
    } else {
        // Fetch Owner's upcoming appointments
        const { data } = await supabase
            .from('appointments')
            .select('id, start_time, status, reason, pets(name)')
            .eq('tenant_id', clinic)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(5);
        myAppointments = (data || []) as Appointment[];
    }

  // 2. Build Query
  let pets: Pet[] | null = null;

  if (isStaff) {
    // Staff sees ALL pets of owners connected to this clinic
    // (owners who have any pet, appointment, or conversation with this clinic)
    const { data: connectedOwnerIds } = await supabase
      .rpc('get_connected_owner_ids', { p_clinic_id: clinic });

    if (connectedOwnerIds && connectedOwnerIds.length > 0) {
      let petQuery = supabase
        .from('pets')
        .select(`*, vaccines (*)`)
        .in('owner_id', connectedOwnerIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply search if query exists
      if (query) {
        petQuery = petQuery.textSearch('name', query, {
          type: 'websearch',
          config: 'english'
        });
      }

      const { data } = await petQuery;
      pets = data as Pet[] | null;
    } else {
      pets = [];
    }
  } else {
    // Owners see ALL their pets (regardless of which clinic registered them)
    let petQuery = supabase
      .from('pets')
      .select(`*, vaccines (*)`)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Apply search if query exists
    if (query) {
      petQuery = petQuery.textSearch('name', query, {
        type: 'websearch',
        config: 'english'
      });
    }

    const { data } = await petQuery;
    pets = data as Pet[] | null;
  }

  // Import dynamically to avoid server component issues if any
  const PetSearch = (await import('./PetSearch')).default;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">
                    {isStaff ? data.config.ui_labels?.portal?.dashboard?.staff_title : data.config.ui_labels?.portal?.dashboard?.owner_title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[var(--text-secondary)]">{data.config.ui_labels?.portal?.dashboard?.welcome.replace('{name}', user.email)}</p>
                    {isStaff && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {role}
                        </span>
                    )}
                </div>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-3">
                 {/* Search Bar (Only visible if you have pets or are staff) */}
                 {(isStaff || (pets && pets.length > 0)) && <PetSearch />}

                 {isAdmin && (
                    <Link href={`/${clinic}/portal/team`} className="flex items-center justify-center gap-2 text-[var(--text-secondary)] font-bold hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors shrink-0" title="Equipo">
                        <Users className="w-5 h-5" />
                    </Link>
                 )}
                 {isStaff ? (
                    <>
                        <Link href={`/${clinic}/portal/schedule`} className="flex items-center justify-center gap-2 text-[var(--text-secondary)] font-bold hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors shrink-0" title="Agenda">
                            <Calendar className="w-5 h-5" />
                        </Link>
                        <Link href={`/${clinic}/portal/products`} className="flex items-center justify-center gap-2 text-[var(--text-secondary)] font-bold hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors shrink-0" title="Productos">
                            <Package className="w-5 h-5" />
                        </Link>
                        <Link href={`/${clinic}/portal/dashboard/patients`} className="flex items-center justify-center gap-2 text-[var(--text-secondary)] font-bold hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors shrink-0" title="Directorio Global">
                            <Globe className="w-5 h-5" />
                        </Link>
                         <Link href={`/${clinic}/portal/pets/new`} className="flex items-center justify-center gap-2 text-[var(--primary)] font-bold bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white px-6 py-3 rounded-xl transition-all shrink-0">
                            <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nueva Mascota</span>
                        </Link>
                    </>
                 ) : (
                    <>
                        <Link href={`/${clinic}/portal/appointments/new`} className="flex items-center justify-center gap-2 text-[var(--primary)] font-bold bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white px-6 py-3 rounded-xl transition-all shrink-0">
                            <CalendarPlus className="w-5 h-5" /> <span className="hidden md:inline">Agendar Cita</span>
                        </Link>
                        <Link href={`/${clinic}/portal/pets/new`} className="flex items-center justify-center gap-2 text-[var(--text-secondary)] font-bold hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors shrink-0" title="Nueva Mascota">
                             <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nueva Mascota</span>
                        </Link>
                    </>
                 )}
             </div>
        </div>

        {/* Stats Grid (Staff Only) */}
        {isStaff && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="md:col-span-1 lg:col-span-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs uppercase text-gray-400 font-bold mb-1">{data.config.ui_labels?.portal?.dashboard?.stats?.patients}</p>
                    <p className="text-2xl font-black text-[var(--text-primary)]">{stats.pets}</p>
                </div>
                <div className="md:col-span-1 lg:col-span-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs uppercase text-gray-400 font-bold mb-1">{data.config.ui_labels?.portal?.dashboard?.stats?.vaccines}</p>
                    <p className="text-2xl font-black text-amber-500">{stats.pending_vaccines}</p>
                </div>
                <div className="md:col-span-1 lg:col-span-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs uppercase text-gray-400 font-bold mb-1">{data.config.ui_labels?.portal?.dashboard?.stats?.upcoming_appointments}</p>
                    <p className="text-2xl font-black text-blue-500">{stats.upcoming_appointments}</p>
                </div>
                
                {/* Lost & Found Widget */}
                <div className="md:col-span-3 lg:col-span-3 h-full">
                    <LostFoundWidget />
                </div>
            </div>
        )}

        {/* Empty State */}
        {(!pets || pets.length === 0) && !query && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                    <Dog className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-600">{data.config.ui_labels?.portal?.empty_states?.no_pets}</h3>
                <p className="text-gray-500 mb-6">{data.config.ui_labels?.portal?.empty_states?.no_pets_desc}</p>
                <Link
                    href={`/${clinic}/portal/pets/new`}
                    className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all inline-block"
                >
                    {data.config.ui_labels?.portal?.empty_states?.add_pet_btn}
                </Link>
            </div>
        )}

        {/* Owner Appointment Confirmation Widget */}
        {!isStaff && myAppointments.length > 0 && (
            <div className="mb-8">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--primary)]" />
                    {data.config.ui_labels?.portal?.appointment_widget?.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-[var(--primary)]/10 text-[var(--primary)] w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold leading-none">
                                    <span>{new Date(apt.start_time).getDate()}</span>
                                    <span className="uppercase text-[10px]">{new Date(apt.start_time).toLocaleDateString('es-ES', { month: 'short' }).slice(0,3)}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{apt.reason}</p>
                                    <p className="text-sm text-gray-500">{new Date(apt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {apt.pets?.name}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-500'
                            }`}>
                                {apt.status === 'confirmed' ? data.config.ui_labels?.portal?.appointment_widget?.status?.confirmed : 
                                 apt.status === 'pending' ? data.config.ui_labels?.portal?.appointment_widget?.status?.pending : apt.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Pet List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets?.map((pet) => (
                <div key={pet.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow">
                    {/* Pet Header */}
                    <div className="p-6 flex items-center gap-4 bg-[var(--bg-subtle)]">
                        <Link href={`/${clinic}/portal/pets/${pet.id}`} className="shrink-0 relative group-hover:scale-105 transition-transform">
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
                            <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">{data.config.ui_labels?.portal?.pet_card?.weight}</span>
                            <span className="font-bold text-[var(--text-primary)]">{pet.weight_kg ? `${pet.weight_kg} kg` : '-'}</span>
                         </div>
                         <div className="p-4 text-center">
                            <span className="block text-xs uppercase tracking-wider text-gray-400 font-bold">{data.config.ui_labels?.portal?.pet_card?.chip}</span>
                            <span className="font-bold text-[var(--text-primary)]">-</span>
                         </div>
                    </div>

                    {/* Vaccines */}
                    <div className="p-6">
                        <h3 className="font-bold text-[var(--text-secondary)] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <Syringe className="w-4 h-4" /> {data.config.ui_labels?.portal?.pet_card?.vaccines}
                        </h3>
                        
                        {!pet.vaccines || pet.vaccines.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">{data.config.ui_labels?.portal?.empty_states?.no_vaccines}</p>
                        ) : (
                            <div className="space-y-3">
                                {pet.vaccines.map((v: Vaccine) => (
                                    <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[var(--text-primary)] block text-sm">{v.name}</span>
                                                {/* Status Badge */}
                                                {v.status === 'verified' && (
                                                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3"/> Oficial
                                                    </span>
                                                )}
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
                                            </div>
                                            <span className="text-xs text-gray-500">Puesta: {v.administered_date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <Link 
                                href={`/${clinic}/portal/pets/${pet.id}/vaccines/new`}
                                className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex justify-center items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" /> {data.config.ui_labels?.portal?.pet_card?.add_vaccine}
                            </Link>

                            <button className="w-full py-3 border-2 border-dashed border-[var(--primary)] text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--primary)]/5 transition-colors flex justify-center items-center gap-2 text-sm">
                                 <Download className="w-4 h-4" /> {data.config.ui_labels?.portal?.pet_card?.download_pdf}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
