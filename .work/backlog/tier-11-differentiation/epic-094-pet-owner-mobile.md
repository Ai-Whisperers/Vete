---
id: EPIC-094
title: "Pet Owner Mobile Experience"
tier: 11
priority: P11
status: backlog
estimated_effort: M
dependencies: [EPIC-027]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-094: Pet Owner Mobile Experience

## Context
Create a native-like mobile experience for pet owners with bottom navigation, health dashboard widget, quick actions, photo gallery, and milestone tracking.

## Acceptance Criteria
- [ ] Native-like PWA with bottom navigation
- [ ] Pet health dashboard widget
- [ ] Quick-action buttons
- [ ] Pet photo gallery
- [ ] Milestone tracking

## Stories

### STORY-094.1: Add native-like PWA with bottom navigation
- **Status**: todo
- **Effort**: M
- **Description**: Create mobile layout with bottom tab navigation for pet owners
- **Files to touch**: src/app/(portal)/, src/components/portal/bottom-nav.tsx
- **Tests needed**: Bottom navigation works like native app
- **Done when**: Bottom navigation working

### STORY-094.2: Add pet health dashboard widget
- **Status**: todo
- **Effort**: M
- **Description**: Create at-a-glance health dashboard widget for pet owners
- **Files to touch**: src/components/portal/health-widget.tsx
- **Tests needed**: Health widget shows key pet info
- **Done when**: Health widget functional

### STORY-094.3: Add quick-action buttons (book, refill, message)
- **Status**: todo
- **Effort**: S
- **Description**: Add prominent quick-action buttons for common tasks
- **Files to touch**: src/components/portal/quick-actions.tsx
- **Tests needed**: Quick actions accessible from dashboard
- **Done when**: Quick actions working

### STORY-094.4: Add pet photo gallery
- **Status**: todo
- **Effort**: M
- **Description**: Create photo gallery for each pet with upload capability
- **Files to touch**: src/components/portal/photo-gallery.tsx
- **Tests needed**: Photos uploadable and viewable in gallery
- **Done when**: Photo gallery functional

### STORY-094.5: Add milestone tracking (first visit, neutered, etc.)
- **Status**: todo
- **Effort**: M
- **Description**: Track and celebrate pet milestones with visual timeline
- **Files to touch**: src/components/portal/milestones.tsx
- **Tests needed**: Milestones tracked and displayed
- **Done when**: Milestone tracking working

## Technical Notes
Use bottom navigation pattern common in mobile apps: Home, My Pets, Book, Messages, Profile. Health widget should show: next appointment, upcoming vaccines, health score. Make it feel like a native app.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
