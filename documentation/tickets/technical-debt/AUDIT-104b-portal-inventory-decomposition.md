# AUDIT-104b: Portal Inventory Client Decomposition

## Priority: P2 - Medium
## Category: Refactoring / Technical Debt
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Parent Ticket: [AUDIT-104](./AUDIT-104-large-component-decomposition.md)

## Description

Decompose the portal inventory client (1242 lines) into smaller, focused components. This is the customer-facing product browsing experience.

## Current State

**File**: `web/app/[clinic]/portal/inventory/client.tsx`
**Lines**: 1242
**Console.logs**: 5
**Issues**:
- Product grid and list views in single file
- Filter logic mixed with presentation
- Cart integration embedded
- Wishlist functionality embedded

## Current Responsibilities

1. Product listing (grid/list views)
2. Category filtering
3. Search functionality
4. Price range filtering
5. Stock status filtering
6. Sorting (price, name, popularity)
7. Add to cart functionality
8. Wishlist toggle
9. "Notify when available" signup
10. Pagination
11. Product quick view modal

## Proposed Component Structure

```
components/portal/inventory/
├── PortalInventoryClient.tsx      # Main orchestrator (~200 lines)
├── ProductGrid.tsx                # Grid view layout (~150 lines)
├── ProductList.tsx                # List view layout (~150 lines)
├── ProductCard.tsx                # Individual product card (~200 lines)
├── InventoryFilters/
│   ├── index.tsx                  # Filter sidebar (~150 lines)
│   ├── CategoryFilter.tsx         # Category tree (~80 lines)
│   ├── PriceRangeFilter.tsx       # Price slider (~60 lines)
│   └── StockFilter.tsx            # In stock toggle (~40 lines)
├── InventorySortBar.tsx           # Sort + view toggle (~80 lines)
├── ProductQuickView.tsx           # Modal preview (~150 lines)
├── hooks/
│   └── usePortalInventory.ts      # Data fetching + filtering (~200 lines)
└── types.ts                       # Shared types (~30 lines)
```

## Implementation Steps

### Phase 1: Setup
1. [ ] Create `components/portal/inventory/` directory
2. [ ] Create `types.ts` with product/filter types
3. [ ] Create `usePortalInventory` hook for data fetching

### Phase 2: Extract Components
4. [ ] Extract `ProductCard` component
5. [ ] Extract `ProductGrid` component
6. [ ] Extract `ProductList` component
7. [ ] Extract `InventoryFilters/` components
8. [ ] Extract `InventorySortBar` component
9. [ ] Extract `ProductQuickView` modal

### Phase 3: Integration
10. [ ] Create `PortalInventoryClient` orchestrator
11. [ ] Update page.tsx to use client component
12. [ ] Remove all console.log statements
13. [ ] Create barrel export

### Phase 4: Testing
14. [ ] Test all filter combinations
15. [ ] Test cart integration
16. [ ] Test wishlist functionality
17. [ ] Test responsive behavior

## Acceptance Criteria

- [ ] Main client file under 200 lines
- [ ] Each component under 200 lines
- [ ] All 5 console.log statements removed
- [ ] Grid/list view toggle works
- [ ] All filters work correctly
- [ ] Cart add functionality preserved
- [ ] Wishlist toggle preserved
- [ ] Quick view modal works
- [ ] Proper TypeScript types

## Related Files

- `web/app/[clinic]/portal/inventory/client.tsx` (source)
- `web/app/[clinic]/portal/inventory/page.tsx` (server component)
- `web/components/cart/cart-item.tsx` (related)

## Estimated Effort

- 6-8 hours

## Dependencies

- Cart context/store must be accessible to extracted components
- Wishlist API must remain stable
