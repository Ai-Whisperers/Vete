-- =============================================================================
-- 011_FIX_AVAILABLE_SLOTS.SQL
-- =============================================================================
-- Fixes the get_available_slots() function to respect service availability
-- settings instead of using hardcoded 08:00-18:00 times.
--
-- Issue:
--   The function used hardcoded working hours, ignoring the service's
--   available_start_time, available_end_time, and available_days columns.
-- =============================================================================

BEGIN;

-- =============================================================================
-- A. IMPROVED AVAILABLE SLOTS FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_available_slots(
    p_tenant_id TEXT,
    p_date DATE,
    p_service_id UUID DEFAULT NULL,
    p_vet_id UUID DEFAULT NULL,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    vet_id UUID,
    vet_name TEXT
) AS $$
DECLARE
    v_start_time TIME;
    v_end_time TIME;
    v_available_days INTEGER[];
    v_duration INTEGER;
    v_day_of_week INTEGER;
    v_slot_interval INTERVAL;
BEGIN
    -- Get day of week (1=Monday, 7=Sunday in PostgreSQL)
    v_day_of_week := EXTRACT(ISODOW FROM p_date)::INTEGER;

    -- Get service settings if service_id provided
    IF p_service_id IS NOT NULL THEN
        SELECT
            s.available_start_time,
            s.available_end_time,
            s.available_days,
            s.duration_minutes
        INTO
            v_start_time,
            v_end_time,
            v_available_days,
            v_duration
        FROM public.services s
        WHERE s.id = p_service_id
        AND s.is_active = true
        AND s.deleted_at IS NULL;

        -- Use service duration if not specified
        IF p_duration_minutes = 30 AND v_duration IS NOT NULL THEN
            v_duration := v_duration;
        ELSE
            v_duration := p_duration_minutes;
        END IF;

        -- Check if the day is available for this service
        IF v_available_days IS NOT NULL AND NOT (v_day_of_week = ANY(v_available_days)) THEN
            -- Day not available for this service, return empty
            RETURN;
        END IF;
    ELSE
        -- Default values if no service specified
        v_duration := p_duration_minutes;
    END IF;

    -- Default times if not set by service
    v_start_time := COALESCE(v_start_time, '08:00'::TIME);
    v_end_time := COALESCE(v_end_time, '18:00'::TIME);

    v_slot_interval := (v_duration || ' minutes')::INTERVAL;

    -- Generate slots for each vet
    RETURN QUERY
    WITH vets AS (
        SELECT pr.id, pr.full_name
        FROM public.profiles pr
        LEFT JOIN public.staff_schedules ss
            ON ss.staff_id = pr.id
            AND ss.day_of_week = v_day_of_week
        WHERE pr.tenant_id = p_tenant_id
        AND pr.role = 'vet'
        AND pr.deleted_at IS NULL
        AND (p_vet_id IS NULL OR pr.id = p_vet_id)
        -- Check if vet is scheduled to work this day
        AND (
            ss.id IS NULL  -- No schedule = available every day
            OR (ss.start_time IS NOT NULL AND ss.end_time IS NOT NULL)  -- Has schedule for this day
        )
        -- Check if vet is not on time off
        AND NOT EXISTS (
            SELECT 1 FROM public.staff_time_off sto
            WHERE sto.staff_id = pr.id
            AND p_date BETWEEN sto.start_date AND sto.end_date
            AND sto.status = 'approved'
        )
    ),
    vet_hours AS (
        SELECT
            v.id,
            v.full_name,
            COALESCE(ss.start_time, v_start_time) as work_start,
            COALESCE(ss.end_time, v_end_time) as work_end
        FROM vets v
        LEFT JOIN public.staff_schedules ss
            ON ss.staff_id = v.id
            AND ss.day_of_week = v_day_of_week
    ),
    time_slots AS (
        SELECT
            vh.id as vet_id,
            vh.full_name as vet_name,
            generate_series(
                p_date + GREATEST(vh.work_start, v_start_time),
                p_date + LEAST(vh.work_end, v_end_time) - v_slot_interval,
                v_slot_interval
            ) AS start_ts
        FROM vet_hours vh
    ),
    all_slots AS (
        SELECT
            ts.start_ts,
            ts.start_ts + v_slot_interval AS end_ts,
            ts.vet_id,
            ts.vet_name
        FROM time_slots ts
        -- Filter out past slots for today
        WHERE ts.start_ts > CASE
            WHEN p_date = CURRENT_DATE THEN NOW()
            ELSE p_date::TIMESTAMPTZ
        END
    )
    SELECT
        s.start_ts,
        s.end_ts,
        s.vet_id,
        s.vet_name
    FROM all_slots s
    WHERE NOT EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.tenant_id = p_tenant_id
        AND a.vet_id = s.vet_id
        AND a.status NOT IN ('cancelled', 'no_show')
        AND a.deleted_at IS NULL
        AND (a.start_time, a.end_time) OVERLAPS (s.start_ts, s.end_ts)
    )
    ORDER BY s.start_ts, s.vet_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. GET AVAILABLE SLOTS FOR WEEK
-- =============================================================================
-- Helper function to get slots for a week at once

CREATE OR REPLACE FUNCTION public.get_available_slots_week(
    p_tenant_id TEXT,
    p_start_date DATE,
    p_service_id UUID DEFAULT NULL,
    p_vet_id UUID DEFAULT NULL,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
    slot_date DATE,
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    vet_id UUID,
    vet_name TEXT
) AS $$
DECLARE
    v_date DATE;
BEGIN
    FOR i IN 0..6 LOOP
        v_date := p_start_date + i;

        RETURN QUERY
        SELECT
            v_date as slot_date,
            s.slot_start,
            s.slot_end,
            s.vet_id,
            s.vet_name
        FROM public.get_available_slots(
            p_tenant_id,
            v_date,
            p_service_id,
            p_vet_id,
            p_duration_minutes
        ) s;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. GET NEXT AVAILABLE SLOT
-- =============================================================================
-- Quick lookup for the next available slot

CREATE OR REPLACE FUNCTION public.get_next_available_slot(
    p_tenant_id TEXT,
    p_service_id UUID DEFAULT NULL,
    p_vet_id UUID DEFAULT NULL,
    p_duration_minutes INTEGER DEFAULT 30,
    p_max_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    vet_id UUID,
    vet_name TEXT
) AS $$
DECLARE
    v_date DATE;
    v_found BOOLEAN := false;
BEGIN
    v_date := CURRENT_DATE;

    WHILE NOT v_found AND v_date <= CURRENT_DATE + p_max_days_ahead LOOP
        RETURN QUERY
        SELECT
            s.slot_start,
            s.slot_end,
            s.vet_id,
            s.vet_name
        FROM public.get_available_slots(
            p_tenant_id,
            v_date,
            p_service_id,
            p_vet_id,
            p_duration_minutes
        ) s
        LIMIT 1;

        IF FOUND THEN
            v_found := true;
        ELSE
            v_date := v_date + 1;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- D. COUNT AVAILABLE SLOTS PER DAY
-- =============================================================================
-- For calendar views showing availability density

CREATE OR REPLACE FUNCTION public.count_available_slots_month(
    p_tenant_id TEXT,
    p_year INTEGER,
    p_month INTEGER,
    p_service_id UUID DEFAULT NULL,
    p_vet_id UUID DEFAULT NULL
)
RETURNS TABLE (
    slot_date DATE,
    total_slots INTEGER,
    morning_slots INTEGER,
    afternoon_slots INTEGER
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_date DATE;
BEGIN
    v_start_date := make_date(p_year, p_month, 1);
    v_end_date := (v_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    FOR v_date IN
        SELECT generate_series(v_start_date, v_end_date, '1 day'::INTERVAL)::DATE
    LOOP
        RETURN QUERY
        SELECT
            v_date,
            COUNT(*)::INTEGER as total_slots,
            COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM s.slot_start) < 12)::INTEGER as morning_slots,
            COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM s.slot_start) >= 12)::INTEGER as afternoon_slots
        FROM public.get_available_slots(
            p_tenant_id,
            v_date,
            p_service_id,
            p_vet_id
        ) s;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
