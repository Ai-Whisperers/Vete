---
id: EPIC-077
title: "Webhook & Integration Platform"
tier: 9
priority: P9
status: backlog
estimated_effort: M
dependencies: [EPIC-041]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-077: Webhook & Integration Platform

## Context
An integration platform with webhooks, IoT device endpoints, Zapier support, and an event bus enables extensibility and third-party integrations.

## Acceptance Criteria
- [ ] Outgoing webhook management UI
- [ ] Incoming webhook endpoints for IoT
- [ ] Zapier/n8n trigger support
- [ ] Event bus for decoupled integrations
- [ ] Integration marketplace

## Stories

### STORY-077.1: Add outgoing webhook management UI
- **Status**: todo
- **Effort**: M
- **Description**: Create UI for managing webhook subscriptions with event filtering
- **Files to touch**: src/app/(admin)/webhooks/, src/services/webhooks/
- **Tests needed**: Webhooks configurable from admin UI
- **Done when**: Webhook management UI functional

### STORY-077.2: Add incoming webhook endpoints for IoT devices
- **Status**: todo
- **Effort**: M
- **Description**: Create endpoints for receiving data from IoT devices (scales, sensors)
- **Files to touch**: src/app/api/webhooks/iot/, src/services/iot/
- **Tests needed**: IoT data received via webhooks
- **Done when**: IoT webhook endpoints working

### STORY-077.3: Add Zapier/n8n trigger support
- **Status**: todo
- **Effort**: M
- **Description**: Expose triggers compatible with Zapier and n8n automation platforms
- **Files to touch**: src/app/api/integrations/zapier/
- **Tests needed**: Triggers fire in Zapier/n8n
- **Done when**: Zapier/n8n triggers working

### STORY-077.4: Add event bus for decoupled integrations
- **Status**: todo
- **Effort**: L
- **Description**: Implement internal event bus for pub/sub within the application
- **Files to touch**: src/services/events/bus.ts
- **Tests needed**: Events published and consumed across services
- **Done when**: Event bus functional

### STORY-077.5: Add integration marketplace
- **Status**: todo
- **Effort**: L
- **Description**: Create marketplace for browsing and installing integrations
- **Files to touch**: src/app/(admin)/integrations/
- **Tests needed**: Integrations browsable and installable
- **Done when**: Integration marketplace functional

## Technical Notes
Use EventEmitter pattern for internal event bus. For Zapier, implement their partner API spec. n8n can consume standard webhooks. Event naming: entity.action (e.g., appointment.created).

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
