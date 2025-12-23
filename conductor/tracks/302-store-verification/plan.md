# Plan: Store Verification

## Phase 1: Database & Backend

- [ ] **Task 1**: View `process_checkout` RPC (in `web/db/60_store/03_checkout_rpc.sql`) to see if it accepts prescription data.
- [ ] **Task 2**: Modify `process_checkout` to raise an exception if a restricted item is missing a prescription link.

## Phase 2: Frontend Implementation

- [ ] **Task 1**: Update `CartContext` to support storing `permissions/attachments` per item.
- [ ] **Task 2**: Update `ProductDetails` page to show upload field for restricted items.
- [ ] **Task 3**: Update `Checkout` page to display validation errors if prescription is missing.

## Phase 3: Verification

- [ ] **Task 1**: Try to buy a restricted item without file (Should Fail).
- [ ] **Task 2**: Buy with file (Should Pass).
