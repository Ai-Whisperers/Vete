# RES-001: Migrate useEffect+fetch to TanStack Query

## Priority: P2 - Medium
## Category: Research / Technical Debt
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Affected Areas: All client components with data fetching

## Problem

**115 files** use the `useEffect + fetch` anti-pattern for data fetching while `@tanstack/react-query` is installed but only used in **5 files**. This means:

1. **No caching**: Every component mount triggers a new request
2. **No deduplication**: Same data fetched multiple times
3. **No background updates**: Stale data shown until manual refresh
4. **Boilerplate**: Every file has its own loading/error state management
5. **Race conditions**: No request cancellation on unmount
6. **No retry logic**: Failed requests stay failed

## Current State (Anti-Pattern)

```typescript
// Found in 115 files - example from components/admin/referrals-summary.tsx
const [stats, setStats] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/platform/referrals/summary')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchStats()
}, [])
```

### Files Using Anti-Pattern (115 total)

**Dashboard Components (30+ files):**
- `app/[clinic]/dashboard/inventory/client.tsx`
- `app/[clinic]/dashboard/campaigns/client.tsx`
- `app/[clinic]/dashboard/orders/client.tsx`
- `components/dashboard/stats-cards.tsx`
- `components/dashboard/activity-feed.tsx`
- `components/dashboard/revenue-widget.tsx`
- ...and 25+ more

**Portal Components (15+ files):**
- `app/[clinic]/portal/inventory/client.tsx`
- `app/[clinic]/portal/service-subscriptions/client.tsx`
- `app/[clinic]/portal/messages/[id]/page.tsx`
- ...

**Clinical Components (10+ files):**
- `components/clinical/growth-chart.tsx`
- `components/clinical/drug-search.tsx`
- `components/clinical/diagnosis-search.tsx`
- `components/clinical/dosage-calculator.tsx`
- ...

**Store Components (10+ files):**
- `app/[clinic]/store/product/[id]/client.tsx`
- `app/[clinic]/store/orders/client.tsx`
- `components/store/buy-again-section.tsx`
- ...

**Lab & Hospital (10+ files):**
- `components/lab/order-form.tsx`
- `components/lab/result-viewer.tsx`
- `components/hospital/hospital-dashboard.tsx`
- ...

### Files Using react-query (Only 5!)

- `app/[clinic]/store/client.tsx`
- `components/dashboard/waiting-room.tsx`
- `hooks/use-calendar-events.ts`
- `components/appointments/reschedule-dialog.tsx`
- `_archive/poc/tanstack-query-poc.tsx` (POC file!)

## Proposed Solution

### 1. Create Query Hook Library

```typescript
// lib/queries/index.ts
export * from './dashboard'
export * from './inventory'
export * from './appointments'
export * from './clinical'
export * from './store'
```

### 2. Query Keys Convention

```typescript
// lib/queries/keys.ts
export const queryKeys = {
  dashboard: {
    stats: (clinic: string) => ['dashboard', 'stats', clinic] as const,
    activity: (clinic: string) => ['dashboard', 'activity', clinic] as const,
  },
  inventory: {
    list: (clinic: string, filters: object) => ['inventory', 'list', clinic, filters] as const,
    detail: (id: string) => ['inventory', 'detail', id] as const,
  },
  // ...
}
```

### 3. Example Migration

**Before:**
```typescript
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch(`/api/inventory?clinic=${clinic}`)
    .then(r => r.json())
    .then(setProducts)
    .finally(() => setLoading(false))
}, [clinic])
```

**After:**
```typescript
import { useInventory } from '@/lib/queries/inventory'

const { data: products, isLoading } = useInventory(clinic, {
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### 4. Benefits

| Feature | useEffect+fetch | react-query |
|---------|-----------------|-------------|
| Caching | ❌ None | ✅ Automatic |
| Deduplication | ❌ None | ✅ Built-in |
| Background refresh | ❌ Manual | ✅ Automatic |
| Retry on failure | ❌ None | ✅ Configurable |
| Request cancellation | ❌ Manual | ✅ Automatic |
| Loading states | Manual setup | ✅ Built-in |
| Optimistic updates | ❌ Complex | ✅ Easy |
| Devtools | ❌ None | ✅ Available |

## Implementation Strategy

### Phase 1: Foundation (4 hours)
1. [ ] Create `lib/queries/` directory structure
2. [ ] Define `queryKeys.ts` convention
3. [ ] Create `QueryClientProvider` wrapper
4. [ ] Add react-query devtools for development

### Phase 2: High-Impact Components (12 hours)
5. [ ] Migrate dashboard stats components (4 files)
6. [ ] Migrate inventory components (3 files)
7. [ ] Migrate clinical tools (4 files)
8. [ ] Create shared hooks for common patterns

### Phase 3: Portal & Store (8 hours)
9. [ ] Migrate portal components (15 files)
10. [ ] Migrate store components (10 files)

### Phase 4: Remaining Components (12 hours)
11. [ ] Migrate remaining 70+ components
12. [ ] Remove boilerplate loading/error states
13. [ ] Document query patterns

### Phase 5: Advanced Features (4 hours)
14. [ ] Add optimistic updates for mutations
15. [ ] Configure stale times per query type
16. [ ] Add prefetching for navigation

## Acceptance Criteria

- [ ] Zero `useEffect + fetch` patterns for data loading
- [ ] All queries use react-query hooks
- [ ] Query keys follow consistent convention
- [ ] Shared loading/error UI components
- [ ] React Query Devtools available in development
- [ ] No regressions in functionality
- [ ] Performance improvement measurable (fewer network requests)

## Risk Assessment

**Medium Risk** - Large-scale migration but well-established pattern.

### Mitigation:
- Migrate one feature area at a time
- Keep old code until new version verified
- Use react-query's `enabled` option for gradual rollout
- Integration tests for critical data flows

## Estimated Effort

| Phase | Hours |
|-------|-------|
| Foundation | 4h |
| High-impact components | 12h |
| Portal & Store | 8h |
| Remaining components | 12h |
| Advanced features | 4h |
| **Total** | **40 hours (~1 week)** |

## Related Files

- `web/package.json` (react-query already installed v5.90.12)
- `web/app/providers.tsx` (needs QueryClientProvider)
- 115 files with useEffect+fetch pattern
- 5 files already using react-query (reference implementations)

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Migration Guide from useEffect](https://tanstack.com/query/latest/docs/react/guides/migrating-from-react-query)
- Existing POC: `web/_archive/poc/tanstack-query-poc.tsx`

---
*Created: January 2026*
*Source: Ralph Research Analysis*
*Anti-pattern count: 115 files using useEffect+fetch, 5 using react-query*
