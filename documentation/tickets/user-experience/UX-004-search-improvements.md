# UX-004: Global Search & Filtering

## Priority: P2
## Category: User Experience
## Status: Not Started
## Epic: [EPIC-16: User Experience](../epics/EPIC-16-user-experience.md)

## Description
Implement a unified global search experience with smart filtering, keyboard navigation, and recent searches.

## Current State
- Page-specific search inputs
- No global search command
- Limited filtering options
- No search history

## Proposed Solution

### Command Palette (Global Search)
```tsx
// components/search/command-palette.tsx
'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { Command } from 'cmdk';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { results, isLoading } = useGlobalSearch(query);

  // Open with Cmd+K or Ctrl+K
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setOpen(true);
  });

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Búsqueda global"
      className="fixed inset-0 z-50"
    >
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />

      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Buscar mascotas, clientes, citas..."
          className="w-full px-4 py-3 text-lg border-b outline-none"
        />

        <Command.List className="max-h-96 overflow-y-auto p-2">
          {isLoading && (
            <Command.Loading>
              <div className="p-4 text-center text-gray-500">Buscando...</div>
            </Command.Loading>
          )}

          {!isLoading && results.length === 0 && query && (
            <Command.Empty className="p-4 text-center text-gray-500">
              No se encontraron resultados para "{query}"
            </Command.Empty>
          )}

          {/* Recent searches */}
          {!query && (
            <Command.Group heading="Búsquedas recientes">
              <RecentSearches onSelect={(q) => setQuery(q)} />
            </Command.Group>
          )}

          {/* Results by category */}
          {results.pets.length > 0 && (
            <Command.Group heading="Mascotas">
              {results.pets.map((pet) => (
                <SearchResultItem
                  key={pet.id}
                  icon={PawPrint}
                  title={pet.name}
                  subtitle={`${pet.species} • ${pet.ownerName}`}
                  href={`/portal/pets/${pet.id}`}
                  onSelect={() => setOpen(false)}
                />
              ))}
            </Command.Group>
          )}

          {results.clients.length > 0 && (
            <Command.Group heading="Clientes">
              {results.clients.map((client) => (
                <SearchResultItem
                  key={client.id}
                  icon={User}
                  title={client.name}
                  subtitle={client.email}
                  href={`/dashboard/clients/${client.id}`}
                  onSelect={() => setOpen(false)}
                />
              ))}
            </Command.Group>
          )}

          {results.appointments.length > 0 && (
            <Command.Group heading="Citas">
              {results.appointments.map((apt) => (
                <SearchResultItem
                  key={apt.id}
                  icon={Calendar}
                  title={`${apt.petName} - ${apt.serviceName}`}
                  subtitle={formatDate(apt.startTime)}
                  href={`/dashboard/appointments/${apt.id}`}
                  onSelect={() => setOpen(false)}
                />
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer with keyboard hints */}
        <div className="border-t px-4 py-2 flex items-center gap-4 text-xs text-gray-500">
          <span><kbd className="kbd">↑↓</kbd> navegar</span>
          <span><kbd className="kbd">Enter</kbd> seleccionar</span>
          <span><kbd className="kbd">Esc</kbd> cerrar</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
```

### Search API
```typescript
// app/api/search/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q')?.trim();
  const tenantId = await getTenantId(request);

  if (!query || query.length < 2) {
    return NextResponse.json({ pets: [], clients: [], appointments: [] });
  }

  const searchTerm = `%${query}%`;

  const [pets, clients, appointments] = await Promise.all([
    supabase
      .from('pets')
      .select('id, name, species, breed, owner:profiles(full_name)')
      .eq('tenant_id', tenantId)
      .or(`name.ilike.${searchTerm},breed.ilike.${searchTerm}`)
      .limit(5),

    supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('tenant_id', tenantId)
      .eq('role', 'owner')
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(5),

    supabase
      .from('appointments')
      .select('id, start_time, pet:pets(name), service:services(name)')
      .eq('tenant_id', tenantId)
      .gte('start_time', new Date().toISOString())
      .limit(5),
  ]);

  return NextResponse.json({
    pets: pets.data || [],
    clients: clients.data || [],
    appointments: appointments.data || [],
  });
}
```

### Advanced Filters Component
```tsx
// components/filters/advanced-filters.tsx
interface FilterConfig<T> {
  key: keyof T;
  label: string;
  type: 'select' | 'date-range' | 'checkbox' | 'search';
  options?: { value: string; label: string }[];
}

export function AdvancedFilters<T>({
  filters,
  values,
  onChange,
  onReset,
}: {
  filters: FilterConfig<T>[];
  values: Partial<T>;
  onChange: (values: Partial<T>) => void;
  onReset: () => void;
}) {
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Content className="w-80 p-4 space-y-4">
        {filters.map((filter) => (
          <div key={String(filter.key)} className="space-y-2">
            <label className="text-sm font-medium">{filter.label}</label>

            {filter.type === 'select' && (
              <Select
                value={values[filter.key] as string}
                onValueChange={(v) => onChange({ ...values, [filter.key]: v })}
              >
                <Select.Trigger />
                <Select.Content>
                  {filter.options?.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}

            {filter.type === 'date-range' && (
              <DateRangePicker
                value={values[filter.key] as DateRange}
                onChange={(v) => onChange({ ...values, [filter.key]: v })}
              />
            )}

            {filter.type === 'checkbox' && (
              <Checkbox
                checked={values[filter.key] as boolean}
                onCheckedChange={(v) => onChange({ ...values, [filter.key]: v })}
              />
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onReset} className="flex-1">
            Limpiar
          </Button>
          <Button onClick={() => {}} className="flex-1">
            Aplicar
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
}
```

### Search History Hook
```typescript
// hooks/use-search-history.ts
export function useSearchHistory(key: string, maxItems = 10) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`search-history:${key}`);
    if (stored) setHistory(JSON.parse(stored));
  }, [key]);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setHistory((prev) => {
      const filtered = prev.filter((q) => q !== query);
      const updated = [query, ...filtered].slice(0, maxItems);
      localStorage.setItem(`search-history:${key}`, JSON.stringify(updated));
      return updated;
    });
  }, [key, maxItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(`search-history:${key}`);
  }, [key]);

  return { history, addToHistory, clearHistory };
}
```

## Implementation Steps
1. Create command palette component
2. Build global search API endpoint
3. Implement search result rendering
4. Add keyboard navigation
5. Create advanced filters component
6. Implement search history
7. Add search analytics tracking

## Acceptance Criteria
- [ ] Cmd/Ctrl+K opens global search
- [ ] Results categorized by type
- [ ] Keyboard navigation works
- [ ] Recent searches shown
- [ ] Advanced filters on lists
- [ ] URL-synced filter state

## Search Categories
| Category | Fields Searched | Priority |
|----------|-----------------|----------|
| Pets | name, breed, microchip | High |
| Clients | name, email, phone | High |
| Appointments | pet name, service | Medium |
| Products | name, SKU | Medium |
| Invoices | invoice number | Low |

## Related Files
- `components/search/` - Search components
- `app/api/search/` - Search API
- `hooks/use-search-history.ts` - Search history

## Estimated Effort
- 12 hours
  - Command palette: 4h
  - Search API: 2h
  - Advanced filters: 3h
  - Search history: 2h
  - Testing: 1h
