"use client";

import { useActionState, use, useEffect, useState } from "react";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import * as Icons from "lucide-react";
import { login } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Support both 'redirect' (standardized) and 'returnTo' (legacy) parameters
  const redirectTo = searchParams.get('redirect') ?? searchParams.get('returnTo') ?? `/${clinic}/portal/dashboard`;
  const [state, formAction, isPending] = useActionState(login, null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // User is already authenticated, redirect to dashboard
        router.replace(redirectTo);
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
        }
    });
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="max-w-md mx-auto mt-4 sm:mt-8 md:mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Icons.Loader2 className="animate-spin w-8 h-8 text-[var(--primary)] mb-4" />
          <p className="text-[var(--text-secondary)]">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-4 sm:mt-8 md:mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--primary)] mb-4">
                <Icons.Lock className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-heading text-[var(--text-primary)]">Portal de Dueños</h1>
            <p className="text-[var(--text-secondary)] mt-2">
                Ingresa para ver la libreta de tus mascotas.
            </p>
        </div>

        <div className="space-y-4">
            {/* Google Button */}
            <button
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 min-h-[48px] rounded-xl hover:bg-gray-50 transition-colors flex justify-center items-center gap-3 relative"
            >
                {/* Google Icon SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">O con email</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form action={formAction} className="space-y-4">
                <input type="hidden" name="clinic" value={clinic} />
                <input type="hidden" name="redirect" value={redirectTo} />
                <div>
                   <label htmlFor="email" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Email</label>
                   <input
                        id="email"
                        name="email"
                        required
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 min-h-[48px] rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:border-2 outline-none transition-all"
                    />
                </div>
                <div>
                   <label htmlFor="password" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Contraseña</label>
                   <PasswordInput
                        id="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        error={!!state?.error}
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
                    className="w-full bg-[var(--primary)] text-white font-bold py-4 min-h-[52px] rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                    {isPending ? <Icons.Loader2 className="animate-spin w-5 h-5"/> : "Iniciar Sesión"}
                </button>

                <div className="text-center">
                    <Link
                        href={`/${clinic}/portal/forgot-password`}
                        className="text-sm text-[var(--primary)] hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </form>
        </div>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
                ¿No tienes cuenta?{' '}
                <Link
                    href={`/${clinic}/portal/signup${redirectTo !== `/${clinic}/portal/dashboard` ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="font-bold text-[var(--primary)] hover:underline"
                >
                    Regístrate
                </Link>
            </p>
        </div>
    </div>
  );
}
