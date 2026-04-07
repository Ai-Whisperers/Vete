---
id: EPIC-018
title: "Surgery & Procedure Management"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-018: Surgery & Procedure Management

## Context
No dedicated surgical workflow exists. Clinics performing surgeries need scheduling, checklists, anesthesia monitoring, and post-op care planning.

## Acceptance Criteria
- [ ] Surgery scheduling module
- [ ] Pre-operative checklist
- [ ] Anesthesia monitoring form
- [ ] Surgery notes template
- [ ] Post-operative care plan
- [ ] Surgical inventory tracking

## Stories

### STORY-018.1: Create surgery scheduling module
- **Status**: todo
- **Effort**: M
- **Description**: Build surgery scheduling with room/equipment allocation
- **Files to touch**: src/app/(clinic)/surgery/, src/services/surgery/
- **Tests needed**: Surgeries can be scheduled with resource allocation
- **Done when**: Surgery scheduling working

### STORY-018.2: Add pre-operative checklist
- **Status**: todo
- **Effort**: M
- **Description**: Create configurable pre-op checklist workflow
- **Files to touch**: src/components/surgery/pre-op-checklist.tsx
- **Tests needed**: Pre-op checklist must be completed before surgery
- **Done when**: Pre-op checklist functional

### STORY-018.3: Add anesthesia monitoring form
- **Status**: todo
- **Effort**: M
- **Description**: Create real-time anesthesia monitoring data entry form
- **Files to touch**: src/components/surgery/anesthesia-monitor.tsx
- **Tests needed**: Anesthesia vitals can be recorded during surgery
- **Done when**: Anesthesia monitoring form working

### STORY-018.4: Add surgery notes template
- **Status**: todo
- **Effort**: S
- **Description**: Create structured surgery notes with procedure, findings, complications
- **Files to touch**: src/components/surgery/surgery-notes.tsx
- **Tests needed**: Structured surgery notes can be saved
- **Done when**: Surgery notes template working

### STORY-018.5: Add post-operative care plan
- **Status**: todo
- **Effort**: M
- **Description**: Create post-op care plan with medication schedule and follow-up dates
- **Files to touch**: src/components/surgery/post-op-plan.tsx
- **Tests needed**: Post-op plan generated from template
- **Done when**: Post-op care plan functional

### STORY-018.6: Add surgical inventory tracking
- **Status**: todo
- **Effort**: M
- **Description**: Track surgical supplies usage per procedure
- **Files to touch**: src/services/surgery/inventory.ts
- **Tests needed**: Supplies deducted from inventory after surgery
- **Done when**: Surgical inventory tracking working

## Technical Notes
Model the surgery workflow as a state machine: Scheduled → Pre-Op → In Surgery → Recovery → Post-Op. Each state transition should trigger appropriate notifications.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
