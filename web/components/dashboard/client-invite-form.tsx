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
import { useForm } from "@/hooks/use-form";
import { useAsyncData } from "@/hooks/use-async-data";
import { required, email } from "@/lib/utils/validation";
import { ErrorBoundary } from "@/components/shared";

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
  const [success, setSuccess] = useState(false);
  const [showPetSection, setShowPetSection] = useState(false);

  // Form state management
  const form = useForm({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      petName: "",
      petSpecies: "dog",
      petBreed: "",
    },
    validationRules: {
      fullName: required("El nombre completo es requerido"),
      email: [required("El correo electrónico es requerido"), email("Correo electrónico inválido")],
    },
  });

  // API call for creating client
  const { isLoading: isSubmitting, error: submitError, refetch: submitForm } = useAsyncData(
    async () => {
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
        .eq("email", form.values.email.toLowerCase())
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
          full_name: form.values.fullName,
          email: form.values.email.toLowerCase(),
          phone: form.values.phone || null,
          role: "owner",
        })
        .select("id")
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("Error al crear el perfil del cliente");
      }

      // Create pet if provided
      if (showPetSection && form.values.petName) {
        const { error: petError } = await supabase.from("pets").insert({
          tenant_id: clinic,
          owner_id: newProfile.id,
          name: form.values.petName,
          species: form.values.petSpecies,
          breed: form.values.petBreed || null,
        });

        if (petError) {
          console.error("Pet creation error:", petError);
          // Don't fail the whole operation if pet creation fails
        }
      }

      return newProfile;
    },
    [], // No dependencies - manual trigger only
    { enabled: false } // Don't run automatically
  );

  const handleSubmit = form.handleSubmit(async () => {
    try {
      await submitForm();
      setSuccess(true);
      router.refresh();

      // Auto-close after success
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      // Error is handled by useAsyncData
    }
  });

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
    <ErrorBoundary>
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* TICKET-FORM-005: Added role="alert" for accessibility */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          id="form-error"
          className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{submitError}</span>
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
            {...form.getFieldProps('fullName')}
            required
            placeholder="Juan Pérez"
            aria-invalid={submitError ? "true" : "false"}
            aria-describedby={submitError ? "form-error" : undefined}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none ${
              form.getFieldProps('fullName').error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-[var(--primary)] focus:ring-[var(--primary)]/20'
            }`}
          />
          {form.getFieldProps('fullName').error && (
            <p className="text-red-600 text-xs mt-1">{form.getFieldProps('fullName').error}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            Correo Electrónico *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
            <input
              id="email"
              type="email"
              {...form.getFieldProps('email')}
              required
              placeholder="cliente@email.com"
              aria-invalid={submitError ? "true" : "false"}
              aria-describedby={submitError ? "form-error" : undefined}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 outline-none ${
                form.getFieldProps('email').error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-[var(--primary)] focus:ring-[var(--primary)]/20'
              }`}
            />
          </div>
          {form.getFieldProps('email').error && (
            <p className="text-red-600 text-xs mt-1">{form.getFieldProps('email').error}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
            <input
              id="phone"
              type="tel"
              {...form.getFieldProps('phone')}
              placeholder="0981 123 456"
              aria-invalid="false"
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
              {...form.getFieldProps('petName')}
              placeholder="Max, Luna, etc."
              aria-invalid="false"
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
                {...form.getFieldProps('petSpecies')}
                aria-invalid="false"
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
                {...form.getFieldProps('petBreed')}
                placeholder="Golden Retriever, etc."
                aria-invalid="false"
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
          disabled={isSubmitting || !form.isValid}
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
    </ErrorBoundary>
  );
}
