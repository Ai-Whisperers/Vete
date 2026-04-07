---
id: EPIC-070
title: "Paraguay Payment Ecosystem"
tier: 8
priority: P8
status: backlog
estimated_effort: L
dependencies: [EPIC-014]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-070: Paraguay Payment Ecosystem

## Context
Complete integration with Paraguay's payment ecosystem: Tigo Money, Billetera Personal, Bancard vPOS, Aquí Pago, and IVA tax calculation.

## Acceptance Criteria
- [ ] Tigo Money integration complete
- [ ] Billetera Personal integration
- [ ] Bancard vPOS integration
- [ ] Aquí Pago integration
- [ ] IVA calculation and reporting

## Stories

### STORY-070.1: Complete Tigo Money integration
- **Status**: todo
- **Effort**: M
- **Description**: Finish and polish Tigo Money payment integration
- **Files to touch**: src/services/payment/tigo-money.ts
- **Tests needed**: Tigo Money payments working in production
- **Done when**: Tigo Money integration complete

### STORY-070.2: Add Billetera Personal integration
- **Status**: todo
- **Effort**: M
- **Description**: Integrate Billetera Personal mobile wallet
- **Files to touch**: src/services/payment/billetera-personal.ts
- **Tests needed**: Billetera Personal payments processing
- **Done when**: Billetera Personal integration working

### STORY-070.3: Add Bancard vPOS integration
- **Status**: todo
- **Effort**: M
- **Description**: Integrate Bancard virtual POS for card payments
- **Files to touch**: src/services/payment/bancard-vpos.ts
- **Tests needed**: Card payments via Bancard vPOS
- **Done when**: Bancard vPOS integration working

### STORY-070.4: Add Aquí Pago integration
- **Status**: todo
- **Effort**: M
- **Description**: Integrate Aquí Pago payment network
- **Files to touch**: src/services/payment/aqui-pago.ts
- **Tests needed**: Aquí Pago payments processing
- **Done when**: Aquí Pago integration working

### STORY-070.5: Add IVA (VAT) calculation and reporting
- **Status**: todo
- **Effort**: M
- **Description**: Implement IVA tax calculation and generate IVA reports
- **Files to touch**: src/services/billing/iva.ts
- **Tests needed**: IVA calculated correctly and reported
- **Done when**: IVA calculation and reporting working

## Technical Notes
IVA rate in Paraguay is 10% (general) and 5% (reduced, for some medical services). All invoices must show IVA separately. Monthly IVA reporting required to SET (tax authority).

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
