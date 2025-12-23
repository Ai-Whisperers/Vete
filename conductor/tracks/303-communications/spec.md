# Track 303: Communications Integration

## Goal

Enable email delivery for critical clinical documents (Consent Forms, Lab Results) directly from the dashboard.

## Context

- **TICKET-005**: Consent forms are generated but "Send Email" does nothing.
- **TICKET-015**: Lab results are uploaded but owners aren't notified.
- We have a `lib/email/client.ts` using Resend, and a PDF generator endpoint now (`api/invoices/[id]/pdf`).

## Requirements

1.  **Consent Forms**:
    - Send signed consent PDF to owner's email.
2.  **Lab Results**:
    - Send notification + attachment to owner when results are ready.
3.  **Backend**:
    - Create/Update API endpoints to handle the "Send" action.

## Acceptance Criteria

- [ ] Clicking "Email" on a Consent Form sends the PDF to the owner.
- [ ] Owner receives the actual file, not just a notification.
