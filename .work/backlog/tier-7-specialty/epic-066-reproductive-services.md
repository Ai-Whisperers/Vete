---
id: EPIC-066
title: "Reproductive Services"
tier: 7
priority: P7
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-066: Reproductive Services

## Context
Reproductive cycle tracking exists but needs enhancement. Breeding management, pregnancy monitoring, and whelping/kittening planning are important for breeders.

## Acceptance Criteria
- [ ] Enhanced reproductive cycle tracking
- [ ] Breeding management module
- [ ] Pregnancy monitoring timeline
- [ ] Whelping/kittening planning
- [ ] Puppy/kitten well-check schedule generator

## Stories

### STORY-066.1: Enhance reproductive cycle tracking
- **Status**: todo
- **Effort**: M
- **Description**: Improve existing reproductive cycle tracking with predictions
- **Files to touch**: src/services/reproductive/cycle.ts
- **Tests needed**: Cycle tracked with predicted dates
- **Done when**: Cycle tracking enhanced

### STORY-066.2: Add breeding management module
- **Status**: todo
- **Effort**: M
- **Description**: Create breeding record management with lineage tracking
- **Files to touch**: src/components/reproductive/breeding.tsx, src/services/reproductive/
- **Tests needed**: Breeding records managed with lineage
- **Done when**: Breeding management functional

### STORY-066.3: Add pregnancy monitoring timeline
- **Status**: todo
- **Effort**: M
- **Description**: Create pregnancy timeline with milestone monitoring
- **Files to touch**: src/components/reproductive/pregnancy.tsx
- **Tests needed**: Pregnancy milestones tracked and alerted
- **Done when**: Pregnancy monitoring working

### STORY-066.4: Add whelping/kittening planning
- **Status**: todo
- **Effort**: M
- **Description**: Create birth planning workflow with checklist and monitoring
- **Files to touch**: src/components/reproductive/whelping.tsx
- **Tests needed**: Birth plan created with checklist
- **Done when**: Whelping planning functional

### STORY-066.5: Add puppy/kitten well-check schedule generator
- **Status**: todo
- **Effort**: S
- **Description**: Auto-generate wellness check schedule for newborns
- **Files to touch**: src/services/reproductive/newborn-schedule.ts
- **Tests needed**: Well-check schedule generated for litter
- **Done when**: Newborn schedule generator working

## Technical Notes
Gestation periods: dogs ~63 days, cats ~65 days. Well-check schedule for puppies: 2, 4, 6, 8, 12, 16 weeks. Important for breeders who may be a significant client segment in Paraguay.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
