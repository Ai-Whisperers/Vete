# Vete Codebase Remediation Plan

**Created**: January 2026  
**Status**: In Progress  
**Priority**: HIGH - Technical Debt Reduction

---

## Executive Summary

Based on comprehensive codebase analysis, this plan addresses **14 critical technical debt areas** organized into 4 phases:

- **Phase 1: Critical Fixes (Days 1-2)** - Prevent immediate disasters
- **Phase 2: Foundation Improvements (Days 3-4)** - Reduce code duplication
- **Phase 3: Quality Improvements (Days 5-6)** - Fix consistency issues
- **Phase 4: Documentation & Cleanup (Day 7)** - Long-term maintainability

**Estimated Total Time**: 7 working days  
**Risk Level**: Medium (requires testing between phases)  
**Breaking Changes**: None (all backward-compatible)

---

## Phase 1: Critical Fixes (HIGH PRIORITY)

### 🔴 1.1 ESLint Configuration Hardening

**Problem**: `--max-warnings 9000` allows unbounded tech debt  
**Impact**: New violations go unnoticed, code quality degrades  
**Solution**: Progressive reduction to zero warnings

#### Steps:

1. **Baseline Current State**
   ```bash
   npm run lint 2>&1 | tee eslint-baseline.txt
   ```
2. **Upgrade Warnings → Errors for Critical Rules**

   ```javascript
   // eslint.config.mjs
   "@typescript-eslint/no-explicit-any": "error",  // was: warn
   "@typescript-eslint/no-non-null-assertion": "error",  // was: warn
   "no-console": process.env.NODE_ENV === 'production' ? "error" : "warn",
   ```

3. **Set Max Warnings Target Path**

   ```json
   // package.json
   "lint": "eslint --max-warnings 100",  // Reduce from 9000
   "lint:strict": "eslint --max-warnings 0",  // New files only
   ```

4. **Fix Blocking Errors**
   - Run `npm run lint:fix` to auto-fix simple issues
   - Manually fix remaining `no-explicit-any` violations
   - Replace `!` assertions with proper null checks

**Acceptance Criteria**:

- [ ] ESLint runs without crashing
- [ ] Max warnings reduced to ≤100
- [ ] CI pipeline includes `lint:strict` for new files
- [ ] Developer docs updated with linting workflow

**Estimated Time**: 4 hours  
**Risk**: Low (auto-fix handles 80%)

---

### 🔴 1.2 Environment Variable Validation

**Problem**: Missing required env vars discovered at runtime, not startup  
**Impact**: Deploys succeed then crash after 2 hours  
**Solution**: Zod schema validation at app initialization

#### Implementation:

**File**: `web/lib/env.ts` (NEW)

```typescript
import { z } from 'zod'

// Required environment variables
const requiredEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  DATABASE_URL: z.string().url(),
})

// Optional but recommended
const optionalEnvSchema = z
  .object({
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    CRON_SECRET: z.string().min(32).optional(),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
    RESEND_API_KEY: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
  })
  .passthrough()

const envSchema = requiredEnvSchema.merge(optionalEnvSchema)

export const env = envSchema.parse(process.env)

// Runtime access
export function requireEnv(key: keyof typeof env): string {
  const value = env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value
}
```

**File**: `web/app/layout.tsx` (MODIFY)

```typescript
import { env } from '@/lib/env'; // Validates on import

export default function RootLayout({ children }) {
  // If we reach here, env is valid
  return <html>{children}</html>;
}
```

**Acceptance Criteria**:

- [ ] App crashes immediately if required vars missing
- [ ] Error message specifies which var is missing
- [ ] All existing env access migrated to `env.VAR_NAME`
- [ ] Tests mock environment properly

**Estimated Time**: 2 hours  
**Risk**: Low (fails fast)

---

### 🔴 1.3 Tailwind Version Pinning

**Problem**: `^3.4.19` allows automatic upgrade to v4 (breaks build)  
**Impact**: `npm update` will break production  
**Solution**: Exact version pin + documentation

#### Steps:

1. **Lock Exact Version**

   ```json
   // web/package.json
   "tailwindcss": "3.4.19"  // Remove ^
   ```

2. **Document Why**

   ```javascript
   // web/tailwind.config.ts (add comment)
   /**
    * ⚠️ LOCKED TO v3.4.19
    * Do not upgrade to v4 without migrating .content_data/ out of content scan path.
    * See: web/docs/TAILWIND_V4_MIGRATION.md
    */
   ```

3. **Create Migration Guide**

   ```markdown
   # web/docs/TAILWIND_V4_MIGRATION.md

   ## Why We're Locked to v3

   Tailwind v4 scanner misinterprets JSON color names in .content_data/ as class names.

   ## Migration Path

   1. Move .content_data/ to ../content/ (outside web/)
   2. Update clinics.ts loader path
   3. Test all clinic themes render correctly
   4. Upgrade Tailwind to v4
   ```

**Acceptance Criteria**:

- [ ] package.json has exact version
- [ ] package-lock.json committed
- [ ] Migration guide created
- [ ] Renovate/Dependabot config ignores Tailwind upgrades

**Estimated Time**: 30 minutes  
**Risk**: None (prevents future risk)

---

### 🔴 1.4 JSON-CMS Schema Validation

**Problem**: Typos in `theme.json` crash at runtime, not load time  
**Impact**: Deploying broken clinic config takes down that tenant  
**Solution**: Zod schemas + validation on load

#### Implementation:

**File**: `web/lib/schemas/clinic-config.ts` (NEW)

```typescript
import { z } from 'zod'

export const themeSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    // ... all theme colors
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  borderRadius: z.string(),
})

export const configSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  contact: z.object({
    phone: z.string(),
    email: z.string().email(),
    address: z.string(),
  }),
  modules: z.object({
    booking: z.object({ enabled: z.boolean() }),
    store: z.object({ enabled: z.boolean() }),
    lab: z.object({ enabled: z.boolean() }),
    // ... all modules
  }),
})

export type ClinicConfig = z.infer<typeof configSchema>
export type ClinicTheme = z.infer<typeof themeSchema>
```

**File**: `web/lib/clinics.ts` (MODIFY)

```typescript
import { configSchema, themeSchema } from '@/lib/schemas/clinic-config'

export async function getClinicData(slug: string) {
  const configRaw = await fs.readFile(`.content_data/${slug}/config.json`)
  const themeRaw = await fs.readFile(`.content_data/${slug}/theme.json`)

  // Validate schemas - crashes if invalid
  const config = configSchema.parse(JSON.parse(configRaw))
  const theme = themeSchema.parse(JSON.parse(themeRaw))

  return { config, theme }
}
```

**Acceptance Criteria**:

- [ ] All clinic JSON files validate successfully
- [ ] Invalid JSON crashes at build time (not runtime)
- [ ] Type safety for clinic config access
- [ ] Migration script for existing clinics

**Estimated Time**: 3 hours  
**Risk**: Medium (may find existing invalid configs)

---

## Phase 2: Foundation Improvements (HIGH PRIORITY)

### 🟠 2.1 Centralized Tenant Constants

**Problem**: 529 hardcoded `'adris'` and `'petlife'` references  
**Impact**: Adding 3rd clinic requires refactoring 529 lines  
**Solution**: Central constants + test utilities

#### Implementation:

**File**: `web/lib/constants/tenants.ts` (NEW)

```typescript
export const TENANT_IDS = {
  ADRIS: 'adris',
  PETLIFE: 'petlife',
  // Future clinics here
} as const

export type TenantId = (typeof TENANT_IDS)[keyof typeof TENANT_IDS]

export const DEFAULT_TEST_TENANT = TENANT_IDS.ADRIS

// Utility for tests
export function getTestTenant(): TenantId {
  return (process.env.TEST_TENANT as TenantId) || DEFAULT_TEST_TENANT
}
```

**File**: `web/lib/test-utils/tenant.ts` (NEW)

```typescript
import { TENANT_IDS } from '@/lib/constants/tenants'

export function createTenantContext(tenantId: TenantId = TENANT_IDS.ADRIS) {
  return {
    tenantId,
    profile: createMockProfile({ tenant_id: tenantId }),
    supabase: createMockSupabase(tenantId),
  }
}
```

**Migration Script**: `web/scripts/migrate-hardcoded-tenants.ts`

```typescript
// Find and replace all hardcoded tenant IDs
import { replaceInFiles } from './utils'

replaceInFiles({
  pattern: /tenant_id:\s*['"]adris['"]/g,
  replacement: `tenant_id: TENANT_IDS.ADRIS`,
  files: ['tests/**/*.ts', 'db/seeds/**/*.ts'],
})
```

**Acceptance Criteria**:

- [ ] All 529 hardcoded references replaced
- [ ] Tests still pass
- [ ] Adding new tenant requires 1 line change
- [ ] Type safety prevents invalid tenant IDs

**Estimated Time**: 4 hours  
**Risk**: Medium (large refactor, needs careful testing)

---

### 🟠 2.2 Standardized API Auth Middleware

**Problem**: 313 API routes copy-paste auth logic  
**Impact**: Inconsistent error messages, hard to add features  
**Solution**: `withAuth()` higher-order function

#### Implementation:

**File**: `web/lib/api/middleware.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface AuthContext {
  user: { id: string; email: string }
  profile: { id: string; tenant_id: string; role: string }
}

type AuthHandler<T = unknown> = (
  request: NextRequest,
  context: T,
  auth: AuthContext
) => Promise<NextResponse>

export function withAuth<T = unknown>(handler: AuthHandler<T>) {
  return async (request: NextRequest, context: T) => {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, tenant_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Call handler with auth context
    return handler(request, context, { user, profile })
  }
}

// Role-specific variants
export function withStaffAuth<T = unknown>(handler: AuthHandler<T>) {
  return withAuth<T>(async (req, ctx, auth) => {
    if (!['vet', 'admin'].includes(auth.profile.role)) {
      return NextResponse.json({ error: 'Requiere acceso de personal' }, { status: 403 })
    }
    return handler(req, ctx, auth)
  })
}
```

**Migration Example**:

```typescript
// OLD (web/app/api/pets/route.ts)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  // ... 20 more lines
}

// NEW
export const GET = withAuth(async (request, context, { profile }) => {
  const supabase = await createClient()
  const { data } = await supabase.from('pets').select('*').eq('tenant_id', profile.tenant_id)
  return NextResponse.json(data)
})
```

**Acceptance Criteria**:

- [ ] `withAuth()`, `withStaffAuth()`, `withAdminAuth()` created
- [ ] 10+ API routes migrated as examples
- [ ] All migrated routes tested
- [ ] Documentation updated

**Estimated Time**: 6 hours (2h build + 4h migrate sample routes)  
**Risk**: Low (additive change, can migrate gradually)

---

### 🟠 2.3 Centralized Error Messages i18n

**Problem**: Mix of Spanish and English error messages  
**Impact**: Inconsistent UX, hard to translate  
**Solution**: Centralized error dictionary

#### Implementation:

**File**: `web/lib/i18n/errors.ts` (NEW)

```typescript
export const ERROR_MESSAGES = {
  // Auth errors
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'No tiene permisos para esta operación',
  SESSION_EXPIRED: 'Su sesión ha expirado',

  // Resource errors
  NOT_FOUND: 'Recurso no encontrado',
  ALREADY_EXISTS: 'Este registro ya existe',
  INVALID_DATA: 'Datos inválidos',

  // Tenant errors
  TENANT_MISMATCH: 'Acceso a datos de otra clínica no permitido',
  TENANT_NOT_FOUND: 'Clínica no encontrada',

  // Database errors
  DB_CONNECTION: 'Error de conexión a la base de datos',
  DB_CONSTRAINT: 'Operación no permitida: restricción de datos',
  DB_UNIQUE_VIOLATION: 'Este registro ya existe en el sistema',

  // File errors
  FILE_TOO_LARGE: 'Archivo demasiado grande',
  FILE_INVALID_TYPE: 'Tipo de archivo no permitido',
} as const

export type ErrorCode = keyof typeof ERROR_MESSAGES

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code]
}

// Helper for API responses
export function errorResponse(code: ErrorCode, status = 400) {
  return NextResponse.json({ error: getErrorMessage(code), code }, { status })
}
```

**Migration in BaseService**:

```typescript
// web/lib/services/base-service.ts
import { ERROR_MESSAGES } from '@/lib/i18n/errors';

protected mapDatabaseError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string };

    switch (dbError.code) {
      case '23505': return ERROR_MESSAGES.DB_UNIQUE_VIOLATION;
      case '23503': return ERROR_MESSAGES.DB_CONSTRAINT;
      case 'PGRST116': return ERROR_MESSAGES.UNAUTHORIZED;
      // ...
    }
  }
  return ERROR_MESSAGES.INVALID_DATA;
}
```

**Acceptance Criteria**:

- [ ] All common errors have Spanish translations
- [ ] BaseService uses centralized messages
- [ ] API routes use `errorResponse()` helper
- [ ] English messages flagged by grep

**Estimated Time**: 3 hours  
**Risk**: Low (improves consistency)

---

## Phase 3: Quality Improvements (MEDIUM PRIORITY)

### 🟡 3.1 Theme Variable Migration for Hardcoded Colors

**Problem**: 117 `bg-blue-500` violations across 55 files  
**Impact**: Can't rebrand clinics without code changes  
**Solution**: Automated migration script + manual review

#### Migration Script:

**File**: `web/scripts/migrate-hardcoded-colors.ts`

```typescript
import fs from 'fs'
import path from 'path'

const COLOR_MAPPINGS = {
  // Primary colors
  'bg-blue-500': 'bg-[var(--primary)]',
  'bg-blue-600': 'bg-[var(--primary-dark)]',
  'text-blue-600': 'text-[var(--primary)]',

  // Status colors
  'bg-green-500': 'bg-[var(--success)]',
  'bg-red-500': 'bg-[var(--danger)]',
  'bg-yellow-500': 'bg-[var(--warning)]',

  // Neutrals (keep hardcoded - always gray)
  // 'bg-gray-100': 'bg-gray-100',  // No change
}

async function migrateFile(filePath: string) {
  let content = await fs.promises.readFile(filePath, 'utf-8')
  let changes = 0

  for (const [old, replacement] of Object.entries(COLOR_MAPPINGS)) {
    const regex = new RegExp(old, 'g')
    const matches = content.match(regex)
    if (matches) {
      content = content.replace(regex, replacement)
      changes += matches.length
    }
  }

  if (changes > 0) {
    await fs.promises.writeFile(filePath, content)
    console.log(`✅ ${filePath}: ${changes} replacements`)
  }
}

// Run on all TSX files
// (Implementation continues...)
```

**Manual Review Required**:

- Password strength indicators (`bg-red-500` = weak is semantic, not theme)
- Status badges (green = success is universal)
- Charts/graphs (specific colors for data visualization)

**Acceptance Criteria**:

- [ ] Script migrates 80%+ of violations automatically
- [ ] Remaining 20% manually reviewed
- [ ] All clinics render correctly after migration
- [ ] Theme JSON now controls all brand colors

**Estimated Time**: 6 hours (2h script + 4h manual review)  
**Risk**: Medium (visual regression possible)

---

### 🟡 3.2 BaseService Transaction Documentation

**Problem**: `executeTransaction()` pretends to be atomic but isn't  
**Impact**: Developers assume transactions work, create bugs  
**Solution**: Clear documentation + deprecation path

#### Implementation:

**File**: `web/lib/services/base-service.ts` (MODIFY)

````typescript
/**
 * ⚠️ DEPRECATED: This method does NOT provide true transactions.
 *
 * Supabase JS client doesn't support transactions. Operations execute sequentially
 * but are NOT rolled back on failure. Use this pattern instead:
 *
 * @example Correct Atomic Operations
 * ```typescript
 * // Option 1: Database RPC function (RECOMMENDED)
 * await supabase.rpc('create_invoice_atomic', {
 *   invoice_data,
 *   items
 * });
 *
 * // Option 2: Manual compensation on failure
 * const invoice = await createInvoice(data);
 * try {
 *   await createInvoiceItems(invoice.id, items);
 * } catch (error) {
 *   await deleteInvoice(invoice.id); // Manual rollback
 *   throw error;
 * }
 * ```
 *
 * For complex multi-step operations requiring atomicity:
 * 1. Create a PostgreSQL function in db/migrations/
 * 2. Call via supabase.rpc()
 * 3. Database handles transactions internally
 *
 * @deprecated Use database RPC functions for true atomicity
 */
protected async executeTransaction<T>(
  operations: () => Promise<T>
): Promise<ServiceResult<T>> {
  // This is NOT atomic - operations execute sequentially without rollback
  console.warn('[BaseService] executeTransaction is deprecated - see docs for atomic patterns');
  return this.handleError(operations, 'Transaction failed');
}
````

**Documentation**: `web/docs/ATOMIC_OPERATIONS.md` (NEW)

```markdown
# Atomic Operations Guide

## Problem

Supabase JS client doesn't support database transactions. Multiple operations
can partially succeed, leaving inconsistent data.

## Solutions

### 1. Database RPC Functions (RECOMMENDED)

Create PostgreSQL functions for complex operations:
...
```

**Acceptance Criteria**:

- [ ] Deprecated warning added
- [ ] Documentation created with examples
- [ ] Existing uses audited
- [ ] Migration plan for current callers

**Estimated Time**: 2 hours  
**Risk**: Low (documentation only)

---

### 🟡 3.3 Migration Idempotency

**Problem**: Migrations crash if run twice  
**Impact**: Production rollbacks fail  
**Solution**: Add idempotency checks to all DDL migrations

#### Template Pattern:

```sql
-- Migration 001: Example Idempotent Migration
-- Safe to run multiple times

-- Add column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pets' AND column_name='microchip_id'
  ) THEN
    ALTER TABLE pets ADD COLUMN microchip_id TEXT;
  END IF;
END $$;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_pets_microchip ON pets(microchip_id);

-- Add constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_microchip_unique'
  ) THEN
    ALTER TABLE pets ADD CONSTRAINT pets_microchip_unique UNIQUE (microchip_id);
  END IF;
END $$;
```

**Migration Script**: `web/scripts/add-idempotency.ts`

- Reads all 94 migrations
- Detects DDL statements
- Wraps in idempotency checks
- Creates new versions for review

**Acceptance Criteria**:

- [ ] All migrations safe to run twice
- [ ] Rollback test suite created
- [ ] CI tests migrations in both directions
- [ ] Developer guide updated

**Estimated Time**: 8 hours (complex, 94 files)  
**Risk**: High (database changes, requires thorough testing)

---

## Phase 4: Documentation & Cleanup (LOW PRIORITY)

### 🟢 4.1 Generate ER Diagram

**Tools**:

```bash
# Install SchemaSpy or use Supabase CLI
npx supabase db diagram > web/docs/schema.dbml
dbdocs build web/docs/schema.dbml --output web/docs/er-diagram.svg
```

**Acceptance Criteria**:

- [ ] ER diagram generated
- [ ] Updated automatically in CI
- [ ] Embedded in documentation

**Estimated Time**: 1 hour  
**Risk**: None

---

### 🟢 4.2 Migration Changelog

**Template**: `web/db/migrations/CHANGELOG.md`

```markdown
# Database Migration Changelog

## Migration 094: Staff Time-Off Types

- **Date**: 2025-12-10
- **Author**: @dev-team
- **Breaking**: No
- **Rollback**: Safe (new tables only)
- **Dependencies**: Migration 087 (staff_profiles)

### Changes

- Created `staff_time_off_types` table
- Added default types (vacation, sick, personal)

## Migration 093: ...
```

**Estimated Time**: 2 hours  
**Risk**: None

---

### 🟢 4.3 Remove Dead Code

**Targets**:

- `_archive/` folder (move to separate repo archive)
- `storybook-static/` (add to .gitignore)
- Unused npm packages (run `npx depcheck`)

**Estimated Time**: 1 hour  
**Risk**: None (git preserves history)

---

## Implementation Timeline

### Week 1: Critical Path

| Day | Phase | Tasks                                     | Est. Hours |
| --- | ----- | ----------------------------------------- | ---------- |
| Mon | 1     | ESLint + Env Validation                   | 6h         |
| Tue | 1     | Tailwind Pin + JSON Validation            | 3.5h       |
| Wed | 2     | Tenant Constants + API Middleware (start) | 6h         |
| Thu | 2     | API Middleware (finish) + Error i18n      | 6h         |
| Fri | 3     | Color Migration Script                    | 6h         |
| Mon | 3     | Transaction Docs + Migration Idempotency  | 10h        |
| Tue | 4     | ER Diagram + Changelog + Cleanup          | 4h         |

**Total**: ~41.5 hours (~1 week full-time)

---

## Testing Strategy

### After Each Phase:

1. **Unit Tests**: `npm run test:unit`
2. **Integration Tests**: `npm run test:integration`
3. **E2E Tests**: `npm run test:e2e`
4. **Manual Smoke Test**:
   - Login as owner
   - Book appointment
   - Create invoice
   - Verify multi-tenant isolation

### Before Merge:

- [ ] All tests pass
- [ ] ESLint clean
- [ ] Type check passes
- [ ] Visual regression check (screenshots)

---

## Rollback Plan

Each phase is **independently reversible**:

- **Phase 1**: Revert package.json changes
- **Phase 2**: New files only, no existing code modified
- **Phase 3**: Feature flags control new behavior
- **Phase 4**: Documentation only

**Emergency Rollback**:

```bash
git revert <commit-hash>
npm install
npm run build
```

---

## Success Metrics

| Metric                | Before     | Target      | How to Measure             |
| --------------------- | ---------- | ----------- | -------------------------- |
| ESLint Warnings       | 9000       | 0           | `npm run lint`             |
| Hardcoded Colors      | 117        | <10         | `grep -r "bg-.*-[0-9]"`    |
| Hardcoded Tenants     | 529        | <50         | `grep -r "adris\|petlife"` |
| `as any` Usage        | 3          | 0           | `grep -r "as any"`         |
| Migration Failures    | Unknown    | 0           | Rollback test suite        |
| Auth Code Duplication | 313 routes | Centralized | Lines of code              |

---

## Risk Mitigation

| Risk                      | Probability | Impact | Mitigation                |
| ------------------------- | ----------- | ------ | ------------------------- |
| Tests fail after refactor | High        | Medium | Run tests after each file |
| Visual regression         | Medium      | Low    | Screenshot comparison     |
| Migration breaks prod     | Low         | High   | Test on staging first     |
| Performance regression    | Low         | Medium | Benchmark key endpoints   |
| Developer confusion       | Medium      | Low    | Pair programming + docs   |

---

## Next Steps

1. ✅ Review this plan with team
2. ⏳ Create feature branch: `refactor/technical-debt-q1-2026`
3. ⏳ Start Phase 1, Task 1.1
4. ⏳ Daily standup on progress

**Created by**: AI Analysis  
**Approved by**: [Pending]  
**Start Date**: [Pending]
