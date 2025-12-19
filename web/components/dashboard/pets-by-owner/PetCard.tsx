import Link from "next/link";
import { Calendar, Activity, Syringe } from "lucide-react";
import type { Pet } from "./types";
import { calculateAge, getSpeciesEmoji } from "./utils";

interface PetCardProps {
  pet: Pet;
  clinic: string;
}

export function PetCard({ pet, clinic }: PetCardProps): React.ReactElement {
  return (
    <Link
      href={`/${clinic}/portal/pets/${pet.id}`}
      className="group flex items-start gap-4 p-4 bg-[var(--bg-subtle)] rounded-xl hover:shadow-md transition-all border border-transparent hover:border-[var(--primary)]"
    >
      <div className="relative">
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={pet.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
            <span className="text-3xl">{getSpeciesEmoji(pet.species)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
            {pet.name}
          </h4>
          {pet.sex && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              pet.sex === "male"
                ? "bg-blue-100 text-blue-700"
                : "bg-pink-100 text-pink-700"
            }`}>
              {pet.sex === "male" ? "♂" : "♀"}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)] capitalize mb-2">
          {pet.species} {pet.breed && `• ${pet.breed}`}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[var(--text-secondary)]">
            <Calendar className="w-3 h-3" />
            {calculateAge(pet.date_of_birth)}
          </span>
          {pet.neutered && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[var(--text-secondary)]">
              <Activity className="w-3 h-3" />
              Esterilizado
            </span>
          )}
          {pet.microchip_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[var(--text-secondary)]" title={pet.microchip_id}>
              <span className="w-3 h-3 flex items-center justify-center">📍</span>
              Chip
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/${clinic}/dashboard/appointments/new?pet=${pet.id}`}
          className="p-1.5 bg-white rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors"
          title="Nueva Cita"
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar className="w-4 h-4" />
        </Link>
        <Link
          href={`/${clinic}/portal/pets/${pet.id}/vaccines`}
          className="p-1.5 bg-white rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors"
          title="Vacunas"
          onClick={(e) => e.stopPropagation()}
        >
          <Syringe className="w-4 h-4" />
        </Link>
      </div>
    </Link>
  );
}
