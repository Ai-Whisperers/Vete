'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw, MessageCircle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Clinic-scoped error boundary - catches runtime errors within clinic pages
 * Uses clinic theme variables for consistent branding
 */
export default function ClinicError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Clinic page error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-default)] px-4">
      <div className="w-full max-w-lg text-center">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-xl shadow-red-200">
            <AlertTriangle className="h-16 w-16 text-white" />
          </div>
          <div className="absolute -bottom-4 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-black/10 blur-sm" />
        </div>

        {/* Message */}
        <h1 className="mb-3 text-3xl font-bold text-[var(--text-primary)]">Algo salió mal</h1>
        <p className="mx-auto mb-8 max-w-md text-[var(--text-secondary)]">
          Lo sentimos, ocurrió un error inesperado. Puedes intentar recargar la página o volver al
          inicio.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-left">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-red-700">
              Error Details
            </p>
            <p className="break-all font-mono text-sm text-red-600">{error.message}</p>
            {error.digest && <p className="mt-2 text-xs text-red-500">Digest: {error.digest}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="shadow-[var(--primary)]/20 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-5 w-5" />
            Intentar de nuevo
          </button>
          <Link
            href="../"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-bold text-[var(--text-primary)] transition-colors hover:bg-gray-50"
          >
            <Home className="h-5 w-5" />
            Ir al Inicio
          </Link>
        </div>

        {/* Help Text */}
        <div className="bg-[var(--primary)]/5 border-[var(--primary)]/10 mt-12 rounded-xl border p-4">
          <p className="mb-3 text-sm text-[var(--text-secondary)]">
            Si el problema persiste, no dudes en contactarnos.
          </p>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
