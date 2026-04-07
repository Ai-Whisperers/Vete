---
id: EPIC-087
title: "Multi-Species Medical Records"
tier: 10
priority: P10
status: backlog
estimated_effort: M
dependencies: [EPIC-061]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-087: Multi-Species Medical Records

## Context
Medical records need species-specific customization: different form fields, breed-specific health risks, vital ranges, and growth charts per species.

## Acceptance Criteria
- [ ] Species-specific form fields
- [ ] Breed-specific health risk alerts
- [ ] Species-specific normal vital ranges
- [ ] Age calculation by species
- [ ] Species-specific growth chart templates

## Stories

### STORY-087.1: Add species-specific form fields
- **Status**: todo
- **Effort**: M
- **Description**: Customize medical record forms based on species
- **Files to touch**: src/components/medical/species-forms.tsx
- **Tests needed**: Form fields change based on species
- **Done when**: Species-specific forms working

### STORY-087.2: Add breed-specific health risk alerts
- **Status**: todo
- **Effort**: M
- **Description**: Alert vets about breed-specific health predispositions
- **Files to touch**: src/services/species/breed-risks.ts
- **Tests needed**: Breed risks shown on patient profile
- **Done when**: Breed risk alerts working

### STORY-087.3: Add species-specific normal vital ranges
- **Status**: todo
- **Effort**: M
- **Description**: Display correct vital ranges based on species and size
- **Files to touch**: src/data/species/vital-ranges.json
- **Tests needed**: Vitals compared against correct ranges
- **Done when**: Vital ranges species-specific

### STORY-087.4: Add age calculation by species (cat years, dog years)
- **Status**: todo
- **Effort**: S
- **Description**: Calculate and display age equivalents by species
- **Files to touch**: src/services/species/age-calculator.ts
- **Tests needed**: Age equivalent shown on patient profile
- **Done when**: Age calculation working

### STORY-087.5: Add species-specific growth chart templates
- **Status**: todo
- **Effort**: M
- **Description**: Display growth charts with species/breed-specific norms
- **Files to touch**: src/components/medical/growth-chart.tsx
- **Tests needed**: Growth tracked against breed norms
- **Done when**: Growth charts species-specific

## Technical Notes
Dog age calculation: new formula is 16 × ln(dog age) + 31. Cat: indoor cats live longer. Vital ranges differ significantly: dog heart rate 60-140, cat 120-240. Use breed-specific data from veterinary references.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
