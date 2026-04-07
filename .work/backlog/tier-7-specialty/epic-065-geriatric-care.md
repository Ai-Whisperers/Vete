---
id: EPIC-065
title: "Geriatric Care"
tier: 7
priority: P7
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-065: Geriatric Care

## Context
Aging pets need specialized protocols. Chronic condition management, medication interactions, and quality of life scoring are essential for senior pet care.

## Acceptance Criteria
- [ ] Senior wellness protocol templates
- [ ] Chronic condition management
- [ ] Medication interaction checker for elderly
- [ ] Quality of life scoring
- [ ] Palliative care planning

## Stories

### STORY-065.1: Add senior wellness protocol templates
- **Status**: todo
- **Effort**: M
- **Description**: Create wellness protocols for geriatric patients (semi-annual labs, dental, mobility)
- **Files to touch**: src/data/geriatric/, src/services/geriatric/
- **Tests needed**: Senior wellness protocols available
- **Done when**: Senior protocols active

### STORY-065.2: Add chronic condition management
- **Status**: todo
- **Effort**: M
- **Description**: Track and manage chronic conditions (diabetes, arthritis, kidney disease)
- **Files to touch**: src/components/geriatric/chronic.tsx, src/services/geriatric/
- **Tests needed**: Chronic conditions tracked with monitoring
- **Done when**: Chronic condition management working

### STORY-065.3: Add medication interaction checker for elderly pets
- **Status**: todo
- **Effort**: M
- **Description**: Check for drug interactions with emphasis on geriatric sensitivities
- **Files to touch**: src/services/pharmacy/geriatric-interactions.ts
- **Tests needed**: Interactions flagged for senior patients
- **Done when**: Geriatric interaction checker working

### STORY-065.4: Add quality of life scoring
- **Status**: todo
- **Effort**: M
- **Description**: Implement QoL assessment (HHHHHMM scale or similar)
- **Files to touch**: src/components/geriatric/qol.tsx
- **Tests needed**: QoL scores tracked over time
- **Done when**: Quality of life scoring functional

### STORY-065.5: Add palliative care planning
- **Status**: todo
- **Effort**: M
- **Description**: Create palliative/hospice care plan templates
- **Files to touch**: src/components/geriatric/palliative.tsx
- **Tests needed**: Palliative care plans created and tracked
- **Done when**: Palliative care planning working

## Technical Notes
HHHHHMM scale: Hurt, Hunger, Hydration, Hygiene, Happiness, Mobility, More good days than bad. Senior age thresholds: dogs 7+ (giant breeds 5+), cats 10+. Schedule more frequent monitoring.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
