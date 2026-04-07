---
id: EPIC-073
title: "Real-time Features"
tier: 9
priority: P9
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-073: Real-time Features

## Context
Real-time features improve clinic operations: waiting room status boards, live appointment updates, instant messaging, and real-time inventory alerts.

## Acceptance Criteria
- [ ] Real-time waiting room status board
- [ ] Real-time appointment status updates
- [ ] Real-time messaging with WebSocket
- [ ] Real-time inventory alerts
- [ ] Live dashboard with real-time metrics

## Stories

### STORY-073.1: Add real-time waiting room status board
- **Status**: todo
- **Effort**: M
- **Description**: Create TV/tablet display showing waiting room status
- **Files to touch**: src/app/(clinic)/waiting-room/, src/services/realtime/
- **Tests needed**: Waiting room board updates in real-time
- **Done when**: Waiting room status board live

### STORY-073.2: Add real-time appointment status updates
- **Status**: todo
- **Effort**: M
- **Description**: Show live appointment status (checked in, in room, with vet, done)
- **Files to touch**: src/services/realtime/appointments.ts
- **Tests needed**: Appointment status updates instantly
- **Done when**: Real-time appointment status working

### STORY-073.3: Add real-time messaging with WebSocket
- **Status**: todo
- **Effort**: M
- **Description**: Implement real-time chat between staff using Supabase Realtime
- **Files to touch**: src/services/realtime/messaging.ts, src/components/messaging/
- **Tests needed**: Messages appear instantly for all users
- **Done when**: Real-time messaging working

### STORY-073.4: Add real-time inventory alerts
- **Status**: todo
- **Effort**: S
- **Description**: Alert staff instantly when inventory drops below threshold
- **Files to touch**: src/services/realtime/inventory.ts
- **Tests needed**: Low stock alerts appear in real-time
- **Done when**: Real-time inventory alerts working

### STORY-073.5: Add live dashboard with real-time metrics
- **Status**: todo
- **Effort**: M
- **Description**: Create dashboard with live-updating metrics (patients seen, revenue, wait time)
- **Files to touch**: src/components/dashboard/live-metrics.tsx
- **Tests needed**: Dashboard metrics update in real-time
- **Done when**: Live dashboard functional

## Technical Notes
Use Supabase Realtime for WebSocket connections. It handles subscriptions, presence, and broadcast out of the box. For the waiting room board, consider a dedicated /board route optimized for large screens.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
