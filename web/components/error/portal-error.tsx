'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PortalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PortalError({ error, reset }: PortalErrorProps) {
  useEffect(() => {
    console.error('Portal error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 text-center">
      <AlertCircle className="w-16 h-16 text-[var(--primary)]" />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Error al cargar
        </h2>
        <p className="text-[var(--text-secondary)]">
          No pudimos cargar esta página. Intenta de nuevo.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>
    </div>
  )
}
