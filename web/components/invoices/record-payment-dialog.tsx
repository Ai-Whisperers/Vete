'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'
import { recordPayment } from '@/app/actions/invoices'
import { formatCurrency, paymentMethodLabels, type PaymentMethod } from '@/lib/types/invoicing'

interface RecordPaymentDialogProps {
  invoiceId: string
  amountDue: number
  isOpen: boolean
  onClose: () => void
}

export function RecordPaymentDialog({ invoiceId, amountDue, isOpen, onClose }: RecordPaymentDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState(amountDue.toString())
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('amount', amount)
    formData.append('payment_method', paymentMethod)
    formData.append('reference_number', referenceNumber)
    formData.append('notes', notes)

    const result = await recordPayment(invoiceId, formData)

    if (!result.success) {
      setError(result.error || 'Error al registrar pago')
      setLoading(false)
      return
    }

    router.refresh()
    onClose()
  }

  const payFullAmount = () => {
    setAmount(amountDue.toString())
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Registrar Pago
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-[var(--text-secondary)]">Saldo pendiente</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {formatCurrency(amountDue)}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Monto a pagar *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={amountDue}
                step="1"
                required
                disabled={loading}
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:border-[var(--primary)] outline-none"
              />
              <button
                type="button"
                onClick={payFullAmount}
                disabled={loading}
                className="px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg"
              >
                Total
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Método de pago *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-[var(--primary)] outline-none"
            >
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Reference Number */}
          {paymentMethod !== 'cash' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Número de referencia
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                disabled={loading}
                placeholder="Número de transacción, cheque, etc."
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-[var(--primary)] outline-none"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-[var(--primary)] outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Icons.Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icons.DollarSign className="w-4 h-4" />
              )}
              Registrar pago
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
