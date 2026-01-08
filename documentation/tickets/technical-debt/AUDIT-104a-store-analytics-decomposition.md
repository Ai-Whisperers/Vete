# AUDIT-104a: Store Analytics Page Decomposition

## Priority: P2 - Medium
## Category: Refactoring / Technical Debt
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Parent Ticket: [AUDIT-104](./AUDIT-104-large-component-decomposition.md)

## Description

Decompose the store analytics page (1451 lines) into smaller, focused chart components. This page handles multiple analytics visualizations that should be separate components.

## Current State

**File**: `web/app/[clinic]/dashboard/analytics/store/page.tsx`
**Lines**: 1451
**Console.logs**: 1
**Issues**:
- Multiple chart types in single file
- Data fetching mixed with presentation
- Hardcoded chart configurations

## Current Responsibilities

1. Sales overview metrics (revenue, orders, avg order value)
2. Revenue by day chart (line chart)
3. Top selling products (bar chart)
4. Sales by category (pie chart)
5. Customer acquisition chart
6. Inventory turnover metrics
7. Date range selector
8. Data fetching and aggregation

## Proposed Component Structure

```
components/analytics/store/
├── StoreAnalyticsClient.tsx       # Main orchestrator (~200 lines)
├── SalesOverviewCards.tsx         # KPI cards (~100 lines)
├── RevenueChart.tsx               # Line chart for revenue (~150 lines)
├── TopProductsChart.tsx           # Bar chart for products (~150 lines)
├── CategorySalesChart.tsx         # Pie chart for categories (~120 lines)
├── CustomerAcquisitionChart.tsx   # Customer metrics (~150 lines)
├── InventoryTurnoverPanel.tsx     # Inventory metrics (~120 lines)
├── DateRangeSelector.tsx          # Period selector (~80 lines)
├── hooks/
│   └── useStoreAnalytics.ts       # Data fetching hook (~150 lines)
└── types.ts                       # Shared types (~50 lines)
```

## Implementation Steps

### Phase 1: Setup
1. [ ] Create `components/analytics/store/` directory
2. [ ] Create `types.ts` with shared analytics types
3. [ ] Create `useStoreAnalytics` hook for data fetching

### Phase 2: Extract Components
4. [ ] Extract `DateRangeSelector` component
5. [ ] Extract `SalesOverviewCards` component
6. [ ] Extract `RevenueChart` component
7. [ ] Extract `TopProductsChart` component
8. [ ] Extract `CategorySalesChart` component
9. [ ] Extract `CustomerAcquisitionChart` component
10. [ ] Extract `InventoryTurnoverPanel` component

### Phase 3: Integration
11. [ ] Create `StoreAnalyticsClient` orchestrator
12. [ ] Update page.tsx to use client component
13. [ ] Remove console.log statement
14. [ ] Create barrel export

### Phase 4: Testing
15. [ ] Add unit tests for each chart component
16. [ ] Test date range changes
17. [ ] Test loading states
18. [ ] Verify data accuracy

## Acceptance Criteria

- [ ] Main page file under 100 lines (server component)
- [ ] Client orchestrator under 200 lines
- [ ] Each chart component under 150 lines
- [ ] Data fetching centralized in hook
- [ ] All charts render correctly
- [ ] Date range filtering works
- [ ] Loading skeletons for each section
- [ ] No console.log statements
- [ ] Proper TypeScript types
- [ ] Reusable chart components for other analytics pages

## Related Files

- `web/app/[clinic]/dashboard/analytics/store/page.tsx` (source)
- `web/app/[clinic]/dashboard/analytics/page.tsx` (main analytics)
- `web/app/[clinic]/dashboard/analytics/customers/page.tsx` (related)
- `web/components/dashboard/revenue-chart.tsx` (existing, may reuse)
- `web/components/dashboard/appointments-chart.tsx` (existing, may reuse)

## Estimated Effort

- 8-10 hours

## Dependencies

- Chart library (recharts) understanding
- API endpoints must remain stable
