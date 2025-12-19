-- =============================================================================
-- 06_SCHEMA_APPOINTMENTS.SQL
-- =============================================================================
-- Appointment booking and scheduling system.
-- =============================================================================

-- =============================================================================
-- A. APPOINTMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES profiles(id),            -- Assigned/requested vet

    -- Scheduling
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Appointment Details
    reason TEXT NOT NULL,                           -- 'Vaccination', 'Checkup', etc.
    notes TEXT,                                     -- Internal notes for staff

    -- Status Workflow
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),

    -- Audit
    created_by UUID REFERENCES auth.users(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT appointments_dates_order CHECK (end_time > start_time)
);

-- =============================================================================
-- SCHEMA APPOINTMENTS COMPLETE
-- =============================================================================
