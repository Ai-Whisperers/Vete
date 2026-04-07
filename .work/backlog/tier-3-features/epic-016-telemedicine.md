---
id: EPIC-016
title: "Telemedicine Module"
tier: 3
priority: P3
status: backlog
estimated_effort: XL
dependencies: [EPIC-001, EPIC-015]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-016: Telemedicine Module

## Context
Telemedicine is completely missing but is a competitive necessity, especially for rural Paraguay where vet access is limited.

## Acceptance Criteria
- [ ] Video call integration working
- [ ] Teleconsultation booking flow
- [ ] In-call note-taking interface
- [ ] Post-consultation summary generation
- [ ] Telemedicine billing integration
- [ ] Recording consent and storage

## Stories

### STORY-016.1: Integrate video call (WebRTC or Zoom SDK)
- **Status**: todo
- **Effort**: L
- **Description**: Implement video calling using WebRTC (Daily.co, Twilio Video, or Zoom SDK)
- **Files to touch**: src/services/telemedicine/, src/components/telemedicine/video-call.tsx
- **Tests needed**: Video call connects between vet and client
- **Done when**: Video calling functional

### STORY-016.2: Add teleconsultation booking flow
- **Status**: todo
- **Effort**: M
- **Description**: Create booking flow specifically for telemedicine appointments
- **Files to touch**: src/app/(portal)/book-teleconsult/, src/services/appointment/
- **Tests needed**: Client can book a teleconsultation
- **Done when**: Teleconsult booking flow complete

### STORY-016.3: Add in-call note-taking interface
- **Status**: todo
- **Effort**: M
- **Description**: Create split-screen interface for note-taking during video calls
- **Files to touch**: src/components/telemedicine/call-notes.tsx
- **Tests needed**: Vet can take notes during call
- **Done when**: In-call notes interface working

### STORY-016.4: Add post-consultation summary + prescription
- **Status**: todo
- **Effort**: M
- **Description**: Auto-generate consultation summary and allow prescription creation after call
- **Files to touch**: src/services/telemedicine/summary.ts, src/components/telemedicine/
- **Tests needed**: Summary generated after call ends
- **Done when**: Post-call summary and prescription flow

### STORY-016.5: Add telemedicine billing integration
- **Status**: todo
- **Effort**: M
- **Description**: Integrate telemedicine consultations with the billing system
- **Files to touch**: src/services/payment/, src/services/telemedicine/
- **Tests needed**: Teleconsult generates invoice
- **Done when**: Telemedicine billing integrated

### STORY-016.6: Add recording consent and storage
- **Status**: todo
- **Effort**: M
- **Description**: Implement consent collection and secure recording storage
- **Files to touch**: src/components/telemedicine/consent.tsx, src/services/storage/
- **Tests needed**: Recording saved with consent on file
- **Done when**: Recording consent and storage working

## Technical Notes
Daily.co offers the simplest WebRTC integration with React. For Paraguay's bandwidth constraints, ensure video quality adapts to connection speed. Consider audio-only fallback.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
