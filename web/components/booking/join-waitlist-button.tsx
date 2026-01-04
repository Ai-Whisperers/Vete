'use client'

import { useState } from 'react'
import { Clock, Bell, Loader2, CheckCircle, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface JoinWaitlistButtonProps {
  petId: string
  serviceId: string
  preferredDate: string
  preferredVetId?: string
  preferredTimeStart?: string
  preferredTimeEnd?: string
  isFlexibleDate?: boolean
  onSuccess?: () => void
  className?: string
}

export function JoinWaitlistButton({
  petId,
  serviceId,
  preferredDate,
  preferredVetId,
  preferredTimeStart,
  preferredTimeEnd,
  isFlexibleDate = false,
  onSuccess,
  className = '',
}: JoinWaitlistButtonProps): React.ReactElement {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [joined, setJoined] = useState(false)
  const [flexibleDate, setFlexibleDate] = useState(isFlexibleDate)
  const [notifyVia, setNotifyVia] = useState<string[]>(['email', 'whatsapp'])
  const [notes, setNotes] = useState('')

  const handleJoin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/appointments/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet_id: petId,
          service_id: serviceId,
          preferred_date: preferredDate,
          preferred_time_start: preferredTimeStart,
          preferred_time_end: preferredTimeEnd,
          preferred_vet_id: preferredVetId,
          is_flexible_date: flexibleDate,
          notify_via: notifyVia,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al unirse a la lista')
      }

      setJoined(true)
      setShowModal(false)
      toast({
        title: 'Te has unido a la lista de espera',
        description: 'Te notificaremos cuando haya disponibilidad.',
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo unir a la lista',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (joined) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-700 ${className}`}>
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">En lista de espera</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 font-medium text-amber-700 transition hover:bg-amber-100 ${className}`}
      >
        <Clock className="h-5 w-5" />
        No hay citas disponibles - Unirse a lista de espera
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Lista de Espera
                  </h3>
                  <p className="text-sm text-gray-500">
                    Te avisaremos cuando haya disponibilidad
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Flexible Date */}
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={flexibleDate}
                  onChange={(e) => setFlexibleDate(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    Fechas flexibles
                  </p>
                  <p className="text-sm text-gray-500">
                    Acepto citas un día antes o después
                  </p>
                </div>
              </label>

              {/* Notification Preferences */}
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                  Notificarme por:
                </p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notifyVia.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNotifyVia([...notifyVia, 'email'])
                        } else {
                          setNotifyVia(notifyVia.filter((v) => v !== 'email'))
                        }
                      }}
                      className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notifyVia.includes('whatsapp')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNotifyVia([...notifyVia, 'whatsapp'])
                        } else {
                          setNotifyVia(notifyVia.filter((v) => v !== 'whatsapp'))
                        }
                      }}
                      className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm">WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notifyVia.includes('sms')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNotifyVia([...notifyVia, 'sms'])
                        } else {
                          setNotifyVia(notifyVia.filter((v) => v !== 'sms'))
                        }
                      }}
                      className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Preferencia de horario matutino"
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleJoin}
                disabled={loading || notifyVia.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                Unirme a la Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
