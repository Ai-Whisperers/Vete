'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  PawPrint,
  User,
  Calendar,
  X,
  Dog,
  Cat,
  ChevronRight,
  Loader2,
  History,
  Sparkles,
} from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchResult {
  id: string
  type: 'pet' | 'client' | 'appointment'
  title: string
  subtitle?: string
  species?: 'dog' | 'cat'
  href: string
  meta?: Record<string, string | number | boolean>
}

interface QuickSearchProps {
  clinic: string
}

interface SearchPet {
  id: string
  name: string
  species: 'dog' | 'cat'
  owner_name?: string
}

interface SearchClient {
  id: string
  full_name: string
  email?: string
  phone?: string
}

function ResultItem({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  const typeConfig = {
    pet: {
      icon: result.species === 'cat' ? Cat : Dog,
      color: 'text-[var(--primary)]',
      bg: 'bg-[var(--primary)]/10',
    },
    client: {
      icon: User,
      color: 'text-[var(--status-info)]',
      bg: 'bg-[var(--status-info-bg)]',
    },
    appointment: {
      icon: Calendar,
      color: 'text-[var(--status-success)]',
      bg: 'bg-[var(--status-success-bg)]',
    },
  }

  const config = typeConfig[result.type]
  const Icon = config.icon

  return (
    <Link
      href={result.href}
      onClick={onSelect}
      className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--bg-subtle)]"
    >
      <div className={`rounded-lg p-2 ${config.bg} ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--primary)]">
          {result.title}
        </p>
        {result.subtitle && (
          <p className="truncate text-xs text-[var(--text-muted)]">{result.subtitle}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-[var(--text-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
    </Link>
  )
}

export function QuickSearch({ clinic }: QuickSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`quick-search-recent-${clinic}`)
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        // Invalid data, ignore
      }
    }
  }, [clinic])

  // Save to recent searches
  const addToRecent = useCallback(
    (result: SearchResult) => {
      setRecentSearches((prev) => {
        const filtered = prev.filter((r) => r.id !== result.id)
        const updated = [result, ...filtered].slice(0, 5)
        localStorage.setItem(`quick-search-recent-${clinic}`, JSON.stringify(updated))
        return updated
      })
    },
    [clinic]
  )

  // Search effect
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/search?clinic=${clinic}&q=${encodeURIComponent(debouncedQuery)}&limit=8`
        )
        if (res.ok) {
          const data = await res.json()
          // Transform results
          const searchResults: SearchResult[] = []

          // Add pets
          ;(data.pets || []).forEach((pet: SearchPet) => {
            searchResults.push({
              id: `pet-${pet.id}`,
              type: 'pet',
              title: pet.name,
              subtitle: `${pet.species === 'dog' ? 'Perro' : 'Gato'} - ${pet.owner_name || 'Sin dueño'}`,
              species: pet.species,
              href: `/${clinic}/dashboard/patients/${pet.id}`,
            })
          })

          // Add clients
          ;(data.clients || []).forEach((client: SearchClient) => {
            searchResults.push({
              id: `client-${client.id}`,
              type: 'client',
              title: client.full_name,
              subtitle: client.email || client.phone,
              href: `/${clinic}/dashboard/clients/${client.id}`,
            })
          })

          setResults(searchResults)
        }
      } catch (error) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Search error:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery, clinic])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (result: SearchResult) => {
    addToRecent(result)
    setIsOpen(false)
    setQuery('')
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
          ) : (
            <Search className="h-5 w-5 text-[var(--text-muted)]" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar mascotas, clientes..."
          className="focus:ring-[var(--primary)]/30 w-full rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)] py-3 pl-12 pr-24 text-sm transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
          {query && (
            <button
              onClick={clearSearch}
              className="rounded-full p-1 transition-colors hover:bg-[var(--bg-subtle)]"
              aria-label="Limpiar busqueda"
            >
              <X className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
          )}
          <kbd className="hidden items-center gap-1 rounded-lg border border-[var(--border-light)] bg-[var(--bg-paper)] px-2 py-1 text-xs text-[var(--text-muted)] shadow-sm sm:inline-flex">
            <span className="text-[10px]">Ctrl</span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-paper)] shadow-xl">
          {/* Results */}
          {query.length >= 2 && (
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[var(--primary)]" />
                  <p className="text-sm text-[var(--text-muted)]">Buscando...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
                    <Search className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    No se encontraron resultados para &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
                    {results.length} resultado{results.length !== 1 ? 's' : ''}
                  </p>
                  {results.map((result) => (
                    <ResultItem
                      key={result.id}
                      result={result}
                      onSelect={() => handleSelect(result)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <History className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Búsquedas recientes
                </span>
              </div>
              {recentSearches.map((result) => (
                <ResultItem key={result.id} result={result} onSelect={() => handleSelect(result)} />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {query.length < 2 && recentSearches.length === 0 && (
            <div className="p-6 text-center">
              <div className="bg-[var(--primary)]/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Sparkles className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <p className="mb-1 text-sm font-medium text-[var(--text-primary)]">Búsqueda rápida</p>
              <p className="text-xs text-[var(--text-muted)]">
                Escribe al menos 2 caracteres para buscar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
