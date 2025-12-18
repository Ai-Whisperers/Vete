"use client";

import { useActionState, use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { updatePassword } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ clinic: string }>;
}) {
  const { clinic } = use(params);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updatePassword, null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // User should have a session from the recovery link
      setIsValidSession(!!session);
    };

    checkSession();
  }, []);

  useEffect(() => {
    // Redirect to login on success after a short delay
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push(`/${clinic}/portal/login`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, clinic, router]);

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <Icons.Loader2 className="animate-spin w-8 h-8 text-[var(--primary)] mb-4" />
          <p className="text-[var(--text-secondary)]">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
            <Icons.XCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
            Enlace Inválido
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            El enlace para restablecer tu contraseña ha expirado o es inválido.
            Por favor solicita uno nuevo.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/${clinic}/portal/forgot-password`}
            className="block w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-center"
          >
            Solicitar Nuevo Enlace
          </Link>

          <Link
            href={`/${clinic}/portal/login`}
            className="block w-full bg-gray-100 text-[var(--text-primary)] font-bold py-4 rounded-xl hover:bg-gray-200 transition-all text-center"
          >
            Volver al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--primary)] mb-4">
          <Icons.ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
          Nueva Contraseña
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
        </p>
      </div>

      {state?.success ? (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3">
            <Icons.CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Contraseña actualizada</p>
              <p className="text-sm mt-1">
                Tu contraseña ha sido cambiada exitosamente. Serás redirigido al
                login en unos segundos...
              </p>
            </div>
          </div>

          <Link
            href={`/${clinic}/portal/login`}
            className="block w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-center"
          >
            Ir al Login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-[var(--text-secondary)] mb-1"
            >
              Nueva Contraseña
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
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold text-[var(--text-secondary)] mb-1"
            >
              Confirmar Contraseña
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

          <div className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
            <Icons.Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              La contraseña debe tener al menos 8 caracteres. Recomendamos usar
              una combinación de letras, números y símbolos.
            </span>
          </div>

          {state?.error && (
            <div
              role="alert"
              className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"
            >
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
              <Icons.Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                <Icons.Check className="w-5 h-5" />
                Cambiar Contraseña
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href={`/${clinic}/portal/login`}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] inline-flex items-center gap-1"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Volver al Login
        </Link>
      </div>
    </div>
  );
}
