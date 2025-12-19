-- =============================================================================
-- 003_FIX_SEQUENCE_GENERATION.SQL
-- =============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS public.document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id),
    document_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    current_sequence INTEGER NOT NULL DEFAULT 0,
    prefix TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, document_type, year)
);

ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access sequences" ON public.document_sequences
    FOR ALL TO service_role USING (true);

CREATE OR REPLACE FUNCTION public.next_document_number(
    p_tenant_id TEXT, p_document_type TEXT, p_prefix TEXT DEFAULT NULL, p_year INTEGER DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_year INTEGER; v_prefix TEXT; v_seq INTEGER; v_lock_key BIGINT;
BEGIN
    v_year := COALESCE(p_year, EXTRACT(YEAR FROM NOW())::INTEGER);
    v_prefix := COALESCE(p_prefix, CASE p_document_type
        WHEN 'invoice' THEN 'FAC' WHEN 'admission' THEN 'ADM'
        WHEN 'lab_order' THEN 'LAB' WHEN 'payment' THEN 'PAG'
        ELSE UPPER(LEFT(p_document_type, 3)) END);
    v_lock_key := hashtext(p_tenant_id || ':' || p_document_type || ':' || v_year::TEXT);
    PERFORM pg_advisory_xact_lock(v_lock_key);

    INSERT INTO public.document_sequences (tenant_id, document_type, year, current_sequence, prefix)
    VALUES (p_tenant_id, p_document_type, v_year, 1, v_prefix)
    ON CONFLICT (tenant_id, document_type, year)
    DO UPDATE SET current_sequence = public.document_sequences.current_sequence + 1, updated_at = NOW()
    RETURNING current_sequence INTO v_seq;

    RETURN v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_tenant_id TEXT)
RETURNS TEXT AS $$ BEGIN RETURN public.next_document_number(p_tenant_id, 'invoice', 'FAC'); END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_admission_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE v_seq INTEGER; v_lock_key BIGINT;
BEGIN
    v_lock_key := hashtext(p_tenant_id || ':admission');
    PERFORM pg_advisory_xact_lock(v_lock_key);
    INSERT INTO public.document_sequences (tenant_id, document_type, year, current_sequence, prefix)
    VALUES (p_tenant_id, 'admission', 0, 1, 'ADM')
    ON CONFLICT (tenant_id, document_type, year)
    DO UPDATE SET current_sequence = public.document_sequences.current_sequence + 1, updated_at = NOW()
    RETURNING current_sequence INTO v_seq;
    RETURN 'ADM' || LPAD(v_seq::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

COMMIT;
