'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'
import { sendInvoice } from '@/app/actions/invoices'
import { formatCurrency } from '@/lib/types/invoicing'

interface SendInvoiceDialogProps {
  invoiceId: string
  invoiceNumber: string
  total: number
  clientEmail?: string
  clientName?: string
  isOpen: boolean
  onClose: () => void
}

export function SendInvoiceDialog({
  invoiceId,
  invoiceNumber,
  total,
  clientEmail,
  clientName,
  isOpen,
  onClose
}: SendInvoiceDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSend = async () => {
    setLoading(true)
    setError(null)

    const result = await sendInvoice(invoiceId)

    if (!result.success) {
      setError(result.error || 'Error al enviar')
      setLoading(false)
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Enviar Factura
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Invoice Preview */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Factura</span>
              <span className="font-medium">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Recipient */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Enviar a:</p>
            {clientEmail ? (
              <div className="flex items-center gap-2">
                <Icons.Mail className="w-4 h-4 text-[var(--primary)]" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{clientName}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{clientEmail}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <Icons.AlertTriangle className="w-4 h-4" />
                <p className="text-sm">El cliente no tiene email registrado</p>
              </div>
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)]">
            Se enviará un correo electrónico al cliente con los detalles de la factura
            y un enlace para verla en el portal.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !clientEmail}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Icons.Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.Send className="w-4 h-4" />
            )}
            Enviar factura
          </button>
        </div>
      </div>
    </div>
  )
}
