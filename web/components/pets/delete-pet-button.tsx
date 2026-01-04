'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'
import { deletePet } from '@/app/actions/pets'

interface Props {
  petId: string
  petName: string
  clinic: string
}

export function DeletePetButton({ petId, petName, clinic }: Props): React.ReactElement {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(): Promise<void> {
    setError(null)

    startTransition(async () => {
      const result = await deletePet(petId)

      if (!result.success) {
        setError(result.error)
        setShowConfirm(false)
      } else {
        router.push(`/${clinic}/portal/dashboard`)
        router.refresh()
      }
    })
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 py-3 font-bold text-red-500 transition-colors hover:border-red-300 hover:text-red-700"
      >
        <Icons.Trash2 className="h-4 w-4" />
        Eliminar Mascota
      </button>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-100 p-2">
          <Icons.AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h4 className="font-bold text-red-900">¿Eliminar a {petName}?</h4>
          <p className="text-sm text-red-700">
            Esta acción no se puede deshacer. Se eliminarán todos los registros asociados.
          </p>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-100 p-2 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 font-bold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700"
        >
          {isPending ? (
            <Icons.Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Icons.Trash2 className="h-4 w-4" />
              Sí, Eliminar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
