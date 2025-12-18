"use client";

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { inviteClient } from '@/app/actions/invite-client';
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
  MessageCircle
} from 'lucide-react';
import type { ClinicConfig } from '@/lib/clinics';

interface Props {
  clinic: string;
  config: ClinicConfig;
}

export default function InviteClientForm({ clinic, config }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(inviteClient, null);
  const [showPetSection, setShowPetSection] = useState(false);

  // Success redirect
  if (state?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Cliente Registrado
        </h2>
        <p className="text-green-700 mb-6">
          El cliente recibirá un correo para completar su cuenta.
          Puedes enviarle el enlace de registro por WhatsApp también.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push(`/${clinic}/dashboard/clients`)}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            Ver Directorio
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl border-2 border-green-200 hover:bg-green-50 transition-colors"
          >
            Agregar Otro Cliente
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="clinic" value={clinic} />

      {/* Client Info Section */}
      <div className="bg-[var(--bg-default)] rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-[var(--primary)]" />
          Información del Cliente
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Nombre Completo *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Juan Pérez"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="cliente@email.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
              />
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              El cliente recibirá un correo para activar su cuenta
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
              Teléfono / WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0981 123 456"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pet Info Section (Collapsible) */}
      <div className="bg-[var(--bg-default)] rounded-2xl shadow-md overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPetSection(!showPetSection)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-lg font-bold text-[var(--text-primary)]">
              Agregar Mascota (Opcional)
            </span>
          </div>
          {showPetSection ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {showPetSection && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-6 space-y-4">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Puedes agregar la mascota del cliente ahora o hacerlo después desde su perfil.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="petName" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Nombre de la Mascota
                </label>
                <input
                  id="petName"
                  name="petName"
                  type="text"
                  placeholder="Max"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="petSpecies" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Especie
                </label>
                <select
                  id="petSpecies"
                  name="petSpecies"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all bg-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                  <option value="bird">Ave</option>
                  <option value="rabbit">Conejo</option>
                  <option value="rodent">Roedor</option>
                  <option value="reptile">Reptil</option>
                  <option value="fish">Pez</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="petBreed" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Raza
                </label>
                <input
                  id="petBreed"
                  name="petBreed"
                  type="text"
                  placeholder="Golden Retriever"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="petSex" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Sexo
                </label>
                <select
                  id="petSex"
                  name="petSex"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all bg-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                </select>
              </div>

              <div>
                <label htmlFor="petWeight" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Peso (kg)
                </label>
                <input
                  id="petWeight"
                  name="petWeight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="5.5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="petNotes" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Notas / Observaciones
              </label>
              <textarea
                id="petNotes"
                name="petNotes"
                rows={3}
                placeholder="Alergias, condiciones, temperamento, etc."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Tip */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
        <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">
            Tip: Enviar enlace por WhatsApp
          </p>
          <p className="text-sm text-green-700">
            Después de registrar al cliente, puedes enviarle el enlace de registro
            directamente por WhatsApp para que active su cuenta más rápido.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{state.error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 px-6 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Registrando...
          </>
        ) : (
          <>
            <User className="h-5 w-5" />
            Registrar Cliente
          </>
        )}
      </button>
    </form>
  );
}
