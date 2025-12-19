# Types & Schemas Consolidation Tasks

> **Priority:** HIGH
> **Total Tasks:** 20
> **Estimated Effort:** 8-12 hours

---

## CRITICAL: Duplicate Type Definitions

### TYP-001: Consolidate InvoiceStatus Type
**Files with conflicting definitions:**

| File | Values |
|------|--------|
| `web/lib/types/invoicing.ts` (line 2) | 'draft' \| 'sent' \| 'paid' \| 'partial' \| 'overdue' \| 'cancelled' \| 'void' |
| `web/lib/types/database.ts` (line 21) | 'draft' \| 'sent' \| 'paid' \| 'partial' \| 'overdue' \| 'cancelled' \| 'refunded' |
| `web/lib/schemas/invoice.ts` (line 11) | ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'] |

**Issue:** 'void' vs 'refunded' mismatch, schema missing values

**Solution:**
```typescript
// web/lib/types/database.ts - Single source of truth
export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'paid',
  'partial',
  'overdue',
  'cancelled',
  'void',
  'refunded'
] as const

export type InvoiceStatus = typeof INVOICE_STATUSES[number]
```

```typescript
// web/lib/schemas/invoice.ts - Derive from database types
import { INVOICE_STATUSES } from '@/lib/types/database'

export const invoiceStatusSchema = z.enum(INVOICE_STATUSES)
```

```typescript
// web/lib/types/invoicing.ts - Re-export
export { InvoiceStatus } from './database'
```

**Effort:** 30 minutes

---

### TYP-002: Consolidate PaymentMethod Type
**Files:**
| File | Values |
|------|--------|
| `web/lib/types/invoicing.ts` (line 3) | 'cash' \| 'card' \| 'transfer' \| 'check' \| 'other' |
| `web/lib/types/database.ts` (line 22) | 'cash' \| 'card' \| 'transfer' \| 'check' \| 'credit' \| 'other' |

**Issue:** 'credit' missing from invoicing.ts

**Solution:** Same pattern as TYP-001

**Effort:** 15 minutes

---

### TYP-003: Consolidate PetSpecies Type
**Files:**
| File | Values | Language |
|------|--------|----------|
| `web/lib/schemas/pet.ts` (line 11) | dog, cat, bird, rabbit, hamster, fish, reptile, other | English |
| `web/lib/types/store.ts` (line 9) | perro, gato, ave, reptil, pez, roedor, conejo, otro | Spanish |
| `web/lib/types/database.ts` (line 12) | dog, cat, bird, rabbit, hamster, fish, reptile, other | English |

**Issue:** Inconsistent language between database/forms and store UI

**Solution:**
```typescript
// web/lib/types/database.ts - English for data
export const PET_SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'] as const
export type PetSpecies = typeof PET_SPECIES[number]

// web/lib/i18n/species.ts - Translation map
export const SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  rabbit: 'Conejo',
  hamster: 'Hámster',
  fish: 'Pez',
  reptile: 'Reptil',
  other: 'Otro'
}

// web/lib/types/store.ts - Use translation for UI
import { PET_SPECIES, SPECIES_LABELS } from '@/lib/types/database'
// Use SPECIES_LABELS for display
```

**Effort:** 45 minutes

---

### TYP-004: Consolidate AppointmentStatus Type
**Files:**
| File | Has 'in_progress'? |
|------|-------------------|
| `web/lib/schemas/appointment.ts` (line 11) | Yes |
| `web/lib/types/database.ts` (line 18) | No |

**Solution:**
```typescript
// web/lib/types/database.ts
export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',  // ADD THIS
  'completed',
  'cancelled',
  'no_show'
] as const

export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number]
```

**Effort:** 15 minutes

---

### TYP-005: Consolidate MedicalRecordType
**Files:**
| File | Has 'consultation'? | Has 'exam'? |
|------|-------------------|-------------|
| `web/lib/schemas/medical.ts` (line 44) | Yes | No |
| `web/lib/types/database.ts` (line 19) | No | Yes |

**Solution:** Merge both values
```typescript
export const MEDICAL_RECORD_TYPES = [
  'consultation',
  'exam',
  'surgery',
  'hospitalization',
  'vaccination',
  'treatment',
  'lab_result',
  'prescription',
  'other'
] as const
```

**Effort:** 15 minutes

---

### TYP-006: Consolidate UserRole Type
**Files (all match, but defined 3 times):**
- `web/lib/types/database.ts` (line 11)
- `web/lib/schemas/auth.ts` (line 11)
- Implied in various invoicing types

**Solution:** Single definition in database.ts, re-export elsewhere

**Effort:** 15 minutes

---

### TYP-007: Consolidate Service Type
**Files:**
| File | Purpose |
|------|---------|
| `web/lib/types/clinic-config.ts` (line 592) | JSON config structure |
| `web/lib/types/invoicing.ts` (line 100) | API dropdown selection |
| `web/lib/types/services.ts` (line 52) | Service selection for bookings |

**Solution:** Create specialized types
```typescript
// web/lib/types/service.ts

// Base from database
export interface ServiceBase {
  id: string
  tenant_id: string
  name: string
  description?: string
  base_price: number
  duration_minutes: number
  category?: string
}

// For config files (JSON)
export interface ServiceConfig extends ServiceBase {
  variants?: ServiceVariantConfig[]
  requires_pet?: boolean
}

// For selection dropdowns
export interface ServiceOption {
  id: string
  name: string
  price: number
  duration: number
}

// For invoice line items
export interface ServiceLineItem {
  service_id: string
  name: string
  quantity: number
  unit_price: number
}
```

**Effort:** 45 minutes

---

### TYP-008: Consolidate Pet Type
**Files:**
| File | Fields |
|------|--------|
| `web/lib/types/database.ts` (line 94) | Full row with all fields |
| `web/components/booking/booking-wizard/types.ts` (line 39) | Minimal (id, name, species, breed) |
| `web/components/hospital/admission-form/types.ts` (line 1) | Extended (date_of_birth, weight, owner) |

**Solution:** Create specialized types
```typescript
// web/lib/types/pet.ts

// Full database type
export interface Pet {
  id: string
  owner_id: string
  tenant_id: string
  name: string
  species: PetSpecies
  breed?: string
  date_of_birth?: string
  weight_kg?: number
  microchip_id?: string
  photo_url?: string
  notes?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

// Minimal for selection/display
export interface PetPreview {
  id: string
  name: string
  species: PetSpecies
  breed?: string
}

// For forms with owner info
export interface PetWithOwner extends Pet {
  owner: {
    id: string
    full_name: string
    phone?: string
    email?: string
  }
}

// For booking
export type BookingPet = PetPreview
```

**Effort:** 30 minutes

---

## HIGH: Missing Zod Schemas

### TYP-009: Create Hospitalization Schemas
**File:** `web/lib/schemas/hospitalization.ts` (create)

```typescript
import { z } from 'zod'

export const hospitalizationStatusSchema = z.enum([
  'admitted',
  'in_treatment',
  'stable',
  'critical',
  'recovering',
  'discharged',
  'deceased'
])

export const acuityLevelSchema = z.enum(['low', 'medium', 'high', 'critical'])

export const createHospitalizationSchema = z.object({
  pet_id: z.string().uuid(),
  kennel_id: z.string().uuid(),
  reason: z.string().min(5).max(500),
  acuity_level: acuityLevelSchema,
  estimated_stay_days: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional()
})

export const updateHospitalizationSchema = z.object({
  status: hospitalizationStatusSchema.optional(),
  acuity_level: acuityLevelSchema.optional(),
  notes: z.string().max(2000).optional(),
  discharge_notes: z.string().max(2000).optional()
})

export const vitalsEntrySchema = z.object({
  temperature: z.number().min(35).max(43).optional(),
  heart_rate: z.number().int().min(20).max(300).optional(),
  respiratory_rate: z.number().int().min(5).max(100).optional(),
  pain_score: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).optional()
})
```

**Effort:** 45 minutes

---

### TYP-010: Create Laboratory Schemas
**File:** `web/lib/schemas/laboratory.ts` (create)

```typescript
import { z } from 'zod'

export const labOrderStatusSchema = z.enum([
  'pending',
  'sample_collected',
  'processing',
  'completed',
  'cancelled'
])

export const createLabOrderSchema = z.object({
  pet_id: z.string().uuid(),
  test_ids: z.array(z.string().uuid()).min(1, 'Seleccione al menos un test'),
  panel_id: z.string().uuid().optional(),
  priority: z.enum(['routine', 'urgent', 'stat']).default('routine'),
  notes: z.string().max(500).optional()
})

export const labResultEntrySchema = z.object({
  test_id: z.string().uuid(),
  value: z.string().min(1),
  unit: z.string().optional(),
  is_abnormal: z.boolean().default(false),
  notes: z.string().max(500).optional()
})
```

**Effort:** 30 minutes

---

### TYP-011: Create Insurance Schemas
**File:** `web/lib/schemas/insurance.ts` (create)

```typescript
import { z } from 'zod'

export const insuranceClaimTypeSchema = z.enum([
  'reimbursement',
  'direct_billing',
  'pre_authorization'
])

export const insuranceClaimStatusSchema = z.enum([
  'draft',
  'submitted',
  'under_review',
  'approved',
  'denied',
  'paid',
  'appealed'
])

export const createClaimSchema = z.object({
  policy_id: z.string().uuid(),
  pet_id: z.string().uuid(),
  claim_type: insuranceClaimTypeSchema,
  diagnosis: z.string().min(5).max(500),
  treatment_date: z.string().datetime(),
  amount: z.number().positive(),
  items: z.array(z.object({
    service_id: z.string().uuid().optional(),
    description: z.string().min(1),
    amount: z.number().positive()
  })).min(1),
  notes: z.string().max(2000).optional()
})
```

**Effort:** 30 minutes

---

### TYP-012: Create Calendar/Scheduling Schemas
**File:** `web/lib/schemas/calendar.ts` (create)

```typescript
import { z } from 'zod'

export const timeOffStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled'
])

export const timeOffTypeSchema = z.enum([
  'vacation',
  'sick',
  'personal',
  'training',
  'other'
])

export const createTimeOffSchema = z.object({
  type: timeOffTypeSchema,
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  reason: z.string().max(500).optional()
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['end_date']
})

export const staffScheduleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/)
}).refine(data => data.end_time > data.start_time, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['end_time']
})
```

**Effort:** 30 minutes

---

### TYP-013: Create WhatsApp Schemas
**File:** `web/lib/schemas/whatsapp.ts` (create)

```typescript
import { z } from 'zod'

export const messageDirectionSchema = z.enum(['inbound', 'outbound'])
export const messageStatusSchema = z.enum(['pending', 'sent', 'delivered', 'read', 'failed'])
export const conversationTypeSchema = z.enum(['support', 'appointment', 'general'])

export const sendMessageSchema = z.object({
  to: z.string().regex(/^\+?[0-9]{10,15}$/, 'Número de teléfono inválido'),
  message: z.string().min(1).max(4096),
  template_id: z.string().uuid().optional()
})

export const createConversationSchema = z.object({
  client_id: z.string().uuid(),
  pet_id: z.string().uuid().optional(),
  type: conversationTypeSchema.default('general'),
  initial_message: z.string().min(1).max(4096)
})
```

**Effort:** 20 minutes

---

## HIGH: Type Organization

### TYP-014: Create Comprehensive Types Barrel Export
**File:** `web/lib/types/index.ts` (update)

**Current:** Only exports clinic-config types

**Should export:**
```typescript
// Core types
export * from './database'
export * from './action-result'
export * from './errors'

// Domain types
export * from './appointments'
export * from './calendar'
export * from './clinic-config'
export * from './invoicing'
export * from './services'
export * from './store'
export * from './whatsapp'

// Re-export common types for convenience
export type {
  Pet,
  PetPreview,
  PetWithOwner,
  Profile,
  Appointment,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  Service,
  ServiceOption
} from './database'
```

**Effort:** 30 minutes

---

### TYP-015: Create Schemas Barrel Export
**File:** `web/lib/schemas/index.ts` (create)

```typescript
// Auth
export * from './auth'

// Core entities
export * from './pet'
export * from './medical'
export * from './appointment'

// Business operations
export * from './invoice'
export * from './store'

// Clinical modules
export * from './hospitalization'
export * from './laboratory'

// Other
export * from './insurance'
export * from './calendar'
export * from './whatsapp'
export * from './common'
```

**Effort:** 15 minutes

---

### TYP-016: Move Component Types to Shared Location
**Files to consolidate:**
- `web/components/booking/booking-wizard/types.ts`
- `web/components/consents/blanket-consents/types.ts`
- `web/components/hospital/admission-form/types.ts`

**Move to:**
- `web/lib/types/forms/booking.ts`
- `web/lib/types/forms/consent.ts`
- `web/lib/types/forms/admission.ts`

Or keep in components but import shared base types.

**Effort:** 45 minutes

---

### TYP-017: Move API Route Types to Shared Location
**Inline types in API routes:**
- `api/appointments/slots/route.ts` - `TimeSlot` interface
- `api/clients/route.ts` - `Client`, `PaginationInfo`, `ClientsResponse`
- `api/dashboard/appointments/route.ts` - `DailyStats`, `GroupedAppointments`
- `api/dashboard/revenue/route.ts` - `PaymentsByMethod`, `MonthlyRevenue`
- `api/finance/pl/route.ts` - `ExpenseBreakdown`, `ExpenseRecord`

**Create:** `web/lib/types/api-responses.ts`
```typescript
// Pagination
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// Dashboard
export interface DailyStats {
  date: string
  appointments: number
  revenue: number
}

export interface RevenueByMethod {
  method: PaymentMethod
  total: number
  count: number
}

// etc.
```

**Effort:** 1 hour

---

## MEDIUM: Type Safety Improvements

### TYP-018: Fix 'any' Usage in API Routes
**File:** `web/app/api/clients/route.ts`
**Problem:** Request body not properly typed

**Find and fix all instances:**
```bash
grep -r ": any" web/app/api --include="*.ts"
```

**Replace with proper types or unknown + validation.**

**Effort:** 1 hour

---

### TYP-019: Add Missing Kennel Type
**Problem:** Kennel type used in components but missing from database.ts

**Add:**
```typescript
// web/lib/types/database.ts
export interface Kennel {
  id: string
  tenant_id: string
  name: string
  code: string
  kennel_type: 'standard' | 'icu' | 'isolation' | 'recovery'
  daily_rate: number
  current_status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  current_patient_id?: string
  notes?: string
  created_at: string
  updated_at: string
}
```

**Effort:** 15 minutes

---

### TYP-020: Document Type Naming Conventions
**Create:** `web/lib/types/README.md`

```markdown
# Type Definitions

## Naming Conventions

### Const Arrays (for Zod enums)
```typescript
export const INVOICE_STATUSES = ['draft', 'sent', ...] as const
```

### Types (derived from const arrays)
```typescript
export type InvoiceStatus = typeof INVOICE_STATUSES[number]
```

### Interfaces (for objects)
```typescript
export interface Invoice {
  id: string
  // ...
}
```

### Specialized Types
- `*Base` - Core fields shared across variants
- `*Preview` - Minimal fields for lists/selections
- `*WithRelations` - Extended with joined data
- `*FormData` - For form submissions
- `*Option` - For select dropdowns

## File Organization

| File | Contains |
|------|----------|
| `database.ts` | All database entity types, enums, base interfaces |
| `action-result.ts` | Server action response types |
| `api-responses.ts` | API route response types |
| `forms/*.ts` | Form-specific types |
| `[domain].ts` | Domain-specific extensions |

## Import Patterns

```typescript
// Prefer specific imports
import { Invoice, InvoiceStatus } from '@/lib/types/database'

// Or use barrel export
import type { Invoice, InvoiceStatus } from '@/lib/types'
```
```

**Effort:** 30 minutes

---

## Checklist

```
CRITICAL (Fix Duplicates):
[ ] TYP-001: InvoiceStatus
[ ] TYP-002: PaymentMethod
[ ] TYP-003: PetSpecies (+ translations)
[ ] TYP-004: AppointmentStatus
[ ] TYP-005: MedicalRecordType
[ ] TYP-006: UserRole
[ ] TYP-007: Service types
[ ] TYP-008: Pet types

HIGH (Create Schemas):
[ ] TYP-009: Hospitalization schemas
[ ] TYP-010: Laboratory schemas
[ ] TYP-011: Insurance schemas
[ ] TYP-012: Calendar schemas
[ ] TYP-013: WhatsApp schemas

HIGH (Organization):
[ ] TYP-014: Types barrel export
[ ] TYP-015: Schemas barrel export
[ ] TYP-016: Move component types
[ ] TYP-017: Move API route types

MEDIUM (Quality):
[ ] TYP-018: Fix 'any' usage
[ ] TYP-019: Add Kennel type
[ ] TYP-020: Document conventions
```
