---
id: EPIC-072
title: "Paraguay-Specific Content"
tier: 8
priority: P8
status: backlog
estimated_effort: M
dependencies: [EPIC-009]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-072: Paraguay-Specific Content

## Context
Platform needs Paraguay-specific content: Guaraní language, local breeds, local disease prevalence, local drug availability, and holiday calendar.

## Acceptance Criteria
- [ ] Guaraní language support
- [ ] Local breed database
- [ ] Local disease prevalence data
- [ ] Local drug availability database
- [ ] Paraguay holiday calendar integration

## Stories

### STORY-072.1: Add Guaraní language support
- **Status**: todo
- **Effort**: L
- **Description**: Add Guaraní locale for bilingual Paraguayan users
- **Files to touch**: src/i18n/messages/gn.json
- **Tests needed**: App available in Guaraní
- **Done when**: Guaraní locale complete

### STORY-072.2: Add local breed database (Paraguayan dog/cat breeds)
- **Status**: todo
- **Effort**: S
- **Description**: Add Paraguay-common breeds to the breed database
- **Files to touch**: src/data/breeds/
- **Tests needed**: Local breeds available for selection
- **Done when**: Local breed database populated

### STORY-072.3: Add local disease prevalence data
- **Status**: todo
- **Effort**: M
- **Description**: Add Paraguay-specific disease prevalence data for risk assessment
- **Files to touch**: src/data/epidemiology/
- **Tests needed**: Disease prevalence data available for Paraguay
- **Done when**: Disease data populated

### STORY-072.4: Add local drug availability database
- **Status**: todo
- **Effort**: M
- **Description**: Track which veterinary drugs are available in Paraguay
- **Files to touch**: src/data/pharmacy/py-drugs.json
- **Tests needed**: Drug availability reflects Paraguay market
- **Done when**: Drug availability database populated

### STORY-072.5: Add Paraguay holiday calendar integration
- **Status**: todo
- **Effort**: S
- **Description**: Include Paraguay's official holidays for scheduling
- **Files to touch**: src/data/holidays/py.json, src/services/scheduling/
- **Tests needed**: Paraguay holidays shown in calendar
- **Done when**: Holiday calendar integrated

## Technical Notes
Paraguay is officially bilingual (Spanish and Guaraní). Guaraní is spoken by ~90% of the population. Drug availability should be checked against DINAVISA's registry.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
