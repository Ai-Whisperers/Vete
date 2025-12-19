# Test Utilities - Quick Reference

## Import

```typescript
import {
  // Factories
  createMockPet,
  createMockProfile,
  createMockAppointment,
  createMockInvoice,
  createMockService,
  createMockHospitalization,
  createMockLabOrder,
  createMockPets,
  createMockAppointments,
  resetIdCounter,

  // Supabase Mock
  createSupabaseMock,

  // Re-exported testing utilities
  describe, it, expect, beforeEach, afterEach, vi,
  render, screen, fireEvent, waitFor
} from '@/lib/test-utils'
```

## Quick Setup

```typescript
describe('My Test Suite', () => {
  beforeEach(() => {
    resetIdCounter() // Always reset for predictable IDs
  })

  it('should test something', () => {
    const pet = createMockPet({ name: 'Max' })
    expect(pet.name).toBe('Max')
  })
})
```

## Factories Cheat Sheet

```typescript
// Create single items
const pet = createMockPet({ name: 'Fido', species: 'dog' })
const owner = createMockProfile({ role: 'owner', full_name: 'John Doe' })
const vet = createMockProfile({ role: 'vet' })
const appointment = createMockAppointment({ status: 'confirmed' })
const invoice = createMockInvoice({ subtotal: 100000 })
const service = createMockService({ name: 'Consulta', base_price: 50000 })
const hospitalization = createMockHospitalization({ status: 'active' })
const labOrder = createMockLabOrder({ priority: 'stat' })

// Create multiple items
const pets = createMockPets(5, { species: 'cat' })
const appointments = createMockAppointments(10)
```

## Supabase Mock Cheat Sheet

### Basic Setup

```typescript
const { supabase, helpers } = createSupabaseMock()
```

### Set Query Results

```typescript
// Single result
helpers.setQueryResult(mockPet)
await supabase.from('pets').select('*').single() // Returns mockPet

// Multiple results
helpers.setQueryResult([pet1, pet2])
await supabase.from('pets').select('*') // Returns [pet1, pet2]
```

### Set Authenticated User

```typescript
helpers.setUser({ id: 'user-123', email: 'test@example.com' })
const { data: { user } } = await supabase.auth.getUser()
```

### Set Error

```typescript
helpers.setError(new Error('Database error'))
const result = await supabase.from('pets').select('*')
// result.error will be defined, result.data will be null
```

### Reset Mocks

```typescript
helpers.reset() // Clear all mocks
```

## Common Patterns

### API Route Testing

```typescript
it('returns data for authenticated user', async () => {
  const { supabase, helpers } = createSupabaseMock()
  const user = createMockProfile()

  helpers.setUser({ id: user.id, email: user.email })
  helpers.setQueryResult(mockData)

  const response = await GET(request)
  expect(response.status).toBe(200)
})
```

### Component Testing

```typescript
it('renders pet list', async () => {
  const pets = createMockPets(3)
  const { supabase, helpers } = createSupabaseMock()
  helpers.setQueryResult(pets)

  render(<PetList />)

  await waitFor(() => {
    expect(screen.getByText(pets[0].name)).toBeInTheDocument()
  })
})
```

### Server Action Testing

```typescript
it('creates appointment', async () => {
  const { supabase, helpers } = createSupabaseMock()
  const owner = createMockProfile({ role: 'owner' })
  const pet = createMockPet({ owner_id: owner.id })

  helpers.setUser({ id: owner.id, email: owner.email })
  helpers.setQueryResult(pet)

  const result = await createAppointment({ petId: pet.id, ... })
  expect(result.success).toBe(true)
})
```

### Error Testing

```typescript
it('handles database errors', async () => {
  const { supabase, helpers } = createSupabaseMock()
  helpers.setError(new Error('Connection failed'))

  const result = await supabase.from('pets').select('*')
  expect(result.error).toBeDefined()
  expect(result.data).toBeNull()
})
```

### Multi-Tenant Testing

```typescript
it('isolates tenant data', async () => {
  const clinic1Pet = createMockPet({ tenant_id: 'clinic-1' })
  const clinic2User = createMockProfile({ tenant_id: 'clinic-2' })

  helpers.setUser({ id: clinic2User.id, email: clinic2User.email })
  helpers.setQueryResult([]) // RLS prevents access

  const result = await supabase.from('pets').select('*')
  expect(result.data).toHaveLength(0)
})
```

## Default Values Reference

### createMockPet
- `species`: 'dog'
- `breed`: 'Mixed'
- `sex`: Random male/female
- `weight_kg`: Random 0-30
- `tenant_id`: 'test-tenant'

### createMockProfile
- `role`: 'owner'
- `email`: 'user{id}@test.com'
- `phone`: Random PY number
- `tenant_id`: 'test-tenant'

### createMockAppointment
- `status`: 'pending'
- `start_time`: Random next 7 days
- `end_time`: 30 min after start
- `reason`: 'Test appointment'
- `tenant_id`: 'test-tenant'

### createMockInvoice
- `status`: 'draft'
- `subtotal`: Random 0-500,000
- `tax_rate`: 0.1 (10%)
- `tax_amount`: Calculated
- `total_amount`: Calculated
- `tenant_id`: 'test-tenant'

### createMockService
- `category`: 'consultation'
- `base_price`: Random 0-200,000
- `duration_minutes`: 30
- `is_active`: true
- `tenant_id`: 'test-tenant'

## Tips

1. Always call `resetIdCounter()` in `beforeEach()`
2. Override only what you need - factories provide good defaults
3. Use `helpers.reset()` if you need clean mocks mid-test
4. Test both success and error paths
5. Use batch factories for testing lists/pagination
6. Mock authentication with `setUser()` before testing protected routes

## Common Mistakes to Avoid

- Forgetting to call `resetIdCounter()` (leads to flaky tests)
- Not setting user before testing authenticated endpoints
- Hardcoding IDs instead of using generated ones
- Not testing error cases
- Sharing state between tests

## File Locations

- Source: `web/lib/test-utils/`
- Tests: `web/tests/unit/test-utilities.test.ts`
- Docs: `web/lib/test-utils/README.md`
- Examples: `web/lib/test-utils/EXAMPLES.md`
