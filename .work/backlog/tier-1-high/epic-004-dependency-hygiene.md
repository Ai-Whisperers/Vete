---
id: EPIC-004
title: "Dependency Hygiene"
tier: 1
priority: P1
status: backlog
estimated_effort: M
dependencies: [EPIC-003]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-004: Dependency Hygiene

## Context
12 dependabot PRs sitting unmerged for weeks. Security patches and framework updates are accumulating, increasing vulnerability exposure.

## Acceptance Criteria
- [ ] All safe dependabot PRs merged
- [ ] Major version bumps tested and merged or documented
- [ ] Auto-merge configured for patch updates
- [ ] Dependabot grouping strategy configured

## Stories

### STORY-004.1: Review and merge #63 (9 patch deps)
- **Status**: todo
- **Effort**: S
- **Description**: Review PR #63 which bundles 9 patch dependency updates, run tests, merge
- **Files to touch**: package.json, package-lock.json
- **Tests needed**: Tests pass after merge
- **Done when**: PR #63 merged

### STORY-004.2: Review and merge #44 (Next.js update)
- **Status**: todo
- **Effort**: M
- **Description**: Review Next.js version bump, test for breaking changes
- **Files to touch**: package.json, next.config.ts
- **Tests needed**: Build succeeds, E2E tests pass
- **Done when**: Next.js updated to latest

### STORY-004.3: Review and merge #49 (Sentry update)
- **Status**: todo
- **Effort**: S
- **Description**: Review Sentry SDK update, check for API changes
- **Files to touch**: package.json, src/lib/sentry/
- **Tests needed**: Sentry error reporting still works
- **Done when**: Sentry updated

### STORY-004.4: Review and merge #40, #23, #22 (CI action bumps)
- **Status**: todo
- **Effort**: S
- **Description**: Merge GitHub Actions version bumps for security
- **Files to touch**: .github/workflows/*.yml
- **Tests needed**: CI workflows still work
- **Done when**: All CI action bumps merged

### STORY-004.5: Review #50 (@types/node major bump)
- **Status**: todo
- **Effort**: M
- **Description**: Test @types/node major version bump carefully for type compatibility
- **Files to touch**: package.json, tsconfig.json
- **Tests needed**: TypeScript compilation succeeds
- **Done when**: @types/node updated or decision documented

### STORY-004.6: Review #45 (eslint-config-next 15→16)
- **Status**: todo
- **Effort**: M
- **Description**: Test ESLint config major version bump, fix new lint errors
- **Files to touch**: package.json, .eslintrc.json
- **Tests needed**: Lint passes with new config
- **Done when**: ESLint config updated or decision documented

### STORY-004.7: Review #60 (TanStack group update)
- **Status**: todo
- **Effort**: M
- **Description**: Review TanStack Query/Table update, check for breaking API changes
- **Files to touch**: package.json, src/**/use*.ts
- **Tests needed**: All TanStack-dependent features work
- **Done when**: TanStack packages updated

### STORY-004.8: Close or merge PR #59 (Invoices + i18n)
- **Status**: todo
- **Effort**: M
- **Description**: Review the invoices and i18n feature PR, either merge or close with explanation
- **Files to touch**: PR #59 files
- **Tests needed**: PR resolved
- **Done when**: PR #59 merged or closed with rationale

### STORY-004.9: Set up auto-merge for patch dependabot PRs
- **Status**: todo
- **Effort**: S
- **Description**: Configure GitHub to auto-merge patch-level dependabot PRs when CI passes
- **Files to touch**: .github/dependabot.yml, .github/workflows/auto-merge.yml
- **Tests needed**: Patch PR auto-merges after CI
- **Done when**: Auto-merge working for patch updates

### STORY-004.10: Configure Dependabot grouping strategy
- **Status**: todo
- **Effort**: S
- **Description**: Group related dependencies to reduce PR noise
- **Files to touch**: .github/dependabot.yml
- **Tests needed**: Dependabot creates grouped PRs
- **Done when**: Dependabot groups configured

## Technical Notes
Always run the full test suite after merging dependency updates. For major version bumps, create a branch and test thoroughly before merging to main.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
