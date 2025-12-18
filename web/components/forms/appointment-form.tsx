"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendEmail } from "@/app/actions/send-email";
import * as Icons from "lucide-react";

// Submit Button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
 
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-2"
    >
      {pending ? (
        <>
            <Icons.Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
        </>
      ) : (
        <>
            Confirmar Solicitud <Icons.Send className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

export function AppointmentForm() {
    const [state, formAction] = useActionState(sendEmail, null);

  if (state?.success) {
    return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">¡Solicitud Enviada!</h3>
            <p className="text-green-700">{state.message}</p>
            <button 
                onClick={() => window.location.reload()}
                className="mt-6 text-sm font-bold text-green-800 hover:underline"
            >
                Enviar otra solicitud
            </button>
        </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-8">
        <h3 className="text-2xl font-heading font-black text-[var(--text-primary)] mb-2">
            Agendar Cita
        </h3>
        <p className="text-[var(--text-secondary)]">
            Déjanos tus datos y te confirmaremos el horario por WhatsApp.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Tu Nombre</label>
            <div className="relative">
                <Icons.User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                    name="name" 
                    type="text" 
                    required 
                    placeholder="Ej: Juan Pérez"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Teléfono</label>
                <div className="relative">
                    <Icons.Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input 
                        name="phone" 
                        type="tel" 
                        required 
                        placeholder="0981..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Mascota</label>
                <div className="relative">
                    <Icons.Dog className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input 
                        name="petName" 
                        type="text" 
                        required 
                        placeholder="Ej: Firulais"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                    />
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Motivo</label>
            <div className="relative">
                <textarea 
                    name="reason" 
                    required 
                    placeholder="Ej: Vacunación anual y corte de uñas..."
                    rows={3}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all resize-none"
                />
            </div>
        </div>

        <SubmitButton />
        
        <p className="text-xs text-center text-gray-400 mt-4">
            Al enviar, aceptas ser contactado por la clínica.
        </p>
      </form>
    </div>
  );
}
