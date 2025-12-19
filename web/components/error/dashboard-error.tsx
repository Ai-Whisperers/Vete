'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Dashboard error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Algo salió mal
        </h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          Ocurrió un error al cargar esta página. Por favor intenta de nuevo.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-500 font-mono mt-2">
            {error.message}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Intentar de nuevo
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Ir al inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
