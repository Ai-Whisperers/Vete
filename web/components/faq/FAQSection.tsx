"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  Search,
  ChevronUp,
  ChevronDownSquare,
  ChevronUpSquare,
} from "lucide-react";
import type { FaqItem } from "@/lib/clinics";

interface FAQSectionProps {
  items: FaqItem[];
  categories: string[];
}

export function FAQSection({ items, categories }: FAQSectionProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory && item.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [items, activeCategory, searchQuery]);

  // Toggle single item
  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Expand all visible items
  const expandAll = () => {
    setOpenItems(new Set(filteredItems.map((item) => item.id)));
  };

  // Collapse all items
  const collapseAll = () => {
    setOpenItems(new Set());
  };

  // Check if all visible items are expanded
  const allExpanded = filteredItems.length > 0 &&
    filteredItems.every((item) => openItems.has(item.id));

  // Get category display name (capitalize first letter)
  const formatCategory = (cat: string): string => {
    return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Buscar en las preguntas frecuentes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[var(--bg-default)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          aria-label="Buscar preguntas frecuentes"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--bg-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border)]"
            }`}
            aria-pressed={activeCategory === null}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border)]"
              }`}
              aria-pressed={activeCategory === cat}
            >
              {formatCategory(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Expand/Collapse Controls */}
      {filteredItems.length > 1 && (
        <div className="flex justify-end gap-2">
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            aria-label={allExpanded ? "Contraer todas" : "Expandir todas"}
          >
            {allExpanded ? (
              <>
                <ChevronUpSquare className="w-4 h-4" />
                Contraer todas
              </>
            ) : (
              <>
                <ChevronDownSquare className="w-4 h-4" />
                Expandir todas
              </>
            )}
          </button>
        </div>
      )}

      {/* Results count when searching */}
      {searchQuery && (
        <p className="text-sm text-[var(--text-muted)]">
          {filteredItems.length === 0
            ? "No se encontraron resultados"
            : `${filteredItems.length} resultado${filteredItems.length !== 1 ? "s" : ""} encontrado${filteredItems.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* FAQ Items */}
      <div className="space-y-4" role="region" aria-label="Preguntas frecuentes">
        {filteredItems.map((item) => {
          const isOpen = openItems.has(item.id);
          return (
            <div
              key={item.id}
              className="bg-[var(--bg-default)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--bg-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                id={`faq-question-${item.id}`}
              >
                <span className="font-bold text-[var(--text-primary)] pr-4">
                  {item.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                )}
              </button>
              <div
                id={`faq-answer-${item.id}`}
                role="region"
                aria-labelledby={`faq-question-${item.id}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 text-[var(--text-secondary)] leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results message */}
      {filteredItems.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">
            No hay preguntas frecuentes disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
