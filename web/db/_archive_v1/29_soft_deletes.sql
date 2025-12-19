-- =============================================================================
-- 29_SOFT_DELETES.SQL
-- =============================================================================
-- Implements soft delete functionality for data recovery and compliance.
-- Adds deleted_at columns and archive tables for critical data.
-- =============================================================================

-- =============================================================================
-- A. ADD SOFT DELETE COLUMNS TO CRITICAL TABLES
-- =============================================================================

-- Core tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Pet-related tables
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Financial tables
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Hospitalization
ALTER TABLE hospitalizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE hospitalizations ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Lab results
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Consent
ALTER TABLE consent_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE consent_documents ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Messages
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- =============================================================================
-- B. CREATE INDEXES FOR SOFT DELETE QUERIES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pets_deleted ON pets(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vaccines_deleted ON vaccines(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_medical_records_deleted ON medical_records(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_deleted ON prescriptions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_deleted ON appointments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_deleted ON payments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hospitalizations_deleted ON hospitalizations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_orders_deleted ON lab_orders(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consent_documents_deleted ON consent_documents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_deleted ON conversations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- C. ARCHIVE TABLES FOR PERMANENT DELETION
-- =============================================================================

-- Archive table for permanently deleted pets
CREATE TABLE IF NOT EXISTS archived_pets (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    tenant_id TEXT NOT NULL,
    owner_id UUID,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for medical records
CREATE TABLE IF NOT EXISTS archived_medical_records (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    pet_id UUID,
    tenant_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for invoices (financial compliance)
CREATE TABLE IF NOT EXISTS archived_invoices (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    invoice_number TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for consent documents (legal compliance)
CREATE TABLE IF NOT EXISTS archived_consent_documents (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    document_number TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. SOFT DELETE FUNCTIONS
-- =============================================================================

-- Generic soft delete function
CREATE OR REPLACE FUNCTION soft_delete(
    p_table_name TEXT,
    p_id UUID,
    p_deleted_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sql TEXT;
    v_affected INTEGER;
BEGIN
    v_sql := format(
        'UPDATE %I SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL',
        p_table_name
    );

    EXECUTE v_sql USING p_deleted_by, p_id;
    GET DIAGNOSTICS v_affected = ROW_COUNT;

    RETURN v_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Restore soft deleted record
CREATE OR REPLACE FUNCTION restore_deleted(
    p_table_name TEXT,
    p_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sql TEXT;
    v_affected INTEGER;
BEGIN
    v_sql := format(
        'UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
        p_table_name
    );

    EXECUTE v_sql USING p_id;
    GET DIAGNOSTICS v_affected = ROW_COUNT;

    RETURN v_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Soft delete pet with cascade to related records
CREATE OR REPLACE FUNCTION soft_delete_pet(
    p_pet_id UUID,
    p_deleted_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Soft delete the pet
    UPDATE pets SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE id = p_pet_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Soft delete related records
    UPDATE vaccines SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE medical_records SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE prescriptions SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE appointments SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE hospitalizations SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE lab_orders SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Restore pet with cascade
CREATE OR REPLACE FUNCTION restore_pet(p_pet_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Restore the pet
    UPDATE pets SET deleted_at = NULL, deleted_by = NULL
    WHERE id = p_pet_id AND deleted_at IS NOT NULL;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Restore related records
    UPDATE vaccines SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE medical_records SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE prescriptions SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE appointments SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE hospitalizations SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE lab_orders SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Permanently delete and archive a pet
CREATE OR REPLACE FUNCTION permanent_delete_pet(
    p_pet_id UUID,
    p_deletion_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_pet pets%ROWTYPE;
BEGIN
    -- Get the pet data
    SELECT * INTO v_pet FROM pets WHERE id = p_pet_id;

    IF v_pet IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Archive the pet
    INSERT INTO archived_pets (id, original_data, tenant_id, owner_id, deleted_at, deleted_by, deletion_reason)
    VALUES (
        v_pet.id,
        to_jsonb(v_pet),
        v_pet.tenant_id,
        v_pet.owner_id,
        COALESCE(v_pet.deleted_at, NOW()),
        v_pet.deleted_by,
        p_deletion_reason
    );

    -- Archive medical records
    INSERT INTO archived_medical_records (id, original_data, pet_id, tenant_id, deleted_at, deleted_by, deletion_reason)
    SELECT
        mr.id,
        to_jsonb(mr),
        mr.pet_id,
        mr.tenant_id,
        COALESCE(mr.deleted_at, NOW()),
        mr.deleted_by,
        p_deletion_reason
    FROM medical_records mr
    WHERE mr.pet_id = p_pet_id;

    -- Delete the pet (cascades to related tables)
    DELETE FROM pets WHERE id = p_pet_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- E. VIEWS FOR ACTIVE RECORDS (Exclude soft deleted)
-- =============================================================================

-- Active pets view
CREATE OR REPLACE VIEW active_pets AS
SELECT * FROM pets WHERE deleted_at IS NULL;

-- Active vaccines view
CREATE OR REPLACE VIEW active_vaccines AS
SELECT * FROM vaccines WHERE deleted_at IS NULL;

-- Active medical records view
CREATE OR REPLACE VIEW active_medical_records AS
SELECT * FROM medical_records WHERE deleted_at IS NULL;

-- Active appointments view
CREATE OR REPLACE VIEW active_appointments AS
SELECT * FROM appointments WHERE deleted_at IS NULL;

-- Active invoices view
CREATE OR REPLACE VIEW active_invoices AS
SELECT * FROM invoices WHERE deleted_at IS NULL;

-- Active hospitalizations view
CREATE OR REPLACE VIEW active_hospitalizations AS
SELECT * FROM hospitalizations WHERE deleted_at IS NULL;

-- Active conversations view
CREATE OR REPLACE VIEW active_conversations AS
SELECT * FROM conversations WHERE deleted_at IS NULL;

-- =============================================================================
-- F. TRASH BIN VIEW
-- =============================================================================

-- Combined trash bin view for all deleted records
CREATE OR REPLACE VIEW trash_bin AS
SELECT
    id,
    'pet' AS record_type,
    name AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM pets WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'medical_record' AS record_type,
    title,
    tenant_id,
    deleted_at,
    deleted_by
FROM medical_records WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'appointment' AS record_type,
    reason AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM appointments WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'invoice' AS record_type,
    invoice_number AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM invoices WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'hospitalization' AS record_type,
    hospitalization_number AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM hospitalizations WHERE deleted_at IS NOT NULL

ORDER BY deleted_at DESC;

-- =============================================================================
-- G. AUTOMATIC PURGE FUNCTION
-- =============================================================================

-- Permanently delete records older than retention period
CREATE OR REPLACE FUNCTION purge_old_deleted_records(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS TABLE (
    table_name TEXT,
    records_purged INTEGER
) AS $$
DECLARE
    v_cutoff_date TIMESTAMPTZ;
    v_count INTEGER;
BEGIN
    v_cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;

    -- Purge old deleted pets (archive first)
    WITH deleted AS (
        SELECT p.* FROM pets p
        WHERE p.deleted_at < v_cutoff_date
    )
    INSERT INTO archived_pets (id, original_data, tenant_id, owner_id, deleted_at, deleted_by, deletion_reason)
    SELECT id, to_jsonb(deleted.*), tenant_id, owner_id, deleted_at, deleted_by, 'Auto-purged after retention period'
    FROM deleted
    ON CONFLICT (id) DO NOTHING;

    DELETE FROM pets WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'pets'; records_purged := v_count;
    RETURN NEXT;

    -- Purge old deleted medical records
    WITH deleted AS (
        SELECT mr.* FROM medical_records mr
        WHERE mr.deleted_at < v_cutoff_date
    )
    INSERT INTO archived_medical_records (id, original_data, pet_id, tenant_id, deleted_at, deleted_by, deletion_reason)
    SELECT id, to_jsonb(deleted.*), pet_id, tenant_id, deleted_at, deleted_by, 'Auto-purged after retention period'
    FROM deleted
    ON CONFLICT (id) DO NOTHING;

    DELETE FROM medical_records WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'medical_records'; records_purged := v_count;
    RETURN NEXT;

    -- Purge old deleted invoices (archive for compliance)
    WITH deleted AS (
        SELECT i.* FROM invoices i
        WHERE i.deleted_at < v_cutoff_date
    )
    INSERT INTO archived_invoices (id, original_data, invoice_number, tenant_id, deleted_at, deleted_by, deletion_reason)
    SELECT id, to_jsonb(deleted.*), invoice_number, tenant_id, deleted_at, deleted_by, 'Auto-purged after retention period'
    FROM deleted
    ON CONFLICT (id) DO NOTHING;

    DELETE FROM invoices WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'invoices'; records_purged := v_count;
    RETURN NEXT;

    -- Purge vaccines (no archive, referenced by pet archive)
    DELETE FROM vaccines WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'vaccines'; records_purged := v_count;
    RETURN NEXT;

    -- Purge appointments
    DELETE FROM appointments WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'appointments'; records_purged := v_count;
    RETURN NEXT;

    -- Purge prescriptions
    DELETE FROM prescriptions WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'prescriptions'; records_purged := v_count;
    RETURN NEXT;

    -- Purge hospitalizations
    DELETE FROM hospitalizations WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'hospitalizations'; records_purged := v_count;
    RETURN NEXT;

    -- Purge lab orders
    DELETE FROM lab_orders WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'lab_orders'; records_purged := v_count;
    RETURN NEXT;

    -- Purge messages and conversations
    DELETE FROM messages WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'messages'; records_purged := v_count;
    RETURN NEXT;

    DELETE FROM conversations WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'conversations'; records_purged := v_count;
    RETURN NEXT;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. GRANT ACCESS TO VIEWS
-- =============================================================================

GRANT SELECT ON active_pets TO authenticated;
GRANT SELECT ON active_vaccines TO authenticated;
GRANT SELECT ON active_medical_records TO authenticated;
GRANT SELECT ON active_appointments TO authenticated;
GRANT SELECT ON active_invoices TO authenticated;
GRANT SELECT ON active_hospitalizations TO authenticated;
GRANT SELECT ON active_conversations TO authenticated;
GRANT SELECT ON trash_bin TO authenticated;

-- =============================================================================
-- I. RLS FOR ARCHIVE TABLES
-- =============================================================================

ALTER TABLE archived_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_consent_documents ENABLE ROW LEVEL SECURITY;

-- Archives are admin-only access
CREATE POLICY archived_pets_admin ON archived_pets FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY archived_medical_records_admin ON archived_medical_records FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY archived_invoices_admin ON archived_invoices FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY archived_consent_documents_admin ON archived_consent_documents FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- SOFT DELETES COMPLETE
-- =============================================================================
