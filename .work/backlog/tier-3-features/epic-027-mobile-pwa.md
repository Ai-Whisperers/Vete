---
id: EPIC-027
title: "Mobile PWA"
tier: 3
priority: P3
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-027: Mobile PWA

## Context
Web-only with no offline capability or push notifications. Mobile PWA is essential for field vets and for the pet owner portal experience.

## Acceptance Criteria
- [ ] PWA manifest and service worker
- [ ] Offline mode for critical features
- [ ] Push notifications working
- [ ] Camera integration for pet photos
- [ ] Barcode scanner using native camera
- [ ] Install prompt for mobile users

## Stories

### STORY-027.1: Add PWA manifest and service worker
- **Status**: todo
- **Effort**: M
- **Description**: Create PWA manifest with icons, splash screen, and install capability
- **Files to touch**: public/manifest.json, src/service-worker.ts, next.config.ts
- **Tests needed**: App installable on mobile devices
- **Done when**: PWA installable with proper icons

### STORY-027.2: Add offline mode for critical features
- **Status**: todo
- **Effort**: L
- **Description**: Cache critical pages/data for offline access (patient lookup, appointment view)
- **Files to touch**: src/service-worker.ts, src/lib/offline/
- **Tests needed**: Patient lookup works offline
- **Done when**: Critical features work offline

### STORY-027.3: Add push notifications (Web Push API)
- **Status**: todo
- **Effort**: M
- **Description**: Implement push notifications for appointments, reminders, and alerts
- **Files to touch**: src/services/notification/push.ts, src/service-worker.ts
- **Tests needed**: Push notifications received on mobile
- **Done when**: Push notifications functional

### STORY-027.4: Add camera integration for pet photos
- **Status**: todo
- **Effort**: S
- **Description**: Use native camera API for taking pet photos directly in the app
- **Files to touch**: src/components/camera/pet-photo.tsx
- **Tests needed**: Camera opens and photo saves to pet profile
- **Done when**: Camera integration working

### STORY-027.5: Add barcode scanner (native camera)
- **Status**: todo
- **Effort**: M
- **Description**: Implement barcode scanning for inventory/medication lookup
- **Files to touch**: src/components/scanner/barcode.tsx
- **Tests needed**: Barcode scans and looks up product
- **Done when**: Barcode scanner functional

### STORY-027.6: Add install prompt for mobile users
- **Status**: todo
- **Effort**: S
- **Description**: Show install prompt for mobile users who haven't installed the PWA
- **Files to touch**: src/components/pwa/install-prompt.tsx
- **Tests needed**: Install prompt shows on mobile
- **Done when**: Install prompt working

## Technical Notes
Next.js PWA support: use `next-pwa` package. Service worker needs careful caching strategy - use Network First for API calls, Cache First for static assets. Test on Android Chrome and iOS Safari.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
