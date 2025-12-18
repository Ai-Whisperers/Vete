# BUG-002: Redirect Parameter Inconsistency

## Priority: P2 - Medium
## Category: Bug
## Affected Areas: Authentication flow, Login pages

## Description

The login redirect parameter uses different names across the codebase:
- Some places use `?returnTo=`
- Some places use `?redirect=`
- Some places use `?next=`

This causes redirects to fail when the login page expects a different parameter.

## Current State

```typescript
// Pattern A - returnTo
redirect(`/${clinic}/portal/login?returnTo=${encodeURIComponent(pathname)}`)

// Pattern B - redirect
redirect(`/${clinic}/portal/login?redirect=${pathname}`)

// Pattern C - next (from auth callback)
const next = searchParams.get('next') || '/'

// Login page only checks one:
const returnTo = searchParams.get('returnTo')
// Ignores 'redirect' and 'next' params
```

### Issues:
1. Redirects fail when wrong param used
2. Users land on dashboard instead of intended page
3. Deep links don't work consistently

## Proposed Solution

### 1. Standardize on `returnTo`

```typescript
// lib/auth/redirect.ts
export const REDIRECT_PARAM = 'returnTo'

export function createLoginUrl(clinic: string, returnPath?: string) {
  const base = `/${clinic}/portal/login`
  if (returnPath) {
    return `${base}?${REDIRECT_PARAM}=${encodeURIComponent(returnPath)}`
  }
  return base
}

export function getReturnUrl(searchParams: URLSearchParams, fallback: string) {
  // Check all possible params for backwards compatibility
  return searchParams.get('returnTo')
    || searchParams.get('redirect')
    || searchParams.get('next')
    || fallback
}
```

### 2. Update Login Page

```typescript
// [clinic]/portal/login/page.tsx
const returnTo = getReturnUrl(searchParams, `/${clinic}/portal/dashboard`)

// After successful login:
redirect(returnTo)
```

### 3. Update All Redirect Calls

Search and replace across codebase:
- `?redirect=` → `?returnTo=`
- `?next=` → `?returnTo=`

## Implementation Steps

1. [ ] Create `lib/auth/redirect.ts` with helper functions
2. [ ] Update login page to use helper
3. [ ] Search for all redirect param usages
4. [ ] Update to use consistent `returnTo`
5. [ ] Update auth callback route
6. [ ] Test login flows from various entry points

## Acceptance Criteria

- [ ] Single redirect parameter name (`returnTo`)
- [ ] Backwards compatible with old params temporarily
- [ ] Deep links preserved through login
- [ ] No redirect loops

## Related Files

- `web/app/[clinic]/portal/login/page.tsx`
- `web/app/auth/callback/route.ts`
- `web/app/[clinic]/portal/layout.tsx`
- `web/app/[clinic]/dashboard/layout.tsx`

## Estimated Effort

- Implementation: 2 hours
- Testing: 1 hour
- **Total: 3 hours**
