# FEAT-014: Store Order Variant Names

## Priority: P3 - Low
## Category: Feature
## Status: Not Started
## Epic: [EPIC-08: Feature Completion](../epics/EPIC-08-feature-completion.md)
## Affected Areas: E-Commerce, Orders, Store

## Description

Save and display product variant names in order items for better order history and receipts.

## Source

Derived from `documentation/feature-gaps/INCOMPLETE_FEATURES_ANALYSIS.md` (TICKET-007)

## Context

> **TODO in code**: `api/store/orders/route.ts:179` - "variant_name: null, // TODO: Get variant name if variant_id provided"
> **Impact**: Order history shows null for variant names

## Current State

- Products can have variants (size, color, etc.)
- When ordering, `variant_id` is saved but `variant_name` is null
- Order history doesn't show which variant was purchased
- Order confirmations lack variant detail

## Proposed Solution

### 1. Update Order Creation API

```typescript
// api/store/orders/route.ts
const orderItems = await Promise.all(
  cartItems.map(async (item) => {
    let variantName = null;

    if (item.variant_id) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('name')
        .eq('id', item.variant_id)
        .single();

      variantName = variant?.name;
    }

    return {
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      variant_name: variantName, // Now populated
      quantity: item.quantity,
      unit_price: item.unit_price,
    };
  })
);
```

### 2. Display in Order History

```typescript
// components/store/order-item.tsx
<div className="flex justify-between">
  <div>
    <span className="font-medium">{item.product_name}</span>
    {item.variant_name && (
      <span className="text-muted-foreground ml-2">
        - {item.variant_name}
      </span>
    )}
  </div>
  <span>{formatCurrency(item.unit_price)}</span>
</div>
```

### 3. Order Confirmation Email

```html
<!-- Include variant in confirmation -->
<tr>
  <td>{{product_name}}{{#if variant_name}} - {{variant_name}}{{/if}}</td>
  <td>{{quantity}}</td>
  <td>{{unit_price}}</td>
</tr>
```

## Implementation Steps

1. [ ] Update order creation to fetch variant name
2. [ ] Modify order items insert to include variant_name
3. [ ] Update order history display components
4. [ ] Update order confirmation email template
5. [ ] Backfill existing orders with variant names (optional migration)

## Acceptance Criteria

- [ ] Variant name saved with order item when variant selected
- [ ] Order confirmation shows "Product - Variant" format
- [ ] Order history displays variant info
- [ ] Invoice/receipt includes variant details
- [ ] Works for products without variants (null is acceptable)

## Related Files

- `web/app/api/store/orders/route.ts:179` - TODO location
- `web/components/store/order-history.tsx` - Display component
- `web/db/store_order_items` - Has variant_name column

## Estimated Effort

- API update: 1 hour
- UI updates: 1.5 hours
- Email template: 0.5 hours
- Testing: 1 hour
- **Total: 4 hours**

---
*Created: January 2026*
*Derived from INCOMPLETE_FEATURES_ANALYSIS.md*
