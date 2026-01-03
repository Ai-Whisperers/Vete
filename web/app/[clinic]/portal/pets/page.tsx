import { getOwnerPets } from '@/app/actions/pets';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, PawPrint, Search, Calendar } from 'lucide-react';
import { PetCardEnhanced } from '@/components/pets/pet-card-enhanced';

interface Props {
  params: Promise<{ clinic: string }>;
  searchParams: Promise<{ query?: string }>;
}

export default async function PortalPetsPage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const { query } = await searchParams;

  const result = await getOwnerPets(clinic, query);

  if (!result.success) {
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

  const pets = result.data ?? [];

  return (
    <div className="page-container-md pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 page-header">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Mis Mascotas</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {pets.length} {pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
          </p>
        </div>
        <Link
          href={`/${clinic}/portal/pets/new`}
          className="btn btn-lg btn-primary-solid"
        >
          <Plus className="w-5 h-5" />
          Nueva Mascota
        </Link>
      </div>

      {/* Search */}
      <form className="page-header-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar mascota por nombre..."
            className="input-base input-with-icon"
          />
        </div>
      </form>

      {/* Empty State */}
      {pets.length === 0 && (
        <div className="card-base border-2 border-dashed empty-state">
          <div className="empty-state-icon w-20 h-20">
            <PawPrint className="w-10 h-10" />
          </div>
          <h3 className="empty-state-title text-xl">
            {query ? 'No se encontraron resultados' : 'Aún no tienes mascotas'}
          </h3>
          <p className="empty-state-description">
            {query
              ? `No encontramos ninguna mascota llamada "${query}"`
              : 'Registra a tus compañeros peludos para llevar un mejor control de su salud'}
          </p>
          {!query && (
            <Link href={`/${clinic}/portal/pets/new`} className="btn btn-lg btn-primary-solid">
              <Plus className="w-5 h-5" />
              Registrar Mascota
            </Link>
          )}
        </div>
      )}

      {/* Pets List */}
      {pets.length > 0 && (
        <div className="space-y-4">
          {pets.map((pet: any) => (
            <PetCardEnhanced key={pet.id} pet={pet} clinic={clinic} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-12 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <h3 className="text-lg font-bold mb-4 relative z-10">Acciones Rápidas</h3>
        <div className="grid sm:grid-cols-2 gap-3 relative z-10">
          <Link
            href={`/${clinic}/portal/appointments/new`}
            className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Agendar Cita</p>
              <p className="text-xs text-white/60">Reserva un horario</p>
            </div>
          </Link>
          <Link
            href={`/${clinic}/portal/pets/new`}
            className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Nueva Mascota</p>
              <p className="text-xs text-white/60">Añade otro paciente</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
