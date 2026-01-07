# NOTIF-001: Complete Notification System Integration

## Priority: P1 (High)
## Category: Notifications
## Status: Not Started

## Description
Multiple API endpoints have TODO comments for sending notifications to users. A unified notification system needs to be implemented and integrated across all relevant endpoints.

## Current State
The platform has 8 separate locations with `// TODO: Send notification` comments:

### Admin/Platform
1. **`app/api/admin/products/[id]/approve/route.ts:70`**
   - "TODO: Send notification to the clinic that submitted the product"

2. **`app/api/platform/commission-invoices/[id]/send/route.ts:100`**
   - "TODO: Send actual email/notification to clinic"

### Appointments/Waitlist
3. **`app/api/appointments/waitlist/[id]/accept/route.ts:109`**
   - "TODO: Send confirmation notification"

4. **`app/api/appointments/waitlist/[id]/decline/route.ts:94`**
   - "TODO: Notify next person"

5. **`app/api/appointments/waitlist/[id]/offer/route.ts:98`**
   - "TODO: Send notification to owner about available slot"

### Subscriptions/Orders
6. **`app/api/cron/process-subscriptions/route.ts:138`**
   - "TODO: Send notification to customer about stock issue"

7. **`app/api/cron/process-subscriptions/route.ts:249`**
   - "TODO: Send order confirmation email to customer"

### Staff Notifications
8. **`app/api/cron/generate-recurring/route.ts:103`**
   - "TODO: Send notification to staff about recurrences nearing limit"

## Proposed Solution

### 1. Create Unified Notification Service
```typescript
// lib/notifications/service.ts
interface NotificationPayload {
  type: NotificationType;
  recipientId: string;
  recipientType: 'owner' | 'staff' | 'clinic';
  tenantId: string;
  title: string;
  message: string;
  channel: ('email' | 'push' | 'sms' | 'in_app')[];
  data?: Record<string, unknown>;
}

async function sendNotification(payload: NotificationPayload): Promise<void>
```

### 2. Implement Channel Handlers
- Email: Use Resend (already configured)
- In-app: Insert into `notifications` table
- Push: Future - integrate with service worker
- SMS: Future - integrate with Twilio

### 3. Create Notification Templates
```typescript
// lib/notifications/templates/
- product-approved.ts
- waitlist-slot-available.ts
- waitlist-confirmed.ts
- order-confirmation.ts
- subscription-stock-issue.ts
- recurrence-limit-warning.ts
- commission-invoice.ts
```

## Implementation Steps

### Phase 1: Core Service (4 hours)
1. Create `lib/notifications/service.ts` with unified interface
2. Implement email channel using existing Resend setup
3. Implement in-app channel using notifications table
4. Create base notification template structure

### Phase 2: Template Creation (3 hours)
1. Create email templates for each notification type
2. Add Spanish translations for all messages
3. Include clinic branding in email templates

### Phase 3: Integration (4 hours)
1. Replace TODOs with actual notification calls
2. Add error handling and retry logic
3. Add audit logging for sent notifications

### Phase 4: Testing (2 hours)
1. Unit tests for notification service
2. Integration tests for each notification type
3. E2E test for waitlist notification flow

## Acceptance Criteria
- [ ] Unified notification service created
- [ ] Email notifications sent via Resend
- [ ] In-app notifications stored in database
- [ ] All 8 TODO locations replaced with working code
- [ ] Spanish message templates for all notifications
- [ ] Notification preferences respected (from user settings)
- [ ] Audit log of all notifications sent
- [ ] Error handling with retry capability

## Related Files
- `web/lib/notifications/` (new)
- `web/lib/email/` (existing)
- `web/app/api/admin/products/[id]/approve/route.ts`
- `web/app/api/appointments/waitlist/*`
- `web/app/api/cron/process-subscriptions/route.ts`
- `web/app/api/cron/generate-recurring/route.ts`
- `web/app/api/platform/commission-invoices/[id]/send/route.ts`

## Estimated Effort
- Total: 13 hours
- Phase 1: 4 hours
- Phase 2: 3 hours
- Phase 3: 4 hours
- Phase 4: 2 hours

## Dependencies
- Resend API key configured
- Notification preferences table exists
- Email templates infrastructure

---
*Ticket created: January 2026*
*Based on TODO comment analysis*
