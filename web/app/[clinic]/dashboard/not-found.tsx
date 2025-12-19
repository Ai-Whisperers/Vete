import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

/**
 * Dashboard-scoped 404 page
 * Shown when a dashboard resource is not found or user doesn't have access
 */
export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="space-y-6">
        <div className="text-6xl">📋</div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Página no encontrada
          </h1>
          <p className="text-[var(--text-secondary)]">
            Esta sección no existe o fue movida.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href=".."
            className="inline-flex items-center justify-center px-5 py-3 text-base font-bold rounded-xl gap-2 border border-[var(--border,#e5e7eb)] bg-[var(--bg-paper)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-3 text-base font-bold rounded-xl gap-2 bg-[var(--primary)] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
