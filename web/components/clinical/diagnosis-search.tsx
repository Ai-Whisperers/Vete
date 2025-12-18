"use client";

import { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';

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
                } catch (e) {
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
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                 />
                 {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Icons.Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
                    </div>
                 )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                    {results.map((d) => (
                        <button
                            key={d.id}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center group"
                            onClick={() => {
                                onSelect(d);
                                setQuery('');
                                setIsOpen(false);
                            }}
                        >
                            <span className="font-medium text-gray-700 group-hover:text-[var(--primary)] text-sm">{d.term}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
                                {d.code}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            
            {isOpen && results.length === 0 && !loading && (
                 <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-center text-sm text-gray-500">
                    No se encontraron resultados
                 </div>
            )}
        </div>
    );
}
