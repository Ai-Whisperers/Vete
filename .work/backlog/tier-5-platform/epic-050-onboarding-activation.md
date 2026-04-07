---
id: EPIC-050
title: "Onboarding & Activation"
tier: 5
priority: P5
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-050: Onboarding & Activation

## Context
New clinic onboarding is manual and confusing. A guided setup wizard with demo data and contextual help would dramatically improve activation rates.

## Acceptance Criteria
- [ ] Guided setup wizard for new clinics
- [ ] Sample data import (demo mode)
- [ ] Contextual help tooltips
- [ ] Video tutorials in UI
- [ ] Progress tracker for setup
- [ ] In-app chat support widget

## Stories

### STORY-050.1: Add guided setup wizard for new clinics
- **Status**: todo
- **Effort**: L
- **Description**: Create multi-step wizard: clinic info → services → staff → settings
- **Files to touch**: src/app/(onboarding)/, src/components/onboarding/
- **Tests needed**: New clinic completes wizard successfully
- **Done when**: Setup wizard functional

### STORY-050.2: Add sample data import (demo mode)
- **Status**: todo
- **Effort**: M
- **Description**: Allow importing sample data to explore the platform
- **Files to touch**: src/services/demo/sample-data.ts
- **Tests needed**: Demo data loads and is clearly marked
- **Done when**: Demo mode working

### STORY-050.3: Add contextual help tooltips
- **Status**: todo
- **Effort**: M
- **Description**: Add help tooltips on complex UI elements throughout the app
- **Files to touch**: src/components/ui/help-tooltip.tsx
- **Tests needed**: Tooltips visible on complex features
- **Done when**: Help tooltips added to key features

### STORY-050.4: Add video tutorials embedded in UI
- **Status**: todo
- **Effort**: M
- **Description**: Embed tutorial videos next to relevant features
- **Files to touch**: src/components/help/video-tutorial.tsx
- **Tests needed**: Tutorial videos play in context
- **Done when**: Video tutorials embedded

### STORY-050.5: Add progress tracker for setup completion
- **Status**: todo
- **Effort**: S
- **Description**: Show checklist of setup steps with completion percentage
- **Files to touch**: src/components/onboarding/progress.tsx
- **Tests needed**: Setup progress visible on dashboard
- **Done when**: Progress tracker working

### STORY-050.6: Add in-app chat support widget
- **Status**: todo
- **Effort**: M
- **Description**: Add live chat widget for support (Crisp, Intercom, or custom)
- **Files to touch**: src/components/support/chat-widget.tsx
- **Tests needed**: Chat widget visible and functional
- **Done when**: Chat support widget working

## Technical Notes
The setup wizard should match the clinic registration flow. Demo data should be visually distinct (e.g., 'Demo Patient', 'Sample Clinic'). Consider Crisp for chat widget - it has a generous free tier.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
