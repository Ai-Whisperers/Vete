---
id: EPIC-030
title: "Inventory Enhancement"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-030: Inventory Enhancement

## Context
CRUD exists for inventory but smarter features are needed: demand forecasting, automatic reorder, vendor integration, lot/batch tracking, and expiry management.

## Acceptance Criteria
- [ ] AI-powered demand forecasting
- [ ] Automatic reorder point calculation
- [ ] Vendor EDI integration
- [ ] Lot number/batch tracking
- [ ] Expiry date management with FEFO
- [ ] Inventory valuation reports
- [ ] Multi-location inventory sync

## Stories

### STORY-030.1: Add AI-powered demand forecasting
- **Status**: todo
- **Effort**: L
- **Description**: Implement demand forecasting using historical usage data
- **Files to touch**: src/services/inventory/forecast.ts
- **Tests needed**: Forecast shows predicted demand for 30/60/90 days
- **Done when**: Demand forecasting functional

### STORY-030.2: Add automatic reorder point calculation
- **Status**: todo
- **Effort**: M
- **Description**: Calculate optimal reorder points based on usage velocity and lead time
- **Files to touch**: src/services/inventory/reorder.ts
- **Tests needed**: Reorder alerts trigger at calculated points
- **Done when**: Automatic reorder points working

### STORY-030.3: Add vendor EDI integration (electronic ordering)
- **Status**: todo
- **Effort**: L
- **Description**: Enable electronic ordering to major veterinary suppliers
- **Files to touch**: src/services/inventory/vendor.ts, src/app/api/integrations/edi/
- **Tests needed**: Orders sent electronically to vendors
- **Done when**: Vendor EDI integration functional

### STORY-030.4: Add lot number/batch tracking
- **Status**: todo
- **Effort**: M
- **Description**: Track lot numbers and batches for all inventory items
- **Files to touch**: src/services/inventory/lots.ts, supabase/migrations/
- **Tests needed**: Lot numbers tracked from receipt to dispensing
- **Done when**: Lot tracking working

### STORY-030.5: Add expiry date management with FEFO
- **Status**: todo
- **Effort**: M
- **Description**: Implement First Expired First Out logic for dispensing
- **Files to touch**: src/services/inventory/expiry.ts
- **Tests needed**: System suggests nearest-expiry items first
- **Done when**: FEFO dispensing working

### STORY-030.6: Add inventory valuation reports (FIFO, WAC)
- **Status**: todo
- **Effort**: M
- **Description**: Calculate inventory value using FIFO and weighted average cost methods
- **Files to touch**: src/services/inventory/valuation.ts, src/components/reports/inventory-value.tsx
- **Tests needed**: Inventory value reports available
- **Done when**: Valuation reports accurate

### STORY-030.7: Add multi-location inventory sync
- **Status**: todo
- **Effort**: M
- **Description**: Sync inventory levels across multiple clinic locations
- **Files to touch**: src/services/inventory/sync.ts
- **Tests needed**: Inventory synced across locations
- **Done when**: Multi-location sync working

## Technical Notes
For demand forecasting, start with simple moving average before adding ML models. FEFO (First Expired, First Out) is critical for medications and vaccines. Consider integrating with major Paraguayan veterinary suppliers.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
