import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Syringe,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Dog,
  Cat,
  PawPrint,
  Search,
  Plus,
} from 'lucide-react';
import { VaccinesFilter } from '@/components/dashboard/vaccines-filter';

interface Props {
  params: Promise<{ clinic: string }>;
  searchParams: Promise<{ status?: string; query?: string }>;
}

interface Vaccine {
  id: string;
  name: string;
  administered_date: string;
  next_due_date: string | null;
  status: 'verified' | 'pending' | 'rejected';
  pets: {
    id: string;
    name: string;
    species: string;
    photo_url: string | null;
    owner_id: string;
    profiles: {
      full_name: string;
    };
  };
}

const statusConfig = {
  verified: { label: 'Verificada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export default async function VaccinesPage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const { status: filterStatus, query } = await searchParams;
  const supabase = await createClient();

  // Auth & staff check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/dashboard`);
  }

  // Fetch vaccines with pet and owner info
  let vaccinesQuery = supabase
    .from('vaccines')
    .select(`
      id,
      name,
      administered_date,
      next_due_date,
      status,
      pets!inner (
        id,
        name,
        species,
        photo_url,
        owner_id,
        profiles!pets_owner_id_fkey (
          full_name
        )
      )
    `)
    .order('next_due_date', { ascending: true, nullsFirst: false });

  // Apply status filter
  if (filterStatus && filterStatus !== 'all') {
    vaccinesQuery = vaccinesQuery.eq('status', filterStatus);
  }

  // Get vaccines with upcoming due dates (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const { data: vaccines } = await vaccinesQuery;
  let typedVaccines = (vaccines || []) as unknown as Vaccine[];

  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    typedVaccines = typedVaccines.filter(
      (v) =>
        v.name.toLowerCase().includes(lowerQuery) ||
        v.pets.name.toLowerCase().includes(lowerQuery) ||
        v.pets.profiles?.full_name?.toLowerCase().includes(lowerQuery)
    );
  }

  // Separate upcoming vaccines (due in next 30 days)
  const today = new Date();
  const upcomingVaccines = typedVaccines.filter((v) => {
    if (!v.next_due_date) return false;
    const dueDate = new Date(v.next_due_date);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  });

  const overdueVaccines = typedVaccines.filter((v) => {
    if (!v.next_due_date) return false;
    return new Date(v.next_due_date) < today;
  });

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getSpeciesIcon = (species: string): React.ReactElement => {
    switch (species) {
      case 'dog':
        return <Dog className="w-4 h-4" />;
      case 'cat':
        return <Cat className="w-4 h-4" />;
      default:
        return <PawPrint className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href={`/${clinic}/dashboard`}
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Control de Vacunas</h1>
          <p className="text-[var(--text-secondary)]">Gestiona el calendario de vacunación</p>
        </div>
        <Link
          href={`/${clinic}/dashboard/vaccines?action=new-vaccine`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Registrar Vacuna
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Vencidas</span>
          </div>
          <p className="text-2xl font-black text-red-700">{overdueVaccines.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Próximas 30 días</span>
          </div>
          <p className="text-2xl font-black text-amber-700">{upcomingVaccines.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Syringe className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Pendientes</span>
          </div>
          <p className="text-2xl font-black text-blue-700">
            {typedVaccines.filter((v) => v.status === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Verificadas</span>
          </div>
          <p className="text-2xl font-black text-green-700">
            {typedVaccines.filter((v) => v.status === 'verified').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar por vacuna, mascota o dueño..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          />
        </form>
        <VaccinesFilter clinic={clinic} currentStatus={filterStatus || 'all'} />
      </div>

      {/* Overdue Section */}
      {overdueVaccines.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            Vacunas Vencidas ({overdueVaccines.length})
          </h2>
          <div className="space-y-3">
            {overdueVaccines.slice(0, 5).map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                clinic={clinic}
                formatDate={formatDate}
                getDaysUntilDue={getDaysUntilDue}
                getSpeciesIcon={getSpeciesIcon}
                isOverdue
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingVaccines.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-amber-700 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            Próximas a Vencer ({upcomingVaccines.length})
          </h2>
          <div className="space-y-3">
            {upcomingVaccines.slice(0, 10).map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                clinic={clinic}
                formatDate={formatDate}
                getDaysUntilDue={getDaysUntilDue}
                getSpeciesIcon={getSpeciesIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Vaccines */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Todas las Vacunas ({typedVaccines.length})
        </h2>
        {typedVaccines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron vacunas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {typedVaccines.map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                clinic={clinic}
                formatDate={formatDate}
                getDaysUntilDue={getDaysUntilDue}
                getSpeciesIcon={getSpeciesIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Vaccine Card Component
function VaccineCard({
  vaccine,
  clinic,
  formatDate,
  getDaysUntilDue,
  getSpeciesIcon,
  isOverdue = false,
}: {
  vaccine: Vaccine;
  clinic: string;
  formatDate: (date: string) => string;
  getDaysUntilDue: (date: string) => number;
  getSpeciesIcon: (species: string) => React.ReactElement;
  isOverdue?: boolean;
}): React.ReactElement {
  const status = statusConfig[vaccine.status];
  const StatusIcon = status.icon;
  const daysUntil = vaccine.next_due_date ? getDaysUntilDue(vaccine.next_due_date) : null;

  return (
    <Link
      href={`/${clinic}/portal/pets/${vaccine.pets.id}`}
      className={`block bg-white rounded-xl p-4 border hover:shadow-md transition-all ${
        isOverdue ? 'border-red-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Pet Photo */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {vaccine.pets.photo_url ? (
            <Image
              src={vaccine.pets.photo_url}
              alt={vaccine.pets.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              {getSpeciesIcon(vaccine.pets.species)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[var(--text-primary)]">{vaccine.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {vaccine.pets.name} ({vaccine.pets.species}) • {vaccine.pets.profiles?.full_name}
          </p>
        </div>

        {/* Due Date */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">Próxima dosis</p>
          {vaccine.next_due_date ? (
            <>
              <p className={`font-bold ${isOverdue ? 'text-red-600' : daysUntil && daysUntil <= 7 ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>
                {formatDate(vaccine.next_due_date)}
              </p>
              {daysUntil !== null && (
                <p className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                  {isOverdue
                    ? `Vencida hace ${Math.abs(daysUntil)} días`
                    : `En ${daysUntil} días`}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm">-</p>
          )}
        </div>
      </div>
    </Link>
  );
}
