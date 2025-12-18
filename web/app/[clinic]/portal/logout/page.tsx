"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const { clinic } = useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const supabase = createClient();

    const doLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error);
          setStatus("error");
          return;
        }
        setStatus("success");
        // Short delay to show success message
        setTimeout(() => {
          router.push(`/${clinic}/portal/login`);
        }, 1500);
      } catch (err) {
        console.error("Logout error:", err);
        setStatus("error");
      }
    };

    doLogout();
  }, [router, clinic]);

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--primary)] mb-4">
              <Icons.Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
              Cerrando sesión...
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Espera un momento mientras cerramos tu sesión de forma segura.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
              <Icons.CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
              Sesión cerrada
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Tu sesión ha sido cerrada correctamente. Redirigiendo...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-4">
              <Icons.AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black font-heading text-[var(--text-primary)]">
              Error al cerrar sesión
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 mb-4">
              Hubo un problema al cerrar tu sesión. Por favor intenta de nuevo.
            </p>
            <button
              onClick={() => router.push(`/${clinic}/portal/login`)}
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
            >
              Ir al inicio de sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
