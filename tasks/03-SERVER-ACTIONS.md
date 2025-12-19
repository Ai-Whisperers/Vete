# Server Actions Refactoring Tasks

> **Priority:** HIGH
> **Total Tasks:** 23
> **Estimated Effort:** 12-16 hours

---

## CRITICAL: Missing Validation & Auth

### ACT-001: Add Authentication to send-email.ts
**File:** `web/app/actions/send-email.ts`
**Lines:** 10-28
**Risk:** CRITICAL - Unauthenticated email sending

**Current:**
```typescript
export async function sendEmail(params: EmailParams) {
  // NO AUTH CHECK - anyone can send emails
  const { to, subject, html, text } = params
  // ...
}
```

**Fix:**
```typescript
export async function sendEmail(params: EmailParams): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'No autorizado' }
  }

  // Validate user has permission to send emails
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Sin permisos para enviar correos' }
  }

  const { to, subject, html, text } = params
  // ... rest of function
}
```

**Effort:** 15 minutes

---

### ACT-002: Add Zod Validation to assign-tag.ts
**File:** `web/app/actions/assign-tag.ts`
**Problem:** No validation, direct parameter usage

**Current:**
```typescript
export async function assignTagToPet(tagCode: string, petId: string) {
  // Direct usage without validation
}
```

**Fix:**
```typescript
import { z } from 'zod'

const assignTagSchema = z.object({
  tagCode: z.string().min(6).max(20).regex(/^[A-Z0-9]+$/),
  petId: z.string().uuid('ID de mascota inválido')
})

export async function assignTagToPet(tagCode: string, petId: string): Promise<ActionResult<void>> {
  const validation = assignTagSchema.safeParse({ tagCode, petId })
  if (!validation.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      fieldErrors: validation.error.flatten().fieldErrors
    }
  }

  // ... rest
}
```

**Effort:** 20 minutes

---

### ACT-003: Add Validation to network-actions.ts
**File:** `web/app/actions/network-actions.ts`
**Problem:** No validation

**Effort:** 20 minutes

---

### ACT-004: Validate Status Transitions in update-appointment.ts
**File:** `web/app/actions/update-appointment.ts`
**Lines:** 24
**Problem:** `newStatus` accepted as string without validation

**Current:**
```typescript
export async function updateAppointmentStatus(appointmentId: string, newStatus: string) {
  // No validation of allowed status transitions
}
```

**Fix:**
```typescript
import { z } from 'zod'

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const

const updateStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  newStatus: z.enum(APPOINTMENT_STATUSES)
})

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: []
}

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: string
): Promise<ActionResult<void>> {
  const validation = updateStatusSchema.safeParse({ appointmentId, newStatus })
  if (!validation.success) {
    return { success: false, error: 'Estado inválido' }
  }

  // Get current status
  const { data: appointment } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', appointmentId)
    .single()

  // Validate transition
  if (!VALID_TRANSITIONS[appointment.status]?.includes(newStatus)) {
    return { success: false, error: `No se puede cambiar de ${appointment.status} a ${newStatus}` }
  }

  // ... rest
}
```

**Effort:** 30 minutes

---

### ACT-005: Add Validation to safety.ts
**File:** `web/app/actions/safety.ts`
**Problem:** No validation on location/contact strings

**Effort:** 20 minutes

---

### ACT-006: Add Validation to invoices.ts
**File:** `web/app/actions/invoices.ts`
**Lines:** 44+
**Problem:** `InvoiceFormData` parameter not validated

**Create schema:**
```typescript
// web/lib/schemas/invoice-form.ts
import { z } from 'zod'

export const invoiceItemSchema = z.object({
  item_type: z.enum(['service', 'product', 'custom']),
  service_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative()
})

export const invoiceFormSchema = z.object({
  client_id: z.string().uuid(),
  pet_id: z.string().uuid().optional(),
  due_date: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  items: z.array(invoiceItemSchema).min(1, 'Debe agregar al menos un item'),
  tax_rate: z.number().min(0).max(100).default(10)
})

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>
```

**Effort:** 45 minutes

---

## HIGH: Extract Auth Pattern

### ACT-007: Create Server Action Auth Utility
**New File:** `web/lib/actions/with-auth.ts`
**Impact:** Eliminates 50+ duplicate patterns

**Pattern repeated in 24 action files:**
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { success: false, error: 'No autorizado' }

const { data: profile } = await supabase
  .from('profiles')
  .select('role, tenant_id')
  .eq('id', user.id)
  .single()

if (!profile || !['vet', 'admin'].includes(profile.role)) {
  return { success: false, error: 'Sin permisos' }
}
```

**Create utility:**
```typescript
// web/lib/actions/with-auth.ts
import { createClient } from '@/lib/supabase/server'
import { ActionResult } from '@/lib/types/action-result'

interface AuthContext {
  user: { id: string; email: string }
  profile: { id: string; tenant_id: string; role: string; full_name: string }
  supabase: ReturnType<typeof createClient>
  isStaff: boolean
  isAdmin: boolean
}

type AuthenticatedAction<T, Args extends unknown[]> = (
  context: AuthContext,
  ...args: Args
) => Promise<ActionResult<T>>

export function withActionAuth<T, Args extends unknown[]>(
  action: AuthenticatedAction<T, Args>,
  options: { requireStaff?: boolean; requireAdmin?: boolean } = {}
) {
  return async (...args: Args): Promise<ActionResult<T>> => {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'No autorizado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tenant_id, role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Perfil no encontrado' }
    }

    const isStaff = ['vet', 'admin'].includes(profile.role)
    const isAdmin = profile.role === 'admin'

    if (options.requireStaff && !isStaff) {
      return { success: false, error: 'Requiere permisos de personal' }
    }

    if (options.requireAdmin && !isAdmin) {
      return { success: false, error: 'Requiere permisos de administrador' }
    }

    return action({ user, profile, supabase, isStaff, isAdmin }, ...args)
  }
}
```

**Usage example:**
```typescript
// Before (24 lines)
export async function createAppointment(data: AppointmentData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }
  // ... profile check ...
  // ... actual logic ...
}

// After (8 lines)
export const createAppointment = withActionAuth(
  async ({ supabase, profile }, data: AppointmentData) => {
    // Just the actual logic
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({ ...data, tenant_id: profile.tenant_id })
      .select()
      .single()

    return { success: true, data: appointment }
  },
  { requireStaff: true }
)
```

**Effort:** 2 hours (create utility + update 5 pilot files)

---

### ACT-008: Migrate schedules.ts to withActionAuth
**File:** `web/app/actions/schedules.ts`
**Lines:** 28-42, 174-182, 316-324, 465-473, 544-552, 606-614, 658-666
**Impact:** 7 functions with duplicate auth

**Effort:** 45 minutes

---

### ACT-009: Migrate time-off.ts to withActionAuth
**File:** `web/app/actions/time-off.ts`
**Lines:** 26-36, 85-93, 220-235, 373-382, 502-510
**Impact:** 5 functions with duplicate auth

**Effort:** 30 minutes

---

### ACT-010: Migrate whatsapp.ts to withActionAuth
**File:** `web/app/actions/whatsapp.ts`
**Lines:** 23-31, 84-92, 130-138, 202-210, 238-246, 293-302, 357-364, 395-398
**Impact:** 8 functions with duplicate auth

**Effort:** 45 minutes

---

### ACT-011: Migrate invoices.ts to withActionAuth
**File:** `web/app/actions/invoices.ts`
**Lines:** 48-64, 189-205, 345-353, 436-444, 590-598, 775-787, 818-830, 952-956
**Impact:** 8 functions with duplicate auth

**Effort:** 45 minutes

---

## HIGH: Split Large Actions

### ACT-012: Split create-vaccine.ts
**File:** `web/app/actions/create-vaccine.ts`
**Lines:** 227
**Problem:** File upload + validation + complex logic mixed

**Extract to:**
1. `web/lib/actions/file-upload.ts` (~60 lines)
   - `uploadVaccineDocument(file, vaccineId)`
   - Reusable for other file uploads

2. Keep `create-vaccine.ts` (~120 lines)
   - Just vaccine creation logic

**Effort:** 1 hour

---

### ACT-013: Split create-pet.ts
**File:** `web/app/actions/create-pet.ts`
**Lines:** 181
**Problem:** File upload + validation + error mapping all mixed

**Extract:**
- `uploadPetPhoto(file, petId)` to shared file upload utility
- `mapPetCreationError(error)` to error utilities

**Effort:** 45 minutes

---

### ACT-014: Split invoices.ts into Multiple Files
**File:** `web/app/actions/invoices.ts`
**Lines:** 800+
**Problem:** Too many responsibilities

**Split into:**
1. `web/app/actions/invoices/create.ts` (~150 lines)
2. `web/app/actions/invoices/update.ts` (~150 lines)
3. `web/app/actions/invoices/send.ts` (~100 lines)
4. `web/app/actions/invoices/payments.ts` (~100 lines)
5. `web/app/actions/invoices/queries.ts` (~100 lines)
6. `web/app/actions/invoices/index.ts` (re-exports)

**Effort:** 2 hours

---

### ACT-015: Split time-off.ts
**File:** `web/app/actions/time-off.ts`
**Lines:** 500+
**Problem:** Complex date math + overlapping checks

**Extract:**
- `web/lib/time-off/overlap-checker.ts`
- `web/lib/time-off/date-utils.ts`

**Effort:** 1.5 hours

---

## MEDIUM: Error Handling

### ACT-016: Standardize Error Return Pattern
**Problem:** 3 different styles in use

**Standard pattern:**
```typescript
import { ActionResult } from '@/lib/types/action-result'

// Always return ActionResult
export async function myAction(): Promise<ActionResult<MyData>> {
  try {
    // ... logic
    return { success: true, data: result }
  } catch (e) {
    console.error('Action error:', e)
    return { success: false, error: 'Error al procesar la solicitud' }
  }
}
```

**Files to update (use throw pattern):**
- `invite-staff.ts` - `removeInvite` function throws instead of returning

**Effort:** 1 hour

---

### ACT-017: Add Error Context Logging
**Files with generic catches:**
- `invite-client.ts` (line 228-233)
- `whatsapp.ts` (line 69-72)

**Pattern:**
```typescript
} catch (e) {
  console.error('Failed to invite client:', {
    error: e,
    email: data.email,
    tenant_id: profile.tenant_id,
    timestamp: new Date().toISOString()
  })
  return { success: false, error: 'Error al enviar invitación' }
}
```

**Effort:** 30 minutes

---

### ACT-018: Handle Silent Failures
**Files:**
- `create-medical-record.ts` (line 40) - Continues on file upload failure
- `invoices.ts` (line 551-560) - Email failures silent
- `create-product.ts` (line 180-182) - Image upload silent

**Options:**
1. Fail entire operation
2. Partial success with warnings
3. Keep silent but log

**Recommended:** Return warnings array:
```typescript
interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]  // ADD THIS
}
```

**Effort:** 1 hour

---

## MEDIUM: Code Quality

### ACT-019: Extract File Upload Logic
**Pattern repeated in:**
- `create-pet.ts` (lines 176-235)
- `create-vaccine.ts` (lines 139-226)
- `update-product.ts` (lines 164-206)

**Create:**
```typescript
// web/lib/actions/file-upload.ts
interface UploadOptions {
  bucket: string
  folder: string
  allowedTypes: string[]
  maxSizeMB: number
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<ActionResult<{ url: string; path: string }>> {
  // Size validation
  if (file.size > options.maxSizeMB * 1024 * 1024) {
    return { success: false, error: `Archivo muy grande (max ${options.maxSizeMB}MB)` }
  }

  // Type validation
  if (!options.allowedTypes.includes(file.type)) {
    return { success: false, error: 'Tipo de archivo no permitido' }
  }

  // Upload to Supabase storage
  const supabase = await createClient()
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${options.folder}/${fileName}`

  const { data, error } = await supabase.storage
    .from(options.bucket)
    .upload(filePath, file)

  if (error) {
    return { success: false, error: 'Error al subir archivo' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(filePath)

  return { success: true, data: { url: publicUrl, path: filePath } }
}
```

**Effort:** 1.5 hours

---

### ACT-020: Fix SQL Injection Risk in time-off.ts
**File:** `web/app/actions/time-off.ts`
**Line:** 307
**Problem:** String interpolation in filter

**Current:**
```typescript
.or(`and(start_date.lte.${data.end_date},end_date.gte.${data.start_date})`)
```

**Fix:** Use parameterized approach or build filter properly
```typescript
const { data: overlapping } = await supabase
  .from('staff_time_off')
  .select('id')
  .eq('staff_id', staffId)
  .lte('start_date', data.end_date)
  .gte('end_date', data.start_date)
  .not('status', 'eq', 'rejected')
```

**Effort:** 20 minutes

---

### ACT-021: Remove Hardcoded Magic Values
**Files:**
- `time-off.ts` (line 247): Default 10% tax
- `appointments.ts` (line 122): 30-minute default duration
- `auth/actions.ts` (line 229): 30-day due date

**Move to config:**
```typescript
// web/lib/config/defaults.ts
export const DEFAULTS = {
  TAX_RATE: 10,
  APPOINTMENT_DURATION_MINUTES: 30,
  INVOICE_DUE_DAYS: 30,
  SESSION_EXPIRY_DAYS: 30
}
```

**Effort:** 30 minutes

---

### ACT-022: Add Input Sanitization
**Files that trim/normalize (good):**
- `create-pet.ts`
- `create-vaccine.ts`

**Files missing sanitization:**
- `assign-tag.ts`
- `network-actions.ts`
- `safety.ts`

**Pattern:**
```typescript
const sanitizedData = {
  name: data.name.trim(),
  email: data.email.toLowerCase().trim(),
  phone: data.phone.replace(/\D/g, '')  // Remove non-digits
}
```

**Effort:** 30 minutes

---

### ACT-023: Validate Redirect URLs
**Files:**
- `auth/actions.ts` (line 97): `redirectParam` from form
- `create-pet.ts` (line 290-291): Clinic in redirect

**Add validation:**
```typescript
// web/lib/utils/redirect-validation.ts
const ALLOWED_REDIRECT_PATTERNS = [
  /^\/[a-z0-9-]+\/portal\//,
  /^\/[a-z0-9-]+\/dashboard\//,
  /^\/[a-z0-9-]+\/$/
]

export function isValidRedirect(url: string): boolean {
  return ALLOWED_REDIRECT_PATTERNS.some(pattern => pattern.test(url))
}
```

**Effort:** 30 minutes

---

## Checklist

```
CRITICAL:
[ ] ACT-001: Auth in send-email.ts
[ ] ACT-002: Validation in assign-tag.ts
[ ] ACT-003: Validation in network-actions.ts
[ ] ACT-004: Status transitions in update-appointment.ts
[ ] ACT-005: Validation in safety.ts
[ ] ACT-006: Validation in invoices.ts

HIGH:
[ ] ACT-007: Create withActionAuth utility
[ ] ACT-008: Migrate schedules.ts
[ ] ACT-009: Migrate time-off.ts
[ ] ACT-010: Migrate whatsapp.ts
[ ] ACT-011: Migrate invoices.ts
[ ] ACT-012: Split create-vaccine.ts
[ ] ACT-013: Split create-pet.ts
[ ] ACT-014: Split invoices.ts
[ ] ACT-015: Split time-off.ts

MEDIUM:
[ ] ACT-016: Standardize error returns
[ ] ACT-017: Error context logging
[ ] ACT-018: Handle silent failures
[ ] ACT-019: Extract file upload logic
[ ] ACT-020: Fix SQL injection risk
[ ] ACT-021: Remove magic values
[ ] ACT-022: Input sanitization
[ ] ACT-023: Redirect URL validation
```
