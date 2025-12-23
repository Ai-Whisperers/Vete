# Plan: Code Cleanup

## Phase 1: Appointment Service

- [ ] **Task 1**: Create `web/lib/services/appointment-service.ts`.
- [ ] **Task 2**: Move `validateAppointment` and `createAppointment` logic there.
- [ ] **Task 3**: Refactor `web/app/actions/create-appointment.ts` to import service.
- [ ] **Task 4**: Refactor `web/app/api/booking/route.ts` to import service.

## Phase 2: Deprecate Legacy DB Script

- [ ] **Task 1**: Verify `supabase/migrations` is up to date (`supabase db diff` check).
- [ ] **Task 2**: Delete `web/db/setup-db.mjs` (or move to `archive/`).
- [ ] **Task 3**: Update `package.json` scripts to strictly use `supabase` commands.
