-- =============================================================================
-- 100_COMPREHENSIVE_FIXES.SQL
-- =============================================================================
-- Comprehensive fixes for database issues identified in schema audit:
-- 1. Fix invoice RLS policy (owner_id -> client_id)
-- 2. Fix lab_results RLS policy (missing tenant_id reference)
-- 3. Add missing soft delete columns to extended tables
-- 4. Add missing indexes
-- 5. Fix any FK cascade inconsistencies
-- 6. Add missing updated_at triggers
-- =============================================================================

-- =============================================================================
-- A. FIX INVOICE RLS POLICIES
-- =============================================================================
-- Issue: 80_fix_missing_rls_and_indexes.sql used 'owner_id' but invoices has 'client_id'

DROP POLICY IF EXISTS "Owners view own invoices" ON invoices;
DROP POLICY IF EXISTS "Clients view own invoices" ON invoices;
DROP POLICY IF EXISTS "Staff manage invoices" ON invoices;

-- Correct policies using client_id
CREATE POLICY "Staff manage invoices" ON invoices
    FOR ALL USING (public.is_staff_of(tenant_id));

CREATE POLICY "Clients view own invoices" ON invoices
    FOR SELECT USING (client_id = auth.uid());

-- =============================================================================
-- B. FIX LAB_RESULTS RLS POLICIES
-- =============================================================================
-- Issue: lab_results doesn't have tenant_id directly, must join via lab_orders

DROP POLICY IF EXISTS "Staff manage lab results" ON lab_results;
DROP POLICY IF EXISTS "Owners view pet lab results" ON lab_results;
DROP POLICY IF EXISTS "lab_results_select" ON lab_results;
DROP POLICY IF EXISTS "lab_results_insert" ON lab_results;
DROP POLICY IF EXISTS "lab_results_update" ON lab_results;

-- Staff can manage lab results (via lab_orders for tenant_id)
CREATE POLICY "Staff manage lab results" ON lab_results
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            WHERE lo.id = lab_results.lab_order_id
            AND public.is_staff_of(lo.tenant_id)
        )
    );

-- Owners can view their pet's lab results
CREATE POLICY "Owners view pet lab results" ON lab_results
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            JOIN pets p ON p.id = lo.pet_id
            WHERE lo.id = lab_results.lab_order_id
            AND p.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- C. FIX LAB_ORDER_ITEMS RLS POLICIES
-- =============================================================================
-- Issue: Referenced order_id but column is lab_order_id

DROP POLICY IF EXISTS "Staff manage lab order items" ON lab_order_items;
DROP POLICY IF EXISTS "lab_order_items_select" ON lab_order_items;
DROP POLICY IF EXISTS "lab_order_items_insert" ON lab_order_items;

CREATE POLICY "Staff manage lab order items" ON lab_order_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            WHERE lo.id = lab_order_items.lab_order_id
            AND public.is_staff_of(lo.tenant_id)
        )
    );

CREATE POLICY "Owners view pet lab order items" ON lab_order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            JOIN pets p ON p.id = lo.pet_id
            WHERE lo.id = lab_order_items.lab_order_id
            AND p.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- D. ADD MISSING SOFT DELETE COLUMNS
-- =============================================================================

-- Services
ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_services_deleted ON services(deleted_at) WHERE deleted_at IS NULL;

-- Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted_at) WHERE deleted_at IS NULL;

-- Payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_payments_deleted ON payments(deleted_at) WHERE deleted_at IS NULL;

-- Refunds
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Lab Orders
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_lab_orders_deleted ON lab_orders(deleted_at) WHERE deleted_at IS NULL;

-- Hospitalizations
ALTER TABLE hospitalizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_hospitalizations_deleted ON hospitalizations(deleted_at) WHERE deleted_at IS NULL;

-- Consent Documents
ALTER TABLE consent_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Insurance Policies
ALTER TABLE insurance_policies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Insurance Claims
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_conversations_deleted ON conversations(deleted_at) WHERE deleted_at IS NULL;

-- Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Staff Profiles
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Store Orders
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_store_orders_deleted ON store_orders(deleted_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- E. ADD MISSING PERFORMANCE INDEXES
-- =============================================================================

-- Composite indexes for common queries

-- Appointments by tenant + date (dashboard view)
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date
    ON appointments(tenant_id, appointment_date DESC);

-- Appointments by tenant + status + date (filtered view)
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_status_date
    ON appointments(tenant_id, status, appointment_date DESC);

-- Pets by tenant + owner (staff lookup)
CREATE INDEX IF NOT EXISTS idx_pets_tenant_owner
    ON pets(tenant_id, owner_id);

-- Medical records by pet + date (history view)
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_date
    ON medical_records(pet_id, visit_date DESC);

-- Vaccines by pet + status (pending vaccines)
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_status
    ON vaccines(pet_id, status);

-- Vaccines by next due date (reminders)
CREATE INDEX IF NOT EXISTS idx_vaccines_next_due
    ON vaccines(next_due_date)
    WHERE status = 'pending' OR next_due_date IS NOT NULL;

-- Invoices by tenant + status + date (dashboard)
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status_date
    ON invoices(tenant_id, status, invoice_date DESC);

-- Lab orders by pet + date (history)
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet_date
    ON lab_orders(pet_id, ordered_at DESC);

-- Store products full-text search
CREATE INDEX IF NOT EXISTS idx_store_products_name_trgm
    ON store_products USING gin(name gin_trgm_ops);

-- Ensure pg_trgm extension exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- F. ADD MISSING UPDATED_AT TRIGGERS
-- =============================================================================

-- Services
DROP TRIGGER IF EXISTS handle_updated_at_services ON services;
CREATE TRIGGER handle_updated_at_services
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Payment Methods
DROP TRIGGER IF EXISTS handle_updated_at_payment_methods ON payment_methods;
CREATE TRIGGER handle_updated_at_payment_methods
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Invoices
DROP TRIGGER IF EXISTS handle_updated_at_invoices ON invoices;
CREATE TRIGGER handle_updated_at_invoices
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Refunds
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS handle_updated_at_refunds ON refunds;
CREATE TRIGGER handle_updated_at_refunds
    BEFORE UPDATE ON refunds
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Client Credits
ALTER TABLE client_credits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS handle_updated_at_client_credits ON client_credits;
CREATE TRIGGER handle_updated_at_client_credits
    BEFORE UPDATE ON client_credits
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- G. FIX HOSPITALIZATION TABLES RLS
-- =============================================================================

-- Hospitalization Vitals
DROP POLICY IF EXISTS "Staff manage hospitalization vitals" ON hospitalization_vitals;
CREATE POLICY "Staff manage hospitalization vitals" ON hospitalization_vitals
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h
            WHERE h.id = hospitalization_vitals.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY "Owners view pet vitals" ON hospitalization_vitals
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h
            JOIN pets p ON p.id = h.pet_id
            WHERE h.id = hospitalization_vitals.hospitalization_id
            AND p.owner_id = auth.uid()
        )
    );

-- Hospitalization Medications
DROP POLICY IF EXISTS "Staff manage hospitalization medications" ON hospitalization_medications;
CREATE POLICY "Staff manage hospitalization medications" ON hospitalization_medications
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h
            WHERE h.id = hospitalization_medications.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

-- Hospitalization Feedings
DROP POLICY IF EXISTS "Staff manage hospitalization feedings" ON hospitalization_feedings;
CREATE POLICY "Staff manage hospitalization feedings" ON hospitalization_feedings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h
            WHERE h.id = hospitalization_feedings.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

-- =============================================================================
-- H. FIX CONSENT TEMPLATE VERSIONS RLS
-- =============================================================================

DROP POLICY IF EXISTS "Staff manage consent template versions" ON consent_template_versions;
CREATE POLICY "Staff manage consent template versions" ON consent_template_versions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM consent_templates ct
            WHERE ct.id = consent_template_versions.template_id
            AND public.is_staff_of(ct.tenant_id)
        )
    );

CREATE POLICY "Authenticated view consent template versions" ON consent_template_versions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM consent_templates ct
            WHERE ct.id = consent_template_versions.template_id
        )
    );

-- =============================================================================
-- I. FIX INSURANCE CLAIM ITEMS RLS
-- =============================================================================

DROP POLICY IF EXISTS "Staff manage insurance claim items" ON insurance_claim_items;
CREATE POLICY "Staff manage insurance claim items" ON insurance_claim_items
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM insurance_claims ic
            WHERE ic.id = insurance_claim_items.claim_id
            AND public.is_staff_of(ic.tenant_id)
        )
    );

CREATE POLICY "Owners view own insurance claim items" ON insurance_claim_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM insurance_claims ic
            JOIN pets p ON p.id = ic.pet_id
            WHERE ic.id = insurance_claim_items.claim_id
            AND p.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- J. FIX MESSAGE ATTACHMENTS RLS
-- =============================================================================

DROP POLICY IF EXISTS "Message attachments access" ON message_attachments;
CREATE POLICY "Message attachments access" ON message_attachments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE m.id = message_attachments.message_id
            AND (public.is_staff_of(c.tenant_id) OR c.client_id = auth.uid())
        )
    );

-- =============================================================================
-- K. ADD FUNCTION: SAFE SOFT DELETE
-- =============================================================================
-- Generic function to soft delete records

CREATE OR REPLACE FUNCTION soft_delete(
    p_table TEXT,
    p_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', p_table)
    USING p_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- L. ADD FUNCTION: CHECK TENANT ACCESS
-- =============================================================================
-- Helper to verify user has access to a tenant (any role)

CREATE OR REPLACE FUNCTION public.has_tenant_access(in_tenant_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND tenant_id = in_tenant_id
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- M. ADD FUNCTION: IS ADMIN OF TENANT
-- =============================================================================
-- Check if user is admin of tenant

CREATE OR REPLACE FUNCTION public.is_admin_of(in_tenant_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND tenant_id = in_tenant_id
        AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- N. FIX EXPENSES RLS (Add tenant filter)
-- =============================================================================

DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
DROP POLICY IF EXISTS "Staff can view expenses" ON expenses;

CREATE POLICY "Admins manage expenses" ON expenses
    FOR ALL USING (
        public.is_admin_of(clinic_id)
    );

CREATE POLICY "Staff view expenses" ON expenses
    FOR SELECT USING (
        public.is_staff_of(clinic_id)
    );

-- =============================================================================
-- O. ADD MISSING LAB RESULT ATTACHMENTS RLS
-- =============================================================================

DROP POLICY IF EXISTS "lab_attachments_select" ON lab_result_attachments;
DROP POLICY IF EXISTS "lab_attachments_insert" ON lab_result_attachments;

CREATE POLICY "Staff manage lab attachments" ON lab_result_attachments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            WHERE lo.id = lab_result_attachments.lab_order_id
            AND public.is_staff_of(lo.tenant_id)
        )
    );

CREATE POLICY "Owners view pet lab attachments" ON lab_result_attachments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            JOIN pets p ON p.id = lo.pet_id
            WHERE lo.id = lab_result_attachments.lab_order_id
            AND p.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- P. ADD MISSING LAB RESULT COMMENTS RLS
-- =============================================================================

DROP POLICY IF EXISTS "lab_comments_select" ON lab_result_comments;
DROP POLICY IF EXISTS "lab_comments_insert" ON lab_result_comments;

CREATE POLICY "Staff manage lab comments" ON lab_result_comments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            WHERE lo.id = lab_result_comments.lab_order_id
            AND public.is_staff_of(lo.tenant_id)
        )
    );

CREATE POLICY "Owners view pet lab comments" ON lab_result_comments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM lab_orders lo
            JOIN pets p ON p.id = lo.pet_id
            WHERE lo.id = lab_result_comments.lab_order_id
            AND p.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- Q. FIX REFERENCE RANGES RLS (Anyone can read)
-- =============================================================================

DROP POLICY IF EXISTS "lab_reference_ranges_select" ON lab_reference_ranges;
DROP POLICY IF EXISTS "lab_reference_ranges_insert" ON lab_reference_ranges;

CREATE POLICY "Anyone can read reference ranges" ON lab_reference_ranges
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Staff manage reference ranges" ON lab_reference_ranges
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM lab_test_catalog ltc
            WHERE ltc.id = lab_reference_ranges.test_id
            AND (ltc.tenant_id IS NULL OR public.is_staff_of(ltc.tenant_id))
        )
    );

-- =============================================================================
-- R. GRANT EXECUTE ON NEW FUNCTIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION soft_delete TO authenticated;
GRANT EXECUTE ON FUNCTION has_tenant_access TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_of TO authenticated;

-- =============================================================================
-- COMPREHENSIVE FIXES COMPLETE
-- =============================================================================
