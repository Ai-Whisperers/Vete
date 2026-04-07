---
id: EPIC-099
title: "Sustainability & Green Vet"
tier: 11
priority: P11
status: backlog
estimated_effort: S
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-099: Sustainability & Green Vet

## Context
Sustainability features differentiate the platform and appeal to environmentally conscious clinics: paperless workflows, digital prescriptions, and eco-friendly product badges.

## Acceptance Criteria
- [ ] Paperless consent workflow
- [ ] Digital prescription delivery
- [ ] Carbon footprint tracking
- [ ] Eco-friendly product badges
- [ ] Waste management tracking

## Stories

### STORY-099.1: Add paperless consent workflow
- **Status**: todo
- **Effort**: M
- **Description**: Implement digital consent forms with e-signature
- **Files to touch**: src/components/consent/digital-form.tsx, src/services/consent/
- **Tests needed**: Consent collected digitally with signature
- **Done when**: Paperless consent working

### STORY-099.2: Add digital prescription delivery
- **Status**: todo
- **Effort**: S
- **Description**: Send prescriptions digitally (email, WhatsApp) instead of print
- **Files to touch**: src/services/pharmacy/digital-rx.ts
- **Tests needed**: Prescriptions delivered digitally
- **Done when**: Digital prescriptions working

### STORY-099.3: Add carbon footprint tracking for clinic
- **Status**: todo
- **Effort**: M
- **Description**: Track clinic's carbon footprint based on operations data
- **Files to touch**: src/services/sustainability/carbon.ts
- **Tests needed**: Carbon footprint calculated and displayed
- **Done when**: Carbon tracking working

### STORY-099.4: Add eco-friendly product badges in store
- **Status**: todo
- **Effort**: S
- **Description**: Badge eco-friendly products in the online store
- **Files to touch**: src/components/store/eco-badge.tsx
- **Tests needed**: Eco-friendly products visually marked
- **Done when**: Eco badges displayed

### STORY-099.5: Add waste management tracking
- **Status**: todo
- **Effort**: M
- **Description**: Track clinic waste generation and disposal compliance
- **Files to touch**: src/services/sustainability/waste.ts
- **Tests needed**: Waste tracked and reported
- **Done when**: Waste tracking working

## Technical Notes
Paperless consent reduces paper waste significantly. Paraguay has environmental regulations for clinical waste. Digital prescriptions save paper and improve patient compliance tracking.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
