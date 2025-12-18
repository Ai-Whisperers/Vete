'use client';

import { Search, Globe, Building2 } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function NetworkSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleScopeChange = (scope: 'local' | 'global') => {
    const params = new URLSearchParams(searchParams);
    params.set('scope', scope);
    replace(`${pathname}?${params.toString()}`);
  };

  const currentScope = searchParams.get('scope') || 'local';

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="search" className="sr-only">
            Buscar paciente
          </label>
          <input
            className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:border-[var(--primary)] focus:ring-[var(--primary)]"
            placeholder="Buscar por nombre o microchip..."
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('query')?.toString()}
          />
          <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-[var(--primary)]" />
        </div>

        {/* Scope Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
                onClick={() => handleScopeChange('local')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    currentScope === 'local' 
                    ? 'bg-white text-[var(--primary)] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Building2 className="w-4 h-4" />
                Mi Clínica
            </button>
            <button
                onClick={() => handleScopeChange('global')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    currentScope === 'global' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Globe className="w-4 h-4" />
                Red Global
            </button>
        </div>
      </div>
    </div>
  );
}
