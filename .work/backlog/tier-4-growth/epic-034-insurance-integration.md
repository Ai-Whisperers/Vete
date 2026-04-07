---
id: EPIC-034
title: "Insurance Deep Integration"
tier: 4
priority: P4
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-034: Insurance Deep Integration

## Context
Pet insurance is growing in Latin America. Direct integration with insurance providers streamlines claims and improves the payment experience.

## Acceptance Criteria
- [ ] Insurance provider API integration
- [ ] Real-time eligibility verification
- [ ] Automated claim submission
- [ ] Claim status tracking
- [ ] Insurance estimate calculator

## Stories

### STORY-034.1: Add direct API integration with insurance providers
- **Status**: todo
- **Effort**: L
- **Description**: Integrate with major pet insurance APIs for claims processing
- **Files to touch**: src/services/insurance/, src/app/api/insurance/
- **Tests needed**: Insurance API connected and functional
- **Done when**: Insurance API integration working

### STORY-034.2: Add real-time eligibility verification
- **Status**: todo
- **Effort**: M
- **Description**: Check insurance eligibility at check-in time
- **Files to touch**: src/services/insurance/eligibility.ts
- **Tests needed**: Eligibility checked before service
- **Done when**: Eligibility verification working

### STORY-034.3: Add automated claim submission
- **Status**: todo
- **Effort**: M
- **Description**: Auto-submit claims with procedure codes and documentation
- **Files to touch**: src/services/insurance/claims.ts
- **Tests needed**: Claims submitted automatically after service
- **Done when**: Automated claim submission working

### STORY-034.4: Add claim status tracking
- **Status**: todo
- **Effort**: S
- **Description**: Track claim status from submission to payment
- **Files to touch**: src/components/insurance/claims-tracker.tsx
- **Tests needed**: Claim status visible to clinic and owner
- **Done when**: Claim tracking functional

### STORY-034.5: Add insurance estimate calculator
- **Status**: todo
- **Effort**: M
- **Description**: Calculate estimated insurance coverage before procedures
- **Files to touch**: src/components/insurance/estimate.tsx
- **Tests needed**: Cost estimate shows with/without insurance
- **Done when**: Insurance estimate calculator working

## Technical Notes
Research pet insurance providers operating in Paraguay and Latin America. Start with the largest provider. Use SOAP/REST API integration patterns based on provider documentation.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
