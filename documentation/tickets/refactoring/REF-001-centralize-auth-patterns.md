# REF-001: Centralize Authentication Patterns

## Priority: P1 - High
## Category: Refactoring
## Affected Areas: API routes, Server Actions, Portal/Dashboard layouts

## Description

Authentication and authorization logic is duplicated across 83+ API routes and 22 server actions. Each route implements its own auth check pattern, leading to inconsistencies and maintenance burden.

## Current State

```typescript
// Pattern A - Some routes
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

// Pattern B - Other routes
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Pattern C - With role check
const { data: profile } = await supabase.from('profiles')
  .select('tenant_id, role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') { ... }
```

### Issues:
1. Inconsistent error messages ('No autorizado' vs 'Unauthorized')
2. Some routes don't check for auth errors
3. Profile fetching duplicated everywhere
4. Role checks vary in implementation
5. Tenant ID retrieval repeated in every route

## Proposed Solution

Create a centralized `withAuth` higher-order function:

```typescript
// lib/api/with-auth.ts
type AuthContext = {
  user: User
  profile: Profile
  tenantId: string
  isStaff: boolean
  isAdmin: boolean
}

export function withAuth<T>(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse<T>>,
  options?: { requireStaff?: boolean; requireAdmin?: boolean }
) {
  return async (req: NextRequest): Promise<NextResponse<T | ApiError>> => {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado', code: 'PROFILE_NOT_FOUND' },
        { status: 403 }
      )
    }

    const isStaff = ['vet', 'admin'].includes(profile.role)
    const isAdmin = profile.role === 'admin'

    if (options?.requireStaff && !isStaff) {
      return NextResponse.json(
        { error: 'Acceso denegado', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    if (options?.requireAdmin && !isAdmin) {
      return NextResponse.json(
        { error: 'Solo administradores', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      )
    }

    return handler(req, {
      user,
      profile,
      tenantId: profile.tenant_id,
      isStaff,
      isAdmin
    })
  }
}
```

Usage:
```typescript
// api/invoices/route.ts
export const GET = withAuth(async (req, { tenantId }) => {
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)

  return NextResponse.json(data)
}, { requireStaff: true })
```

## Implementation Steps

1. [ ] Create `lib/api/with-auth.ts` with full implementation
2. [ ] Create `lib/api/types.ts` for AuthContext and error types
3. [ ] Add unit tests for withAuth function
4. [ ] Migrate 10 most critical API routes (invoices, appointments, pets)
5. [ ] Migrate remaining API routes in batches of 10
6. [ ] Update server actions to use similar pattern
7. [ ] Remove old auth code from migrated routes
8. [ ] Update documentation

## Acceptance Criteria

- [ ] Single source of truth for auth patterns
- [ ] All error messages in Spanish
- [ ] Consistent HTTP status codes (401 vs 403)
- [ ] Profile fetching happens once per request
- [ ] Easy to add new permission levels
- [ ] No regression in existing functionality

## Related Files

- `web/lib/api/with-auth.ts` (partial implementation exists)
- `web/lib/api/errors.ts`
- `web/app/api/**/route.ts` (83 files)
- `web/app/actions/*.ts` (22 files)

## Estimated Effort

- Initial implementation: 2-3 hours
- Migration of all routes: 6-8 hours
- Testing: 2-3 hours
- **Total: 10-14 hours**
