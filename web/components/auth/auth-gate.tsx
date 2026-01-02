"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, User, Lock, MessageCircle, Loader2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

interface AuthGateProps {
  clinic: string;
  /** Current path to redirect to after login */
  redirect: string;
  /** WhatsApp number for direct contact option */
  whatsappNumber?: string;
  /** Title shown when not authenticated */
  title?: string;
  /** Description shown when not authenticated */
  description?: string;
  /** Icon to show (defaults to Lock) */
  icon?: "cart" | "user" | "lock";
  /** Content to show when authenticated */
  children: React.ReactNode;
  /** Optional preview content to show below the auth gate */
  preview?: React.ReactNode;
}

const ICONS = {
  cart: ShoppingCart,
  user: User,
  lock: Lock,
};

export function AuthGate({
  clinic,
  redirect: redirectTo,
  whatsappNumber,
  title = "Inicia sesión para continuar",
  description = "Necesitas una cuenta para acceder a esta función.",
  icon = "lock",
  children,
  preview,
}: AuthGateProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.warn('AuthGate session error', {
            error: error.message,
            context: 'AuthGate'
          });
        }
        setUser(session?.user ?? null);
      } catch (err) {
        logger.error('AuthGate failed to get session', {
          error: err instanceof Error ? err.message : 'Unknown',
          context: 'AuthGate'
        });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  // Authenticated - show children
  if (user) {
    return <>{children}</>;
  }

  // Not authenticated - show gate
  const Icon = ICONS[icon];
  const encodedRedirect = encodeURIComponent(redirectTo);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{title}</h2>
          <p className="text-white/80">{description}</p>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-4">
          <Link
            href={`/${clinic}/portal/signup?redirect=${encodedRedirect}`}
            className="block w-full py-4 px-6 bg-[var(--primary)] text-white font-bold rounded-xl text-center hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Crear Cuenta Gratis
          </Link>

          <Link
            href={`/${clinic}/portal/login?redirect=${encodedRedirect}`}
            className="block w-full py-4 px-6 bg-gray-100 text-gray-700 font-bold rounded-xl text-center hover:bg-gray-200 transition-all"
          >
            Ya tengo cuenta
          </Link>

          {/* WhatsApp Option */}
          {whatsappNumber && (
            <>
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">
                  O sin cuenta
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quiero hacer una consulta sobre productos/servicios")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
              <p className="text-center text-xs text-gray-400">
                La clínica puede crear tu cuenta y registrar tus mascotas por ti
              </p>
            </>
          )}
        </div>
      </div>

      {/* Preview Content */}
      {preview && (
        <div className="mt-8 w-full max-w-2xl opacity-60 pointer-events-none">
          <p className="text-center text-sm text-gray-500 mb-4 font-medium">
            Vista previa de tu carrito:
          </p>
          {preview}
        </div>
      )}
    </div>
  );
}
