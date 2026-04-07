---
id: EPIC-088
title: "Client Segmentation & Marketing"
tier: 10
priority: P10
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-088: Client Segmentation & Marketing

## Context
Client segmentation enables targeted marketing: RFM analysis, automated campaigns, win-back programs, and referral gamification drive revenue and retention.

## Acceptance Criteria
- [ ] RFM-based client segmentation
- [ ] Automated email campaigns by segment
- [ ] Win-back campaigns for inactive clients
- [ ] Birthday/anniversary promotions
- [ ] Referral program gamification

## Stories

### STORY-088.1: Add client segmentation engine (RFM analysis)
- **Status**: todo
- **Effort**: M
- **Description**: Implement Recency-Frequency-Monetary value analysis for client segmentation
- **Files to touch**: src/services/marketing/rfm.ts
- **Tests needed**: Clients segmented by RFM scores
- **Done when**: RFM segmentation working

### STORY-088.2: Add automated email campaigns based on segments
- **Status**: todo
- **Effort**: M
- **Description**: Create automated email campaigns triggered by segment membership
- **Files to touch**: src/services/marketing/campaigns.ts
- **Tests needed**: Campaigns send to targeted segments
- **Done when**: Segment campaigns working

### STORY-088.3: Add win-back campaigns for inactive clients
- **Status**: todo
- **Effort**: M
- **Description**: Automate outreach to clients who haven't visited recently
- **Files to touch**: src/services/marketing/win-back.ts
- **Tests needed**: Win-back emails sent to inactive clients
- **Done when**: Win-back campaigns working

### STORY-088.4: Add birthday/anniversary promotions
- **Status**: todo
- **Effort**: S
- **Description**: Send promotional offers on pet birthdays and adoption anniversaries
- **Files to touch**: src/services/marketing/promotions.ts
- **Tests needed**: Birthday promotions sent automatically
- **Done when**: Birthday promotions working

### STORY-088.5: Add referral program gamification
- **Status**: todo
- **Effort**: M
- **Description**: Gamify referral program with leaderboards and rewards
- **Files to touch**: src/components/marketing/referral-game.tsx
- **Tests needed**: Referral game engaging and tracking
- **Done when**: Referral gamification working

## Technical Notes
RFM: Recency (days since last visit), Frequency (visits per year), Monetary (total spend). Segment into: Champions, Loyal, At Risk, Lost. Win-back: 90+ days inactive triggers campaign.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
