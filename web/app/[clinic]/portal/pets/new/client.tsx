"use client";

import { useActionState } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { createPet } from "@/app/actions/create-pet";
import Link from "next/link";
import { PhotoUpload } from "@/components/pets/photo-upload";

export default function NewPetClient({ params }: { params: { clinic: string } }) {
  const [state, formAction, isPending] = useActionState(createPet, null);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${params.clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-white transition-colors" aria-label="Volver al dashboard">
          <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
        </Link>
        <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Nueva Mascota</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="clinic" value={params.clinic} />

          {/* Photo Upload */}
          <PhotoUpload
            name="photo"
            placeholder="Subir foto"
            shape="circle"
            size={128}
            maxSizeMB={5}
          />

          {/* Form fields omitted for brevity */}

          {state && !state.success && (
            <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin w-5 h-5"/> : "Guardar Mascota"}
          </button>
        </form>
      </div>
    </div>
  );
}
