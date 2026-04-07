---
id: EPIC-095
title: "Smart Clinic Dashboard"
tier: 11
priority: P11
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-095: Smart Clinic Dashboard

## Context
A customizable dashboard with real-time widgets, revenue counter, patient flow visualization, and AI-generated daily briefing for clinic managers.

## Acceptance Criteria
- [ ] Customizable widget dashboard
- [ ] Real-time revenue counter
- [ ] Patient flow visualization
- [ ] Quick actions panel
- [ ] AI-generated daily briefing

## Stories

### STORY-095.1: Add customizable widget dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Create dashboard with draggable, configurable widgets
- **Files to touch**: src/components/dashboard/widget-dashboard.tsx
- **Tests needed**: Widgets rearrangeable and configurable
- **Done when**: Customizable dashboard working

### STORY-095.2: Add real-time revenue counter
- **Status**: todo
- **Effort**: S
- **Description**: Show live revenue counter for current day/week/month
- **Files to touch**: src/components/dashboard/revenue-counter.tsx
- **Tests needed**: Revenue updates in real-time
- **Done when**: Revenue counter live

### STORY-095.3: Add patient flow visualization
- **Status**: todo
- **Effort**: M
- **Description**: Visualize patient flow through the clinic (waiting → consult → checkout)
- **Files to touch**: src/components/dashboard/patient-flow.tsx
- **Tests needed**: Patient flow visible as Kanban/pipeline
- **Done when**: Patient flow visualization working

### STORY-095.4: Add quick actions panel
- **Status**: todo
- **Effort**: S
- **Description**: Add panel with shortcuts to common clinic actions
- **Files to touch**: src/components/dashboard/quick-actions.tsx
- **Tests needed**: Quick actions accessible from dashboard
- **Done when**: Quick actions panel working

### STORY-095.5: Add daily briefing summary (AI-generated)
- **Status**: todo
- **Effort**: M
- **Description**: Generate AI summary of yesterday's activity and today's schedule
- **Files to touch**: src/services/ai/daily-briefing.ts
- **Tests needed**: Daily briefing available each morning
- **Done when**: Daily briefing generation working

## Technical Notes
Use react-grid-layout for draggable widgets. Common widgets: appointments today, revenue, patient queue, low stock alerts, pending tasks, weather (for outdoor clinics). Daily briefing uses LLM to summarize.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
