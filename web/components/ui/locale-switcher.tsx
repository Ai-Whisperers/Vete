'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import type { Locale } from '@/lib/intl'

interface LocaleSwitcherProps {
  className?: string
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const t = useTranslations('common')
  const [selectedLocale, setSelectedLocale] = useState<Locale>('es')

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale')
    if (storedLocale) {
      setSelectedLocale(storedLocale as Locale)
    }
  }, [])

  const handleLocaleChange = (locale: Locale) => {
    setSelectedLocale(locale)
    localStorage.setItem('locale', locale)
  }

  return (
    <div
      className={clsx(
        'relative inline-flex h-10 w-24 items-center rounded-md',
        className
      )}
    >
      <select
        value={selectedLocale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        className="block h-full w-full cursor-pointer rounded-md bg-transparent py-0 pl-3 pr-10 text-left text-sm text-gray-500 focus:outline-none sm:text-sm"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </div>
  )
}