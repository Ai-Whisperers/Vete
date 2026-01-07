# NOTIF-002: Email Sending Integration

## Priority: P1 (High)
## Category: Notifications
## Status: Not Started

## Description
Invoice and billing emails are marked as "sent" in the database but the actual email sending is not implemented. This creates a false positive where users think invoices were emailed but they weren't.

## Current State
**`app/api/billing/invoices/[id]/send/route.ts`:**
- Line 35: `// TODO: Add admin session validation as alternative`
- Line 120: `// TODO: Actually send email via Resend/SendGrid`

The current implementation:
```typescript
// Currently just logs and marks as sent - DOES NOT SEND EMAIL
console.log(`Would send invoice ${id} to ${invoice.client_email}`);
await supabase.from('invoices').update({ sent_at: new Date() }).eq('id', id);
```

## Impact
- Clinics believe invoices are being sent but clients never receive them
- Lost revenue from unpaid invoices
- Poor customer experience

## Proposed Solution

### 1. Integrate Resend Email Service
```typescript
// Use existing Resend setup in lib/email/
import { Resend } from 'resend';
import { InvoiceEmailTemplate } from '@/lib/email/templates/invoice';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: `${clinic.name} <invoices@${clinic.domain || 'vete.app'}>`,
  to: invoice.client_email,
  subject: `Factura #${invoice.invoice_number} - ${clinic.name}`,
  react: InvoiceEmailTemplate({ invoice, clinic }),
});
```

### 2. Create Invoice Email Template
- Professional invoice summary
- Clinic branding (logo, colors)
- Invoice line items table
- Total and payment info
- Payment link/instructions
- PDF attachment option

### 3. Add Delivery Tracking
- Store email message ID from Resend
- Track delivery status via webhook
- Show delivery status in dashboard

## Implementation Steps
1. Create `lib/email/templates/invoice.tsx` email template
2. Update `app/api/billing/invoices/[id]/send/route.ts` to use Resend
3. Add invoice PDF as email attachment (optional)
4. Add delivery status tracking
5. Add webhook handler for email status updates
6. Update dashboard to show email delivery status
7. Add tests for email sending

## Acceptance Criteria
- [ ] Invoices actually sent via Resend when "Send" is clicked
- [ ] Email includes professional invoice summary
- [ ] Clinic branding in email (logo, name, contact)
- [ ] Invoice number and total clearly displayed
- [ ] Sent emails tracked with message ID
- [ ] Delivery failures logged and shown to staff
- [ ] Spanish email content

## Related Files
- `web/app/api/billing/invoices/[id]/send/route.ts`
- `web/lib/email/templates/` (new invoice template)
- `web/lib/email/resend.ts` (existing setup)

## Estimated Effort
- Template creation: 2 hours
- Integration: 2 hours
- Status tracking: 2 hours
- Testing: 1 hour
- **Total: 7 hours**

## Environment Variables Required
```
RESEND_API_KEY=re_xxxxx
```

---
*Ticket created: January 2026*
*Based on TODO comment analysis*
