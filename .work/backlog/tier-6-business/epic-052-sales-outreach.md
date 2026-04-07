---
id: EPIC-052
title: "Sales & Outreach"
tier: 6
priority: P6
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-052: Sales & Outreach

## Context
Need sales enablement: demo booking, ROI calculator, case studies, and competitive comparison to convert potential clinic customers.

## Acceptance Criteria
- [ ] Demo booking page
- [ ] ROI calculator for clinics
- [ ] Case studies/testimonials page
- [ ] Competitor comparison page
- [ ] Referral tracking analytics

## Stories

### STORY-052.1: Add demo booking page on paragu-ai.com
- **Status**: todo
- **Effort**: M
- **Description**: Create demo booking page with calendar integration (Calendly or custom)
- **Files to touch**: src/app/(public)/demo/, src/services/sales/
- **Tests needed**: Demo can be booked from landing page
- **Done when**: Demo booking page functional

### STORY-052.2: Add ROI calculator for clinics
- **Status**: todo
- **Effort**: M
- **Description**: Build interactive ROI calculator showing potential savings
- **Files to touch**: src/app/(public)/roi-calculator/, src/components/sales/
- **Tests needed**: ROI calculated based on clinic size
- **Done when**: ROI calculator working

### STORY-052.3: Add case studies / testimonials page
- **Status**: todo
- **Effort**: S
- **Description**: Create page showcasing customer success stories
- **Files to touch**: src/app/(public)/case-studies/
- **Tests needed**: Case studies displayed with results
- **Done when**: Case studies page live

### STORY-052.4: Add comparison page vs competitors
- **Status**: todo
- **Effort**: M
- **Description**: Create feature comparison against VetPraxis, Daysmart Vet, etc.
- **Files to touch**: src/app/(public)/compare/
- **Tests needed**: Comparison table shows advantages
- **Done when**: Comparison page live

### STORY-052.5: Add referral tracking analytics
- **Status**: todo
- **Effort**: M
- **Description**: Track referral sources and conversion rates
- **Files to touch**: src/services/sales/referral-tracking.ts
- **Tests needed**: Referral sources tracked to conversion
- **Done when**: Referral tracking working

## Technical Notes
For demo booking, Calendly has a free tier and embed widget. ROI calculator should factor in: time saved, reduced no-shows, inventory optimization, and client retention improvement.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
