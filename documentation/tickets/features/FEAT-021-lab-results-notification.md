# FEAT-021: Lab Results Notification

## Priority: P2 - Medium
## Category: Feature
## Status: Not Started
## Epic: [EPIC-05: Notifications](../epics/EPIC-05-notifications.md)
## Affected Areas: Laboratory, Notifications, Communications

## Description

Notify pet owners when lab results are ready and alert veterinarians immediately for critical values.

## Source

Derived from `documentation/feature-gaps/INCOMPLETE_FEATURES_ANALYSIS.md` (TICKET-015)

## Context

> **Lab module**: Full order → results workflow
> **Database**: `lab_results` with `is_abnormal` flag
> **Missing**: Notification when results ready

## Current State

- Full lab workflow from order to results entry
- Results have `is_abnormal` flag for flagging values
- No automatic notification when results are ready
- No critical value alerting
- Owner must check portal manually

## Proposed Solution

### 1. Notify on Results Complete

```typescript
// api/lab-orders/[id]/complete/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  // Auth check...

  // Update order status
  await supabase
    .from('lab_orders')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', params.id);

  // Get order with pet/owner info
  const { data: order } = await supabase
    .from('lab_orders')
    .select(`
      *,
      pet:pets(name, owner:profiles(email, phone, full_name)),
      results:lab_results(is_abnormal, is_critical)
    `)
    .eq('id', params.id)
    .single();

  // Check for critical values
  const hasCritical = order.results.some(r => r.is_critical);
  const hasAbnormal = order.results.some(r => r.is_abnormal);

  // Notify vet immediately if critical
  if (hasCritical) {
    await notifyVet(order.ordered_by, {
      type: 'critical_lab_result',
      orderId: params.id,
      petName: order.pet.name,
    });
  }

  // Notify owner
  await notifyOwner(order.pet.owner.id, {
    type: 'lab_results_ready',
    petName: order.pet.name,
    hasAbnormal,
    link: `/portal/pets/${order.pet_id}/lab/${params.id}`,
  });

  return NextResponse.json({ success: true });
}
```

### 2. Owner Notification

```typescript
// lib/notifications/lab-results.ts
export async function notifyLabResultsReady(
  owner: { email: string; phone: string; full_name: string },
  data: { petName: string; hasAbnormal: boolean; link: string }
) {
  // Email
  await sendEmail({
    to: owner.email,
    subject: `Resultados de laboratorio listos para ${data.petName}`,
    template: 'lab-results-ready',
    data: {
      ownerName: owner.full_name,
      petName: data.petName,
      hasAbnormal: data.hasAbnormal,
      viewLink: data.link,
    },
  });

  // WhatsApp
  await sendWhatsApp({
    to: owner.phone,
    template: 'lab_results_ready',
    params: [data.petName, data.hasAbnormal ? 'con valores a revisar' : ''],
  });
}
```

### 3. Critical Value Alert to Vet

```typescript
// lib/notifications/critical-alert.ts
export async function alertCriticalLabValue(
  vetId: string,
  data: { orderId: string; petName: string; criticalTests: string[] }
) {
  // Immediate push notification / app alert
  await createNotification({
    user_id: vetId,
    title: 'ALERTA: Valor Crítico de Laboratorio',
    message: `${data.petName} tiene valores críticos: ${data.criticalTests.join(', ')}`,
    priority: 'critical',
    link: `/dashboard/lab/${data.orderId}`,
  });

  // Also send WhatsApp for immediate attention
  const vet = await getProfile(vetId);
  await sendWhatsApp({
    to: vet.phone,
    template: 'critical_lab_alert',
    params: [data.petName, data.criticalTests.join(', ')],
  });
}
```

### 4. Email Results Button

```typescript
// components/lab/email-results-button.tsx
export function EmailResultsButton({ orderId }: { orderId: string }) {
  const sendResults = async () => {
    const result = await emailLabResults(orderId);
    if (result.success) {
      toast.success('Resultados enviados por email');
    }
  };

  return (
    <Button onClick={sendResults}>
      <Mail className="h-4 w-4 mr-2" />
      Enviar por Email
    </Button>
  );
}
```

### 5. Email Results Action

```typescript
// actions/lab.ts
export const emailLabResults = withActionAuth(
  async ({ supabase }, orderId: string) => {
    const { data: order } = await supabase
      .from('lab_orders')
      .select(`
        *,
        pet:pets(name, owner:profiles(email, full_name)),
        results:lab_results(*, test:lab_test_catalog(name))
      `)
      .eq('id', orderId)
      .single();

    // Generate results PDF
    const pdf = await generateLabResultsPDF(order);

    // Send email with attachment
    await sendEmail({
      to: order.pet.owner.email,
      subject: `Resultados de laboratorio - ${order.pet.name}`,
      template: 'lab-results-email',
      attachments: [{
        filename: `resultados-${orderId}.pdf`,
        content: pdf,
      }],
      data: {
        petName: order.pet.name,
        ownerName: order.pet.owner.full_name,
        orderDate: formatDate(order.ordered_at),
      },
    });

    return actionSuccess();
  },
  { requireStaff: true }
);
```

## Implementation Steps

1. [ ] Create notification on lab order completion
2. [ ] Implement owner email notification
3. [ ] Implement owner WhatsApp notification
4. [ ] Create critical value alert for vets
5. [ ] Add "Email Results" button to lab order page
6. [ ] Create results email template
7. [ ] Generate results PDF for email attachment
8. [ ] Test notification flow end-to-end

## Acceptance Criteria

- [ ] Owner gets notification (email + WhatsApp) when results ready
- [ ] Vet alerted immediately for critical values
- [ ] "Email Results" button works with PDF attachment
- [ ] Notification links directly to results page
- [ ] Abnormal values flagged in notification
- [ ] All text in Spanish

## Related Files

- `web/app/api/lab-orders/[id]/results/route.ts` - Results entry
- `web/app/[clinic]/dashboard/lab/[id]/page.tsx` - Results view
- `web/lib/notifications/` - Notification utilities

## Estimated Effort

- Auto-notification: 3 hours
- Critical alerts: 2 hours
- Email results: 3 hours
- PDF generation: 2 hours
- Testing: 2 hours
- **Total: 12 hours (1.5 days)**

---
*Created: January 2026*
*Derived from INCOMPLETE_FEATURES_ANALYSIS.md*
