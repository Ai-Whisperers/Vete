-- =============================================================================
-- 02_CORE_FUNCTIONS.SQL
-- =============================================================================
-- Core utility functions used throughout the application.
-- These must be created BEFORE any tables that use them in triggers.
-- =============================================================================

-- =============================================================================
-- A. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
-- Automatically updates the updated_at column on row modification.
-- Used by all tables with updated_at column.

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
-- Used extensively in RLS policies for row-level security.
--
-- SECURITY DEFINER: Runs with elevated privileges to query profiles table
-- even when the calling user might not have direct access.

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
-- Checks if the current user owns a specific pet.
-- Used in RLS policies for pet-related tables.

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
-- Returns the tenant_id for the current authenticated user.
-- Useful in RLS policies and application logic.

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
-- Returns the role for the current authenticated user.

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
-- Prevents users from modifying their own role or tenant_id.
-- Applied to profiles table.

CREATE OR REPLACE FUNCTION public.protect_critical_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow service role to modify anything
    IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- For regular users, protect critical columns
    IF OLD.id = auth.uid() THEN
        -- User is modifying their own profile
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
-- G. SOFT DELETE HELPER
-- =============================================================================
-- Generic function to soft delete records.

CREATE OR REPLACE FUNCTION public.soft_delete(
    table_name TEXT,
    record_id UUID,
    deleted_by_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    EXECUTE format(
        'UPDATE %I SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL',
        table_name
    ) USING COALESCE(deleted_by_id, auth.uid()), record_id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- H. RESTORE DELETED RECORD
-- =============================================================================
-- Generic function to restore soft-deleted records.

CREATE OR REPLACE FUNCTION public.restore_deleted(
    table_name TEXT,
    record_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    EXECUTE format(
        'UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1',
        table_name
    ) USING record_id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- I. GENERATE SEQUENCE NUMBER
-- =============================================================================
-- Generates sequential numbers for invoices, lab orders, etc.
-- Pattern: PREFIX-YEAR-SEQUENCE (e.g., INV-2024-00001)

CREATE OR REPLACE FUNCTION public.generate_sequence_number(
    prefix TEXT,
    tenant TEXT,
    sequence_name TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    seq_name TEXT;
    seq_val BIGINT;
    year_part TEXT;
BEGIN
    year_part := to_char(NOW(), 'YYYY');
    seq_name := COALESCE(sequence_name, 'seq_' || lower(prefix) || '_' || tenant || '_' || year_part);

    -- Create sequence if it doesn't exist
    BEGIN
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', seq_name);
    EXCEPTION WHEN duplicate_table THEN
        -- Sequence already exists, continue
    END;

    -- Get next value
    EXECUTE format('SELECT nextval(%L)', seq_name) INTO seq_val;

    RETURN upper(prefix) || '-' || year_part || '-' || lpad(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
