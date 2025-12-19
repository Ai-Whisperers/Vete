-- Ensure trigger function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers where missing
DO $$
DECLARE
    tables TEXT[] := ARRAY[
        'services', 'invoices', 'lab_test_catalog', 'lab_orders',
        'kennels', 'hospitalizations', 'consent_templates', 'conversations',
        'store_products', 'store_categories', 'store_inventory', 'insurance_claims'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON %I;
            CREATE TRIGGER set_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        ', t, t);
    END LOOP;
END;
$$;
