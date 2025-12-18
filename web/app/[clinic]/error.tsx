'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Clinic-specific error boundary - uses theme variables
 */
export default function ClinicError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Clinic page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-red-50 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-16 h-16 text-red-400" />
          </div>
        </div>

        {/* Error Info */}
        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-4">
          ¡Algo salió mal!
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          Lo sentimos, ocurrió un error inesperado. Por favor, intenta de nuevo o contacta con nosotros si el problema persiste.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 rounded-xl text-left border border-red-100">
            <p className="text-xs font-bold text-red-600 mb-1">Error:</p>
            <p className="text-xs font-mono text-red-500 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-red-400 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reintentar
          </button>
          <a
            href="./"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--primary)] hover:text-white transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al inicio
          </a>
        </div>

        {/* Contact Support */}
        <p className="mt-8 text-sm text-[var(--text-muted)]">
          ¿Necesitas ayuda?{' '}
          <a
            href="#"
            className="text-[var(--primary)] font-bold hover:underline"
            onClick={(e) => {
              e.preventDefault();
              // This could open WhatsApp or contact modal
              window.history.back();
            }}
          >
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
