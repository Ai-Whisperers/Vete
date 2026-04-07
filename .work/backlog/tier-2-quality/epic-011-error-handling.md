---
id: EPIC-011
title: "Error Handling & Monitoring"
tier: 2
priority: P2
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-011: Error Handling & Monitoring

## Context
Sentry is configured but error boundaries are incomplete. Users see raw error pages and errors may go unnoticed in production.

## Acceptance Criteria
- [ ] Error boundaries on all page routes
- [ ] Sentry breadcrumbs for user actions
- [ ] Custom error pages (404, 500, 503)
- [ ] Health check dashboard
- [ ] Error rate alerts configured
- [ ] Structured logging in API routes

## Stories

### STORY-011.1: Add error boundaries to all page routes
- **Status**: todo
- **Effort**: M
- **Description**: Create error.tsx files for all route groups with proper error UI
- **Files to touch**: src/app/**/error.tsx, src/components/error-boundary.tsx
- **Tests needed**: Errors show friendly UI instead of white screen
- **Done when**: All route groups have error boundaries

### STORY-011.2: Add Sentry breadcrumbs for user actions
- **Status**: todo
- **Effort**: S
- **Description**: Add Sentry breadcrumbs for navigation, form submissions, and API calls
- **Files to touch**: src/lib/sentry/, src/hooks/use-tracking.ts
- **Tests needed**: Sentry shows user action trail before errors
- **Done when**: Breadcrumbs visible in Sentry error details

### STORY-011.3: Create custom error pages (404, 500, 503)
- **Status**: todo
- **Effort**: S
- **Description**: Design and implement branded error pages
- **Files to touch**: src/app/not-found.tsx, src/app/error.tsx, src/app/global-error.tsx
- **Tests needed**: Error pages render with branding
- **Done when**: Custom 404, 500, 503 pages exist

### STORY-011.4: Add health check dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Create internal dashboard showing system health: DB, Supabase, external services
- **Files to touch**: src/app/api/health/route.ts, src/app/(admin)/health/page.tsx
- **Tests needed**: Health endpoint returns service statuses
- **Done when**: Health check dashboard accessible to admins

### STORY-011.5: Set up alerts for error rate spikes
- **Status**: todo
- **Effort**: S
- **Description**: Configure Sentry alerts for error rate thresholds
- **Files to touch**: Sentry dashboard configuration
- **Tests needed**: Alert fires when error rate exceeds threshold
- **Done when**: Error rate alerts configured and tested

### STORY-011.6: Add structured logging to all API routes
- **Status**: todo
- **Effort**: M
- **Description**: Implement structured JSON logging with request ID, timing, and context
- **Files to touch**: src/lib/logger.ts, src/app/api/**/*.ts
- **Tests needed**: Logs are structured JSON with context
- **Done when**: All API routes use structured logging

## Technical Notes
Use Next.js 15's built-in error handling: `error.tsx` for route errors, `not-found.tsx` for 404s, `global-error.tsx` for root errors. Sentry's Next.js SDK handles most integration automatically.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
