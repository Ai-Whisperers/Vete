# FEAT-009: Client Segmentation Bulk Actions

## Priority: P1 (High)
## Category: Feature
## Status: Not Started

## Description
The client segmentation page has four action buttons that only show "Próximamente" (Coming Soon) toast messages instead of performing actual functionality.

## Current State
### Placeholder Implementations
**`app/[clinic]/dashboard/clients/segments/page.tsx`**

**Line 99 - Send Email:**
```typescript
const handleSendEmail = () => {
  showToast('Próximamente: Enviar email a {n} clientes', 'info')
}
```

**Line 103 - Send WhatsApp:**
```typescript
const handleSendWhatsApp = () => {
  showToast('Próximamente: Enviar WhatsApp a {n} clientes', 'info')
}
```

**Line 107 - Apply Discount:**
```typescript
const handleApplyDiscount = () => {
  showToast('Próximamente: Aplicar descuento a {n} clientes', 'info')
}
```

**Line 111 - Export:**
```typescript
const handleExport = () => {
  showToast('Próximamente: Exportar datos de segmentación', 'info')
}
```

### Business Value
- Marketing campaigns to specific client segments
- Bulk discounts for loyalty/retention
- WhatsApp outreach for promotions
- Data export for external tools

## Proposed Solution

### 1. Bulk Email API
```typescript
// app/api/clients/bulk-email/route.ts
export async function POST(request: NextRequest) {
  const { client_ids, template_id, subject, custom_message } = await request.json()

  // Get client emails
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', client_ids)
    .eq('tenant_id', tenantId)

  // Queue emails via Inngest
  await inngest.send({
    name: 'email/bulk-send',
    data: {
      tenant_id: tenantId,
      recipients: clients.map(c => ({
        id: c.id,
        email: c.email,
        name: c.full_name,
      })),
      template_id,
      subject,
      custom_message,
      triggered_by: userId,
    },
  })

  return NextResponse.json({
    success: true,
    queued: clients.length,
  })
}
```

### 2. Bulk WhatsApp API
```typescript
// app/api/clients/bulk-whatsapp/route.ts
export async function POST(request: NextRequest) {
  const { client_ids, template_id, custom_message } = await request.json()

  // Get client phone numbers
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, phone, full_name')
    .in('id', client_ids)
    .eq('tenant_id', tenantId)
    .not('phone', 'is', null)

  // Queue WhatsApp messages via Meta API
  await inngest.send({
    name: 'whatsapp/bulk-send',
    data: {
      tenant_id: tenantId,
      recipients: clients.map(c => ({
        id: c.id,
        phone: c.phone,
        name: c.full_name,
      })),
      template_id,
      custom_message,
      triggered_by: userId,
    },
  })

  return NextResponse.json({
    success: true,
    queued: clients.length,
    skipped: client_ids.length - clients.length, // No phone
  })
}
```

### 3. Bulk Discount API
```typescript
// app/api/clients/bulk-discount/route.ts
export async function POST(request: NextRequest) {
  const {
    client_ids,
    discount_type,  // 'percentage' | 'fixed'
    discount_value,
    valid_days,     // How long the discount lasts
    reason,
  } = await request.json()

  // Create personal coupons for each client
  const coupons = client_ids.map(clientId => ({
    tenant_id: tenantId,
    code: `SEG-${Date.now()}-${clientId.slice(0, 8)}`,
    discount_type,
    discount_value,
    usage_limit: 1,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: clientId,
    reason,
    created_by: userId,
  }))

  const { data: created } = await supabase
    .from('store_coupons')
    .insert(coupons)
    .select()

  // Optionally notify clients about their discount
  await inngest.send({
    name: 'notification/discount-assigned',
    data: {
      coupons: created,
      notify_via: ['email', 'app'],
    },
  })

  return NextResponse.json({
    success: true,
    created: created.length,
  })
}
```

### 4. Export API
```typescript
// app/api/clients/export/route.ts
export async function POST(request: NextRequest) {
  const { client_ids, fields, format } = await request.json()

  const { data: clients } = await supabase
    .from('profiles')
    .select(fields.join(','))
    .in('id', client_ids)
    .eq('tenant_id', tenantId)

  if (format === 'csv') {
    const csv = generateCSV(clients, fields)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=clientes-${Date.now()}.csv`,
      },
    })
  }

  if (format === 'xlsx') {
    const xlsx = await generateXLSX(clients, fields)
    return new Response(xlsx, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=clientes-${Date.now()}.xlsx`,
      },
    })
  }

  return NextResponse.json(clients)
}
```

### 5. UI Modals
```typescript
// components/clients/bulk-actions/
// - BulkEmailModal.tsx
// - BulkWhatsAppModal.tsx
// - BulkDiscountModal.tsx
// - ExportModal.tsx
```

## Implementation Steps
1. Create API routes for each bulk action
2. Create Inngest functions for async processing
3. Create UI modals for action configuration
4. Update segment page to use modals
5. Add progress tracking for bulk operations
6. Add audit logging for bulk actions

## Acceptance Criteria
- [ ] Bulk email sends to selected clients
- [ ] Bulk WhatsApp sends with template selection
- [ ] Bulk discount creates personal coupons
- [ ] Export generates CSV/XLSX files
- [ ] Progress shown for large operations
- [ ] Audit log captures all bulk actions

## Related Files
- `web/app/[clinic]/dashboard/clients/segments/page.tsx`
- `web/app/api/clients/bulk-email/route.ts` (new)
- `web/app/api/clients/bulk-whatsapp/route.ts` (new)
- `web/app/api/clients/bulk-discount/route.ts` (new)
- `web/app/api/clients/export/route.ts` (new)
- `web/components/clients/bulk-actions/*.tsx` (new)

## Estimated Effort
- API routes: 6 hours
- Inngest functions: 4 hours
- UI modals: 4 hours
- Integration: 2 hours
- Testing: 2 hours
- **Total: 18 hours**

---
*Ticket created: January 2026*
*Based on incomplete feature analysis*
