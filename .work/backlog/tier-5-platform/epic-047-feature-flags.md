---
id: EPIC-047
title: "Feature Flags & Experimentation"
tier: 5
priority: P5
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-047: Feature Flags & Experimentation

## Context
A features_enabled column exists but there's no full feature flag system. Need gradual rollouts, A/B testing, and feature flag management UI.

## Acceptance Criteria
- [ ] Full feature flag system
- [ ] A/B testing framework
- [ ] Gradual rollout percentages
- [ ] Feature flag audit trail
- [ ] Feature flag UI in admin panel

## Stories

### STORY-047.1: Expand features_enabled to full feature flag system
- **Status**: todo
- **Effort**: M
- **Description**: Build feature flag service with per-clinic and per-user targeting
- **Files to touch**: src/services/feature-flags/, src/lib/feature-flags.ts
- **Tests needed**: Feature flags evaluate per user/clinic
- **Done when**: Feature flag system functional

### STORY-047.2: Add A/B testing framework
- **Status**: todo
- **Effort**: M
- **Description**: Implement A/B test assignment and measurement
- **Files to touch**: src/services/experiments/, src/lib/ab-test.ts
- **Tests needed**: A/B tests assign variants and track outcomes
- **Done when**: A/B testing framework working

### STORY-047.3: Add gradual rollout percentages
- **Status**: todo
- **Effort**: M
- **Description**: Enable percentage-based feature rollout
- **Files to touch**: src/services/feature-flags/rollout.ts
- **Tests needed**: Features roll out to configured percentage
- **Done when**: Gradual rollout working

### STORY-047.4: Add feature flag audit trail
- **Status**: todo
- **Effort**: S
- **Description**: Log all feature flag changes with who/when/why
- **Files to touch**: src/services/feature-flags/audit.ts
- **Tests needed**: Flag changes logged in audit trail
- **Done when**: Audit trail for flags working

### STORY-047.5: Add feature flag UI in admin panel
- **Status**: todo
- **Effort**: M
- **Description**: Create admin UI for managing feature flags
- **Files to touch**: src/app/(admin)/feature-flags/
- **Tests needed**: Flags manageable from admin UI
- **Done when**: Feature flag admin UI functional

## Technical Notes
Consider using LaunchDarkly SDK for enterprise or building in-house with the existing features_enabled column. For A/B testing, use deterministic hashing for consistent variant assignment.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
