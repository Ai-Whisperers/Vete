'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface Diagnosis {
  id: string
  code: string
  term: string
  category: string
}

interface DiagnosisSearchProps {
  onSelect: (diagnosis: Diagnosis) => void
  placeholder?: string
}

export function DiagnosisSearch({
  onSelect,
  placeholder = 'Buscar diagnóstico...',
}: DiagnosisSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Diagnosis[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true)
        try {
          const res = await fetch(`/api/diagnosis_codes?q=${encodeURIComponent(query)}`)
          if (res.ok) {
            const data = await res.json()
            setResults(data)
            setIsOpen(true)
          }
        } catch {
          // Search error - silently fail
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          className="min-h-[44px] w-full rounded-xl border border-[var(--border,#e5e7eb)] bg-[var(--bg-subtle)] py-3 pl-10 pr-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--primary)]"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-hidden overflow-y-auto rounded-xl border border-[var(--border-light,#f3f4f6)] bg-[var(--bg-paper)] shadow-xl">
          {results.map((d) => (
            <button
              key={d.id}
              className="group flex min-h-[48px] w-full items-center justify-between border-b border-[var(--border-light,#f3f4f6)] px-4 py-3 text-left last:border-0 hover:bg-[var(--bg-subtle)]"
              onClick={() => {
                onSelect(d)
                setQuery('')
                setIsOpen(false)
              }}
            >
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--primary)]">
                {d.term}
              </span>
              <span className="group-hover:bg-[var(--primary)]/10 rounded-full bg-[var(--bg-subtle)] px-2 py-1 text-xs text-[var(--text-muted)] group-hover:text-[var(--primary)]">
                {d.code}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[var(--border-light,#f3f4f6)] bg-[var(--bg-paper)] p-4 text-center text-sm text-[var(--text-secondary)] shadow-xl">
          No se encontraron resultados
        </div>
      )}
    </div>
  )
}
