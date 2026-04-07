---
id: EPIC-008
title: "Theme & Design System"
tier: 2
priority: P2
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-008: Theme & Design System

## Context
285 files with hardcoded colors. No consistent design system, making white-labeling impossible and visual consistency poor.

## Acceptance Criteria
- [ ] All hardcoded colors replaced with CSS variables
- [ ] Tailwind theme config supports white-labeling
- [ ] Dark mode working
- [ ] Mobile responsive design verified
- [ ] Component documentation exists
- [ ] Accessibility audit passing

## Stories

### STORY-008.1: Audit all hardcoded colors → CSS variables
- **Status**: todo
- **Effort**: L
- **Description**: Find all hardcoded hex/rgb colors in 285 files and replace with CSS custom properties
- **Files to touch**: src/**/*.tsx, src/**/*.css, tailwind.config.ts, src/styles/globals.css
- **Tests needed**: grep for hardcoded colors returns 0
- **Done when**: All colors use CSS variables

### STORY-008.2: Create Tailwind theme config for white-label support
- **Status**: todo
- **Effort**: M
- **Description**: Set up Tailwind theme that reads from CSS variables, allowing per-clinic theming
- **Files to touch**: tailwind.config.ts, src/styles/themes/
- **Tests needed**: Theme can be switched by changing CSS variables
- **Done when**: White-label theming works

### STORY-008.3: Add dark mode support
- **Status**: todo
- **Effort**: M
- **Description**: Implement dark mode using Tailwind's dark: variant and CSS variable switching
- **Files to touch**: tailwind.config.ts, src/components/theme-toggle.tsx, src/styles/
- **Tests needed**: Dark mode toggle works across all pages
- **Done when**: Dark mode fully functional

### STORY-008.4: Fix responsive design issues on mobile
- **Status**: todo
- **Effort**: M
- **Description**: Audit and fix responsive design breakpoints, especially for tables and forms
- **Files to touch**: src/components/**/*.tsx
- **Tests needed**: All pages usable on 375px width
- **Done when**: Mobile responsive design verified

### STORY-008.5: Create component library documentation (Storybook)
- **Status**: todo
- **Effort**: L
- **Description**: Set up Storybook and document all shared components
- **Files to touch**: .storybook/, src/components/**/*.stories.tsx
- **Tests needed**: Storybook builds and shows all components
- **Done when**: Storybook docs for all shared components

### STORY-008.6: Add accessibility audit (axe-core)
- **Status**: todo
- **Effort**: M
- **Description**: Integrate axe-core for automated accessibility testing
- **Files to touch**: tests/a11y/, package.json
- **Tests needed**: axe-core audit passes with 0 critical issues
- **Done when**: Accessibility audit clean

## Technical Notes
Start with `grep -rn '#[0-9a-fA-F]\{3,6\}' src/` to find hardcoded colors. Create a color palette in `src/styles/themes/default.css` with CSS custom properties.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
