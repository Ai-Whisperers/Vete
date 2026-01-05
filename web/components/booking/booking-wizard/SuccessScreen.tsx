'use client'

import React from 'react'
import { Check, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { BookableService, Pet, BookingSelection } from './types'

interface SuccessScreenProps {
  selection: BookingSelection
  currentService?: BookableService
  currentPet?: Pet
  clinicId: string
}

/**
 * Success screen component shown after successful booking
 */
export function SuccessScreen({
  selection,
  currentService,
  currentPet,
  clinicId,
}: SuccessScreenProps) {
  const router = useRouter()

  return (
    <div className="animate-in zoom-in-95 mx-auto mt-8 max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-2xl duration-500 sm:mt-20 sm:rounded-[3rem] sm:p-12">
      {/* Success Icon */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--status-success-bg)] text-[var(--status-success)] sm:mb-8 sm:h-24 sm:w-24">
        <Check className="relative z-10 h-10 w-10 sm:h-12 sm:w-12" />
        <div className="absolute inset-0 animate-ping rounded-full bg-[var(--status-success)] opacity-20"></div>
      </div>

      {/* Title */}
      <h2 className="mb-4 text-2xl font-black text-gray-900 sm:text-4xl">¡Todo listo!</h2>

      {/* Message */}
      <p className="mb-8 text-base leading-relaxed text-gray-500 sm:mb-10 sm:text-lg">
        Tu cita para <span className="font-bold text-gray-900">{currentPet?.name}</span> (
        {currentService?.name}) ha sido confirmada para el{' '}
        <span className="font-bold text-gray-900">{selection.date}</span> a las{' '}
        <span className="font-bold text-gray-900">{selection.time_slot}</span>.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          onClick={() => router.push(`/${clinicId}/portal/dashboard`)}
          className="min-h-[48px] rounded-2xl bg-gray-900 px-8 py-4 font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl sm:px-10 sm:py-5"
        >
          Volver al Inicio
        </button>
        <button className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gray-100 px-8 py-4 font-bold text-gray-600 transition-all hover:bg-gray-200 sm:px-10 sm:py-5">
          <Download className="h-5 w-5" /> Descargar Ticket
        </button>
      </div>
    </div>
  )
}
