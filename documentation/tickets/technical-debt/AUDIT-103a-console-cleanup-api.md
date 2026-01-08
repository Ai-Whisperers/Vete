# AUDIT-103a: Console.log Cleanup - API Routes

## Priority: P2 - Medium
## Category: Technical Debt / Code Quality
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)
## Parent Ticket: [AUDIT-103](./AUDIT-103-console-log-cleanup.md)

## Description

Remove or replace console statements in API route files with proper logging using the project's `logger` utility.

## Affected Files (15 files)

| File | Est. Count | Action |
|------|------------|--------|
| `api/ambassador/stats/route.ts` | 1-2 | Replace with logger |
| `api/ambassador/referrals/route.ts` | 1-2 | Replace with logger |
| `api/ambassador/payouts/route.ts` | 1-2 | Replace with logger |
| `api/billing/invoices/[id]/pdf/route.tsx` | 1-2 | Replace with logger |
| `api/signup/upload-logo/route.ts` | 1-2 | Replace with logger |
| `api/signup/check-slug/route.ts` | 1-2 | Replace with logger |
| `api/referrals/stats/route.ts` | 1-2 | Replace with logger |
| `api/referrals/apply/route.ts` | 1-2 | Replace with logger |
| `api/referrals/route.ts` | 1-2 | Replace with logger |
| `api/dashboard/my-patients/route.ts` | 1-2 | Replace with logger |
| `api/portal/activity/route.ts` | 1-2 | Replace with logger |
| `api/homepage/staff-preview/route.ts` | 1-2 | Replace with logger |
| `api/homepage/owner-preview/route.ts` | 3-4 | Replace with logger |

## Implementation Pattern

```typescript
// Before
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Processing request:', body)

    // ... logic ...

    console.log('Success:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// After
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    logger.debug('Processing ambassador payout request', { body })

    // ... logic ...

    logger.info('Ambassador payout processed', { payoutId: result.id })
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Failed to process ambassador payout', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
```

## Decision Matrix for API Routes

| Log Type | Original | Replacement |
|----------|----------|-------------|
| Debug during dev | `console.log(data)` | `logger.debug(message, { data })` |
| Request received | `console.log('Request:', body)` | `logger.debug('Request received', { endpoint, body })` |
| Success | `console.log('Done')` | `logger.info('Operation completed', { result })` |
| Error | `console.error(err)` | `logger.error('Operation failed', { error, context })` |
| Temporary debug | `console.log('HERE')` | Remove entirely |

## Implementation Steps

1. [ ] `api/ambassador/stats/route.ts`
2. [ ] `api/ambassador/referrals/route.ts`
3. [ ] `api/ambassador/payouts/route.ts`
4. [ ] `api/billing/invoices/[id]/pdf/route.tsx`
5. [ ] `api/signup/upload-logo/route.ts`
6. [ ] `api/signup/check-slug/route.ts`
7. [ ] `api/referrals/stats/route.ts`
8. [ ] `api/referrals/apply/route.ts`
9. [ ] `api/referrals/route.ts`
10. [ ] `api/dashboard/my-patients/route.ts`
11. [ ] `api/portal/activity/route.ts`
12. [ ] `api/homepage/staff-preview/route.ts`
13. [ ] `api/homepage/owner-preview/route.ts`
14. [ ] Run `npm run build` to verify no regressions
15. [ ] Run `npm run lint` to check for issues

## Acceptance Criteria

- [ ] Zero `console.log` statements in API routes
- [ ] All meaningful logs converted to `logger` calls
- [ ] Error logs include context (endpoint, user if available)
- [ ] Build passes without errors
- [ ] No runtime regressions

## Estimated Effort

- 1.5-2 hours

## Risk Assessment

- **Low risk** - Non-functional changes
- API routes are isolated - easy to test individually
