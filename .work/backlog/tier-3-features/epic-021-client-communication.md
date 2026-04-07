---
id: EPIC-021
title: "Client Communication Hub"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [EPIC-015]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-021: Client Communication Hub

## Context
WhatsApp/SMS partially implemented. A unified communication hub is needed for appointment reminders, vaccine reminders, billing notifications, and bulk messaging.

## Acceptance Criteria
- [ ] WhatsApp Business API fully integrated
- [ ] Appointment reminder templates
- [ ] Vaccine reminder templates
- [ ] Billing reminder templates
- [ ] Bulk messaging campaigns
- [ ] Message delivery tracking
- [ ] Chatbot for common inquiries

## Stories

### STORY-021.1: Complete WhatsApp Business API integration
- **Status**: todo
- **Effort**: L
- **Description**: Finish the WhatsApp Business API integration for sending and receiving messages
- **Files to touch**: src/services/notification/whatsapp.ts, src/app/api/webhooks/whatsapp/
- **Tests needed**: Messages send and receive via WhatsApp
- **Done when**: WhatsApp integration fully functional

### STORY-021.2: Add appointment reminder templates
- **Status**: todo
- **Effort**: S
- **Description**: Create WhatsApp/SMS templates for appointment reminders
- **Files to touch**: src/templates/notifications/appointment.ts
- **Tests needed**: Appointment reminders sent via templates
- **Done when**: Appointment reminder templates working

### STORY-021.3: Add vaccine reminder templates
- **Status**: todo
- **Effort**: S
- **Description**: Create templates for vaccine due date reminders
- **Files to touch**: src/templates/notifications/vaccine.ts
- **Tests needed**: Vaccine reminders sent when due
- **Done when**: Vaccine reminder templates working

### STORY-021.4: Add billing reminder templates
- **Status**: todo
- **Effort**: S
- **Description**: Create templates for outstanding invoice reminders
- **Files to touch**: src/templates/notifications/billing.ts
- **Tests needed**: Billing reminders sent for overdue invoices
- **Done when**: Billing reminder templates working

### STORY-021.5: Add bulk messaging campaigns
- **Status**: todo
- **Effort**: M
- **Description**: Create bulk messaging system for marketing campaigns with opt-out
- **Files to touch**: src/components/messaging/campaign.tsx, src/services/notification/
- **Tests needed**: Bulk messages sent to filtered audiences
- **Done when**: Bulk messaging with opt-out working

### STORY-021.6: Add message delivery tracking
- **Status**: todo
- **Effort**: S
- **Description**: Track delivery status (sent, delivered, read) for all messages
- **Files to touch**: src/services/notification/tracking.ts
- **Tests needed**: Delivery status visible for each message
- **Done when**: Message delivery tracking working

### STORY-021.7: Add chatbot for common inquiries
- **Status**: todo
- **Effort**: L
- **Description**: Implement AI chatbot for handling common client questions (hours, directions, prices)
- **Files to touch**: src/services/chatbot/, src/app/api/chatbot/
- **Tests needed**: Chatbot answers common questions
- **Done when**: Chatbot functional for basic inquiries

## Technical Notes
WhatsApp Business API requires Meta Business verification (can take weeks). Message templates must be pre-approved by Meta. Consider using Twilio or 360dialog as the WhatsApp BSP.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
