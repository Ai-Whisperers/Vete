-- FIX DB-9: Make next_document_number run as SECURITY DEFINER
-- Non-admin users need to generate document numbers but can't INSERT into document_sequences

CREATE OR REPLACE FUNCTION public.next_document_number(
    p_tenant_id TEXT,
    p_document_type TEXT,
    p_prefix TEXT DEFAULT NULL,
    p_year INTEGER DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_prefix TEXT := COALESCE(p_prefix, UPPER(SUBSTRING(p_document_type, 1, 3)));
    v_year INTEGER := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
    v_next_num INTEGER;
    v_result TEXT;
BEGIN
    INSERT INTO public.document_sequences (tenant_id, document_type, prefix, year, last_number)
    VALUES (p_tenant_id, p_document_type, v_prefix, v_year, 1)
    ON CONFLICT (tenant_id, document_type, prefix, year)
    DO UPDATE SET last_number = document_sequences.last_number + 1
    RETURNING last_number INTO v_next_num;

    v_result := v_prefix || '-' || v_year::TEXT || '-' || LPAD(v_next_num::TEXT, 6, '0');
    RETURN v_result;
END;
$$;
