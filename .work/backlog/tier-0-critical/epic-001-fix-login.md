---
id: EPIC-001
title: "Fix Login & Authentication"
tier: 0
priority: P0
status: backlog
estimated_effort: M
dependencies: [none]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-001: Fix Login & Authentication

## Context
Portal login returns 500 - users cannot access the platform. This is the #1 showstopper blocking all user-facing functionality.

## Acceptance Criteria
- [ ] Login page loads without 500 error
- [ ] Users can sign in with email/password
- [ ] Auth callback chain works (Supabase → Next.js middleware → redirect)
- [ ] OAuth providers work if configured
- [ ] E2E tests pass for login, signup, and password reset flows

## Stories

### STORY-001.1: Debug /terrapet/portal/login 500 error
- **Status**: todo
- **Effort**: S
- **Description**: Check server logs, identify the root cause of the 500 error on the login page
- **Files to touch**: src/app/terrapet/portal/login/, src/middleware.ts
- **Tests needed**: Manual verification that login page loads
- **Done when**: Login page returns 200 and renders the login form

### STORY-001.2: Fix auth callback chain
- **Status**: todo
- **Effort**: M
- **Description**: Fix the Supabase → Next.js middleware → redirect flow so authentication completes properly
- **Files to touch**: src/middleware.ts, src/app/auth/callback/, src/lib/supabase/
- **Tests needed**: Test auth flow end-to-end
- **Done when**: User can log in and is redirected to dashboard

### STORY-001.3: Add E2E test for login flow
- **Status**: todo
- **Effort**: S
- **Description**: Write Playwright test covering email/password login
- **Files to touch**: tests/e2e/auth/login.spec.ts
- **Tests needed**: Playwright test passes in CI
- **Done when**: Login E2E test exists and passes

### STORY-001.4: Add E2E test for signup flow
- **Status**: todo
- **Effort**: S
- **Description**: Write Playwright test covering new user registration
- **Files to touch**: tests/e2e/auth/signup.spec.ts
- **Tests needed**: Playwright test passes in CI
- **Done when**: Signup E2E test exists and passes

### STORY-001.5: Add E2E test for password reset flow
- **Status**: todo
- **Effort**: S
- **Description**: Write Playwright test for forgot password → reset flow
- **Files to touch**: tests/e2e/auth/password-reset.spec.ts
- **Tests needed**: Playwright test passes in CI
- **Done when**: Password reset E2E test exists and passes

### STORY-001.6: Test OAuth providers
- **Status**: todo
- **Effort**: S
- **Description**: Verify Google and Facebook OAuth if configured, add tests
- **Files to touch**: src/app/auth/callback/, tests/e2e/auth/oauth.spec.ts
- **Tests needed**: OAuth login test passes
- **Done when**: OAuth providers tested and documented

## Technical Notes
This is the highest priority item. The login 500 error may be caused by middleware issues, missing env vars, or Supabase configuration. Check `next.config.ts` redirects and `middleware.ts` matchers first.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
