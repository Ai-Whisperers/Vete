---
id: EPIC-079
title: "Advanced Billing"
tier: 9
priority: P9
status: backlog
estimated_effort: L
dependencies: [EPIC-014]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-079: Advanced Billing

## Context
Advanced billing features: recurring billing automation, payment plans, insurance co-pay, credit/debit notes, and multi-currency support for international expansion.

## Acceptance Criteria
- [ ] Recurring billing automation
- [ ] Payment plan support (installments)
- [ ] Insurance co-pay calculator
- [ ] Credit/debit notes
- [ ] Multi-currency support (PYG, USD, BRL)

## Stories

### STORY-079.1: Add recurring billing automation
- **Status**: todo
- **Effort**: M
- **Description**: Automate recurring charges for boarding, subscriptions, and memberships
- **Files to touch**: src/services/billing/recurring.ts
- **Tests needed**: Recurring charges process automatically
- **Done when**: Recurring billing working

### STORY-079.2: Add payment plan support (installments)
- **Status**: todo
- **Effort**: M
- **Description**: Allow splitting invoices into installment payment plans
- **Files to touch**: src/services/billing/payment-plans.ts
- **Tests needed**: Payment plans created and tracked
- **Done when**: Payment plans functional

### STORY-079.3: Add insurance co-pay calculator
- **Status**: todo
- **Effort**: M
- **Description**: Calculate client's co-pay based on insurance coverage
- **Files to touch**: src/services/billing/copay.ts
- **Tests needed**: Co-pay calculated at checkout
- **Done when**: Co-pay calculator working

### STORY-079.4: Add credit/debit notes
- **Status**: todo
- **Effort**: M
- **Description**: Support credit and debit notes for billing adjustments
- **Files to touch**: src/services/billing/notes.ts
- **Tests needed**: Credit/debit notes issued and applied
- **Done when**: Credit/debit notes functional

### STORY-079.5: Add multi-currency support (PYG, USD, BRL)
- **Status**: todo
- **Effort**: M
- **Description**: Support multiple currencies with exchange rate management
- **Files to touch**: src/services/billing/currency.ts
- **Tests needed**: Invoices generated in PYG, USD, or BRL
- **Done when**: Multi-currency working

## Technical Notes
Paraguay primarily uses PYG (Guaraní). Exchange rates with USD and BRL needed for border clinics. Installment plans are common in Paraguay - typically 3-12 months.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
