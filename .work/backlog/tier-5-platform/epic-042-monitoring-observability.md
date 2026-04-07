---
id: EPIC-042
title: "Monitoring & Observability"
tier: 5
priority: P5
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-042: Monitoring & Observability

## Context
Need comprehensive monitoring: tracing, metrics, log aggregation, and real-user monitoring to maintain production quality.

## Acceptance Criteria
- [ ] LLM call tracing (Langfuse)
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Business KPI metrics
- [ ] Log aggregation
- [ ] Real-user monitoring
- [ ] Synthetic monitoring

## Stories

### STORY-042.1: Add Langfuse tracing for all LLM calls
- **Status**: todo
- **Effort**: M
- **Description**: Integrate Langfuse for tracing and monitoring LLM API calls
- **Files to touch**: src/services/ai/, src/lib/langfuse.ts
- **Tests needed**: LLM calls traced in Langfuse dashboard
- **Done when**: Langfuse tracing working

### STORY-042.2: Add distributed tracing (OpenTelemetry)
- **Status**: todo
- **Effort**: L
- **Description**: Implement OpenTelemetry for distributed request tracing
- **Files to touch**: src/lib/tracing.ts, next.config.ts
- **Tests needed**: Request traces visible across services
- **Done when**: OpenTelemetry tracing working

### STORY-042.3: Add custom metrics for business KPIs
- **Status**: todo
- **Effort**: M
- **Description**: Track business metrics: appointments/day, revenue, active users
- **Files to touch**: src/services/metrics/
- **Tests needed**: KPI metrics collected and queryable
- **Done when**: Business KPI metrics tracked

### STORY-042.4: Add log aggregation to VPS Loki
- **Status**: todo
- **Effort**: M
- **Description**: Ship structured logs to Loki for centralized log analysis
- **Files to touch**: src/lib/logger.ts, docker-compose.yml
- **Tests needed**: Logs searchable in Grafana/Loki
- **Done when**: Log aggregation working

### STORY-042.5: Add real-user monitoring (RUM)
- **Status**: todo
- **Effort**: M
- **Description**: Track real user performance: page loads, interactions, errors
- **Files to touch**: src/lib/rum.ts, src/app/layout.tsx
- **Tests needed**: RUM data visible in dashboard
- **Done when**: RUM collecting data

### STORY-042.6: Add synthetic monitoring for critical paths
- **Status**: todo
- **Effort**: S
- **Description**: Set up automated tests that run every 5 minutes on critical paths
- **Files to touch**: scripts/synthetic-monitoring/, cron configuration
- **Tests needed**: Synthetic tests run and alert on failure
- **Done when**: Synthetic monitoring active

## Technical Notes
Langfuse is open-source and can be self-hosted on the VPS. OpenTelemetry has official Next.js support via @vercel/otel. For Loki, use the existing VPS Docker Swarm to deploy.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
