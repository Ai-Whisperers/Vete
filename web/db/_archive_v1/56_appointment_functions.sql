-- =============================================================================
-- 56_APPOINTMENT_FUNCTIONS.SQL
-- =============================================================================
-- Functions for appointment validation and management.
-- =============================================================================

-- =============================================================================
-- A. CHECK_APPOINTMENT_OVERLAP
-- =============================================================================
-- Validates if a proposed appointment time overlaps with existing appointments.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_start_time: Start time of the proposed appointment (TIMESTAMPTZ)
--   p_end_time: End time of the proposed appointment (TIMESTAMPTZ)
--   p_vet_id: Optional - Specific vet to check for (NULL = check all)
--   p_exclude_id: Optional - Exclude specific appointment ID (for updates)
--
-- Returns:
--   TRUE if there IS an overlap (conflict exists)
--   FALSE if there is NO overlap (time slot is available)
--
-- Usage:
--   SELECT check_appointment_overlap(
--     'adris',
--     '2024-12-18 10:00:00-04',
--     '2024-12-18 11:00:00-04',
--     '123e4567-e89b-12d3-a456-426614174000',
--     NULL
--   );

CREATE OR REPLACE FUNCTION check_appointment_overlap(
    p_tenant_id TEXT,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM appointments
        WHERE tenant_id = p_tenant_id
        AND deleted_at IS NULL
        AND status NOT IN ('cancelled', 'no_show', 'rejected')
        AND (p_exclude_id IS NULL OR id != p_exclude_id)
        AND (p_vet_id IS NULL OR vet_id = p_vet_id)
        AND start_time < p_end_time
        AND end_time > p_start_time
    );
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION check_appointment_overlap IS
'Checks if a time slot overlaps with existing appointments. Returns TRUE if overlap exists (conflict), FALSE if slot is available.';

-- =============================================================================
-- B. GET_AVAILABLE_SLOTS
-- =============================================================================
-- Gets available appointment slots for a given date and vet.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_date: Date to check (DATE)
--   p_vet_id: Optional - Specific vet (NULL = check all)
--   p_slot_duration: Duration of each slot in minutes (default 30)
--   p_start_hour: Start of working hours (default 8)
--   p_end_hour: End of working hours (default 18)
--
-- Returns:
--   Table of available time slots with start_time, end_time, and is_available

CREATE OR REPLACE FUNCTION get_available_slots(
    p_tenant_id TEXT,
    p_date DATE,
    p_vet_id UUID DEFAULT NULL,
    p_slot_duration INTEGER DEFAULT 30,
    p_start_hour INTEGER DEFAULT 8,
    p_end_hour INTEGER DEFAULT 18
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    is_available BOOLEAN
) AS $$
DECLARE
    v_current_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_slot_start TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
BEGIN
    -- Calculate start and end times for the day
    v_current_time := (p_date + (p_start_hour || ' hours')::INTERVAL)::TIMESTAMPTZ;
    v_end_time := (p_date + (p_end_hour || ' hours')::INTERVAL)::TIMESTAMPTZ;

    -- Generate time slots
    WHILE v_current_time < v_end_time LOOP
        v_slot_start := v_current_time;
        v_slot_end := v_current_time + (p_slot_duration || ' minutes')::INTERVAL;

        -- Check if slot is available
        slot_start := v_slot_start;
        slot_end := v_slot_end;
        is_available := NOT check_appointment_overlap(
            p_tenant_id,
            v_slot_start,
            v_slot_end,
            p_vet_id,
            NULL
        );

        RETURN NEXT;

        v_current_time := v_slot_end;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_available_slots IS
'Returns all time slots for a given date with availability status for appointment booking.';

-- =============================================================================
-- C. COUNT_DAILY_APPOINTMENTS
-- =============================================================================
-- Counts active appointments for a specific date.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_date: Date to count appointments for
--   p_vet_id: Optional - Specific vet (NULL = all vets)
--
-- Returns:
--   Integer count of active appointments

CREATE OR REPLACE FUNCTION count_daily_appointments(
    p_tenant_id TEXT,
    p_date DATE,
    p_vet_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM appointments
    WHERE tenant_id = p_tenant_id
    AND deleted_at IS NULL
    AND status NOT IN ('cancelled', 'no_show', 'rejected')
    AND DATE(start_time) = p_date
    AND (p_vet_id IS NULL OR vet_id = p_vet_id);
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION count_daily_appointments IS
'Counts the number of active appointments for a given date and optional vet.';

-- =============================================================================
-- D. VALIDATE_APPOINTMENT_TIME
-- =============================================================================
-- Comprehensive validation for appointment booking.
-- Checks for overlaps, business hours, and date validity.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_start_time: Start time of the proposed appointment
--   p_end_time: End time of the proposed appointment
--   p_vet_id: Optional - Specific vet
--   p_exclude_id: Optional - Exclude specific appointment ID
--
-- Returns:
--   JSON with validation result: {"valid": boolean, "message": "error message"}

CREATE OR REPLACE FUNCTION validate_appointment_time(
    p_tenant_id TEXT,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_hour INTEGER;
BEGIN
    -- Check that end time is after start time
    IF p_end_time <= p_start_time THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'La hora de fin debe ser posterior a la hora de inicio'
        );
    END IF;

    -- Check that appointment is not in the past
    IF p_start_time < NOW() THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'No se pueden crear citas en el pasado'
        );
    END IF;

    -- Check business hours (8 AM - 6 PM)
    v_hour := EXTRACT(HOUR FROM p_start_time);
    IF v_hour < 8 OR v_hour >= 18 THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'Las citas deben estar entre las 8:00 y las 18:00'
        );
    END IF;

    -- Check for overlaps
    IF check_appointment_overlap(p_tenant_id, p_start_time, p_end_time, p_vet_id, p_exclude_id) THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'Ya existe una cita en este horario'
        );
    END IF;

    -- All validations passed
    RETURN jsonb_build_object(
        'valid', TRUE,
        'message', 'Horario disponible'
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION validate_appointment_time IS
'Comprehensive appointment time validation returning detailed error messages.';

-- =============================================================================
-- APPOINTMENT FUNCTIONS COMPLETE
-- =============================================================================
