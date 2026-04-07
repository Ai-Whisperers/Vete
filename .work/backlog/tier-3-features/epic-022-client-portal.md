---
id: EPIC-022
title: "Client Portal Enhancement"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [EPIC-001]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-022: Client Portal Enhancement

## Context
Portal exists but login is broken and UX is incomplete. Pet owners need self-service access to health records, appointments, and billing.

## Acceptance Criteria
- [ ] Portal login working (depends on EPIC-001)
- [ ] Pet health timeline view
- [ ] Vaccination certificate download
- [ ] Appointment self-service
- [ ] Billing/payment history view
- [ ] Prescription refill request
- [ ] Pet profile sharing via QR code

## Stories

### STORY-022.1: Fix portal login (depends on EPIC-001)
- **Status**: todo
- **Effort**: S
- **Description**: Ensure portal login works after EPIC-001 auth fix
- **Files to touch**: src/app/terrapet/portal/login/
- **Tests needed**: Portal login succeeds
- **Done when**: Portal login functional

### STORY-022.2: Add pet health timeline view
- **Status**: todo
- **Effort**: M
- **Description**: Create visual timeline of all health events for a pet
- **Files to touch**: src/components/portal/health-timeline.tsx
- **Tests needed**: Timeline shows visits, vaccines, procedures
- **Done when**: Pet health timeline displays correctly

### STORY-022.3: Add vaccination certificate download
- **Status**: todo
- **Effort**: M
- **Description**: Generate downloadable vaccination certificates as PDF
- **Files to touch**: src/services/pdf/vaccination-cert.ts, src/components/portal/
- **Tests needed**: PDF certificate downloads with vaccine history
- **Done when**: Vaccination certificate PDF generation

### STORY-022.4: Add appointment self-service (book, cancel, reschedule)
- **Status**: todo
- **Effort**: M
- **Description**: Allow pet owners to manage their appointments from the portal
- **Files to touch**: src/app/(portal)/appointments/, src/services/appointment/
- **Tests needed**: Clients can book/cancel/reschedule from portal
- **Done when**: Appointment self-service functional

### STORY-022.5: Add billing/payment history view
- **Status**: todo
- **Effort**: M
- **Description**: Show payment history and outstanding invoices in the portal
- **Files to touch**: src/app/(portal)/billing/, src/components/portal/billing.tsx
- **Tests needed**: Payment history visible with invoice download
- **Done when**: Billing history view working

### STORY-022.6: Add prescription refill request
- **Status**: todo
- **Effort**: S
- **Description**: Allow clients to request prescription refills from portal
- **Files to touch**: src/components/portal/refill-request.tsx
- **Tests needed**: Refill request submitted and vet notified
- **Done when**: Prescription refill request working

### STORY-022.7: Add food/product auto-reorder from store
- **Status**: todo
- **Effort**: M
- **Description**: Allow setting up automatic reorders for pet food/supplies
- **Files to touch**: src/components/portal/auto-reorder.tsx, src/services/store/
- **Tests needed**: Auto-reorder configured and triggers
- **Done when**: Auto-reorder functional

### STORY-022.8: Add pet profile sharing (QR code)
- **Status**: todo
- **Effort**: S
- **Description**: Generate QR code with pet profile info for sharing with other vets/emergencies
- **Files to touch**: src/components/portal/pet-qr.tsx
- **Tests needed**: QR code generates with pet info
- **Done when**: Pet profile QR sharing working

## Technical Notes
The portal is at /terrapet/portal/. After fixing login (EPIC-001), focus on the most-used features: appointment booking and health records. QR code can use `qrcode` npm package.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
