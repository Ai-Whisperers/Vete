'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'
import { sendMessage } from '@/app/actions/whatsapp'
import { formatParaguayPhone } from '@/lib/types/whatsapp'

interface QuickSendProps {
  isOpen: boolean
  onClose: () => void
  defaultPhone?: string
  clientName?: string
  clientId?: string
  petId?: string
}

export function QuickSend({
  isOpen,
  onClose,
  defaultPhone = '',
  clientName,
  clientId,
  petId,
}: QuickSendProps) {
  const router = useRouter()
  const [phone, setPhone] = useState(defaultPhone)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!phone.trim() || !message.trim()) return

    setSending(true)
    setError(null)

    const formData = new FormData()
    formData.append('phone', phone)
    formData.append('message', message)
    if (clientId) formData.append('clientId', clientId)
    if (petId) formData.append('petId', petId)
    formData.append('conversationType', 'general')

    const result = await sendMessage(formData)

    setSending(false)

    if (result.success) {
      setPhone('')
      setMessage('')
      onClose()
      router.refresh()
    } else {
      setError(result.error || 'Error al enviar mensaje')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Envío Rápido
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Phone input */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Número de WhatsApp
            </label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                +595
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9XX XXX XXX"
                className="w-full pl-14 pr-4 py-2 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              />
            </div>
            {phone && (
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Se enviará a: {formatParaguayPhone(phone)}
              </p>
            )}
          </div>

          {/* Client name (if provided) */}
          {clientName && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Icons.User className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-primary)]">{clientName}</span>
            </div>
          )}

          {/* Message input */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Mensaje
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={4}
              className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg resize-none
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            />
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              <Icons.AlertCircle className="w-4 h-4" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg
                         text-[var(--text-secondary)] hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={!phone.trim() || !message.trim() || sending}
              className="flex-1 py-2 bg-[var(--primary)] text-white rounded-lg
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Icons.Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
