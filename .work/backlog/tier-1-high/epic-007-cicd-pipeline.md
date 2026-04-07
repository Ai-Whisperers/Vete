---
id: EPIC-007
title: "CI/CD Pipeline"
tier: 1
priority: P1
status: backlog
estimated_effort: L
dependencies: [EPIC-003, EPIC-005]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-007: CI/CD Pipeline

## Context
No proper CI gate exists. Builds require 8GB heap. There's no automated deployment pipeline or quality gates to prevent regressions.

## Acceptance Criteria
- [ ] GitHub Actions PR checks working
- [ ] Test coverage gate at 60%
- [ ] Lint gate at 200 warnings max
- [ ] Build memory optimized
- [ ] Docker image size checked
- [ ] Auto-deploy to VPS on main push
- [ ] E2E tests in CI
- [ ] Security scanning in CI

## Stories

### STORY-007.1: Fix GitHub Actions workflow for PR checks
- **Status**: todo
- **Effort**: M
- **Description**: Create/fix CI workflow that runs on PRs: lint, type-check, test, build
- **Files to touch**: .github/workflows/ci.yml
- **Tests needed**: PR triggers CI and shows status check
- **Done when**: CI runs automatically on all PRs

### STORY-007.2: Add test coverage gate (fail if drops below 60%)
- **Status**: todo
- **Effort**: S
- **Description**: Add coverage threshold to Jest config and CI
- **Files to touch**: jest.config.ts, .github/workflows/ci.yml
- **Tests needed**: PR with low coverage fails CI
- **Done when**: Coverage gate enforced at 60%

### STORY-007.3: Add lint gate (fail if warnings exceed 200)
- **Status**: todo
- **Effort**: S
- **Description**: Add ESLint warning threshold to CI
- **Files to touch**: .github/workflows/ci.yml
- **Tests needed**: PR with 201+ warnings fails CI
- **Done when**: Lint gate enforced at 200 warnings

### STORY-007.4: Optimize build to reduce 8GB memory requirement
- **Status**: todo
- **Effort**: M
- **Description**: Investigate and fix the memory-heavy build - likely caused by too many routes or unoptimized imports
- **Files to touch**: next.config.ts, package.json
- **Tests needed**: Build succeeds with 4GB heap
- **Done when**: Build memory reduced to ≤4GB

### STORY-007.5: Add Docker image size check (fail if >2GB)
- **Status**: todo
- **Effort**: S
- **Description**: Add image size check to CI pipeline
- **Files to touch**: .github/workflows/ci.yml, Dockerfile
- **Tests needed**: CI fails if image exceeds 2GB
- **Done when**: Docker image size gate enforced

### STORY-007.6: Set up auto-deploy to VPS on main push
- **Status**: todo
- **Effort**: M
- **Description**: Create CD workflow that builds, pushes, and deploys Docker image to VPS on main merge
- **Files to touch**: .github/workflows/deploy.yml
- **Tests needed**: Push to main triggers automatic deployment
- **Done when**: Auto-deploy working on main push

### STORY-007.7: Add Playwright E2E tests to CI
- **Status**: todo
- **Effort**: M
- **Description**: Configure Playwright to run in CI with proper browser setup
- **Files to touch**: .github/workflows/ci.yml, playwright.config.ts
- **Tests needed**: E2E tests run and report in CI
- **Done when**: Playwright tests execute in CI

### STORY-007.8: Add security scanning (npm audit, Snyk)
- **Status**: todo
- **Effort**: S
- **Description**: Add security scanning step to CI pipeline
- **Files to touch**: .github/workflows/security.yml
- **Tests needed**: CI reports known vulnerabilities
- **Done when**: Security scanning runs on every PR

## Technical Notes
For the 8GB memory issue, try: `NODE_OPTIONS='--max-old-space-size=4096'`. Check if `experimental.typedRoutes` or route groups are causing excessive memory. Consider splitting the build.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
