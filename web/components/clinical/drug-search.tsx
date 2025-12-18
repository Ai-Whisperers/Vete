"use client";

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

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
                } catch(e) {
                    console.error(e);
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
                 <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                 />
                 {loading && <Icons.Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
             </div>
             
             {isOpen && results.length > 0 && (
                 <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                     {results.map(d => (
                         <button
                            key={d.id}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center text-sm"
                            onClick={() => {
                                onSelect(d);
                                setQuery('');
                                setIsOpen(false);
                            }}
                         >
                            <span className="font-bold text-gray-700">{d.name}</span>
                            <span className="text-gray-400 text-xs">{d.concentration_mg_ml} mg/ml ({d.species})</span>
                         </button>
                     ))}
                 </div>
             )}
        </div>
    );
}
