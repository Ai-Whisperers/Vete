"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface Diagnosis {
    id: string;
    code: string;
    term: string;
    category: string;
}

interface DiagnosisSearchProps {
    onSelect: (diagnosis: Diagnosis) => void;
    placeholder?: string;
}

export function DiagnosisSearch({ onSelect, placeholder = "Buscar diagnóstico..." }: DiagnosisSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Diagnosis[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/diagnosis_codes?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setIsOpen(true);
                    }
                } catch {
                    // Search error - silently fail
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative">
            <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                 <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-[var(--bg-subtle)] border border-[var(--border,#e5e7eb)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                 />
                 {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
                    </div>
                 )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-[var(--bg-paper)] rounded-xl shadow-xl border border-[var(--border-light,#f3f4f6)] overflow-hidden max-h-60 overflow-y-auto">
                    {results.map((d) => (
                        <button
                            key={d.id}
                            className="w-full text-left px-4 py-3 min-h-[48px] hover:bg-[var(--bg-subtle)] border-b border-[var(--border-light,#f3f4f6)] last:border-0 flex justify-between items-center group"
                            onClick={() => {
                                onSelect(d);
                                setQuery('');
                                setIsOpen(false);
                            }}
                        >
                            <span className="font-medium text-[var(--text-secondary)] group-hover:text-[var(--primary)] text-sm">{d.term}</span>
                            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-1 rounded-full group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
                                {d.code}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && results.length === 0 && !loading && (
                 <div className="absolute z-50 w-full mt-2 bg-[var(--bg-paper)] rounded-xl shadow-xl border border-[var(--border-light,#f3f4f6)] p-4 text-center text-sm text-[var(--text-secondary)]">
                    No se encontraron resultados
                 </div>
            )}
        </div>
    );
}
