---
id: EPIC-092
title: "Predictive Health Alerts"
tier: 11
priority: P11
status: backlog
estimated_effort: L
dependencies: [EPIC-091]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-092: Predictive Health Alerts

## Context
Predictive alerts proactively identify health risks before they become problems: vaccine overdue, early chronic disease warning, weight anomalies, and medication adherence.

## Acceptance Criteria
- [ ] Vaccine overdue prediction
- [ ] Chronic disease early warning
- [ ] Weight gain/loss anomaly detection
- [ ] Appointment no-show prediction
- [ ] Medication adherence tracking

## Stories

### STORY-092.1: Add vaccine overdue prediction
- **Status**: todo
- **Effort**: M
- **Description**: Predict and alert on upcoming and overdue vaccinations
- **Files to touch**: src/services/predictive/vaccines.ts
- **Tests needed**: Overdue vaccines flagged proactively
- **Done when**: Vaccine prediction working

### STORY-092.2: Add chronic disease early warning
- **Status**: todo
- **Effort**: L
- **Description**: Detect early signs of chronic diseases from trends
- **Files to touch**: src/services/predictive/chronic.ts
- **Tests needed**: Early warning flags for chronic conditions
- **Done when**: Chronic disease warning working

### STORY-092.3: Add weight gain/loss anomaly detection
- **Status**: todo
- **Effort**: M
- **Description**: Detect unusual weight changes and alert
- **Files to touch**: src/services/predictive/weight.ts
- **Tests needed**: Anomalous weight changes flagged
- **Done when**: Weight anomaly detection working

### STORY-092.4: Add appointment no-show prediction
- **Status**: todo
- **Effort**: M
- **Description**: Predict no-show likelihood and trigger preventive outreach
- **Files to touch**: src/services/predictive/no-show.ts
- **Tests needed**: No-show risk shown at booking
- **Done when**: No-show prediction working

### STORY-092.5: Add medication adherence tracking
- **Status**: todo
- **Effort**: M
- **Description**: Track and predict medication adherence
- **Files to touch**: src/services/predictive/adherence.ts
- **Tests needed**: Non-adherence predicted and flagged
- **Done when**: Adherence tracking working

## Technical Notes
Start with rule-based predictions, then enhance with ML. Vaccine prediction is straightforward from schedule data. Weight anomaly: flag >10% change in 30 days. Chronic disease: look for patterns in lab trends.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
