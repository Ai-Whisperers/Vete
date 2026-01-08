# AUDIT-105a: Notification System TODO Resolution

## Priority: P1 - High
## Category: Technical Debt / Feature Completion
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Parent Ticket: [AUDIT-105](./AUDIT-105-todo-comment-resolution.md)

## Description

Six TODO comments relate to missing notification functionality. These represent incomplete user communication flows that impact the user experience.

## Affected TODOs

| File | Line | TODO | Impact |
|------|------|------|--------|
| `api/admin/products/[id]/approve/route.ts` | 70 | Send notification to clinic that submitted the product | Medium - Clinic doesn't know product was approved |
| `api/appointments/waitlist/[id]/decline/route.ts` | 94 | Notify next person in waitlist | High - Next person misses their chance |
| `api/appointments/waitlist/[id]/accept/route.ts` | 109 | Send confirmation notification | High - User doesn't get confirmation |
| `api/cron/process-subscriptions/route.ts` | 348 | Send order confirmation email to customer | High - No order confirmation |
| `api/cron/generate-recurring/route.ts` | 96 | Send notification to staff about recurrences nearing limit | Low - Staff may not prepare |
| `api/platform/commission-invoices/[id]/send/route.ts` | 100 | Send actual email/notification to clinic | High - Clinic doesn't receive invoice |

## Proposed Solution

### 1. Create Notification Service

```typescript
// lib/services/notification-service.ts
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

export type NotificationType =
  | 'product_approved'
  | 'waitlist_slot_available'
  | 'waitlist_confirmation'
  | 'subscription_order_confirmation'
  | 'recurring_limit_warning'
  | 'commission_invoice'

interface NotificationPayload {
  type: NotificationType
  recipientId?: string
  recipientEmail?: string
  tenantId: string
  data: Record<string, unknown>
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const supabase = await createClient()

  // 1. Create in-app notification
  await supabase.from('notifications').insert({
    user_id: payload.recipientId,
    tenant_id: payload.tenantId,
    type: payload.type,
    title: getNotificationTitle(payload.type),
    message: formatNotificationMessage(payload),
    data: payload.data,
  })

  // 2. Send email if email provided
  if (payload.recipientEmail) {
    await sendEmail({
      to: payload.recipientEmail,
      template: payload.type,
      data: payload.data,
    })
  }
}
```

### 2. Implementation per TODO

#### Product Approval Notification
```typescript
// In api/admin/products/[id]/approve/route.ts:70
await sendNotification({
  type: 'product_approved',
  recipientId: product.submitted_by,
  recipientEmail: clinic.email,
  tenantId: product.tenant_id,
  data: { productName: product.name, productId: product.id }
})
```

#### Waitlist Decline → Notify Next
```typescript
// In api/appointments/waitlist/[id]/decline/route.ts:94
const nextInWaitlist = await getNextWaitlistEntry(appointmentId)
if (nextInWaitlist) {
  await sendNotification({
    type: 'waitlist_slot_available',
    recipientId: nextInWaitlist.user_id,
    recipientEmail: nextInWaitlist.email,
    tenantId: nextInWaitlist.tenant_id,
    data: {
      serviceName: appointment.service.name,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hour window
    }
  })
}
```

#### Waitlist Accept Confirmation
```typescript
// In api/appointments/waitlist/[id]/accept/route.ts:109
await sendNotification({
  type: 'waitlist_confirmation',
  recipientId: waitlistEntry.user_id,
  recipientEmail: waitlistEntry.email,
  tenantId: waitlistEntry.tenant_id,
  data: {
    serviceName: appointment.service.name,
    appointmentTime: appointment.start_time,
    appointmentId: appointment.id
  }
})
```

#### Subscription Order Confirmation
```typescript
// In api/cron/process-subscriptions/route.ts:348
await sendNotification({
  type: 'subscription_order_confirmation',
  recipientId: subscription.user_id,
  recipientEmail: customer.email,
  tenantId: subscription.tenant_id,
  data: {
    orderNumber: order.order_number,
    items: order.items,
    total: order.total,
    nextRenewal: subscription.next_renewal_date
  }
})
```

#### Recurring Appointment Limit Warning
```typescript
// In api/cron/generate-recurring/route.ts:96
if (recurrence.remaining_count <= 3) {
  await sendNotification({
    type: 'recurring_limit_warning',
    recipientId: null, // Send to all staff
    tenantId: recurrence.tenant_id,
    data: {
      clientName: client.name,
      petName: pet.name,
      serviceName: service.name,
      remainingCount: recurrence.remaining_count
    }
  })
}
```

#### Commission Invoice Send
```typescript
// In api/platform/commission-invoices/[id]/send/route.ts:100
await sendNotification({
  type: 'commission_invoice',
  recipientEmail: clinic.billing_email || clinic.email,
  tenantId: invoice.tenant_id,
  data: {
    invoiceNumber: invoice.invoice_number,
    amount: invoice.amount,
    period: `${invoice.period_start} - ${invoice.period_end}`,
    dueDate: invoice.due_date
  }
})
```

## Implementation Steps

1. [ ] Create `lib/services/notification-service.ts`
2. [ ] Create email templates for each notification type
3. [ ] Implement product approval notification
4. [ ] Implement waitlist decline notification
5. [ ] Implement waitlist accept confirmation
6. [ ] Implement subscription order confirmation
7. [ ] Implement recurring limit warning
8. [ ] Implement commission invoice notification
9. [ ] Add notification preferences (opt-out for non-critical)
10. [ ] Test all notification flows

## Acceptance Criteria

- [ ] All 6 TODO comments removed
- [ ] Notification service created with type safety
- [ ] Email templates exist for each type
- [ ] In-app notifications created in `notifications` table
- [ ] Critical notifications (order confirmation, waitlist) always sent
- [ ] Non-critical notifications respect user preferences
- [ ] Error handling doesn't break main flow

## Email Templates Required

| Type | Subject | Body Summary |
|------|---------|--------------|
| product_approved | "Tu producto fue aprobado" | Product name, next steps |
| waitlist_slot_available | "Hay un turno disponible" | Service, expiry time, CTA |
| waitlist_confirmation | "Tu turno fue confirmado" | Service, date/time, location |
| subscription_order_confirmation | "Confirmación de tu pedido" | Order details, next renewal |
| recurring_limit_warning | "Recurrencia próxima a vencer" | Client, remaining count |
| commission_invoice | "Factura de comisión" | Amount, period, due date |

## Estimated Effort

- Notification service: 3-4 hours
- Email templates: 2-3 hours
- Integration (6 locations): 3-4 hours
- Testing: 2-3 hours
- **Total**: 10-14 hours

## Dependencies

- Email provider configured (likely already exists via `lib/email`)
- `notifications` table exists
- Waitlist system must be stable

## Risk Assessment

- **Medium risk** - Touches multiple critical flows
- Failure should not break the main operation (use try/catch)
- Test email delivery in staging before production
- Consider rate limiting for bulk operations
