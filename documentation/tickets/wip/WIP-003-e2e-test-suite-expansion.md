# WIP-003: E2E Test Suite Expansion

## Priority: P2 (Medium)
## Category: Work In Progress
## Status: In Development (Uncommitted)

## Description
Significant expansion of E2E test coverage with new portal test files and testing infrastructure.

## Current State
Modified files:
- `e2e/portal/pets.spec.ts` - Pet portal tests expanded (+489 lines)
- `playwright.config.ts` - Config updates (+118 lines)

## Untracked New Test Files (21 files)
```
e2e/auth.setup.ts
e2e/global-setup.ts
e2e/global-teardown.ts
e2e/factories/
e2e/helpers/
e2e/portal/appointments.spec.ts
e2e/portal/auth.spec.ts
e2e/portal/data-persistence.spec.ts
e2e/portal/invoices.spec.ts
e2e/portal/loyalty.spec.ts
e2e/portal/medical-records.spec.ts
e2e/portal/messaging.spec.ts
e2e/portal/notifications.spec.ts
e2e/portal/profile.spec.ts
e2e/portal/store.spec.ts
e2e/portal/vaccines.spec.ts
e2e/portal/wishlist.spec.ts
e2e/visual/
```

## What's Missing
1. [ ] Complete all new spec files
2. [ ] Verify global setup/teardown works correctly
3. [ ] Validate test factories generate proper data
4. [ ] Run full test suite and fix failures
5. [ ] Verify CI integration

## Implementation Steps
1. Review and finalize `playwright.config.ts` changes
2. Test global setup and teardown scripts
3. Verify factory helpers create valid test data
4. Run each new spec file individually
5. Fix any failing tests
6. Run full suite to ensure no conflicts
7. Commit with descriptive message

## Acceptance Criteria
- [ ] All 12 new portal specs pass
- [ ] Auth setup correctly creates test users
- [ ] Global setup/teardown properly manages test state
- [ ] Visual regression tests capture baseline screenshots
- [ ] Tests can run in CI environment
- [ ] Test data is properly isolated and cleaned up

## Related Files
- `web/e2e/*.spec.ts`
- `web/e2e/factories/`
- `web/e2e/helpers/`
- `web/playwright.config.ts`

## Estimated Effort
- Completion: 6-8 hours
- CI Integration: 2 hours

---
*Ticket created: January 2026*
*Based on git status analysis*
