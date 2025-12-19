import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Portal-scoped 404 page
 * Shown when a portal resource is not found or user doesn't have access
 */
export default function PortalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="space-y-6">
        <div className="text-6xl">🔍</div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            No encontrado
          </h1>
          <p className="text-[var(--text-secondary)]">
            Esta página no existe o no tienes acceso a ella.
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
            <Link href="/portal">
              <Home className="w-4 h-4 mr-2" />
              Mi Portal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
