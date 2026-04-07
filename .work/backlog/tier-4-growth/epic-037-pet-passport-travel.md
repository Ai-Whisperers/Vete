---
id: EPIC-037
title: "Pet Passport & Travel"
tier: 4
priority: P4
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-037: Pet Passport & Travel

## Context
International pet travel requires health certificates, vaccination records, and compliance with destination country requirements. Important for Paraguay's international pet owners.

## Acceptance Criteria
- [ ] International health certificate generation
- [ ] Vaccination requirement checker by destination
- [ ] TRACES-NT integration (EU)
- [ ] Microchip registration integration
- [ ] Quarantine period tracking

## Stories

### STORY-037.1: Add international health certificate generation
- **Status**: todo
- **Effort**: M
- **Description**: Generate official health certificates for international pet travel
- **Files to touch**: src/services/travel/health-cert.ts, src/templates/
- **Tests needed**: Health certificate PDF generates with required info
- **Done when**: Health certificate generation working

### STORY-037.2: Add vaccination requirement checker by destination
- **Status**: todo
- **Effort**: M
- **Description**: Database of vaccination requirements by country
- **Files to touch**: src/data/travel-requirements/, src/services/travel/
- **Tests needed**: Requirements shown for selected destination
- **Done when**: Requirement checker functional

### STORY-037.3: Add TRACES-NT integration (EU pet travel)
- **Status**: todo
- **Effort**: L
- **Description**: Integrate with EU's TRACES-NT system for pet travel to Europe
- **Files to touch**: src/services/travel/traces.ts
- **Tests needed**: TRACES-NT certificates generated
- **Done when**: TRACES-NT integration working

### STORY-037.4: Add microchip registration integration
- **Status**: todo
- **Effort**: S
- **Description**: Connect with microchip registries for verification
- **Files to touch**: src/services/pet/microchip.ts
- **Tests needed**: Microchip registration verified against registry
- **Done when**: Microchip integration working

### STORY-037.5: Add quarantine period tracking
- **Status**: todo
- **Effort**: S
- **Description**: Track required quarantine periods for destination countries
- **Files to touch**: src/services/travel/quarantine.ts
- **Tests needed**: Quarantine periods calculated and tracked
- **Done when**: Quarantine tracking functional

## Technical Notes
International health certificates must be issued by accredited veterinarians. TRACES-NT (Trade Control and Expert System) is required for EU pet travel. Check SENACSA requirements for export health certificates from Paraguay.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
