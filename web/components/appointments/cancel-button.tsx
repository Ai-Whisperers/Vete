'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { cancelAppointment } from '@/app/actions/appointments'

interface CancelButtonProps {
  appointmentId: string
  onSuccess?: () => void
  variant?: 'button' | 'icon' | 'text'
  className?: string
}

export function CancelButton({
  appointmentId,
  onSuccess,
  variant = 'text',
  className = ''
}: CancelButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    setLoading(true)
    setError(null)

    const result = await cancelAppointment(appointmentId, reason || undefined)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setShowDialog(false)
      setReason('')
      onSuccess?.()
    }
  }

  function handleClose() {
    if (!loading) {
      setShowDialog(false)
      setReason('')
      setError(null)
    }
  }

  const buttonContent = {
    button: (
      <button
        onClick={() => setShowDialog(true)}
        className={`px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2 ${className}`}
      >
        <Icons.X className="w-4 h-4" />
        Cancelar Cita
      </button>
    ),
    icon: (
      <button
        onClick={() => setShowDialog(true)}
        className={`p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all ${className}`}
        title="Cancelar cita"
      >
        <Icons.X className="w-5 h-5" />
      </button>
    ),
    text: (
      <button
        onClick={() => setShowDialog(true)}
        className={`text-red-600 hover:text-red-800 text-sm font-medium hover:underline ${className}`}
      >
        Cancelar
      </button>
    )
  }

  return (
    <>
      {buttonContent[variant]}

      {showDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Cancelar Cita
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Motivo de cancelación (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Cambio de planes, emergencia, etc."
                className="w-full p-4 border border-gray-200 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                rows={3}
                disabled={loading}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                  <Icons.AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-[var(--text-secondary)] font-bold rounded-xl hover:bg-gray-50 transition-all"
                disabled={loading}
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Icons.X className="w-4 h-4" />
                    Confirmar Cancelación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
