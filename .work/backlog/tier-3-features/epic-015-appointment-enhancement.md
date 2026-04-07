---
id: EPIC-015
title: "Appointment System Enhancement"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [EPIC-001]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-015: Appointment System Enhancement

## Context
Basic CRUD exists for appointments, but real-world clinic features are missing: drag-and-drop scheduling, multi-vet conflict detection, and automated reminders.

## Acceptance Criteria
- [ ] Drag-and-drop calendar rescheduling
- [ ] Multi-vet scheduling with conflict detection
- [ ] SMS appointment reminders
- [ ] WhatsApp appointment reminders
- [ ] Online booking with real-time availability
- [ ] Follow-up automation
- [ ] Group appointments supported

## Stories

### STORY-015.1: Add drag-and-drop calendar rescheduling
- **Status**: todo
- **Effort**: M
- **Description**: Implement drag-and-drop on the appointment calendar to reschedule appointments
- **Files to touch**: src/components/appointments/calendar.tsx
- **Tests needed**: Appointments can be dragged to new time slots
- **Done when**: Drag-and-drop rescheduling works

### STORY-015.2: Add multi-vet scheduling with conflict detection
- **Status**: todo
- **Effort**: M
- **Description**: Implement scheduling that shows multiple vets and prevents double-booking
- **Files to touch**: src/services/appointment/, src/components/appointments/
- **Tests needed**: System prevents double-booking a vet
- **Done when**: Multi-vet scheduling with conflict detection

### STORY-015.3: Add SMS appointment reminders (Twilio)
- **Status**: todo
- **Effort**: M
- **Description**: Integrate Twilio for SMS reminders sent 24h and 1h before appointments
- **Files to touch**: src/services/notification/sms.ts, src/app/api/cron/reminders/
- **Tests needed**: SMS sent 24h before appointment
- **Done when**: SMS reminders working via Twilio

### STORY-015.4: Add WhatsApp appointment reminders
- **Status**: todo
- **Effort**: M
- **Description**: Integrate WhatsApp Business API for appointment reminders
- **Files to touch**: src/services/notification/whatsapp.ts
- **Tests needed**: WhatsApp message sent before appointment
- **Done when**: WhatsApp reminders working

### STORY-015.5: Add online booking with real-time availability
- **Status**: todo
- **Effort**: L
- **Description**: Create public booking page showing available slots in real-time
- **Files to touch**: src/app/(public)/book/[clinicId]/page.tsx, src/services/appointment/
- **Tests needed**: Client can book from public page
- **Done when**: Online booking with live availability

### STORY-015.6: Add appointment follow-up automation
- **Status**: todo
- **Effort**: M
- **Description**: Automatically schedule follow-up actions after appointments
- **Files to touch**: src/services/appointment/follow-up.ts, src/app/api/cron/
- **Tests needed**: Follow-up tasks created after appointments
- **Done when**: Follow-up automation working

### STORY-015.7: Add group appointments (vaccination days)
- **Status**: todo
- **Effort**: M
- **Description**: Support scheduling multiple pets/owners in a single time block
- **Files to touch**: src/services/appointment/, src/components/appointments/
- **Tests needed**: Multiple pets bookable in one slot
- **Done when**: Group appointments functional

## Technical Notes
Use a library like @fullcalendar/react for the drag-and-drop calendar. Twilio has good Paraguay support for SMS. WhatsApp Business API requires Meta Business verification.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
