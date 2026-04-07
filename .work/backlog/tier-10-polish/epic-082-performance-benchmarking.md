---
id: EPIC-082
title: "Performance Benchmarking"
tier: 10
priority: P10
status: backlog
estimated_effort: M
dependencies: [EPIC-010]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-082: Performance Benchmarking

## Context
Ongoing performance monitoring ensures the app stays fast. Lighthouse CI, Core Web Vitals, database query performance, and load testing benchmarks.

## Acceptance Criteria
- [ ] Lighthouse CI scores tracked
- [ ] Core Web Vitals monitored
- [ ] Database query performance dashboard
- [ ] API response time tracking
- [ ] Load testing benchmarks

## Stories

### STORY-082.1: Add Lighthouse CI scores tracking
- **Status**: todo
- **Effort**: M
- **Description**: Run Lighthouse in CI and track scores over time
- **Files to touch**: .github/workflows/lighthouse.yml
- **Tests needed**: Lighthouse scores tracked per commit
- **Done when**: Lighthouse CI tracking working

### STORY-082.2: Add Core Web Vitals monitoring
- **Status**: todo
- **Effort**: M
- **Description**: Monitor CWV (LCP, FID, CLS) in production
- **Files to touch**: src/lib/web-vitals.ts
- **Tests needed**: Web Vitals reported and monitored
- **Done when**: Core Web Vitals monitored

### STORY-082.3: Add database query performance dashboard
- **Status**: todo
- **Effort**: M
- **Description**: Track slow queries and optimize based on data
- **Files to touch**: src/services/monitoring/db-perf.ts
- **Tests needed**: Slow queries identified and tracked
- **Done when**: DB performance dashboard working

### STORY-082.4: Add API response time tracking (p50, p95, p99)
- **Status**: todo
- **Effort**: M
- **Description**: Track API response time percentiles
- **Files to touch**: src/middleware.ts, src/services/monitoring/
- **Tests needed**: Response times tracked by percentile
- **Done when**: API timing tracked

### STORY-082.5: Add load testing benchmarks (k6)
- **Status**: todo
- **Effort**: M
- **Description**: Create k6 load tests and establish performance baselines
- **Files to touch**: tests/load/, k6 config
- **Tests needed**: Load test results establish baselines
- **Done when**: Load testing benchmarks set

## Technical Notes
Lighthouse CI can use lhci. Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1. Use pg_stat_statements for query performance tracking. k6 should test: login, patient search, appointment booking.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
