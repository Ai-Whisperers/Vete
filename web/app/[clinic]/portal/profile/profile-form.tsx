"use client";

import { useActionState } from "react";
import * as Icons from "lucide-react";
import { updateProfile } from "@/app/actions/update-profile";

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="bg-[var(--primary)] text-white font-bold py-3 px-6 sm:px-8 min-h-[48px] rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
    >
      {isPending ? (
        <Icons.Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <Icons.Save className="w-5 h-5" />
      )}
      Guardar Cambios
    </button>
  );
}

interface ProfileFormProps {
  clinic: string;
  profile: any; // Using any for simplicity as I don't have the Profile type definition handy, but ideally should be imported
  success?: boolean;
}

export function ProfileForm({ clinic, profile, success }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8">
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
          <Icons.CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">¡Perfil actualizado correctamente!</span>
        </div>
      )}

      {state && !state.success && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
          <Icons.AlertCircle className="w-5 h-5" />
          <span className="font-bold">{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="clinic" value={clinic} />

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-2xl sm:text-3xl flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full rounded-full object-cover"
                alt=""
              />
            ) : (
              profile?.full_name?.[0] || (
                <Icons.User className="w-8 h-8 sm:w-10 sm:h-10" />
              )
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 break-all">
              {profile?.email}
            </h3>
            <span className="inline-block px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold rounded-full uppercase mt-1">
              {profile?.role === "owner" ? "Propietario" : profile?.role}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">
              Nombre Completo
            </label>
            <input
              name="full_name"
              defaultValue={profile?.full_name || ""}
              className={`w-full p-3 min-h-[48px] rounded-xl border focus:border-[var(--primary)] outline-none font-bold text-gray-700 ${
                state && !state.success && state.fieldErrors?.full_name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {state && !state.success && state.fieldErrors?.full_name && (
              <p className="text-red-500 text-sm mt-1">{state.fieldErrors.full_name}</p>
            )}
          </div>
          {/* Empty col for spacing or future use */}
          <div className="hidden md:block"></div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">
              Teléfono Principal
            </label>
            <input
              name="phone"
              defaultValue={profile?.phone || ""}
              placeholder="+595 9..."
              className={`w-full p-3 min-h-[48px] rounded-xl border focus:border-[var(--primary)] outline-none font-bold text-gray-700 ${
                state && !state.success && state.fieldErrors?.phone ? "border-red-300" : "border-gray-200"
              }`}
            />
            {state && !state.success && state.fieldErrors?.phone && (
               <p className="text-red-500 text-sm mt-1">{state.fieldErrors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">
              Teléfono Secundario
            </label>
            <input
              name="secondary_phone"
              defaultValue={profile?.secondary_phone || ""}
              placeholder="Opcional"
              className={`w-full p-3 min-h-[48px] rounded-xl border focus:border-[var(--primary)] outline-none font-bold text-gray-700 ${
                 state && !state.success && state.fieldErrors?.secondary_phone ? "border-red-300" : "border-gray-200"
              }`}
            />
             {state && !state.success && state.fieldErrors?.secondary_phone && (
               <p className="text-red-500 text-sm mt-1">{state.fieldErrors.secondary_phone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-500 mb-2">
              Dirección
            </label>
            <input
              name="address"
              defaultValue={profile?.address || ""}
              placeholder="Calle Principal 123"
              className={`w-full p-3 min-h-[48px] rounded-xl border focus:border-[var(--primary)] outline-none font-bold text-gray-700 ${
                 state && !state.success && state.fieldErrors?.address ? "border-red-300" : "border-gray-200"
              }`}
            />
             {state && !state.success && state.fieldErrors?.address && (
               <p className="text-red-500 text-sm mt-1">{state.fieldErrors.address}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-500 mb-2">
              Ciudad / Barrio
            </label>
            <input
              name="city"
              defaultValue={profile?.city || ""}
              placeholder="Asunción"
              className={`w-full p-3 min-h-[48px] rounded-xl border focus:border-[var(--primary)] outline-none font-bold text-gray-700 ${
                 state && !state.success && state.fieldErrors?.city ? "border-red-300" : "border-gray-200"
              }`}
            />
             {state && !state.success && state.fieldErrors?.city && (
               <p className="text-red-500 text-sm mt-1">{state.fieldErrors.city}</p>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-center sm:justify-end">
          <SubmitButton isPending={isPending} />
        </div>
      </form>
    </div>
  );
}
