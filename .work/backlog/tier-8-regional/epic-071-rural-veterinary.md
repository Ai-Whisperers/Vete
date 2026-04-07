---
id: EPIC-071
title: "Rural Veterinary Features"
tier: 8
priority: P8
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-071: Rural Veterinary Features

## Context
Paraguay's rural areas have limited connectivity and different veterinary needs focused on livestock. Need offline mode, mobile-first field visits, and GPS tracking.

## Acceptance Criteria
- [ ] Offline mode for no-internet areas
- [ ] Mobile-first field visit workflow
- [ ] GPS-based farm visit tracking
- [ ] Herd management basics
- [ ] Simplified UI for low bandwidth

## Stories

### STORY-071.1: Add offline mode for areas without internet
- **Status**: todo
- **Effort**: L
- **Description**: Implement offline-first architecture for rural use
- **Files to touch**: src/lib/offline/, src/service-worker.ts
- **Tests needed**: App functions without internet
- **Done when**: Offline mode functional

### STORY-071.2: Add mobile-first field visit workflow
- **Status**: todo
- **Effort**: M
- **Description**: Create streamlined mobile interface for field veterinary visits
- **Files to touch**: src/app/(field)/, src/components/field/
- **Tests needed**: Field visit workflow works on mobile
- **Done when**: Field visit workflow functional

### STORY-071.3: Add GPS-based farm visit tracking
- **Status**: todo
- **Effort**: M
- **Description**: Track farm visit locations using GPS for route optimization
- **Files to touch**: src/services/field/gps.ts, src/components/field/
- **Tests needed**: Farm visits GPS-tracked and mapped
- **Done when**: GPS tracking working

### STORY-071.4: Add herd management basics (cattle)
- **Status**: todo
- **Effort**: L
- **Description**: Basic herd management: count, ear tags, health status, movements
- **Files to touch**: src/services/livestock/herd.ts, src/app/(clinic)/livestock/
- **Tests needed**: Herds managed with basic features
- **Done when**: Herd management functional

### STORY-071.5: Add simplified UI for low-bandwidth connections
- **Status**: todo
- **Effort**: M
- **Description**: Create minimal UI mode that works on slow connections
- **Files to touch**: src/components/lite/, src/lib/bandwidth-detect.ts
- **Tests needed**: App usable on 2G connections
- **Done when**: Low-bandwidth UI working

## Technical Notes
Rural Paraguay often has only 2G/3G coverage. Offline mode must sync when connection is restored. GPS tracking is useful for SENACSA movement permits. Cattle ear tags follow SENACSA numbering.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
