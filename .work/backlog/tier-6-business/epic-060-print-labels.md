---
id: EPIC-060
title: "Print & Label Management"
tier: 6
priority: P6
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-060: Print & Label Management

## Context
Clinics need to print prescription labels, medication labels, cage cards, barcode labels, and receipts on thermal printers.

## Acceptance Criteria
- [ ] Prescription label printing
- [ ] Medication label printing
- [ ] Cage/kennel card printing
- [ ] Barcode label printing
- [ ] Thermal receipt printer support

## Stories

### STORY-060.1: Add prescription label printing
- **Status**: todo
- **Effort**: M
- **Description**: Generate and print prescription labels with patient/drug info
- **Files to touch**: src/services/print/prescription-label.ts
- **Tests needed**: Prescription labels print correctly
- **Done when**: Prescription label printing working

### STORY-060.2: Add medication label printing
- **Status**: todo
- **Effort**: M
- **Description**: Generate medication labels with dosage instructions
- **Files to touch**: src/services/print/medication-label.ts
- **Tests needed**: Medication labels print correctly
- **Done when**: Medication label printing working

### STORY-060.3: Add cage/kennel card printing
- **Status**: todo
- **Effort**: S
- **Description**: Generate cage cards with patient info for hospital/boarding
- **Files to touch**: src/services/print/cage-card.ts
- **Tests needed**: Cage cards print with patient info
- **Done when**: Cage card printing working

### STORY-060.4: Add barcode label printing for inventory
- **Status**: todo
- **Effort**: M
- **Description**: Generate and print barcode labels for inventory items
- **Files to touch**: src/services/print/barcode-label.ts
- **Tests needed**: Barcode labels print and scan correctly
- **Done when**: Barcode label printing working

### STORY-060.5: Add receipt/invoice thermal printer support
- **Status**: todo
- **Effort**: M
- **Description**: Support thermal receipt printers (ESC/POS protocol)
- **Files to touch**: src/services/print/thermal.ts
- **Tests needed**: Receipts print on thermal printer
- **Done when**: Thermal printer support working

## Technical Notes
Use ESC/POS protocol for thermal printers. For label printing, consider ZPL for Zebra printers. Use browser print API for standard printers. Test with common models used in Paraguay.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
