'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { rescheduleAppointment } from '@/app/actions/appointments'

interface RescheduleDialogProps {
  appointmentId: string
  currentDate: string
  currentTime: string
  onSuccess?: () => void
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

export function RescheduleDialog({
  appointmentId,
  currentDate,
  currentTime,
  onSuccess
}: RescheduleDialogProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [newDate, setNewDate] = useState(currentDate)
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get tomorrow's date as minimum
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  async function handleReschedule() {
    if (!newDate || !newTime) {
      setError('Selecciona una fecha y hora')
      return
    }

    setLoading(true)
    setError(null)

    const result = await rescheduleAppointment(appointmentId, newDate, newTime)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setShowDialog(false)
      setNewDate('')
      setNewTime('')
      onSuccess?.()
    }
  }

  function handleClose() {
    if (!loading) {
      setShowDialog(false)
      setNewDate(currentDate)
      setNewTime('')
      setError(null)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-all"
        title="Reprogramar cita"
      >
        <Icons.CalendarClock className="w-5 h-5" />
      </button>

      {showDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-3xl sm:max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary)]/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                  <Icons.CalendarClock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    Reprogramar Cita
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    Selecciona una nueva fecha y hora
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Current appointment info */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Cita actual
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icons.Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{currentDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{currentTime}</span>
                  </div>
                </div>
              </div>

              {/* New Date */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Nueva fecha
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={minDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 sm:p-4 min-h-[48px] border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                  disabled={loading}
                />
              </div>

              {/* New Time */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Nueva hora
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setNewTime(time)}
                      disabled={loading}
                      className={`py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all ${
                        newTime === time
                          ? 'bg-[var(--primary)] text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      } disabled:opacity-50`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* TICKET-A11Y-004: Added role="alert" for screen readers */}
              {error && (
                <div role="alert" aria-live="assertive" className="p-3 sm:p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                  <Icons.AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3">
                <Icons.Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-yellow-700 text-sm">
                  La cita reprogramada quedará pendiente de confirmación por la clínica.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-3 min-h-[48px] text-[var(--text-secondary)] font-bold rounded-xl hover:bg-gray-50 transition-all"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleReschedule}
                className="px-6 py-3 min-h-[48px] bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={loading || !newDate || !newTime}
              >
                {loading ? (
                  <>
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    Reprogramando...
                  </>
                ) : (
                  <>
                    <Icons.Check className="w-4 h-4" />
                    Confirmar
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
