---
id: EPIC-097
title: "Community & Ecosystem"
tier: 11
priority: P11
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-097: Community & Ecosystem

## Context
Building a professional community creates network effects: vet directory, specialist referrals, CE events, peer consultation, and shared protocols.

## Acceptance Criteria
- [ ] Veterinary professional directory
- [ ] Specialist referral network
- [ ] CE/training event calendar
- [ ] Peer consultation forum
- [ ] Shared treatment protocol library

## Stories

### STORY-097.1: Add veterinary professional directory
- **Status**: todo
- **Effort**: M
- **Description**: Create searchable directory of veterinary professionals
- **Files to touch**: src/app/(public)/directory/, src/services/community/
- **Tests needed**: Vets searchable by specialty/location
- **Done when**: Professional directory functional

### STORY-097.2: Add specialist referral network
- **Status**: todo
- **Effort**: M
- **Description**: Enable specialist referrals with tracking and feedback
- **Files to touch**: src/services/community/referrals.ts
- **Tests needed**: Referrals tracked end-to-end
- **Done when**: Referral network working

### STORY-097.3: Add CE/training event calendar
- **Status**: todo
- **Effort**: M
- **Description**: Create calendar of continuing education events
- **Files to touch**: src/app/(portal)/events/, src/services/community/
- **Tests needed**: CE events listed and bookable
- **Done when**: Event calendar functional

### STORY-097.4: Add peer consultation forum
- **Status**: todo
- **Effort**: L
- **Description**: Create forum for veterinary peer consultation and case discussion
- **Files to touch**: src/app/(portal)/forum/
- **Tests needed**: Forum functional with discussions
- **Done when**: Peer forum working

### STORY-097.5: Add shared treatment protocol library
- **Status**: todo
- **Effort**: M
- **Description**: Create library of shareable treatment protocols
- **Files to touch**: src/app/(portal)/protocols/, src/services/community/
- **Tests needed**: Protocols shared and adoptable
- **Done when**: Protocol library functional

## Technical Notes
Professional directory should verify veterinary licenses. Peer consultation forum needs moderation and anonymization options for patient privacy. CE tracking integrates with EPIC-029 (staff management).

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
