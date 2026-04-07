---
id: EPIC-054
title: "Customer Success"
tier: 6
priority: P6
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-054: Customer Success

## Context
No customer success tooling. Need NPS surveys, usage analytics, onboarding email sequences, and churn prediction to retain customers.

## Acceptance Criteria
- [ ] NPS survey system
- [ ] Usage analytics per clinic
- [ ] Automated onboarding emails
- [ ] Churn prediction alerts
- [ ] Customer health score dashboard

## Stories

### STORY-054.1: Add NPS survey system
- **Status**: todo
- **Effort**: M
- **Description**: Implement in-app NPS survey with follow-up questions
- **Files to touch**: src/components/feedback/nps.tsx, src/services/feedback/
- **Tests needed**: NPS survey triggers and collects responses
- **Done when**: NPS survey system working

### STORY-054.2: Add usage analytics per clinic (feature adoption)
- **Status**: todo
- **Effort**: M
- **Description**: Track which features each clinic uses and adoption rates
- **Files to touch**: src/services/analytics/usage.ts
- **Tests needed**: Feature adoption visible per clinic
- **Done when**: Usage analytics functional

### STORY-054.3: Add automated onboarding email sequence
- **Status**: todo
- **Effort**: M
- **Description**: Create drip email campaign for new clinic onboarding
- **Files to touch**: src/services/email/onboarding-sequence.ts
- **Tests needed**: Emails sent over first 30 days
- **Done when**: Onboarding emails automated

### STORY-054.4: Add churn prediction alerts
- **Status**: todo
- **Effort**: M
- **Description**: Build model predicting which clinics are at risk of churning
- **Files to touch**: src/services/analytics/churn.ts
- **Tests needed**: At-risk clinics flagged with score
- **Done when**: Churn prediction working

### STORY-054.5: Add customer health score dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Create composite health score combining usage, NPS, support tickets
- **Files to touch**: src/app/(admin)/customer-health/
- **Tests needed**: Health scores visible for all customers
- **Done when**: Health score dashboard functional

## Technical Notes
NPS survey should trigger 30 days after onboarding, then quarterly. Health score combines: login frequency, feature breadth, support tickets, NPS score, payment status.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
