# AUDIT-104: Large Component Decomposition

## Priority: P2 - Medium
## Category: Refactoring / Technical Debt
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)

## Description

Several large components in the codebase exceed 1000 lines and would benefit from decomposition into smaller, more maintainable units. This ticket tracks the secondary components after the critical inventory client (AUDIT-101).

## Affected Files

| File | Lines | Priority |
|------|-------|----------|
| `dashboard/analytics/store/page.tsx` | 1451 | High |
| `portal/inventory/client.tsx` | 1242 | High |
| `dashboard/consents/templates/page.tsx` | 1171 | Medium |
| `dashboard/service-subscriptions/client.tsx` | 1028 | Medium |
| `landing/roi-calculator-detailed.tsx` | 1048 | Low |
| `dashboard/campaigns/client.tsx` | 959 | Low |
| `portal/service-subscriptions/client.tsx` | 950 | Low |

## Issues

1. **Maintainability** - Large files are harder to navigate and modify
2. **Testing** - Difficult to unit test specific functionality
3. **Code ownership** - Unclear boundaries for code review
4. **Performance** - Large components may have unnecessary re-renders
5. **Reusability** - Embedded logic cannot be shared

## Proposed Decomposition

### 1. Store Analytics Page (1451 lines)

Extract into:
```
components/analytics/store/
├── StoreAnalyticsClient.tsx     # Orchestrator
├── SalesOverviewChart.tsx       # Sales metrics
├── ProductPerformanceTable.tsx  # Top products
├── CustomerInsightsChart.tsx    # Customer analytics
├── InventoryHealthPanel.tsx     # Stock metrics
└── TimeRangeSelector.tsx        # Date filtering
```

### 2. Portal Inventory Client (1242 lines)

Extract into:
```
components/portal/inventory/
├── PortalInventoryClient.tsx    # Orchestrator
├── ProductGrid.tsx              # Product display
├── ProductFilters.tsx           # Filtering
├── ProductCard.tsx              # Individual product
└── WishlistToggle.tsx           # Wishlist button
```

### 3. Consent Templates Page (1171 lines)

Extract into:
```
components/dashboard/consents/
├── TemplateListClient.tsx       # Orchestrator
├── TemplateCard.tsx             # Template preview
├── TemplateEditor.tsx           # Edit form
├── TemplatePreview.tsx          # Preview modal
└── TemplateVersionHistory.tsx   # Version management
```

### 4. Service Subscriptions (1028 lines)

Extract into:
```
components/dashboard/subscriptions/
├── SubscriptionsClient.tsx      # Orchestrator
├── SubscriptionList.tsx         # List view
├── SubscriptionCard.tsx         # Individual sub
├── SubscriptionFilters.tsx      # Filtering
└── SubscriptionActions.tsx      # Pause/cancel etc
```

## Implementation Steps

1. [ ] Prioritize by business impact (analytics & inventory first)
2. [ ] Create component directory structure
3. [ ] Extract shared types to dedicated files
4. [ ] Extract UI components one at a time
5. [ ] Create barrel exports
6. [ ] Update imports in parent components
7. [ ] Add unit tests for extracted components
8. [ ] Remove console.log statements during extraction

## Acceptance Criteria

- [ ] Each affected file under 500 lines
- [ ] No functionality regression
- [ ] Components follow single responsibility principle
- [ ] Proper TypeScript types (no `any`)
- [ ] Unit tests for new components
- [ ] Clean barrel exports

## Related Tickets

- AUDIT-101 (Inventory Client - higher priority)
- AUDIT-103 (Console.log cleanup - do during extraction)

## Estimated Effort

| Component | Effort |
|-----------|--------|
| Store Analytics | 8-10 hours |
| Portal Inventory | 6-8 hours |
| Consent Templates | 6-8 hours |
| Service Subscriptions | 4-6 hours |
| **Total** | **24-32 hours** |

## Risk Assessment

- **Medium risk** - Large refactoring with potential for regressions
- Recommend extracting one component at a time with full testing
- Lower priority than AUDIT-101 (inventory dashboard)
- Some components may benefit from extraction during feature work
