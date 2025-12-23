# Track 302: Store Verification

## Goal

Prevent the purchase of prescription-only items without a valid veterinary prescription.

## Context

- **TICKET-006**: Products can be marked as `prescription_required`, but the Checkout logic (`process_checkout` RPC or frontend) doesn't enforce this.
- We need a mechanism to upload/select a prescription file during the add-to-cart or checkout process.

## Requirements

1.  **Cart Validation**:
    - If a cart item has `prescription_required: true`, the user must attach a prescription ID or File URL.
2.  **Checkout Enforcement**:
    - Backend (`process_checkout`) must verify that `prescription_required` items have an associated `prescription_url` or `prescription_id`.
3.  **UI Update**:
    - Store Product Page: Show "Requires Prescription" badge.
    - Add to Cart: Prompt for upload if required.

## Acceptance Criteria

- [ ] Cannot checkout restricted items without a prescription.
- [ ] Prescription file is linked to the generated invoice/order.
