---
id: EPIC-046
title: "DevOps & Infrastructure"
tier: 5
priority: P5
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-046: DevOps & Infrastructure

## Context
Need staging environment, blue-green deployments, load testing, and infrastructure-as-code for reliable and safe deployments.

## Acceptance Criteria
- [ ] Staging environment on VPS
- [ ] Blue-green deployment support
- [ ] Canary deployment capability
- [ ] Infrastructure-as-code versioned
- [ ] Load testing pipeline
- [ ] Chaos engineering tests

## Stories

### STORY-046.1: Set up staging environment on VPS
- **Status**: todo
- **Effort**: M
- **Description**: Create staging Docker service on VPS with separate database
- **Files to touch**: docker-compose.staging.yml, .env.staging
- **Tests needed**: Staging environment accessible at staging.paragu-ai.com
- **Done when**: Staging environment running

### STORY-046.2: Add blue-green deployment support
- **Status**: todo
- **Effort**: M
- **Description**: Implement blue-green deployment with instant rollback
- **Files to touch**: scripts/deploy-blue-green.sh, docker-compose.yml
- **Tests needed**: Zero-downtime deployments with rollback
- **Done when**: Blue-green deployments working

### STORY-046.3: Add canary deployment for risky changes
- **Status**: todo
- **Effort**: M
- **Description**: Implement canary deployment routing percentage of traffic
- **Files to touch**: scripts/deploy-canary.sh, nginx/traefik config
- **Tests needed**: Canary serves percentage of traffic
- **Done when**: Canary deployment functional

### STORY-046.4: Add infrastructure-as-code (Docker Compose versioned)
- **Status**: todo
- **Effort**: M
- **Description**: Version all infrastructure configuration in git
- **Files to touch**: docker-compose.yml, docker-compose.prod.yml, infrastructure/
- **Tests needed**: All infra changes tracked in git
- **Done when**: IaC versioned and documented

### STORY-046.5: Add load testing pipeline (k6)
- **Status**: todo
- **Effort**: M
- **Description**: Create k6 load tests for critical paths
- **Files to touch**: tests/load/, scripts/load-test.sh
- **Tests needed**: Load tests run and report results
- **Done when**: Load testing pipeline working

### STORY-046.6: Add chaos engineering tests
- **Status**: todo
- **Effort**: L
- **Description**: Implement chaos tests (kill containers, network partitions)
- **Files to touch**: tests/chaos/, scripts/chaos-test.sh
- **Tests needed**: System recovers from induced failures
- **Done when**: Chaos tests passing

## Technical Notes
The VPS runs Docker Swarm. For staging, use a separate Docker stack with different ports. k6 is ideal for load testing - install with `snap install k6`. Blue-green can use Docker Swarm's rolling update.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
