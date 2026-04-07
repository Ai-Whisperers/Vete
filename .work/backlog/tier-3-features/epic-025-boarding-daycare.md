---
id: EPIC-025
title: "Boarding & Daycare"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-025: Boarding & Daycare

## Context
Kennel endpoints exist but the module is minimal. Boarding and daycare are significant revenue sources that need proper management features.

## Acceptance Criteria
- [ ] Boarding reservation system
- [ ] Kennel capacity management
- [ ] Check-in/check-out workflow
- [ ] Daily activity logging
- [ ] Feeding schedule management
- [ ] Photo/video sharing with owners
- [ ] Boarding billing integration

## Stories

### STORY-025.1: Create boarding reservation system
- **Status**: todo
- **Effort**: M
- **Description**: Build reservation system with date range, kennel type, and special needs
- **Files to touch**: src/app/(clinic)/boarding/, src/services/boarding/
- **Tests needed**: Reservations bookable with date range
- **Done when**: Boarding reservation system working

### STORY-025.2: Add kennel capacity management
- **Status**: todo
- **Effort**: M
- **Description**: Track kennel availability by size/type in real-time
- **Files to touch**: src/components/boarding/capacity.tsx, src/services/boarding/
- **Tests needed**: Capacity visible and prevents overbooking
- **Done when**: Kennel capacity management working

### STORY-025.3: Add boarding check-in/check-out workflow
- **Status**: todo
- **Effort**: M
- **Description**: Create check-in form (owner info, feeding, meds) and check-out (inspection, billing)
- **Files to touch**: src/components/boarding/checkin.tsx, src/components/boarding/checkout.tsx
- **Tests needed**: Full check-in/check-out workflow completes
- **Done when**: Check-in/check-out workflow functional

### STORY-025.4: Add daily activity logging
- **Status**: todo
- **Effort**: S
- **Description**: Allow staff to log daily activities (walks, play, feeding, behavior notes)
- **Files to touch**: src/components/boarding/daily-log.tsx
- **Tests needed**: Daily activities logged per pet
- **Done when**: Daily activity logging working

### STORY-025.5: Add feeding schedule management
- **Status**: todo
- **Effort**: S
- **Description**: Create feeding schedule with owner-specified diet and portions
- **Files to touch**: src/components/boarding/feeding.tsx
- **Tests needed**: Feeding schedule visible and trackable
- **Done when**: Feeding schedule management working

### STORY-025.6: Add photo/video sharing with owners
- **Status**: todo
- **Effort**: M
- **Description**: Allow staff to share photos/videos of boarded pets with owners
- **Files to touch**: src/components/boarding/media-share.tsx
- **Tests needed**: Owner receives pet photos during boarding
- **Done when**: Photo/video sharing working

### STORY-025.7: Add boarding billing integration
- **Status**: todo
- **Effort**: M
- **Description**: Integrate boarding stays with billing system (nightly rate, add-ons, discounts)
- **Files to touch**: src/services/boarding/billing.ts
- **Tests needed**: Boarding invoice generated at checkout
- **Done when**: Boarding billing integrated

## Technical Notes
Use a visual kennel grid layout for capacity management. Consider different kennel types: small, medium, large, luxury suite. Feeding schedules should support multiple meals per day.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
