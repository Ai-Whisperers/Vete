'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TimeOffActionsProps {
  requestId: string
  clinic: string
}

export function TimeOffActions({ requestId, clinic }: TimeOffActionsProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  const handleAction = async (action: 'approved' | 'rejected'): Promise<void> => {
    setIsLoading(action === 'approved' ? 'approve' : 'reject')

    try {
      const response = await fetch(`/api/dashboard/time-off/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Error al actualizar la solicitud')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction('approved')}
        disabled={isLoading !== null}
        className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
        title="Aprobar"
      >
        {isLoading === 'approve' ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-5 w-5" />
        )}
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={isLoading !== null}
        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        title="Rechazar"
      >
        {isLoading === 'reject' ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
