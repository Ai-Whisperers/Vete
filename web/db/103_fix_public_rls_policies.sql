-- Fix overly permissive RLS policies
-- These policies were allowing public (unauthenticated) access to reference data

-- Drop overly permissive policies (if they exist)
DROP POLICY IF EXISTS "Public can read lab test catalog" ON lab_test_catalog;
DROP POLICY IF EXISTS "Public can read reference ranges" ON lab_reference_ranges;

-- Create authenticated-only policies
CREATE POLICY "Authenticated can read lab test catalog" ON lab_test_catalog
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated can read reference ranges" ON lab_reference_ranges
    FOR SELECT TO authenticated
    USING (TRUE);

-- Add comments explaining the change
COMMENT ON POLICY "Authenticated can read lab test catalog" ON lab_test_catalog IS
    'Reference data accessible to all authenticated users regardless of tenant';

COMMENT ON POLICY "Authenticated can read reference ranges" ON lab_reference_ranges IS
    'Reference ranges accessible to all authenticated users regardless of tenant';
