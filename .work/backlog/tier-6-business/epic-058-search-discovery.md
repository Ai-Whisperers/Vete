---
id: EPIC-058
title: "Search & Discovery"
tier: 6
priority: P6
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-058: Search & Discovery

## Context
No global search exists. Users need to search across patients, clients, inventory, and records efficiently.

## Acceptance Criteria
- [ ] Global search across all entities
- [ ] Recent/frequently accessed items
- [ ] Saved searches/filters
- [ ] Barcode/QR scanner search
- [ ] Content indexed in Meilisearch

## Stories

### STORY-058.1: Add global search across all entities
- **Status**: todo
- **Effort**: M
- **Description**: Implement search that searches patients, clients, inventory, records
- **Files to touch**: src/components/search/global-search.tsx, src/services/search/
- **Tests needed**: Global search returns results from all entities
- **Done when**: Global search functional

### STORY-058.2: Add recent items / frequently accessed
- **Status**: todo
- **Effort**: S
- **Description**: Track and display recently accessed items for quick navigation
- **Files to touch**: src/services/search/recent.ts, src/components/search/
- **Tests needed**: Recent items visible in search dropdown
- **Done when**: Recent items working

### STORY-058.3: Add saved searches / filters
- **Status**: todo
- **Effort**: M
- **Description**: Allow saving search queries and filter combinations
- **Files to touch**: src/services/search/saved.ts, src/components/search/
- **Tests needed**: Saved searches accessible and reusable
- **Done when**: Saved searches functional

### STORY-058.4: Add barcode/QR scanner search
- **Status**: todo
- **Effort**: M
- **Description**: Search by scanning barcode or QR code on inventory/pets
- **Files to touch**: src/components/search/scanner.tsx
- **Tests needed**: Scanned code triggers search
- **Done when**: Scanner search working

### STORY-058.5: Index all content in Meilisearch
- **Status**: todo
- **Effort**: L
- **Description**: Set up Meilisearch and index all searchable content
- **Files to touch**: docker-compose.yml, src/services/search/meilisearch.ts
- **Tests needed**: All content indexed and searchable
- **Done when**: Meilisearch indexing working

## Technical Notes
Meilisearch is fast and easy to deploy via Docker. Use Cmd+K / Ctrl+K keyboard shortcut for global search. Index: patients, clients, inventory items, services, medical records.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
