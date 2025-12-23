import { getOwnerPets } from '@/app/actions/pets';
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

export default async function PortalPetsPage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const { query } = await searchParams;

  const result = await getOwnerPets(clinic, query);

  if (!result.success) {
    // If it fails due to auth, redirect
    if (result.error === 'Authentication required') {
        redirect(`/${clinic}/portal/login`);
    }
    
    return (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl">
            <p className="font-bold">Error al cargar mascotas</p>
            <p className="text-sm">{result.error}</p>
        </div>
    );
  }

  const typedPets = result.data;

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Mis Mascotas</h1>
          <p className="text-[var(--text-secondary)]">
            {typedPets.length} {typedPets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
          </p>
        </div>
        <Link
          href={`/${clinic}/portal/pets/new`}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Mascota
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar mascota por nombre..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
          />
        </div>
      </form>

      {/* Empty State */}
      {typedPets.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-6">
            <PawPrint className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {query ? 'No se encontraron resultados' : 'Aún no tienes mascotas'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            {query
              ? `No encontramos ninguna mascota llamada "${query}"`
              : 'Registra a tus compañeros peludos para llevar un mejor control de su salud'}
          </p>
          {!query && (
            <Link
              href={`/${clinic}/portal/pets/new`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
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
          {typedPets.map((pet: any) => {
            return (
              <Link
                key={pet.id}
                href={`/${clinic}/portal/pets/${pet.id}`}
                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 flex items-center gap-6"
              >
                {/* Photo */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative">
                  {pet.photo_url ? (
                    <Image
                      src={pet.photo_url}
                      alt={pet.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <PawPrint className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-[var(--text-primary)] truncate">
                      {pet.name}
                    </h3>
                    <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[var(--primary)] group-hover:bg-[var(--primary)]/10 transition-colors">
                      {getSpeciesIcon(pet.species)}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
                    {pet.breed || 'Mestizo'} • {calculateAge(pet.date_of_birth)}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
                    <span>Ver ficha médica</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-12 p-8 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <h3 className="text-xl font-black mb-6 relative z-10">Acciones Rápidas</h3>
        <div className="grid sm:grid-cols-2 gap-4 relative z-10">
          <Link
            href={`/${clinic}/portal/appointments/new`}
            className="flex items-center gap-4 p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold">Agendar Cita</p>
              <p className="text-xs text-white/60">Reserva un horario</p>
            </div>
          </Link>
          <Link
            href={`/${clinic}/portal/pets/new`}
            className="flex items-center gap-4 p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold">Nueva Mascota</p>
              <p className="text-xs text-white/60">Añade otro paciente</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
