'use client'

import { AlertCircle } from 'lucide-react'
import type { PreviewResult } from './types'

interface ReviewStepProps {
  previewResult: PreviewResult
  showOnlyErrors: boolean
  onShowOnlyErrorsChange: (show: boolean) => void
}

export function ReviewStep({
  previewResult,
  showOnlyErrors,
  onShowOnlyErrorsChange,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Revisar Cambios</h3>
        <p className="text-sm text-gray-500">
          Verifica los cambios antes de confirmar la importación
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {previewResult.summary.totalRows}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="rounded-xl bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {previewResult.summary.newProducts}
          </div>
          <div className="text-xs text-gray-500">Nuevos</div>
        </div>
        <div className="rounded-xl bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {previewResult.summary.updates}
          </div>
          <div className="text-xs text-gray-500">Actualizaciones</div>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {previewResult.summary.adjustments}
          </div>
          <div className="text-xs text-gray-500">Ajustes</div>
        </div>
        <div className="rounded-xl bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {previewResult.summary.errors}
          </div>
          <div className="text-xs text-gray-500">Errores</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {previewResult.summary.skipped}
          </div>
          <div className="text-xs text-gray-500">Omitidos</div>
        </div>
      </div>

      {/* Filter Bar */}
      {previewResult.summary.errors > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">
              {previewResult.summary.errors} error
              {previewResult.summary.errors > 1 ? 'es' : ''} encontrado
              {previewResult.summary.errors > 1 ? 's' : ''}
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyErrors}
              onChange={(e) => onShowOnlyErrorsChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-red-700">Mostrar solo errores</span>
          </label>
        </div>
      )}

      {/* Preview Table */}
      <div className="overflow-hidden rounded-xl border">
        <div className="max-h-[300px] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                  Fila
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                  Estado
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                  SKU
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                  Nombre
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                  Stock
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-gray-400">
                  Mensaje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {previewResult.preview
                .filter((row) => !showOnlyErrors || row.status === 'error')
                .map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      row.status === 'error'
                        ? 'bg-red-50'
                        : row.status === 'skip'
                          ? 'bg-gray-50 opacity-60'
                          : ''
                    }
                  >
                    <td className="px-3 py-2 font-mono text-gray-500">{row.rowNumber}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-2 font-mono">{row.sku || '—'}</td>
                    <td className="max-w-[200px] truncate px-3 py-2">{row.name || '—'}</td>
                    <td className="px-3 py-2">
                      {row.currentStock !== undefined && row.newStock !== undefined ? (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">{row.currentStock}</span>
                          <span className="text-gray-300">→</span>
                          <span
                            className={
                              row.newStock > row.currentStock
                                ? 'font-medium text-green-600'
                                : 'font-medium text-red-600'
                            }
                          >
                            {row.newStock}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-gray-500">
                      {row.message}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    adjustment: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    skip: 'bg-gray-100 text-gray-500',
  }

  const labels: Record<string, string> = {
    new: 'Nuevo',
    update: 'Actualizar',
    adjustment: 'Ajuste',
    error: 'Error',
    skip: 'Omitir',
  }

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
