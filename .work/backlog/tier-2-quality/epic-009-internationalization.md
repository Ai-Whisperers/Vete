---
id: EPIC-009
title: "Internationalization (i18n)"
tier: 2
priority: P2
status: backlog
estimated_effort: XL
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-009: Internationalization (i18n)

## Context
Currently Spanish-only. Paraguay market also needs Guaraní support. Expansion to Brazil and international markets requires English and Portuguese.

## Acceptance Criteria
- [ ] next-intl fully configured
- [ ] All hardcoded strings extracted to locale files
- [ ] Portuguese locale available
- [ ] English locale available
- [ ] Locale switcher in UI

## Stories

### STORY-009.1: Complete next-intl setup
- **Status**: todo
- **Effort**: M
- **Description**: Finish the partial next-intl integration - configure middleware, providers, and routing
- **Files to touch**: src/middleware.ts, src/i18n/, next.config.ts
- **Tests needed**: next-intl loads correct locale based on URL
- **Done when**: next-intl fully configured and working

### STORY-009.2: Extract all hardcoded Spanish strings to locale files
- **Status**: todo
- **Effort**: XL
- **Description**: Find and extract all hardcoded Spanish text across the entire codebase to locale JSON files
- **Files to touch**: src/**/*.tsx, src/i18n/messages/es.json
- **Tests needed**: No hardcoded Spanish strings in components
- **Done when**: All strings in locale files

### STORY-009.3: Add Portuguese locale (Brazil market)
- **Status**: todo
- **Effort**: L
- **Description**: Translate all locale strings to Portuguese
- **Files to touch**: src/i18n/messages/pt-BR.json
- **Tests needed**: App works fully in Portuguese
- **Done when**: Portuguese locale complete

### STORY-009.4: Add English locale (international market)
- **Status**: todo
- **Effort**: L
- **Description**: Translate all locale strings to English
- **Files to touch**: src/i18n/messages/en.json
- **Tests needed**: App works fully in English
- **Done when**: English locale complete

### STORY-009.5: Add locale switcher in UI
- **Status**: todo
- **Effort**: S
- **Description**: Add language selector dropdown in the header/navbar
- **Files to touch**: src/components/locale-switcher.tsx, src/components/layout/header.tsx
- **Tests needed**: User can switch language from any page
- **Done when**: Locale switcher visible and functional

### STORY-009.6: Add RTL support for future markets
- **Status**: todo
- **Effort**: M
- **Description**: Add right-to-left CSS support for potential Arabic market expansion
- **Files to touch**: src/styles/rtl.css, tailwind.config.ts
- **Tests needed**: RTL layout renders correctly
- **Done when**: RTL support available

## Technical Notes
next-intl is already partially set up. Check `src/i18n/` for existing configuration. Use `t('key')` pattern for all strings. Create locale files under `src/i18n/messages/`.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
