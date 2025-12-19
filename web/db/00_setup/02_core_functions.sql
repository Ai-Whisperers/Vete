-- =============================================================================
-- 02_CORE_FUNCTIONS.SQL
-- =============================================================================
-- Core utility functions used throughout the application.
-- These must be created BEFORE any tables that use them in triggers.
-- =============================================================================

-- =============================================================================
-- A. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- B. IS_STAFF_OF (Authorization Helper)
-- =============================================================================
-- Checks if the current user is a staff member (vet/admin) of a given tenant.

CREATE OR REPLACE FUNCTION public.is_staff_of(in_tenant_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND tenant_id = in_tenant_id
        AND role IN ('vet', 'admin')
        AND deleted_at IS NULL
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- C. IS_OWNER_OF_PET (Authorization Helper)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_owner_of_pet(pet_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.pets
        WHERE id = pet_uuid
        AND owner_id = auth.uid()
        AND deleted_at IS NULL
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- D. GET_USER_TENANT (Helper)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_tenant()
RETURNS TEXT AS $$
    SELECT tenant_id FROM public.profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- E. GET_USER_ROLE (Helper)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- F. PROTECT_CRITICAL_COLUMNS (Security Trigger)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.protect_critical_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
        RETURN NEW;
    END IF;

    IF OLD.id = auth.uid() THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Cannot modify your own role';
        END IF;
        IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
            RAISE EXCEPTION 'Cannot modify your own tenant';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- G. SOFT DELETE FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.soft_delete(
    table_name TEXT,
    record_id UUID,
    deleted_by_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
    has_deleted_by BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND information_schema.columns.table_name = soft_delete.table_name
        AND column_name = 'deleted_by'
    ) INTO has_deleted_by;

    IF has_deleted_by THEN
        EXECUTE format(
            'UPDATE public.%I SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL',
            table_name
        ) USING COALESCE(deleted_by_id, auth.uid()), record_id;
    ELSE
        EXECUTE format(
            'UPDATE public.%I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
            table_name
        ) USING record_id;
    END IF;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.restore_deleted(
    table_name TEXT,
    record_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    EXECUTE format(
        'UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1',
        table_name
    ) USING record_id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.purge_deleted_records(
    table_name TEXT,
    older_than_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    EXECUTE format(
        'DELETE FROM public.%I WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL ''%s days''',
        table_name, older_than_days
    );
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- H. DOCUMENT SEQUENCE GENERATION (Thread-Safe)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    current_sequence INTEGER NOT NULL DEFAULT 0,
    prefix TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, document_type, year)
);

ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access sequences" ON public.document_sequences;
CREATE POLICY "Service role full access sequences" ON public.document_sequences
    FOR ALL TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_document_sequences_lookup
ON public.document_sequences(tenant_id, document_type, year);

CREATE OR REPLACE FUNCTION public.next_document_number(
    p_tenant_id TEXT,
    p_document_type TEXT,
    p_prefix TEXT DEFAULT NULL,
    p_year INTEGER DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_year INTEGER;
    v_prefix TEXT;
    v_seq INTEGER;
    v_lock_key BIGINT;
BEGIN
    v_year := COALESCE(p_year, EXTRACT(YEAR FROM NOW())::INTEGER);
    v_prefix := COALESCE(p_prefix, CASE p_document_type
        WHEN 'invoice' THEN 'FAC'
        WHEN 'admission' THEN 'ADM'
        WHEN 'lab_order' THEN 'LAB'
        WHEN 'payment' THEN 'PAG'
        WHEN 'refund' THEN 'REE'
        ELSE UPPER(LEFT(p_document_type, 3))
    END);

    v_lock_key := hashtext(p_tenant_id || ':' || p_document_type || ':' || v_year::TEXT);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    INSERT INTO public.document_sequences (tenant_id, document_type, year, current_sequence, prefix)
    VALUES (p_tenant_id, p_document_type, v_year, 1, v_prefix)
    ON CONFLICT (tenant_id, document_type, year)
    DO UPDATE SET
        current_sequence = public.document_sequences.current_sequence + 1,
        updated_at = NOW()
    RETURNING current_sequence INTO v_seq;

    RETURN v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN public.next_document_number(p_tenant_id, 'invoice', 'FAC');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_admission_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_seq INTEGER;
    v_lock_key BIGINT;
BEGIN
    v_lock_key := hashtext(p_tenant_id || ':admission');
    PERFORM pg_advisory_xact_lock(v_lock_key);

    INSERT INTO public.document_sequences (tenant_id, document_type, year, current_sequence, prefix)
    VALUES (p_tenant_id, 'admission', 0, 1, 'ADM')
    ON CONFLICT (tenant_id, document_type, year)
    DO UPDATE SET
        current_sequence = public.document_sequences.current_sequence + 1,
        updated_at = NOW()
    RETURNING current_sequence INTO v_seq;

    RETURN 'ADM' || LPAD(v_seq::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_payment_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN public.next_document_number(p_tenant_id, 'payment', 'PAG');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_lab_order_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN public.next_document_number(p_tenant_id, 'lab_order', 'LAB');
END;
$$ LANGUAGE plpgsql;
