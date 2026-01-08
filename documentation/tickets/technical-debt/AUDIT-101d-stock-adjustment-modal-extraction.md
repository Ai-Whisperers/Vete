# AUDIT-101d: Extract Stock Adjustment Modal Component

## Priority: P1 - High
## Category: Refactoring / Technical Debt
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Parent Ticket: [AUDIT-101](./AUDIT-101-god-component-inventory.md)

## Description

Extract the stock adjustment modal functionality from the inventory client into a dedicated component. This modal handles adding stock, removing stock, and corrections with reason codes.

## Current State

Stock adjustment logic is embedded in `web/app/[clinic]/dashboard/inventory/client.tsx` around lines 600-800, with state management mixed with other concerns.

**Current adjustment state:**
```typescript
const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)
const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add')
const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0)
const [adjustmentReason, setAdjustmentReason] = useState<string>('')
```

## Proposed Solution

Create `components/dashboard/inventory/StockAdjustmentModal.tsx`:

```typescript
type AdjustmentType = 'receive' | 'sell' | 'damage' | 'theft' | 'expired' | 'correction' | 'transfer'

interface StockAdjustmentModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (adjustment: StockAdjustment) => Promise<void>
}

interface StockAdjustment {
  productId: string
  type: AdjustmentType
  quantity: number
  unitCost?: number  // For receiving stock
  reason: string
  notes?: string
}

export function StockAdjustmentModal({
  product,
  isOpen,
  onClose,
  onSubmit,
}: StockAdjustmentModalProps) {
  const [type, setType] = useState<AdjustmentType>('receive')
  const [quantity, setQuantity] = useState(0)
  const [unitCost, setUnitCost] = useState<number | undefined>()
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form validation
  // WAC calculation preview for receiving
  // Submit handler
}
```

### Features to include:

1. **Adjustment type selection** - Radio/tabs for different adjustment types
2. **Quantity input** - With validation for available stock on removals
3. **Unit cost input** - For receiving stock (WAC calculation)
4. **Reason codes** - Predefined reasons per type
5. **Notes field** - Optional additional context
6. **Preview** - Show new stock level before confirming
7. **WAC preview** - Show updated weighted average cost for receipts

## Implementation Steps

1. [ ] Create `components/dashboard/inventory/StockAdjustmentModal.tsx`
2. [ ] Define `StockAdjustment` and related types
3. [ ] Create adjustment type selector with icons
4. [ ] Add quantity input with validation
5. [ ] Add unit cost input (conditional on type)
6. [ ] Add reason dropdown with predefined options
7. [ ] Add optional notes textarea
8. [ ] Implement stock preview calculation
9. [ ] Implement WAC preview for receipts
10. [ ] Add form submission with loading state
11. [ ] Export from barrel file
12. [ ] Update parent to use new modal
13. [ ] Test all adjustment scenarios

## Acceptance Criteria

- [ ] Modal component is under 250 lines
- [ ] All adjustment types work correctly
- [ ] Cannot remove more stock than available
- [ ] WAC recalculates correctly on receipt
- [ ] Reason codes are type-appropriate
- [ ] Loading state during submission
- [ ] Error handling for API failures
- [ ] Modal closes on successful submission
- [ ] No functionality regression
- [ ] Proper TypeScript types

## Related Files

- `web/app/[clinic]/dashboard/inventory/client.tsx` (source)
- `web/components/dashboard/inventory/StockAdjustmentModal.tsx` (new)
- `web/components/dashboard/inventory/stock-history-modal.tsx` (related)

## Estimated Effort

- 3-4 hours

## Dependencies

- API endpoint `POST /api/inventory/adjustments` must support all adjustment types
