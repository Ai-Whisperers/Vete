"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary - catches runtime errors across the app
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-200">
            <AlertTriangle className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/10 rounded-full blur-sm" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Algo salió mal
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Lo sentimos, ocurrió un error inesperado.
          Puedes intentar recargar la página o volver al inicio.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 bg-red-100 border border-red-200 rounded-xl text-left">
            <p className="text-xs font-bold text-red-700 mb-1 uppercase tracking-wider">
              Error Details
            </p>
            <p className="text-sm text-red-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
          >
            <RefreshCw className="w-5 h-5" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-12 text-sm text-gray-400">
          Si el problema persiste, contacta con soporte técnico.
        </p>
      </div>
    </div>
  );
}
