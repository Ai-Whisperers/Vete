---
id: EPIC-061
title: "Species-Specific Features"
tier: 7
priority: P7
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-061: Species-Specific Features

## Context
Different species have different health protocols, vital ranges, and workflows. Important for Paraguay which has significant livestock and exotic animal populations.

## Acceptance Criteria
- [ ] Canine-specific health protocols
- [ ] Feline-specific health protocols
- [ ] Equine module
- [ ] Exotic animal module
- [ ] Avian module
- [ ] Cattle/livestock module

## Stories

### STORY-061.1: Add canine-specific health protocols
- **Status**: todo
- **Effort**: M
- **Description**: Create health protocols, vital ranges, and forms for dogs
- **Files to touch**: src/data/species/canine/, src/services/species/
- **Tests needed**: Canine protocols available
- **Done when**: Canine health protocols active

### STORY-061.2: Add feline-specific health protocols
- **Status**: todo
- **Effort**: M
- **Description**: Create health protocols, vital ranges, and forms for cats
- **Files to touch**: src/data/species/feline/
- **Tests needed**: Feline protocols available
- **Done when**: Feline health protocols active

### STORY-061.3: Add equine module (different workflow)
- **Status**: todo
- **Effort**: L
- **Description**: Create equine-specific module with ambulatory/field visit workflow
- **Files to touch**: src/app/(clinic)/equine/, src/services/species/equine/
- **Tests needed**: Equine module functional
- **Done when**: Equine module working

### STORY-061.4: Add exotic animal module
- **Status**: todo
- **Effort**: M
- **Description**: Create module for exotic animals (reptiles, small mammals)
- **Files to touch**: src/data/species/exotic/, src/services/species/
- **Tests needed**: Exotic animal records supported
- **Done when**: Exotic animal module working

### STORY-061.5: Add avian module
- **Status**: todo
- **Effort**: M
- **Description**: Create module for birds with species-specific features
- **Files to touch**: src/data/species/avian/
- **Tests needed**: Avian records supported
- **Done when**: Avian module working

### STORY-061.6: Add cattle/livestock module (important for Paraguay)
- **Status**: todo
- **Effort**: L
- **Description**: Create livestock module with herd management for Paraguay's cattle industry
- **Files to touch**: src/app/(clinic)/livestock/, src/services/species/livestock/
- **Tests needed**: Livestock module with herd management
- **Done when**: Livestock module functional

## Technical Notes
Paraguay has a significant cattle industry (13M+ head). The livestock module should support: herd management, SENACSA ear tag tracking, movement permits, and health certificates.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
