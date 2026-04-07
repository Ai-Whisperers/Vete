---
id: EPIC-043
title: "Multi-Region & Scaling"
tier: 5
priority: P5
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-043: Multi-Region & Scaling

## Context
Currently single-server deployment. As the platform grows, need to scale horizontally and add read replicas for performance.

## Acceptance Criteria
- [ ] Read replicas for Supabase
- [ ] CDN edge caching
- [ ] Horizontal scaling documented
- [ ] Database connection pooling
- [ ] Queue system for heavy operations

## Stories

### STORY-043.1: Add read replicas for Supabase
- **Status**: todo
- **Effort**: M
- **Description**: Configure Supabase read replicas for query distribution
- **Files to touch**: src/lib/supabase/, supabase config
- **Tests needed**: Read queries use replica, writes use primary
- **Done when**: Read replicas configured

### STORY-043.2: Add CDN edge caching for static content
- **Status**: todo
- **Effort**: M
- **Description**: Configure CDN (Cloudflare) for edge caching of static assets
- **Files to touch**: next.config.ts, Cloudflare settings
- **Tests needed**: Static content served from edge
- **Done when**: CDN caching active

### STORY-043.3: Add horizontal scaling documentation
- **Status**: todo
- **Effort**: M
- **Description**: Document how to scale the application horizontally
- **Files to touch**: docs/ops/scaling.md
- **Tests needed**: Scaling guide covers all components
- **Done when**: Scaling documentation complete

### STORY-043.4: Add database connection pooling (PgBouncer)
- **Status**: todo
- **Effort**: M
- **Description**: Set up PgBouncer for connection pooling
- **Files to touch**: docker-compose.yml, src/lib/supabase/
- **Tests needed**: Connections pooled through PgBouncer
- **Done when**: Connection pooling active

### STORY-043.5: Add queue system for heavy operations (Inngest)
- **Status**: todo
- **Effort**: L
- **Description**: Implement job queue for background processing (reports, imports, notifications)
- **Files to touch**: src/services/queue/, src/app/api/inngest/
- **Tests needed**: Heavy operations processed asynchronously
- **Done when**: Queue system functional

## Technical Notes
Supabase Pro plan includes read replicas. PgBouncer is built into Supabase. For queuing, Inngest is a good fit with Next.js. Consider BullMQ as an alternative if running own Redis.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
