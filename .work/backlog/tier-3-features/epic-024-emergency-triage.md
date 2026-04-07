---
id: EPIC-024
title: "Emergency & Triage"
tier: 3
priority: P3
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-024: Emergency & Triage

## Context
No emergency workflow exists. Clinics handling emergencies need triage assessment, priority queuing, and after-hours coordination.

## Acceptance Criteria
- [ ] Triage assessment form
- [ ] Priority queue for emergencies
- [ ] Emergency contact notification
- [ ] After-hours on-call scheduling
- [ ] Emergency protocol templates

## Stories

### STORY-024.1: Add triage assessment form
- **Status**: todo
- **Effort**: M
- **Description**: Create triage form with severity scoring (critical, urgent, semi-urgent, non-urgent)
- **Files to touch**: src/components/emergency/triage-form.tsx, src/services/emergency/
- **Tests needed**: Triage assessment scored and saved
- **Done when**: Triage assessment form functional

### STORY-024.2: Add priority queue for emergencies
- **Status**: todo
- **Effort**: M
- **Description**: Create queue management showing patients ordered by severity and wait time
- **Files to touch**: src/components/emergency/priority-queue.tsx
- **Tests needed**: Queue orders patients by severity
- **Done when**: Priority queue working

### STORY-024.3: Add emergency contact notification
- **Status**: todo
- **Effort**: S
- **Description**: Auto-notify on-call vet and clinic manager for critical cases
- **Files to touch**: src/services/emergency/notification.ts
- **Tests needed**: On-call vet notified for critical cases
- **Done when**: Emergency notifications working

### STORY-024.4: Add after-hours on-call scheduling
- **Status**: todo
- **Effort**: M
- **Description**: Create on-call rotation schedule and auto-routing
- **Files to touch**: src/components/emergency/on-call.tsx, src/services/scheduling/
- **Tests needed**: On-call schedule maintained and routed
- **Done when**: On-call scheduling functional

### STORY-024.5: Add emergency protocol templates
- **Status**: todo
- **Effort**: S
- **Description**: Create templates for common emergency protocols (CPR, poisoning, trauma)
- **Files to touch**: src/data/emergency-protocols/, src/components/emergency/
- **Tests needed**: Protocols accessible during emergencies
- **Done when**: Emergency protocol templates available

## Technical Notes
Use the Manchester Triage System adapted for veterinary use. Color-code severity: Red (immediate), Orange (very urgent), Yellow (urgent), Green (standard), Blue (non-urgent).

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
