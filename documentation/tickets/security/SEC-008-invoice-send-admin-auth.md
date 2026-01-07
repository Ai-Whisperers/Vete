# SEC-008: Invoice Send Admin Auth Gap

## Priority: P2 (Medium)
## Category: Security / Authorization
## Status: Not Started

## Description
The invoice send endpoint only accepts CRON_SECRET for authentication, preventing admins from manually sending invoices via the UI.

## Current State
### Current Code
**`app/api/billing/invoices/[id]/send/route.ts:35`**
```typescript
// For now, require CRON_SECRET for this admin operation
// TODO: Add admin session validation as alternative
if (cronSecret !== process.env.CRON_SECRET) {
    return apiError('Unauthorized', 401)
}
```

### Issues
1. Only cron jobs can trigger invoice sending
2. Admins cannot manually resend failed invoices
3. No way to send invoices on-demand from dashboard
4. TODO in code indicates this was intentional deferral

### Business Impact
- Staff must wait for next cron run to send invoices
- No manual intervention for failed email delivery
- Customer service delays when clients need invoices

## Proposed Solution

### Dual Authentication
```typescript
// app/api/billing/invoices/[id]/send/route.ts
export async function POST(request: NextRequest, { params }) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Option 1: Cron job authentication
  if (authHeader === `Bearer ${cronSecret}`) {
    // Cron-initiated send - proceed
    return handleInvoiceSend(params.id, 'cron')
  }

  // Option 2: Admin session authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError('No autorizado', 401)
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return apiError('Solo administradores pueden enviar facturas', 403)
  }

  // Verify invoice belongs to admin's tenant
  const { data: invoice } = await supabase
    .from('invoices')
    .select('tenant_id')
    .eq('id', params.id)
    .single()

  if (invoice?.tenant_id !== profile.tenant_id) {
    return apiError('Factura no encontrada', 404)
  }

  return handleInvoiceSend(params.id, user.id)
}
```

### Audit Logging
```typescript
await logAudit('SEND_INVOICE', {
  invoice_id: invoiceId,
  triggered_by: triggeredBy === 'cron' ? 'system' : triggeredBy,
  method: triggeredBy === 'cron' ? 'scheduled' : 'manual',
})
```

## Implementation Steps
1. Update route to accept dual authentication
2. Add admin role verification
3. Add tenant isolation check
4. Update audit logging with trigger source
5. Add dashboard UI button for manual send
6. Test both auth paths

## Acceptance Criteria
- [ ] Cron jobs can still send invoices
- [ ] Admins can manually send from dashboard
- [ ] Vets cannot send invoices (admin only)
- [ ] Tenant isolation maintained
- [ ] Audit log shows who triggered send
- [ ] UI shows send button for admins

## Related Files
- `web/app/api/billing/invoices/[id]/send/route.ts`
- `web/components/billing/invoice-detail.tsx` (add send button)
- `web/app/[clinic]/dashboard/billing/invoices/[id]/page.tsx`

## Estimated Effort
- Route update: 1 hour
- UI button: 1 hour
- Testing: 1 hour
- **Total: 3 hours**

---
*Ticket created: January 2026*
*Based on security/performance audit*
