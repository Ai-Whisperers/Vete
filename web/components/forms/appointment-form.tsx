"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendEmail } from "@/app/actions/send-email";
import { Check, Loader2, Send, User, Phone, Dog, MessageSquare } from "lucide-react";

// Submit Button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none disabled:transform-none flex justify-center items-center gap-3"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          Confirmar Solicitud
          <Send className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

export function AppointmentForm() {
  const [state, formAction] = useActionState(sendEmail, null);

  if (state?.success) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">¡Solicitud Enviada!</h3>
        <p className="text-green-700">{state.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 text-sm font-bold text-green-800 hover:text-green-900 hover:underline transition-colors"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[var(--shadow-card)] border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-heading font-black text-[var(--text-primary)] mb-2">
          Agendar Cita
        </h3>
        <p className="text-[var(--text-secondary)] text-sm">
          Déjanos tus datos y te confirmaremos el horario por WhatsApp.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
            Tu Nombre
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <input
              name="name"
              type="text"
              required
              placeholder="Ej: Juan Pérez"
              className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-[var(--text-primary)] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Phone and Pet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
                <Phone className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <input
                name="phone"
                type="tel"
                required
                placeholder="0981..."
                className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-[var(--text-primary)] placeholder:text-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
              Mascota
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
                <Dog className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <input
                name="petName"
                type="text"
                required
                placeholder="Ej: Firulais"
                className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all text-[var(--text-primary)] placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Reason Field */}
        <div>
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
            Motivo de la Consulta
          </label>
          <div className="relative">
            <div className="absolute left-4 top-4 w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <textarea
              name="reason"
              required
              placeholder="Ej: Vacunación anual y corte de uñas..."
              rows={3}
              className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all resize-none text-[var(--text-primary)] placeholder:text-gray-400"
            />
          </div>
        </div>

        <SubmitButton />

        <p className="text-xs text-center text-[var(--text-muted)] pt-2">
          Al enviar, aceptas ser contactado por la clínica.
        </p>
      </form>
    </div>
  );
}
