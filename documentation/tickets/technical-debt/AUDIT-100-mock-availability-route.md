# AUDIT-100: Mock API Route in Production

## Priority: P0 - Critical
## Category: Technical Debt / Dead Code
## Status: Not Started
## Epic: [EPIC-08: Code Quality & Refactoring](../epics/EPIC-08-code-quality.md)

## Description

The `web/app/api/availability/route.ts` file contains mock data with hardcoded dates, no authentication, and an artificial delay. This appears to be placeholder code that was never replaced with actual implementation.

## Current State

```typescript
// Mock data with hardcoded dates from 2025
const MOCK_AVAILABLE_SLOTS = [
  { date: '2025-12-28', time: '09:00' },
  { date: '2025-12-28', time: '10:00' },
  // ...
]

export async function GET(request: Request) {
  // Artificial delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100))
  // No auth, no tenant isolation
  // ...
}
```

## Issues

1. **Hardcoded dates** - Dates from December 2025 are now in the past
2. **No authentication** - Endpoint is completely public
3. **No tenant isolation** - No multi-tenant support
4. **Artificial delay** - Simulated latency serves no production purpose
5. **Mock data** - Returns fake slot data instead of real availability

## Proposed Solution

Either:

**Option A: Remove the route entirely**
- Delete `web/app/api/availability/route.ts`
- Update any references to use `/api/appointments/slots` instead

**Option B: Implement properly**
- Add `withApiAuth` wrapper
- Query actual appointment availability from database
- Filter by tenant_id
- Remove artificial delay

## Implementation Steps

1. [ ] Search codebase for references to `/api/availability`
2. [ ] Determine if route is actually used anywhere
3. [ ] If unused: Delete the file
4. [ ] If used: Implement proper availability check with auth
5. [ ] Add tests for the endpoint

## Acceptance Criteria

- [ ] Mock data removed from codebase
- [ ] No references to `/api/availability` with mock data
- [ ] If route remains, it has proper auth and tenant isolation
- [ ] No artificial delays in production code

## Related Files

- `web/app/api/availability/route.ts`
- `web/app/api/appointments/slots/route.ts` (reference implementation)

## Estimated Effort

- 1-2 hours (likely just deletion)

## Risk Assessment

- **Low risk** - Appears to be unused development placeholder
- Recommend checking git history for context on why it was created
