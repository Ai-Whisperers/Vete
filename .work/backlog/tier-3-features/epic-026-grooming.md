---
id: EPIC-026
title: "Grooming Module"
tier: 3
priority: P3
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-026: Grooming Module

## Context
Grooming is not implemented. Many vet clinics offer grooming services as an additional revenue stream.

## Acceptance Criteria
- [ ] Grooming service catalog
- [ ] Grooming appointment booking
- [ ] Groomer assignment and scheduling
- [ ] Grooming history per pet
- [ ] Before/after photos

## Stories

### STORY-026.1: Add grooming service catalog
- **Status**: todo
- **Effort**: S
- **Description**: Create catalog of grooming services with pricing (bath, haircut, nails, etc.)
- **Files to touch**: src/app/(clinic)/grooming/, src/services/grooming/
- **Tests needed**: Grooming services listed with prices
- **Done when**: Grooming catalog functional

### STORY-026.2: Add grooming appointment booking
- **Status**: todo
- **Effort**: M
- **Description**: Integrate grooming into appointment system with specific service selection
- **Files to touch**: src/components/grooming/booking.tsx, src/services/appointment/
- **Tests needed**: Grooming appointments bookable
- **Done when**: Grooming booking integrated

### STORY-026.3: Add groomer assignment and scheduling
- **Status**: todo
- **Effort**: M
- **Description**: Assign groomers to appointments with availability management
- **Files to touch**: src/components/grooming/schedule.tsx
- **Tests needed**: Groomers assigned to appointments
- **Done when**: Groomer scheduling working

### STORY-026.4: Add grooming history per pet
- **Status**: todo
- **Effort**: S
- **Description**: Track grooming history with notes and preferences per pet
- **Files to touch**: src/components/grooming/history.tsx
- **Tests needed**: Grooming history visible on pet profile
- **Done when**: Grooming history tracking working

### STORY-026.5: Add before/after photos
- **Status**: todo
- **Effort**: S
- **Description**: Allow uploading before/after grooming photos
- **Files to touch**: src/components/grooming/photos.tsx
- **Tests needed**: Before/after photos uploaded and displayed
- **Done when**: Before/after photo feature working

## Technical Notes
Grooming services vary by pet size and coat type. Allow configurable pricing tiers. Consider adding a 'pet preferences' field (e.g., 'nervous with dryers', 'prefers scissor cut').

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
