---
id: EPIC-091
title: "Pet Health Score"
tier: 11
priority: P11
status: backlog
estimated_effort: L
dependencies: [EPIC-031]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-091: Pet Health Score

## Context
A proprietary health score algorithm creates a unique value proposition. Track health trends, benchmark by breed/age, and alert on declining pets.

## Acceptance Criteria
- [ ] Proprietary health score algorithm
- [ ] Health score widget on pet profile
- [ ] Health score trend tracking
- [ ] Declining health alerts
- [ ] Health score benchmarking by breed/age

## Stories

### STORY-091.1: Create proprietary health score algorithm
- **Status**: todo
- **Effort**: L
- **Description**: Design and implement multi-factor health scoring algorithm
- **Files to touch**: src/services/health-score/algorithm.ts
- **Tests needed**: Health scores calculated for all patients
- **Done when**: Health score algorithm working

### STORY-091.2: Add health score widget on pet profile
- **Status**: todo
- **Effort**: S
- **Description**: Display health score prominently on pet profile page
- **Files to touch**: src/components/pet/health-score-widget.tsx
- **Tests needed**: Health score visible on profile
- **Done when**: Health score widget displayed

### STORY-091.3: Add health score trend tracking
- **Status**: todo
- **Effort**: M
- **Description**: Track health score changes over time with charts
- **Files to touch**: src/components/pet/health-trend.tsx
- **Tests needed**: Health score trend charted over time
- **Done when**: Trend tracking working

### STORY-091.4: Add health score alerts for declining pets
- **Status**: todo
- **Effort**: S
- **Description**: Alert when a pet's health score drops significantly
- **Files to touch**: src/services/health-score/alerts.ts
- **Tests needed**: Alert fires on significant score drop
- **Done when**: Decline alerts working

### STORY-091.5: Add health score benchmarking by breed/age
- **Status**: todo
- **Effort**: M
- **Description**: Compare health score against breed/age group averages
- **Files to touch**: src/services/health-score/benchmark.ts
- **Tests needed**: Score compared to breed/age averages
- **Done when**: Benchmarking working

## Technical Notes
Health score factors: vaccination compliance, dental health, weight/BCS, chronic conditions, visit frequency, lab results. Weight factors based on veterinary evidence. Scale: 0-100.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
