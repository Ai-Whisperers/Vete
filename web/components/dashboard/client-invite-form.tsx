"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  PawPrint,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClientInviteFormProps {
  clinic: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientInviteForm({
  clinic,
  onSuccess,
  onCancel,
}: ClientInviteFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPetSection, setShowPetSection] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("dog");
  const [petBreed, setPetBreed] = useState("");

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

      // Check for existing email
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .eq("tenant_id", clinic)
        .single();

      if (existingProfile) {
        throw new Error("Ya existe un cliente con este correo electrónico");
      }

      // Create profile directly (for walk-in clients without auth)
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          tenant_id: clinic,
          full_name: fullName,
          email: email.toLowerCase(),
          phone: phone || null,
          role: "owner",
        })
        .select("id")
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("Error al crear el perfil del cliente");
      }

      // Create pet if provided
      if (showPetSection && petName) {
        const { error: petError } = await supabase.from("pets").insert({
          tenant_id: clinic,
          owner_id: newProfile.id,
          name: petName,
          species: petSpecies,
          breed: petBreed || null,
        });

        if (petError) {
          console.error("Pet creation error:", petError);
          // Don't fail the whole operation if pet creation fails
        }
      }

      setSuccess(true);
      router.refresh();

      // Auto-close after success
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error("Error creating client:", err);
      setError(err instanceof Error ? err.message : "Error al crear cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-green-800 mb-2">
          Cliente Registrado
        </h2>
        <p className="text-green-700">
          El cliente ha sido agregado exitosamente.
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

      {/* Client Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4" />
          Información del Cliente
        </h3>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-1">
            Nombre Completo *
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Juan Pérez"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            Correo Electrónico *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="cliente@email.com"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0981 123 456"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Pet Section Toggle */}
      <button
        type="button"
        onClick={() => setShowPetSection(!showPetSection)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-gray-700">
          <PawPrint className="w-5 h-5 text-[var(--primary)]" />
          Agregar Mascota (opcional)
        </span>
        {showPetSection ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Pet Info */}
      {showPetSection && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <label htmlFor="petName" className="block text-sm font-medium text-gray-600 mb-1">
              Nombre de la Mascota
            </label>
            <input
              id="petName"
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Max, Luna, etc."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="petSpecies" className="block text-sm font-medium text-gray-600 mb-1">
                Especie
              </label>
              <select
                id="petSpecies"
                value={petSpecies}
                onChange={(e) => setPetSpecies(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none bg-white"
              >
                <option value="dog">Perro</option>
                <option value="cat">Gato</option>
                <option value="bird">Ave</option>
                <option value="rabbit">Conejo</option>
                <option value="hamster">Hámster</option>
                <option value="fish">Pez</option>
                <option value="reptile">Reptil</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="petBreed" className="block text-sm font-medium text-gray-600 mb-1">
                Raza
              </label>
              <input
                id="petBreed"
                type="text"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="Golden Retriever, etc."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none bg-white"
              />
            </div>
          </div>
        </div>
      )}

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
          disabled={isSubmitting || !fullName || !email}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              Registrar Cliente
            </>
          )}
        </button>
      </div>
    </form>
  );
}
