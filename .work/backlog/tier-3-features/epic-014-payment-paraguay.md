---
id: EPIC-014
title: "Payment Processing (Paraguay)"
tier: 3
priority: P3
status: backlog
estimated_effort: XL
dependencies: [EPIC-001]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-014: Payment Processing (Paraguay)

## Context
Only Stripe is configured, but Paraguay primarily uses local payment methods: Tigo Money, Billetera Personal, Bancard, and QR payments. Cash is also very common.

## Acceptance Criteria
- [ ] Tigo Money integration working
- [ ] Billetera Personal integration working
- [ ] Bancard POS terminal API integrated
- [ ] QR payment support added
- [ ] Cash payment recording workflow
- [ ] Payment receipt PDF generation
- [ ] Split payment support

## Stories

### STORY-014.1: Integrate Tigo Money
- **Status**: todo
- **Effort**: L
- **Description**: Implement Tigo Money payment method - the most used mobile payment in Paraguay
- **Files to touch**: src/services/payment/, src/app/api/payments/tigo-money/
- **Tests needed**: Test payment succeeds with Tigo Money sandbox
- **Done when**: Tigo Money payments processing

### STORY-014.2: Integrate Billetera Personal
- **Status**: todo
- **Effort**: L
- **Description**: Implement Billetera Personal payment method
- **Files to touch**: src/services/payment/, src/app/api/payments/billetera/
- **Tests needed**: Test payment succeeds with Billetera sandbox
- **Done when**: Billetera Personal payments processing

### STORY-014.3: Integrate Bancard POS terminal API
- **Status**: todo
- **Effort**: L
- **Description**: Implement Bancard vPOS integration for card payments
- **Files to touch**: src/services/payment/, src/app/api/payments/bancard/
- **Tests needed**: Test payment succeeds with Bancard sandbox
- **Done when**: Bancard POS integration working

### STORY-014.4: Add QR payment support
- **Status**: todo
- **Effort**: M
- **Description**: Implement QR code-based payment following Paraguay's QR standard
- **Files to touch**: src/services/payment/, src/components/payment/qr-payment.tsx
- **Tests needed**: QR code generates and payment processes
- **Done when**: QR payment functional

### STORY-014.5: Add cash payment recording workflow
- **Status**: todo
- **Effort**: S
- **Description**: Create UI for recording cash payments with change calculation
- **Files to touch**: src/components/payment/cash-payment.tsx, src/services/payment/
- **Tests needed**: Cash payment recorded in system
- **Done when**: Cash payment workflow complete

### STORY-014.6: Add payment receipt PDF generation
- **Status**: todo
- **Effort**: M
- **Description**: Generate PDF receipts for all payment types with clinic branding
- **Files to touch**: src/services/pdf/, src/templates/receipt.tsx
- **Tests needed**: PDF receipt generates after payment
- **Done when**: PDF receipt generation working

### STORY-014.7: Add split payment support
- **Status**: todo
- **Effort**: M
- **Description**: Allow splitting a bill across multiple payment methods
- **Files to touch**: src/components/payment/split-payment.tsx, src/services/payment/
- **Tests needed**: Bill splits across 2+ methods
- **Done when**: Split payment functional

## Technical Notes
Tigo Money API docs: https://www.tigo.com.py/tigo-money-api. Bancard vPOS: https://www.bancard.com.py/vpos. All payment integrations need sandbox testing before production.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
