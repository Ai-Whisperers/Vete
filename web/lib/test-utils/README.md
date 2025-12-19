# Test Utilities

This directory contains reusable test utilities, mock factories, and helpers for testing the Vete veterinary platform.

## Quick Start

```typescript
import {
  createMockPet,
  createMockAppointment,
  createSupabaseMock,
  resetIdCounter
} from '@/lib/test-utils'

describe('My Feature', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  it('should work with mock data', () => {
    const pet = createMockPet({ name: 'Fido' })
    expect(pet.name).toBe('Fido')
  })
})
```

## Factory Functions

### Pet Factories

#### `createMockPet(overrides?: Partial<Pet>): Pet`

Creates a mock pet with sensible defaults.

```typescript
const pet = createMockPet({
  name: 'Fido',
  species: 'dog',
  weight_kg: 15
})
```

**Default values:**
- `species`: 'dog'
- `breed`: 'Mixed'
- `sex`: Random male/female
- `weight_kg`: Random 0-30 kg
- `tenant_id`: 'test-tenant'

#### `createMockPets(count: number, overrides?: Partial<Pet>): Pet[]`

Creates multiple mock pets at once.

```typescript
const pets = createMockPets(5, { species: 'cat' })
```

### Profile Factories

#### `createMockProfile(overrides?: Partial<Profile>): Profile`

Creates a mock user profile.

```typescript
const vet = createMockProfile({
  role: 'vet',
  full_name: 'Dr. Smith'
})
```

**Default values:**
- `role`: 'owner'
- `email`: 'user{id}@test.com'
- `phone`: Random Paraguayan phone number
- `tenant_id`: 'test-tenant'

### Appointment Factories

#### `createMockAppointment(overrides?: Partial<Appointment>): Appointment`

Creates a mock appointment with proper time ranges.

```typescript
const appointment = createMockAppointment({
  status: 'confirmed',
  vet_id: 'vet-123'
})
```

**Default values:**
- `status`: 'pending'
- `start_time`: Random time in next 7 days
- `end_time`: 30 minutes after start_time
- `reason`: 'Test appointment'

#### `createMockAppointments(count: number, overrides?: Partial<Appointment>): Appointment[]`

Creates multiple appointments.

### Invoice Factories

#### `createMockInvoice(overrides?: Partial<Invoice>): Invoice`

Creates a mock invoice with calculated totals.

```typescript
const invoice = createMockInvoice({
  subtotal: 100000,
  status: 'paid'
})
```

**Features:**
- Automatically calculates tax (10%)
- Sets `total_amount` = subtotal + tax
- Sets `balance_due` = total_amount - amount_paid

### Service Factories

#### `createMockService(overrides?: Partial<Service>): Service`

Creates a mock service offering.

```typescript
const service = createMockService({
  name: 'Consulta General',
  base_price: 150000,
  duration_minutes: 30
})
```

### Hospitalization Factories

#### `createMockHospitalization(overrides?: Partial<Hospitalization>): Hospitalization`

Creates a mock hospitalization record.

```typescript
const hospitalization = createMockHospitalization({
  status: 'active',
  acuity_level: 'critical'
})
```

### Lab Order Factories

#### `createMockLabOrder(overrides?: Partial<LabOrder>): LabOrder`

Creates a mock lab order.

```typescript
const labOrder = createMockLabOrder({
  status: 'completed',
  priority: 'stat'
})
```

## Supabase Mocking

### `createSupabaseMock<T>()`

Creates a fully mocked Supabase client with helpers for easy test setup.

```typescript
const { supabase, helpers } = createSupabaseMock()

// Set query results
helpers.setQueryResult(mockPet)

// Test your code
const result = await supabase.from('pets').select('*').single()
expect(result.data).toEqual(mockPet)
```

### Available Methods

#### `helpers.setQueryResult(data, error?)`

Sets the result for queries. Works with both single items and arrays.

```typescript
// Single item
helpers.setQueryResult(mockPet)
await supabase.from('pets').select('*').single() // Returns mockPet

// Array of items
helpers.setQueryResult([pet1, pet2])
await supabase.from('pets').select('*') // Returns [pet1, pet2]
```

#### `helpers.setUser(user)`

Sets the authenticated user.

```typescript
helpers.setUser({ id: 'user-123', email: 'test@example.com' })

const { data: { user } } = await supabase.auth.getUser()
expect(user.id).toBe('user-123')
```

#### `helpers.setError(error)`

Sets an error for queries.

```typescript
helpers.setError(new Error('Database error'))

const result = await supabase.from('pets').select('*')
expect(result.error).toBeDefined()
expect(result.data).toBeNull()
```

#### `helpers.reset()`

Clears all mocks.

```typescript
helpers.reset()
```

### Mocked Features

The Supabase mock includes:

**Query Builder:**
- `from()`, `select()`, `insert()`, `update()`, `delete()`, `upsert()`
- `eq()`, `neq()`, `gt()`, `gte()`, `lt()`, `lte()`
- `like()`, `ilike()`, `is()`, `in()`
- `order()`, `limit()`, `range()`
- `single()`, `maybeSingle()`

**Authentication:**
- `auth.getUser()`
- `auth.getSession()`
- `auth.signIn()`
- `auth.signOut()`
- `auth.signUp()`

**Storage:**
- `storage.from().upload()`
- `storage.from().download()`
- `storage.from().getPublicUrl()`
- `storage.from().remove()`
- `storage.from().list()`

**RPC:**
- `rpc()`

## Utility Functions

### `resetIdCounter()`

Resets the ID counter used by factories. **Call this in `beforeEach()`** to ensure consistent test data.

```typescript
describe('My Test Suite', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  it('creates predictable IDs', () => {
    const pet = createMockPet()
    expect(pet.id).toBe('test-1')
  })
})
```

## Complete Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createMockPet,
  createMockProfile,
  createSupabaseMock,
  resetIdCounter
} from '@/lib/test-utils'

describe('Pet Management', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  it('should fetch pets for a user', async () => {
    // Arrange
    const { supabase, helpers } = createSupabaseMock()
    const owner = createMockProfile({ role: 'owner' })
    const pets = [
      createMockPet({ name: 'Fido', owner_id: owner.id }),
      createMockPet({ name: 'Whiskers', owner_id: owner.id })
    ]

    helpers.setUser({ id: owner.id, email: owner.email })
    helpers.setQueryResult(pets)

    // Act
    const result = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', owner.id)

    // Assert
    expect(result.data).toHaveLength(2)
    expect(result.data[0].name).toBe('Fido')
    expect(result.data[1].name).toBe('Whiskers')
  })

  it('should handle errors gracefully', async () => {
    // Arrange
    const { supabase, helpers } = createSupabaseMock()
    helpers.setError(new Error('Database connection failed'))

    // Act
    const result = await supabase.from('pets').select('*')

    // Assert
    expect(result.error).toBeDefined()
    expect(result.data).toBeNull()
  })
})
```

## Best Practices

1. **Always reset ID counter** in `beforeEach()` for predictable test data
2. **Use factories over manual objects** - they have sensible defaults and match type definitions
3. **Override only what you need** - factories provide good defaults
4. **Reset mocks** between tests if needed with `helpers.reset()`
5. **Test both happy and error paths** using `setQueryResult()` and `setError()`

## Adding New Factories

When adding a new factory:

1. Import the type from `@/lib/types`
2. Create a factory function following the naming pattern `createMock{Type}`
3. Provide sensible defaults
4. Allow overrides via `Partial<Type>`
5. Export the function
6. Add documentation here

Example:

```typescript
export function createMockVaccine(overrides: Partial<Vaccine> = {}): Vaccine {
  return {
    id: generateId(),
    pet_id: generateId(),
    name: 'Rabies',
    status: 'verified',
    administered_date: new Date().toISOString(),
    ...overrides,
  }
}
```
