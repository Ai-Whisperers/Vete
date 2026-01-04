"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  id: string;
  type: 'pet' | 'client' | 'appointment';
  title: string;
  subtitle?: string;
  species?: 'dog' | 'cat';
  href: string;
  meta?: Record<string, string | number | boolean>;
}

interface QuickSearchProps {
  clinic: string;
}

interface SearchPet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  owner_name?: string;
}

interface SearchClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
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
  };

  const config = typeConfig[result.type];
  const Icon = config.icon;

  return (
    <Link
      href={result.href}
      onClick={onSelect}
      className="flex items-center gap-3 p-3 hover:bg-[var(--bg-subtle)] rounded-xl transition-colors group"
    >
      <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
          {result.title}
        </p>
        {result.subtitle && (
          <p className="text-xs text-[var(--text-muted)] truncate">{result.subtitle}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export function QuickSearch({ clinic }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`quick-search-recent-${clinic}`);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Invalid data, ignore
      }
    }
  }, [clinic]);

  // Save to recent searches
  const addToRecent = useCallback((result: SearchResult) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      const updated = [result, ...filtered].slice(0, 5);
      localStorage.setItem(`quick-search-recent-${clinic}`, JSON.stringify(updated));
      return updated;
    });
  }, [clinic]);

  // Search effect
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?clinic=${clinic}&q=${encodeURIComponent(debouncedQuery)}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          // Transform results
          const searchResults: SearchResult[] = [];

          // Add pets
          (data.pets || []).forEach((pet: SearchPet) => {
            searchResults.push({
              id: `pet-${pet.id}`,
              type: 'pet',
              title: pet.name,
              subtitle: `${pet.species === 'dog' ? 'Perro' : 'Gato'} - ${pet.owner_name || 'Sin dueño'}`,
              species: pet.species,
              href: `/${clinic}/dashboard/patients/${pet.id}`,
            });
          });

          // Add clients
          (data.clients || []).forEach((client: SearchClient) => {
            searchResults.push({
              id: `client-${client.id}`,
              type: 'client',
              title: client.full_name,
              subtitle: client.email || client.phone,
              href: `/${clinic}/dashboard/clients/${client.id}`,
            });
          });

          setResults(searchResults);
        }
      } catch (error) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Search error:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, clinic]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (result: SearchResult) => {
    addToRecent(result);
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-[var(--text-muted)]" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar mascotas, clientes..."
          className="w-full pl-12 pr-24 py-3 bg-[var(--bg-subtle)] border border-[var(--border-light)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-[var(--bg-subtle)] rounded-full transition-colors"
              aria-label="Limpiar busqueda"
            >
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-paper)] border border-[var(--border-light)] rounded-lg text-xs text-[var(--text-muted)] shadow-sm">
            <span className="text-[10px]">Ctrl</span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-paper)] rounded-2xl shadow-xl border border-[var(--border-light)] overflow-hidden z-50">
          {/* Results */}
          {query.length >= 2 && (
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">Buscando...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    No se encontraron resultados para &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  <p className="text-xs text-[var(--text-muted)] px-3 py-2 font-medium">
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
                <History className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)] font-medium">Búsquedas recientes</span>
              </div>
              {recentSearches.map((result) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  onSelect={() => handleSelect(result)}
                />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {query.length < 2 && recentSearches.length === 0 && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Búsqueda rápida
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Escribe al menos 2 caracteres para buscar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
