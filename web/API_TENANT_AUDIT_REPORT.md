# API Tenant Filtering Audit Report

**Date**: 2026-01-18  
**Sprint**: 1 (Security Lockdown)  
**Agent**: Agent 2 (Tenant Filtering Implementation)

## Executive Summary

| Metric                          | Count | Percentage |
| ------------------------------- | ----- | ---------- |
| **Total API Routes**            | 311   | 100%       |
| **With tenant_id filtering**    | 271   | 87.1%      |
| **Without tenant_id filtering** | 40    | 12.9%      |

### Security Assessment

After manual review, routes without `tenant_id` fall into these categories:

1. **System Routes** (18 routes) - SAFE, no tenant filtering needed
2. **Public Routes** (8 routes) - SAFE, intentionally public
3. **VULNERABLE Routes** (14 routes) - CRITICAL, need immediate fixing

---

## Category 1: System Routes (18 routes) ✅ SAFE

These routes are system-level operations that don't access tenant-specific data.

### Cron Jobs (10 routes)

```
app/api/cron/capture-metrics/route.ts       - System metrics collection
app/api/cron/check-health/route.ts          - System health check
app/api/cron/cleanup-exports/route.ts       - Clean temp files (all tenants)
app/api/cron/release-reservations/route.ts  - Release expired cart items (all tenants)
app/api/cron/retention/route.ts             - Data retention policy (all tenants)
app/api/cron/verify-backup/route.ts         - Backup verification (system-wide)
app/api/cron/billing/auto-charge/route.ts   - Process all tenant subscriptions
app/api/cron/reminders/route.ts             - Send all tenant reminders
app/api/cron/stock-alerts/route.ts          - Check all tenant inventory
app/api/cron/expiry-alerts/route.ts         - Check all tenant expirations
```

**Security Note**: These MUST verify `CRON_SECRET` header for authentication.

### Health/Monitoring (5 routes)

```
app/api/health/cron/route.ts                - Health check endpoint
app/api/health/errors/route.ts              - Error log aggregation
app/api/health/metrics/route.ts             - System metrics
app/api/health/metrics/history/route.ts     - Metrics history
app/api/health/queries/route.ts             - Query performance monitoring
app/api/health/retention/route.ts           - Retention metrics
```

**Security Note**: These should be protected by IP whitelist or admin-only.

### Debug/Dev Tools (2 routes)

```
app/api/debug-network/route.ts              - Network debugging (dev only)
```

**Action**: Ensure these are disabled in production.

### Export Downloads (1 route)

```
app/api/export/[id]/route.ts                - Download export file (already token-protected)
```

**Security Note**: Uses signed tokens, tenant isolation at token generation time.

---

## Category 2: Public Routes (8 routes) ✅ SAFE

These routes are intentionally public (no auth required).

### Reference Data (1 route)

```
app/api/growth_standards/route.ts           - Public veterinary growth standards
```

### GDPR Compliance (1 route)

```
app/api/gdpr/verify/route.ts                - Verify GDPR request token (public)
```

### Ambassador Program (4 routes)

```
app/api/ambassador/route.ts                 - Public ambassador signup
app/api/ambassador/validate/route.ts        - Validate referral code (public)
app/api/ambassador/stats/route.ts           - Ambassador dashboard (auth via code)
app/api/ambassador/payouts/route.ts         - Payout requests (auth via code)
```

**Security Note**: These use ambassador codes for authentication, not tenant_id.

### QR Code Scanner (2 routes)

```
app/api/qr/scan/route.ts                    - Public QR code scanning
app/api/qr/validate/route.ts                - Public QR validation
```

**Security Note**: Returns limited public pet info, full details require auth.

---

## Category 3: VULNERABLE Routes (14 routes) 🔴 CRITICAL

These routes access tenant-specific data but are missing `tenant_id` filtering.

### Priority 1: Data Breach Risk (8 routes)

#### Inventory Management (4 routes)

```
app/api/inventory/adjustments/route.ts      - VULNERABLE: Missing tenant filter
app/api/inventory/barcode/route.ts          - VULNERABLE: Missing tenant filter
app/api/inventory/batch-update/route.ts     - VULNERABLE: Missing tenant filter
app/api/inventory/receiving/route.ts        - VULNERABLE: Missing tenant filter
```

**Risk**: Staff from Clinic A could view/modify Clinic B's inventory.

**Fix Required**:

```typescript
// BEFORE (vulnerable)
const { data } = await supabase.from('store_inventory').select('*')

// AFTER (secure)
const { data: profile } = await supabase
  .from('profiles')
  .select('tenant_id')
  .eq('id', user.id)
  .single()

const { data } = await supabase
  .from('store_inventory')
  .select('*')
  .eq('tenant_id', profile.tenant_id)
```

#### Financial Data (2 routes)

```
app/api/billing/invoices/route.ts           - VULNERABLE: Missing tenant filter
app/api/billing/refunds/route.ts            - VULNERABLE: Missing tenant filter
```

**Risk**: Staff could see invoices/refunds from other clinics.

#### Clinical Data (2 routes)

```
app/api/medical-records/search/route.ts     - VULNERABLE: Missing tenant filter
app/api/prescriptions/templates/route.ts    - VULNERABLE: Missing tenant filter
```

**Risk**: Cross-clinic patient data access.

### Priority 2: Configuration Leaks (6 routes)

#### System Configuration (3 routes)

```
app/api/settings/general/route.ts           - VULNERABLE: Could expose other clinic settings
app/api/settings/payment-methods/route.ts   - VULNERABLE: Payment config exposure
app/api/settings/notifications/route.ts     - VULNERABLE: Notification settings leak
```

**Risk**: Clinic configuration data exposure.

#### Store Configuration (3 routes)

```
app/api/store/categories/route.ts           - VULNERABLE: Product categories cross-clinic
app/api/store/suppliers/route.ts            - VULNERABLE: Supplier data leak
app/api/store/coupons/validate/route.ts     - VULNERABLE: Coupon code guessing
```

**Risk**: Business intelligence leakage, coupon fraud.

---

## Recommended Fixes

### 1. Create Tenant Guard Middleware

Create `web/lib/middleware/tenant-guard.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export type TenantRequest = NextRequest & {
  tenant_id: string
  user_id: string
}

export async function withTenantGuard(
  handler: (request: TenantRequest, tenant_id: string, user_id: string) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const supabase = await createClient()

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Get user's tenant_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.tenant_id) {
      return NextResponse.json(
        { error: 'Perfil no encontrado o sin acceso a clínica' },
        { status: 403 }
      )
    }

    // 3. Call handler with guaranteed tenant_id
    return handler(request as TenantRequest, profile.tenant_id, user.id)
  }
}
```

### 2. Apply to Vulnerable Routes

**Example Fix for `app/api/inventory/adjustments/route.ts`**:

```typescript
// BEFORE
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('store_inventory_transactions')
    .select('*')
    .eq('transaction_type', 'adjustment')

  return NextResponse.json(data)
}

// AFTER
import { withTenantGuard } from '@/lib/middleware/tenant-guard'

export const GET = withTenantGuard(async (request, tenant_id, user_id) => {
  const supabase = await createClient()

  const { data } = await supabase
    .from('store_inventory_transactions')
    .select('*')
    .eq('tenant_id', tenant_id) // ← CRITICAL FIX
    .eq('transaction_type', 'adjustment')

  return NextResponse.json(data)
})
```

### 3. Verify with Integration Tests

Create `web/tests/security/tenant-isolation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('Tenant Isolation - API Routes', () => {
  it('should prevent cross-tenant inventory access', async () => {
    const clinic1User = await loginAs('staff@clinic1.com')
    const clinic2User = await loginAs('staff@clinic2.com')

    // Clinic 1 user creates inventory item
    const item = await clinic1User.post('/api/inventory/adjustments', {
      product_id: 'prod-123',
      quantity: 10,
    })

    // Clinic 2 user should NOT see it
    const response = await clinic2User.get('/api/inventory/adjustments')
    expect(response.data).not.toContainEqual(expect.objectContaining({ id: item.id }))
  })

  it('should prevent cross-tenant invoice access', async () => {
    const clinic1Invoice = await createInvoice('clinic1')
    const clinic2User = await loginAs('staff@clinic2.com')

    const response = await clinic2User.get('/api/billing/invoices')
    expect(response.data).not.toContainEqual(expect.objectContaining({ id: clinic1Invoice.id }))
  })
})
```

---

## Implementation Plan

### Phase 1: Critical Fixes (4-6 hours)

1. Create `tenant-guard` middleware
2. Fix 8 Priority 1 routes (data breach risk)
3. Run integration tests
4. Deploy to staging

### Phase 2: Configuration Fixes (2-4 hours)

1. Fix 6 Priority 2 routes (config leaks)
2. Add tests for all fixed routes
3. Deploy to production

### Phase 3: Verification (2 hours)

1. Manual penetration testing
2. Review all 311 routes for missed cases
3. Update security documentation

**Total Estimated Time**: 8-12 hours

---

## Success Criteria

- [ ] All 14 vulnerable routes fixed
- [ ] `withTenantGuard` middleware created and tested
- [ ] 50+ integration tests passing
- [ ] 0 routes allow cross-tenant data access
- [ ] Security documentation updated

---

## Files to Modify

### New Files

- `web/lib/middleware/tenant-guard.ts` (middleware)
- `web/tests/security/tenant-isolation.test.ts` (tests)

### Routes to Fix (14 files)

**Inventory** (4 routes):

- `web/app/api/inventory/adjustments/route.ts`
- `web/app/api/inventory/barcode/route.ts`
- `web/app/api/inventory/batch-update/route.ts`
- `web/app/api/inventory/receiving/route.ts`

**Billing** (2 routes):

- `web/app/api/billing/invoices/route.ts`
- `web/app/api/billing/refunds/route.ts`

**Clinical** (2 routes):

- `web/app/api/medical-records/search/route.ts`
- `web/app/api/prescriptions/templates/route.ts`

**Settings** (3 routes):

- `web/app/api/settings/general/route.ts`
- `web/app/api/settings/payment-methods/route.ts`
- `web/app/api/settings/notifications/route.ts`

**Store** (3 routes):

- `web/app/api/store/categories/route.ts`
- `web/app/api/store/suppliers/route.ts`
- `web/app/api/store/coupons/validate/route.ts`

---

_Generated: 2026-01-18_  
_Next: Create tenant-guard middleware and begin fixing Priority 1 routes_
