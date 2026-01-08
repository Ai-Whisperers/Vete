# REF-005: Server Action Auth Migration

## Priority: P2 - Medium
## Category: Refactoring
## Status: Not Started
## Epic: [EPIC-06: Code Quality & Refactoring](../epics/EPIC-06-code-quality.md)
## Affected Areas: Server Actions, Authentication

## Description

Complete the migration of remaining server actions to use the centralized `withActionAuth` wrapper, reducing boilerplate and improving consistency.

## Source

Derived from `documentation/history/SERVER_ACTION_REFACTORING_SUMMARY.md` - "Remaining Work" section

## Context

> A centralized authentication wrapper system (`withActionAuth`) was created and successfully migrated to 3 action files. The remaining 18+ action files still use the old manual auth pattern.

## Current State

### Already Migrated (3 files)
- `web/app/actions/pets.ts` - 12.5% reduction
- `web/app/actions/appointments.ts` - 17.2% reduction
- `web/app/actions/update-profile.ts` - 11.3% reduction

### Files to Migrate (18 files)

**High Priority (largest files, most impact):**
1. `web/app/actions/invoices.ts` (994 lines) - Highest ROI
2. `web/app/actions/medical-records.ts`
3. `web/app/actions/safety.ts`

**Medium Priority:**
4. `web/app/actions/create-appointment.ts`
5. `web/app/actions/update-appointment.ts`
6. `web/app/actions/create-pet.ts`
7. `web/app/actions/create-vaccine.ts`
8. `web/app/actions/create-medical-record.ts`

**Lower Priority:**
9. `web/app/actions/whatsapp.ts`
10. `web/app/actions/schedules.ts`
11. `web/app/actions/time-off.ts`
12. `web/app/actions/network-actions.ts`
13. `web/app/actions/assign-tag.ts`
14. `web/app/actions/invite-staff.ts`
15. `web/app/actions/invite-client.ts`
16. `web/app/actions/create-product.ts`
17. `web/app/actions/update-product.ts`
18. `web/app/actions/delete-product.ts`

## The Pattern

### Before (Manual Auth)
```typescript
export async function someAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Acceso denegado' }
  }

  // Business logic...
}
```

### After (withActionAuth)
```typescript
export const someAction = withActionAuth(
  async ({ user, profile, isStaff, supabase }, formData: FormData) => {
    // Business logic only - auth handled by wrapper
  },
  { requireStaff: true }
)
```

## Benefits

- **~15% code reduction** per file
- **Consistent auth patterns** across all actions
- **Centralized security** - single point of review
- **Better type safety** - context is strongly typed
- **Easier testing** - can mock context

## Implementation Steps

1. [ ] Migrate `invoices.ts` (highest impact)
2. [ ] Migrate `medical-records.ts`
3. [ ] Migrate `safety.ts`
4. [ ] Migrate appointment-related actions (4 files)
5. [ ] Migrate pet/vaccine actions (3 files)
6. [ ] Migrate remaining actions (8 files)
7. [ ] Update any tests that mock auth
8. [ ] Consider making `withActionAuth` mandatory for new actions

## Migration Checklist Per File

For each file:
- [ ] Read the file to understand current patterns
- [ ] Identify which actions require staff/admin permissions
- [ ] Migrate using patterns from `lib/actions/MIGRATION_GUIDE.md`
- [ ] Test authentication (reject unauthenticated)
- [ ] Test authorization (staff-only, admin-only)
- [ ] Test business logic unchanged
- [ ] Verify path revalidation still works
- [ ] Verify redirects still work (if applicable)

## Acceptance Criteria

- [ ] All 18 action files migrated to `withActionAuth`
- [ ] No regressions in functionality
- [ ] All error messages remain in Spanish
- [ ] All tests pass
- [ ] Code reduction of ~15% average

## Related Files

- `web/lib/actions/with-action-auth.ts` - The wrapper
- `web/lib/actions/result.ts` - Result helpers
- `web/lib/actions/MIGRATION_GUIDE.md` - Migration guide
- `documentation/history/SERVER_ACTION_REFACTORING_SUMMARY.md` - Original summary

## Estimated Effort

Per file:
- Simple files (< 100 lines): 15 minutes
- Medium files (100-300 lines): 30 minutes
- Large files (300+ lines): 45-60 minutes

Total estimate:
- High priority (3 files): 3 hours
- Medium priority (5 files): 2.5 hours
- Lower priority (10 files): 2.5 hours
- Testing: 2 hours
- **Total: 10 hours (1.5 days)**

---
*Created: January 2026*
*Derived from SERVER_ACTION_REFACTORING_SUMMARY.md*
