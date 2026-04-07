---
id: EPIC-074
title: "Offline & Sync"
tier: 9
priority: P9
status: backlog
estimated_effort: XL
dependencies: [EPIC-027]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-074: Offline & Sync

## Context
Full offline capability with IndexedDB storage, conflict resolution, and background sync when connection is restored. Critical for rural Paraguay.

## Acceptance Criteria
- [ ] IndexedDB storage for offline data
- [ ] Conflict resolution for offline changes
- [ ] Background sync when connection restored
- [ ] Offline appointment recording
- [ ] Offline medical record creation

## Stories

### STORY-074.1: Add IndexedDB storage for offline data
- **Status**: todo
- **Effort**: L
- **Description**: Implement IndexedDB layer for storing data offline
- **Files to touch**: src/lib/offline/indexeddb.ts
- **Tests needed**: Data stored locally when offline
- **Done when**: IndexedDB storage working

### STORY-074.2: Add conflict resolution for offline changes
- **Status**: todo
- **Effort**: L
- **Description**: Implement CRDT or last-write-wins conflict resolution for concurrent edits
- **Files to touch**: src/lib/offline/conflict-resolution.ts
- **Tests needed**: Conflicts resolved automatically or flagged
- **Done when**: Conflict resolution working

### STORY-074.3: Add background sync when connection restored
- **Status**: todo
- **Effort**: M
- **Description**: Queue changes offline and sync when connection returns
- **Files to touch**: src/lib/offline/sync.ts, src/service-worker.ts
- **Tests needed**: Queued changes sync on reconnect
- **Done when**: Background sync working

### STORY-074.4: Add offline appointment recording
- **Status**: todo
- **Effort**: M
- **Description**: Allow creating/updating appointments while offline
- **Files to touch**: src/lib/offline/appointments.ts
- **Tests needed**: Appointments created offline sync when online
- **Done when**: Offline appointments functional

### STORY-074.5: Add offline medical record creation
- **Status**: todo
- **Effort**: M
- **Description**: Allow creating medical records while offline
- **Files to touch**: src/lib/offline/medical-records.ts
- **Tests needed**: Medical records created offline sync when online
- **Done when**: Offline medical records functional

## Technical Notes
Use Dexie.js for IndexedDB abstraction. For conflict resolution, consider CRDTs (Yjs) for collaborative editing or simpler last-write-wins for most data. Service Worker handles background sync.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
