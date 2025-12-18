"use client";

import { useActionState, use, useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Icons from "lucide-react";
import { updatePassword } from "@/app/auth/actions";

export default function ResetPasswordPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = use(params);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updatePassword, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to login on success
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push(`/${clinic}/portal/login`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, clinic, router]);

  if (state?.success) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
            <Icons.CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
            Contraseña actualizada
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión.
          </p>

          <div className="mt-8">
            <Link
              href={`/${clinic}/portal/login`}
              className="block w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-center"
            >
              Iniciar sesión ahora
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
            <Icons.Loader2 className="w-4 h-4 animate-spin" />
            Redirigiendo en 3 segundos...
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
          Nueva contraseña
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              required
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              minLength={8}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:border-2 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <Icons.EyeOff className="w-5 h-5" />
              ) : (
                <Icons.Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              required
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              minLength={8}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:border-2 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <Icons.EyeOff className="w-5 h-5" />
              ) : (
                <Icons.Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {state?.error && (
          <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <Icons.AlertCircle className="w-4 h-4" />
            {state.error}
          </div>
        )}

        <div className="text-xs text-[var(--text-secondary)] bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">La contraseña debe:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Tener al menos 8 caracteres</li>
            <li>Incluir letras y números (recomendado)</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isPending ? (
            <>
              <Icons.Loader2 className="animate-spin w-5 h-5" />
              Actualizando...
            </>
          ) : (
            <>
              <Icons.Check className="w-5 h-5" />
              Actualizar contraseña
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
