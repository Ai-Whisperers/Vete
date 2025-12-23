# Track 400: Code Cleanup & Unification

## Goal

Reduce technical debt by unifying business logic conflicting between Server Actions and API Routes.

## Context

- **Split Personality**: `create-appointment.ts` (Action) and `api/booking` (API) duplicate logic.
- **Risk**: Fixing bugs in one implementation often leaves the other broken (e.g., missing overlap checks).

## Requirements

1.  **Service Layer**: Extract core logic into `web/lib/services/`.
    - `appointment-service.ts`: Handle creation, overlap checks, validation.
2.  **Refactor Consumers**:
    - Update `web/app/actions/create-appointment.ts` to call the service.
    - Update `web/app/api/booking/route.ts` to call the service.
3.  **Migration Tool**:
    - Remove `setup-db.mjs` if fully migrated to Supabase CLI.

## Acceptance Criteria

- [ ] Creating appointment via API or UI uses the _exact same_ validation code.
- [ ] `setup-db.mjs` is archived or deleted.
