---
id: EPIC-062
title: "Vaccination Protocol Engine"
tier: 7
priority: P7
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-062: Vaccination Protocol Engine

## Context
Need species/breed-specific vaccination schedules, lot tracking, adverse reaction reporting, and official certificate generation for municipal compliance.

## Acceptance Criteria
- [ ] Species/breed-specific vaccination schedules
- [ ] Vaccine lot tracking and recall management
- [ ] Adverse reaction reporting
- [ ] Official vaccination certificate generation
- [ ] Rabies certificate for municipal compliance

## Stories

### STORY-062.1: Add species/breed-specific vaccination schedules
- **Status**: todo
- **Effort**: M
- **Description**: Create configurable vaccination schedules per species and breed
- **Files to touch**: src/services/vaccination/schedules.ts, src/data/vaccination/
- **Tests needed**: Schedules generate correct reminders per species
- **Done when**: Vaccination schedules active

### STORY-062.2: Add vaccine lot tracking and recall management
- **Status**: todo
- **Effort**: M
- **Description**: Track vaccine lots and support recall notifications
- **Files to touch**: src/services/vaccination/lot-tracking.ts
- **Tests needed**: Lots tracked from receipt to administration
- **Done when**: Lot tracking working

### STORY-062.3: Add adverse reaction reporting (pharmacovigilance)
- **Status**: todo
- **Effort**: M
- **Description**: Report and track adverse vaccine reactions
- **Files to touch**: src/services/vaccination/adverse-reactions.ts
- **Tests needed**: Adverse reactions reported and tracked
- **Done when**: Adverse reaction reporting working

### STORY-062.4: Add vaccination certificate generation (official format)
- **Status**: todo
- **Effort**: M
- **Description**: Generate official vaccination certificates per Paraguayan standards
- **Files to touch**: src/services/pdf/vaccination-cert.ts
- **Tests needed**: Official certificate PDF generated
- **Done when**: Vaccination certificates generated

### STORY-062.5: Add rabies certificate for municipal compliance
- **Status**: todo
- **Effort**: S
- **Description**: Generate rabies vaccination certificates for municipal requirements
- **Files to touch**: src/services/pdf/rabies-cert.ts
- **Tests needed**: Rabies certificate meets municipal standards
- **Done when**: Rabies certificates generated

## Technical Notes
Paraguay requires annual rabies vaccination. Municipal compliance varies by city. Use WSAVA vaccination guidelines as the base for schedules. Certificate format should match SENACSA requirements.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
