---
id: EPIC-069
title: "Paraguay Regulatory Compliance"
tier: 8
priority: P8
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-069: Paraguay Regulatory Compliance

## Context
SENACSA reporting, municipal registration, DINAVISA controlled substance reporting, and RUC-based invoicing are required for operating legally in Paraguay.

## Acceptance Criteria
- [ ] SENACSA reporting automated
- [ ] Municipal animal registration integration
- [ ] Rabies campaign compliance tracking
- [ ] DINAVISA controlled substance reporting
- [ ] RUC validation and invoicing

## Stories

### STORY-069.1: Add SENACSA reporting automation
- **Status**: todo
- **Effort**: M
- **Description**: Auto-generate SENACSA-required reports on schedule
- **Files to touch**: src/services/compliance/senacsa.ts
- **Tests needed**: SENACSA reports generated automatically
- **Done when**: SENACSA reporting automated

### STORY-069.2: Add municipal animal registration integration
- **Status**: todo
- **Effort**: M
- **Description**: Integrate with municipal pet registration systems
- **Files to touch**: src/services/compliance/municipal.ts
- **Tests needed**: Pets registered with municipality
- **Done when**: Municipal registration working

### STORY-069.3: Add rabies campaign compliance tracking
- **Status**: todo
- **Effort**: M
- **Description**: Track compliance with national rabies vaccination campaigns
- **Files to touch**: src/services/compliance/rabies-campaign.ts
- **Tests needed**: Campaign compliance rates tracked
- **Done when**: Rabies campaign tracking working

### STORY-069.4: Add controlled substance DINAVISA reporting
- **Status**: todo
- **Effort**: M
- **Description**: Generate DINAVISA-required reports for controlled substances
- **Files to touch**: src/services/compliance/dinavisa.ts
- **Tests needed**: DINAVISA reports generated
- **Done when**: DINAVISA reporting working

### STORY-069.5: Add RUC (tax ID) validation and invoicing
- **Status**: todo
- **Effort**: M
- **Description**: Validate RUC numbers and generate compliant invoices
- **Files to touch**: src/services/billing/ruc.ts
- **Tests needed**: RUC validated, invoices compliant
- **Done when**: RUC validation and invoicing working

## Technical Notes
SENACSA: animal health authority. DINAVISA: drug regulatory authority. RUC: Registro Unico del Contribuyente (tax ID). Invoice format must comply with SET (tax authority) requirements.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
