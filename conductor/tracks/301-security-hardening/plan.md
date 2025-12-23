# Plan: Security Hardening

## Phase 1: Rate Limiting Implementation

- [ ] **Task 1**: Review `lib/rate-limit.ts` and ensure it works with current infrastructure (Memory/Redis).
- [ ] **Task 2**: Apply `rateLimit()` check to `web/app/api/auth/route.ts` (or equivalent auth endpoints).
- [ ] **Task 3**: Apply `rateLimit()` check to `web/app/api/booking/route.ts` (Search).
- [ ] **Task 4**: Verify 429 responses using a test script or `curl`.

## Phase 2: Endpoint Audit

- [ ] **Task 1**: Check `api/medical-records/diagnosis/route.ts` for auth checks.
- [ ] **Task 2**: Check `api/services/route.ts` for auth checks.
- [ ] **Task 3**: Add `withAuth` wrapper if missing.
