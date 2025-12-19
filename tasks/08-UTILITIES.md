# Lib & Utilities Cleanup Tasks

> **Priority:** LOW-MEDIUM
> **Total Tasks:** 22
> **Estimated Effort:** 10-14 hours

---

## HIGH: Duplicate Utilities to Consolidate

### UTIL-001: Consolidate Validation Utilities
**Problem:** Multiple validation files with overlapping functionality

**Files:**
- `web/lib/validations/image-validation.ts`
- `web/lib/file-validation.ts`
- `web/lib/validations/` (folder with multiple files)

**Target structure:**
```
web/lib/validations/
├── index.ts              # Barrel export
├── file.ts               # All file validation (images, PDFs, etc.)
├── form.ts               # Form field validation helpers
├── business.ts           # Business rule validation (phone, tax ID)
└── schemas/              # Zod schemas (or move to /schemas)
```

**Consolidate to:**
```typescript
// web/lib/validations/file.ts
export const FILE_VALIDATION = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: { minWidth: 100, minHeight: 100, maxWidth: 4096, maxHeight: 4096 }
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  labResult: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/dicom']
  }
}

export function validateFile(
  file: File,
  config: keyof typeof FILE_VALIDATION
): { valid: boolean; error?: string } {
  const rules = FILE_VALIDATION[config]

  if (file.size > rules.maxSize) {
    return { valid: false, error: `Archivo muy grande (máx ${formatBytes(rules.maxSize)})` }
  }

  if (!rules.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido' }
  }

  return { valid: true }
}

export async function validateImageDimensions(
  file: File
): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const { minWidth, minHeight, maxWidth, maxHeight } = FILE_VALIDATION.image.dimensions
      if (img.width < minWidth || img.height < minHeight) {
        resolve({ valid: false, error: `Imagen muy pequeña (mín ${minWidth}x${minHeight}px)` })
      } else if (img.width > maxWidth || img.height > maxHeight) {
        resolve({ valid: false, error: `Imagen muy grande (máx ${maxWidth}x${maxHeight}px)` })
      } else {
        resolve({ valid: true, dimensions: { width: img.width, height: img.height } })
      }
    }
    img.src = URL.createObjectURL(file)
  })
}
```

**Effort:** 2 hours

---

### UTIL-002: Consolidate Price Formatting
**Problem:** Price formatting logic duplicated in 4+ files

**Files:**
- `web/lib/format.ts` (formatCurrency)
- `web/components/store/price-display.tsx` (inline formatting)
- `web/app/api/invoices/route.ts` (inline formatting)
- Multiple components with `toLocaleString`

**Create single source:**
```typescript
// web/lib/formatting/currency.ts
const CURRENCY_CONFIG = {
  PYG: { locale: 'es-PY', currency: 'PYG', decimals: 0 },
  USD: { locale: 'en-US', currency: 'USD', decimals: 2 },
  BRL: { locale: 'pt-BR', currency: 'BRL', decimals: 2 }
} as const

type CurrencyCode = keyof typeof CURRENCY_CONFIG

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'PYG'
): string {
  const config = CURRENCY_CONFIG[currency]
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  }).format(amount)
}

export function formatPrice(amount: number): string {
  return formatCurrency(amount, 'PYG')
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and thousands separators
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}
```

**Effort:** 1 hour

---

### UTIL-003: Consolidate Date Formatting
**Problem:** Multiple date formatting approaches

**Files:**
- `web/lib/format.ts` (formatDate, formatDateTime)
- `web/lib/date-utils.ts` (if exists)
- Inline `new Date().toLocaleDateString()` in 20+ files

**Create:**
```typescript
// web/lib/formatting/date.ts
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: Date | string | null, pattern = 'dd/MM/yyyy'): string {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: es })
}

export function formatDateTime(date: Date | string | null): string {
  return formatDate(date, "dd/MM/yyyy 'a las' HH:mm")
}

export function formatTime(date: Date | string | null): string {
  return formatDate(date, 'HH:mm')
}

export function formatRelative(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) return `Hoy a las ${format(d, 'HH:mm')}`
  if (isYesterday(d)) return `Ayer a las ${format(d, 'HH:mm')}`

  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? parseISO(start) : start
  const e = typeof end === 'string' ? parseISO(end) : end

  if (format(s, 'yyyy-MM-dd') === format(e, 'yyyy-MM-dd')) {
    return `${format(s, 'dd/MM/yyyy')} ${format(s, 'HH:mm')} - ${format(e, 'HH:mm')}`
  }

  return `${formatDateTime(s)} - ${formatDateTime(e)}`
}
```

**Effort:** 1.5 hours

---

### UTIL-004: Create Unified Formatting Module
**Create barrel export:**
```typescript
// web/lib/formatting/index.ts
export * from './currency'
export * from './date'
export * from './number'
export * from './text'

// web/lib/formatting/number.ts
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-PY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${formatNumber(value * 100, decimals)}%`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// web/lib/formatting/text.ts
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

**Effort:** 1 hour

---

## HIGH: Large Files to Split

### UTIL-005: Split Rate Limiter Module
**File:** `web/lib/rate-limit.ts`
**Lines:** ~434
**Problem:** Multiple rate limiting strategies in one file

**Split to:**
```
web/lib/rate-limit/
├── index.ts              # Barrel export
├── types.ts              # RateLimitConfig, RateLimitResult
├── memory-store.ts       # In-memory rate limiting
├── redis-store.ts        # Redis-based rate limiting
├── middleware.ts         # API route middleware
├── strategies/
│   ├── fixed-window.ts
│   ├── sliding-window.ts
│   └── token-bucket.ts
└── presets.ts            # Pre-configured limiters
```

**Create presets:**
```typescript
// web/lib/rate-limit/presets.ts
import { createRateLimiter } from './index'

export const rateLimiters = {
  // Public endpoints
  public: createRateLimiter({
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 100,
  }),

  // Auth endpoints (stricter)
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  }),

  // API endpoints
  api: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
  }),

  // Expensive operations
  expensive: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),
}
```

**Effort:** 2 hours

---

### UTIL-006: Split Supabase Client Module
**File:** `web/lib/supabase/` directory
**Problem:** Server and client code mixed, types duplicated

**Target structure:**
```
web/lib/supabase/
├── index.ts              # Barrel export (careful with tree-shaking)
├── types.ts              # Database types
├── client.ts             # Browser client only
├── server.ts             # Server client only
├── admin.ts              # Service role client
├── middleware.ts         # Auth middleware
└── helpers/
    ├── auth.ts           # Auth helpers (getUser, getSession)
    ├── storage.ts        # Storage helpers
    └── realtime.ts       # Realtime subscription helpers
```

**Effort:** 1.5 hours

---

## MEDIUM: Missing Error Handling

### UTIL-007: Add Error Handling to API Helpers
**Files:**
- `web/lib/api/errors.ts`
- `web/lib/api/with-auth.ts`

**Add:**
```typescript
// web/lib/api/error-handler.ts
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PostgrestError } from '@supabase/supabase-js'

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    }, { status: 400 })
  }

  // Supabase error
  if (isPostgrestError(error)) {
    // RLS violation
    if (error.code === '42501') {
      return NextResponse.json({
        error: 'FORBIDDEN',
        message: 'No tienes permiso para realizar esta acción'
      }, { status: 403 })
    }

    // Unique constraint
    if (error.code === '23505') {
      return NextResponse.json({
        error: 'CONFLICT',
        message: 'El registro ya existe'
      }, { status: 409 })
    }

    // Foreign key violation
    if (error.code === '23503') {
      return NextResponse.json({
        error: 'BAD_REQUEST',
        message: 'Referencia inválida'
      }, { status: 400 })
    }
  }

  // Generic error
  return NextResponse.json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor'
  }, { status: 500 })
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return typeof error === 'object' && error !== null && 'code' in error
}
```

**Effort:** 1 hour

---

### UTIL-008: Add Retry Logic to External API Calls
**Files:**
- `web/lib/whatsapp.ts`
- Any external API integrations

**Create:**
```typescript
// web/lib/utils/retry.ts
interface RetryOptions {
  maxAttempts?: number
  delayMs?: number
  backoffMultiplier?: number
  retryOn?: (error: unknown) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    retryOn = () => true
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts || !retryOn(error)) {
        throw error
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Usage
const response = await withRetry(
  () => fetch('https://api.whatsapp.com/...'),
  {
    maxAttempts: 3,
    retryOn: (error) => error instanceof Error && error.message.includes('timeout')
  }
)
```

**Effort:** 45 minutes

---

## MEDIUM: Type Safety

### UTIL-009: Add Generic Types to Utility Functions
**Problem:** Many utilities use `any` or missing generics

**Files to update:**
- `web/lib/utils.ts`
- `web/lib/helpers/`

**Examples:**
```typescript
// Before
export function groupBy(array: any[], key: string): Record<string, any[]>

// After
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), item]
    }
  }, {} as Record<string, T[]>)
}

// Before
export function debounce(fn: Function, delay: number)

// After
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

**Effort:** 1.5 hours

---

### UTIL-010: Create Type Guards for Runtime Checks
**Create:**
```typescript
// web/lib/type-guards.ts
import type { Profile, Pet, Appointment } from '@/lib/types'

export function isProfile(obj: unknown): obj is Profile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'tenant_id' in obj &&
    'role' in obj
  )
}

export function isPet(obj: unknown): obj is Pet {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'species' in obj
  )
}

export function isAppointment(obj: unknown): obj is Appointment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'start_time' in obj &&
    'status' in obj
  )
}

// Utility for Supabase responses
export function assertData<T>(
  result: { data: T | null; error: unknown }
): asserts result is { data: T; error: null } {
  if (result.error || !result.data) {
    throw new Error('Data assertion failed')
  }
}
```

**Effort:** 1 hour

---

## MEDIUM: Code Organization

### UTIL-011: Create Barrel Exports for All Lib Modules
**Problem:** Inconsistent import paths

**Create index files:**
```typescript
// web/lib/index.ts (main barrel)
export * from './formatting'
export * from './validations'
export * from './type-guards'
export * from './utils'

// But NOT supabase (tree-shaking issues)

// web/lib/api/index.ts
export * from './errors'
export * from './with-auth'
export * from './pagination'
export * from './rate-limit'
```

**Effort:** 45 minutes

---

### UTIL-012: Organize Hooks by Domain
**Current:**
```
web/hooks/
├── use-toast.ts
├── use-local-storage.ts
├── use-debounce.ts
└── ... (flat structure)
```

**Target:**
```
web/hooks/
├── index.ts              # Barrel export
├── common/               # Generic hooks
│   ├── use-debounce.ts
│   ├── use-throttle.ts
│   ├── use-local-storage.ts
│   └── use-media-query.ts
├── ui/                   # UI-related hooks
│   ├── use-toast.ts
│   ├── use-modal.ts
│   └── use-dropdown.ts
├── data/                 # Data fetching hooks
│   ├── use-pets.ts
│   ├── use-appointments.ts
│   └── use-clients.ts
└── auth/                 # Auth hooks
    ├── use-user.ts
    └── use-profile.ts
```

**Effort:** 1.5 hours

---

### UTIL-013: Create Constants Module
**Problem:** Magic numbers and strings scattered throughout code

**Create:**
```typescript
// web/lib/constants/index.ts
export * from './limits'
export * from './status'
export * from './config'

// web/lib/constants/limits.ts
export const LIMITS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File uploads
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,        // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024,    // 10MB

  // Text fields
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 5000,

  // Business rules
  MAX_PETS_PER_OWNER: 20,
  MAX_APPOINTMENTS_PER_DAY: 50,
  APPOINTMENT_BUFFER_MINUTES: 15,
} as const

// web/lib/constants/status.ts
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  VOID: 'void',
} as const
```

**Effort:** 1.5 hours

---

## LOW: Performance Utilities

### UTIL-014: Add Memoization Utility
**Create:**
```typescript
// web/lib/utils/memoize.ts
export function memoize<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  options: { maxSize?: number; ttlMs?: number } = {}
): T {
  const { maxSize = 100, ttlMs } = options
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    const cached = cache.get(key)

    if (cached) {
      if (!ttlMs || Date.now() - cached.timestamp < ttlMs) {
        return cached.value
      }
      cache.delete(key)
    }

    const result = fn(...args)

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    cache.set(key, { value: result, timestamp: Date.now() })
    return result
  }) as T
}

// Usage
const expensiveCalculation = memoize(
  (input: string) => {
    // Heavy computation
    return result
  },
  { maxSize: 50, ttlMs: 5 * 60 * 1000 } // 5 minutes
)
```

**Effort:** 45 minutes

---

### UTIL-015: Add Request Deduplication
**Create:**
```typescript
// web/lib/utils/dedupe.ts
const pending = new Map<string, Promise<unknown>>()

export async function dedupeRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const existing = pending.get(key)
  if (existing) {
    return existing as Promise<T>
  }

  const promise = fn().finally(() => {
    pending.delete(key)
  })

  pending.set(key, promise)
  return promise
}

// Usage in API calls
export async function getClinicData(slug: string) {
  return dedupeRequest(`clinic:${slug}`, async () => {
    const response = await fetch(`/api/clinics/${slug}`)
    return response.json()
  })
}
```

**Effort:** 30 minutes

---

## LOW: Testing Utilities

### UTIL-016: Create Test Factories
**Create:**
```typescript
// web/lib/test-utils/factories.ts
import { faker } from '@faker-js/faker'
import type { Pet, Profile, Appointment } from '@/lib/types'

export function createMockPet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: faker.string.uuid(),
    tenant_id: 'test-tenant',
    owner_id: faker.string.uuid(),
    name: faker.animal.dog(),
    species: 'dog',
    breed: faker.animal.dog(),
    date_of_birth: faker.date.past({ years: 5 }).toISOString(),
    sex: faker.helpers.arrayElement(['male', 'female']),
    weight_kg: faker.number.float({ min: 1, max: 50, fractionDigits: 1 }),
    is_neutered: faker.datatype.boolean(),
    microchip_number: faker.string.alphanumeric(15),
    created_at: faker.date.recent().toISOString(),
    ...overrides
  }
}

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: faker.string.uuid(),
    tenant_id: 'test-tenant',
    email: faker.internet.email(),
    full_name: faker.person.fullName(),
    phone: faker.phone.number(),
    role: 'owner',
    created_at: faker.date.recent().toISOString(),
    ...overrides
  }
}

export function createMockAppointment(overrides: Partial<Appointment> = {}): Appointment {
  const startTime = faker.date.future()
  return {
    id: faker.string.uuid(),
    tenant_id: 'test-tenant',
    pet_id: faker.string.uuid(),
    vet_id: faker.string.uuid(),
    service_id: faker.string.uuid(),
    start_time: startTime.toISOString(),
    end_time: new Date(startTime.getTime() + 30 * 60000).toISOString(),
    status: 'scheduled',
    created_at: faker.date.recent().toISOString(),
    ...overrides
  }
}
```

**Effort:** 1.5 hours

---

### UTIL-017: Create Supabase Test Mocks
**Create:**
```typescript
// web/lib/test-utils/supabase-mock.ts
import { vi } from 'vitest'

export function createSupabaseMock() {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()
  const mockEq = vi.fn()
  const mockSingle = vi.fn()

  const chainMock = {
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    single: mockSingle,
  }

  mockFrom.mockReturnValue(chainMock)

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file' } }),
      }),
    },
    // Helpers for tests
    __mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
    },
    __setQueryResult: (data: unknown, error: unknown = null) => {
      mockSingle.mockResolvedValue({ data, error })
      mockSelect.mockResolvedValue({ data: Array.isArray(data) ? data : [data], error })
    },
  }
}
```

**Effort:** 1 hour

---

## LOW: Documentation

### UTIL-018: Add JSDoc to All Public Utilities
**Files:** All exported functions in `web/lib/`

**Pattern:**
```typescript
/**
 * Formats a number as currency in Paraguayan Guaraníes.
 *
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: 'PYG')
 * @returns Formatted currency string (e.g., "₲ 150.000")
 *
 * @example
 * formatCurrency(150000) // "₲ 150.000"
 * formatCurrency(99.99, 'USD') // "$99.99"
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'PYG'): string
```

**Effort:** 2 hours

---

### UTIL-019: Create Utility Usage Guide
**Create:** `documentation/lib/utilities.md`

**Contents:**
1. Overview of lib/ structure
2. Formatting utilities with examples
3. Validation utilities with examples
4. API helpers
5. Common patterns
6. Testing utilities

**Effort:** 1.5 hours

---

## LOW: Cleanup

### UTIL-020: Remove Unused Utilities
**Audit and remove:**
- Check each export in `web/lib/` for usage
- Remove dead code
- Update imports

**Files to audit:**
- `web/lib/utils.ts` - Large utility file
- `web/lib/helpers/` - May have unused helpers

**Effort:** 1 hour

---

### UTIL-021: Standardize Utility Function Naming
**Conventions:**
- `format*` - Formatting functions (formatDate, formatCurrency)
- `validate*` - Validation functions (validateEmail, validatePhone)
- `parse*` - Parsing functions (parseDate, parseCurrency)
- `is*` - Boolean checks (isStaff, isValidEmail)
- `get*` - Data retrieval (getUser, getClinicData)
- `create*` - Factory functions (createClient, createMock)
- `with*` - Higher-order functions (withAuth, withRetry)

**Effort:** 45 minutes

---

### UTIL-022: Add Unit Tests for All Utilities
**Missing tests for:**
- Formatting functions
- Validation functions
- Rate limiting
- API helpers

**Create:**
```typescript
// web/lib/__tests__/formatting.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatRelative } from '../formatting'

describe('formatCurrency', () => {
  it('formats PYG correctly', () => {
    expect(formatCurrency(150000)).toBe('₲ 150.000')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('₲ 0')
  })

  it('handles negative amounts', () => {
    expect(formatCurrency(-5000)).toBe('-₲ 5.000')
  })
})

describe('formatDate', () => {
  it('formats date with default pattern', () => {
    expect(formatDate('2024-01-15')).toBe('15/01/2024')
  })

  it('handles null', () => {
    expect(formatDate(null)).toBe('')
  })
})
```

**Effort:** 3 hours

---

## Checklist

```
HIGH (Duplicates):
[ ] UTIL-001: Consolidate validation utilities
[ ] UTIL-002: Consolidate price formatting
[ ] UTIL-003: Consolidate date formatting
[ ] UTIL-004: Create unified formatting module
[ ] UTIL-005: Split rate limiter module
[ ] UTIL-006: Split Supabase client module

MEDIUM (Quality):
[ ] UTIL-007: Add error handling to API helpers
[ ] UTIL-008: Add retry logic
[ ] UTIL-009: Add generic types
[ ] UTIL-010: Create type guards
[ ] UTIL-011: Create barrel exports
[ ] UTIL-012: Organize hooks by domain
[ ] UTIL-013: Create constants module

LOW (Polish):
[ ] UTIL-014: Add memoization utility
[ ] UTIL-015: Add request deduplication
[ ] UTIL-016: Create test factories
[ ] UTIL-017: Create Supabase test mocks
[ ] UTIL-018: Add JSDoc documentation
[ ] UTIL-019: Create utility usage guide
[ ] UTIL-020: Remove unused utilities
[ ] UTIL-021: Standardize naming
[ ] UTIL-022: Add unit tests
```
