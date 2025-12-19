-- =============================================================================
-- 26_SCHEMA_STAFF.SQL
-- =============================================================================
-- Staff management and scheduling for veterinary clinics.
-- Includes staff profiles, schedules, time off, and shift management.
-- =============================================================================

-- =============================================================================
-- A. STAFF PROFILES (Extended info beyond profiles table)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Employment info
    employee_id TEXT,
    hire_date DATE,
    termination_date DATE,
    employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN (
        'full_time', 'part_time', 'contract', 'intern', 'volunteer'
    )),
    employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN (
        'active', 'on_leave', 'suspended', 'terminated'
    )),

    -- Position
    job_title TEXT NOT NULL,
    department TEXT,
    specializations TEXT[],
    license_number TEXT,
    license_expiry DATE,

    -- Schedule preferences
    preferred_shift TEXT CHECK (preferred_shift IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),
    max_hours_per_week INTEGER DEFAULT 40,
    can_work_weekends BOOLEAN DEFAULT TRUE,
    can_work_holidays BOOLEAN DEFAULT FALSE,

    -- Contact (work)
    work_phone TEXT,
    work_email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    -- Compensation (reference only - actual payroll in separate system)
    hourly_rate DECIMAL(10,2),
    salary_type TEXT CHECK (salary_type IN ('hourly', 'salary', 'commission')),

    -- Skills and certifications
    certifications JSONB DEFAULT '[]',
    -- Structure: [{"name": "", "issued_by": "", "issued_date": "", "expiry_date": ""}]
    skills TEXT[],
    languages TEXT[] DEFAULT ARRAY['es'],

    -- Settings
    color_code TEXT DEFAULT '#3B82F6', -- For calendar display
    can_be_booked BOOLEAN DEFAULT TRUE, -- Can clients book directly

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, tenant_id),
    UNIQUE(tenant_id, employee_id)
);

-- =============================================================================
-- B. WORK SCHEDULES (Regular weekly schedule)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,

    -- Schedule info
    name TEXT NOT NULL DEFAULT 'Regular Schedule',
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES staff_schedules(id) ON DELETE CASCADE,

    -- Day and time
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Break
    break_start TIME,
    break_end TIME,

    -- Location/room
    location TEXT,

    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_break_range CHECK (break_end IS NULL OR break_end > break_start)
);

-- =============================================================================
-- C. SHIFTS (Actual worked shifts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Shift timing
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,

    -- Break
    break_minutes INTEGER DEFAULT 0,

    -- Type
    shift_type TEXT NOT NULL DEFAULT 'regular' CHECK (shift_type IN (
        'regular', 'overtime', 'on_call', 'emergency', 'training', 'meeting'
    )),

    -- Location
    location TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled'
    )),

    -- Clock in/out
    clock_in_at TIMESTAMPTZ,
    clock_out_at TIMESTAMPTZ,
    clock_in_method TEXT CHECK (clock_in_method IN ('manual', 'badge', 'biometric', 'app')),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. TIME OFF REQUESTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS time_off_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,

    -- Type info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Settings
    is_paid BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    max_days_per_year INTEGER,
    min_notice_days INTEGER DEFAULT 1,
    color_code TEXT DEFAULT '#EF4444',

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- Unique index for global time off types (tenant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_time_off_types_global_code
ON time_off_types (code) WHERE tenant_id IS NULL;

CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    time_off_type_id UUID NOT NULL REFERENCES time_off_types(id) ON DELETE CASCADE,

    -- Request details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_half_day BOOLEAN DEFAULT FALSE, -- Start afternoon
    end_half_day BOOLEAN DEFAULT FALSE, -- End morning

    -- Hours/days
    total_days DECIMAL(4,1) NOT NULL,
    total_hours DECIMAL(5,1),

    -- Reason
    reason TEXT,
    attachment_url TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'denied', 'cancelled', 'withdrawn'
    )),

    -- Approval
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Coverage
    coverage_notes TEXT,
    covering_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- =============================================================================
-- E. TIME OFF BALANCES
-- =============================================================================

CREATE TABLE IF NOT EXISTS time_off_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    time_off_type_id UUID NOT NULL REFERENCES time_off_types(id) ON DELETE CASCADE,

    -- Year
    year INTEGER NOT NULL,

    -- Balance
    allocated_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    used_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    pending_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    carried_over_days DECIMAL(5,1) NOT NULL DEFAULT 0,

    -- Calculated
    available_days DECIMAL(5,1) GENERATED ALWAYS AS (
        allocated_days + carried_over_days - used_days - pending_days
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(staff_profile_id, time_off_type_id, year)
);

-- =============================================================================
-- F. AVAILABILITY OVERRIDES
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_availability_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,

    -- Date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Override type
    override_type TEXT NOT NULL CHECK (override_type IN (
        'available', 'unavailable', 'limited'
    )),

    -- If limited, specify hours
    start_time TIME,
    end_time TIME,

    -- Reason
    reason TEXT,

    -- Recurring?
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'weekly', 'monthly'

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_override_dates CHECK (end_date >= start_date)
);

-- =============================================================================
-- G. STAFF TASKS
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Assignment
    assigned_to UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Task info
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Timing
    due_date TIMESTAMPTZ,
    reminder_at TIMESTAMPTZ,

    -- Related entities
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled', 'deferred'
    )),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. PERFORMANCE / REVIEWS (Simple tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,

    -- Review info
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_type TEXT NOT NULL DEFAULT 'annual' CHECK (review_type IN (
        'annual', 'probation', 'mid_year', 'project', 'incident'
    )),

    -- Reviewer
    reviewed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,

    -- Ratings (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    ratings JSONB DEFAULT '{}',
    -- Structure: {"punctuality": 4, "teamwork": 5, "technical_skills": 4, ...}

    -- Feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,

    -- Employee acknowledgment
    employee_acknowledged BOOLEAN DEFAULT FALSE,
    employee_acknowledged_at TIMESTAMPTZ,
    employee_comments TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'acknowledged', 'finalized'
    )),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_staff_profiles_tenant ON staff_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_user ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_status ON staff_profiles(employment_status);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_bookable ON staff_profiles(can_be_booked) WHERE can_be_booked = TRUE;

CREATE INDEX IF NOT EXISTS idx_staff_schedules_profile ON staff_schedules(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_active ON staff_schedules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_staff_schedule_entries_schedule ON staff_schedule_entries(schedule_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_entries_day ON staff_schedule_entries(day_of_week);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_profile ON staff_shifts(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_tenant ON staff_shifts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_dates ON staff_shifts(scheduled_start, scheduled_end);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_status ON staff_shifts(status);

CREATE INDEX IF NOT EXISTS idx_time_off_types_tenant ON time_off_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_profile ON time_off_requests(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_tenant ON time_off_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON time_off_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_time_off_balances_profile ON time_off_balances(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_off_balances_year ON time_off_balances(year);

CREATE INDEX IF NOT EXISTS idx_staff_availability_profile ON staff_availability_overrides(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_dates ON staff_availability_overrides(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_staff_tasks_tenant ON staff_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned ON staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_due ON staff_tasks(due_date) WHERE status NOT IN ('completed', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_staff_reviews_profile ON staff_reviews(staff_profile_id);

-- =============================================================================
-- J. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_staff_profiles_updated_at
    BEFORE UPDATE ON staff_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_schedules_updated_at
    BEFORE UPDATE ON staff_schedules
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_shifts_updated_at
    BEFORE UPDATE ON staff_shifts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON time_off_requests
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_time_off_balances_updated_at
    BEFORE UPDATE ON time_off_balances
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_tasks_updated_at
    BEFORE UPDATE ON staff_tasks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_reviews_updated_at
    BEFORE UPDATE ON staff_reviews
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- K. FUNCTIONS
-- =============================================================================

-- Get staff availability for a date range
CREATE OR REPLACE FUNCTION get_staff_availability(
    p_tenant_id TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_staff_id UUID DEFAULT NULL
)
RETURNS TABLE (
    staff_profile_id UUID,
    staff_name TEXT,
    date DATE,
    is_available BOOLEAN,
    start_time TIME,
    end_time TIME,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS date
    ),
    staff_list AS (
        SELECT sp.id, p.full_name
        FROM staff_profiles sp
        JOIN profiles p ON sp.user_id = p.id
        WHERE sp.tenant_id = p_tenant_id
          AND sp.employment_status = 'active'
          AND (p_staff_id IS NULL OR sp.id = p_staff_id)
    ),
    regular_schedule AS (
        SELECT
            sl.id AS staff_profile_id,
            sl.full_name AS staff_name,
            ds.date,
            sse.start_time,
            sse.end_time
        FROM staff_list sl
        CROSS JOIN date_series ds
        LEFT JOIN staff_schedules ss ON sl.id = ss.staff_profile_id AND ss.is_active = TRUE
        LEFT JOIN staff_schedule_entries sse ON ss.id = sse.schedule_id
            AND sse.day_of_week = EXTRACT(DOW FROM ds.date)
    ),
    time_off AS (
        SELECT
            tor.staff_profile_id,
            tor.start_date,
            tor.end_date
        FROM time_off_requests tor
        WHERE tor.tenant_id = p_tenant_id
          AND tor.status = 'approved'
          AND tor.start_date <= p_end_date
          AND tor.end_date >= p_start_date
    ),
    overrides AS (
        SELECT
            sao.staff_profile_id,
            sao.start_date,
            sao.end_date,
            sao.override_type,
            sao.start_time,
            sao.end_time,
            sao.reason
        FROM staff_availability_overrides sao
        JOIN staff_list sl ON sao.staff_profile_id = sl.id
        WHERE sao.start_date <= p_end_date
          AND sao.end_date >= p_start_date
    )
    SELECT
        rs.staff_profile_id,
        rs.staff_name,
        rs.date,
        CASE
            WHEN EXISTS (SELECT 1 FROM time_off t WHERE t.staff_profile_id = rs.staff_profile_id
                        AND rs.date BETWEEN t.start_date AND t.end_date) THEN FALSE
            WHEN EXISTS (SELECT 1 FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
                        AND rs.date BETWEEN o.start_date AND o.end_date
                        AND o.override_type = 'unavailable') THEN FALSE
            WHEN rs.start_time IS NOT NULL THEN TRUE
            ELSE FALSE
        END AS is_available,
        COALESCE(
            (SELECT o.start_time FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
             AND rs.date BETWEEN o.start_date AND o.end_date AND o.override_type = 'limited' LIMIT 1),
            rs.start_time
        ) AS start_time,
        COALESCE(
            (SELECT o.end_time FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
             AND rs.date BETWEEN o.start_date AND o.end_date AND o.override_type = 'limited' LIMIT 1),
            rs.end_time
        ) AS end_time,
        (SELECT o.reason FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
         AND rs.date BETWEEN o.start_date AND o.end_date LIMIT 1) AS reason
    FROM regular_schedule rs
    ORDER BY rs.staff_profile_id, rs.date;
END;
$$ LANGUAGE plpgsql;

-- Update time off balance when request is approved/cancelled
CREATE OR REPLACE FUNCTION update_time_off_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Request approved
        IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
            UPDATE time_off_balances
            SET used_days = used_days + NEW.total_days,
                pending_days = pending_days - NEW.total_days
            WHERE staff_profile_id = NEW.staff_profile_id
              AND time_off_type_id = NEW.time_off_type_id
              AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        -- Request denied or withdrawn
        IF OLD.status = 'pending' AND NEW.status IN ('denied', 'withdrawn') THEN
            UPDATE time_off_balances
            SET pending_days = pending_days - NEW.total_days
            WHERE staff_profile_id = NEW.staff_profile_id
              AND time_off_type_id = NEW.time_off_type_id
              AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        -- Approved request cancelled
        IF OLD.status = 'approved' AND NEW.status = 'cancelled' THEN
            UPDATE time_off_balances
            SET used_days = used_days - NEW.total_days
            WHERE staff_profile_id = NEW.staff_profile_id
              AND time_off_type_id = NEW.time_off_type_id
              AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        -- New request - add to pending
        UPDATE time_off_balances
        SET pending_days = pending_days + NEW.total_days
        WHERE staff_profile_id = NEW.staff_profile_id
          AND time_off_type_id = NEW.time_off_type_id
          AND year = EXTRACT(YEAR FROM NEW.start_date);

        -- Create balance record if doesn't exist
        INSERT INTO time_off_balances (staff_profile_id, time_off_type_id, year, pending_days)
        VALUES (NEW.staff_profile_id, NEW.time_off_type_id, EXTRACT(YEAR FROM NEW.start_date), NEW.total_days)
        ON CONFLICT (staff_profile_id, time_off_type_id, year) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_off_request_balance_update
    AFTER INSERT OR UPDATE ON time_off_requests
    FOR EACH ROW EXECUTE FUNCTION update_time_off_balance();

-- Get staff schedule for today
CREATE OR REPLACE FUNCTION get_today_schedule(p_tenant_id TEXT)
RETURNS TABLE (
    staff_profile_id UUID,
    staff_name TEXT,
    job_title TEXT,
    shift_start TIMESTAMPTZ,
    shift_end TIMESTAMPTZ,
    shift_status TEXT,
    is_clocked_in BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sp.id,
        p.full_name,
        sp.job_title,
        ss.scheduled_start,
        ss.scheduled_end,
        ss.status,
        ss.clock_in_at IS NOT NULL AND ss.clock_out_at IS NULL
    FROM staff_profiles sp
    JOIN profiles p ON sp.user_id = p.id
    LEFT JOIN staff_shifts ss ON sp.id = ss.staff_profile_id
        AND ss.scheduled_start::date = CURRENT_DATE
    WHERE sp.tenant_id = p_tenant_id
      AND sp.employment_status = 'active'
    ORDER BY ss.scheduled_start NULLS LAST, p.full_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- L. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_reviews ENABLE ROW LEVEL SECURITY;

-- Staff Profiles: Staff can view colleagues, manage own
CREATE POLICY staff_profiles_select ON staff_profiles FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY staff_profiles_insert ON staff_profiles FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY staff_profiles_update ON staff_profiles FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id) AND (user_id = auth.uid() OR
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')));

-- Schedules: Staff can view, admins manage
CREATE POLICY staff_schedules_select ON staff_schedules FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_schedules.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY staff_schedules_insert ON staff_schedules FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_schedules.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY staff_schedules_update ON staff_schedules FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_schedules.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

-- Schedule Entries
CREATE POLICY staff_schedule_entries_all ON staff_schedule_entries FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_schedules ss
                JOIN staff_profiles sp ON ss.staff_profile_id = sp.id
                WHERE ss.id = staff_schedule_entries.schedule_id AND is_staff_of(sp.tenant_id))
    );

-- Shifts
CREATE POLICY staff_shifts_select ON staff_shifts FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY staff_shifts_insert ON staff_shifts FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY staff_shifts_update ON staff_shifts FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Time Off Types
CREATE POLICY time_off_types_select ON time_off_types FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY time_off_types_insert ON time_off_types FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Time Off Requests: Staff view own, admins view all
CREATE POLICY time_off_requests_select ON time_off_requests FOR SELECT TO authenticated
    USING (
        is_staff_of(tenant_id) AND (
            EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = time_off_requests.staff_profile_id
                    AND sp.user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

CREATE POLICY time_off_requests_insert ON time_off_requests FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = time_off_requests.staff_profile_id
                AND sp.user_id = auth.uid() AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY time_off_requests_update ON time_off_requests FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Time Off Balances
CREATE POLICY time_off_balances_select ON time_off_balances FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = time_off_balances.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND (sp.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
    );

-- Availability Overrides
CREATE POLICY staff_availability_select ON staff_availability_overrides FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_availability_overrides.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY staff_availability_insert ON staff_availability_overrides FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_availability_overrides.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND (sp.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
    );

-- Tasks
CREATE POLICY staff_tasks_select ON staff_tasks FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY staff_tasks_insert ON staff_tasks FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY staff_tasks_update ON staff_tasks FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Reviews: Admin only for full access, staff can view own
CREATE POLICY staff_reviews_select ON staff_reviews FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_reviews.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND (sp.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
    );

CREATE POLICY staff_reviews_insert ON staff_reviews FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_reviews.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    );

CREATE POLICY staff_reviews_update ON staff_reviews FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_reviews.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

-- =============================================================================
-- M. SEED TIME OFF TYPES
-- =============================================================================

INSERT INTO time_off_types (tenant_id, code, name, is_paid, requires_approval, max_days_per_year, color_code) VALUES
    (NULL, 'VACATION', 'Vacaciones', TRUE, TRUE, 15, '#22C55E'),
    (NULL, 'SICK', 'Enfermedad', TRUE, TRUE, NULL, '#EF4444'),
    (NULL, 'PERSONAL', 'Personal', TRUE, TRUE, 3, '#3B82F6'),
    (NULL, 'MATERNITY', 'Maternidad', TRUE, TRUE, 84, '#EC4899'),
    (NULL, 'PATERNITY', 'Paternidad', TRUE, TRUE, 14, '#8B5CF6'),
    (NULL, 'BEREAVEMENT', 'Duelo', TRUE, FALSE, 5, '#6B7280'),
    (NULL, 'UNPAID', 'Sin Goce de Sueldo', FALSE, TRUE, NULL, '#F59E0B'),
    (NULL, 'TRAINING', 'Capacitación', TRUE, TRUE, 10, '#06B6D4')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STAFF SCHEMA COMPLETE
-- =============================================================================
