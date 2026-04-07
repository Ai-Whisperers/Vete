---
id: EPIC-051
title: "Pricing & Billing Enhancement"
tier: 6
priority: P6
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-051: Pricing & Billing Enhancement

## Context
Need sophisticated pricing: usage-based tiers, free trials, annual discounts, branded invoices, and dunning management for failed payments.

## Acceptance Criteria
- [ ] Usage-based pricing tier
- [ ] Free trial with credit card
- [ ] Annual billing discount
- [ ] Invoice PDF with custom branding
- [ ] Dunning management

## Stories

### STORY-051.1: Add usage-based pricing tier
- **Status**: todo
- **Effort**: M
- **Description**: Implement usage-based pricing (per appointment, per active pet)
- **Files to touch**: src/services/billing/pricing.ts
- **Tests needed**: Usage tracked and billed correctly
- **Done when**: Usage-based pricing working

### STORY-051.2: Add free trial with credit card
- **Status**: todo
- **Effort**: M
- **Description**: Implement 14-day free trial requiring credit card
- **Files to touch**: src/services/billing/trial.ts, src/app/(onboarding)/
- **Tests needed**: Trial starts and converts to paid
- **Done when**: Free trial flow working

### STORY-051.3: Add annual billing discount
- **Status**: todo
- **Effort**: S
- **Description**: Offer annual billing with discount over monthly
- **Files to touch**: src/services/billing/plans.ts
- **Tests needed**: Annual plan available with discount
- **Done when**: Annual billing option available

### STORY-051.4: Add invoice PDF with custom branding
- **Status**: todo
- **Effort**: M
- **Description**: Generate branded PDF invoices for platform billing
- **Files to touch**: src/services/pdf/invoice.ts
- **Tests needed**: Branded invoice PDF generated
- **Done when**: Invoice PDF generation working

### STORY-051.5: Add dunning management (failed payment recovery)
- **Status**: todo
- **Effort**: M
- **Description**: Implement retry logic and notifications for failed payments
- **Files to touch**: src/services/billing/dunning.ts
- **Tests needed**: Failed payments retried and users notified
- **Done when**: Dunning management functional

## Technical Notes
Consider Stripe Billing for subscription management. Usage-based pricing can use metered billing. Dunning typically retries 3 times over 14 days before downgrading.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
