-- =============================================================================
-- 85_STAFF.SQL
-- =============================================================================
-- Staff management: profiles, schedules, time off.
--
-- Dependencies: 10_core/*
-- =============================================================================

-- =============================================================================
-- A. STAFF PROFILES (Extended info for staff members)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Professional info
    license_number TEXT,
    license_expiry DATE,
    specializations TEXT[],
    education TEXT,
    bio TEXT,

    -- Employment
    hire_date DATE,
    employment_type TEXT DEFAULT 'full_time'
        CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')),
    department TEXT,
    title TEXT,

    -- Rate/compensation
    hourly_rate NUMERIC(12,2),
    daily_rate NUMERIC(12,2),

    -- Emergency contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    -- Signatures
    signature_url TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(profile_id)
);

-- =============================================================================
-- B. STAFF SCHEDULES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Schedule name
    name TEXT DEFAULT 'Default',
    is_default BOOLEAN DEFAULT true,

    -- Effective dates
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- C. STAFF SCHEDULE ENTRIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.staff_schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.staff_schedules(id) ON DELETE CASCADE,

    -- Day
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    -- Time range
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Break
    break_start TIME,
    break_end TIME,

    -- Location (if multiple)
    location TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT staff_schedule_entries_times CHECK (end_time > start_time),
    CONSTRAINT staff_schedule_entries_break CHECK (
        (break_start IS NULL AND break_end IS NULL) OR
        (break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start)
    )
);

-- =============================================================================
-- D. TIME OFF TYPES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.time_off_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),

    -- Type info
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,

    -- Settings
    is_paid BOOLEAN DEFAULT true,
    max_days_per_year INTEGER,
    requires_approval BOOLEAN DEFAULT true,

    -- Display
    color TEXT DEFAULT '#6366f1',
    icon TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- E. STAFF TIME OFF
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.staff_time_off (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    type_id UUID REFERENCES public.time_off_types(id),

    -- Request details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_half_day BOOLEAN DEFAULT false,
    end_half_day BOOLEAN DEFAULT false,

    -- Reason
    reason TEXT,
    notes TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),

    -- Approval
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT staff_time_off_dates CHECK (end_date >= start_date)
);

-- =============================================================================
-- F. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;

-- Staff profiles: Staff view all, own edit
CREATE POLICY "Staff view all profiles" ON public.staff_profiles
    FOR SELECT TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Staff manage own profile" ON public.staff_profiles
    FOR UPDATE TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Admin manage all profiles" ON public.staff_profiles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = staff_profiles.tenant_id
            AND p.role = 'admin'
        )
    );

-- Schedules: Staff view, admin manage
CREATE POLICY "Staff view schedules" ON public.staff_schedules
    FOR SELECT TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Admin manage schedules" ON public.staff_schedules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = staff_schedules.tenant_id
            AND p.role = 'admin'
        )
    );

-- Schedule entries: Via schedule policy
CREATE POLICY "Access schedule entries" ON public.staff_schedule_entries
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_schedules s
            WHERE s.id = staff_schedule_entries.schedule_id
            AND public.is_staff_of(s.tenant_id)
        )
    );

-- Time off types: Staff view, admin manage
CREATE POLICY "Staff view time off types" ON public.time_off_types
    FOR SELECT TO authenticated
    USING (public.is_staff_of(tenant_id));

CREATE POLICY "Admin manage time off types" ON public.time_off_types
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = time_off_types.tenant_id
            AND p.role = 'admin'
        )
    );

-- Time off: Staff view own, admin manage all
CREATE POLICY "Staff view own time off" ON public.staff_time_off
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_profiles sp
            WHERE sp.id = staff_time_off.staff_id
            AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Staff request time off" ON public.staff_time_off
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff_profiles sp
            WHERE sp.id = staff_time_off.staff_id
            AND sp.profile_id = auth.uid()
        )
    );

CREATE POLICY "Admin manage time off" ON public.staff_time_off
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.tenant_id = staff_time_off.tenant_id
            AND p.role = 'admin'
        )
    );

-- =============================================================================
-- G. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_staff_profiles_profile ON public.staff_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_tenant ON public.staff_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_active ON public.staff_profiles(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff ON public.staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_tenant ON public.staff_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_active ON public.staff_schedules(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_staff_schedule_entries_schedule ON public.staff_schedule_entries(schedule_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_entries_day ON public.staff_schedule_entries(day_of_week);

CREATE INDEX IF NOT EXISTS idx_time_off_types_tenant ON public.time_off_types(tenant_id);

CREATE INDEX IF NOT EXISTS idx_staff_time_off_staff ON public.staff_time_off(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_off_tenant ON public.staff_time_off(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_off_dates ON public.staff_time_off(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_staff_time_off_status ON public.staff_time_off(status)
    WHERE status = 'pending';

-- =============================================================================
-- H. TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS handle_updated_at ON public.staff_profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.staff_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.staff_schedules;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.staff_schedules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.staff_time_off;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.staff_time_off
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- I. FUNCTIONS
-- =============================================================================

-- Check staff availability
CREATE OR REPLACE FUNCTION public.check_staff_availability(
    p_staff_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
    v_day_of_week INTEGER;
    v_has_schedule BOOLEAN;
    v_has_time_off BOOLEAN;
BEGIN
    v_day_of_week := EXTRACT(DOW FROM p_date);

    -- Check schedule
    SELECT EXISTS (
        SELECT 1 FROM public.staff_schedule_entries se
        JOIN public.staff_schedules s ON se.schedule_id = s.id
        WHERE s.staff_id = p_staff_id
          AND s.is_active = true
          AND (s.effective_until IS NULL OR s.effective_until >= p_date)
          AND s.effective_from <= p_date
          AND se.day_of_week = v_day_of_week
          AND se.start_time <= p_start_time
          AND se.end_time >= p_end_time
    ) INTO v_has_schedule;

    IF NOT v_has_schedule THEN
        RETURN false;
    END IF;

    -- Check time off
    SELECT EXISTS (
        SELECT 1 FROM public.staff_time_off
        WHERE staff_id = p_staff_id
          AND status = 'approved'
          AND p_date BETWEEN start_date AND end_date
    ) INTO v_has_time_off;

    RETURN NOT v_has_time_off;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- J. SEED DATA
-- =============================================================================

-- Default time off types (created per tenant on setup)

