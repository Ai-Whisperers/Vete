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
  meta?: Record<string, any>;
}

interface QuickSearchProps {
  clinic: string;
}

function ResultItem({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  const typeConfig = {
    pet: {
      icon: result.species === 'cat' ? Cat : Dog,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
    },
    client: {
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    appointment: {
      icon: Calendar,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100',
    },
  };

  const config = typeConfig[result.type];
  const Icon = config.icon;

  return (
    <Link
      href={result.href}
      onClick={onSelect}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
    >
      <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
          {result.title}
        </p>
        {result.subtitle && (
          <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
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
          (data.pets || []).forEach((pet: any) => {
            searchResults.push({
              id: `pet-${pet.id}`,
              type: 'pet',
              title: pet.name,
              subtitle: `${pet.species === 'dog' ? 'Perro' : 'Gato'} - ${pet.owner_name || 'Sin due\u00f1o'}`,
              species: pet.species,
              href: `/${clinic}/dashboard/patients/${pet.id}`,
            });
          });

          // Add clients
          (data.clients || []).forEach((client: any) => {
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
        console.error('Search error:', error);
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
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar mascotas, clientes..."
          className="w-full pl-12 pr-24 py-3 bg-[var(--bg-subtle)] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all placeholder:text-gray-400"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 shadow-sm">
            <span className="text-[10px]">Ctrl</span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Results */}
          {query.length >= 2 && (
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Buscando...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No se encontraron resultados para &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-3 py-2 font-medium">
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
                <History className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">B\u00fasquedas recientes</span>
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
                B\u00fasqueda r\u00e1pida
              </p>
              <p className="text-xs text-gray-500">
                Escribe al menos 2 caracteres para buscar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
