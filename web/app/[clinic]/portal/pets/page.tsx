import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Dog,
  Cat,
  PawPrint,
  Syringe,
  Calendar,
  ChevronRight,
  Search,
} from 'lucide-react';

interface Props {
  params: Promise<{ clinic: string }>;
  searchParams: Promise<{ query?: string }>;
}

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
  vaccines: { id: string; status: string }[] | null;
}

async function getPets(userId: string, query?: string): Promise<Pet[]> {
  // In a real app, you'd get the full URL from an env var
  const url = new URL(`http://localhost:3000/api/pets`);
  url.searchParams.append('userId', userId);
  if (query) {
    url.searchParams.append('query', query);
  }

  const res = await fetch(url.toString(), {
    next: { tags: ['pets'] }, // Tag for on-demand revalidation
  });

  if (!res.ok) {
    console.error('Failed to fetch pets:', await res.text());
    return [];
  }

  return res.json();
}

export default async function PortalPetsPage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const { query } = await searchParams;
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  const typedPets = await getPets(user.id, query);


  const getSpeciesIcon = (species: string): React.ReactElement => {
    switch (species) {
      case 'dog':
        return <Dog className="w-5 h-5" />;
      case 'cat':
        return <Cat className="w-5 h-5" />;
      default:
        return <PawPrint className="w-5 h-5" />;
    }
  };

  const calculateAge = (dob: string | null): string => {
    if (!dob) return 'Edad desconocida';
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();

    if (years > 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    return 'Cachorro/Gatito';
  };

  const getPendingVaccines = (vaccines: { id: string; status: string }[] | null): number => {
    if (!vaccines) return 0;
    return vaccines.filter((v) => v.status === 'pending').length;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Mis Mascotas</h1>
          <p className="text-[var(--text-secondary)]">
            {typedPets.length} {typedPets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
          </p>
        </div>
        <Link
          href={`/${clinic}/portal/pets/new`}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Nueva Mascota
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar mascota por nombre..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
          />
        </div>
      </form>

      {/* Empty State */}
      {typedPets.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <PawPrint className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            {query ? 'No se encontraron mascotas' : 'Aún no tienes mascotas'}
          </h3>
          <p className="text-gray-500 mb-6">
            {query
              ? 'Intenta con otro término de búsqueda'
              : 'Registra tu primera mascota para comenzar'}
          </p>
          {!query && (
            <Link
              href={`/${clinic}/portal/pets/new`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Registrar Mascota
            </Link>
          )}
        </div>
      )}

      {/* Pets Grid */}
      {typedPets.length > 0 && (
        <div className="grid gap-4">
          {typedPets.map((pet) => {
            const pendingVaccines = getPendingVaccines(pet.vaccines);

            return (
              <Link
                key={pet.id}
                href={`/${clinic}/portal/pets/${pet.id}`}
                className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-5"
              >
                {/* Photo */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {pet.photo_url ? (
                    <Image
                      src={pet.photo_url}
                      alt={pet.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      {getSpeciesIcon(pet.species)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">
                      {pet.name}
                    </h3>
                    <span className="text-[var(--text-secondary)]">
                      {getSpeciesIcon(pet.species)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    {pet.breed || 'Mestizo'} • {calculateAge(pet.date_of_birth)}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    {pendingVaccines > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                        <Syringe className="w-3 h-3" />
                        {pendingVaccines} vacunas pendientes
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <Calendar className="w-3 h-3" />
                      Ver historial
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 rounded-2xl">
        <h3 className="font-bold text-[var(--text-primary)] mb-4">Acciones Rápidas</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href={`/${clinic}/portal/appointments/new`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">Agendar Cita</p>
              <p className="text-xs text-[var(--text-secondary)]">Programa una consulta</p>
            </div>
          </Link>
          <Link
            href={`/${clinic}/portal/pets/new`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">Nueva Mascota</p>
              <p className="text-xs text-[var(--text-secondary)]">Registra otra mascota</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
