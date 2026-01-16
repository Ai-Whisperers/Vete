# PaymentService Schema Mismatch Issue

**Date Discovered**: 2026-01-15 22:35  
**Severity**: High  
**Status**: Blocking PaymentService testing

---

## Problem Summary

The PaymentService implementation code does NOT match the actual database schema. The service was written for an idealized future schema that doesn't exist yet.

## Schema Mismatch Details

### PaymentService Expects (Code)

```typescript
interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod; // 'cash' | 'card' | 'bank_transfer' | 'stripe'
  status: PaymentStatus;
  transaction_reference: string | null;
  stripe_payment_intent_id: string | null;
  notes: string | null;
  payment_date: string;
  created_at: string;
  updated_at: string;
}
```

### Actual Database Schema (Migrations)

```sql
CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" text NOT NULL,
  "invoice_id" uuid NOT NULL,
  "payment_number" text,
  "payment_date" date DEFAULT CURRENT_DATE NOT NULL,
  "amount" numeric(12, 2) NOT NULL,
  "payment_method_id" uuid,           -- ❌ NOT 'method'
  "payment_method_name" text,         -- ❌ NOT 'method'
  "reference_number" text,            -- ❌ NOT 'transaction_reference'
  "authorization_code" text,
  "status" text DEFAULT 'completed' NOT NULL,
  "notes" text,
  "received_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

### Missing Columns

❌ `method` (PaymentMethod type)  
❌ `transaction_reference`  
❌ `stripe_payment_intent_id`

### Columns Not in Service

❌ `payment_method_id` (UUID foreign key)  
❌ `payment_method_name` (text)  
❌ `reference_number` (different from transaction_reference)  
❌ `authorization_code`  
❌ `received_by` (UUID)  
❌ `payment_number` (text)

---

## Impact

1. **PaymentService cannot be tested** - All database operations fail with "column not found" errors
2. **Integration tests will fail** - Tests expect columns that don't exist
3. **API routes using PaymentService will fail** - Service code incompatible with database

---

## Root Cause

The PaymentService was implemented as part of the "Core MVP" service layer refactoring, but:
- It was written assuming a simplified schema
- The actual database has a more complex structure with payment_methods table
- No migration was created to match the service expectations

---

## Solutions

### Option A: Update Database Schema (Recommended)

Create migration to add missing columns:

```sql
-- Migration: Add PaymentService columns
ALTER TABLE payments
  ADD COLUMN method TEXT,
  ADD COLUMN transaction_reference TEXT,
  ADD COLUMN stripe_payment_intent_id TEXT;

-- Add constraint for method
ALTER TABLE payments
  ADD CONSTRAINT payments_method_check 
  CHECK (method IN ('cash', 'card', 'bank_transfer', 'stripe'));

-- Create index for Stripe lookups
CREATE INDEX idx_payments_stripe_intent 
  ON payments(stripe_payment_intent_id) 
  WHERE stripe_payment_intent_id IS NOT NULL;
```

**Pros**:
- Matches service code
- Simpler for MVP
- Backward compatible (keep existing columns)

**Cons**:
- Denormalized (both method column and payment_method_id)
- Need to migrate existing data

### Option B: Rewrite PaymentService to Match Database

Update `web/lib/services/payment-service.ts` to use actual schema:

```typescript
// Use payment_method_id and payment_method_name instead of method
// Use reference_number instead of transaction_reference
// Remove stripe_payment_intent_id (use billing_payment_transactions table)
```

**Pros**:
- No database changes needed
- Uses proper normalization

**Cons**:
- More complex service code
- Requires payment_methods table joins
- Breaks existing API assumptions

### Option C: Skip PaymentService for Core MVP

Defer payment functionality to Phase 2:

**Pros**:
- Move forward with testable services (PetService, StoreService)
- Revisit payments after MVP complete

**Cons**:
- Payments are core functionality
- Integration tests incomplete

---

## Recommendation

**Option A** - Add migration to match PaymentService expectations.

**Why**:
1. Core MVP needs working payments
2. Service code already written and tested
3. Migration is straightforward
4. Can refactor to normalized schema in Phase 2

---

## Action Items

- [ ] Create migration: `web/db/migrations/063_add_payment_service_columns.sql`
- [ ] Run migration on dev database
- [ ] Verify PaymentService tests pass
- [ ] Update payment API routes if needed
- [ ] Document in CORE_MVP_ISSUES.md

---

## Files Affected

- `web/lib/services/payment-service.ts` (432 lines)
- `web/tests/integration/services/payment-service.integration.test.ts` (17 tests)
- `web/test-paymentservice-real.mjs` (verification script)
- All API routes using payments

---

## Test Results

**Standalone Verification**: ❌ FAILED  
**Error**: `Could not find the 'method' column of 'payments' in the schema cache`

**Integration Tests**: ⏸️ NOT RUN (will fail with same error)

---

**Next Step**: Create migration or skip to StoreService testing.

**Decision Point**: This requires user input on approach.
