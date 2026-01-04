"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Dog, Cat, PawPrint, Loader2, Plus, AlertCircle, Check, CheckSquare, Square } from "lucide-react";
import { classifyPetSize, SIZE_SHORT_LABELS, getSizeBadgeColor, type PetSizeCategory } from "@/lib/utils/pet-size";
import type { PetForService } from "@/lib/types/services";

interface MultiPetSelectorProps {
  /** Called when selection changes */
  onSelectionChange: (pets: PetForService[]) => void;
  /** Currently selected pet IDs */
  selectedPetIds: string[];
  /** Optional class name for the container */
  className?: string;
}

/**
 * Multi Pet Selector Component
 *
 * Fetches and displays the logged-in user's pets with checkbox selection.
 * Allows selecting multiple pets for service booking.
 * Shows pet photo, name, weight, and auto-classified size category.
 */
export function MultiPetSelector({ onSelectionChange, selectedPetIds, className = "" }: MultiPetSelectorProps) {
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
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("MultiPetSelector: User error:", userError);
        }

        if (!user) {
          setError("Debes iniciar sesión para ver tus mascotas");
          setLoading(false);
          return;
        }

        // Fetch user's pets
        const { data, error: fetchError } = await supabase
          .from("pets")
          .select("id, name, species, breed, weight_kg, photo_url")
          .eq("owner_id", user.id)
          .order("name", { ascending: true });

        if (fetchError) {
          console.error("MultiPetSelector: Fetch error:", fetchError);
          setError("Error al cargar mascotas");
          setLoading(false);
          return;
        }

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

  // Toggle a single pet selection
  const togglePet = useCallback((pet: PetForService) => {
    const isCurrentlySelected = selectedPetIds.includes(pet.id);

    if (isCurrentlySelected) {
      // Remove from selection
      const newSelection = pets.filter(p =>
        selectedPetIds.includes(p.id) && p.id !== pet.id
      );
      onSelectionChange(newSelection);
    } else {
      // Add to selection
      const currentlySelected = pets.filter(p => selectedPetIds.includes(p.id));
      onSelectionChange([...currentlySelected, pet]);
    }
  }, [pets, selectedPetIds, onSelectionChange]);

  // Select/Deselect all
  const toggleAll = useCallback(() => {
    if (selectedPetIds.length === pets.length) {
      // All are selected, deselect all
      onSelectionChange([]);
    } else {
      // Select all
      onSelectionChange(pets);
    }
  }, [pets, selectedPetIds.length, onSelectionChange]);

  const allSelected = pets.length > 0 && selectedPetIds.length === pets.length;
  const someSelected = selectedPetIds.length > 0 && selectedPetIds.length < pets.length;

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
      {/* Header with Select All */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Selecciona tus mascotas:
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          {allSelected ? (
            <>
              <CheckSquare className="w-4 h-4" />
              Deseleccionar todos
            </>
          ) : (
            <>
              <Square className="w-4 h-4" />
              Seleccionar todos
            </>
          )}
        </button>
      </div>

      {/* Selection counter */}
      {selectedPetIds.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)]/10 rounded-xl mb-3">
          <Check className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--primary)]">
            {selectedPetIds.length} {selectedPetIds.length === 1 ? "mascota seleccionada" : "mascotas seleccionadas"}
          </span>
        </div>
      )}

      {/* Pet Grid */}
      <div className="grid gap-3">
        {pets.map((pet) => {
          const isSelected = selectedPetIds.includes(pet.id);
          const sizeColor = getSizeBadgeColor(pet.size_category);

          return (
            <button
              key={pet.id}
              type="button"
              onClick={() => togglePet(pet)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-[var(--primary)]/50 hover:shadow-sm"
              }`}
            >
              {/* Checkbox */}
              <div className="shrink-0">
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>

              {/* Pet Photo */}
              <div className="shrink-0">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                    {pet.species === "dog" ? (
                      <Dog className="w-5 h-5 text-gray-400" />
                    ) : pet.species === "cat" ? (
                      <Cat className="w-5 h-5 text-gray-400" />
                    ) : (
                      <PawPrint className="w-5 h-5 text-gray-400" />
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
                  <span className="capitalize">
                    {pet.species === "dog" ? "Perro" : pet.species === "cat" ? "Gato" : pet.species}
                  </span>
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
