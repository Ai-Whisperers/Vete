---
id: EPIC-036
title: "Compliance & Audit"
tier: 4
priority: P4
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-036: Compliance & Audit

## Context
No comprehensive audit trail exists. Controlled substance tracking, data retention policies, and compliance reporting are needed for regulatory requirements.

## Acceptance Criteria
- [ ] Comprehensive audit trail for all data changes
- [ ] Controlled substance DEA-style logging
- [ ] Veterinary compliance standards met
- [ ] Data retention policies implemented
- [ ] Compliance reporting dashboard

## Stories

### STORY-036.1: Add comprehensive audit trail for all data changes
- **Status**: todo
- **Effort**: L
- **Description**: Implement audit logging for all create/update/delete operations
- **Files to touch**: src/services/audit/, supabase/migrations/
- **Tests needed**: All data changes logged with who/what/when
- **Done when**: Audit trail comprehensive and queryable

### STORY-036.2: Add controlled substance DEA logging
- **Status**: todo
- **Effort**: M
- **Description**: Implement strict logging for controlled substance handling
- **Files to touch**: src/services/pharmacy/dea-log.ts
- **Tests needed**: Controlled substance usage fully auditable
- **Done when**: DEA-style logging compliant

### STORY-036.3: Add HIPAA-equivalent compliance (veterinary standards)
- **Status**: todo
- **Effort**: M
- **Description**: Implement data protection measures equivalent to HIPAA for veterinary records
- **Files to touch**: src/middleware.ts, src/services/auth/
- **Tests needed**: Data protection measures in place
- **Done when**: Compliance measures implemented

### STORY-036.4: Add data retention policies and automated archival
- **Status**: todo
- **Effort**: M
- **Description**: Implement configurable data retention with automatic archival
- **Files to touch**: src/services/data/retention.ts, src/app/api/cron/archive/
- **Tests needed**: Old data archived per policy
- **Done when**: Data retention automation working

### STORY-036.5: Add compliance reporting dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Create dashboard showing compliance status across all areas
- **Files to touch**: src/app/(admin)/compliance/
- **Tests needed**: Compliance status visible at a glance
- **Done when**: Compliance dashboard functional

## Technical Notes
Use Supabase's built-in audit logging capabilities. For controlled substances, Paraguay follows DINAVISA regulations. Audit trail should be immutable - use append-only tables.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
