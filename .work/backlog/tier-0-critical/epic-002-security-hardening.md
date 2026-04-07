---
id: EPIC-002
title: "Security Hardening"
tier: 0
priority: P0
status: backlog
estimated_effort: L
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-002: Security Hardening

## Context
SERVICE_ROLE_KEY is exposed in committed .env.production. Setup/debug API endpoints are accessible in production. This is a critical security vulnerability.

## Acceptance Criteria
- [ ] .env.production removed from git history
- [ ] All Supabase keys rotated
- [ ] Debug/setup endpoints disabled in production
- [ ] Auth checks on all API routes
- [ ] Security headers (CSP, HSTS, etc.) configured
- [ ] Rate limiting functional
- [ ] Secrets scanning in CI

## Stories

### STORY-002.1: Remove .env.production from git history
- **Status**: todo
- **Effort**: M
- **Description**: Use git filter-branch or BFG to purge .env.production from all git history
- **Files to touch**: .env.production, .gitignore
- **Tests needed**: Verify file is gone from all commits: git log --all --full-history -- .env.production
- **Done when**: .env.production not found in any git commit

### STORY-002.2: Rotate all Supabase keys
- **Status**: todo
- **Effort**: S
- **Description**: Generate new anon key, service role key, and JWT secret in Supabase dashboard. Update all deployment configs.
- **Files to touch**: .env, .env.local, Docker secrets, VPS env
- **Tests needed**: Old keys return 401
- **Done when**: All old keys invalidated, new keys deployed

### STORY-002.3: Disable /api/setup and /api/setup/seed in production
- **Status**: todo
- **Effort**: S
- **Description**: Add environment guard to prevent these endpoints from running in production
- **Files to touch**: src/app/api/setup/route.ts, src/app/api/setup/seed/route.ts
- **Tests needed**: curl returns 404 in production
- **Done when**: Setup endpoints return 404 in production

### STORY-002.4: Disable /api/debug-network in production
- **Status**: todo
- **Effort**: S
- **Description**: Add environment guard or remove debug endpoint entirely
- **Files to touch**: src/app/api/debug-network/route.ts
- **Tests needed**: curl returns 404 in production
- **Done when**: Debug endpoint not accessible in production

### STORY-002.5: Add environment-based guards for dangerous endpoints
- **Status**: todo
- **Effort**: M
- **Description**: Create middleware or wrapper that blocks dangerous routes when NODE_ENV=production
- **Files to touch**: src/middleware.ts, src/lib/guards.ts
- **Tests needed**: All dangerous endpoints blocked in prod
- **Done when**: No debug/setup endpoints accessible in production

### STORY-002.6: Audit all API routes for missing auth checks
- **Status**: todo
- **Effort**: L
- **Description**: Review all 311 API routes and ensure they have proper authentication
- **Files to touch**: src/app/api/**/*.ts
- **Tests needed**: Audit report generated
- **Done when**: All API routes have auth checks or are explicitly public

### STORY-002.7: Add CSP headers and security response headers
- **Status**: todo
- **Effort**: M
- **Description**: Configure Content-Security-Policy, X-Frame-Options, HSTS, etc.
- **Files to touch**: next.config.ts, src/middleware.ts
- **Tests needed**: Security headers scanner passes
- **Done when**: All recommended security headers present

### STORY-002.8: Enable rate limiting with in-memory fallback
- **Status**: todo
- **Effort**: M
- **Description**: Implement rate limiting that works without Upstash Redis using in-memory store
- **Files to touch**: src/middleware.ts, src/lib/rate-limit.ts
- **Tests needed**: Rate limit test: 100 requests in 1s triggers 429
- **Done when**: Rate limiting active in production

### STORY-002.9: Add secrets scanning to CI pipeline
- **Status**: todo
- **Effort**: S
- **Description**: Add gitleaks or truffleHog to GitHub Actions
- **Files to touch**: .github/workflows/security.yml
- **Tests needed**: CI catches test secret in PR
- **Done when**: Secrets scanning runs on every PR

### STORY-002.10: Create secrets management documentation
- **Status**: todo
- **Effort**: S
- **Description**: Document where all secrets are stored, how to rotate them, and emergency procedures
- **Files to touch**: docs/security/secrets-management.md
- **Tests needed**: Doc exists and is accurate
- **Done when**: Secrets management doc covers all secrets

## Technical Notes
URGENT: The exposed SERVICE_ROLE_KEY gives full database access. Rotate keys BEFORE doing anything else. Use `git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.production' HEAD` to purge history.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
