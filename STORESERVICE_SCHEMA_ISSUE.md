# StoreService Schema Mismatch Issue

**Date Discovered**: 2026-01-15 23:00  
**Severity**: Medium  
**Status**: Blocking StoreService prescription-related features

---

## Problem Summary

The StoreService implementation expects an `is_prescription_required` column in `store_products` table that doesn't exist in the actual database schema.

## Schema Mismatch Details

### StoreService Expects (Code)

```typescript
interface Product {
  id: string;
  tenant_id: string;
  category_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  base_price: number;
  is_active: boolean;
  is_prescription_required: boolean;  // ❌ NOT IN DATABASE
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### Actual Database Schema (Migrations)

```sql
CREATE TABLE "store_products" (
  "id" uuid PRIMARY KEY,
  "tenant_id" text,
  "category_id" uuid,
  "brand_id" uuid,
  "sku" text,
  "barcode" text,
  "name" text NOT NULL,
  "description" text,
  "base_price" numeric(12, 2) NOT NULL,
  "is_active" boolean DEFAULT true,
  -- NO is_prescription_required column
  -- ... other columns
);
```

### Missing Column

❌ `is_prescription_required` (boolean)

---

## Impact

1. **Cannot create products in tests** - Insert fails with "column not found"
2. **Prescription verification will fail** - Service checks this field during checkout
3. **StoreService tests blocked** - Cannot verify prescription-related features

---

## Workaround for Testing

Remove `is_prescription_required` from test data:

```javascript
// Instead of:
await supabase.from('store_products').insert({
  name: 'Test Product',
  is_prescription_required: false,  // ❌ Fails
});

// Use:
await supabase.from('store_products').insert({
  name: 'Test Product',
  // Omit is_prescription_required
});
```

---

## Solutions

### Option A: Add Column to Database (Recommended)

Create migration:

```sql
-- Migration: Add prescription requirement to products
ALTER TABLE store_products
  ADD COLUMN is_prescription_required BOOLEAN DEFAULT false;

-- Add index for filtering
CREATE INDEX idx_store_products_prescription 
  ON store_products(is_prescription_required) 
  WHERE is_prescription_required = true;
```

**Pros**:
- Simple and straightforward
- Matches service expectations
- Enables prescription verification feature

**Cons**:
- Adds denormalized column
- Existing products default to false

### Option B: Use Store Order Items Table

The database already has `requires_prescription` on `store_order_items`:

```sql
CREATE TABLE "store_order_items" (
  -- ...
  "requires_prescription" boolean DEFAULT false,
  "prescription_file_url" text,
);
```

Modify StoreService to check order items instead of products.

**Pros**:
- Uses existing schema
- More flexible (can vary by order)

**Cons**:
- More complex service logic
- Can't filter products by prescription requirement

### Option C: Skip Prescription Features for MVP

Remove prescription checks from StoreService for Core MVP, add in Phase 2.

**Pros**:
- Unblocks testing immediately
- Can refactor properly later

**Cons**:
- Loses important feature
- Tests incomplete

---

## Recommendation

**Option A** - Add the column.

**Why**:
1. Simple fix
2. Important feature for vet clinic e-commerce
3. Matches service implementation
4. Can be tested properly

---

## Files Affected

- `web/lib/services/store-service.ts` (uses `is_prescription_required`)
- `web/tests/integration/services/store-service.integration.test.ts` (25 tests)
- `web/test-storeservice-real.mjs` (verification script)

---

## Current Workaround

Tests can be modified to:
1. Remove `is_prescription_required` from product creation
2. Skip prescription-related test cases
3. Run remaining cart/checkout tests without prescription verification

---

**Status**: Lower priority than PaymentService issue  
**Recommendation**: Fix PaymentService first, then address this  
**Estimated Fix Time**: 10 minutes (migration + verification)

---

*Related: PAYMENTSERVICE_SCHEMA_ISSUE.md (similar root cause)*
