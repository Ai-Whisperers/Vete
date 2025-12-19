-- =============================================================================
-- 010_ADD_SOFT_DELETE.SQL - Add soft delete to remaining tables
-- =============================================================================
BEGIN;

-- Helper function
CREATE OR REPLACE FUNCTION public.add_soft_delete_columns(p_table TEXT) RETURNS VOID AS $$
BEGIN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ', p_table);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_by UUID', p_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_active ON public.%I(id) WHERE deleted_at IS NULL', p_table, p_table);
EXCEPTION WHEN others THEN RAISE NOTICE 'Error on %: %', p_table, SQLERRM;
END;
$$ LANGUAGE plpgsql;

SELECT public.add_soft_delete_columns('vaccine_templates');
SELECT public.add_soft_delete_columns('diagnosis_codes');
SELECT public.add_soft_delete_columns('drug_dosages');
SELECT public.add_soft_delete_columns('growth_standards');
SELECT public.add_soft_delete_columns('kennels');
SELECT public.add_soft_delete_columns('message_templates');
SELECT public.add_soft_delete_columns('store_categories');
SELECT public.add_soft_delete_columns('store_brands');
SELECT public.add_soft_delete_columns('store_campaigns');
SELECT public.add_soft_delete_columns('store_coupons');
SELECT public.add_soft_delete_columns('payment_methods');
SELECT public.add_soft_delete_columns('store_products');
SELECT public.add_soft_delete_columns('conversations');
SELECT public.add_soft_delete_columns('reminders');
SELECT public.add_soft_delete_columns('client_credits');

-- Improved soft delete function
CREATE OR REPLACE FUNCTION public.soft_delete(table_name TEXT, record_id UUID, deleted_by_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE affected_rows INTEGER; has_deleted_by BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = soft_delete.table_name AND column_name = 'deleted_by'
    ) INTO has_deleted_by;

    IF has_deleted_by THEN
        EXECUTE format('UPDATE public.%I SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL', table_name)
        USING COALESCE(deleted_by_id, auth.uid()), record_id;
    ELSE
        EXECUTE format('UPDATE public.%I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', table_name)
        USING record_id;
    END IF;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.restore_deleted(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
DECLARE affected_rows INTEGER;
BEGIN
    EXECUTE format('UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL', table_name)
    USING record_id;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.purge_deleted_records(table_name TEXT, older_than_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE affected_rows INTEGER;
BEGIN
    EXECUTE format('DELETE FROM public.%I WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL ''%s days''', table_name, older_than_days);
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
