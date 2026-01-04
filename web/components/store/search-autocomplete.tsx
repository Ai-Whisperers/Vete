'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Loader2,
  Package,
  Tag,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { SearchSuggestion } from '@/lib/types/store';

interface Props {
  clinic: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

const RECENT_SEARCHES_KEY = 'store_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchAutocomplete({
  clinic,
  placeholder = 'Buscar productos...',
  className = '',
  inputClassName = '',
  onSearch,
  autoFocus = false,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/store/search?clinic=${clinic}&q=${encodeURIComponent(searchQuery)}&limit=8`
      );
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // Search error - silently fail
    } finally {
      setLoading(false);
    }
  }, [clinic]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Handle search submit
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    saveRecentSearch(searchQuery);
    setIsOpen(false);

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/${clinic}/store?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setIsOpen(false);
    setQuery('');

    switch (suggestion.type) {
      case 'product':
        if (suggestion.id) {
          router.push(`/${clinic}/store/product/${suggestion.id}`);
        }
        break;
      case 'category':
        if (suggestion.slug) {
          router.push(`/${clinic}/store?category=${suggestion.slug}`);
        }
        break;
      case 'brand':
        if (suggestion.slug) {
          router.push(`/${clinic}/store?brand=${suggestion.slug}`);
        }
        break;
      case 'query':
        handleSearch(query);
        break;
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (query.length >= 2 ? 0 : recentSearches.length);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (selectedIndex >= suggestions.length && query.length < 2) {
          const recentIndex = selectedIndex - suggestions.length;
          if (recentSearches[recentIndex]) {
            handleSearch(recentSearches[recentIndex]);
          }
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'Gs 0';
    return `Gs ${price.toLocaleString('es-PY')}`;
  };

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all ${inputClassName}`}
        />
        {loading && (
          <Loader2 className="absolute right-14 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center hover:bg-gray-100 rounded-full"
            aria-label="Limpiar busqueda"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {/* Search Suggestions */}
          {query.length >= 2 && suggestions.length > 0 && (
            <div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id || suggestion.name}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-4 min-h-[56px] text-left hover:bg-gray-50 transition-colors ${
                    selectedIndex === index ? 'bg-gray-50' : ''
                  }`}
                >
                  {suggestion.type === 'product' && (
                    <>
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {suggestion.image_url ? (
                          <Image
                            src={suggestion.image_url}
                            alt={suggestion.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">
                          {suggestion.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          {suggestion.category && (
                            <span className="text-[var(--text-muted)]">{suggestion.category}</span>
                          )}
                          {suggestion.price && (
                            <span className="font-medium text-[var(--primary)]">
                              {formatPrice(suggestion.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </>
                  )}

                  {suggestion.type === 'category' && (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-muted)]">Categoría</p>
                        <p className="font-medium text-[var(--text-primary)]">{suggestion.name}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </>
                  )}

                  {suggestion.type === 'brand' && (
                    <>
                      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {suggestion.image_url ? (
                          <Image
                            src={suggestion.image_url}
                            alt={suggestion.name}
                            fill
                            className="object-contain p-1"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-muted)]">Marca</p>
                        <p className="font-medium text-[var(--text-primary)]">{suggestion.name}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </>
                  )}

                  {suggestion.type === 'query' && (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Search className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="flex-1 font-medium text-[var(--text-primary)]">
                        {suggestion.name}
                      </p>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-4 py-8 text-center">
              <p className="text-[var(--text-muted)]">No encontramos resultados para "{query}"</p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-2 text-[var(--primary)] font-medium hover:underline"
              >
                Buscar de todos modos →
              </button>
            </div>
          )}

          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  Búsquedas recientes
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-[var(--primary)] hover:underline"
                  aria-label="Limpiar busquedas recientes"
                >
                  Limpiar
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className={`w-full flex items-center gap-3 px-4 py-4 min-h-[52px] text-left hover:bg-gray-50 transition-colors ${
                    selectedIndex === suggestions.length + index ? 'bg-gray-50' : ''
                  }`}
                >
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 text-[var(--text-secondary)]">{search}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches (placeholder for future) */}
          {query.length < 2 && recentSearches.length === 0 && (
            <div className="px-4 py-6 text-center text-[var(--text-muted)]">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Escribe para buscar productos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
