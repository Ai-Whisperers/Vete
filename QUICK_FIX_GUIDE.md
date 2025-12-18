# Quick Fix Guide: Stock Decrement Issues

## Problem
Stock wasn't being decremented when customers purchased products.

## Solution
Database migration that fixes product lookup in checkout function.

## Apply Fix (2 minutes)

### 1. Run Database Migration
```bash
# Option A: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of web/db/100_fix_checkout_product_lookup.sql
# 3. Execute

# Option B: Via psql
psql $DATABASE_URL -f web/db/100_fix_checkout_product_lookup.sql

# Option C: Via Supabase CLI
supabase db push
```

### 2. Verify Migration Applied
```sql
-- Check function exists and has correct signature
SELECT
    proname,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'process_checkout';

-- Expected output:
-- proname: process_checkout
-- arguments: p_tenant_id text, p_user_id uuid, p_items jsonb, p_notes text DEFAULT NULL
```

### 3. Test with Sample Purchase
```bash
# 1. Add product to cart (any product)
# 2. Note current stock: SELECT stock_quantity FROM store_inventory WHERE product_id = '...';
# 3. Complete checkout
# 4. Verify stock decreased: SELECT stock_quantity FROM store_inventory WHERE product_id = '...';
# 5. Verify transaction logged:
SELECT * FROM store_inventory_transactions
WHERE type = 'sale'
ORDER BY created_at DESC
LIMIT 1;
```

## Quick Test Checklist

- [ ] Migration applied successfully
- [ ] Function `process_checkout` exists
- [ ] Test purchase decrements stock
- [ ] Insufficient stock shows error
- [ ] Invoice created on success
- [ ] Transaction logged in store_inventory_transactions

## Rollback (if needed)
```sql
-- Restore previous version (has the bug, but functional)
\i web/db/88_fix_checkout_schema_mismatch.sql
```

## Files Changed
- ✅ `web/db/100_fix_checkout_product_lookup.sql` (created)
- ✅ `web/app/api/store/checkout/route.ts` (documentation added)
- ✅ No client changes needed

## What Changed
- **Before**: Looked up products by SKU (cart sends UUID, so never matched)
- **After**: Looks up products by UUID (correct match, stock decrements)

## Success Indicators
```sql
-- Check recent sales have stock movements
SELECT
    i.invoice_number,
    i.created_at,
    ii.description,
    ii.quantity as sold,
    sit.quantity as stock_change
FROM invoices i
JOIN invoice_items ii ON ii.invoice_id = i.id
LEFT JOIN store_inventory_transactions sit
    ON sit.reference_id = i.id
    AND sit.type = 'sale'
WHERE i.created_at > NOW() - INTERVAL '1 hour'
ORDER BY i.created_at DESC;

-- Should show matching quantities (negative in stock_change)
```

## Support
Questions? Check full documentation: `FIXES_BIZ_003_004.md`
