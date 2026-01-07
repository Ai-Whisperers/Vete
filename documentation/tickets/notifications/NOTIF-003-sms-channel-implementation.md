# NOTIF-003: SMS Channel Implementation (Twilio)

## Priority: P1 (High) - MVP Required
## Category: Notifications
## Status: Not Started

## Description
SMS sending capability needs to be implemented via Twilio. Currently marked as TODO in the channel sender.

## Current State
**`lib/reminders/channel-sender.ts:111`:**
```typescript
// TODO: Implement dedicated SMS sending via Twilio
```

The existing incomplete implementation exists but doesn't integrate with Twilio.

## Impact
- Vaccine reminders cannot be sent via SMS
- Appointment reminders limited to email only
- Paraguay market expects SMS communication

## Proposed Solution

### 1. Twilio Integration
```typescript
// lib/sms/twilio.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string): Promise<string> {
  // Validate Paraguay phone format (+595)
  const formatted = formatParaguayPhone(to);

  const message = await client.messages.create({
    to: formatted,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: body,
  });

  return message.sid;
}
```

### 2. Phone Number Validation
- Paraguay format: +595 9XX XXX XXX
- Support both landline and mobile
- Auto-format input

### 3. SMS Templates
- Vaccine reminder: "Recordatorio: La vacuna {vaccine} de {pet} vence el {date}"
- Appointment reminder: "Cita en {clinic} mañana a las {time} para {pet}"
- Lost pet alert: "{pet} fue reportado visto en {location}"

## Implementation Steps
1. Set up Twilio account and get credentials
2. Create `lib/sms/twilio.ts` integration
3. Add phone number validation for Paraguay
4. Create SMS templates
5. Integrate with channel-sender.ts
6. Add delivery status tracking
7. Add cost tracking per tenant
8. Write unit tests

## Acceptance Criteria
- [ ] SMS messages sent via Twilio
- [ ] Paraguay phone numbers validated (+595 format)
- [ ] Message delivery status tracked
- [ ] SMS cost tracked per clinic
- [ ] Rate limiting on SMS sends
- [ ] Template support for common messages
- [ ] Delivery failures logged

## Related Files
- `web/lib/sms/twilio.ts` (new)
- `web/lib/reminders/channel-sender.ts`
- `web/lib/validation/phone.ts` (phone validation)

## Environment Variables Required
```
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## Estimated Effort
- Twilio setup: 1 hour
- Integration: 3 hours
- Templates: 1 hour
- Testing: 2 hours
- **Total: 7 hours**

---
*Ticket created: January 2026*
*Based on TODO comment analysis*
