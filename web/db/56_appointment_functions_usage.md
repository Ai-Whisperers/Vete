# Appointment Overlap Validation Functions - Usage Guide

## Overview

Migration `56_appointment_functions.sql` provides a set of database functions for proper appointment overlap validation and time slot management. These functions should be used in API routes to ensure consistent validation logic at the database level.

## Functions

### 1. `check_appointment_overlap()`

**Purpose**: Core validation function that checks if a proposed appointment time overlaps with existing appointments.

**Signature**:
```sql
check_appointment_overlap(
    p_tenant_id TEXT,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN
```

**Parameters**:
- `p_tenant_id`: The clinic tenant ID to check within
- `p_start_time`: Start time of the proposed appointment (TIMESTAMPTZ)
- `p_end_time`: End time of the proposed appointment (TIMESTAMPTZ)
- `p_vet_id`: (Optional) Specific vet to check for. If NULL, checks all appointments
- `p_exclude_id`: (Optional) Appointment ID to exclude from the check (used when updating)

**Returns**:
- `TRUE` if there IS an overlap (conflict exists)
- `FALSE` if there is NO overlap (time slot is available)

**Example Usage**:
```sql
-- Check if 10:00 AM - 11:00 AM is available on Dec 18, 2024
SELECT check_appointment_overlap(
    'adris',
    '2024-12-18 10:00:00-04'::TIMESTAMPTZ,
    '2024-12-18 11:00:00-04'::TIMESTAMPTZ,
    NULL, -- Check for any vet
    NULL  -- Don't exclude any appointments
);
-- Returns TRUE if overlap exists, FALSE if available

-- Check for specific vet, excluding current appointment (for updates)
SELECT check_appointment_overlap(
    'adris',
    '2024-12-18 10:00:00-04'::TIMESTAMPTZ,
    '2024-12-18 11:00:00-04'::TIMESTAMPTZ,
    '123e4567-e89b-12d3-a456-426614174000'::UUID, -- Specific vet
    'abc12345-6789-0abc-def0-123456789012'::UUID  -- Exclude this appointment
);
```

**Key Features**:
- Automatically filters out cancelled, no_show, and rejected appointments
- Excludes soft-deleted appointments (`deleted_at IS NULL`)
- Uses proper interval overlap logic: `start1 < end2 AND end1 > start2`

---

### 2. `get_available_slots()`

**Purpose**: Generates all time slots for a given date and indicates which are available.

**Signature**:
```sql
get_available_slots(
    p_tenant_id TEXT,
    p_date DATE,
    p_vet_id UUID DEFAULT NULL,
    p_slot_duration INTEGER DEFAULT 30,
    p_start_hour INTEGER DEFAULT 8,
    p_end_hour INTEGER DEFAULT 18
) RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    is_available BOOLEAN
)
```

**Parameters**:
- `p_tenant_id`: The clinic tenant ID
- `p_date`: Date to generate slots for (DATE)
- `p_vet_id`: (Optional) Specific vet. NULL = check all
- `p_slot_duration`: Duration of each slot in minutes (default 30)
- `p_start_hour`: Start of working hours (default 8 = 8 AM)
- `p_end_hour`: End of working hours (default 18 = 6 PM)

**Returns**: A table with columns:
- `slot_start`: Start timestamp of the slot
- `slot_end`: End timestamp of the slot
- `is_available`: TRUE if available, FALSE if booked

**Example Usage**:
```sql
-- Get all 30-minute slots for Dec 18, 2024
SELECT * FROM get_available_slots(
    'adris',
    '2024-12-18'::DATE,
    NULL, -- All vets
    30,   -- 30-minute slots
    8,    -- 8 AM start
    18    -- 6 PM end
);

-- Get 60-minute slots for a specific vet
SELECT * FROM get_available_slots(
    'adris',
    '2024-12-18'::DATE,
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    60,   -- 60-minute slots
    9,    -- 9 AM start
    17    -- 5 PM end
);
```

---

### 3. `count_daily_appointments()`

**Purpose**: Counts active appointments for a specific date.

**Signature**:
```sql
count_daily_appointments(
    p_tenant_id TEXT,
    p_date DATE,
    p_vet_id UUID DEFAULT NULL
) RETURNS INTEGER
```

**Example Usage**:
```sql
-- Count all appointments for today
SELECT count_daily_appointments('adris', CURRENT_DATE);

-- Count appointments for a specific vet
SELECT count_daily_appointments(
    'adris',
    '2024-12-18'::DATE,
    '123e4567-e89b-12d3-a456-426614174000'::UUID
);
```

---

### 4. `validate_appointment_time()`

**Purpose**: Comprehensive validation that checks overlaps, business hours, and date validity all at once.

**Signature**:
```sql
validate_appointment_time(
    p_tenant_id TEXT,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS JSONB
```

**Returns**: JSON object with validation result:
```json
{
  "valid": true/false,
  "message": "Error message or success message"
}
```

**Example Usage**:
```sql
-- Validate a proposed appointment time
SELECT validate_appointment_time(
    'adris',
    '2024-12-18 10:00:00-04'::TIMESTAMPTZ,
    '2024-12-18 11:00:00-04'::TIMESTAMPTZ,
    NULL,
    NULL
);
-- Returns: {"valid": true, "message": "Horario disponible"}
-- Or: {"valid": false, "message": "Ya existe una cita en este horario"}
```

**Validation Checks**:
1. End time must be after start time
2. Appointment cannot be in the past
3. Must be within business hours (8 AM - 6 PM)
4. Must not overlap with existing appointments

---

## Integration with API Routes

### Updating `/api/booking` POST endpoint

Replace the current overlap check (lines 163-178) with the database function:

```typescript
// Before (current code - INCORRECT):
const { data: existingAppointments } = await supabase
  .from('appointments')
  .select('id, start_time, end_time')
  .eq('tenant_id', effectiveClinic)
  .eq('appointment_date', appointment_date)
  .not('status', 'in', '("cancelled","no_show")')
  .lt('start_time', endTime)
  .gt('end_time', time_slot);

if (existingAppointments && existingAppointments.length > 0) {
  return NextResponse.json(
    { error: 'Este horario se sobrepone con otra cita existente', code: 'TIME_CONFLICT' },
    { status: 409 }
  );
}

// After (using database function - CORRECT):
// Build full timestamp for validation
const startTimestamp = new Date(`${appointment_date}T${time_slot}`);
const endTimestamp = new Date(`${appointment_date}T${endTime}`);

// Check for overlap using database function
const { data: overlapCheck, error: overlapError } = await supabase
  .rpc('check_appointment_overlap', {
    p_tenant_id: effectiveClinic,
    p_start_time: startTimestamp.toISOString(),
    p_end_time: endTimestamp.toISOString(),
    p_vet_id: null, // Check all vets, or pass specific vet_id if needed
    p_exclude_id: null
  });

if (overlapError) {
  console.error('Error checking overlap:', overlapError);
  return apiError('DATABASE_ERROR', 500);
}

if (overlapCheck === true) {
  return NextResponse.json(
    { error: 'Este horario se sobrepone con otra cita existente', code: 'TIME_CONFLICT' },
    { status: 409 }
  );
}
```

### Updating `/api/booking` PUT endpoint

Add overlap validation when rescheduling (after line 301):

```typescript
if (time_slot && appointment_date) {
  // Build timestamps
  const startTimestamp = new Date(`${appointment_date}T${time_slot}`);
  const endTimestamp = new Date(`${appointment_date}T${updates.end_time}`);

  // Check for overlap, excluding current appointment
  const { data: overlapCheck, error: overlapError } = await supabase
    .rpc('check_appointment_overlap', {
      p_tenant_id: pet.tenant_id,
      p_start_time: startTimestamp.toISOString(),
      p_end_time: endTimestamp.toISOString(),
      p_vet_id: null,
      p_exclude_id: id // Exclude current appointment being updated
    });

  if (overlapError) {
    console.error('Error checking overlap:', overlapError);
    return apiError('DATABASE_ERROR', 500);
  }

  if (overlapCheck === true) {
    return NextResponse.json(
      { error: 'El nuevo horario se sobrepone con otra cita existente', code: 'TIME_CONFLICT' },
      { status: 409 }
    );
  }
}
```

### Updating `/api/appointments/slots` route

Replace the entire logic with the database function:

```typescript
// Current implementation (lines 62-128) can be replaced with:
const { data: slots, error: slotsError } = await supabase
  .rpc('get_available_slots', {
    p_tenant_id: clinicSlug,
    p_date: date,
    p_vet_id: vetId || null,
    p_slot_duration: slotDuration,
    p_start_hour: 8,
    p_end_hour: 18
  });

if (slotsError) {
  console.error('Error fetching slots:', slotsError);
  return NextResponse.json(
    { error: 'Error al generar horarios disponibles' },
    { status: 500 }
  );
}

// Transform to match expected format
const formattedSlots = slots.map((slot: any) => ({
  time: new Date(slot.slot_start).toTimeString().substring(0, 5),
  available: slot.is_available
}));

return NextResponse.json({
  date,
  clinic: clinicSlug,
  slotDuration,
  slots: formattedSlots
});
```

---

## Benefits of Using Database Functions

1. **Consistency**: Overlap logic is defined once in the database, used everywhere
2. **Performance**: Database handles the complex overlap query efficiently
3. **Atomicity**: Race conditions are handled at the database level
4. **Maintainability**: Update logic in one place instead of across multiple API routes
5. **Reusability**: Can be called from any API route, server action, or even direct SQL
6. **Type Safety**: Function signatures are enforced by PostgreSQL
7. **Testability**: Can test validation logic directly in SQL without API layer

---

## Schema Reference

The functions work with the `appointments` table structure:

```sql
appointments (
  id UUID,
  tenant_id TEXT,
  pet_id UUID,
  vet_id UUID,
  start_time TIMESTAMPTZ,  -- Full timestamp (not separate date/time)
  end_time TIMESTAMPTZ,    -- Full timestamp
  status TEXT,             -- 'pending', 'confirmed', 'cancelled', 'no_show', etc.
  deleted_at TIMESTAMPTZ,  -- Soft delete timestamp
  ...
)
```

**Important**: The table uses `start_time` and `end_time` as TIMESTAMPTZ, not separate `appointment_date` and `time` columns.

---

## Testing

Test the functions directly in Supabase SQL editor:

```sql
-- Test 1: Check overlap for available slot
SELECT check_appointment_overlap(
    'adris',
    NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
    NOW() + INTERVAL '1 day' + INTERVAL '11 hours',
    NULL,
    NULL
);
-- Should return FALSE if no appointments exist

-- Test 2: Insert a test appointment
INSERT INTO appointments (tenant_id, pet_id, start_time, end_time, status, reason)
VALUES (
    'adris',
    (SELECT id FROM pets WHERE tenant_id = 'adris' LIMIT 1),
    NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
    NOW() + INTERVAL '1 day' + INTERVAL '11 hours',
    'confirmed',
    'Test appointment'
);

-- Test 3: Check overlap again (should now return TRUE)
SELECT check_appointment_overlap(
    'adris',
    NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
    NOW() + INTERVAL '1 day' + INTERVAL '11 hours',
    NULL,
    NULL
);
-- Should return TRUE

-- Test 4: Get available slots
SELECT * FROM get_available_slots(
    'adris',
    (NOW() + INTERVAL '1 day')::DATE,
    NULL,
    30,
    8,
    18
);

-- Test 5: Comprehensive validation
SELECT validate_appointment_time(
    'adris',
    NOW() + INTERVAL '1 day' + INTERVAL '15 hours',
    NOW() + INTERVAL '1 day' + INTERVAL '16 hours',
    NULL,
    NULL
);

-- Cleanup test data
DELETE FROM appointments WHERE reason = 'Test appointment';
```

---

## Migration Checklist

- [x] Create `56_appointment_functions.sql` migration
- [ ] Update `/api/booking` POST endpoint to use `check_appointment_overlap()`
- [ ] Update `/api/booking` PUT endpoint to use `check_appointment_overlap()` with `p_exclude_id`
- [ ] Update `/api/appointments/slots` to use `get_available_slots()`
- [ ] Test all endpoints with various scenarios
- [ ] Remove old overlap checking code
- [ ] Deploy migration to production
- [ ] Monitor for any issues

---

## Notes

- The current API routes have inconsistencies (mixing `appointment_date` + `start_time`/`end_time` as separate TIME fields vs TIMESTAMPTZ)
- The database schema uses TIMESTAMPTZ for both `start_time` and `end_time`
- When updating API routes, ensure timestamps are properly formatted as ISO strings
- Consider adding timezone awareness if clinics operate in different timezones
