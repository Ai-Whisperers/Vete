-- =============================================================================
-- 30_ENHANCED_AUDIT.SQL
-- =============================================================================
-- Enhanced audit logging system for compliance and security tracking.
-- Captures detailed change history with before/after values.
-- =============================================================================

-- =============================================================================
-- A. ENHANCED AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_log_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What changed
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),

    -- Change details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],

    -- Context
    tenant_id TEXT,
    user_id UUID,
    user_email TEXT,
    user_role TEXT,
    session_id TEXT,

    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    api_endpoint TEXT,

    -- Timestamp
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Compliance
    data_classification TEXT DEFAULT 'internal' CHECK (data_classification IN (
        'public', 'internal', 'confidential', 'restricted'
    )),
    retention_until DATE,
    compliance_tags TEXT[]
);

-- =============================================================================
-- B. AUDIT CONFIGURATION TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,

    -- What to audit
    audit_inserts BOOLEAN DEFAULT TRUE,
    audit_updates BOOLEAN DEFAULT TRUE,
    audit_deletes BOOLEAN DEFAULT TRUE,

    -- What to capture
    capture_old_values BOOLEAN DEFAULT TRUE,
    capture_new_values BOOLEAN DEFAULT TRUE,
    excluded_columns TEXT[] DEFAULT ARRAY['updated_at', 'created_at'],
    sensitive_columns TEXT[] DEFAULT ARRAY[]::TEXT[], -- Columns to mask

    -- Classification
    data_classification TEXT DEFAULT 'internal',

    -- Retention
    retention_days INTEGER DEFAULT 365,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- C. SECURITY EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event type
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_success', 'login_failure', 'logout', 'password_change',
        'password_reset_request', 'password_reset_complete',
        'mfa_enabled', 'mfa_disabled', 'mfa_challenge_success', 'mfa_challenge_failure',
        'role_change', 'permission_denied', 'suspicious_activity',
        'data_export', 'bulk_delete', 'api_key_created', 'api_key_revoked',
        'session_hijack_attempt', 'brute_force_detected', 'account_locked',
        'account_unlocked', 'email_change', 'phone_change'
    )),

    -- Who
    user_id UUID,
    user_email TEXT,
    target_user_id UUID, -- For actions on other users

    -- Context
    tenant_id TEXT,
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB,

    -- Details
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),

    -- Status
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,

    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. DATA ACCESS LOG (For sensitive data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What was accessed
    table_name TEXT NOT NULL,
    record_id UUID,
    record_count INTEGER,
    query_type TEXT NOT NULL CHECK (query_type IN ('SELECT', 'EXPORT', 'REPORT', 'API')),

    -- Who accessed
    user_id UUID,
    user_email TEXT,
    user_role TEXT,

    -- Context
    tenant_id TEXT,
    ip_address INET,
    purpose TEXT,
    justification TEXT,

    -- Query info
    query_hash TEXT, -- Hash of the query for pattern analysis
    fields_accessed TEXT[],
    filter_criteria JSONB,

    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_enhanced_table ON audit_log_enhanced(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_record ON audit_log_enhanced(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_user ON audit_log_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_tenant ON audit_log_enhanced(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_time ON audit_log_enhanced(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_operation ON audit_log_enhanced(operation);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_table_record ON audit_log_enhanced(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_time ON security_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_unacked ON security_events(acknowledged) WHERE acknowledged = FALSE;
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

CREATE INDEX IF NOT EXISTS idx_data_access_table ON data_access_log(table_name);
CREATE INDEX IF NOT EXISTS idx_data_access_user ON data_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_time ON data_access_log(occurred_at DESC);

-- =============================================================================
-- F. AUDIT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_config audit_configuration%ROWTYPE;
    v_old_values JSONB;
    v_new_values JSONB;
    v_changed_fields TEXT[];
    v_user_id UUID;
    v_user_email TEXT;
    v_user_role TEXT;
    v_tenant_id TEXT;
    v_key TEXT;
BEGIN
    -- Get configuration for this table
    SELECT * INTO v_config FROM audit_configuration
    WHERE table_name = TG_TABLE_NAME AND is_active = TRUE;

    -- If no config or not auditing this operation, skip
    IF v_config IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'INSERT' AND NOT v_config.audit_inserts THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' AND NOT v_config.audit_updates THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'DELETE' AND NOT v_config.audit_deletes THEN
        RETURN OLD;
    END IF;

    -- Get current user context
    BEGIN
        v_user_id := auth.uid();
        SELECT email, role INTO v_user_email, v_user_role
        FROM profiles WHERE id = v_user_id;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Prepare old/new values
    IF TG_OP IN ('UPDATE', 'DELETE') AND v_config.capture_old_values THEN
        v_old_values := to_jsonb(OLD);

        -- Remove excluded columns
        FOREACH v_key IN ARRAY COALESCE(v_config.excluded_columns, ARRAY[]::TEXT[])
        LOOP
            v_old_values := v_old_values - v_key;
        END LOOP;

        -- Mask sensitive columns
        FOREACH v_key IN ARRAY COALESCE(v_config.sensitive_columns, ARRAY[]::TEXT[])
        LOOP
            IF v_old_values ? v_key THEN
                v_old_values := jsonb_set(v_old_values, ARRAY[v_key], '"[REDACTED]"');
            END IF;
        END LOOP;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') AND v_config.capture_new_values THEN
        v_new_values := to_jsonb(NEW);

        -- Remove excluded columns
        FOREACH v_key IN ARRAY COALESCE(v_config.excluded_columns, ARRAY[]::TEXT[])
        LOOP
            v_new_values := v_new_values - v_key;
        END LOOP;

        -- Mask sensitive columns
        FOREACH v_key IN ARRAY COALESCE(v_config.sensitive_columns, ARRAY[]::TEXT[])
        LOOP
            IF v_new_values ? v_key THEN
                v_new_values := jsonb_set(v_new_values, ARRAY[v_key], '"[REDACTED]"');
            END IF;
        END LOOP;
    END IF;

    -- Calculate changed fields for UPDATE
    IF TG_OP = 'UPDATE' THEN
        SELECT ARRAY_AGG(key) INTO v_changed_fields
        FROM (
            SELECT key
            FROM jsonb_each(to_jsonb(NEW)) n
            FULL OUTER JOIN jsonb_each(to_jsonb(OLD)) o USING (key)
            WHERE n.value IS DISTINCT FROM o.value
              AND key != ALL(COALESCE(v_config.excluded_columns, ARRAY[]::TEXT[]))
        ) changed;
    END IF;

    -- Get tenant_id if it exists
    IF TG_OP = 'DELETE' THEN
        v_tenant_id := OLD.tenant_id;
    ELSE
        v_tenant_id := NEW.tenant_id;
    END IF;

    -- Insert audit record
    INSERT INTO audit_log_enhanced (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        tenant_id,
        user_id,
        user_email,
        user_role,
        data_classification,
        retention_until
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_old_values,
        v_new_values,
        v_changed_fields,
        v_tenant_id,
        v_user_id,
        v_user_email,
        v_user_role,
        v_config.data_classification,
        CURRENT_DATE + (v_config.retention_days || ' days')::INTERVAL
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- G. HELPER FUNCTIONS
-- =============================================================================

-- Enable auditing for a table
CREATE OR REPLACE FUNCTION enable_audit_for_table(
    p_table_name TEXT,
    p_classification TEXT DEFAULT 'internal',
    p_sensitive_columns TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update configuration
    INSERT INTO audit_configuration (table_name, data_classification, sensitive_columns)
    VALUES (p_table_name, p_classification, p_sensitive_columns)
    ON CONFLICT (table_name) DO UPDATE SET
        is_active = TRUE,
        data_classification = EXCLUDED.data_classification,
        sensitive_columns = EXCLUDED.sensitive_columns;

    -- Create trigger if not exists
    EXECUTE format(
        'DROP TRIGGER IF EXISTS audit_trigger_%I ON %I',
        p_table_name, p_table_name
    );

    EXECUTE format(
        'CREATE TRIGGER audit_trigger_%I
         AFTER INSERT OR UPDATE OR DELETE ON %I
         FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()',
        p_table_name, p_table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Disable auditing for a table
CREATE OR REPLACE FUNCTION disable_audit_for_table(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE audit_configuration SET is_active = FALSE WHERE table_name = p_table_name;

    EXECUTE format(
        'DROP TRIGGER IF EXISTS audit_trigger_%I ON %I',
        p_table_name, p_table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Log security event
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::JSONB,
    p_severity TEXT DEFAULT 'info',
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_user_email TEXT;
BEGIN
    -- Get user email if user_id provided
    IF p_user_id IS NOT NULL THEN
        SELECT email INTO v_user_email FROM profiles WHERE id = p_user_id;
    END IF;

    INSERT INTO security_events (
        event_type,
        user_id,
        user_email,
        details,
        severity,
        ip_address
    ) VALUES (
        p_event_type,
        COALESCE(p_user_id, auth.uid()),
        v_user_email,
        p_details,
        p_severity,
        p_ip_address
    ) RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Get audit history for a record
CREATE OR REPLACE FUNCTION get_record_audit_history(
    p_table_name TEXT,
    p_record_id UUID
)
RETURNS TABLE (
    operation TEXT,
    changed_fields TEXT[],
    old_values JSONB,
    new_values JSONB,
    user_email TEXT,
    occurred_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.operation,
        a.changed_fields,
        a.old_values,
        a.new_values,
        a.user_email,
        a.occurred_at
    FROM audit_log_enhanced a
    WHERE a.table_name = p_table_name
      AND a.record_id = p_record_id
    ORDER BY a.occurred_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get recent security events summary
CREATE OR REPLACE FUNCTION get_security_summary(
    p_tenant_id TEXT DEFAULT NULL,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    event_type TEXT,
    count BIGINT,
    latest_occurrence TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        se.event_type,
        COUNT(*),
        MAX(se.occurred_at)
    FROM security_events se
    WHERE se.occurred_at > NOW() - (p_hours || ' hours')::INTERVAL
      AND (p_tenant_id IS NULL OR se.tenant_id = p_tenant_id)
    GROUP BY se.event_type
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Purge old audit logs based on retention
CREATE OR REPLACE FUNCTION purge_expired_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM audit_log_enhanced
    WHERE retention_until < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. ENABLE AUDITING FOR CRITICAL TABLES
-- =============================================================================

-- Medical data (confidential)
SELECT enable_audit_for_table('pets', 'confidential', ARRAY['microchip_id']);
SELECT enable_audit_for_table('medical_records', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('prescriptions', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('vaccines', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('lab_results', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('hospitalizations', 'confidential', ARRAY[]::TEXT[]);

-- Financial data (restricted)
SELECT enable_audit_for_table('invoices', 'restricted', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('payments', 'restricted', ARRAY['payment_reference']);
SELECT enable_audit_for_table('refunds', 'restricted', ARRAY[]::TEXT[]);

-- Consent documents (restricted)
SELECT enable_audit_for_table('consent_documents', 'restricted', ARRAY['signature_data', 'signature_hash']);

-- User/Profile data (confidential)
SELECT enable_audit_for_table('profiles', 'confidential', ARRAY['phone']);

-- Insurance (confidential)
SELECT enable_audit_for_table('pet_insurance_policies', 'confidential', ARRAY['policy_number', 'member_id']);
SELECT enable_audit_for_table('insurance_claims', 'confidential', ARRAY[]::TEXT[]);

-- =============================================================================
-- I. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE audit_log_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;

-- Audit logs: Admin only
CREATE POLICY audit_log_enhanced_admin ON audit_log_enhanced FOR SELECT TO authenticated
    USING (
        (tenant_id IS NULL OR is_staff_of(tenant_id))
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Audit configuration: Admin only
CREATE POLICY audit_configuration_admin ON audit_configuration FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Security events: Admin only, can see their tenant's events
CREATE POLICY security_events_admin ON security_events FOR SELECT TO authenticated
    USING (
        (tenant_id IS NULL OR is_staff_of(tenant_id))
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Data access log: Admin only
CREATE POLICY data_access_log_admin ON data_access_log FOR SELECT TO authenticated
    USING (
        (tenant_id IS NULL OR is_staff_of(tenant_id))
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =============================================================================
-- J. VIEWS FOR AUDIT REPORTING
-- =============================================================================

-- Recent high-severity security events
CREATE OR REPLACE VIEW critical_security_events AS
SELECT
    se.id,
    se.event_type,
    se.user_email,
    se.details,
    se.ip_address,
    se.occurred_at,
    se.acknowledged
FROM security_events se
WHERE se.severity = 'critical'
  AND se.occurred_at > NOW() - INTERVAL '7 days'
ORDER BY se.occurred_at DESC;

-- Audit activity summary by table
CREATE OR REPLACE VIEW audit_activity_summary AS
SELECT
    table_name,
    operation,
    COUNT(*) as operation_count,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(occurred_at) as last_activity
FROM audit_log_enhanced
WHERE occurred_at > NOW() - INTERVAL '30 days'
GROUP BY table_name, operation
ORDER BY table_name, operation;

-- Grant access to views
GRANT SELECT ON critical_security_events TO authenticated;
GRANT SELECT ON audit_activity_summary TO authenticated;

-- =============================================================================
-- ENHANCED AUDIT COMPLETE
-- =============================================================================
