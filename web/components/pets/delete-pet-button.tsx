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
        className="w-full text-red-500 hover:text-red-700 font-bold py-3 rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors flex justify-center items-center gap-2"
      >
        <Icons.Trash2 className="w-4 h-4" />
        Eliminar Mascota
      </button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="bg-red-100 p-2 rounded-full">
          <Icons.AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h4 className="font-bold text-red-900">¿Eliminar a {petName}?</h4>
          <p className="text-sm text-red-700">
            Esta acción no se puede deshacer. Se eliminarán todos los registros asociados.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
        >
          {isPending ? (
            <Icons.Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <>
              <Icons.Trash2 className="w-4 h-4" />
              Sí, Eliminar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
