# Lint Cleanup Guide - Gradual Approach

**Status**: 2,746 warnings remaining (down from 8,060 - **66% reduction**)

## ✅ Completed

### Category 1: Unnecessary Escape Characters ✅ DONE

- **Count**: 139 → 0 warnings
- **Impact**: 100% fixed
- **Method**: Removed unnecessary backslashes in regex patterns
- **Files Modified**: 7 code files + ESLint config
- **Major Win**: Excluded `playwright-report/**` from linting (eliminated 5,000+ false positives)

### Changes Made:

```typescript
// Before
const cleaned = val.replace(/[\s\-\(\)\.]/g, '')
const phone = /^[\+]?[1-9][\d]{0,15}$/

// After
const cleaned = val.replace(/[\s\-().]/g, '')
const phone = /^[+]?[1-9][\d]{0,15}$/
```

**Files Fixed**:

- `app/actions/invite-client.ts`
- `app/actions/update-profile.ts`
- `lib/validation/file-validation.ts`
- `lib/validation/schemas.ts`
- `lib/validation/helpers.ts`
- `e2e/public/services.spec.ts`
- `tests/integration/payments/payment-validation.test.ts`
- `eslint.config.mjs` (added playwright-report ignore)

---

### Category 2: Unused Imports ⏳ IN PROGRESS

- **Count**: 459 → 433 warnings (**26 removed, 6% progress**)
- **Impact**: Cleaner imports, faster IDE performance
- **Method**: Manually removed unused icon and component imports
- **Files Modified**: 13 application files

**Files Fixed**:

- `app/[clinic]/dashboard/analytics/operations/page.tsx` (3 imports)
- `app/[clinic]/dashboard/analytics/page.tsx` (4 imports)
- `app/[clinic]/dashboard/clients/segments/page.tsx` (3 imports)
- `app/[clinic]/dashboard/campaigns/components/CampaignFormModal.tsx` (2 imports)
- `app/[clinic]/dashboard/coupons/components/CouponFormModal.tsx` (1 import)
- `app/[clinic]/dashboard/clients/page.tsx` (1 import)
- `app/[clinic]/dashboard/insurance/claims/[id]/page.tsx` (2 imports)
- `app/[clinic]/dashboard/analytics/loading.tsx` (1 import)
- `app/[clinic]/dashboard/campaigns/loading.tsx` (1 import)
- `app/[clinic]/dashboard/schedules/loading.tsx` (1 import)
- `app/[clinic]/dashboard/settings/loading.tsx` (1 import)
- `app/[clinic]/dashboard/insurance/page.tsx` (4 imports)
- `app/[clinic]/dashboard/team/page.tsx` (1 import)
- `app/[clinic]/not-found.tsx` (1 import)

**Common Patterns Fixed**:

- Unused icon imports from lucide-react
- Unused type imports in modal components
- Unused skeleton components in loading pages
- Unused React hooks (useMemo, useMutation)

---

## 🔜 Remaining Categories

### Category 3: Unused Imports (433 warnings) - **CONTINUE**

**Risk**: ⚠️ Low - Safe to remove, but needs careful review

**Strategy**:

1. **Phase 1**: Remove completely unused imports (icons, components never referenced)
2. **Phase 2**: Check if types are only used in type annotations (may need `import type`)
3. **Phase 3**: Verify no side-effect imports are removed

**Example Fixes**:

```typescript
// Before
import { Filter, Search, Users } from 'lucide-react'
import { notUsed } from './utils'

function Component() {
  return <Search /> // Only Search is used
}

// After
import { Search } from 'lucide-react'

function Component() {
  return <Search />
}
```

**Top Files with Unused Imports**:

- `app/[clinic]/dashboard/analytics/operations/page.tsx` (Users, LineChart, Area)
- `app/[clinic]/dashboard/analytics/page.tsx` (TrendingUp, TrendingDown, Legend, FeatureGate)
- `app/[clinic]/dashboard/clients/segments/page.tsx` (TrendingDown, CardHeader, CardTitle)
- `app/[clinic]/dashboard/campaigns/components/CampaignFormModal.tsx` (CampaignType, DiscountType)
- `app/[clinic]/dashboard/coupons/components/CouponFormModal.tsx` (DiscountType)

**Command to Generate List**:

```bash
npm run lint 2>&1 | grep "is defined but never used" > unused_imports.txt
```

---

### Category 3: Unused Variables (276 warnings) - **MEDIUM PRIORITY**

**Risk**: ⚠️ Medium - May be destructured for omission or used indirectly

**Strategy**: Prefix with `_` instead of removing

```typescript
// Before - ESLint complains
const { data, error } = await fetch()
return data

// After - Acknowledged unused
const { data, error: _error } = await fetch()
return data
```

**Common Patterns**:

- Destructured but unused: `const { data, error } = result` → `const { data, error: _error }`
- Function params: `function handler(req, res)` → `function handler(req, _res)`
- Catch blocks: `catch (error)` → `catch (_error)`

---

### Category 4: Non-Null Assertions (508 warnings) - **HIGH IMPACT**

**Risk**: ⚠️⚠️ High - Potential runtime errors if assumption is wrong

**Strategy**: Replace with proper null checks

```typescript
// Before - Risky
const value = obj.property!
const item = array[0]!

// After - Safe
const value = obj.property ?? defaultValue
const item = array[0] || fallback
// OR
if (!obj.property) throw new Error('Property required')
const value = obj.property
```

**Files with Most Issues**:

- `app/[clinic]/dashboard/calendar/page.tsx` (2 assertions)
- `app/[clinic]/layout.tsx` (1 assertion)
- `app/[clinic]/store/product/[id]/client.tsx` (1 assertion)
- `app/[clinic]/store/wishlist/page.tsx` (1 assertion)
- `app/actions/time-off.ts` (2 assertions)
- `app/api/calendar/events/route.ts` (2 assertions)

**Verification**: After fixing, run TypeScript compiler to ensure no new errors.

---

### Category 5: Explicit `any` Types (277 warnings) - **MEDIUM PRIORITY**

**Risk**: ⚠️ Low - Type safety issue, not runtime

**Strategy**: Replace with proper types

```typescript
// Before
function process(data: any) {}
const items: any[] = []

// After
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type narrowing
  }
}
const items: Item[] = []
```

**Common Locations**:

- `app/[clinic]/euthanasia_assessments/client.tsx` (2 any types)
- `app/[clinic]/reproductive_cycles/client.tsx` (1 any type)
- `app/[clinic]/portal/finance/client.tsx` (1 any type)

---

### Category 6: `<img>` → Next.js `<Image />` (69 warnings) - **OPTIMIZATION**

**Risk**: ⚠️ Low - Performance optimization, not breaking

**Strategy**: Replace with Next.js Image component

```typescript
// Before
<img src={pet.image_url} alt={pet.name} className="w-16 h-16" />

// After
import Image from 'next/image'
<Image
  src={pet.image_url}
  alt={pet.name}
  width={64}
  height={64}
  className="object-cover"
/>
```

**Note**: Requires known dimensions or `fill` prop.

---

### Category 7: useEffect Dependencies (47 warnings) - **HIGH RISK**

**Risk**: ⚠️⚠️⚠️ Very High - Logic changes, potential infinite loops

**Strategy**: Carefully analyze each case

```typescript
// Pattern 1: Missing stable function
useEffect(() => {
  fetchData()
}, []) // Missing fetchData

// Fix 1: Include dependency + useCallback
const fetchData = useCallback(() => {}, [deps])
useEffect(() => {
  fetchData()
}, [fetchData])

// Fix 2: Define inside effect (if no external deps)
useEffect(() => {
  const fetchData = () => {}
  fetchData()
}, [])
```

**DO NOT blindly add dependencies** - verify no infinite loops.

---

### Category 8: confirm/alert/prompt (39 warnings) - **UX IMPROVEMENT**

**Risk**: ⚠️ Medium - UX change, needs UI components

**Strategy**: Replace with modal components

```typescript
// Before
if (confirm('¿Eliminar?')) {
  await delete()
}

// After
const [showConfirm, setShowConfirm] = useState(false)
<ConfirmDialog
  open={showConfirm}
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

**Files**: Search for `no-alert` warnings, create reusable `ConfirmDialog` component.

---

## 📋 Recommended Order

1. ✅ **Escape characters** (DONE - 139 fixed, 100%)
2. ⏳ **Unused imports** (IN PROGRESS - 26 fixed, 433 remain)
3. 🔜 **Unused variables** (276 - Prefix with `_`)
4. ⚠️ **Non-null assertions** (508 - Requires careful review)
5. ⚠️ **Explicit any** (277 - Type improvements)
6. 📈 **Image optimization** (69 - Performance gain)
7. ⚠️⚠️ **useEffect deps** (47 - **HIGH RISK**, do last)
8. 🎨 **Alert/confirm** (39 - UX improvement)

---

## 🛠️ Commands

```bash
# Run lint
npm run lint

# Run lint with auto-fix (limited effectiveness)
npm run lint -- --fix

# Count specific warning type
npm run lint 2>&1 | grep "warning-text" | wc -l

# Generate report for specific category
npm run lint 2>&1 | grep "is defined but never used" > unused_imports.txt
npm run lint 2>&1 | grep "Forbidden non-null assertion" > non_null_assertions.txt
npm run lint 2>&1 | grep "Unexpected any" > explicit_any.txt
```

---

## 📊 Progress Tracking

| Category            | Initial | Fixed    | Remaining | % Done  |
| ------------------- | ------- | -------- | --------- | ------- |
| **Total**           | 8,060   | 5,314    | 2,746     | 66%     |
| Escape chars        | 139     | 139      | 0         | ✅ 100% |
| Unused imports      | 459     | 26       | 433       | ⏳ 6%   |
| Unused vars         | 276     | 0        | 276       | 0%      |
| Non-null assertions | 508     | 0        | 508       | 0%      |
| Explicit any        | 277     | 0        | 277       | 0%      |
| `<img>` tags        | 69      | 0        | 69        | 0%      |
| useEffect deps      | 47      | 0        | 47        | 0%      |
| confirm/alert       | 39      | 0        | 39        | 0%      |
| Other               | ~6,500  | ~5,000\* | ~1,000    | 83%     |

\* _Mostly eliminated by excluding `playwright-report/**` from linting_

---

## 🎯 Next Session Goals

**Target**: Get below 2,000 warnings

**Focus**:

1. Remove top 100 unused imports (highest impact files)
2. Prefix unused variables with `_` in top 50 files
3. Document strategy for non-null assertions

**Success Metrics**:

- Total warnings < 2,000
- All unused import warnings < 300
- Unused variable warnings < 200

---

---

## 📈 Session Summary

### Session 1 (Completed)

- **Duration**: ~2 hours
- **Files Modified**: 20 files (7 code files + 13 app files + 1 config)
- **Warnings Fixed**: 165 warnings eliminated
  - Category 1 (Escape chars): 139 fixed (100%)
  - Category 2 (Unused imports): 26 fixed (6% of 459)
- **Total Progress**: 8,060 → 2,746 warnings (66% reduction)

### Key Achievements

1. Eliminated 5,000+ false positives by excluding generated files
2. Fixed all regex escape character warnings (zero risk)
3. Started systematic unused import cleanup
4. Created comprehensive cleanup guide and tracking

_Last updated: January 21, 2026_
