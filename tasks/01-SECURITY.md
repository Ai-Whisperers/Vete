# Security & Authentication Tasks

> **Priority:** CRITICAL
> **Total Tasks:** 15
> **Estimated Effort:** 8-12 hours

---

## CRITICAL: Fix Immediately

### SEC-001: Missing Tenant Isolation in Appointments Slots API
**File:** `web/app/api/appointments/slots/route.ts`
**Lines:** 14-28, 63-73
**Risk:** HIGH - Users can query any clinic's availability

**Problem:**
```typescript
// Current: No validation that clinicSlug belongs to user's tenant
const clinicSlug = searchParams.get('clinic')
// ... directly used in RPC call
```

**Solution:**
```typescript
// After getting profile, add:
if (clinicSlug !== profile.tenant_id && !isStaff) {
  return NextResponse.json({ error: 'Acceso denegado a esta clínica' }, { status: 403 })
}
```

**Effort:** 15 minutes

---

### SEC-002: Missing Tenant Isolation in Store Products API
**File:** `web/app/api/store/products/route.ts`
**Lines:** 72-76
**Risk:** HIGH - Authenticated users can browse other clinic's products

**Problem:**
```typescript
// Current: Takes clinic from query but never validates
const clinic = searchParams.get('clinic')
// ... used directly in query without profile.tenant_id check
```

**Solution:**
```typescript
// For authenticated users, validate:
if (user && profile && clinic !== profile.tenant_id) {
  return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
}
```

**Effort:** 15 minutes

---

### SEC-003: Missing Tenant Filter in WhatsApp Actions
**File:** `web/app/actions/whatsapp.ts`
**Lines:** 403-407
**Risk:** HIGH - Cross-tenant data exposure via phone number lookup

**Problem:**
```typescript
// Current: Searches all tenants
const { data: client } = await supabase
  .from('profiles')
  .select('id, full_name, phone, tenant_id')
  .eq('phone', formattedPhone)  // Missing tenant filter!
```

**Solution:**
```typescript
const { data: client } = await supabase
  .from('profiles')
  .select('id, full_name, phone, tenant_id')
  .eq('phone', formattedPhone)
  .eq('tenant_id', profile.tenant_id)  // ADD THIS
  .single()
```

**Effort:** 5 minutes

---

### SEC-004: Missing Authentication in Send Email Action
**File:** `web/app/actions/send-email.ts`
**Lines:** 10-28
**Risk:** CRITICAL - Unauthenticated email sending

**Problem:**
```typescript
// Current: NO authentication check
export async function sendEmail(params: EmailParams) {
  // Directly sends email without verifying user
}
```

**Solution:**
```typescript
export async function sendEmail(params: EmailParams) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'No autorizado' }
  }

  // ... rest of function
}
```

**Effort:** 10 minutes

---

### SEC-005: Missing Authentication in Safety Actions
**File:** `web/app/actions/safety.ts`
**Lines:** 6-31 (reportFoundPet function)
**Risk:** MEDIUM - Public can report found pets (may be intentional, but needs review)

**Problem:**
```typescript
// Current: No authentication - allows anonymous reports
export async function reportFoundPet(tagCode: string, location: string, contact: string) {
  // No user verification
}
```

**Decision Required:**
- If intentional public access: Add rate limiting and CAPTCHA
- If should be authenticated: Add auth check

**Solution (if auth required):**
```typescript
export async function reportFoundPet(tagCode: string, location: string, contact: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debe iniciar sesión para reportar' }
  }

  // ... rest
}
```

**Effort:** 15 minutes

---

### SEC-006: Overly Permissive RLS Policies
**File:** `web/db/50_rls_policies_complete.sql`
**Lines:** 15-17, 54-55
**Risk:** MEDIUM - Unauthenticated access to lab data

**Problem:**
```sql
-- Current: Allows anyone to read
CREATE POLICY "Public can read lab test catalog" ON lab_test_catalog
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can read reference ranges" ON lab_reference_ranges
    FOR SELECT USING (TRUE);
```

**Solution:**
```sql
-- Require authentication
CREATE POLICY "Authenticated can read lab test catalog" ON lab_test_catalog
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can read reference ranges" ON lab_reference_ranges
    FOR SELECT USING (auth.role() = 'authenticated');
```

**Effort:** 20 minutes (includes migration)

---

### SEC-007: Missing Tenant Check After Auth in Loyalty Points
**File:** `web/app/api/loyalty_points/route.ts`
**Lines:** 50-53
**Risk:** MEDIUM - Potential cross-tenant data access

**Problem:**
```typescript
// Current: Queries by pet_id only
const { data } = await supabase
  .from('loyalty_transactions')
  .select('*')
  .eq('pet_id', pet_id)
  // Missing: .eq('tenant_id', profile.tenant_id)
```

**Solution:**
```typescript
const { data } = await supabase
  .from('loyalty_transactions')
  .select('*')
  .eq('pet_id', pet_id)
  .eq('tenant_id', profile.tenant_id)
```

**Effort:** 5 minutes

---

## HIGH: Fix This Sprint

### SEC-008: Create Centralized Auth Utility
**New File:** `web/lib/auth/require-staff.ts`
**Impact:** Eliminates 100+ duplicate auth patterns

**Create:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface AuthResult {
  user: { id: string; email: string }
  profile: { id: string; tenant_id: string; role: string }
  isStaff: boolean
  isAdmin: boolean
}

export async function requireAuth(clinic: string): Promise<AuthResult | null> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, tenant_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    user,
    profile,
    isStaff: ['vet', 'admin'].includes(profile.role),
    isAdmin: profile.role === 'admin'
  }
}

export async function requireStaff(clinic: string): Promise<AuthResult> {
  const auth = await requireAuth(clinic)

  if (!auth) {
    redirect(`/${clinic}/portal/login`)
  }

  if (!auth.isStaff) {
    redirect(`/${clinic}/portal/dashboard`)
  }

  if (auth.profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/dashboard`)
  }

  return auth
}

export async function requireAdmin(clinic: string): Promise<AuthResult> {
  const auth = await requireStaff(clinic)

  if (!auth.isAdmin) {
    redirect(`/${clinic}/dashboard`)
  }

  return auth
}

export async function requireOwner(clinic: string): Promise<AuthResult> {
  const auth = await requireAuth(clinic)

  if (!auth) {
    redirect(`/${clinic}/portal/login`)
  }

  if (auth.profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/login`)
  }

  return auth
}
```

**Effort:** 1 hour

---

### SEC-009: Add Rate Limiting to Missing Endpoints
**Files:**
- `web/app/api/invoices/route.ts`
- `web/app/api/appointments/slots/route.ts`
- `web/app/api/hospitalizations/route.ts`
- `web/app/api/insurance/claims/route.ts`
- `web/app/api/store/products/route.ts`
- `web/app/api/loyalty_points/route.ts`
- `web/app/api/settings/*/route.ts` (all)

**Add to each:**
```typescript
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit(request, RATE_LIMITS.api)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes' },
      { status: 429, headers: rateLimitResult.headers }
    )
  }
  // ... rest
}
```

**Effort:** 2 hours (15 min per endpoint)

---

### SEC-010: Add Error Boundary to Dashboard
**New File:** `web/app/[clinic]/dashboard/error.tsx`

**Create:**
```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        Algo salió mal
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">
        Hubo un error al cargar esta página.
      </p>
      <Button onClick={reset} className="mt-4">
        Intentar de nuevo
      </Button>
    </div>
  )
}
```

**Effort:** 15 minutes

---

### SEC-011: Add Error Boundary to Portal
**New File:** `web/app/[clinic]/portal/error.tsx`

Copy same pattern as SEC-010.

**Effort:** 10 minutes

---

### SEC-012: Validate Invoice Clinic Parameter
**File:** `web/app/api/invoices/route.ts`
**Lines:** 18-30

**Problem:**
```typescript
// Current: Clinic from query with fallback
const clinic = searchParams.get('clinic') || profile.tenant_id
// Staff can potentially access other tenants
```

**Solution:**
```typescript
const clinic = searchParams.get('clinic') || profile.tenant_id

// Validate staff can only access their tenant
if (clinic !== profile.tenant_id) {
  return apiError('FORBIDDEN', 403, { reason: 'Tenant access denied' })
}
```

**Effort:** 10 minutes

---

## MEDIUM: Plan for Next Sprint

### SEC-013: Add Input Sanitization to Search Endpoints
**Files:**
- `web/app/api/search/route.ts`
- `web/app/api/clients/route.ts`
- `web/app/api/insurance/claims/route.ts`
- `web/app/api/store/products/route.ts`

**Create utility:**
```typescript
// lib/utils/sanitize.ts
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[%_\\]/g, '\\$&')  // Escape SQL wildcards
    .slice(0, 100)  // Limit length
}
```

**Effort:** 1 hour

---

### SEC-014: Add Audit Logging to Missing Mutations
**Files missing audit logging:**
- `web/app/api/hospitalizations/route.ts` - Admissions/discharges
- `web/app/api/lab-orders/route.ts` - Test ordering
- `web/app/api/consents/route.ts` - Consent signing (CRITICAL)
- `web/app/api/pets/[id]/route.ts` - Pet data updates
- `web/app/api/loyalty_points/route.ts` - Points adjustments

**Pattern to add:**
```typescript
import { logAudit } from '@/lib/audit'

// After successful mutation:
await logAudit('CREATE_HOSPITALIZATION', `hospitalizations/${id}`, {
  pet_id,
  kennel_id,
  admitted_by: user.id
})
```

**Effort:** 2 hours

---

### SEC-015: Fix Hardcoded Demo Tenant
**File:** `web/db/12_functions.sql`
**Lines:** 74-86

**Problem:**
```sql
ELSIF NEW.email IN ('admin@demo.com', 'vet@demo.com', ...) THEN
    v_tenant_id := 'adris';  -- Hardcoded
```

**Solution:** Remove demo account handling from production or use environment variable.

**Effort:** 30 minutes

---

## Checklist

```
CRITICAL (Fix Today):
[ ] SEC-001: Tenant isolation in appointments slots
[ ] SEC-002: Tenant isolation in store products
[ ] SEC-003: WhatsApp tenant filter
[ ] SEC-004: Auth in send-email action
[ ] SEC-005: Review safety actions auth
[ ] SEC-006: Fix permissive RLS policies
[ ] SEC-007: Tenant check in loyalty points

HIGH (Fix This Sprint):
[ ] SEC-008: Create auth utility
[ ] SEC-009: Add rate limiting
[ ] SEC-010: Dashboard error boundary
[ ] SEC-011: Portal error boundary
[ ] SEC-012: Validate invoice clinic param

MEDIUM (Next Sprint):
[ ] SEC-013: Input sanitization
[ ] SEC-014: Audit logging
[ ] SEC-015: Fix demo tenant hardcode
```
