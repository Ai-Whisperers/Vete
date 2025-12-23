'use client'

import React from 'react'
import * as Icons from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale' // Assuming Spanish locale for display

interface DayAvailability {
  date: string // YYYY-MM-DD
  availableSlots: string[] // e.g., ['09:00', '10:00']
}

interface MultiDayAvailabilityProps {
  availability: DayAvailability[]
  daysToShow?: number // How many days to display, default 5
}

export function MultiDayAvailability({ availability, daysToShow = 5 }: MultiDayAvailabilityProps) {
  const today = new Date()
  const displayDates = Array.from({ length: daysToShow }).map((_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Disponibilidad Semanal</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayDates.map((date, index) => {
          const formattedDate = format(date, 'yyyy-MM-dd')
          const dayData = availability.find(day => day.date === formattedDate)
          const hasAvailability = dayData && dayData.availableSlots.length > 0

          return (
            <div key={index} className={`border rounded-xl p-4 ${
              hasAvailability
                ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <h3 className={`font-semibold text-lg mb-2 ${
                hasAvailability ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'
              }`}>
                {format(date, 'EEEE, d MMMM', { locale: es })}
              </h3>

              {hasAvailability ? (
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2">
                  {dayData?.availableSlots.map((slot, slotIndex) => (
                    <span key={slotIndex} className="bg-white text-[var(--primary)] px-3 py-1 rounded-full text-sm font-medium border border-[var(--primary)]/30">
                      {slot}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-[var(--text-secondary)]">
                  <Icons.XCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No hay citas disponibles</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
