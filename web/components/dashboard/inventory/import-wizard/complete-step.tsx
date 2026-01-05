'use client'

import { Check, AlertCircle } from 'lucide-react'
import type { ImportResult } from './types'

interface CompleteStepProps {
  importResult: ImportResult
}

export function CompleteStep({ importResult }: CompleteStepProps) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">Importación Completada</h3>
      <p className="mb-6 text-gray-500">
        Se procesaron <strong>{importResult.success}</strong> registros exitosamente
      </p>

      {importResult.errors.length > 0 && (
        <div className="mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
          <div className="mb-2 flex items-center gap-2 font-medium text-amber-700">
            <AlertCircle className="h-4 w-4" />
            Observaciones ({importResult.errors.length})
          </div>
          <ul className="max-h-32 list-inside list-disc space-y-1 overflow-y-auto text-sm text-amber-600">
            {importResult.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
