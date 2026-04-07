---
id: EPIC-090
title: "Knowledge Base & Training"
tier: 10
priority: P10
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-090: Knowledge Base & Training

## Context
In-app help center, interactive walkthroughs, training mode, and contextual help reduce support burden and improve user productivity.

## Acceptance Criteria
- [ ] In-app help center with search
- [ ] Interactive walkthroughs for new features
- [ ] Admin training mode (sandbox)
- [ ] Contextual help tooltips
- [ ] Keyboard shortcut reference card

## Stories

### STORY-090.1: Add in-app help center with searchable articles
- **Status**: todo
- **Effort**: M
- **Description**: Create help center with categorized, searchable articles
- **Files to touch**: src/app/(portal)/help/, src/services/help/
- **Tests needed**: Help articles searchable and accessible
- **Done when**: Help center functional

### STORY-090.2: Add interactive walkthroughs for new features
- **Status**: todo
- **Effort**: M
- **Description**: Create step-by-step walkthroughs for new features
- **Files to touch**: src/components/help/walkthrough.tsx
- **Tests needed**: Walkthroughs guide users through features
- **Done when**: Walkthroughs working

### STORY-090.3: Add admin training mode (sandbox)
- **Status**: todo
- **Effort**: M
- **Description**: Create sandbox environment for training without affecting real data
- **Files to touch**: src/services/training/sandbox.ts
- **Tests needed**: Training mode uses sandbox data
- **Done when**: Training sandbox working

### STORY-090.4: Add contextual help tooltips
- **Status**: todo
- **Effort**: S
- **Description**: Add help tooltips that appear near relevant UI elements
- **Files to touch**: src/components/ui/help-tooltip.tsx
- **Tests needed**: Tooltips visible on hover/click
- **Done when**: Contextual tooltips working

### STORY-090.5: Add keyboard shortcut reference card
- **Status**: todo
- **Effort**: S
- **Description**: Create reference card showing all keyboard shortcuts
- **Files to touch**: src/components/help/shortcut-card.tsx
- **Tests needed**: Shortcut card accessible from help menu
- **Done when**: Shortcut reference card available

## Technical Notes
Use Shepherd.js or React Joyride for walkthroughs. Help center can use markdown files with full-text search. Training mode should clearly indicate it's a sandbox with a banner.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
