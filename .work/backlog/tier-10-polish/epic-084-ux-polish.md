---
id: EPIC-084
title: "UX Polish"
tier: 10
priority: P10
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-084: UX Polish

## Context
UX polish features that make the app feel professional: skeleton loading, optimistic updates, undo/redo, keyboard shortcuts, breadcrumbs, and command palette.

## Acceptance Criteria
- [ ] Skeleton loading states for all pages
- [ ] Optimistic UI updates
- [ ] Undo/redo for form changes
- [ ] Keyboard shortcuts for power users
- [ ] Breadcrumb navigation
- [ ] Command palette (Cmd+K)

## Stories

### STORY-084.1: Add skeleton loading states for all pages
- **Status**: todo
- **Effort**: M
- **Description**: Replace spinners with skeleton loading animations
- **Files to touch**: src/app/**/loading.tsx, src/components/ui/skeleton.tsx
- **Tests needed**: All pages show skeleton while loading
- **Done when**: Skeleton loading on all pages

### STORY-084.2: Add optimistic UI updates
- **Status**: todo
- **Effort**: M
- **Description**: Implement optimistic updates for common actions (save, delete, update)
- **Files to touch**: src/hooks/use-optimistic.ts
- **Tests needed**: UI updates before server confirms
- **Done when**: Optimistic updates working

### STORY-084.3: Add undo/redo for form changes
- **Status**: todo
- **Effort**: M
- **Description**: Implement undo/redo functionality for form editing
- **Files to touch**: src/hooks/use-undo.ts
- **Tests needed**: Ctrl+Z/Ctrl+Y work in forms
- **Done when**: Undo/redo functional

### STORY-084.4: Add keyboard shortcuts for power users
- **Status**: todo
- **Effort**: M
- **Description**: Add keyboard shortcuts for common actions
- **Files to touch**: src/hooks/use-keyboard-shortcuts.ts
- **Tests needed**: Shortcuts work for navigation and actions
- **Done when**: Keyboard shortcuts working

### STORY-084.5: Add breadcrumb navigation
- **Status**: todo
- **Effort**: S
- **Description**: Add breadcrumbs showing navigation hierarchy
- **Files to touch**: src/components/ui/breadcrumb.tsx
- **Tests needed**: Breadcrumbs shown on all pages
- **Done when**: Breadcrumb navigation working

### STORY-084.6: Add command palette (Cmd+K)
- **Status**: todo
- **Effort**: M
- **Description**: Implement command palette for quick actions and navigation
- **Files to touch**: src/components/ui/command-palette.tsx
- **Tests needed**: Cmd+K opens command palette
- **Done when**: Command palette functional

## Technical Notes
Use Next.js loading.tsx convention for skeleton states. For command palette, use cmdk library. Optimistic updates work well with TanStack Query's mutation callbacks.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
