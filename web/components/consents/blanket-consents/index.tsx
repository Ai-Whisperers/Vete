'use client'

import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Plus } from 'lucide-react'
import ConsentCard from './consent-card'
import AddConsentModal from './add-consent-modal'
import type { BlanketConsent } from './types'

interface BlanketConsentsProps {
  petId: string
  ownerId: string
  onUpdate?: () => void
}

export default function BlanketConsents({
  petId,
  ownerId,
  onUpdate,
}: BlanketConsentsProps): JSX.Element {
  const [consents, setConsents] = useState<BlanketConsent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchConsents()
  }, [petId, ownerId])

  const fetchConsents = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/consents/blanket?pet_id=${petId}&owner_id=${ownerId}`)
      if (!response.ok) {
        throw new Error('Error al cargar consentimientos permanentes')
      }

      const data = await response.json()
      setConsents(data)
    } catch {
      // Error fetching blanket consents - silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: {
    consent_type: string
    scope: string
    conditions: string
    signature_data: string
    expires_at: string
  }): Promise<void> => {
    const response = await fetch('/api/consents/blanket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pet_id: petId,
        owner_id: ownerId,
        ...data,
        conditions: data.conditions || null,
        expires_at: data.expires_at || null,
      }),
    })

    if (!response.ok) {
      throw new Error('Error al crear consentimiento permanente')
    }

    await fetchConsents()

    if (onUpdate) {
      onUpdate()
    }
  }

  const handleRevoke = async (consentId: string): Promise<void> => {
    const reason = prompt('Motivo de revocación (opcional):')
    if (reason === null) return

    try {
      const response = await fetch('/api/consents/blanket', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: consentId,
          action: 'revoke',
          reason,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al revocar consentimiento')
      }

      await fetchConsents()

      if (onUpdate) {
        onUpdate()
      }
    } catch {
      alert('Error al revocar el consentimiento')
    }
  }

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      emergency_treatment: 'Tratamiento de Emergencia',
      routine_procedures: 'Procedimientos de Rutina',
      vaccination: 'Vacunación',
      diagnostic_tests: 'Pruebas Diagnósticas',
      grooming: 'Peluquería',
      boarding: 'Hospedaje',
      other: 'Otro',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--primary)]"></div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Consentimientos Permanentes
          </h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>

      {consents.length === 0 ? (
        <div className="border-[var(--primary)]/20 rounded-lg border bg-[var(--bg-paper)] p-8 text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">
            No hay consentimientos permanentes registrados
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Agregar primer consentimiento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {consents.map((consent) => (
            <ConsentCard
              key={consent.id}
              consent={consent}
              onRevoke={handleRevoke}
              getTypeLabel={getTypeLabel}
            />
          ))}
        </div>
      )}

      <AddConsentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
      />
    </div>
  )
}
