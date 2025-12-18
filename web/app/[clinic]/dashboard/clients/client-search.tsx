'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface ClientSearchProps {
  clinic: string
  initialQuery?: string
}

export default function ClientSearch({ clinic, initialQuery = '' }: ClientSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value)

    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      if (value.trim()) {
        params.set('q', value)
      } else {
        params.delete('q')
      }

      const search = params.toString()
      const url = `/${clinic}/dashboard/clients${search ? `?${search}` : ''}`
      router.push(url)
    })
  }

  const handleClear = () => {
    setQuery('')
    startTransition(() => {
      router.push(`/${clinic}/dashboard/clients`)
    })
  }

  return (
    <div className="flex-1 max-w-md">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full pl-10 pr-10 py-2 border border-[var(--primary)] border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 text-[var(--text-primary)] bg-[var(--bg-default)]"
          disabled={isPending}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            disabled={isPending}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {isPending && (
        <p className="text-xs text-[var(--text-secondary)] mt-1 ml-1">Buscando...</p>
      )}
    </div>
  )
}
