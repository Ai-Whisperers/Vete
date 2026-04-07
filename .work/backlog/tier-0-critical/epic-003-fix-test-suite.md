---
id: EPIC-003
title: "Fix Test Suite"
tier: 0
priority: P0
status: backlog
estimated_effort: XL
dependencies: [EPIC-001]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-003: Fix Test Suite

## Context
758 tests failing across component and integration suites. 249 component tests and 509 integration tests are broken, making it impossible to verify changes safely.

## Acceptance Criteria
- [ ] All 249 component tests passing
- [ ] Integration test infrastructure set up
- [ ] Next.js cookies() scope errors fixed
- [ ] Supabase mock builder working
- [ ] Schema drift resolved
- [ ] All test.skip() removed and tests fixed
- [ ] 80% line coverage on critical services
- [ ] CI blocks merge on test failure

## Stories

### STORY-003.1: Fix 249 failing component tests
- **Status**: todo
- **Effort**: L
- **Description**: Fix mock issues causing component test failures - likely Supabase client mocks, Next.js navigation mocks, or missing providers
- **Files to touch**: src/**/*.test.tsx, src/test-utils/
- **Tests needed**: All component tests pass: npm run test:components
- **Done when**: 0 failing component tests

### STORY-003.2: Set up test Supabase project
- **Status**: todo
- **Effort**: M
- **Description**: Create dedicated Supabase project for integration tests with test data seeding
- **Files to touch**: supabase/config.toml, tests/setup.ts, .env.test
- **Tests needed**: Integration tests can connect to test DB
- **Done when**: Test Supabase project exists and is seeded

### STORY-003.3: Fix Next.js cookies() scope errors
- **Status**: todo
- **Effort**: M
- **Description**: Fix 'cookies was called outside a request scope' errors in API route tests by properly mocking Next.js headers/cookies
- **Files to touch**: src/app/api/**/*.test.ts, src/test-utils/next-mocks.ts
- **Tests needed**: API route tests pass without scope errors
- **Done when**: No cookies() scope errors in test output

### STORY-003.4: Fix Supabase mock chainable query builder
- **Status**: todo
- **Effort**: M
- **Description**: Fix the mock that simulates Supabase's chainable API (.from().select().eq().single())
- **Files to touch**: src/test-utils/supabase-mock.ts
- **Tests needed**: Mock supports all common chain patterns
- **Done when**: Chainable mock works for select, insert, update, delete

### STORY-003.5: Fix schema drift (microchip_id vs microchip_number)
- **Status**: todo
- **Effort**: S
- **Description**: Resolve column name inconsistency between code and database schema
- **Files to touch**: src/types/database.ts, supabase/migrations/
- **Tests needed**: No schema drift errors in tests
- **Done when**: Code and DB schema use consistent column names

### STORY-003.6: Remove all test.skip() and fix underlying issues
- **Status**: todo
- **Effort**: M
- **Description**: Find all 16 test.skip() calls, understand why they were skipped, and fix the underlying issues
- **Files to touch**: src/**/*.test.ts, src/**/*.test.tsx
- **Tests needed**: grep -r 'test.skip' returns 0 results
- **Done when**: No skipped tests remain

### STORY-003.7: Achieve 80% line coverage on critical services
- **Status**: todo
- **Effort**: L
- **Description**: Write additional tests to reach 80% coverage on auth, patient, appointment, and billing services
- **Files to touch**: src/services/**/*.test.ts
- **Tests needed**: Coverage report shows ≥80% on critical services
- **Done when**: Critical services at 80%+ line coverage

### STORY-003.8: Add CI gate that blocks merge on test failure
- **Status**: todo
- **Effort**: S
- **Description**: Configure GitHub Actions to require passing tests before merge
- **Files to touch**: .github/workflows/test.yml, branch protection rules
- **Tests needed**: PR with failing test cannot be merged
- **Done when**: CI gate blocks merge on test failure

## Technical Notes
Start by running `npm test -- --verbose 2>&1 | head -100` to understand the failure patterns. Most failures are likely mock-related. Fix the test utilities first, then the individual tests will cascade into passing.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
