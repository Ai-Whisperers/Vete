# TECH-003: Remove Development Console Logs

## Priority: P3 (Low)
## Category: Technical Debt
## Status: Not Started

## Description
Production code contains unconditional console.log statements that should be removed or made conditional on development environment.

## Current State
### Console Logs Found
**`app/[clinic]/dashboard/inventory/procurement/page.tsx`**

**Line 44:**
```typescript
const handleViewOrder = (order: ProcurementOrder) => {
  console.log('View order:', order)  // Should not be in production
  // TODO: Implement order detail modal
}
```

**Line 49:**
```typescript
const handleEditOrder = (order: ProcurementOrder) => {
  console.log('Edit order:', order)  // Should not be in production
  // TODO: Implement order edit
}
```

**Line 123:**
```typescript
onSelectSupplier={(supplierId, productId, unitCost) => {
  console.log('Selected:', { supplierId, productId, unitCost })  // Debug log
  // TODO: Add to purchase order
}}
```

### Impact
- Leaks internal data to browser console
- Unprofessional appearance in production
- Potential security concern (order data visible)
- Clutters console in development too

## Proposed Solution

### Option 1: Remove Completely (Recommended)
Since these are placeholder handlers with TODOs, the console.logs serve no purpose:

```typescript
// Before
const handleViewOrder = (order: ProcurementOrder) => {
  console.log('View order:', order)
  // TODO: Implement order detail modal
}

// After
const handleViewOrder = (order: ProcurementOrder) => {
  // TODO: Implement order detail modal
  showToast('Función próximamente disponible', 'info')
}
```

### Option 2: Conditional Logging
For logs that should remain during development:

```typescript
// lib/utils/logger.ts
export const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV]', ...args)
  }
}

// Usage
import { devLog } from '@/lib/utils/logger'

const handleViewOrder = (order: ProcurementOrder) => {
  devLog('View order:', order)
  // ...
}
```

### Option 3: ESLint Rule
Add rule to catch console statements:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-console': ['warn', {
      allow: ['warn', 'error', 'info']
    }]
  }
}
```

## Files to Update
1. `app/[clinic]/dashboard/inventory/procurement/page.tsx` (3 logs)
2. Any other files with unconditional console.log

### Finding All Console Logs
```bash
# Find all console.log statements
grep -r "console\.log" web/app --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".test."
```

## Implementation Steps
1. Search codebase for console.log statements
2. Categorize: debug (remove) vs intentional (keep)
3. Remove debug console.logs
4. Replace with devLog utility if needed
5. Add ESLint rule to prevent future occurrences
6. Update CI to fail on console.log in production code

## Acceptance Criteria
- [ ] No unconditional console.log in production code
- [ ] ESLint warns on console.log usage
- [ ] devLog utility available for development
- [ ] CI catches new console.log additions

## Related Files
- `web/app/[clinic]/dashboard/inventory/procurement/page.tsx`
- `web/lib/utils/logger.ts` (update or create)
- `web/.eslintrc.js`

## Estimated Effort
- Find and remove logs: 1 hour
- Create devLog utility: 30 minutes
- Add ESLint rule: 30 minutes
- **Total: 2 hours**

---
*Ticket created: January 2026*
*Based on codebase analysis*
