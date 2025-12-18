-- =============================================================================
-- 51_FK_CASCADES.SQL
-- =============================================================================
-- Add missing ON DELETE CASCADE and ON DELETE SET NULL to foreign keys.
-- Addresses TICKET-DB-002 from TICKETS.md
-- =============================================================================

-- =============================================================================
-- A. LAB ORDER ITEMS (CASCADE)
-- =============================================================================
-- Child records should be deleted when parent lab_order is deleted.
-- This is already correct in the schema (line 184 of 24_schema_lab_results.sql)
-- but we include here for consistency verification.

-- Note: lab_order_items.lab_order_id already has ON DELETE CASCADE
-- No changes needed for this foreign key

-- =============================================================================
-- B. MEDICAL RECORDS (SET NULL)
-- =============================================================================
-- When a staff member (vet) is deleted, preserve the medical record
-- but set performed_by to NULL to maintain historical data integrity.

ALTER TABLE medical_records
    DROP CONSTRAINT IF EXISTS medical_records_performed_by_fkey,
    ADD CONSTRAINT medical_records_performed_by_fkey
    FOREIGN KEY (performed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================================================
-- C. PRESCRIPTIONS (SET NULL)
-- =============================================================================
-- When a vet is deleted, preserve the prescription record
-- but set vet_id to NULL to maintain historical data integrity.

ALTER TABLE prescriptions
    DROP CONSTRAINT IF EXISTS prescriptions_vet_id_fkey,
    ADD CONSTRAINT prescriptions_vet_id_fkey
    FOREIGN KEY (vet_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================================================
-- D. APPOINTMENTS (SET NULL)
-- =============================================================================
-- When a vet is deleted, preserve the appointment record
-- but set vet_id to NULL to maintain historical data integrity.

ALTER TABLE appointments
    DROP CONSTRAINT IF EXISTS appointments_vet_id_fkey,
    ADD CONSTRAINT appointments_vet_id_fkey
    FOREIGN KEY (vet_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================================================
-- E. EXPENSES (SET NULL)
-- =============================================================================
-- When a staff member is deleted, preserve the expense record
-- but set created_by to NULL to maintain financial audit trail.

ALTER TABLE expenses
    DROP CONSTRAINT IF EXISTS expenses_created_by_fkey,
    ADD CONSTRAINT expenses_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================
-- Run this query to verify all foreign key constraints have proper CASCADE behavior:
/*
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('medical_records', 'prescriptions', 'appointments', 'expenses', 'lab_order_items')
    AND kcu.column_name IN ('performed_by', 'vet_id', 'created_by', 'lab_order_id')
ORDER BY tc.table_name, kcu.column_name;
*/

-- =============================================================================
-- FK_CASCADES COMPLETE
-- =============================================================================
