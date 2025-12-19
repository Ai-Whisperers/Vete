'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface PublicErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 text-center">
      <h2 className="text-lg font-medium text-[var(--text-primary)]">
        Error al cargar el contenido
      </h2>
      <Button onClick={reset} size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Reintentar
      </Button>
    </div>
  )
}
