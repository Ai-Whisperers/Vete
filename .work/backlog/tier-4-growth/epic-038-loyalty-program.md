---
id: EPIC-038
title: "Loyalty Program Enhancement"
tier: 4
priority: P4
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-038: Loyalty Program Enhancement

## Context
Loyalty points widget and redemption component are currently TODO placeholders. A working loyalty program increases client retention and repeat visits.

## Acceptance Criteria
- [ ] Loyalty points widget complete
- [ ] Loyalty redemption component complete
- [ ] Tiered loyalty levels
- [ ] Referral points
- [ ] Loyalty analytics

## Stories

### STORY-038.1: Complete loyalty points widget (currently TODO)
- **Status**: todo
- **Effort**: M
- **Description**: Implement the loyalty points display widget showing balance and recent activity
- **Files to touch**: src/components/loyalty/points-widget.tsx
- **Tests needed**: Points widget shows balance and activity
- **Done when**: Loyalty points widget functional

### STORY-038.2: Complete loyalty redemption component (currently TODO)
- **Status**: todo
- **Effort**: M
- **Description**: Implement the redemption flow for using loyalty points
- **Files to touch**: src/components/loyalty/redemption.tsx, src/services/loyalty/
- **Tests needed**: Points redeemable for discounts/services
- **Done when**: Loyalty redemption working

### STORY-038.3: Add tiered loyalty levels (Bronze, Silver, Gold)
- **Status**: todo
- **Effort**: M
- **Description**: Implement loyalty tiers with escalating benefits
- **Files to touch**: src/services/loyalty/tiers.ts
- **Tests needed**: Tiers assigned based on spend/visits
- **Done when**: Loyalty tiers functional

### STORY-038.4: Add points for referrals
- **Status**: todo
- **Effort**: S
- **Description**: Award loyalty points when clients refer new clients
- **Files to touch**: src/services/loyalty/referral.ts
- **Tests needed**: Points awarded for successful referrals
- **Done when**: Referral points working

### STORY-038.5: Add loyalty program analytics
- **Status**: todo
- **Effort**: M
- **Description**: Create dashboard showing loyalty program effectiveness
- **Files to touch**: src/components/reports/loyalty.tsx
- **Tests needed**: Loyalty analytics visible
- **Done when**: Loyalty analytics dashboard working

## Technical Notes
Current TODO components are at `src/components/loyalty/`. Standard loyalty model: 1 point per $1 spent, 100 points = $1 discount. Tiered multipliers: Bronze 1x, Silver 1.5x, Gold 2x.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
