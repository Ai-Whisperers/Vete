"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Dog, Cat, PawPrint, Loader2, Plus, AlertCircle } from "lucide-react";
import { classifyPetSize, SIZE_SHORT_LABELS, getSizeBadgeColor, type PetSizeCategory } from "@/lib/utils/pet-size";
import type { PetForService } from "@/lib/types/services";

interface PetSelectorProps {
  /** Called when a pet is selected */
  onSelect: (pet: PetForService) => void;
  /** Currently selected pet ID */
  selectedPetId?: string;
  /** Optional class name for the container */
  className?: string;
}

/**
 * Pet Selector Component
 *
 * Fetches and displays the logged-in user's pets for service selection.
 * Shows pet photo, name, weight, and auto-classified size category.
 */
export function PetSelector({ onSelect, selectedPetId, className = "" }: PetSelectorProps) {
  const { clinic } = useParams<{ clinic: string }>();
  const supabase = createClient();

  const [pets, setPets] = useState<PetForService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current user
        console.log("PetSelector: Fetching user...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("PetSelector: User error:", userError);
        }

        if (!user) {
          console.log("PetSelector: No user found");
          setError("Debes iniciar sesión para ver tus mascotas");
          setLoading(false);
          return;
        }
        console.log("PetSelector: User found:", user.id);

        // Fetch user's pets
        console.log("PetSelector: Fetching pets for owner:", user.id);
        const { data, error: fetchError } = await supabase
          .from("pets")
          .select("id, name, species, breed, weight_kg, photo_url")
          .eq("owner_id", user.id)
          .order("name", { ascending: true });

        if (fetchError) {
          console.error("PetSelector: Fetch error:", fetchError);
          setError("Error al cargar mascotas");
          setLoading(false);
          return;
        }
        console.log("PetSelector: Pets fetched:", data?.length);

        // Map to PetForService with size classification
        const petsWithSize: PetForService[] = (data || []).map((pet) => ({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          weight_kg: pet.weight_kg,
          photo_url: pet.photo_url,
          size_category: classifyPetSize(pet.weight_kg)
        }));

        setPets(petsWithSize);
      } catch (err) {
        setError("Error inesperado al cargar mascotas");
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
        <span className="ml-2 text-[var(--text-secondary)]">Cargando mascotas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-700 ${className}`}>
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className={`text-center py-8 px-4 bg-[var(--bg-subtle)] rounded-2xl ${className}`}>
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <PawPrint className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-[var(--text-secondary)] mb-4">
          No tienes mascotas registradas
        </p>
        <Link
          href={`/${clinic}/portal/pets/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" />
          Registrar Mascota
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
        Selecciona la mascota para este servicio:
      </p>

      <div className="grid gap-3">
        {pets.map((pet) => {
          const isSelected = pet.id === selectedPetId;
          const sizeColor = getSizeBadgeColor(pet.size_category);

          return (
            <button
              key={pet.id}
              type="button"
              onClick={() => onSelect(pet)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-[var(--primary)]/50 hover:shadow-sm"
              }`}
            >
              {/* Pet Photo */}
              <div className="shrink-0">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                    {pet.species === "dog" ? (
                      <Dog className="w-6 h-6 text-gray-400" />
                    ) : pet.species === "cat" ? (
                      <Cat className="w-6 h-6 text-gray-400" />
                    ) : (
                      <PawPrint className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Pet Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[var(--text-primary)] truncate">
                    {pet.name}
                  </span>
                  {/* Size Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sizeColor}`}>
                    {SIZE_SHORT_LABELS[pet.size_category]}
                  </span>
                </div>
                <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                  <span className="capitalize">{pet.species === "dog" ? "Perro" : pet.species === "cat" ? "Gato" : pet.species}</span>
                  {pet.breed && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{pet.breed}</span>
                    </>
                  )}
                  {pet.weight_kg && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{pet.weight_kg} kg</span>
                    </>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              <div className="shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Link to add another pet */}
      <Link
        href={`/${clinic}/portal/pets/new`}
        className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium hover:underline mt-4"
      >
        <Plus className="w-4 h-4" />
        Registrar otra mascota
      </Link>
    </div>
  );
}
