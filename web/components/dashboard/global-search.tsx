"use client";

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
  ArrowRight,
  Clock,
  Command,
  Loader2,
} from "lucide-react";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { ErrorBoundary } from "@/components/shared";

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

// Search function for the command palette
const searchGlobalData = async (query: string, clinic: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(
      `/api/search?clinic=${clinic}&q=${encodeURIComponent(query)}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.results || [];
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
      return mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      );
    }
  } catch (error) {
    // Client-side error logging - only in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Search error:", error);
    }
    return [];
  }
};

export function GlobalSearch({ clinic }: GlobalSearchProps): React.ReactElement {
  const router = useRouter();
  const labels = useDashboardLabels();

  const commandPalette = useCommandPalette({
    clinic,
    searchFn: searchGlobalData,
    onSelect: (result) => {
      router.push(result.href);
    },
    historyKey: `recentSearches_${clinic}`,
    maxHistoryItems: 5
  });

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

  return (
    <ErrorBoundary>
      <div>
        {/* Trigger Button */}
      <button
        onClick={commandPalette.open}
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
        {commandPalette.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={commandPalette.close}
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
                    ref={commandPalette.inputRef}
                    type="text"
                    value={commandPalette.query}
                    onChange={(e) => commandPalette.setQuery(e.target.value)}
                    placeholder={labels.search.placeholder}
                    className="flex-1 text-lg outline-none placeholder:text-gray-400"
                  />
                  {commandPalette.isLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                  {commandPalette.query && !commandPalette.isLoading && (
                    <button
                      onClick={() => commandPalette.setQuery("")}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Limpiar busqueda"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {commandPalette.hasResults || commandPalette.recentSearches.length > 0 ? (
                    <div className="py-2">
                      {!commandPalette.query.trim() && commandPalette.recentSearches.length > 0 && (
                        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {labels.search.recent}
                        </p>
                      )}
                      {(commandPalette.hasResults ? commandPalette.results : commandPalette.recentSearches).map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => commandPalette.selectItem(index)}
                          onMouseEnter={() => {/* Keyboard navigation handles this */}}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            index === commandPalette.selectedIndex
                              ? "bg-[var(--primary)] bg-opacity-10"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              index === commandPalette.selectedIndex
                                ? "bg-[var(--primary)] bg-opacity-20 text-[var(--primary)]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {getIcon(result.type as SearchResult["type"])}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {result.title}
                              </p>
                              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                {getTypeLabel(result.type as SearchResult["type"])}
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
                              index === commandPalette.selectedIndex ? "text-[var(--primary)]" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  ) : commandPalette.query.trim() && !commandPalette.isLoading ? (
                    <div className="py-12 text-center">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{labels.search.no_results}</p>
                      <p className="text-sm text-gray-400">
                        {labels.search.try_other}
                      </p>
                    </div>
                  ) : !commandPalette.query.trim() && commandPalette.recentSearches.length === 0 ? (
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
      </div>
    </ErrorBoundary>
  );
}
