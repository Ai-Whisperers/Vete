# REF-006: Decompose Massive Client Components

## Priority: P2 - Medium
## Category: Refactoring
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Affected Areas: web/app/[clinic]/dashboard/*, web/app/[clinic]/portal/*

## Description

Multiple client-side components have grown beyond 900+ lines, creating maintenance challenges, poor testability, and increased cognitive load. These "god components" handle too many responsibilities including UI rendering, state management, API calls, and business logic.

## Current State

### Critical Files (>900 lines)

| File | Lines | Responsibilities |
|------|-------|------------------|
| `app/[clinic]/dashboard/inventory/client.tsx` | **2122** | Import, Export, CRUD, Filtering, Pagination, Bulk Actions, Stats, Alerts, Scanning, History |
| `app/[clinic]/dashboard/analytics/store/page.tsx` | **1451** | Sales summary, charts, margins, turnover, coupons, filters |
| `app/[clinic]/portal/inventory/client.tsx` | **1242** | Similar to dashboard inventory |
| `app/[clinic]/dashboard/consents/templates/page.tsx` | **1171** | Templates CRUD, preview, fields, versioning |
| `components/landing/roi-calculator-detailed.tsx` | **1048** | Calculator logic, charts, animations, tabs |
| `app/[clinic]/dashboard/service-subscriptions/client.tsx` | **1028** | Subscriptions CRUD, filtering, pagination |
| `app/[clinic]/dashboard/campaigns/client.tsx` | **959** | Campaigns CRUD, scheduling, analytics |
| `app/[clinic]/portal/service-subscriptions/client.tsx` | **950** | Subscription management, similar to dashboard |
| `app/[clinic]/dashboard/coupons/client.tsx` | **910** | Coupons CRUD, validation, usage stats |
| `app/[clinic]/dashboard/orders/client.tsx` | **908** | Orders management, filtering, status updates |

### Code Smells Identified

1. **God Components**: Single files handling 10+ distinct responsibilities
2. **Inline Type Definitions**: Types defined inside components instead of separate files
3. **Duplicated Fetch Logic**: Same API fetching patterns repeated
4. **Inline State Machines**: Complex state transitions without clear structure
5. **Mixed Concerns**: UI, state, API calls all in one file

## Proposed Solution

### 1. Extract Custom Hooks

Move data fetching and state logic to dedicated hooks:

```typescript
// Before: 200+ lines of state and effects in component
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(true)
const [filters, setFilters] = useState(...)
const [pagination, setPagination] = useState(...)
// ... 50+ more state variables

// After: Clean hook abstraction
const {
  products,
  loading,
  filters,
  setFilters,
  pagination,
  goToPage,
  refetch
} = useInventoryData(clinic)
```

**Hooks to create:**
- `useInventoryData` - Product listing, filtering, pagination
- `useInventoryStats` - Dashboard stats
- `useInventoryAlerts` - Low stock, expiring alerts
- `useBulkSelection` - Generic bulk select hook (reusable)
- `useInventoryImport` - Import wizard state
- `useAnalyticsData` - Store analytics fetching
- `useSubscriptionManagement` - Subscriptions CRUD

### 2. Extract Subcomponents

Break large components into smaller, focused components:

```
dashboard/inventory/
├── client.tsx              # Main orchestrator (~200 lines)
├── components/
│   ├── inventory-table.tsx # Product table UI
│   ├── inventory-filters.tsx # Filter controls
│   ├── inventory-stats.tsx # Stats cards
│   ├── bulk-action-bar.tsx # Bulk selection UI
│   ├── product-edit-modal.tsx # Edit modal
│   └── product-detail-drawer.tsx # Detail view
├── hooks/
│   ├── use-inventory-data.ts
│   ├── use-inventory-stats.ts
│   └── use-bulk-selection.ts
└── types.ts                # Type definitions
```

### 3. Centralize Common Patterns

**Bulk Selection Hook** (reusable across inventory, orders, clients):
```typescript
// lib/hooks/use-bulk-selection.ts
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = (id: string) => {...}
  const toggleAll = () => {...}
  const clear = () => {...}
  const isAllSelected = selected.size === items.length
  return { selected, toggle, toggleAll, clear, isAllSelected }
}
```

**Pagination Hook** (already exists, ensure usage):
```typescript
// Already in lib/hooks - ensure all components use it
import { usePagination } from '@/lib/hooks'
```

### 4. Move Types to Separate Files

```typescript
// app/[clinic]/dashboard/inventory/types.ts
export interface Product { ... }
export interface InventoryStats { ... }
export interface ImportResult { ... }
```

## Implementation Steps

### Phase 1: Inventory Client (Highest Impact)
1. [ ] Extract types to `types.ts`
2. [ ] Create `use-inventory-data.ts` hook
3. [ ] Create `use-inventory-stats.ts` hook
4. [ ] Extract `InventoryTable` component
5. [ ] Extract `InventoryFilters` component
6. [ ] Extract `ProductEditModal` component
7. [ ] Refactor main `client.tsx` to orchestrate

### Phase 2: Analytics Store Page
1. [ ] Extract chart components
2. [ ] Create `use-analytics-data.ts` hook
3. [ ] Separate margin and turnover sections

### Phase 3: Other Large Components
1. [ ] Apply same pattern to remaining 8 files
2. [ ] Create shared hooks where patterns repeat

## Acceptance Criteria

- [ ] No client component exceeds 400 lines
- [ ] Each component has single responsibility
- [ ] Types in separate files
- [ ] Reusable hooks for common patterns
- [ ] All existing functionality preserved
- [ ] No regression in tests

## Benefits

- **Maintainability**: Easier to understand and modify
- **Testability**: Hooks and components testable in isolation
- **Reusability**: Hooks like `useBulkSelection` reusable
- **Performance**: Smaller components = better tree shaking
- **Code Review**: Changes isolated to specific concerns

## Related Files

- `web/app/[clinic]/dashboard/inventory/client.tsx`
- `web/app/[clinic]/dashboard/analytics/store/page.tsx`
- `web/app/[clinic]/portal/inventory/client.tsx`
- `web/app/[clinic]/dashboard/consents/templates/page.tsx`
- `web/components/landing/roi-calculator-detailed.tsx`
- `web/app/[clinic]/dashboard/service-subscriptions/client.tsx`
- `web/lib/hooks/` (extend with new hooks)

## Estimated Effort

| Phase | Files | Effort |
|-------|-------|--------|
| Phase 1: Inventory | 1 file → 6 files | 8-10 hours |
| Phase 2: Analytics | 1 file → 4 files | 4-5 hours |
| Phase 3: Others | 8 files | 12-16 hours |
| Testing | All | 4 hours |
| **Total** | | **28-35 hours** |

## Risk Assessment

**Medium Risk** - Large refactoring that could introduce regressions.

### Mitigation:
- Incremental changes (one component at a time)
- Maintain feature parity at each step
- Run full test suite after each phase
- Keep original file until refactor complete

---
*Created: January 2026*
*Based on codebase analysis finding 10 components over 900 lines*
