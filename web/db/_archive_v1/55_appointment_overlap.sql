-- =============================================================================
-- 55_APPOINTMENT_OVERLAP.SQL
-- =============================================================================
-- Database function to check for appointment time overlaps.
-- This ensures proper slot availability checking and prevents double-booking.
-- =============================================================================

-- =============================================================================
-- A. CHECK APPOINTMENT OVERLAP FUNCTION
-- =============================================================================

-- Function to check if an appointment overlaps with existing appointments
-- Returns TRUE if there is an overlap, FALSE otherwise
-- Works with both appointment_date column (if exists) or extracts date from start_time
CREATE OR REPLACE FUNCTION check_appointment_overlap(
    p_tenant_id TEXT,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    has_overlap BOOLEAN;
    new_start_timestamp TIMESTAMPTZ;
    new_end_timestamp TIMESTAMPTZ;
BEGIN
    -- Create full timestamps for comparison
    new_start_timestamp := (p_date || 'T' || p_start_time || ':00')::TIMESTAMPTZ;
    new_end_timestamp := (p_date || 'T' || p_end_time || ':00')::TIMESTAMPTZ;

    -- Check for overlapping appointments using the standard overlap logic:
    -- Two time ranges [A_start, A_end) and [B_start, B_end) overlap if:
    -- A_start < B_end AND A_end > B_start
    SELECT EXISTS (
        SELECT 1
        FROM appointments
        WHERE tenant_id = p_tenant_id
          AND (
            -- Check using appointment_date column if it exists
            (appointment_date IS NOT NULL AND appointment_date = p_date)
            OR
            -- Fallback to extracting date from start_time
            (appointment_date IS NULL AND DATE(start_time) = p_date)
          )
          AND status NOT IN ('cancelled', 'no_show')
          -- Exclude specific appointment (useful for rescheduling)
          AND (p_exclude_id IS NULL OR id != p_exclude_id)
          -- Optionally filter by vet
          AND (p_vet_id IS NULL OR vet_id = p_vet_id)
          -- Overlap check: new slot starts before existing ends AND new slot ends after existing starts
          AND start_time < new_end_timestamp
          AND end_time > new_start_timestamp
    ) INTO has_overlap;

    RETURN has_overlap;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- B. GET AVAILABLE SLOTS FUNCTION
-- =============================================================================

-- Function to get all available time slots for a given date
-- This respects working hours, lunch breaks, and existing appointments
CREATE OR REPLACE FUNCTION get_available_slots(
    p_tenant_id TEXT,
    p_date DATE,
    p_slot_duration_minutes INTEGER DEFAULT 30,
    p_work_start TIME DEFAULT '08:00',
    p_work_end TIME DEFAULT '18:00',
    p_break_start TIME DEFAULT '12:00',
    p_break_end TIME DEFAULT '14:00',
    p_vet_id UUID DEFAULT NULL
) RETURNS TABLE (
    slot_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    current_minutes INTEGER;
    end_minutes INTEGER;
    break_start_minutes INTEGER;
    break_end_minutes INTEGER;
    slot_start TIME;
    slot_end TIME;
    overlaps BOOLEAN;
BEGIN
    -- Convert times to minutes for easier calculation
    current_minutes := EXTRACT(HOUR FROM p_work_start) * 60 + EXTRACT(MINUTE FROM p_work_start);
    end_minutes := EXTRACT(HOUR FROM p_work_end) * 60 + EXTRACT(MINUTE FROM p_work_end);
    break_start_minutes := EXTRACT(HOUR FROM p_break_start) * 60 + EXTRACT(MINUTE FROM p_break_start);
    break_end_minutes := EXTRACT(HOUR FROM p_break_end) * 60 + EXTRACT(MINUTE FROM p_break_end);

    -- Generate slots
    WHILE current_minutes + p_slot_duration_minutes <= end_minutes LOOP
        slot_start := make_time(current_minutes / 60, current_minutes % 60, 0);
        slot_end := make_time((current_minutes + p_slot_duration_minutes) / 60,
                              (current_minutes + p_slot_duration_minutes) % 60, 0);

        -- Skip slots that overlap with lunch break
        IF NOT (
            (current_minutes >= break_start_minutes AND current_minutes < break_end_minutes) OR
            (current_minutes + p_slot_duration_minutes > break_start_minutes AND
             current_minutes + p_slot_duration_minutes <= break_end_minutes) OR
            (current_minutes < break_start_minutes AND
             current_minutes + p_slot_duration_minutes > break_end_minutes)
        ) THEN
            -- Check if this slot overlaps with existing appointments
            overlaps := check_appointment_overlap(
                p_tenant_id,
                p_date,
                slot_start,
                slot_end,
                p_vet_id,
                NULL
            );

            -- Return the slot
            slot_time := slot_start;
            is_available := NOT overlaps;
            RETURN NEXT;
        END IF;

        -- Move to next slot
        current_minutes := current_minutes + p_slot_duration_minutes;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- C. HELPER COMMENTS
-- =============================================================================

-- Usage examples:
--
-- 1. Check if a specific time slot has an overlap:
--    SELECT check_appointment_overlap('adris', '2024-12-20', '09:00', '09:30');
--
-- 2. Check overlap excluding a specific appointment (for rescheduling):
--    SELECT check_appointment_overlap('adris', '2024-12-20', '09:00', '09:30', NULL, 'appointment-uuid');
--
-- 3. Get all available slots for a date:
--    SELECT * FROM get_available_slots('adris', '2024-12-20');
--
-- 4. Get available slots with custom hours:
--    SELECT * FROM get_available_slots('adris', '2024-12-20', 30, '08:00', '20:00', '12:00', '14:00');
--
-- 5. Get available slots for a specific vet:
--    SELECT * FROM get_available_slots('adris', '2024-12-20', 30, '08:00', '18:00', '12:00', '14:00', 'vet-uuid');

-- =============================================================================
-- D. ADD appointment_date COLUMN IF IT DOESN'T EXIST
-- =============================================================================

-- Add appointment_date column to support easier querying
-- This is a denormalized column derived from start_time
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;

-- Create index on appointment_date if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);

-- Create trigger to automatically populate appointment_date from start_time
CREATE OR REPLACE FUNCTION sync_appointment_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.appointment_date := DATE(NEW.start_time);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_appointment_date ON appointments;

-- Create trigger
CREATE TRIGGER trigger_sync_appointment_date
    BEFORE INSERT OR UPDATE OF start_time ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION sync_appointment_date();

-- Backfill existing appointments
UPDATE appointments
SET appointment_date = DATE(start_time)
WHERE appointment_date IS NULL;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
