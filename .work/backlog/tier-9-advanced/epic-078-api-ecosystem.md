---
id: EPIC-078
title: "API Ecosystem"
tier: 9
priority: P9
status: backlog
estimated_effort: L
dependencies: [EPIC-041]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-078: API Ecosystem

## Context
A public API with OAuth2, documentation portal, rate limiting, usage analytics, and SDK generation enables third-party developers to build on the platform.

## Acceptance Criteria
- [ ] Public API with OAuth2
- [ ] API documentation portal
- [ ] Rate limiting per API key
- [ ] API usage analytics
- [ ] SDK generation (TypeScript, Python)

## Stories

### STORY-078.1: Add public API with OAuth2 authentication
- **Status**: todo
- **Effort**: L
- **Description**: Implement OAuth2 authorization server for third-party access
- **Files to touch**: src/services/auth/oauth2.ts, src/app/api/oauth/
- **Tests needed**: Third parties authenticate via OAuth2
- **Done when**: OAuth2 authentication working

### STORY-078.2: Add API documentation portal
- **Status**: todo
- **Effort**: M
- **Description**: Create hosted API documentation site
- **Files to touch**: src/app/(public)/developers/, docs/api/
- **Tests needed**: API docs accessible at developers.paragu-ai.com
- **Done when**: API documentation portal live

### STORY-078.3: Add rate limiting per API key
- **Status**: todo
- **Effort**: M
- **Description**: Implement per-key rate limiting with configurable quotas
- **Files to touch**: src/middleware.ts, src/services/auth/api-keys.ts
- **Tests needed**: Rate limits enforced per API key
- **Done when**: Per-key rate limiting working

### STORY-078.4: Add API usage analytics
- **Status**: todo
- **Effort**: M
- **Description**: Track API usage by key, endpoint, and time period
- **Files to touch**: src/services/analytics/api-usage.ts
- **Tests needed**: API usage visible in dashboard
- **Done when**: API usage analytics working

### STORY-078.5: Add SDK generation (TypeScript, Python)
- **Status**: todo
- **Effort**: M
- **Description**: Auto-generate client SDKs from OpenAPI specification
- **Files to touch**: scripts/generate-sdks.sh, sdk/
- **Tests needed**: SDKs generated and published
- **Done when**: TypeScript and Python SDKs available

## Technical Notes
OAuth2 flow: Authorization Code for web apps, Client Credentials for server-to-server. Use openapi-generator for SDK generation. Rate limiting: default 1000 req/hour for free tier.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
