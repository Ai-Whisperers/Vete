# Project Blockers

## ACTIVE BLOCKERS

### BLOCKER-001: StoreService Schema Mismatch (CRITICAL)
**Date Identified**: January 16, 2026  
**Severity**: CRITICAL  
**Status**: ACTIVE  
**Estimated Fix Time**: 3-4 hours

#### Problem
StoreService implementation assumes normalized schema with `store_cart_items` table:
```sql
-- Expected (by code):
store_carts (id, customer_id, tenant_id)
store_cart_items (id, cart_id, product_id, quantity, unit_price)
```

**Actual schema** uses denormalized JSONB column:
```sql
-- Actual (in database):
store_carts (id, customer_id, tenant_id, items JSONB)
```

Where `items` is a JSONB array like:
```json
[
  {
    "id": "uuid",
    "sku": "PRODUCT-SKU",
    "name": "Product Name",
    "type": "product",
    "price": 25000,
    "quantity": 1,
    "stock": 5
  }
]
```

#### Impact
- ❌ `addToCart()` - Fails with "table store_cart_items not found"
- ❌ `updateCartItem()` - Cannot update quantities
- ❌ `removeFromCart()` - Cannot remove items
- ❌ `getCart()` - Returns empty items array
- ❌ `checkout()` - Cart appears empty, blocks order creation

**All cart and checkout functionality is broken.**

#### Root Cause
Service layer was implemented without verifying actual database schema. Likely based on assumptions or outdated ERD.

#### Discovery Process
1. ✅ Fixed foreign key issue (use real user profiles)
2. ✅ Fixed inventory array access bug
3. 🚨 Discovered table doesn't exist when adding cart items

#### Solution Options

**Option A: Rewrite StoreService for JSONB (Recommended)**  
Time: 3-4 hours  
- Update `addToCart()` to append to JSONB array
- Update `updateCartItem()` to modify array element
- Update `removeFromCart()` to filter array
- Add proper JSONB query methods
- Update TypeScript types to match actual schema
- Re-run all tests

**Option B: Create Migration to Add store_cart_items Table**  
Time: 2-3 hours + data migration risk  
- Create new table with foreign keys
- Migrate existing cart data from JSONB to table
- Risk of data loss if migration fails
- Need downtime for migration
- NOT RECOMMENDED (would break existing carts)

**Option C: Hybrid Approach**  
Time: 5-6 hours  
- Support both schemas with feature flag
- Too complex for MVP phase

#### Recommendation
**Proceed with Option A** - Rewrite StoreService for JSONB schema.

**Reasoning**:
1. JSONB approach is already in production
2. No data migration risk
3. Faster queries (no joins needed)
4. Better for cart use case (atomic updates)

#### Dependencies
- Blocks: Day 1 MVP Testing (StoreService)
- Blocks: Integration tests for store module
- Blocks: E2E tests for checkout flow

#### Next Steps
1. Update `web/lib/services/store-service.ts` cart methods
2. Update test `web/test-storeservice-real.mjs` 
3. Update TypeScript types in `web/lib/types/entities/`
4. Re-run tests until passing
5. Document JSONB cart operations

#### Testing Checklist
- [ ] Add product to empty cart (creates cart + item)
- [ ] Add same product again (increments quantity)
- [ ] Add different product (appends to array)
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Checkout with cart items
- [ ] Verify cart cleared after checkout

#### Files Affected
- `web/lib/services/store-service.ts` (lines 248-484)
- `web/test-storeservice-real.mjs` (lines 104-262)
- `web/lib/types/entities/cart.ts` (if exists)
- `web/tests/integration/services/store-service.integration.test.ts`

---

## RESOLVED BLOCKERS

(None yet)
