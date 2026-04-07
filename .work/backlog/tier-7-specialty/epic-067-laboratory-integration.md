---
id: EPIC-067
title: "Laboratory Integration"
tier: 7
priority: P7
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-067: Laboratory Integration

## Context
No HL7/FHIR integration for lab results. Manual data entry of lab results is slow and error-prone. Integration with major lab equipment and reference labs is needed.

## Acceptance Criteria
- [ ] HL7/FHIR message parsing
- [ ] IDEXX VetConnect integration
- [ ] Zoetis Reference Lab integration
- [ ] In-house lab equipment integration
- [ ] Reference range management by species/age

## Stories

### STORY-067.1: Add HL7/FHIR message parsing for lab results
- **Status**: todo
- **Effort**: L
- **Description**: Implement HL7 v2.x and FHIR message parsing for receiving lab results
- **Files to touch**: src/services/lab/hl7-parser.ts, src/services/lab/fhir-parser.ts
- **Tests needed**: Lab results parsed from HL7/FHIR messages
- **Done when**: HL7/FHIR parsing working

### STORY-067.2: Add IDEXX VetConnect integration
- **Status**: todo
- **Effort**: L
- **Description**: Integrate with IDEXX VetConnect Plus for lab result retrieval
- **Files to touch**: src/services/integrations/idexx.ts
- **Tests needed**: IDEXX results flow into patient records
- **Done when**: IDEXX integration functional

### STORY-067.3: Add Zoetis Reference Lab integration
- **Status**: todo
- **Effort**: M
- **Description**: Integrate with Zoetis reference laboratory services
- **Files to touch**: src/services/integrations/zoetis.ts
- **Tests needed**: Zoetis results flow into patient records
- **Done when**: Zoetis integration functional

### STORY-067.4: Add in-house lab equipment integration (analyzers)
- **Status**: todo
- **Effort**: L
- **Description**: Connect with common in-house analyzers (IDEXX Catalyst, Abaxis)
- **Files to touch**: src/services/lab/analyzer-integration.ts
- **Tests needed**: Analyzer results auto-imported
- **Done when**: Analyzer integration working

### STORY-067.5: Add reference range management by species/age
- **Status**: todo
- **Effort**: M
- **Description**: Configure normal reference ranges per species, breed, and age group
- **Files to touch**: src/data/lab/reference-ranges/, src/services/lab/
- **Tests needed**: Results flagged against correct reference ranges
- **Done when**: Reference ranges configured

## Technical Notes
IDEXX VetConnect Plus has an API for retrieving results. HL7 v2.x is the most common messaging standard in veterinary labs. FHIR is newer and preferred for new integrations.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
