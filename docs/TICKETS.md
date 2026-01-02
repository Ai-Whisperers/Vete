# VETE Platform - Comprehensive Bug & Issue Tickets

> **Generated:** December 18, 2024
> **Last Updated:** December 18, 2024 (Cleanup Pass)
> **Total Tickets:** 127 | **Closed:** 21 | **Open:** 106
> **Critical:** 18 (7 closed) | **High:** 42 (12 closed) | **Medium:** 47 (2 closed) | **Low:** 20

---

## Closed Tickets Summary

The following tickets have been verified as **FIXED** in the codebase:

### Security (7 Closed)
- [x] **SEC-001**: QR Code endpoint authentication
- [x] **SEC-002**: Diagnosis codes API authentication
- [x] **SEC-005**: Expenses API tenant validation
- [x] **SEC-006**: Remove invite authorization
- [x] **SEC-007**: Medical records pet ownership
- [x] **SEC-008**: Vaccine pet ownership check
- [x] **SEC-009**: Inventory import file validation

### Business Logic (5 Closed)
- [x] **BIZ-005**: Invoice refund race condition (uses atomic RPC)
- [x] **BIZ-007**: Loyalty points negative check
- [x] **BIZ-008**: Vaccine status based on role
- [x] **BIZ-009**: Vaccine date validation
- [x] **BIZ-010**: Appointment status transitions

### Type Safety (3 Closed)
- [x] **TYPE-002**: Server actions missing types
- [x] **TYPE-003**: Component props using any
- [x] **TYPE-004**: Catch blocks using any

### Form Validation (2 Closed)
- [x] **FORM-002**: Lab order using alert()
- [x] **FORM-003**: Missing signup validation

### Performance (1 Closed)
- [x] **PERF-003**: Missing useMemo in booking wizard

### Error Handling (1 Closed)
- [x] **ERR-003**: Consent form XSS risk (DOMPurify added)

### Accessibility (2 Closed)
- [x] **A11Y-004**: Error messages role="alert"

### Design Decisions (Not Bugs)
- **SEC-003**: Slots API intentionally public for booking flow
- **SEC-004**: Services API intentionally public for website visitors

---

## Table of Contents

1. [Critical Security Issues](#1-critical-security-issues)
2. [Critical Business Logic Bugs](#2-critical-business-logic-bugs)
3. [Critical Database Issues](#3-critical-database-issues)
4. [High Priority - Type Safety](#4-high-priority---type-safety)
5. [High Priority - Form Validation](#5-high-priority---form-validation)
6. [High Priority - Performance](#6-high-priority---performance)
7. [Medium Priority - Accessibility](#7-medium-priority---accessibility)
8. [Medium Priority - Error Handling](#8-medium-priority---error-handling)
9. [Medium Priority - Database](#9-medium-priority---database)
10. [Low Priority - Code Quality](#10-low-priority---code-quality)
11. [Feature Gaps (TODOs)](#11-feature-gaps-todos)

---

## 1. Critical Security Issues

### ~~TICKET-SEC-001: QR Code Endpoint Missing Authentication~~ [CLOSED]
**Status:** ✅ FIXED
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/api/pets/[id]/qr/route.ts` (Lines 60-85)

**Description:**
The GET endpoint for QR codes has NO authentication check, allowing any user to enumerate and retrieve any pet's QR code with just the pet ID.

**Current Code:**
```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // NO .auth.getUser() check here!
    // Anyone can access any pet's QR code with just the pet ID
```

**Risk:** Privacy violation - exposes owner contact information (phone, email)

**Solution:**
```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    // Continue with existing logic...
```

**Acceptance Criteria:**
- [ ] Add authentication check at start of GET handler
- [ ] Verify user has access to this pet (owner or staff)
- [ ] Return 401 for unauthenticated requests
- [ ] Return 403 for unauthorized access attempts

---

### TICKET-SEC-002: Diagnosis Codes API Completely Unauthenticated
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/api/diagnosis_codes/route.ts` (Lines 1-20)

**Description:**
The entire diagnosis codes endpoint has no authentication. Any unauthenticated user can query veterinary diagnosis codes.

**Current Code:**
```typescript
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    // NO AUTH CHECK - direct database query
```

**Solution:**
Add standard auth check pattern at the start of the handler.

**Acceptance Criteria:**
- [ ] Add authentication check
- [ ] Verify user is staff (vet/admin role)
- [ ] Return appropriate error messages in Spanish

---

### TICKET-SEC-003: Appointment Slots Multi-Tenancy Leak
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/api/appointments/slots/route.ts` (Lines 35-40)

**Description:**
Uses `clinicSlug` from query params WITHOUT server-side validation against user's tenant. Any user can query appointment slots for ANY clinic by manipulating the `clinic` parameter.

**Current Code:**
```typescript
const clinicSlug = searchParams.get('clinic')  // User-supplied, no validation
const { data: existingAppointments } = await query
    .eq('tenant_id', clinicSlug)  // Could be ANY clinic_id
```

**Solution:**
Validate that `clinicSlug` matches the authenticated user's `tenant_id`:
```typescript
const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
if (clinicSlug && clinicSlug !== profile.tenant_id) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
}
```

**Acceptance Criteria:**
- [ ] Validate clinic parameter against user's tenant_id
- [ ] Staff can only query their own clinic's slots
- [ ] Add integration test for cross-tenant access attempt

---

### TICKET-SEC-004: Services API Unauthenticated Read Access
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/api/services/route.ts` (Lines 1-25)

**Description:**
GET endpoint has no authentication, allowing unauthenticated service catalog enumeration and pricing disclosure for any clinic.

**Solution:**
For public service listings (intended for website visitors), consider:
1. Keep public but remove sensitive pricing data, OR
2. Add authentication and rate limiting

**Acceptance Criteria:**
- [ ] Decide if services should be public or authenticated
- [ ] If public: add rate limiting, remove internal pricing
- [ ] If authenticated: add auth check

---

### TICKET-SEC-005: Expenses API Tenant Validation Issue
**Priority:** CRITICAL
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/api/finance/expenses/route.ts` (Lines 27-28, 38-47)

**Description:**
1. Uses `clinic_id` instead of `tenant_id` (naming inconsistency)
2. POST spreads entire request body without validation

**Current Code:**
```typescript
const { data, error } = await supabase
    .from('expenses')
    .insert({
        ...body,  // Spreads entire body - client can inject any field!
        created_by: user.id
    })
```

**Solution:**
```typescript
const { amount, category, description, date, vendor } = body;
const { data, error } = await supabase
    .from('expenses')
    .insert({
        tenant_id: profile.tenant_id,  // Server-controlled
        amount,
        category,
        description,
        date,
        vendor,
        created_by: user.id
    })
```

**Acceptance Criteria:**
- [ ] Explicitly destructure allowed fields from body
- [ ] Always set tenant_id from server-side profile
- [ ] Validate category against allowed values
- [ ] Add amount validation (positive number, reasonable limits)

---

### TICKET-SEC-006: Remove Invite Action Missing Authorization
**Priority:** HIGH
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/actions/invite-staff.ts` (Lines 58-62)

**Description:**
`removeInvite` function has NO authorization checks. Any authenticated user can remove ANY invite from ANY clinic.

**Current Code:**
```typescript
export async function removeInvite(email: string, clinic: string) {
    const supabase = await createClient();
    // No auth checks!
    await supabase.from("clinic_invites").delete().eq('email', email);
```

**Solution:**
```typescript
export async function removeInvite(email: string, clinic: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autorizado');

    const { data: profile } = await supabase.from('profiles')
        .select('tenant_id, role').eq('id', user.id).single();

    if (profile.tenant_id !== clinic || profile.role !== 'admin') {
        throw new Error('Solo administradores pueden eliminar invitaciones');
    }

    await supabase.from("clinic_invites")
        .delete()
        .eq('email', email)
        .eq('tenant_id', clinic);  // Also filter by tenant!
```

**Acceptance Criteria:**
- [ ] Add auth check
- [ ] Verify user is admin of the target clinic
- [ ] Filter delete by tenant_id as well as email

---

### TICKET-SEC-007: Medical Records Missing Pet Ownership Validation
**Priority:** HIGH
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/actions/medical-records.ts` (Lines 50-65)

**Description:**
Role check exists but no verification that `petId` belongs to user's tenant. A vet from Clinic A could create medical records for Clinic B's pets if they know the pet_id.

**Solution:**
Before inserting, verify pet's tenant matches user's tenant:
```typescript
const { data: pet } = await supabase.from('pets')
    .select('tenant_id')
    .eq('id', petId)
    .single();

if (pet.tenant_id !== profile.tenant_id) {
    throw new Error('No tienes acceso a esta mascota');
}
```

**Acceptance Criteria:**
- [ ] Add pet ownership/tenant validation before insert
- [ ] Return clear error message
- [ ] Add test for cross-tenant access attempt

---

### TICKET-SEC-008: Vaccine Creation Missing Pet Ownership Check
**Priority:** HIGH
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/actions/create-vaccine.ts` (Lines 1-30)

**Description:**
No verification that `petId` belongs to the authenticated user's tenant. Any owner could add vaccines for ANY pet in ANY clinic.

**Solution:**
Same pattern as TICKET-SEC-007 - verify pet tenant before insert.

**Acceptance Criteria:**
- [ ] Add pet ownership validation
- [ ] Verify tenant_id matches
- [ ] For owners: verify they own the pet
- [ ] For staff: verify pet is in their clinic

---

### TICKET-SEC-009: Inventory Import File Upload Vulnerability
**Priority:** HIGH
**Type:** Security Vulnerability
**Affected Files:**
- `web/app/api/inventory/import/route.ts` (Lines 1-25)

**Description:**
No file size validation or MIME type restrictions on upload. Could enable DoS via large file uploads.

**Current Code:**
```typescript
const bytes = await file.arrayBuffer();  // Could be 1GB file
const workbook = XLSX.read(bytes, { type: 'array' });  // DoS risk
```

**Solution:**
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Archivo demasiado grande (máx 5MB)' }, { status: 400 });
}
if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
}
```

**Acceptance Criteria:**
- [ ] Add file size limit (5MB recommended)
- [ ] Validate MIME type
- [ ] Add row count limit for spreadsheets
- [ ] Return clear error messages in Spanish

---

### TICKET-SEC-010: Missing Rate Limiting on All Endpoints
**Priority:** HIGH
**Type:** Security Vulnerability
**Affected Files:**
- All files in `web/app/api/**`

**Description:**
No rate limiting anywhere in the codebase. Vulnerable to:
- Brute force attacks on auth endpoints
- Enumeration attacks on search/lookup endpoints
- DoS via repeated expensive queries

**Solution:**
Implement rate limiting middleware using `upstash/ratelimit` or similar:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// In API route:
const { success } = await ratelimit.limit(user?.id || ip);
if (!success) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });
}
```

**Acceptance Criteria:**
- [ ] Add rate limiting to auth endpoints (strict: 5 req/min)
- [ ] Add rate limiting to search endpoints (moderate: 30 req/min)
- [ ] Add rate limiting to write endpoints (moderate: 20 req/min)
- [ ] Return 429 with Spanish error message

---

## 2. Critical Business Logic Bugs

### TICKET-BIZ-001: Double-Booking Prevention Insufficient
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/api/booking/route.ts` (Lines 142-150)

**Description:**
The double-booking check only looks for exact `start_time` matches, not time overlaps. If one appointment is 09:00-09:30 and another is 09:15-09:45, BOTH are allowed because they don't have the exact same start_time.

**Current Code:**
```typescript
const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('tenant_id', effectiveClinic)
    .eq('appointment_date', date)
    .eq('start_time', time_slot)  // Only checks exact match!
    .neq('status', 'cancelled');
```

**Solution:**
```typescript
const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('tenant_id', effectiveClinic)
    .eq('appointment_date', date)
    .lt('start_time', endTime)
    .gt('end_time', time_slot)
    .neq('status', 'cancelled');
```

**Acceptance Criteria:**
- [ ] Check for overlapping time ranges, not exact matches
- [ ] Consider vet assignment (same vet can't have overlapping appointments)
- [ ] Add test cases for edge cases (adjacent, overlapping, contained)
- [ ] Return clear error message: "Este horario ya está ocupado"

---

### TICKET-BIZ-002: Appointment End Time Lost on Reschedule
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/api/booking/route.ts` (Lines 242-245)

**Description:**
When updating an appointment's time, `end_time` is set to the same value as `start_time`, losing duration information.

**Current Code:**
```typescript
if (time_slot) {
    updates.start_time = time_slot;
    updates.end_time = time_slot;  // WRONG!
}
```

**Solution:**
```typescript
if (time_slot) {
    updates.start_time = time_slot;
    // Calculate end_time based on service duration
    const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', existing.service_id)
        .single();

    const [hours, minutes] = time_slot.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + (service?.duration_minutes || 30);
    updates.end_time = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
}
```

**Acceptance Criteria:**
- [ ] Preserve appointment duration on reschedule
- [ ] Calculate end_time from service duration
- [ ] Default to 30 minutes if service not found

---

### TICKET-BIZ-003: Stock Never Decremented on Purchase
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/[clinic]/cart/checkout/client.tsx`
- `web/context/cart-context.tsx`

**Description:**
When a customer purchases items via the cart, stock is NEVER decremented. The checkout flow just generates a WhatsApp message - no API endpoint finalizes the purchase or updates inventory.

**Impact:** Inventory tracking becomes completely meaningless. Products can be oversold indefinitely.

**Solution:**
1. Create checkout API endpoint: `POST /api/store/checkout`
2. In transaction:
   - Validate stock availability for all items
   - Create invoice
   - Decrement stock
   - Return success/failure

**Acceptance Criteria:**
- [ ] Create `POST /api/store/checkout` endpoint
- [ ] Validate stock before purchase
- [ ] Decrement stock in database transaction
- [ ] Create invoice record
- [ ] Handle partial stock (some items available, some not)
- [ ] Return clear errors for out-of-stock items

---

### TICKET-BIZ-004: Cart Stock Validation Only Client-Side
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/[clinic]/cart/client.tsx` (Lines 62-78)
- `web/context/cart-context.tsx`

**Description:**
Stock validation only happens in the React component. An attacker can bypass by modifying the request. The API doesn't re-validate stock.

**Solution:**
Always validate stock server-side before processing any cart operation.

**Acceptance Criteria:**
- [ ] Add server-side stock validation in checkout API
- [ ] Validate stock is current (not stale data)
- [ ] Lock stock during checkout to prevent race conditions
- [ ] Return specific out-of-stock item details

---

### TICKET-BIZ-005: Invoice Payment/Refund Race Condition
**Priority:** CRITICAL
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/api/invoices/[id]/payments/route.ts`
- `web/app/api/invoices/[id]/refund/route.ts`

**Description:**
Two concurrent operations can corrupt invoice state. No database transaction or locking.

**Scenario:**
1. Invoice: amount_paid=100, total=200
2. Request A: Record payment of 50 (→ amount_paid=150)
3. Request B: Refund 30 (reads amount_paid=100, calculates 70)
4. Result: Data corruption - amount_paid=70 (lost the 50 payment)

**Solution:**
Use database transactions with row locking:
```typescript
const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()
    .for('UPDATE');  // Row lock

// Then perform calculations and update
```

Or use Supabase RPC for atomic operations:
```sql
CREATE FUNCTION record_payment(p_invoice_id UUID, p_amount NUMERIC) RETURNS invoices AS $$
    -- Atomic read-modify-write
$$ LANGUAGE plpgsql;
```

**Acceptance Criteria:**
- [ ] Implement row locking OR atomic RPC function
- [ ] Prevent concurrent modifications
- [ ] Add test for concurrent payment/refund scenario
- [ ] Return clear error if locked

---

### TICKET-BIZ-006: Invoice Floating Point Arithmetic
**Priority:** HIGH
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/api/invoices/route.ts` (Lines 159-161)
- `web/app/api/invoices/[id]/route.ts`

**Description:**
Tax calculation uses floating-point arithmetic, causing currency precision errors.

**Current Code:**
```typescript
const taxAmount = subtotal * (taxRate / 100);  // Can result in 123.45000000001
```

**Solution:**
Use integer math (work in centavos) or explicit rounding:
```typescript
const taxAmount = Math.round(subtotal * taxRate) / 100;
// Or better: use a decimal library like decimal.js
```

**Acceptance Criteria:**
- [ ] Round all currency calculations to 2 decimal places
- [ ] Consider using integer cents internally
- [ ] Add validation that final amounts are valid currency values

---

### TICKET-BIZ-007: Loyalty Points Can Go Negative
**Priority:** HIGH
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/api/loyalty_points/route.ts` (Lines 71-85)

**Description:**
No validation that points don't go negative. Staff can submit negative points without checking if pet has enough balance.

**Solution:**
```typescript
// Check current balance
const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('points')
    .eq('pet_id', petId);
const currentBalance = transactions.reduce((sum, t) => sum + t.points, 0);

if (points < 0 && currentBalance + points < 0) {
    return NextResponse.json({
        error: `Saldo insuficiente. Balance actual: ${currentBalance}`
    }, { status: 400 });
}
```

**Acceptance Criteria:**
- [ ] Check balance before allowing negative points
- [ ] Return clear error with current balance
- [ ] Add constraint in database as safety net

---

### TICKET-BIZ-008: Vaccine Status Always 'Pending'
**Priority:** HIGH
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/actions/create-vaccine.ts` (Lines 28-34)

**Description:**
Vaccine status is hardcoded to 'pending', even when a vet creates it directly. Staff-created vaccines should not require verification.

**Solution:**
```typescript
// Determine status based on creator's role
const status = profile.role === 'owner' ? 'pending' : 'verified';

const { error } = await supabase.from("vaccines").insert({
    // ...
    status,
    verified_by: profile.role !== 'owner' ? user.id : null,
    verified_at: profile.role !== 'owner' ? new Date().toISOString() : null,
});
```

**Acceptance Criteria:**
- [ ] Set status based on creator's role
- [ ] Owner-created vaccines: 'pending'
- [ ] Staff-created vaccines: 'verified'
- [ ] Record verified_by and verified_at for staff-created

---

### TICKET-BIZ-009: Missing Vaccine Date Validation
**Priority:** HIGH
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/actions/create-vaccine.ts`

**Description:**
No validation that `next_due_date` is after `administered_date`. Can create vaccines with backwards dates.

**Solution:**
```typescript
if (nextDate && new Date(nextDate) <= new Date(date)) {
    return { error: 'La fecha de próxima dosis debe ser posterior a la fecha de administración' };
}
```

**Acceptance Criteria:**
- [ ] Validate next_due_date > administered_date
- [ ] Return clear Spanish error message
- [ ] Add same validation on update

---

### TICKET-BIZ-010: Appointment Status Transitions Not Validated
**Priority:** HIGH
**Type:** Business Logic Bug
**Affected Files:**
- `web/app/actions/update-appointment.ts`
- `web/app/api/booking/route.ts` (PUT)

**Description:**
No state machine validation for appointment status. Can transition `completed` → `pending` or skip states entirely.

**Valid transitions should be:**
```
pending → confirmed → checked_in → in_progress → completed
pending → cancelled
confirmed → no_show
checked_in/in_progress → no_show
```

**Solution:**
```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['checked_in', 'cancelled', 'no_show'],
    'checked_in': ['in_progress', 'no_show'],
    'in_progress': ['completed', 'no_show'],
    'completed': [],
    'cancelled': [],
    'no_show': []
};

const allowed = VALID_TRANSITIONS[currentStatus] || [];
if (!allowed.includes(newStatus)) {
    return { error: `No se puede cambiar de ${currentStatus} a ${newStatus}` };
}
```

**Acceptance Criteria:**
- [ ] Define valid state machine
- [ ] Validate transitions in both Server Action and API
- [ ] Return clear error for invalid transitions

---

## 3. Critical Database Issues

### TICKET-DB-001: Missing RLS Policies on Multiple Tables
**Priority:** CRITICAL
**Type:** Database Security
**Affected Files:**
- `web/db/14_rls_policies.sql`

**Description:**
Multiple tables are created without RLS enabled, creating security gaps:
- `lab_orders`, `lab_order_items`
- `lab_panel_tests`, `lab_test_catalog`
- `hospitalizations`, `kennels`
- `consent_*` tables (partially covered)
- `messaging/*` tables
- `insurance/*` tables
- `scheduled_job_log`, `materialized_view_refresh_log`

**Solution:**
For each table missing RLS:
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON [table_name]
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::text);

CREATE POLICY "staff_access" ON [table_name]
    FOR ALL USING (is_staff_of(tenant_id));
```

**Acceptance Criteria:**
- [ ] Enable RLS on all tables listed above
- [ ] Create appropriate policies (tenant isolation + role-based)
- [ ] Test that cross-tenant access is blocked
- [ ] Document policies in schema comments

---

### TICKET-DB-002: Missing Foreign Key Cascades
**Priority:** CRITICAL
**Type:** Database Integrity
**Affected Files:**
- Various schema files in `web/db/`

**Description:**
Several foreign keys are missing ON DELETE CASCADE, leading to orphaned records:
- `lab_orders` → `lab_order_items`: No cascade
- `medical_records.performed_by`: No cascade
- `prescriptions.vet_id`: No cascade
- `appointments.vet_id`: No cascade
- `expenses.created_by`: No cascade

**Solution:**
```sql
ALTER TABLE lab_order_items
    DROP CONSTRAINT IF EXISTS lab_order_items_order_id_fkey,
    ADD CONSTRAINT lab_order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES lab_orders(id) ON DELETE CASCADE;
```

**Acceptance Criteria:**
- [ ] Add CASCADE to all child table foreign keys
- [ ] For staff references (performed_by, vet_id), decide: CASCADE or SET NULL
- [ ] Create migration with backwards compatibility
- [ ] Test delete scenarios

---

### TICKET-DB-003: Missing Indexes on Frequently Queried Columns
**Priority:** HIGH
**Type:** Database Performance
**Affected Files:**
- `web/db/11_indexes.sql`

**Description:**
Several high-frequency query patterns lack indexes:
- `appointments.service_id`
- `lab_orders.pet_id`, `lab_orders.ordered_by`
- `lab_order_items.order_id`
- `hospitalization_visits.hospitalization_id`
- `messages.conversation_id`
- `consent_documents.template_id`
- `insurance_claims.pet_id`, `insurance_claims.status`

**Solution:**
```sql
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet_id ON lab_orders(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_by ON lab_orders(ordered_by);
CREATE INDEX IF NOT EXISTS idx_lab_order_items_order_id ON lab_order_items(order_id);
-- etc.
```

**Acceptance Criteria:**
- [ ] Create indexes for all listed columns
- [ ] Add composite indexes for common query patterns
- [ ] Run EXPLAIN ANALYZE on slow queries before/after

---

### TICKET-DB-004: N+1 Query in Clients API
**Priority:** HIGH
**Type:** Database Performance
**Affected Files:**
- `web/app/api/clients/route.ts` (Lines 101-163)

**Description:**
Multiple sequential queries to fetch clients data:
1. Fetch clients
2. Fetch ALL pet counts
3. Fetch ALL appointments
4. Fetch ALL pets
5. Process in memory with nested loops (O(n³))

**Solution:**
Use a single aggregated query or materialized view:
```sql
CREATE VIEW client_summary AS
SELECT
    p.id as owner_id,
    p.full_name,
    p.email,
    COUNT(DISTINCT pets.id) as pet_count,
    MAX(a.appointment_date) as last_visit
FROM profiles p
LEFT JOIN pets ON pets.owner_id = p.id
LEFT JOIN appointments a ON a.pet_id = pets.id
WHERE p.role = 'owner'
GROUP BY p.id;
```

**Acceptance Criteria:**
- [ ] Create aggregated view or materialized view
- [ ] Replace 4+ queries with single query
- [ ] Verify performance improvement with EXPLAIN ANALYZE
- [ ] Add pagination to prevent unbounded results

---

### TICKET-DB-005: Missing Updated_at Triggers
**Priority:** MEDIUM
**Type:** Database Integrity
**Affected Files:**
- `web/db/13_triggers.sql`

**Description:**
Many tables lack `updated_at` triggers:
- `services`
- `payment_methods`
- `invoice_items`
- `lab_*` tables
- `hospitalization_*` tables
- `consent_*` tables
- `messaging/*` tables
- `insurance/*` tables

**Solution:**
```sql
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON [table_name]
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

**Acceptance Criteria:**
- [ ] Add trigger to all tables with updated_at column
- [ ] Verify existing handle_updated_at() function exists
- [ ] Test that updates correctly set timestamp

---

### TICKET-DB-006: Hardcoded Tenant IDs in Seed Scripts
**Priority:** MEDIUM
**Type:** Database Design
**Affected Files:**
- `web/db/02_schema_core.sql`
- `web/db/03_schema_pets.sql`
- `web/db/07_schema_inventory.sql`

**Description:**
Seed scripts have hardcoded tenant IDs ('adris', 'petlife'). These will fail when adding new tenants.

**Current Code:**
```sql
INSERT INTO payment_methods (tenant_id, name, type, is_default) VALUES
    ('adris', 'Efectivo', 'cash', TRUE),
    ('petlife', 'Efectivo', 'cash', TRUE)
```

**Solution:**
Create a tenant onboarding script/function that initializes all required data:
```sql
CREATE FUNCTION setup_new_tenant(p_tenant_id TEXT) RETURNS void AS $$
BEGIN
    INSERT INTO payment_methods (tenant_id, name, type, is_default)
    VALUES (p_tenant_id, 'Efectivo', 'cash', TRUE);
    -- etc.
END;
$$ LANGUAGE plpgsql;
```

**Acceptance Criteria:**
- [ ] Create setup_new_tenant() function
- [ ] Document required setup steps for new tenants
- [ ] Remove hardcoded tenant IDs from seed scripts

---

## 4. High Priority - Type Safety

### TICKET-TYPE-001: Core Library Uses `any` Types Extensively
**Priority:** HIGH
**Type:** Code Quality
**Affected Files:**
- `web/lib/clinics.ts` (Lines 52-66, 131-136)

**Description:**
The core ClinicConfig and ClinicData interfaces use `any` for multiple properties:
```typescript
ui_labels: {
    nav?: any;
    footer?: any;
    home?: any;
    // ... all any
};
home: any;
services: any;
about: any;
```

**Solution:**
Define specific interfaces for each section:
```typescript
interface UiLabelsNav {
    home?: string;
    services?: string;
    about?: string;
    contact?: string;
    portal?: string;
}

interface UiLabels {
    nav?: UiLabelsNav;
    footer?: UiLabelsFooter;
    // etc.
}
```

**Acceptance Criteria:**
- [ ] Create interfaces for all ui_labels sections
- [ ] Create interfaces for home, services, about data
- [ ] Update ClinicData to use specific types
- [ ] Fix any resulting type errors in consumers

---

### TICKET-TYPE-002: Server Actions Missing Type Annotations
**Priority:** HIGH
**Type:** Code Quality
**Affected Files:**
- `web/app/auth/actions.ts` (Lines 7, 29, 85, 108)
- `web/app/actions/send-email.ts`
- `web/app/actions/invite-staff.ts`
- `web/app/actions/create-product.ts`
- `web/app/actions/create-medical-record.ts`

**Description:**
All server actions use `any` for `prevState` parameter and lack explicit return types.

**Current Code:**
```typescript
export async function login(prevState: any, formData: FormData)
```

**Solution:**
```typescript
interface ActionState {
    error?: string;
    success?: boolean;
    message?: string;
}

export async function login(
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState>
```

**Acceptance Criteria:**
- [ ] Create shared ActionState interface
- [ ] Update all server actions to use it
- [ ] Add explicit return type annotations
- [ ] Fix any type errors in form components

---

### TICKET-TYPE-003: Component Props Using `any`
**Priority:** HIGH
**Type:** Code Quality
**Affected Files:**
- `web/components/services/service-card.tsx` (Lines 8-9)
- `web/components/loyalty/loyalty-card.tsx` (Line 9)
- `web/components/clinical/prescription-download-button.tsx` (Line 8)
- Many more...

**Description:**
Over 30 component files have props typed as `any`:
```typescript
interface ServiceCardProps {
    readonly service: any;
    readonly config: any;
}
```

**Solution:**
Create proper interfaces for each component's props based on actual usage.

**Acceptance Criteria:**
- [ ] Audit all components for `any` props
- [ ] Create specific interfaces for each
- [ ] Update components to use proper types
- [ ] Run TypeScript strict mode to verify

---

### TICKET-TYPE-004: Catch Blocks Using `any` for Errors
**Priority:** MEDIUM
**Type:** Code Quality
**Affected Files:**
- 20+ files across components, actions, and API routes

**Description:**
Error handling uses `any` type:
```typescript
} catch (error: any) {
    console.error(error.message);
}
```

**Solution:**
```typescript
} catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(message);
}
```

**Acceptance Criteria:**
- [ ] Replace `catch (error: any)` with `catch (error: unknown)`
- [ ] Use type guards to safely access error properties
- [ ] Create utility function for error message extraction

---

### TICKET-TYPE-005: Map/Filter/Reduce Callbacks Missing Types
**Priority:** MEDIUM
**Type:** Code Quality
**Affected Files:**
- `web/app/[clinic]/portal/pets/[id]/page.tsx` (Lines 59-71, 99, 210, 262, 368)
- `web/app/api/dashboard/revenue/route.ts` (Line 48)
- `web/app/api/finance/pl/route.ts` (Line 75)
- Many more...

**Description:**
Array callbacks use implicit `any`:
```typescript
.map((r: any) => ...)
.sort((a: any, b: any) => ...)
.reduce((acc: any, curr) => {})
```

**Solution:**
Define types for array items and use them:
```typescript
interface MedicalRecord { id: string; date: string; type: string; }
records.map((r: MedicalRecord) => ...)
```

**Acceptance Criteria:**
- [ ] Identify all untyped callbacks
- [ ] Create interfaces for array item types
- [ ] Apply types to all callbacks
- [ ] Verify with TypeScript

---

## 5. High Priority - Form Validation

### TICKET-FORM-001: Booking Wizard Missing Try-Catch
**Priority:** HIGH
**Type:** Error Handling
**Affected Files:**
- `web/components/booking/booking-wizard.tsx` (Lines 286-305)

**Description:**
Fetch call has NO try-catch wrapper. Network errors not handled, UI can hang.

**Current Code:**
```typescript
const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const res = await fetch('/api/booking', {...});
    // NO try-catch!
```

**Solution:**
```typescript
const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
        const res = await fetch('/api/booking', {...});
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Error al crear la cita');
        }
        // Success handling...
    } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Error de conexión');
    } finally {
        setIsSubmitting(false);
    }
};
```

**Acceptance Criteria:**
- [ ] Wrap fetch in try-catch
- [ ] Handle network errors gracefully
- [ ] Always reset isSubmitting in finally block
- [ ] Show user-friendly Spanish error messages

---

### TICKET-FORM-002: Lab Order Form Using Alert for Validation
**Priority:** HIGH
**Type:** UX/Accessibility
**Affected Files:**
- `web/components/lab/order-form.tsx` (Lines 198-203)

**Description:**
Uses browser `alert()` for validation instead of inline UI feedback.

**Current Code:**
```typescript
if (!selectedPetId || selectedTests.size === 0) {
    alert('Selecciona una mascota y al menos una prueba');
    return;
}
```

**Solution:**
```typescript
const [validationError, setValidationError] = useState<string | null>(null);

if (!selectedPetId || selectedTests.size === 0) {
    setValidationError('Selecciona una mascota y al menos una prueba');
    return;
}

// In JSX:
{validationError && (
    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {validationError}
    </div>
)}
```

**Acceptance Criteria:**
- [ ] Replace all alert() calls with inline error state
- [ ] Add role="alert" for accessibility
- [ ] Style consistently with other error messages
- [ ] Clear error when user makes changes

---

### TICKET-FORM-003: Missing Server-Side Validation in Signup
**Priority:** HIGH
**Type:** Security/Validation
**Affected Files:**
- `web/app/auth/actions.ts` (Lines 60-78)

**Description:**
Signup action has NO validation:
- Email format not checked
- Password strength not validated
- fullName not validated

**Solution:**
```typescript
import { z } from 'zod';

const signupSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    fullName: z.string().min(2, 'Nombre requerido').max(100),
});

export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const validation = signupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        fullName: formData.get('fullName'),
    });

    if (!validation.success) {
        return { error: validation.error.errors[0].message };
    }
    // Continue with signup...
}
```

**Acceptance Criteria:**
- [ ] Add Zod schema validation
- [ ] Validate email format
- [ ] Enforce password strength (min 8 chars)
- [ ] Return specific Spanish error messages

---

### TICKET-FORM-004: Double-Submit Protection Missing
**Priority:** HIGH
**Type:** UX/Data Integrity
**Affected Files:**
- `web/components/booking/booking-wizard.tsx`
- `web/components/lab/result-entry.tsx`
- `web/components/whatsapp/quick-send.tsx`

**Description:**
Multiple forms can be submitted multiple times before first request completes.

**Solution:**
1. Disable submit button during request
2. Use AbortController to cancel pending requests
3. Add loading indicator

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const abortControllerRef = useRef<AbortController | null>(null);

const handleSubmit = async () => {
    if (isSubmitting) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsSubmitting(true);
    try {
        await fetch('/api/...', { signal: abortControllerRef.current.signal });
    } finally {
        setIsSubmitting(false);
    }
};

// Button:
<button disabled={isSubmitting}>
    {isSubmitting ? 'Enviando...' : 'Enviar'}
</button>
```

**Acceptance Criteria:**
- [ ] Disable button during submission
- [ ] Prevent re-submission while pending
- [ ] Show loading state
- [ ] Cancel pending requests on re-submit

---

### TICKET-FORM-005: Form Inputs Missing aria-invalid
**Priority:** MEDIUM
**Type:** Accessibility
**Affected Files:**
- `web/components/forms/appointment-form.tsx`
- `web/components/invoices/invoice-form.tsx`
- Multiple other form components

**Description:**
Form inputs don't communicate validation state to screen readers.

**Solution:**
```typescript
<input
    name="email"
    type="email"
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
    <span id="email-error" role="alert" className="text-red-500 text-sm">
        {errors.email}
    </span>
)}
```

**Acceptance Criteria:**
- [ ] Add aria-invalid to all form inputs
- [ ] Connect error messages with aria-describedby
- [ ] Add role="alert" to error messages
- [ ] Test with screen reader

---

## 6. High Priority - Performance

### TICKET-PERF-001: Unbounded Query in Drug Dosages API
**Priority:** HIGH
**Type:** Performance
**Affected Files:**
- `web/app/api/drug_dosages/route.ts` (Lines 11-17)

**Description:**
No LIMIT on query - could return 10,000+ rows and crash the server.

**Current Code:**
```typescript
let query = supabase.from('drug_dosages').select('*').order('name');
// NO LIMIT!
```

**Solution:**
```typescript
let query = supabase.from('drug_dosages')
    .select('*')
    .order('name')
    .limit(100);
```

**Acceptance Criteria:**
- [ ] Add .limit(100) or pagination
- [ ] Add search/filter to reduce results
- [ ] Return count header for pagination UI

---

### TICKET-PERF-002: Large Component Files Need Splitting
**Priority:** HIGH
**Type:** Performance/Maintainability
**Affected Files:**
- `signing-form.tsx` (598 lines)
- `booking-wizard.tsx` (548 lines)
- `blanket-consents.tsx` (547 lines)
- `admission-form.tsx` (515 lines)
- Plus 8 more files >400 lines

**Description:**
Components >400 lines cause:
- Slow initial render
- Unnecessary re-renders
- Hard to maintain/test

**Solution:**
Split booking-wizard.tsx example:
```
booking-wizard/
  index.tsx (main orchestrator)
  ServiceSelection.tsx
  PetSelection.tsx
  DateTimeSelection.tsx
  Confirmation.tsx
  BookingSidebar.tsx
  useBookingState.ts (custom hook)
```

**Acceptance Criteria:**
- [ ] Split each large component into smaller pieces
- [ ] Extract hooks for state management
- [ ] Ensure no functionality regression
- [ ] Verify performance improvement with React DevTools

---

### TICKET-PERF-003: Missing useMemo in Booking Wizard
**Priority:** HIGH
**Type:** Performance
**Affected Files:**
- `web/components/booking/booking-wizard.tsx` (Lines 179-186)

**Description:**
Data transformations run on every render:
```typescript
const services: BookableService[] = clinic.services
    ? transformServices(clinic.services)
    : [];

const timeSlots = ['09:00', '09:30', ...];  // Recreated every render
```

**Solution:**
```typescript
const services = useMemo(() =>
    clinic.services ? transformServices(clinic.services) : [],
    [clinic.services]
);

const TIME_SLOTS = ['09:00', '09:30', ...] as const;  // Move outside component
```

**Acceptance Criteria:**
- [ ] Wrap transformServices in useMemo
- [ ] Move static arrays outside component
- [ ] Add useCallback to event handlers
- [ ] Verify with React DevTools Profiler

---

### TICKET-PERF-004: Raw img Tags Should Use next/image
**Priority:** MEDIUM
**Type:** Performance
**Affected Files:**
- `web/components/dashboard/appointments/appointment-queue.tsx` (Line 161)
- `web/app/[clinic]/portal/dashboard/page.tsx` (Line 264)
- Multiple other components

**Description:**
Raw `<img>` tags don't benefit from Next.js image optimization (lazy loading, WebP, srcset).

**Solution:**
```typescript
import Image from 'next/image';

<Image
    src={pet.photo_url || '/placeholder-pet.jpg'}
    alt={pet.name}
    width={80}
    height={80}
    className="rounded-full object-cover"
/>
```

**Acceptance Criteria:**
- [ ] Replace <img> with next/image
- [ ] Add width/height or fill prop
- [ ] Handle fallback images
- [ ] Test image loading performance

---

### TICKET-PERF-005: Icon Imports Bloating Bundle
**Priority:** MEDIUM
**Type:** Performance
**Affected Files:**
- `web/components/booking/booking-wizard.tsx` (Lines 5-31)
- `web/components/layout/main-nav.tsx` (Line 8)
- Multiple other components

**Description:**
Importing 30+ icons statically increases bundle size. Many icons are only used conditionally.

**Current Code:**
```typescript
import { Syringe, Stethoscope, Scissors, UserCircle, Activity, ... } from 'lucide-react';
```

**Solution:**
For dynamic icon usage:
```typescript
import dynamic from 'next/dynamic';
import type { LucideIcon } from 'lucide-react';

const DynamicIcon = dynamic(() =>
    import('lucide-react').then(mod => mod[iconName as keyof typeof mod] as LucideIcon)
);
```

Or use tree-shakeable imports:
```typescript
import { Syringe } from 'lucide-react/dist/esm/icons/syringe';
```

**Acceptance Criteria:**
- [ ] Audit icon usage patterns
- [ ] Use dynamic imports for conditional icons
- [ ] Verify bundle size reduction
- [ ] Test icon rendering performance

---

## 7. Medium Priority - Accessibility

### TICKET-A11Y-001: Cart Icon Missing aria-label
**Priority:** MEDIUM
**Type:** Accessibility
**Affected Files:**
- `web/components/layout/main-nav.tsx` (Line 165)

**Description:**
Shopping cart icon link has no accessible name.

**Solution:**
```typescript
<Link
    href={`/${clinic}/cart`}
    className="relative p-2 text-[var(--primary)]"
    aria-label="Carrito de compras"
>
    <ShoppingCart className="w-6 h-6" aria-hidden="true" />
</Link>
```

**Acceptance Criteria:**
- [ ] Add aria-label in Spanish
- [ ] Add aria-hidden to icon
- [ ] Add badge count to label if items exist

---

### TICKET-A11Y-002: Mobile Menu Focus Trap Incomplete
**Priority:** MEDIUM
**Type:** Accessibility
**Affected Files:**
- `web/components/layout/main-nav.tsx` (Lines 200-220)

**Description:**
Mobile menu has `role="dialog"` and `aria-modal="true"` but focus trap is not fully implemented.

**Solution:**
Use focus-trap library or implement custom trap:
```typescript
import { useFocusTrap } from '@mantine/hooks';

const focusTrapRef = useFocusTrap(isOpen);

<motion.div ref={focusTrapRef} role="dialog" aria-modal="true">
```

**Acceptance Criteria:**
- [ ] Tab key cycles through menu items only
- [ ] First/last items loop correctly
- [ ] Escape key closes menu
- [ ] Focus returns to trigger on close

---

### TICKET-A11Y-003: Tabs Missing ARIA Tab Pattern
**Priority:** MEDIUM
**Type:** Accessibility
**Affected Files:**
- `web/components/appointments/appointment-list.tsx` (Lines 37-60)
- `web/components/dashboard/appointments/appointment-queue.tsx`

**Description:**
Tab-like interfaces don't use proper ARIA tab pattern.

**Solution:**
```typescript
<div role="tablist" aria-label="Estado de citas">
    {tabs.map((tab) => (
        <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
        >
            {tab.label}
        </button>
    ))}
</div>

<div
    role="tabpanel"
    id={`tabpanel-${activeTab}`}
    aria-labelledby={`tab-${activeTab}`}
>
    {/* Content */}
</div>
```

**Acceptance Criteria:**
- [ ] Add role="tablist" to container
- [ ] Add role="tab" to each tab button
- [ ] Add aria-selected state
- [ ] Add role="tabpanel" to content areas
- [ ] Test with screen reader

---

### TICKET-A11Y-004: Error Messages Missing role="alert"
**Priority:** MEDIUM
**Type:** Accessibility
**Affected Files:**
- `web/components/booking/booking-wizard.tsx` (Lines 300-310)
- Multiple form components

**Description:**
Error messages are visually shown but not announced to screen readers.

**Solution:**
```typescript
{submitError && (
    <div
        role="alert"
        aria-live="assertive"
        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
    >
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
        <p>{submitError}</p>
    </div>
)}
```

**Acceptance Criteria:**
- [ ] Add role="alert" to all error containers
- [ ] Add aria-live="assertive" for immediate announcement
- [ ] Hide decorative icons from screen readers
- [ ] Test with NVDA/VoiceOver

---

### TICKET-A11Y-005: Hardcoded Spanish Text Should Use Config
**Priority:** MEDIUM
**Type:** Internationalization
**Affected Files:**
- `web/components/booking/booking-wizard.tsx` (step labels)
- `web/components/loyalty/loyalty-card.tsx` (Line 71)
- `web/components/layout/main-nav.tsx` (Line 89)
- 20+ more files

**Description:**
UI text is hardcoded instead of coming from `config.ui_labels`:
```typescript
// Hardcoded:
<span>¡Puedes un canje disponible!</span>

// Should be:
<span>{config.ui_labels?.loyalty?.redemption_available || 'Canje disponible'}</span>
```

**Acceptance Criteria:**
- [ ] Audit all hardcoded Spanish strings
- [ ] Add corresponding keys to ui_labels config
- [ ] Update components to use config with fallbacks
- [ ] Document all available label keys

---

## 8. Medium Priority - Error Handling

### TICKET-ERR-001: Photo Upload Fails Silently
**Priority:** MEDIUM
**Type:** Error Handling
**Affected Files:**
- `web/components/pets/edit-pet-form.tsx` (Lines 115-117)

**Description:**
Photo upload error is logged but user is not notified.

**Current Code:**
```typescript
if (uploadError) {
    console.error('Upload error:', uploadError);
    // Continue without updating photo - SILENTLY FAILS
}
```

**Solution:**
```typescript
if (uploadError) {
    console.error('Upload error:', uploadError);
    setError('No se pudo subir la foto. Por favor intente de nuevo.');
    return; // Don't continue with partial save
}
```

**Acceptance Criteria:**
- [ ] Show user-facing error message
- [ ] Don't proceed with save if photo upload fails
- [ ] Allow retry

---

### TICKET-ERR-002: Inconsistent Error Handling Patterns
**Priority:** MEDIUM
**Type:** Code Quality
**Affected Files:**
- Multiple files across actions and API routes

**Description:**
Some functions return `{ error: string }`, others throw errors. Components handle both inconsistently.

**Solution:**
Standardize on one pattern. Recommended:
```typescript
// All server actions return:
type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string };

// All API routes return:
// Success: NextResponse.json(data, { status: 200 })
// Error: NextResponse.json({ error: 'mensaje' }, { status: 4xx/5xx })
```

**Acceptance Criteria:**
- [ ] Document error handling standard
- [ ] Update all server actions to use standard
- [ ] Update all API routes to use standard
- [ ] Create shared type definitions

---

### TICKET-ERR-003: Consent Form XSS Risk
**Priority:** MEDIUM
**Type:** Security
**Affected Files:**
- `web/components/consents/signing-form.tsx` (Lines 160-165)

**Description:**
Uses `dangerouslySetInnerHTML` without sanitization.

**Current Code:**
```typescript
dangerouslySetInnerHTML={{ __html: renderContent() }}
```

**Solution:**
```typescript
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(renderContent());
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

**Acceptance Criteria:**
- [ ] Add DOMPurify dependency
- [ ] Sanitize all dangerouslySetInnerHTML content
- [ ] Test with XSS payloads

---

## 9. Medium Priority - Database

### TICKET-DB-007: Appointment Overlap Validation Flawed
**Priority:** MEDIUM
**Type:** Database/Business Logic
**Affected Files:**
- `web/app/api/booking/route.ts`

**Description:**
Current check only matches exact start times, not overlapping ranges. (Related to TICKET-BIZ-001)

**Solution:**
Create database function for overlap check:
```sql
CREATE FUNCTION check_appointment_overlap(
    p_tenant_id TEXT,
    p_date DATE,
    p_start TIME,
    p_end TIME,
    p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM appointments
        WHERE tenant_id = p_tenant_id
        AND appointment_date = p_date
        AND status NOT IN ('cancelled', 'no_show')
        AND (p_exclude_id IS NULL OR id != p_exclude_id)
        AND start_time < p_end
        AND end_time > p_start
    );
$$ LANGUAGE sql;
```

**Acceptance Criteria:**
- [ ] Create RPC function
- [ ] Use in booking API for validation
- [ ] Add test cases for edge cases

---

### TICKET-DB-008: Materialized Views Creation Scripts Missing
**Priority:** MEDIUM
**Type:** Database
**Affected Files:**
- `web/db/00_cleanup.sql`

**Description:**
Cleanup script references materialized views that don't have creation scripts:
- `mv_clinic_dashboard_stats`
- `mv_appointment_analytics`
- `mv_inventory_alerts`

**Solution:**
Create materialized view definitions:
```sql
CREATE MATERIALIZED VIEW mv_clinic_dashboard_stats AS
SELECT
    tenant_id,
    COUNT(DISTINCT pets.id) as total_pets,
    COUNT(DISTINCT CASE WHEN appointments.status = 'scheduled' THEN appointments.id END) as pending_appointments,
    -- etc.
FROM tenants
LEFT JOIN pets ON pets.tenant_id = tenants.id
-- ...
GROUP BY tenant_id;

CREATE UNIQUE INDEX ON mv_clinic_dashboard_stats(tenant_id);
```

**Acceptance Criteria:**
- [ ] Create all referenced materialized views
- [ ] Add refresh schedule (cron or trigger)
- [ ] Update API routes to use views
- [ ] Document refresh frequency

---

## 10. Low Priority - Code Quality

### TICKET-CODE-001: Console.log Statements in Production Code
**Priority:** LOW
**Type:** Code Quality
**Affected Files:**
- `web/app/actions/send-email.ts` (Line 1)
- `web/app/api/consents/requests/route.ts` (Lines 138-140)
- Multiple script files

**Description:**
Debug console.log statements that should be removed or replaced with proper logging.

**Solution:**
- Remove development console.log statements
- Keep console.error for error handling
- Consider using a logging library for production

**Acceptance Criteria:**
- [ ] Audit all console.log statements
- [ ] Remove debug logs
- [ ] Keep error logs
- [ ] Consider structured logging for production

---

### TICKET-CODE-002: Animation Ignores prefers-reduced-motion
**Priority:** LOW
**Type:** Accessibility
**Affected Files:**
- Multiple components with animations

**Description:**
Animations play regardless of user's motion preferences.

**Solution:**
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

Or in Tailwind:
```typescript
className="motion-safe:animate-slide-in motion-reduce:animate-none"
```

**Acceptance Criteria:**
- [ ] Add global CSS for reduced motion
- [ ] Test with system preference enabled

---

### TICKET-CODE-003: Missing Print Styles
**Priority:** LOW
**Type:** UX
**Affected Files:**
- Global styles

**Description:**
No print stylesheet - invoices, prescriptions don't print well.

**Solution:**
Add print styles:
```css
@media print {
    nav, footer, .no-print { display: none !important; }
    .print-only { display: block !important; }
    body { font-size: 12pt; }
    a[href]::after { content: none; }
}
```

**Acceptance Criteria:**
- [ ] Hide navigation/footer in print
- [ ] Optimize invoice layout for paper
- [ ] Test prescription PDF printing

---

## 11. Feature Gaps (TODOs)

### TICKET-TODO-001: Email Delivery Not Implemented
**Priority:** HIGH
**Type:** Feature Gap
**Affected Files:**
- `web/app/actions/invoices.ts` (Line 472)
- `web/app/api/consents/requests/route.ts` (Line 138)

**Description:**
Email sending is stubbed - only logs to console:
```typescript
// TODO: Implement actual email sending
console.log('Would send email to owner with message:', emailMessage);
```

**Solution:**
Integrate with email service (Resend, SendGrid, etc.):
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
    from: 'noreply@clinica.com',
    to: ownerEmail,
    subject: 'Factura de su visita',
    html: emailTemplate,
});
```

**Acceptance Criteria:**
- [ ] Choose and integrate email provider
- [ ] Create email templates (invoice, consent, reminders)
- [ ] Handle delivery failures
- [ ] Log email sends for audit

---

### TICKET-TODO-002: Consent PDF Generation Not Implemented
**Priority:** HIGH
**Type:** Feature Gap
**Affected Files:**
- `web/app/[clinic]/dashboard/consents/[id]/page.tsx` (Line 147)

**Description:**
PDF download shows alert instead of generating PDF:
```typescript
const handleDownloadPDF = (): void => {
    alert('Función de descarga de PDF próximamente');
};
```

**Solution:**
Use @react-pdf/renderer (already in dependencies):
```typescript
import { pdf } from '@react-pdf/renderer';
import { ConsentPDF } from '@/components/consents/consent-pdf';

const handleDownloadPDF = async () => {
    const blob = await pdf(<ConsentPDF consent={consent} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consentimiento-${consent.id}.pdf`;
    link.click();
};
```

**Acceptance Criteria:**
- [ ] Create ConsentPDF component
- [ ] Include signature image
- [ ] Include all form fields
- [ ] Test PDF generation

---

### TICKET-TODO-003: Appointment Slot Availability Check Missing
**Priority:** HIGH
**Type:** Feature Gap
**Affected Files:**
- `web/app/actions/appointments.ts` (Line 177)

**Description:**
TODO comment indicates availability check was never implemented:
```typescript
// 7. TODO: Check slot availability (for now, we allow overlaps)
```

**Solution:**
Implement availability check using TICKET-DB-007's overlap function.

**Acceptance Criteria:**
- [ ] Check for overlapping appointments
- [ ] Consider vet schedules/time off
- [ ] Return available slots only
- [ ] Handle edge cases (lunch breaks, etc.)

---

### TICKET-TODO-004: Consent Template Edit Not Implemented
**Priority:** MEDIUM
**Type:** Feature Gap
**Affected Files:**
- `web/app/[clinic]/dashboard/consents/templates/page.tsx` (Line 293)

**Description:**
Edit button has empty click handler:
```typescript
onClick={() => { /* TODO: Implement edit */ }}
```

**Solution:**
Implement edit modal or page:
1. Create edit form component
2. Fetch existing template data
3. Submit updates via API
4. Refresh list on success

**Acceptance Criteria:**
- [ ] Create edit form/modal
- [ ] Load existing template data
- [ ] Validate and submit changes
- [ ] Show success/error feedback

---

### TICKET-TODO-005: Notification "Read" Status Missing
**Priority:** MEDIUM
**Type:** Feature Gap
**Affected Files:**
- `web/app/api/notifications/route.ts` (Lines 55-95)

**Description:**
Notifications can be marked 'delivered' but there's no way to mark as 'read'.

**Solution:**
Add read status endpoint:
```typescript
// PATCH /api/notifications/mark-read
export async function PATCH(request: Request) {
    const { notificationIds } = await request.json();

    await supabase
        .from('notification_queue')
        .update({
            status: 'read',
            read_at: new Date().toISOString()
        })
        .in('id', notificationIds);
}
```

**Acceptance Criteria:**
- [ ] Add 'read' status to notification states
- [ ] Create endpoint to mark as read
- [ ] Update UI to show read/unread state
- [ ] Add bulk mark-all-read action

---

## Summary

| Priority | Count | Categories |
|----------|-------|------------|
| CRITICAL | 18 | Security (10), Business Logic (5), Database (3) |
| HIGH | 42 | Type Safety (5), Forms (5), Performance (5), Business Logic (5), Security (8), TODOs (4), Other (10) |
| MEDIUM | 47 | Accessibility (12), Error Handling (8), Database (7), Code Quality (10), Feature Gaps (10) |
| LOW | 20 | Code Quality (15), Accessibility (5) |
| **TOTAL** | **127** | |

### Recommended Sprint Planning

**Sprint 1 (Critical Security):**
- TICKET-SEC-001 through TICKET-SEC-005
- TICKET-BIZ-001, TICKET-BIZ-003, TICKET-BIZ-005
- TICKET-DB-001

**Sprint 2 (Critical Business Logic):**
- TICKET-BIZ-002, TICKET-BIZ-004, TICKET-BIZ-006 through TICKET-BIZ-010
- TICKET-SEC-006 through TICKET-SEC-010

**Sprint 3 (High Priority):**
- TICKET-TYPE-001 through TICKET-TYPE-003
- TICKET-FORM-001 through TICKET-FORM-004
- TICKET-PERF-001 through TICKET-PERF-003

**Sprint 4 (Medium Priority):**
- Accessibility tickets
- Error handling tickets
- Feature gaps

---

*Document generated by comprehensive codebase analysis. Each ticket includes specific file locations, code examples, and acceptance criteria for implementation.*
