---
id: EPIC-096
title: "IoT & Device Integration"
tier: 11
priority: P11
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-096: IoT & Device Integration

## Context
IoT integration connects clinic equipment to the platform: weight scales, temperature monitors, activity trackers, and smart kennel sensors.

## Acceptance Criteria
- [ ] Weight scale integration
- [ ] Temperature monitor integration
- [ ] Pet activity tracker data import
- [ ] Smart kennel sensors
- [ ] Clinic environment monitoring

## Stories

### STORY-096.1: Add weight scale integration (auto-record)
- **Status**: todo
- **Effort**: M
- **Description**: Connect digital scales to auto-record pet weight
- **Files to touch**: src/services/iot/weight-scale.ts
- **Tests needed**: Weight recorded automatically from scale
- **Done when**: Weight scale integration working

### STORY-096.2: Add temperature monitor integration
- **Status**: todo
- **Effort**: M
- **Description**: Connect temperature monitors for continuous monitoring
- **Files to touch**: src/services/iot/temperature.ts
- **Tests needed**: Temperature data streams to patient record
- **Done when**: Temperature monitoring working

### STORY-096.3: Add pet activity tracker data import
- **Status**: todo
- **Effort**: M
- **Description**: Import data from pet activity trackers (FitBark, Whistle)
- **Files to touch**: src/services/iot/activity-tracker.ts
- **Tests needed**: Activity data visible in patient profile
- **Done when**: Activity tracker import working

### STORY-096.4: Add smart kennel sensors
- **Status**: todo
- **Effort**: M
- **Description**: Connect kennel environment sensors (temperature, humidity, motion)
- **Files to touch**: src/services/iot/kennel-sensors.ts
- **Tests needed**: Kennel conditions monitored and alerted
- **Done when**: Kennel sensors working

### STORY-096.5: Add clinic environment monitoring
- **Status**: todo
- **Effort**: M
- **Description**: Monitor clinic environment (waiting room, surgery, storage temperatures)
- **Files to touch**: src/services/iot/environment.ts
- **Tests needed**: Clinic conditions monitored and alerted
- **Done when**: Environment monitoring working

## Technical Notes
Use MQTT or WebSocket for IoT device communication. Weight scales: many support USB/serial or Bluetooth. For kennel sensors, consider ESP32-based DIY sensors with MQTT. Focus on reliability.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
