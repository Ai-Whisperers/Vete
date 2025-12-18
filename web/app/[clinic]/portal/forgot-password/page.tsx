"use client";

import { useActionState, use, useState } from "react";
import Link from 'next/link';
import * as Icons from "lucide-react";
import { requestPasswordReset } from "@/app/auth/actions";

export default function ForgotPasswordPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = use(params);
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);
  const [submitted, setSubmitted] = useState(false);

  // Show success message after submission
  if (state?.success && !submitted) {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
            <Icons.MailCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
            Revisa tu email
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              href={`/${clinic}/portal/login`}
              className="block w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-center"
            >
              Volver al inicio de sesión
            </Link>

            <button
              onClick={() => setSubmitted(false)}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] hover:underline"
            >
              ¿No recibiste el email? Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--primary)] mb-4">
          <Icons.KeyRound className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Ingresa tu email y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="clinic" value={clinic} />

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            placeholder="tu@email.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:border-2 outline-none transition-all"
          />
        </div>

        {state?.error && (
          <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <Icons.AlertCircle className="w-4 h-4" />
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isPending ? (
            <>
              <Icons.Loader2 className="animate-spin w-5 h-5" />
              Enviando...
            </>
          ) : (
            <>
              <Icons.Mail className="w-5 h-5" />
              Enviar enlace de recuperación
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href={`/${clinic}/portal/login`}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] inline-flex items-center gap-1"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
