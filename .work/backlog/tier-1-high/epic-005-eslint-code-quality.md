---
id: EPIC-005
title: "ESLint & Code Quality"
tier: 1
priority: P1
status: backlog
estimated_effort: L
dependencies: [EPIC-004]
created: 2026-04-07
updated: 2026-04-07
assignee: unassigned
---

# EPIC-005: ESLint & Code Quality

## Context
776+ lint warnings with max-warnings set to 9000 (effectively disabled). Code quality is degrading with unchecked console.log usage, any types, and missing dependency arrays.

## Acceptance Criteria
- [ ] console.log replaced with structured logger
- [ ] no-explicit-any warnings eliminated
- [ ] TypeScript warnings resolved
- [ ] react-hooks warnings fixed
- [ ] max-warnings reduced to 100
- [ ] Pre-commit hook fails on new warnings

## Stories

### STORY-005.1: Fix 126 console.log warnings → use logger
- **Status**: todo
- **Effort**: M
- **Description**: Create a structured logger utility and replace all console.log/warn/error calls
- **Files to touch**: src/lib/logger.ts, src/**/*.ts (126 files)
- **Tests needed**: grep -r 'console.log' src/ returns 0 results
- **Done when**: All console.log replaced with logger

### STORY-005.2: Fix 30 no-explicit-any warnings → proper types
- **Status**: todo
- **Effort**: M
- **Description**: Replace all `any` types with proper TypeScript types or `unknown`
- **Files to touch**: src/**/*.ts, src/**/*.tsx
- **Tests needed**: ESLint no-explicit-any rule passes
- **Done when**: No explicit any types remain

### STORY-005.3: Fix 200+ TypeScript warnings
- **Status**: todo
- **Effort**: L
- **Description**: Address TypeScript strict mode warnings including unused variables, implicit returns, etc.
- **Files to touch**: src/**/*.ts, src/**/*.tsx
- **Tests needed**: tsc --noEmit shows 0 warnings
- **Done when**: TypeScript compiles warning-free

### STORY-005.4: Fix 50+ react-hooks dependency warnings
- **Status**: todo
- **Effort**: M
- **Description**: Fix useEffect/useMemo/useCallback dependency arrays
- **Files to touch**: src/**/*.tsx, src/hooks/**/*.ts
- **Tests needed**: ESLint react-hooks/exhaustive-deps passes
- **Done when**: No react-hooks dependency warnings

### STORY-005.5: Reduce lint-staged max-warnings from 9000 to 100
- **Status**: todo
- **Effort**: S
- **Description**: Gradually reduce the max-warnings threshold
- **Files to touch**: .lintstagedrc, package.json
- **Tests needed**: Lint fails if warnings exceed 100
- **Done when**: max-warnings set to 100

### STORY-005.6: Fix 113 non-null assertions → proper null checks
- **Status**: todo
- **Effort**: M
- **Description**: Replace `!` non-null assertions with proper null checks, optional chaining, or type guards
- **Files to touch**: src/**/*.ts, src/**/*.tsx
- **Tests needed**: ESLint no-non-null-assertion passes
- **Done when**: No non-null assertions remain

### STORY-005.7: Enable strict ESLint rules incrementally
- **Status**: todo
- **Effort**: M
- **Description**: Enable stricter ESLint rules one at a time, fixing violations as you go
- **Files to touch**: .eslintrc.json, eslint.config.js
- **Tests needed**: Stricter rules enabled and passing
- **Done when**: At least 5 additional strict rules enabled

### STORY-005.8: Add pre-commit hook that fails on new warnings
- **Status**: todo
- **Effort**: S
- **Description**: Configure husky + lint-staged to prevent new lint warnings
- **Files to touch**: .husky/pre-commit, .lintstagedrc
- **Tests needed**: Committing a file with console.log fails
- **Done when**: Pre-commit hook catches new warnings

## Technical Notes
Create `src/lib/logger.ts` with log levels (debug, info, warn, error) that respects NODE_ENV. In production, only warn and error should output. Use `eslint --fix` for auto-fixable issues first.

## Progress Log
| Date | Author | Action | Notes |
|------|--------|--------|-------|
