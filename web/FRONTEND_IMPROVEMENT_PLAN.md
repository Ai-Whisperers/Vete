# Frontend Improvement Plan

## Executive Summary

This document outlines a comprehensive refactoring and improvement strategy for the Vete veterinary platform frontend. The analysis identified **290 components**, **14 hooks**, **2 contexts**, and **80+ API routes** with various opportunities for consolidation, modularization, and optimization.

---

## 1. QUICK WINS (Implement Immediately)

### 1.1 Fix Hook Export Gap

**File**: `hooks/index.ts`
**Issue**: `useAuthRedirect` is not exported
**Fix**:

```typescript
// Add to hooks/index.ts
export { useAuthRedirect } from './useAuthRedirect'
```

### 1.2 Merge Product Cards

**Files**:

- `components/store/product-card.tsx` (147 lines)
- `components/store/enhanced-product-card.tsx` (305 lines)

**Problem**: Two components doing 80% the same thing with different interfaces

**Solution**: Create unified `ProductCard` with feature flags:

```typescript
interface ProductCardProps {
  product: StoreProductWithDetails
  clinic: string
  variant?: 'minimal' | 'full' // 'minimal' = old ProductCard, 'full' = EnhancedProductCard
  showWishlist?: boolean
  showQuickView?: boolean
  onQuickView?: (product: StoreProductWithDetails) => void
}
```

### 1.3 Add Missing Type Exports

**File**: `lib/types/index.ts`
**Action**: Create barrel export for all types:

```typescript
export * from './appointments'
export * from './store'
export * from './clinic-config'
export * from './database'
export * from './errors'
export * from './services'
export * from './staff'
export * from './settings'
```

---

## 2. COMPONENT REFACTORING STRATEGY

### 2.1 Large Components to Split

| Component                 | Lines | Split Strategy                                                                 |
| ------------------------- | ----- | ------------------------------------------------------------------------------ |
| `bulk-messaging.tsx`      | 541   | Extract: `ClientSelector`, `MessageComposer`, `MessagePreview`, `SendProgress` |
| `network-map.tsx`         | 541   | Extract: `ClinicList`, `ClinicFilters`, `MapView`, `ClinicDetails`             |
| `prescription-upload.tsx` | 486   | Extract: `FileDropzone`, `PrescriptionPreview`, `UploadProgress`               |
| `quick-view-modal.tsx`    | 429   | Extract: `ProductGallery`, `ProductInfo`, `ProductActions`                     |
| `search-autocomplete.tsx` | 414   | Extract: `SearchInput`, `SearchResults`, `SearchHistory`                       |

### 2.2 Component Composition Pattern

**Current (Monolithic)**:

```typescript
<QuickViewModal product={product} />
```

**Proposed (Composable)**:

```typescript
<QuickView product={product}>
  <QuickView.Gallery />
  <QuickView.Info />
  <QuickView.Actions />
</QuickView>
```

---

## 3. HOOK CONSOLIDATION

### 3.1 Create Missing Hooks

#### `useFormSubmit` - Replace 20+ duplicate form handlers

```typescript
// hooks/use-form-submit.ts
export function useFormSubmit<T>(
  action: (data: T) => Promise<{ success: boolean; error?: string }>,
  options?: {
    onSuccess?: () => void
    onError?: (error: string) => void
    resetOnSuccess?: boolean
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const submit = async (data: T) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await action(data)
      if (result.success) {
        setIsSuccess(true)
        options?.onSuccess?.()
      } else {
        setError(result.error || 'Error')
        options?.onError?.(result.error || 'Error')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
      options?.onError?.(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting, error, isSuccess, reset: () => setError(null) }
}
```

#### `useFilters` - Replace 15+ filtering implementations

```typescript
// hooks/use-filters.ts
export function useFilters<T>(items: T[], filterConfigs: FilterConfig[]) {
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredItems = useMemo(() => {
    let result = [...items]
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== 'all') {
        result = result.filter((item) => item[key] === value)
      }
    }
    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
      })
    }
    return result
  }, [items, filters, sortBy, sortOrder])

  return {
    filteredItems,
    filters,
    setFilter: (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value })),
    clearFilters: () => setFilters({}),
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  }
}
```

#### `usePagination` - Standardize pagination across lists

```typescript
// hooks/use-pagination.ts
export function usePagination<T>(
  items: T[],
  options: { pageSize?: number; initialPage?: number } = {}
) {
  const { pageSize = 10, initialPage = 1 } = options
  const [page, setPage] = useState(initialPage)

  const totalPages = Math.ceil(items.length / pageSize)
  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize)

  return {
    items: paginatedItems,
    page,
    setPage,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  }
}
```

### 3.2 Update Hook Exports ✅ IMPLEMENTED

```typescript
// hooks/index.ts - Current state after implementation
export { useAsyncData } from './use-async-data'
export { useAuthRedirect } from './useAuthRedirect' // ✅ Fixed
export { useDebounce } from './use-debounce'
export { useExpandableSections } from './use-expandable-sections'
export { useFilterData } from './use-filter-data'
export { useFilters, createFilterOptions } from './use-filters' // ✅ NEW
export { useForm } from './use-form'
export { useFormSubmit, wrapServerAction } from './use-form-submit' // ✅ NEW
export { useModal } from './use-modal'
export { useKeyboardShortcuts } from './use-keyboard-shortcuts'
export { useLocalStorage } from './use-local-storage'
export { usePagination, getPaginationInfo } from './use-pagination' // ✅ NEW
export { useSearch, useSearchWithHistory } from './use-search'
export { useCommandPalette } from './use-command-palette'
```

---

## 4. CONTEXT IMPROVEMENTS

### 4.1 Missing Contexts to Add

#### `ThemeContext` - Clinic-specific theming

```typescript
// context/theme-context.tsx
interface ThemeContextType {
  colors: ClinicColors
  labels: ClinicLabels
  config: ClinicConfig
}
```

#### `FiltersContext` - Shared filter state across dashboard

```typescript
// context/filters-context.tsx
interface FiltersContextType {
  dashboardFilters: {
    dateRange: DateRange
    status: string
    search: string
  }
  setFilter: (key: string, value: any) => void
  resetFilters: () => void
}
```

#### `NotificationContext` - Toast/alert system

```typescript
// context/notification-context.tsx
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (n: Notification) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}
```

### 4.2 Refactor CartContext

**Current Problem**: CartContext handles too much (UI state + DB sync + validation)

**Split into**:

- `CartContext` - Cart items and operations
- `useCartSync` hook - Database synchronization logic
- `useStockValidation` hook - Stock checking logic

---

## 5. TYPE ORGANIZATION

### 5.1 Move Inline Types to `/lib/types/`

**Current**: Types defined inside components

```typescript
// components/dashboard/bulk-messaging.tsx
interface Client { ... }
interface FilterOption { ... }
```

**Target**: Centralized type definitions

```typescript
// lib/types/messaging.ts
export interface Client { ... }
export interface FilterOption { ... }
export type MessageChannel = "whatsapp" | "email" | "sms";
```

### 5.2 Create Component Props Types

```
lib/types/
├── components/
│   ├── product-card.ts
│   ├── quick-view-modal.ts
│   ├── bulk-messaging.ts
│   └── index.ts
├── domain/
│   ├── appointments.ts
│   ├── pets.ts
│   ├── store.ts
│   └── index.ts
└── index.ts
```

---

## 6. UTILITY REORGANIZATION

### 6.1 Current State

```
lib/
├── utils/              # General utilities
├── calendar-utils.ts   # Should be in utils/
├── api-utils.ts        # Should be in utils/
└── domain/             # Business logic
```

### 6.2 Target Structure

```
lib/
├── utils/
│   ├── formatting.ts     # Date, currency, etc.
│   ├── validation.ts     # Input validation
│   ├── memoize.ts        # Performance
│   ├── calendar.ts       # Move here
│   ├── api.ts            # Move here
│   └── index.ts
├── domain/
│   ├── pets/
│   │   ├── size.ts       # Move from utils/pet-size.ts
│   │   ├── age.ts
│   │   └── index.ts
│   ├── appointments/
│   ├── store/
│   └── index.ts
└── schemas/              # Zod schemas (keep as-is)
```

---

## 7. SHARED COMPONENT LIBRARY

### 7.1 Create Reusable UI Components

#### DataTable Component

```typescript
// components/ui/data-table.tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: boolean
  sorting?: boolean
  filtering?: boolean
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
}
```

#### FilterBar Component

```typescript
// components/ui/filter-bar.tsx
interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onClear: () => void
}
```

#### StatCard Component

```typescript
// components/ui/stat-card.tsx
interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; direction: 'up' | 'down' }
  color?: 'blue' | 'green' | 'purple' | 'orange'
}
```

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: Quick Wins (1-2 days)

- [x] Fix hook export gap (`useAuthRedirect` added to `hooks/index.ts`)
- [x] Add type barrel exports (comprehensive export in `lib/types/index.ts`)
- [x] Merge product cards (`ProductCard` now supports `variant='minimal'|'full'`)

### Phase 2: Hook Consolidation (3-5 days)

- [x] Create `useFormSubmit` (`hooks/use-form-submit.ts` - 155 lines)
- [x] Create `useFilters` (`hooks/use-filters.ts` - 268 lines)
- [x] Create `usePagination` (`hooks/use-pagination.ts` - 195 lines)
- [x] Migrate components to use new hooks:
  - `components/invoices/record-payment-dialog.tsx` - uses `useFormSubmit`
  - `components/appointments/reschedule-dialog.tsx` - uses `useFormSubmit`

### Phase 3: Component Splitting (5-7 days)

- [ ] Split `bulk-messaging.tsx`
- [ ] Split `quick-view-modal.tsx`
- [ ] Split `network-map.tsx`
- [ ] Create composition patterns

### Phase 4: Context Improvements (3-5 days)

- [ ] Create `ThemeContext`
- [ ] Refactor `CartContext`
- [x] Add `NotificationContext` (`context/notification-context.tsx` - enhanced toast system with:
  - Multiple notification types (success, error, warning, info)
  - Support for multiple concurrent notifications
  - Dismissible notifications with auto-dismiss
  - Action buttons on notifications
  - Convenience methods: `success()`, `error()`, `warning()`, `info()`)

### Phase 5: Type Organization (2-3 days)

- [ ] Move inline types to `/lib/types/`
- [ ] Create component props types
- [ ] Update imports across codebase

### Phase 6: Utility Cleanup (1-2 days)

- [ ] Reorganize `/lib/utils/`
- [ ] Create `/lib/domain/` structure
- [ ] Update imports

---

## 9. CODE PATTERNS TO ENFORCE

### 9.1 Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import type { ComponentProps } from '@/lib/types/components';

// 2. Types (if not imported)
interface LocalState { ... }

// 3. Component
export function Component({ prop1, prop2 }: ComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState();

  // 3b. Derived state
  const computed = useMemo(() => ..., [deps]);

  // 3c. Event handlers
  const handleClick = () => { ... };

  // 3d. Render
  return ( ... );
}

// 4. Sub-components (if needed)
function SubComponent() { ... }
```

### 9.2 Hook Structure

```typescript
// hooks/use-feature.ts
export interface UseFeatureOptions { ... }
export interface UseFeatureReturn { ... }

export function useFeature(options: UseFeatureOptions): UseFeatureReturn {
  // Implementation
}
```

### 9.3 Context Structure

```typescript
// context/feature-context.tsx
interface FeatureContextType { ... }
const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) { ... }

export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) throw new Error('useFeature must be used within FeatureProvider');
  return context;
}
```

---

## 10. METRICS TO TRACK

| Metric                  | Current | Target | Status                      |
| ----------------------- | ------- | ------ | --------------------------- |
| Components > 400 lines  | 10      | 0      | In Progress                 |
| Hooks in `/hooks/`      | 17      | 20+    | **+3 new hooks**            |
| Context providers       | 2       | 5      | Pending                     |
| Type files              | ~20     | 30+    | Pending                     |
| Duplicate code patterns | ~15     | 0      | **-1 (ProductCard merged)** |
| Missing hook exports    | 0       | 0      | **Complete**                |

---

## Appendix: Files to Modify

### High Priority

1. `hooks/index.ts` - Add missing exports
2. `components/store/product-card.tsx` - Merge with enhanced
3. `components/store/enhanced-product-card.tsx` - Delete after merge
4. `lib/types/index.ts` - Add barrel exports

### Medium Priority

5. `components/dashboard/bulk-messaging.tsx` - Split
6. `components/store/quick-view-modal.tsx` - Split
7. `components/landing/network-map.tsx` - Split
8. `context/cart-context.tsx` - Refactor

### Lower Priority

9. `lib/utils/` - Reorganize
10. Move `lib/calendar-utils.ts` to `lib/utils/calendar.ts`
11. Create `/lib/domain/` structure
