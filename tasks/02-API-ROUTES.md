# API Routes Refactoring Tasks

> **Priority:** HIGH
> **Total Tasks:** 28
> **Estimated Effort:** 16-24 hours

---

## CRITICAL: Standardization Issues

### API-001: Migrate All Routes to withAuth Middleware
**Files:** 70+ API routes
**Impact:** Eliminates 500+ lines of duplicate code

**Current pattern (repeated 70+ times):**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

const { data: profile } = await supabase
  .from('profiles')
  .select('role, tenant_id')
  .eq('id', user.id)
  .single()
```

**Target pattern using existing middleware:**
```typescript
import { withAuth } from '@/lib/api/with-auth'

export const GET = withAuth(async (request, { user, profile, isStaff }) => {
  // Auth already handled, profile available
  const { data } = await supabase
    .from('table')
    .select('*')
    .eq('tenant_id', profile.tenant_id)

  return NextResponse.json(data)
})
```

**Priority files to migrate:**
1. `web/app/api/clients/route.ts`
2. `web/app/api/hospitalizations/route.ts`
3. `web/app/api/lab-orders/route.ts`
4. `web/app/api/loyalty_points/route.ts`
5. `web/app/api/pets/[id]/route.ts`
6. `web/app/api/appointments/[id]/check-in/route.ts`
7. `web/app/api/consents/route.ts`
8. `web/app/api/dashboard/stats/route.ts`

**Effort:** 4-6 hours (5 min per route)

---

### API-002: Standardize Error Response Format
**Files:** All 87 API routes
**Problem:** 3 different error formats in use

**Current variations:**
```typescript
// Format A: Direct string
return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

// Format B: Using apiError helper
return apiError('VALIDATION_ERROR', 400, fieldErrors)

// Format C: Custom object
return NextResponse.json({ success: false, message: 'Error' }, { status: 500 })
```

**Standard format (use apiError everywhere):**
```typescript
import { apiError, apiSuccess } from '@/lib/api/errors'

// Error
return apiError('UNAUTHORIZED', 401)
return apiError('VALIDATION_ERROR', 400, { field: 'email', message: 'Invalid' })
return apiError('DATABASE_ERROR', 500)

// Success
return apiSuccess(data)
return apiSuccess({ items: data, total: count, page, limit })
```

**Files needing update:**
- `web/app/api/appointments/slots/route.ts`
- `web/app/api/consents/route.ts`
- `web/app/api/diagnosis_codes/route.ts`
- `web/app/api/dashboard/stats/route.ts`
- `web/app/api/loyalty_points/route.ts`
- `web/app/api/lab-orders/route.ts`
- `web/app/api/hospitalizations/route.ts`
- `web/app/api/search/route.ts`
- `web/app/api/pets/[id]/route.ts`

**Effort:** 2-3 hours

---

### API-003: Standardize Pagination Response Format
**Files:** 15+ routes with pagination
**Problem:** 3 different pagination structures

**Current variations:**
```typescript
// Format A
{ clients, pagination: { page, limit, total, totalPages } }

// Format B
{ data: invoices, total: count, page, limit }

// Format C
{ products, pagination: { page, limit, total, pages, hasNext, hasPrev }, filters: {...} }
```

**Standard format:**
```typescript
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Helper function
function paginatedResponse<T>(data: T[], page: number, limit: number, total: number) {
  const pages = Math.ceil(total / limit)
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  }
}
```

**Effort:** 2 hours

---

## HIGH: Large Files to Split

### API-004: Split Store Products Route
**File:** `web/app/api/store/products/route.ts`
**Lines:** 537
**Problem:** Too many responsibilities

**Extract to:**
1. `web/lib/store/product-query-builder.ts` (~150 lines)
   - `buildProductQuery(filters, sort, pagination)`
   - Filter combination logic

2. `web/lib/store/discount-calculator.ts` (~80 lines)
   - `calculateDiscounts(product, campaigns, coupons)`
   - Campaign application logic

3. `web/lib/store/product-transformer.ts` (~60 lines)
   - `transformProduct(rawProduct, discounts)`
   - Response transformation

4. `web/lib/store/available-filters.ts` (~100 lines)
   - `getAvailableFilters(tenant_id, category)`
   - Filter options generation

**Resulting route:** ~150 lines

**Effort:** 3 hours

---

### API-005: Split Clients Route
**File:** `web/app/api/clients/route.ts`
**Lines:** 310
**Problem:** Complex fallback logic, real-time aggregation

**Extract to:**
1. `web/lib/api/clients/materialized-query.ts` (~80 lines)
   - `getClientsFromMaterializedView(params)`

2. `web/lib/api/clients/realtime-query.ts` (~120 lines)
   - `getClientsRealtime(params)`
   - Fallback aggregation logic

3. `web/lib/api/clients/transformers.ts` (~40 lines)
   - `transformClientResponse(client)`

**Resulting route:** ~100 lines

**Effort:** 2 hours

---

### API-006: Split Invoices Route
**File:** `web/app/api/invoices/route.ts`
**Lines:** 194

**Extract to:**
1. `web/lib/invoicing/invoice-number-generator.ts`
   - `generateInvoiceNumber(tenant_id)`

2. `web/lib/invoicing/tax-calculator.ts`
   - `calculateInvoiceTotals(items, taxRate)`

**Effort:** 1.5 hours

---

### API-007: Split Invoice Detail Route
**File:** `web/app/api/invoices/[id]/route.ts`
**Lines:** 268
**Problem:** GET, PATCH, DELETE all in one file with complex logic

**Option A:** Keep in one file but extract helpers
**Option B:** Split into separate routes:
- `[id]/route.ts` - GET only (~80 lines)
- `[id]/update/route.ts` - PATCH (~100 lines)
- `[id]/delete/route.ts` - DELETE (~60 lines)

**Recommended:** Option A with extracted status validation

**Effort:** 1.5 hours

---

## HIGH: Missing Validation

### API-008: Add Zod Validation to POST/PATCH Bodies
**Files without proper validation:**

| File | Method | Missing |
|------|--------|---------|
| `invoices/[id]/route.ts` | PATCH | Body validation |
| `pets/[id]/route.ts` | PATCH | Type coercion |
| `hospitalizations/route.ts` | POST | Partial validation only |
| `lab-orders/route.ts` | POST | Limited validation |
| `settings/general/route.ts` | PUT | No validation |

**Create schemas:**
```typescript
// web/lib/schemas/api/invoice-update.ts
import { z } from 'zod'

export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'void']).optional(),
  notes: z.string().max(1000).optional(),
  due_date: z.string().datetime().optional(),
  items: z.array(z.object({
    id: z.string().uuid().optional(),
    item_type: z.enum(['service', 'product', 'custom']),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit_price: z.number().nonnegative()
  })).optional()
})
```

**Effort:** 3 hours

---

### API-009: Add Pagination Parameter Validation
**Files:** All routes with pagination
**Problem:** NaN not handled, no bounds checking

**Create utility:**
```typescript
// web/lib/api/pagination.ts
import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export function validatePagination(searchParams: URLSearchParams) {
  const result = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit')
  })

  if (!result.success) {
    return { page: 1, limit: 20 }
  }

  return result.data
}
```

**Apply to:**
- `api/clients/route.ts`
- `api/store/products/route.ts`
- `api/lab-orders/route.ts`
- `api/invoices/route.ts`
- `api/appointments/route.ts`
- `api/insurance/claims/route.ts`

**Effort:** 1.5 hours

---

## MEDIUM: Code Quality

### API-010: Replace SELECT * with Explicit Columns
**Files using SELECT *:**
- `api/dashboard/revenue/route.ts`
- `api/notifications/route.ts`
- `api/drug_dosages/route.ts`
- `api/services/route.ts`
- `api/dashboard/stats/route.ts`
- Plus 8 more files

**Change:**
```typescript
// Before
.select('*')

// After
.select('id, name, tenant_id, status, created_at')
```

**Effort:** 2 hours (10 min per file)

---

### API-011: Extract Tenant Verification Utility
**Pattern repeated 20+ times:**
```typescript
const { data: pet } = await supabase
  .from('pets')
  .select('id, tenant_id')
  .eq('id', pet_id)
  .single()

if (pet.tenant_id !== profile.tenant_id) {
  return NextResponse.json({ error: 'No tienes acceso' }, { status: 403 })
}
```

**Create:**
```typescript
// web/lib/api/verify-tenant.ts
export async function verifyResourceTenant(
  supabase: SupabaseClient,
  table: string,
  resourceId: string,
  userTenantId: string
): Promise<{ valid: boolean; error?: NextResponse }> {
  const { data, error } = await supabase
    .from(table)
    .select('tenant_id')
    .eq('id', resourceId)
    .single()

  if (error || !data) {
    return { valid: false, error: apiError('NOT_FOUND', 404) }
  }

  if (data.tenant_id !== userTenantId) {
    return { valid: false, error: apiError('FORBIDDEN', 403) }
  }

  return { valid: true }
}
```

**Effort:** 1.5 hours

---

### API-012: Add Detailed Error Context
**Problem:** Generic error messages without context

**Files:**
- `api/store/products/route.ts` (line 448)
- `api/invoices/route.ts` (line 83)

**Pattern:**
```typescript
// Before
catch (e) {
  return NextResponse.json({ error: 'No se pudieron cargar los productos' }, { status: 500 })
}

// After
catch (e) {
  console.error('Error loading products:', {
    error: e,
    filters,
    tenant_id: profile.tenant_id,
    timestamp: new Date().toISOString()
  })
  return apiError('DATABASE_ERROR', 500)
}
```

**Effort:** 1 hour

---

### API-013: Standardize Status Validation Pattern
**Files with status updates:**
- `api/invoices/[id]/route.ts`
- `api/booking/route.ts`
- `api/appointments/[id]/check-in/route.ts`
- `api/hospitalizations/[id]/route.ts`
- `api/lab-orders/[id]/route.ts`

**Create:**
```typescript
// web/lib/api/status-transitions.ts
const INVOICE_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'partial', 'overdue', 'cancelled'],
  partial: ['paid', 'overdue', 'cancelled'],
  paid: ['void'],
  overdue: ['paid', 'partial', 'cancelled'],
  cancelled: [],
  void: []
}

export function canTransitionTo(
  currentStatus: string,
  newStatus: string,
  transitions: Record<string, string[]>
): boolean {
  return transitions[currentStatus]?.includes(newStatus) ?? false
}
```

**Effort:** 1.5 hours

---

## MEDIUM: Performance

### API-014: Add Caching Headers to Read Endpoints
**Public/static endpoints:**
- `api/diagnosis_codes/route.ts`
- `api/drug_dosages/route.ts`
- `api/services/route.ts` (GET)

**Add:**
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
  }
})
```

**Effort:** 30 minutes

---

### API-015: Optimize N+1 in Clients Fallback
**File:** `web/app/api/clients/route.ts`
**Lines:** 200-268
**Problem:** Fetches all pets then counts in JS

**Solution:** Use RPC or aggregate query

**Effort:** 1 hour

---

## LOW: Documentation & Cleanup

### API-016: Document Public Endpoints
**Files:**
- `api/appointments/slots/route.ts`
- `api/services/route.ts`
- `api/store/products/route.ts`

**Add JSDoc:**
```typescript
/**
 * Public endpoint - no authentication required
 * Rate limited: 100 requests/minute
 *
 * @param clinic - Clinic slug (validated against active clinics)
 */
export async function GET(request: NextRequest) {
```

**Effort:** 30 minutes

---

### API-017: Remove Unused Route Files
**Check if still used:**
- `api/store/orders/route.ts` - Might be incomplete
- `api/notifications/mark-read/route.ts` - Verify usage

**Effort:** 30 minutes

---

### API-018 through API-028: Individual Route Fixes

| Task | File | Issue | Effort |
|------|------|-------|--------|
| API-018 | `api/search/route.ts` | Line 90: `clinic_slug` typo | 5 min |
| API-019 | `api/dashboard/stats/route.ts` | Uses SELECT * | 10 min |
| API-020 | `api/whatsapp/send/route.ts` | Add rate limiting | 15 min |
| API-021 | `api/insurance/claims/route.ts` | Add rate limiting | 15 min |
| API-022 | `api/lab-orders/route.ts` | Bounds check on offset | 10 min |
| API-023 | `api/hospitalizations/route.ts` | Add audit logging | 20 min |
| API-024 | `api/consents/route.ts` | Add audit for signing | 20 min |
| API-025 | `api/pets/[id]/route.ts` | Add audit for updates | 15 min |
| API-026 | `api/store/checkout/route.ts` | Verify transaction rollback | 30 min |
| API-027 | `api/booking/route.ts` | Extract overlap checking | 45 min |
| API-028 | `api/staff/schedule/route.ts` | Consolidate RPC calls | 30 min |

---

## Checklist

```
CRITICAL:
[ ] API-001: Migrate to withAuth middleware
[ ] API-002: Standardize error format
[ ] API-003: Standardize pagination format

HIGH:
[ ] API-004: Split store products route
[ ] API-005: Split clients route
[ ] API-006: Split invoices route
[ ] API-007: Split invoice detail route
[ ] API-008: Add Zod validation
[ ] API-009: Pagination validation utility

MEDIUM:
[ ] API-010: Replace SELECT *
[ ] API-011: Tenant verification utility
[ ] API-012: Error context logging
[ ] API-013: Status transition utility
[ ] API-014: Caching headers
[ ] API-015: N+1 optimization

LOW:
[ ] API-016: Document public endpoints
[ ] API-017: Remove unused routes
[ ] API-018 to API-028: Individual fixes
```
