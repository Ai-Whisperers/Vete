-- =============================================================================
-- 10_SCHEMA_EPIDEMIOLOGY.SQL
-- =============================================================================
-- Public health intelligence: disease tracking, outbreak mapping, and audit logs.
-- =============================================================================

-- =============================================================================
-- A. DISEASE REPORTS
-- =============================================================================
-- Anonymized disease reports for epidemiological analysis.

CREATE TABLE IF NOT EXISTS disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    diagnosis_code_id UUID REFERENCES diagnosis_codes(id),

    -- Anonymized Pet Data
    species TEXT NOT NULL,
    age_months INTEGER,
    is_vaccinated BOOLEAN,

    -- Location (zone, not exact address)
    location_zone TEXT,                     -- City/neighborhood

    -- Report Details
    reported_date DATE NOT NULL,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. AUDIT LOGS
-- =============================================================================
-- Security and compliance audit trail.

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    user_id UUID REFERENCES profiles(id),

    -- Action Details
    action TEXT NOT NULL,                   -- 'LOGIN', 'VIEW_PATIENT', 'DELETE_RX'
    resource TEXT,                          -- 'patients/123', 'prescriptions/456'
    details JSONB,                          -- Additional metadata

    -- Request Info
    ip_address TEXT,
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA EPIDEMIOLOGY COMPLETE
-- =============================================================================
