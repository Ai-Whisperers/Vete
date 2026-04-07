---
id: EPIC-081
title: "Accessibility (a11y)"
tier: 10
priority: P10
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-081: Accessibility (a11y)

## Context
WCAG 2.1 AA compliance is both ethical and potentially legally required. Keyboard navigation, screen reader support, and high contrast mode improve usability for all.

## Acceptance Criteria
- [ ] WCAG 2.1 AA compliance audit
- [ ] Keyboard navigation for all features
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Font size adjustment

## Stories

### STORY-081.1: Add WCAG 2.1 AA compliance audit
- **Status**: todo
- **Effort**: L
- **Description**: Run comprehensive accessibility audit and fix critical issues
- **Files to touch**: src/**/*.tsx, axe-core reports
- **Tests needed**: Audit shows 0 critical a11y issues
- **Done when**: WCAG 2.1 AA audit passing

### STORY-081.2: Add keyboard navigation for all features
- **Status**: todo
- **Effort**: M
- **Description**: Ensure all features are accessible via keyboard alone
- **Files to touch**: src/components/**/*.tsx
- **Tests needed**: All features navigable by keyboard
- **Done when**: Full keyboard navigation working

### STORY-081.3: Add screen reader support
- **Status**: todo
- **Effort**: M
- **Description**: Add proper ARIA labels, roles, and live regions
- **Files to touch**: src/components/**/*.tsx
- **Tests needed**: Screen reader navigates all features
- **Done when**: Screen reader support complete

### STORY-081.4: Add high contrast mode
- **Status**: todo
- **Effort**: S
- **Description**: Create high contrast theme variant
- **Files to touch**: src/styles/themes/high-contrast.css
- **Tests needed**: High contrast mode toggleable
- **Done when**: High contrast mode working

### STORY-081.5: Add font size adjustment
- **Status**: todo
- **Effort**: S
- **Description**: Allow users to adjust font size globally
- **Files to touch**: src/components/settings/font-size.tsx
- **Tests needed**: Font size adjustable in settings
- **Done when**: Font size adjustment working

## Technical Notes
Use axe-core for automated testing, but manual testing with screen readers (NVDA, VoiceOver) is essential. Focus on: focus management, ARIA labels, color contrast, and form accessibility.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
