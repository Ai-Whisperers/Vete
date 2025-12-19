# Server Action Migration Status

This document tracks the migration of server actions to use the `withActionAuth` wrapper for consistent authentication and authorization.

## Migration Pattern

### Before (Old Pattern)
```typescript
'use server'

export async function someAction(data: FormData) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { error: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!['vet', 'admin'].includes(profile.role)) {
    return { error: 'No autorizado' }
  }

  // Business logic...
}
```

### After (New Pattern)
```typescript
'use server'

import { withActionAuth, actionSuccess, actionError } from '@/lib/actions'

export const someAction = withActionAuth(
  async ({ profile, supabase, user, isStaff, isAdmin }, data: FormData) => {
    // Business logic - auth already handled

    // Use actionSuccess for successful responses
    return actionSuccess(result)

    // Use actionError for errors
    return actionError('Error message')
  },
  { requireStaff: true } // or { requireAdmin: true }
)
```

## Completed Migrations ✅

### 1. invoices.ts (10 functions)
**Status**: ✅ COMPLETED
**Functions migrated**:
- `createInvoice` - Staff only
- `updateInvoice` - Staff only
- `updateInvoiceStatus` - Staff only
- `sendInvoice` - Staff only
- `recordPayment` - Staff only
- `voidInvoice` - Staff only (admin required for paid invoices)
- `getClinicServices` - Staff only
- `getClinicPets` - Staff only
- `getInvoices` - Staff only
- `getInvoice` - Owners can view their own, staff can view all

**Changes**:
- Removed manual auth code from all functions
- Added `requireStaff: true` option where appropriate
- Using `actionSuccess()` and `actionError()` consistently
- Leveraged `isAdmin` context variable for void invoice logic

### 2. medical-records.ts (1 function)
**Status**: ✅ COMPLETED
**Functions migrated**:
- `createMedicalRecord` - Staff only

**Changes**:
- Removed manual auth and profile fetching
- Added `requireStaff: true`
- Simplified tenant verification (now automatic)

### 3. create-vaccine.ts (1 function)
**Status**: ✅ COMPLETED
**Functions migrated**:
- `createVaccine` - Owners and staff

**Changes**:
- Removed manual auth code
- Leveraged `isStaff` context variable
- Kept owner-specific logic for authorization
- Used `actionError()` with field errors for validation

### 4. safety.ts (1 function)
**Status**: ✅ COMPLETED
**Functions migrated**:
- `reportFoundPet` - Public (no auth required)

**Changes**:
- Did NOT use `withActionAuth` since this is a public endpoint
- Used `actionSuccess()` and `actionError()` for consistency

### 5. appointments.ts
**Status**: ✅ ALREADY MIGRATED
**Functions**:
- `cancelAppointment` - Already using `withActionAuth`
- `rescheduleAppointment` - Already using `withActionAuth`

### 6. pets.ts
**Status**: ✅ ALREADY MIGRATED
**Functions**:
- `updatePet` - Already using `withActionAuth`

## Pending Migrations 🔄

### High Priority

#### 1. create-pet.ts (1 function)
**Function**: `createPet`
**Current pattern**: Manual auth with detailed Zod validation
**Recommendation**: Migrate to `withActionAuth`, keep validation logic
**Auth requirement**: Any authenticated user can create pets

#### 2. create-appointment.ts (1 function)
**Function**: `createAppointment`
**Current pattern**: Manual auth with Zod validation
**Recommendation**: Migrate to `withActionAuth`
**Auth requirement**: Any authenticated user

#### 3. invite-staff.ts (1 function)
**Function**: `inviteStaff`
**Current pattern**: Manual auth with admin check
**Recommendation**: Migrate with `{ requireAdmin: true }`
**Auth requirement**: Admin only

#### 4. invite-client.ts
**Function**: `inviteClient`
**Current pattern**: Likely manual auth
**Recommendation**: Migrate with `{ requireStaff: true }`
**Auth requirement**: Staff only

### Medium Priority

#### 5. create-product.ts
**Function**: `createProduct`
**Recommendation**: Migrate with `{ requireStaff: true }` or `{ requireAdmin: true }`

#### 6. update-product.ts
**Function**: `updateProduct`
**Recommendation**: Migrate with `{ requireStaff: true }` or `{ requireAdmin: true }`

#### 7. delete-product.ts
**Function**: `deleteProduct`
**Recommendation**: Migrate with `{ requireAdmin: true }`

#### 8. assign-tag.ts
**Function**: `assignTag` (or similar)
**Recommendation**: Check auth requirements, likely staff only

#### 9. update-appointment.ts
**Function**: `updateAppointment`
**Recommendation**: Migrate with custom ownership logic

#### 10. schedules.ts
**Functions**: Staff schedule management
**Recommendation**: Migrate with `{ requireStaff: true }` or `{ requireAdmin: true }`

#### 11. time-off.ts
**Functions**: Time-off request management
**Recommendation**: Migrate with `{ requireStaff: true }`

#### 12. network-actions.ts
**Functions**: Unknown - needs review
**Recommendation**: Review and migrate accordingly

#### 13. send-email.ts
**Functions**: Email operations
**Recommendation**: Review - might need staff or public access

#### 14. whatsapp.ts
**Functions**: WhatsApp integration
**Recommendation**: Review auth requirements

#### 15. update-profile.ts
**Function**: `updateProfile`
**Recommendation**: Any authenticated user

## Migration Checklist

When migrating an action file, follow these steps:

### 1. Read the file
```bash
Read web/app/actions/filename.ts
```

### 2. Identify auth pattern
- Check if it manually calls `createClient()` and `auth.getUser()`
- Check if it manually fetches profile data
- Identify role requirements (any, staff, admin)

### 3. Update imports
```typescript
import { withActionAuth, actionSuccess, actionError } from '@/lib/actions'
// Remove: import { createClient } from '@/lib/supabase/server'
```

### 4. Wrap function with withActionAuth
```typescript
export const functionName = withActionAuth(
  async ({ user, profile, isStaff, isAdmin, supabase }, ...args) => {
    // Function body
  },
  { requireStaff: true } // or { requireAdmin: true }, or omit for any user
)
```

### 5. Remove manual auth code
- Remove `const supabase = await createClient()`
- Remove `const { data: { user } } = await supabase.auth.getUser()`
- Remove `const { data: profile } = await supabase.from('profiles')...`
- Remove manual role checks

### 6. Update return statements
```typescript
// Replace:
return { error: 'Message' }
// With:
return actionError('Message')

// Replace:
return { success: true, data: result }
// With:
return actionSuccess(result)

// For field errors:
return actionError('Main error', { fieldName: 'Field error' })
```

### 7. Leverage context variables
- `user.id` - Current user ID
- `user.email` - Current user email
- `profile.tenant_id` - User's clinic/tenant
- `profile.role` - User's role (owner, vet, admin)
- `profile.full_name` - User's full name
- `isStaff` - Boolean: is vet or admin
- `isAdmin` - Boolean: is admin
- `supabase` - Authenticated Supabase client

### 8. Test the migrated action
- Verify authentication works
- Test role-based access control
- Verify tenant isolation
- Test error cases
- Verify success cases

## Testing

After migration, test each action:

### Unit Tests (if available)
```bash
npm run test:unit
```

### Manual Testing
1. Test as owner (pet owner role)
2. Test as vet (veterinarian role)
3. Test as admin
4. Test unauthenticated access (should fail)
5. Test cross-tenant access (should fail)

### Integration Tests
Run the full application and test the workflows:
- Pet registration
- Appointment booking
- Vaccine recording
- Invoice creation
- Medical record creation

## Benefits of Migration

1. **Consistency**: All actions follow the same auth pattern
2. **Security**: Centralized auth logic reduces bugs
3. **Maintainability**: Easier to update auth requirements
4. **Type Safety**: Better TypeScript inference
5. **Less Code**: Remove ~10-20 lines of boilerplate per action
6. **Testing**: Easier to mock auth context
7. **Error Handling**: Consistent error responses

## Files Location

- Wrapper: `web/lib/actions/with-action-auth.ts`
- Result helpers: `web/lib/actions/result.ts`
- Index (exports): `web/lib/actions/index.ts`
- Types: `web/lib/types/action-result.ts`

## Example Migrations

See the following files for examples:
- **Complex auth**: `web/app/actions/invoices.ts` (10 functions)
- **With Zod validation**: `web/app/actions/create-vaccine.ts`
- **Owner + staff auth**: `web/app/actions/create-vaccine.ts`
- **Public access**: `web/app/actions/safety.ts`
- **Already migrated**: `web/app/actions/appointments.ts`, `web/app/actions/pets.ts`

## Next Steps

1. Continue migrating high-priority files
2. Test each migration thoroughly
3. Update this document as you complete migrations
4. Consider creating automated tests for auth scenarios
5. Update API documentation to reflect new patterns

## Notes

- Not all actions need `withActionAuth` (e.g., public QR scan reporting)
- Some actions need custom ownership logic (e.g., createVaccine allows owners OR staff)
- Admin-only actions should use `{ requireAdmin: true }`
- Most mutations should use `{ requireStaff: true }`
- Read operations might allow owners to access their own data

---

**Last Updated**: December 2024
**Migration Progress**: 6/~25 files (24%)
