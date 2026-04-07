---
id: EPIC-059
title: "Data Import & Migration"
tier: 6
priority: P6
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-059: Data Import & Migration

## Context
Clinics switching from other systems need data import tools. CSV import for patients, clients, and inventory is the minimum requirement.

## Acceptance Criteria
- [ ] CSV import for patients
- [ ] CSV import for clients
- [ ] CSV import for inventory
- [ ] Migration tool from competing VMS
- [ ] Data validation on import

## Stories

### STORY-059.1: Add CSV import for patients
- **Status**: todo
- **Effort**: M
- **Description**: Create CSV import with field mapping for patient records
- **Files to touch**: src/app/(admin)/import/patients/, src/services/import/
- **Tests needed**: Patients imported from CSV successfully
- **Done when**: Patient CSV import working

### STORY-059.2: Add CSV import for clients
- **Status**: todo
- **Effort**: M
- **Description**: Create CSV import with field mapping for client records
- **Files to touch**: src/app/(admin)/import/clients/
- **Tests needed**: Clients imported from CSV successfully
- **Done when**: Client CSV import working

### STORY-059.3: Add CSV import for inventory
- **Status**: todo
- **Effort**: M
- **Description**: Create CSV import with field mapping for inventory items
- **Files to touch**: src/app/(admin)/import/inventory/
- **Tests needed**: Inventory imported from CSV successfully
- **Done when**: Inventory CSV import working

### STORY-059.4: Add migration tool from competing VMS
- **Status**: todo
- **Effort**: L
- **Description**: Create data migration tools for VetPraxis and Fichas Vet formats
- **Files to touch**: src/services/import/migrations/
- **Tests needed**: Data migrated from competitor systems
- **Done when**: Migration tools functional

### STORY-059.5: Add data validation and error reporting on import
- **Status**: todo
- **Effort**: M
- **Description**: Validate imported data and report errors clearly
- **Files to touch**: src/services/import/validator.ts
- **Tests needed**: Validation errors shown before import
- **Done when**: Import validation working

## Technical Notes
Use Papa Parse for CSV parsing. Provide downloadable CSV templates with expected columns. Allow field mapping UI so users can match their columns to system fields.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
