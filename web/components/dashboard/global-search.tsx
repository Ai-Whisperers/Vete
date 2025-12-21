"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  User,
  PawPrint,
  Calendar,
  FileText,
  Package,
  Loader2,
  ArrowRight,
  Clock,
  Command,
} from "lucide-react";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";

interface SearchResult {
  id: string;
  type: "client" | "pet" | "appointment" | "invoice" | "product";
  title: string;
  subtitle: string;
  href: string;
  meta?: string;
}

interface GlobalSearchProps {
  clinic: string;
}

export function GlobalSearch({ clinic }: GlobalSearchProps): React.ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const labels = useDashboardLabels();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`recentSearches_${clinic}`);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [clinic]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      // Open with / when not in input
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?clinic=${clinic}&q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        } else {
          // Mock results for demo
          const mockResults: SearchResult[] = [
            {
              id: "1",
              type: "client",
              title: "Juan Pérez",
              subtitle: "juan@email.com • +595 981 123456",
              href: `/${clinic}/dashboard/clients/1`,
            },
            {
              id: "2",
              type: "pet",
              title: "Max",
              subtitle: "Perro • Labrador • Juan Pérez",
              href: `/${clinic}/dashboard/pets/2`,
            },
            {
              id: "3",
              type: "appointment",
              title: "Consulta - Max",
              subtitle: "Hoy 14:30 • Dr. García",
              href: `/${clinic}/dashboard/appointments/3`,
              meta: "Pendiente",
            },
          ];
          setResults(mockResults.filter(
            (r) =>
              r.title.toLowerCase().includes(query.toLowerCase()) ||
              r.subtitle.toLowerCase().includes(query.toLowerCase())
          ));
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, clinic]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    const items = results.length > 0 ? results : recentSearches;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case "Enter":
        e.preventDefault();
        if (items[selectedIndex]) {
          handleSelect(items[selectedIndex]);
        }
        break;
    }
  };

  const handleSelect = (result: SearchResult): void => {
    // Add to recent searches
    const newRecent = [result, ...recentSearches.filter((r) => r.id !== result.id)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem(`recentSearches_${clinic}`, JSON.stringify(newRecent));

    // Navigate and close
    router.push(result.href);
    setIsOpen(false);
    setQuery("");
  };

  const getIcon = (type: SearchResult["type"]): React.ReactNode => {
    switch (type) {
      case "client":
        return <User className="w-5 h-5" />;
      case "pet":
        return <PawPrint className="w-5 h-5" />;
      case "appointment":
        return <Calendar className="w-5 h-5" />;
      case "invoice":
        return <FileText className="w-5 h-5" />;
      case "product":
        return <Package className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: SearchResult["type"]): string => {
    const typeLabels: Record<SearchResult["type"], string> = {
      client: labels.search.types.client,
      pet: labels.search.types.pet,
      appointment: labels.search.types.appointment,
      invoice: labels.search.types.invoice,
      product: labels.search.types.product,
    };
    return typeLabels[type];
  };

  const displayResults = query.trim() ? results : recentSearches;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-white rounded border shadow-sm">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={labels.search.placeholder}
                    className="flex-1 text-lg outline-none placeholder:text-gray-400"
                  />
                  {isLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                  {query && !isLoading && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {displayResults.length > 0 ? (
                    <div className="py-2">
                      {!query.trim() && (
                        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {labels.search.recent}
                        </p>
                      )}
                      {displayResults.map((result, index) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            index === selectedIndex
                              ? "bg-[var(--primary)] bg-opacity-10"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              index === selectedIndex
                                ? "bg-[var(--primary)] bg-opacity-20 text-[var(--primary)]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {getIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {result.title}
                              </p>
                              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                {getTypeLabel(result.type)}
                              </span>
                              {result.meta && (
                                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                                  {result.meta}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 flex-shrink-0 ${
                              index === selectedIndex ? "text-[var(--primary)]" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  ) : query.trim() && !isLoading ? (
                    <div className="py-12 text-center">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{labels.search.no_results}</p>
                      <p className="text-sm text-gray-400">
                        {labels.search.try_other}
                      </p>
                    </div>
                  ) : !query.trim() && recentSearches.length === 0 ? (
                    <div className="py-12 text-center">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{labels.common.search}</p>
                    </div>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-sm">↑↓</kbd>
                      navegar
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-sm">↵</kbd>
                      seleccionar
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-sm">esc</kbd>
                      cerrar
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
