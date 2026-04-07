---
id: EPIC-019
title: "Dental Charting"
tier: 3
priority: P3
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-019: Dental Charting

## Context
No dental recording interface. Dental procedures are a significant revenue source for vet clinics and need proper documentation.

## Acceptance Criteria
- [ ] Dental chart component with tooth diagram
- [ ] Dental procedure recording
- [ ] Dental history timeline
- [ ] Dental image attachment

## Stories

### STORY-019.1: Create dental chart component (tooth diagram)
- **Status**: todo
- **Effort**: L
- **Description**: Build interactive SVG tooth diagram for dogs/cats with clickable teeth
- **Files to touch**: src/components/dental/dental-chart.tsx
- **Tests needed**: Tooth diagram renders with clickable teeth
- **Done when**: Interactive dental chart working

### STORY-019.2: Add dental procedure recording
- **Status**: todo
- **Effort**: M
- **Description**: Allow recording dental procedures per tooth (extraction, cleaning, etc.)
- **Files to touch**: src/components/dental/procedure-form.tsx, src/services/dental/
- **Tests needed**: Dental procedures saved per tooth
- **Done when**: Dental procedure recording working

### STORY-019.3: Add dental history timeline
- **Status**: todo
- **Effort**: S
- **Description**: Show dental procedure history for each pet over time
- **Files to touch**: src/components/dental/history.tsx
- **Tests needed**: Dental history visible as timeline
- **Done when**: Dental history timeline working

### STORY-019.4: Add dental image attachment
- **Status**: todo
- **Effort**: S
- **Description**: Allow attaching dental photos/X-rays to dental records
- **Files to touch**: src/components/dental/image-attach.tsx
- **Tests needed**: Images attachable to dental records
- **Done when**: Dental image attachment working

## Technical Notes
Dental charts differ by species. Dogs have 42 adult teeth, cats have 30. Use SVG for the interactive tooth diagram. Consider using the veterinary dental notation system (Triadan).

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
