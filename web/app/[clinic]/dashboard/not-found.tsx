import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
          <Button variant="outline" asChild>
            <Link href="..">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
