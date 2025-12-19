import Link from "next/link";
import { PawPrint, Plus } from "lucide-react";
import type { Owner } from "./types";
import { PetCard } from "./PetCard";

interface PetsSectionProps {
  owner: Owner;
  clinic: string;
}

export function PetsSection({ owner, clinic }: PetsSectionProps): React.ReactElement {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-[var(--primary)]" />
          Mascotas ({owner.pets.length})
        </h3>
        <Link
          href={`/${clinic}/dashboard/pets/new?owner=${owner.id}`}
          className="text-sm text-[var(--primary)] hover:underline font-medium"
        >
          + Agregar Mascota
        </Link>
      </div>

      {owner.pets.length === 0 ? (
        <div className="text-center py-8">
          <PawPrint className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
          <p className="text-sm text-[var(--text-secondary)]">
            Este propietario no tiene mascotas registradas
          </p>
          <Link
            href={`/${clinic}/dashboard/pets/new?owner=${owner.id}`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Registrar Primera Mascota
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {owner.pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} clinic={clinic} />
          ))}
        </div>
      )}
    </div>
  );
}
