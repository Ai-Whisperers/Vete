---
id: EPIC-010
title: "Performance Optimization"
tier: 2
priority: P2
status: backlog
estimated_effort: L
dependencies: [EPIC-007]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-010: Performance Optimization

## Context
735 route files, 8GB build heap, slow cold starts. The app is heavy and needs optimization for the Paraguay market where bandwidth and device power may be limited.

## Acceptance Criteria
- [ ] ISR/SSG for public pages
- [ ] Route-level code splitting implemented
- [ ] Docker image optimized
- [ ] Caching strategy implemented
- [ ] N+1 queries eliminated
- [ ] CDN configured
- [ ] Lazy loading for heavy components

## Stories

### STORY-010.1: Implement ISR/SSG for public clinic pages
- **Status**: todo
- **Effort**: M
- **Description**: Add static generation with ISR for public-facing clinic profile pages
- **Files to touch**: src/app/(public)/**/*.tsx
- **Tests needed**: Public pages serve from cache with revalidation
- **Done when**: Public pages use ISR/SSG

### STORY-010.2: Add route-level code splitting
- **Status**: todo
- **Effort**: M
- **Description**: Implement dynamic imports and route-level code splitting to reduce bundle size
- **Files to touch**: src/app/**/*.tsx, next.config.ts
- **Tests needed**: Bundle analyzer shows split routes
- **Done when**: Route-level code splitting active

### STORY-010.3: Optimize Docker image size (currently ~1GB+)
- **Status**: todo
- **Effort**: M
- **Description**: Use multi-stage build, Alpine base, and dependency pruning
- **Files to touch**: Dockerfile, .dockerignore
- **Tests needed**: Docker image under 500MB
- **Done when**: Docker image size reduced by 50%+

### STORY-010.4: Add Redis caching for frequently accessed data
- **Status**: todo
- **Effort**: M
- **Description**: Implement caching layer for hot data (clinic settings, service catalogs)
- **Files to touch**: src/lib/cache.ts, src/services/
- **Tests needed**: Cache hit rate visible in logs
- **Done when**: Caching reduces DB queries by 50%+

### STORY-010.5: Implement database query optimization (N+1 queries)
- **Status**: todo
- **Effort**: M
- **Description**: Find and fix N+1 query patterns, add eager loading where appropriate
- **Files to touch**: src/services/*.ts, src/app/api/**/*.ts
- **Tests needed**: Query count per page load reduced
- **Done when**: No N+1 queries in critical paths

### STORY-010.6: Add CDN for static assets
- **Status**: todo
- **Effort**: S
- **Description**: Configure CDN (Cloudflare or similar) for static asset delivery
- **Files to touch**: next.config.ts, deployment config
- **Tests needed**: Static assets served from CDN
- **Done when**: CDN delivering static assets

### STORY-010.7: Implement lazy loading for heavy components
- **Status**: todo
- **Effort**: M
- **Description**: Add React.lazy and dynamic imports for heavy components (charts, editors, maps)
- **Files to touch**: src/components/**/*.tsx
- **Tests needed**: Heavy components load on demand
- **Done when**: Charts, editors, maps lazy-loaded

### STORY-010.8: Profile and optimize TypeScript compilation
- **Status**: todo
- **Effort**: M
- **Description**: Use tsc --diagnostics to find slow compilations, optimize tsconfig
- **Files to touch**: tsconfig.json, src/types/
- **Tests needed**: Build time reduced by 30%+
- **Done when**: TypeScript compilation optimized

## Technical Notes
Use `next build --debug` to identify the heaviest routes. Check `@next/bundle-analyzer` for bundle size insights. For Docker, use `node:20-alpine` as base and multi-stage builds.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
