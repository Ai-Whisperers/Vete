"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Syringe,
  Calendar,
  PawPrint,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Pet {
  id: string;
  name: string;
  species: string;
  owner_id: string;
  profiles?: {
    full_name: string;
  };
}

interface VaccineRegistrationFormProps {
  clinic: string;
  preselectedPetId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VACCINE_OPTIONS = [
  { value: "Rabia", label: "Antirrábica" },
  { value: "Parvovirus", label: "Parvovirus" },
  { value: "Moquillo", label: "Moquillo (Distemper)" },
  { value: "Hepatitis", label: "Hepatitis" },
  { value: "Leptospirosis", label: "Leptospirosis" },
  { value: "Bordetella", label: "Bordetella (Tos de las perreras)" },
  { value: "Triple Felina", label: "Triple Felina" },
  { value: "Leucemia Felina", label: "Leucemia Felina (FeLV)" },
  { value: "Polivalente Canina", label: "Polivalente Canina" },
  { value: "Polivalente Felina", label: "Polivalente Felina" },
  { value: "Otra", label: "Otra" },
];

export function VaccineRegistrationForm({
  clinic,
  preselectedPetId,
  onSuccess,
  onCancel,
}: VaccineRegistrationFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);

  // Form state
  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId || "");
  const [vaccineName, setVaccineName] = useState("");
  const [customVaccineName, setCustomVaccineName] = useState("");
  const [administeredDate, setAdministeredDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [nextDueDate, setNextDueDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch pets on mount
  useEffect(() => {
    const fetchPets = async (): Promise<void> => {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("pets")
        .select("id, name, species, owner_id, profiles!pets_owner_id_fkey(full_name)")
        .eq("tenant_id", clinic)
        .order("name");

      if (fetchError) {
        console.error("Error fetching pets:", fetchError);
        setError("Error al cargar mascotas");
      } else {
        setPets((data || []) as unknown as Pet[]);
      }
      setLoading(false);
    };

    fetchPets();
  }, [clinic]);

  // Auto-calculate next due date based on vaccine type
  const handleVaccineChange = (vaccine: string): void => {
    setVaccineName(vaccine);

    // Set default next due date based on vaccine type
    if (administeredDate) {
      const adminDate = new Date(administeredDate);
      let monthsToAdd = 12; // Default 1 year

      if (vaccine === "Rabia") {
        monthsToAdd = 12; // 1 year for rabies
      } else if (vaccine.includes("Polivalente") || vaccine === "Triple Felina") {
        monthsToAdd = 12; // 1 year
      } else if (vaccine === "Bordetella") {
        monthsToAdd = 6; // 6 months
      }

      const nextDate = new Date(adminDate);
      nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
      setNextDueDate(nextDate.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No autorizado");
      }

      const finalVaccineName = vaccineName === "Otra" ? customVaccineName : vaccineName;

      if (!finalVaccineName) {
        throw new Error("Debe especificar el nombre de la vacuna");
      }

      // Create vaccine record
      const { error: insertError } = await supabase.from("vaccines").insert({
        tenant_id: clinic,
        pet_id: selectedPetId,
        vaccine_name: finalVaccineName,
        administered_date: administeredDate,
        next_due_date: nextDueDate || null,
        batch_number: batchNumber || null,
        manufacturer: manufacturer || null,
        notes: notes || null,
        administered_by: user.id,
        status: "verified",
      });

      if (insertError) {
        console.error("Vaccine insert error:", insertError);
        throw new Error("Error al registrar la vacuna");
      }

      setSuccess(true);
      router.refresh();

      // Auto-close after success
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error("Error registering vaccine:", err);
      setError(err instanceof Error ? err.message : "Error al registrar vacuna");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-green-800 mb-2">
          Vacuna Registrada
        </h2>
        <p className="text-green-700">
          La vacuna ha sido registrada exitosamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Pet Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <PawPrint className="w-4 h-4" />
          Paciente
        </h3>

        <div>
          <label htmlFor="petId" className="block text-sm font-medium text-gray-600 mb-1">
            Mascota *
          </label>
          <select
            id="petId"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          >
            <option value="">Seleccionar mascota...</option>
            {pets.map((pet) => {
              const ownerName = pet.profiles
                ? (Array.isArray(pet.profiles) ? pet.profiles[0]?.full_name : pet.profiles.full_name)
                : "";
              return (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species}) {ownerName ? `- ${ownerName}` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Vaccine Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Syringe className="w-4 h-4" />
          Información de la Vacuna
        </h3>

        <div>
          <label htmlFor="vaccineName" className="block text-sm font-medium text-gray-600 mb-1">
            Vacuna *
          </label>
          <select
            id="vaccineName"
            value={vaccineName}
            onChange={(e) => handleVaccineChange(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          >
            <option value="">Seleccionar vacuna...</option>
            {VACCINE_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {vaccineName === "Otra" && (
          <div>
            <label htmlFor="customVaccineName" className="block text-sm font-medium text-gray-600 mb-1">
              Nombre de la Vacuna *
            </label>
            <input
              id="customVaccineName"
              type="text"
              value={customVaccineName}
              onChange={(e) => setCustomVaccineName(e.target.value)}
              required
              placeholder="Nombre de la vacuna"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="administeredDate" className="block text-sm font-medium text-gray-600 mb-1">
              Fecha de Aplicación *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="administeredDate"
                type="date"
                value={administeredDate}
                onChange={(e) => setAdministeredDate(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="nextDueDate" className="block text-sm font-medium text-gray-600 mb-1">
              Próxima Dosis
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="nextDueDate"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-600 mb-1">
              Número de Lote
            </label>
            <input
              id="batchNumber"
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="ABC123"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
          </div>

          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-600 mb-1">
              Fabricante
            </label>
            <input
              id="manufacturer"
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="Laboratorio"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-600 mb-1">
            Notas
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Observaciones adicionales..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedPetId || !vaccineName}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Syringe className="w-4 h-4" />
              Registrar Vacuna
            </>
          )}
        </button>
      </div>
    </form>
  );
}
