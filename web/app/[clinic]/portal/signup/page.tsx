"use client";

import { useActionState, use } from "react";
import Link from 'next/link';
import * as Icons from "lucide-react";
import { signup } from "@/app/auth/actions";

export default function SignupPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = use(params);
  const [state, formAction, isPending] = useActionState(signup, null);

  if (state?.success) {
      return (
        <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
            <Icons.MailCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black font-heading text-[var(--text-primary)]">¡Cuenta Creada!</h2>
        <p className="text-[var(--text-secondary)] mt-4 mb-2">
            Hemos enviado un correo de confirmación.
        </p>
        <p className="text-sm text-gray-500">
            Revisa tu bandeja de entrada y spam.
        </p>
        <Link 
            href={`/${clinic}/portal/login`}
            className="block mt-8 text-[var(--primary)] font-bold hover:underline"
        >
            Volver al Login
        </Link>
      </div>
      )
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="text-center mb-8">
             <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--primary)] mb-4">
                <Icons.UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">Crear Cuenta</h1>
            <p className="text-[var(--text-secondary)] mt-2">
                Únete para gestionar la salud de tus mascotas.
            </p>
        </div>

        <form action={formAction} className="space-y-4">
            <input type="hidden" name="clinic" value={clinic} />
            
            <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Nombre Completo</label>
                <div className="relative">
                    <Icons.User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input 
                        id="fullName"
                        name="fullName"
                        required 
                        type="text" 
                        placeholder="Juan Pérez"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:border-2 outline-none transition-all"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="signup-email" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Email</label>
                <div className="relative">
                    <Icons.Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input 
                        id="signup-email"
                        name="email"
                        required 
                        type="email" 
                        placeholder="tu@email.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:border-2 outline-none transition-all"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="signup-password" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Contraseña</label>
                <div className="relative">
                    <Icons.Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input 
                        id="signup-password"
                        name="password"
                        required 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:border-2 outline-none transition-all"
                    />
                </div>
            </div>
            
            {state?.error && (
                <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <Icons.AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {state.error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
                {isPending ? <Icons.Loader2 className="animate-spin w-5 h-5"/> : "Registrarme"}
            </button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
                ¿Ya tienes cuenta?{' '}
                <Link href={`/${clinic}/portal/login`} className="font-bold text-[var(--primary)] hover:underline">
                    Inicia Sesión
                </Link>
            </p>
        </div>
    </div>
  );
}
