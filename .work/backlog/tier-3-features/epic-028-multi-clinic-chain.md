---
id: EPIC-028
title: "Multi-Clinic Chain Management"
tier: 3
priority: P3
status: backlog
estimated_effort: XL
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-028: Multi-Clinic Chain Management

## Context
Currently single-tenant per clinic. Clinic chains need centralized management, cross-location patient transfer, and consolidated reporting.

## Acceptance Criteria
- [ ] Clinic group/chain entity
- [ ] Cross-clinic patient transfer
- [ ] Consolidated chain reporting
- [ ] Shared inventory across locations
- [ ] Chain-level admin dashboard

## Stories

### STORY-028.1: Add clinic group/chain entity
- **Status**: todo
- **Effort**: L
- **Description**: Create data model and UI for grouping clinics under a chain/brand
- **Files to touch**: src/services/clinic/, src/types/clinic.ts, supabase/migrations/
- **Tests needed**: Clinics can be grouped under a chain
- **Done when**: Clinic chain entity working

### STORY-028.2: Add cross-clinic patient transfer
- **Status**: todo
- **Effort**: M
- **Description**: Allow transferring patient records between clinics in the same chain
- **Files to touch**: src/services/patient/transfer.ts
- **Tests needed**: Patient records transferable between clinics
- **Done when**: Cross-clinic transfer functional

### STORY-028.3: Add consolidated chain reporting
- **Status**: todo
- **Effort**: M
- **Description**: Create reports that aggregate data across all clinics in a chain
- **Files to touch**: src/components/reports/chain.tsx
- **Tests needed**: Chain-wide reports available
- **Done when**: Consolidated reporting working

### STORY-028.4: Add shared inventory across locations
- **Status**: todo
- **Effort**: M
- **Description**: Allow viewing and transferring inventory between chain locations
- **Files to touch**: src/services/inventory/chain.ts
- **Tests needed**: Inventory visible and transferable across locations
- **Done when**: Shared inventory functional

### STORY-028.5: Add chain-level admin dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Create dashboard for chain administrators with overview of all locations
- **Files to touch**: src/app/(admin)/chain/, src/components/chain/
- **Tests needed**: Chain admin sees all location data
- **Done when**: Chain admin dashboard working

## Technical Notes
Multi-tenancy design: each clinic is a tenant with its own data. Chain management adds a layer above tenants. Use Supabase Row Level Security (RLS) for data isolation.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
