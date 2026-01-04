# Test Suite Improvement Plan

## Phase 1: Foundation Fixes (Week 1)

### 1.1 Extract Pure Functions from Tests

**Problem**: Tests define their own functions instead of importing from source.

**Fix**: Create real lib modules for the logic currently defined in tests.

| Test File | Logic to Extract | Target Location |
|-----------|------------------|-----------------|
| `booking-wizard.test.tsx` | `canNavigateToStep`, `isSelectionComplete` | `lib/booking/navigation.ts` |
| `invoice-form.test.tsx` | `calculateLineTotal`, `isDueDateValid` | `lib/invoices/calculations.ts` |
| `calendar-utils.test.tsx` | `getBusinessHours`, `isSlotAvailable` | `lib/calendar/availability.ts` |
| `cart-operations.test.tsx` | `calculateCartTotal`, `validateStock` | `lib/cart/operations.ts` |
| `admission-workflow.test.ts` | `generateHospNumber`, `isKennelAvailable` | `lib/hospitalization/admission.ts` |
| `vitals-recording.test.ts` | `isVitalNormal`, `calculatePainLevel` | `lib/clinical/vitals.ts` |
| `coupon-application.test.ts` | `validateCoupon`, `calculateDiscount` | `lib/store/coupons.ts` |
| `drug-dosage-calculations.test.ts` | `calculateDosage`, `getMaxSafeDose` | `lib/clinical/dosage.ts` |
| `growth-chart-percentiles.test.ts` | `calculatePercentile`, `interpretWeight` | `lib/clinical/growth.ts` |

**Template for extraction**:

```typescript
// lib/booking/navigation.ts
export type BookingStep = 'service' | 'pet' | 'datetime' | 'confirm' | 'success'

export interface BookingSelection {
  serviceId: string | null
  petId: string | null
  date: string
  time_slot: string
}

export const STEP_ORDER: BookingStep[] = ['service', 'pet', 'datetime', 'confirm']

export function canNavigateToStep(
  currentStep: BookingStep,
  targetStep: BookingStep,
  selection: BookingSelection
): boolean {
  const currentIndex = STEP_ORDER.indexOf(currentStep)
  const targetIndex = STEP_ORDER.indexOf(targetStep)

  if (targetIndex < currentIndex) return true
  if (targetStep === 'pet' && !selection.serviceId) return false
  if (targetStep === 'datetime' && !selection.petId) return false
  if (targetStep === 'confirm' && !selection.date) return false

  return true
}

// Then update test to import:
// import { canNavigateToStep } from '@/lib/booking/navigation'
```

### 1.2 Un-skip Auth Tests

**File**: `tests/integration/auth/login.test.ts`

**Current State**:
```typescript
test.skip('succeeds with valid owner credentials', async () => {})
```

**Fix**: Create test user seeding

```typescript
// tests/__helpers__/seed-auth-users.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const TEST_USERS = {
  owner: { email: 'test-owner@vete.test', password: 'TestPass123!', role: 'owner' },
  vet: { email: 'test-vet@vete.test', password: 'TestPass123!', role: 'vet' },
  admin: { email: 'test-admin@vete.test', password: 'TestPass123!', role: 'admin' },
}

export async function seedTestUsers() {
  for (const [key, user] of Object.entries(TEST_USERS)) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    })
    if (error && !error.message.includes('already exists')) throw error
  }
}

export async function cleanupTestUsers() {
  // Delete test users after test run
}
```

### 1.3 Create Shared Mock Factory

**File**: `tests/__helpers__/mock-supabase.ts`

```typescript
import { vi } from 'vitest'

export interface MockSupabaseConfig {
  user?: { id: string; email: string } | null
  profile?: { tenant_id: string; role: string } | null
  queryResults?: Record<string, any>
}

export function createMockSupabase(config: MockSupabaseConfig = {}) {
  const {
    user = { id: 'test-user', email: 'test@test.com' },
    profile = { tenant_id: 'test-tenant', role: 'vet' },
    queryResults = {},
  } = config

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Not authenticated' },
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      const result = queryResults[table] ?? { data: [], error: null }
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(result),
        order: vi.fn().mockResolvedValue(result),
      }
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}
```

---

## Phase 2: Real Integration Tests (Week 2)

### 2.1 Set Up Test Database

**File**: `vitest.config.ts` update

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    globalSetup: './tests/global-setup.ts',
    env: {
      SUPABASE_URL: process.env.SUPABASE_TEST_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_TEST_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_TEST_SERVICE_KEY,
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
  },
})
```

**File**: `tests/global-setup.ts`

```typescript
import { seedTestUsers } from './__helpers__/seed-auth-users'
import { seedTestTenants } from './__helpers__/seed-tenants'

export default async function globalSetup() {
  console.log('🌱 Seeding test database...')
  await seedTestTenants()
  await seedTestUsers()
  console.log('✅ Test database ready')
}
```

### 2.2 Create Real API Integration Tests

**File**: `tests/integration/api/pets.real.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestClient, loginAs } from '@/tests/__helpers__/supabase-real'

describe('Pets API (Real Integration)', () => {
  let client: SupabaseClient
  let testPetId: string

  beforeAll(async () => {
    client = await loginAs('owner')
  })

  afterAll(async () => {
    // Cleanup created test data
    if (testPetId) {
      await client.from('pets').delete().eq('id', testPetId)
    }
  })

  it('should create a pet for authenticated owner', async () => {
    const { data, error } = await client
      .from('pets')
      .insert({
        name: 'Test Pet',
        species: 'dog',
        breed: 'Mixed',
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.name).toBe('Test Pet')
    testPetId = data.id
  })

  it('should not see pets from other tenants', async () => {
    const { data } = await client
      .from('pets')
      .select('*')
      .eq('tenant_id', 'other-tenant')

    expect(data).toHaveLength(0)
  })
})
```

### 2.3 Add RLS Mutation Tests

**File**: `tests/security/rls-mutations.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createTestClient, loginAs } from '@/tests/__helpers__/supabase-real'

describe('RLS Mutation Security', () => {
  it('should block UPDATE to other tenant pets', async () => {
    const client = await loginAs('owner', 'tenant-a')

    const { error } = await client
      .from('pets')
      .update({ name: 'Hacked' })
      .eq('tenant_id', 'tenant-b')

    expect(error).not.toBeNull()
    // Or data should be empty (RLS silently filters)
  })

  it('should block DELETE on other tenant invoices', async () => {
    const client = await loginAs('admin', 'tenant-a')

    const { error } = await client
      .from('invoices')
      .delete()
      .eq('tenant_id', 'tenant-b')

    expect(error).not.toBeNull()
  })

  it('should block owner from accessing other owner pets', async () => {
    const client = await loginAs('owner', 'tenant-a', 'owner-1')

    const { data } = await client
      .from('pets')
      .select('*')
      .eq('owner_id', 'owner-2')

    expect(data).toHaveLength(0)
  })
})
```

---

## Phase 3: Component Render Tests (Week 3)

### 3.1 Create Render Test Utilities

**File**: `tests/__helpers__/render.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from '@/context/cart-context'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

interface TestProvidersProps {
  children: React.ReactNode
}

function TestProviders({ children }: TestProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
      </CartProvider>
    </QueryClientProvider>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options })
}

export * from '@testing-library/react'
```

### 3.2 Add Booking Wizard Render Tests

**File**: `tests/components/booking/booking-wizard.render.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent, waitFor } from '@/tests/__helpers__/render'
import { BookingWizard } from '@/components/booking/booking-wizard'

// Mock necessary hooks
vi.mock('@/lib/hooks/use-services', () => ({
  useServices: () => ({
    data: [
      { id: 'svc-1', name: 'Consulta General', duration: 30, price: 50000 },
      { id: 'svc-2', name: 'Vacunación', duration: 15, price: 30000 },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/lib/hooks/use-user-pets', () => ({
  useUserPets: () => ({
    data: [
      { id: 'pet-1', name: 'Max', species: 'dog' },
    ],
    isLoading: false,
  }),
}))

describe('BookingWizard Render', () => {
  it('renders service selection step initially', () => {
    renderWithProviders(<BookingWizard clinic="adris" />)

    expect(screen.getByText('Seleccionar Servicio')).toBeInTheDocument()
    expect(screen.getByText('Consulta General')).toBeInTheDocument()
    expect(screen.getByText('Vacunación')).toBeInTheDocument()
  })

  it('advances to pet step after selecting service', async () => {
    renderWithProviders(<BookingWizard clinic="adris" />)

    fireEvent.click(screen.getByText('Consulta General'))
    fireEvent.click(screen.getByText('Continuar'))

    await waitFor(() => {
      expect(screen.getByText('Seleccionar Mascota')).toBeInTheDocument()
    })
  })

  it('auto-selects single pet and advances', async () => {
    renderWithProviders(<BookingWizard clinic="adris" />)

    fireEvent.click(screen.getByText('Consulta General'))
    fireEvent.click(screen.getByText('Continuar'))

    await waitFor(() => {
      // With only one pet, it should auto-advance to datetime
      expect(screen.getByText('Seleccionar Fecha y Hora')).toBeInTheDocument()
    })
  })

  it('shows validation error when trying to continue without selection', async () => {
    renderWithProviders(<BookingWizard clinic="adris" />)

    fireEvent.click(screen.getByText('Continuar'))

    await waitFor(() => {
      expect(screen.getByText('Por favor selecciona un servicio')).toBeInTheDocument()
    })
  })
})
```

---

## Phase 4: E2E Critical Paths (Week 4)

### 4.1 Complete Booking Flow

**File**: `e2e/critical/booking-complete.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Complete Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as owner
    await page.goto('/adris/auth/login')
    await page.fill('[name="email"]', 'test-owner@vete.test')
    await page.fill('[name="password"]', 'TestPass123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/adris/portal')
  })

  test('owner can book an appointment', async ({ page }) => {
    // Navigate to booking
    await page.goto('/adris/book')

    // Step 1: Select service
    await page.click('text=Consulta General')
    await page.click('text=Continuar')

    // Step 2: Select pet (or auto-selected)
    await expect(page.locator('text=Max')).toBeVisible()
    await page.click('text=Continuar')

    // Step 3: Select date and time
    await page.click('[data-testid="calendar-next-available"]')
    await page.click('[data-testid="time-slot-10:00"]')
    await page.click('text=Continuar')

    // Step 4: Confirm
    await expect(page.locator('text=Confirmar Cita')).toBeVisible()
    await expect(page.locator('text=Consulta General')).toBeVisible()
    await expect(page.locator('text=Max')).toBeVisible()
    await page.click('text=Confirmar Reserva')

    // Success
    await expect(page.locator('text=¡Cita Confirmada!')).toBeVisible()
  })

  test('owner can cancel a booking', async ({ page }) => {
    // ... cancel flow
  })
})
```

### 4.2 Complete Checkout Flow

**File**: `e2e/critical/checkout-complete.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Complete Checkout Flow', () => {
  test('owner can complete a purchase', async ({ page }) => {
    await page.goto('/adris/store')

    // Add product to cart
    await page.click('[data-testid="product-pro-plan-adult"]')
    await page.click('text=Agregar al Carrito')

    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    await expect(page.locator('text=Pro Plan Adult')).toBeVisible()

    // Checkout
    await page.click('text=Proceder al Pago')

    // Fill shipping (if needed)
    // ...

    // Complete order
    await page.click('text=Confirmar Pedido')

    await expect(page.locator('text=¡Pedido Confirmado!')).toBeVisible()
  })
})
```

---

## Success Metrics

| Metric | Current | Week 1 | Week 2 | Week 4 |
|--------|---------|--------|--------|--------|
| Tests importing real source | 15% | 50% | 70% | 85% |
| Component render tests | 2 | 5 | 15 | 25 |
| E2E critical tests | 0 | 2 | 4 | 6 |
| Skipped tests | 3 | 0 | 0 | 0 |
| RLS mutation tests | 0 | 5 | 10 | 15 |

---

## Immediate Actions Checklist

- [ ] Extract booking navigation logic to `lib/booking/navigation.ts`
- [ ] Extract invoice calculations to `lib/invoices/calculations.ts`
- [ ] Extract cart operations to `lib/cart/operations.ts`
- [ ] Create `tests/__helpers__/mock-supabase.ts`
- [ ] Create `tests/__helpers__/seed-auth-users.ts`
- [ ] Un-skip auth login tests
- [ ] Add 1 real integration test with test DB
- [ ] Add 1 component render test
- [ ] Add 1 E2E booking flow test

---

*Created: January 4, 2026*
