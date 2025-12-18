"use client";

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface Drug {
    id: string;
    name: string;
    concentration_mg_ml: number;
    species: string;
}

interface DrugSearchProps {
    onSelect: (drug: Drug) => void;
    placeholder?: string;
}

export function DrugSearch({ onSelect, placeholder = "Buscar medicamento..." }: DrugSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Drug[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Simple fetch of all drugs and local filter for MVP (assuming list is small < 100)
    // Or I can filter on server if I implemented search in API.
    // My api/drug_dosages route takes ?species=. It doesn't seem to support ?q= yet.
    // Let's rely on client side filtering of the full list for now or update API.
    // Updating API is better practice but client side ok for < 100 items.

    useEffect(() => {
        const timer = setTimeout(async () => {
             if (query.length >= 2) {
                setLoading(true);
                try {
                     // In real app, update API to support sorting/filtering by name
                     const res = await fetch('/api/drug_dosages');
                     if (res.ok) {
                        const all: Drug[] = await res.json();
                        const matches = all.filter(d => d.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
                        setResults(matches);
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
                    className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-[var(--bg-paper)] border border-[var(--border,#e5e7eb)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                 />
                 {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[var(--text-muted)]" />}
             </div>

             {isOpen && results.length > 0 && (
                 <div className="absolute z-50 w-full mt-1 bg-[var(--bg-paper)] rounded-lg shadow-xl border border-[var(--border-light,#f3f4f6)] max-h-60 overflow-y-auto">
                     {results.map(d => (
                         <button
                            key={d.id}
                            className="w-full text-left px-4 py-3 min-h-[48px] hover:bg-[var(--bg-subtle)] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm"
                            onClick={() => {
                                onSelect(d);
                                setQuery('');
                                setIsOpen(false);
                            }}
                         >
                            <span className="font-bold text-[var(--text-secondary)]">{d.name}</span>
                            <span className="text-[var(--text-muted)] text-xs">{d.concentration_mg_ml} mg/ml ({d.species})</span>
                         </button>
                     ))}
                 </div>
             )}
        </div>
    );
}
