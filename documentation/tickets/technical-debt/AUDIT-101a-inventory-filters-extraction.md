# AUDIT-101a: Extract Inventory Filters Component

## Priority: P1 - High
## Category: Refactoring / Technical Debt
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Parent Ticket: [AUDIT-101](./AUDIT-101-god-component-inventory.md)

## Description

Extract the filtering logic from the inventory client into a dedicated `InventoryFilters` component. This includes search, category filter, status filter, and source filter.

## Current State

The filtering UI and logic is embedded in `web/app/[clinic]/dashboard/inventory/client.tsx` around lines 400-600, mixed with other concerns.

**Current filter state in parent:**
```typescript
const [search, setSearch] = useState('')
const [categoryFilter, setCategoryFilter] = useState<string>('all')
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
const [sourceFilter, setSourceFilter] = useState<ProductSource>('all')
```

## Proposed Solution

Create `components/dashboard/inventory/InventoryFilters.tsx`:

```typescript
interface InventoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  categories: Category[]
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void
  sourceFilter: ProductSource
  onSourceChange: (value: ProductSource) => void
  onClearFilters: () => void
  activeFilterCount: number
}

export function InventoryFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  onClearFilters,
  activeFilterCount,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      {/* Category dropdown */}
      {/* Status dropdown */}
      {/* Source tabs */}
      {/* Clear filters button */}
    </div>
  )
}
```

## Implementation Steps

1. [ ] Create `components/dashboard/inventory/InventoryFilters.tsx`
2. [ ] Define `InventoryFiltersProps` interface
3. [ ] Move filter UI elements from client.tsx
4. [ ] Keep state in parent, pass as props
5. [ ] Add `onClearFilters` functionality
6. [ ] Add `activeFilterCount` badge
7. [ ] Export from barrel file
8. [ ] Update parent component to use new component
9. [ ] Remove extracted code from client.tsx
10. [ ] Test filter functionality

## Acceptance Criteria

- [ ] InventoryFilters component is under 150 lines
- [ ] All filter types work correctly
- [ ] Clear filters resets all to defaults
- [ ] Active filter count displays correctly
- [ ] No functionality regression
- [ ] Proper TypeScript types (no `any`)

## Related Files

- `web/app/[clinic]/dashboard/inventory/client.tsx` (source)
- `web/components/dashboard/inventory/InventoryFilters.tsx` (new)
- `web/components/dashboard/inventory/index.ts` (barrel export)

## Estimated Effort

- 2-3 hours

## Dependencies

- None - can be done independently
