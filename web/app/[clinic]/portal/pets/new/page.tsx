"use client";

import { useActionState, useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { createPet } from "@/app/actions/create-pet";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PhotoUpload } from "@/components/pets/photo-upload";
import { ActionResult, FieldErrors } from "@/lib/types/action-result";

// Helper component for field errors
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

// Helper component for field hints
function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-xs text-[var(--text-muted)] flex items-start gap-1">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

// Get field errors from state
function getFieldErrors(state: ActionResult | null): FieldErrors {
  if (!state || state.success) return {};
  return state.fieldErrors || {};
}

// Input class with error state
function inputClass(hasError: boolean) {
  const base = "w-full px-4 py-3 rounded-xl border outline-none transition-colors";
  return hasError
    ? `${base} border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200`
    : `${base} border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20`;
}

export default function NewPetPage() {
  const { clinic } = useParams();
  const [state, formAction, isPending] = useActionState(createPet, null);
  const fieldErrors = getFieldErrors(state);

  // Client-side only rendering to prevent hydration mismatches from extensions (LastPass, etc.)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="max-w-xl mx-auto flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-white transition-colors" aria-label="Volver al dashboard">
          <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Nueva Mascota</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Completa los datos de tu mascota para registrarla en la clínica</p>
        </div>
      </div>

      {/* Global error message */}
      {state && !state.success && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">No se pudo guardar</p>
            <p className="text-sm mt-1">{state.error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="clinic" value={clinic} />

          {/* Required fields notice */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] pb-2 border-b border-gray-100">
            <Info className="w-4 h-4" aria-hidden="true" />
            <span>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</span>
          </div>

          {/* Photo Upload */}
          <div>
            <PhotoUpload
              name="photo"
              placeholder="Subir foto"
              shape="circle"
              size={128}
              maxSizeMB={5}
            />
            <FieldError error={fieldErrors.photo} />
            <p className="text-center text-xs text-[var(--text-muted)] mt-2">
              La foto ayuda a identificar a tu mascota. Puedes agregarla ahora o después.
            </p>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-xs text-[var(--primary)] font-bold">1</span>
              Información Básica
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div suppressHydrationWarning>
                <label htmlFor="name" className="block text-sm font-bold text-[var(--text-secondary)] mb-1" suppressHydrationWarning>
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  type="text"
                  placeholder="Ej: Firulais"
                  className={inputClass(!!fieldErrors.name)}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                />
                <FieldError error={fieldErrors.name} />
              </div>
              <div>
                <label htmlFor="species" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Especie <span className="text-red-500">*</span>
                </label>
                <select
                  id="species"
                  name="species"
                  className={`${inputClass(!!fieldErrors.species)} bg-white`}
                  aria-invalid={!!fieldErrors.species}
                >
                  <option value="dog">Perro 🐕</option>
                  <option value="cat">Gato 🐈</option>
                </select>
                <FieldError error={fieldErrors.species} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="breed" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Raza</label>
                <input
                  id="breed"
                  name="breed"
                  type="text"
                  placeholder="Ej: Caniche, Mestizo"
                  className={inputClass(!!fieldErrors.breed)}
                  aria-invalid={!!fieldErrors.breed}
                />
                <FieldError error={fieldErrors.breed} />
                <FieldHint>Si no conoces la raza exacta, puedes escribir &quot;Mestizo&quot;</FieldHint>
              </div>
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Fecha de Nacimiento</label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className={inputClass(!!fieldErrors.date_of_birth)}
                  aria-invalid={!!fieldErrors.date_of_birth}
                />
                <FieldError error={fieldErrors.date_of_birth} />
                <FieldHint>Aproximada si no la conoces exactamente</FieldHint>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Peso (kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  max="500"
                  placeholder="Ej: 5.5"
                  className={inputClass(!!fieldErrors.weight)}
                  aria-invalid={!!fieldErrors.weight}
                />
                <FieldError error={fieldErrors.weight} />
                <FieldHint>El peso actual ayuda a calcular dosis de medicamentos</FieldHint>
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Color/Señas particulares</label>
                <input
                  id="color"
                  name="color"
                  type="text"
                  placeholder="Ej: Blanco con manchas negras"
                  className={inputClass(!!fieldErrors.color)}
                  aria-invalid={!!fieldErrors.color}
                />
                <FieldError error={fieldErrors.color} />
              </div>
            </div>

            {/* Sex and Neutered Status */}
            <div className="p-4 bg-[var(--bg-subtle)] rounded-xl">
              <p className="text-sm font-bold text-[var(--text-secondary)] mb-3">
                Sexo <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sex"
                    value="male"
                    id="male"
                    className="w-5 h-5 text-[var(--primary)] focus:ring-[var(--primary)]"
                    required
                  />
                  <label htmlFor="male" className="font-bold text-gray-600">Macho</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sex"
                    value="female"
                    id="female"
                    className="w-5 h-5 text-[var(--primary)] focus:ring-[var(--primary)]"
                    required
                  />
                  <label htmlFor="female" className="font-bold text-gray-600">Hembra</label>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    name="is_neutered"
                    id="neutered"
                    className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="neutered" className="text-sm font-bold text-gray-500">
                    Castrado/Esterilizado
                  </label>
                </div>
              </div>
              <FieldError error={fieldErrors.sex} />
            </div>
          </div>

          {/* Health & Behavior Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-xs text-[var(--primary)] font-bold">2</span>
              Salud y Comportamiento
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Esta información ayuda al veterinario a brindar mejor atención y evitar problemas durante las consultas.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="temperament" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Temperamento</label>
                <select
                  id="temperament"
                  name="temperament"
                  className={`${inputClass(!!fieldErrors.temperament)} bg-white`}
                  aria-invalid={!!fieldErrors.temperament}
                >
                  <option value="unknown">No estoy seguro</option>
                  <option value="friendly">Amigable - Se lleva bien con todos</option>
                  <option value="shy">Tímido/Miedoso - Se asusta fácilmente</option>
                  <option value="aggressive">Agresivo - Puede morder o arañar</option>
                  <option value="calm">Tranquilo - Muy relajado</option>
                </select>
                <FieldError error={fieldErrors.temperament} />
                <FieldHint>Esto ayuda al veterinario a manejar mejor a tu mascota</FieldHint>
              </div>
              <div>
                <label htmlFor="allergies" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Alergias conocidas</label>
                <input
                  id="allergies"
                  name="allergies"
                  type="text"
                  placeholder="Ej: Pollo, Penicilina, Ninguna"
                  className={inputClass(!!fieldErrors.allergies)}
                  aria-invalid={!!fieldErrors.allergies}
                />
                <FieldError error={fieldErrors.allergies} />
                <FieldHint>Separa múltiples alergias con comas</FieldHint>
              </div>
            </div>

            <div>
              <label htmlFor="existing_conditions" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Condiciones preexistentes</label>
              <textarea
                id="existing_conditions"
                name="existing_conditions"
                className={`${inputClass(!!fieldErrors.existing_conditions)} resize-none`}
                rows={2}
                placeholder="Ej: Hipotiroidismo desde 2022, Displasia de cadera leve..."
                aria-invalid={!!fieldErrors.existing_conditions}
              />
              <FieldError error={fieldErrors.existing_conditions} />
              <FieldHint>Incluye enfermedades crónicas, cirugías anteriores, o cualquier condición médica relevante</FieldHint>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-xs text-[var(--primary)] font-bold">3</span>
              Detalles Adicionales
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Información opcional que puede ser útil para el cuidado de tu mascota.
            </p>

            <div>
              <label htmlFor="microchip_id" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Número de Microchip
              </label>
              <input
                id="microchip_id"
                name="microchip_id"
                type="text"
                placeholder="Ej: 985112012345678"
                className={inputClass(!!fieldErrors.microchip_id)}
                aria-invalid={!!fieldErrors.microchip_id}
              />
              <FieldError error={fieldErrors.microchip_id} />
              <FieldHint>Si tu mascota tiene microchip, el número suele estar en el certificado de implantación</FieldHint>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="diet_category" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Tipo de Dieta</label>
                <select
                  id="diet_category"
                  name="diet_category"
                  className={`${inputClass(!!fieldErrors.diet_category)} bg-white`}
                  aria-invalid={!!fieldErrors.diet_category}
                >
                  <option value="">Seleccionar...</option>
                  <option value="balanced">Balanceado Seco (Croquetas)</option>
                  <option value="wet">Alimento Húmedo (Latas/Sobres)</option>
                  <option value="raw">Dieta BARF / Natural</option>
                  <option value="mixed">Mixta (Balanceado + Natural)</option>
                  <option value="prescription">Prescripción Médica</option>
                </select>
                <FieldError error={fieldErrors.diet_category} />
              </div>
              <div>
                <label htmlFor="diet_notes" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Notas de Dieta</label>
                <input
                  id="diet_notes"
                  name="diet_notes"
                  type="text"
                  placeholder="Ej: Royal Canin Gastrointestinal"
                  className={inputClass(!!fieldErrors.diet_notes)}
                  aria-invalid={!!fieldErrors.diet_notes}
                />
                <FieldError error={fieldErrors.diet_notes} />
                <FieldHint>Marca, tipo específico, o restricciones alimenticias</FieldHint>
              </div>
            </div>
          </div>

          {/* Success tips */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="text-sm text-green-800">
                <p className="font-bold">Consejos para un buen registro:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside text-green-700">
                  <li>Completa todos los campos que conozcas</li>
                  <li>Si no estás seguro de algo, déjalo vacío o pon &quot;No sé&quot;</li>
                  <li>Puedes editar esta información más tarde</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
                <span>Guardando...</span>
              </>
            ) : (
              "Guardar Mascota"
            )}
          </button>

          <p className="text-center text-xs text-[var(--text-muted)]">
            Al guardar, aceptas que esta información sea usada para el cuidado veterinario de tu mascota.
          </p>
        </form>
      </div>
    </div>
  );
}
