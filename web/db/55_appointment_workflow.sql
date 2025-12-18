-- =============================================================================
-- 55_APPOINTMENT_WORKFLOW.SQL
-- =============================================================================
-- Adds workflow columns and extended status values for staff appointment management.
-- =============================================================================

-- A. Update status CHECK constraint to include new workflow statuses
-- First drop the existing constraint, then add the new one
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
    CHECK (status IN (
        'pending',       -- Initial booking, awaiting confirmation
        'confirmed',     -- Confirmed by staff
        'checked_in',    -- Patient has arrived
        'in_progress',   -- Consultation in progress
        'completed',     -- Appointment finished
        'cancelled',     -- Cancelled by owner or staff
        'no_show',       -- Patient didn't arrive
        'rejected'       -- Rejected by staff (legacy)
    ));

-- B. Add workflow tracking columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES profiles(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES profiles(id);

-- C. Add index for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_date_status
    ON appointments(tenant_id, start_time, status);

CREATE INDEX IF NOT EXISTS idx_appointments_today
    ON appointments(tenant_id, start_time)
    WHERE status NOT IN ('cancelled', 'no_show');

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
