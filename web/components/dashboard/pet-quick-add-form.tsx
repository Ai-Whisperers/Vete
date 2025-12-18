"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PawPrint,
  User,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface PetQuickAddFormProps {
  clinic: string;
  preselectedClientId?: string;
  onSuccess?: (petId: string) => void;
  onCancel?: () => void;
}

const SPECIES_OPTIONS = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "bird", label: "Ave" },
  { value: "rabbit", label: "Conejo" },
  { value: "hamster", label: "Hámster" },
  { value: "fish", label: "Pez" },
  { value: "reptile", label: "Reptil" },
  { value: "other", label: "Otro" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Macho" },
  { value: "female", label: "Hembra" },
  { value: "unknown", label: "Desconocido" },
];

export function PetQuickAddForm({
  clinic,
  preselectedClientId,
  onSuccess,
  onCancel,
}: PetQuickAddFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || "");
  const [selectedClientName, setSelectedClientName] = useState("");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("dog");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("unknown");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [microchipNumber, setMicrochipNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async (): Promise<void> => {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("tenant_id", clinic)
        .eq("role", "owner")
        .order("full_name");

      if (fetchError) {
        console.error("Error fetching clients:", fetchError);
        setError("Error al cargar clientes");
      } else {
        setClients((data || []) as Client[]);

        // If preselected, set the name
        if (preselectedClientId) {
          const client = data?.find((c) => c.id === preselectedClientId);
          if (client) {
            setSelectedClientName(client.full_name);
          }
        }
      }
      setLoading(false);
    };

    fetchClients();
  }, [clinic, preselectedClientId]);

  // Filter clients based on search
  const filteredClients = clients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleClientSelect = (client: Client): void => {
    setSelectedClientId(client.id);
    setSelectedClientName(client.full_name);
    setClientSearch("");
    setShowClientDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No autorizado");
      }

      if (!selectedClientId) {
        throw new Error("Debe seleccionar un propietario");
      }

      if (!petName.trim()) {
        throw new Error("Debe ingresar el nombre de la mascota");
      }

      // Create pet record
      const { data: newPet, error: insertError } = await supabase
        .from("pets")
        .insert({
          tenant_id: clinic,
          owner_id: selectedClientId,
          name: petName.trim(),
          species,
          breed: breed.trim() || null,
          sex,
          birth_date: birthDate || null,
          weight: weight ? parseFloat(weight) : null,
          microchip_number: microchipNumber.trim() || null,
          notes: notes.trim() || null,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Pet insert error:", insertError);
        throw new Error("Error al registrar la mascota");
      }

      setSuccess(true);
      router.refresh();

      // Auto-close after success
      setTimeout(() => {
        onSuccess?.(newPet.id);
      }, 1500);
    } catch (err) {
      console.error("Error creating pet:", err);
      setError(err instanceof Error ? err.message : "Error al registrar mascota");
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
          Mascota Registrada
        </h2>
        <p className="text-green-700">
          La mascota ha sido agregada exitosamente.
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

      {/* Owner Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4" />
          Propietario
        </h3>

        <div className="relative">
          <label
            htmlFor="clientSearch"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Buscar Cliente *
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="clientSearch"
              type="text"
              value={selectedClientName || clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setSelectedClientId("");
                setSelectedClientName("");
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
            <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown */}
          {showClientDropdown && !selectedClientId && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No se encontraron clientes
                </div>
              ) : (
                filteredClients.slice(0, 10).map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-900">{client.full_name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pet Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <PawPrint className="w-4 h-4" />
          Información de la Mascota
        </h3>

        <div>
          <label htmlFor="petName" className="block text-sm font-medium text-gray-600 mb-1">
            Nombre *
          </label>
          <input
            id="petName"
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
            placeholder="Max, Luna, etc."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-600 mb-1">
              Especie *
            </label>
            <select
              id="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            >
              {SPECIES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-600 mb-1">
              Sexo
            </label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            >
              {SEX_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="breed" className="block text-sm font-medium text-gray-600 mb-1">
            Raza
          </label>
          <input
            id="breed"
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Golden Retriever, Siamés, etc."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-600 mb-1">
              Fecha de Nacimiento
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-600 mb-1">
              Peso (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-600 mb-1">
            Número de Microchip
          </label>
          <input
            id="microchipNumber"
            type="text"
            value={microchipNumber}
            onChange={(e) => setMicrochipNumber(e.target.value)}
            placeholder="123456789012345"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          />
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
            placeholder="Alergias, condiciones especiales, etc."
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
          disabled={isSubmitting || !selectedClientId || !petName.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <PawPrint className="w-4 h-4" />
              Registrar Mascota
            </>
          )}
        </button>
      </div>
    </form>
  );
}
