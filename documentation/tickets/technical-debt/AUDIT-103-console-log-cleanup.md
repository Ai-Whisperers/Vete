# AUDIT-103: Console.log Cleanup

## Priority: P2 - Medium
## Category: Technical Debt / Code Quality
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)

## Description

The codebase contains 126 `console.log`, `console.warn`, `console.error`, and `console.debug` statements scattered across 67 files. These should be replaced with the project's `logger` utility or removed entirely.

## Current State

**Total occurrences**: 126 across 67 files

**Files with most console statements:**
| File | Count |
|------|-------|
| `dashboard/inventory/client.tsx` | 7 |
| `portal/subscriptions/client.tsx` | 5 |
| `portal/inventory/client.tsx` | 5 |
| `auth/actions.ts` | 4 |
| `api/homepage/owner-preview/route.ts` | 4 |
| `dashboard/consents/[id]/page.tsx` | 4 |
| Various other files | 1-3 each |

**Breakdown by type:**
- `console.log` - ~100 (debug/info)
- `console.warn` - ~15 (warnings)
- `console.error` - ~10 (errors)
- `console.debug` - ~1 (debug)

## Issues

1. **Production visibility** - Console logs visible in browser DevTools
2. **No log levels** - Cannot filter by severity in production
3. **No structured logging** - No context/metadata for debugging
4. **Inconsistency** - Mix of console and logger usage
5. **Performance** - Slight overhead from string concatenation

## Proposed Solution

Replace with project's `logger` utility:

```typescript
// Before
console.log('Processing item', itemId)
console.error('Failed to process', error)

// After
import { logger } from '@/lib/logger'

logger.debug('Processing item', { itemId })
logger.error('Failed to process', { error: error.message, itemId })
```

### Decision Matrix

| Scenario | Action |
|----------|--------|
| Debug during development | Use `logger.debug()` |
| Important info in production | Use `logger.info()` |
| Warnings | Use `logger.warn()` |
| Errors | Use `logger.error()` |
| Temporary debugging | Remove entirely |

## Implementation Steps

1. [ ] Create a list of all files with console statements
2. [ ] Review each usage and categorize:
   - Convert to logger.debug()
   - Convert to logger.info()
   - Convert to logger.warn()
   - Convert to logger.error()
   - Remove entirely
3. [ ] Make changes file by file
4. [ ] Run TypeScript check to ensure no regressions
5. [ ] Add ESLint rule to prevent future console usage

### ESLint Configuration

Add to `.eslintrc.js`:

```javascript
module.exports = {
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Or stricter:
    'no-console': 'error',
  },
}
```

## Acceptance Criteria

- [ ] Zero `console.log` statements in production code
- [ ] All meaningful logs converted to `logger` calls
- [ ] ESLint rule added to prevent future additions
- [ ] Legitimate error boundaries can still use console.error if needed

## Related Files

- `web/lib/logger.ts` - Project logger utility
- `web/.eslintrc.js` - ESLint configuration
- 67 files with console statements (see audit output)

## Estimated Effort

- 4-6 hours

## Risk Assessment

- **Low risk** - Non-functional changes
- Some console statements may be intentional (error boundaries)
- Review error.tsx and global-error.tsx separately
