'use client'

import { useRouter } from 'next/navigation'
import * as Icons from 'lucide-react'

interface DateFilterProps {
  currentDate: string
  clinic: string
}

export function DateFilter({ currentDate, clinic }: DateFilterProps) {
  const router = useRouter()

  const handleDateChange = (date: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('date', date)
    router.push(url.pathname + url.search)
  }

  const goToDay = (offset: number) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + offset)
    handleDateChange(date.toISOString().split('T')[0])
  }

  const goToToday = () => {
    handleDateChange(new Date().toISOString().split('T')[0])
  }

  const isToday = currentDate === new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => goToDay(-1)}
        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Día anterior"
      >
        <Icons.ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative">
        <input
          type="date"
          value={currentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-4 py-3 min-h-[44px] pr-10 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
        />
      </div>

      <button
        onClick={() => goToDay(1)}
        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Día siguiente"
      >
        <Icons.ChevronRight className="w-5 h-5" />
      </button>

      {!isToday && (
        <button
          onClick={goToToday}
          className="px-4 py-3 min-h-[44px] rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Hoy
        </button>
      )}
    </div>
  )
}
