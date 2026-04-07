---
id: EPIC-020
title: "Pharmacy & Drug Management"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-020: Pharmacy & Drug Management

## Context
Prescriptions exist but there's no dispensing workflow. Drug interactions aren't checked, controlled substances aren't tracked, and refill management is missing.

## Acceptance Criteria
- [ ] Drug interaction checking database
- [ ] Dispensing workflow (pick, verify, dispense)
- [ ] Controlled substance tracking
- [ ] Prescription refill management
- [ ] Drug allergy alerts
- [ ] Withdrawal period tracking for food animals

## Stories

### STORY-020.1: Add drug interaction checking database
- **Status**: todo
- **Effort**: L
- **Description**: Implement drug interaction database and checking at prescription time
- **Files to touch**: src/services/pharmacy/interactions.ts, src/data/drug-interactions.json
- **Tests needed**: Drug interactions flagged when prescribing
- **Done when**: Drug interaction checking active

### STORY-020.2: Add dispensing workflow (pick, verify, dispense)
- **Status**: todo
- **Effort**: M
- **Description**: Create multi-step dispensing workflow with barcode verification
- **Files to touch**: src/components/pharmacy/dispensing.tsx, src/services/pharmacy/
- **Tests needed**: Medications go through pick-verify-dispense flow
- **Done when**: Dispensing workflow functional

### STORY-020.3: Add controlled substance tracking
- **Status**: todo
- **Effort**: M
- **Description**: Implement DEA-style logging for controlled substances
- **Files to touch**: src/services/pharmacy/controlled.ts
- **Tests needed**: Controlled substance usage fully logged
- **Done when**: Controlled substance tracking compliant

### STORY-020.4: Add prescription refill management
- **Status**: todo
- **Effort**: M
- **Description**: Allow clients to request refills, vets to approve
- **Files to touch**: src/components/pharmacy/refill.tsx, src/services/pharmacy/
- **Tests needed**: Refill requests and approvals tracked
- **Done when**: Prescription refill management working

### STORY-020.5: Add drug allergy alerts
- **Status**: todo
- **Effort**: S
- **Description**: Alert when prescribing a drug a pet is allergic to
- **Files to touch**: src/services/pharmacy/allergy-check.ts
- **Tests needed**: Alert shows when allergy conflict detected
- **Done when**: Drug allergy alerts active

### STORY-020.6: Add withdrawal period tracking for food animals
- **Status**: todo
- **Effort**: M
- **Description**: Track drug withdrawal periods for livestock/food animals per SENACSA requirements
- **Files to touch**: src/services/pharmacy/withdrawal.ts
- **Tests needed**: Withdrawal period warnings for food animals
- **Done when**: Withdrawal tracking functional

## Technical Notes
For drug interactions, consider using an existing database like the Veterinary Drug Interaction Database. Controlled substance tracking must comply with Paraguay's DINAVISA regulations.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
