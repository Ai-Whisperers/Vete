-- =============================================================================
-- 80_FIX_MISSING_RLS_AND_INDEXES.SQL
-- =============================================================================
-- TICKET-DB-001, TICKET-DB-002, TICKET-DB-003
-- Adds missing RLS policies and indexes for newer tables.
-- Run this migration to fix database security and performance issues.
-- =============================================================================

-- =============================================================================
-- A. ENABLE RLS ON TABLES MISSING IT
-- =============================================================================

-- Lab Results Tables
ALTER TABLE IF EXISTS lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lab_test_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lab_panel_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lab_reference_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lab_results ENABLE ROW LEVEL SECURITY;

-- Hospitalization Tables
ALTER TABLE IF EXISTS kennels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hospitalization_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hospitalization_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hospitalization_feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hospitalization_visits ENABLE ROW LEVEL SECURITY;

-- Consent Tables
ALTER TABLE IF EXISTS consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consent_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consent_documents ENABLE ROW LEVEL SECURITY;

-- Insurance Tables
ALTER TABLE IF EXISTS insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insurance_claim_items ENABLE ROW LEVEL SECURITY;

-- Messaging Tables
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS message_attachments ENABLE ROW LEVEL SECURITY;

-- Invoice Tables
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_methods ENABLE ROW LEVEL SECURITY;

-- Services Table
ALTER TABLE IF EXISTS services ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- B. RLS POLICIES FOR LAB RESULTS
-- =============================================================================

-- Lab Test Catalog - Public read for templates, staff manage clinic-specific
DROP POLICY IF EXISTS "Public read lab test catalog" ON lab_test_catalog;
CREATE POLICY "Public read lab test catalog" ON lab_test_catalog
    FOR SELECT USING (tenant_id IS NULL);

DROP POLICY IF EXISTS "Staff manage clinic lab tests" ON lab_test_catalog;
CREATE POLICY "Staff manage clinic lab tests" ON lab_test_catalog
    FOR ALL USING (tenant_id IS NOT NULL AND public.is_staff_of(tenant_id));

-- Lab Orders - Staff manage, owners view their pets
DROP POLICY IF EXISTS "Staff manage lab orders" ON lab_orders;
CREATE POLICY "Staff manage lab orders" ON lab_orders
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view pet lab orders" ON lab_orders;
CREATE POLICY "Owners view pet lab orders" ON lab_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lab_orders.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

-- Lab Order Items
DROP POLICY IF EXISTS "Staff manage lab order items" ON lab_order_items;
CREATE POLICY "Staff manage lab order items" ON lab_order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            WHERE lab_orders.id = lab_order_items.lab_order_id
            AND public.is_staff_of(lab_orders.tenant_id)
        )
    );

-- Lab Results
DROP POLICY IF EXISTS "Staff manage lab results" ON lab_results;
CREATE POLICY "Staff manage lab results" ON lab_results
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view pet lab results" ON lab_results;
CREATE POLICY "Owners view pet lab results" ON lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lab_results.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- C. RLS POLICIES FOR HOSPITALIZATIONS
-- =============================================================================

-- Kennels - Staff only
DROP POLICY IF EXISTS "Staff manage kennels" ON kennels;
CREATE POLICY "Staff manage kennels" ON kennels
    FOR ALL USING (public.is_staff_of(tenant_id));

-- Hospitalizations
DROP POLICY IF EXISTS "Staff manage hospitalizations" ON hospitalizations;
CREATE POLICY "Staff manage hospitalizations" ON hospitalizations
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view pet hospitalizations" ON hospitalizations;
CREATE POLICY "Owners view pet hospitalizations" ON hospitalizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = hospitalizations.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

-- Hospitalization Visits
DROP POLICY IF EXISTS "Staff manage hospitalization visits" ON hospitalization_visits;
CREATE POLICY "Staff manage hospitalization visits" ON hospitalization_visits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h
            WHERE h.id = hospitalization_visits.hospitalization_id
            AND public.is_staff_of(h.tenant_id)
        )
    );

-- =============================================================================
-- D. RLS POLICIES FOR CONSENTS
-- =============================================================================

-- Consent Templates - Staff manage
DROP POLICY IF EXISTS "Staff manage consent templates" ON consent_templates;
CREATE POLICY "Staff manage consent templates" ON consent_templates
    FOR ALL USING (public.is_staff_of(tenant_id));

-- Consent Documents
DROP POLICY IF EXISTS "Staff manage consent documents" ON consent_documents;
CREATE POLICY "Staff manage consent documents" ON consent_documents
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view own consent documents" ON consent_documents;
CREATE POLICY "Owners view own consent documents" ON consent_documents
    FOR SELECT USING (signed_by = auth.uid());

-- =============================================================================
-- E. RLS POLICIES FOR INSURANCE
-- =============================================================================

-- Insurance Providers - Public read
DROP POLICY IF EXISTS "Public read insurance providers" ON insurance_providers;
CREATE POLICY "Public read insurance providers" ON insurance_providers
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Staff manage insurance providers" ON insurance_providers;
CREATE POLICY "Staff manage insurance providers" ON insurance_providers
    FOR ALL USING (public.is_staff_of(tenant_id));

-- Insurance Policies
DROP POLICY IF EXISTS "Owners manage own policies" ON insurance_policies;
CREATE POLICY "Owners manage own policies" ON insurance_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = insurance_policies.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff view clinic policies" ON insurance_policies;
CREATE POLICY "Staff view clinic policies" ON insurance_policies
    FOR SELECT USING (public.is_staff_of(tenant_id));

-- Insurance Claims
DROP POLICY IF EXISTS "Staff manage insurance claims" ON insurance_claims;
CREATE POLICY "Staff manage insurance claims" ON insurance_claims
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view own claims" ON insurance_claims;
CREATE POLICY "Owners view own claims" ON insurance_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = insurance_claims.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- F. RLS POLICIES FOR INVOICES
-- =============================================================================

-- Invoices
DROP POLICY IF EXISTS "Staff manage invoices" ON invoices;
CREATE POLICY "Staff manage invoices" ON invoices
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners view own invoices" ON invoices;
CREATE POLICY "Owners view own invoices" ON invoices
    FOR SELECT USING (owner_id = auth.uid());

-- Invoice Items
DROP POLICY IF EXISTS "Staff manage invoice items" ON invoice_items;
CREATE POLICY "Staff manage invoice items" ON invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND public.is_staff_of(invoices.tenant_id)
        )
    );

-- Payments
DROP POLICY IF EXISTS "Staff manage payments" ON payments;
CREATE POLICY "Staff manage payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payments.invoice_id
            AND public.is_staff_of(invoices.tenant_id)
        )
    );

DROP POLICY IF EXISTS "Owners view own payments" ON payments;
CREATE POLICY "Owners view own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payments.invoice_id
            AND invoices.owner_id = auth.uid()
        )
    );

-- Payment Methods - Staff manage
DROP POLICY IF EXISTS "Staff manage payment methods" ON payment_methods;
CREATE POLICY "Staff manage payment methods" ON payment_methods
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant view payment methods" ON payment_methods;
CREATE POLICY "Tenant view payment methods" ON payment_methods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = payment_methods.tenant_id
        )
    );

-- =============================================================================
-- G. RLS POLICIES FOR SERVICES
-- =============================================================================

DROP POLICY IF EXISTS "Public view active services" ON services;
CREATE POLICY "Public view active services" ON services
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Staff manage services" ON services;
CREATE POLICY "Staff manage services" ON services
    FOR ALL USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- H. MISSING INDEXES (TICKET-DB-003)
-- =============================================================================

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);

-- Lab Orders
CREATE INDEX IF NOT EXISTS idx_lab_orders_tenant_id ON lab_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet_id ON lab_orders(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_by ON lab_orders(ordered_by);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);

-- Lab Order Items
CREATE INDEX IF NOT EXISTS idx_lab_order_items_order_id ON lab_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_order_items_test_id ON lab_order_items(test_id);

-- Hospitalizations
CREATE INDEX IF NOT EXISTS idx_hospitalizations_tenant_id ON hospitalizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_pet_id ON hospitalizations(pet_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_kennel_id ON hospitalizations(kennel_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON hospitalizations(status);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_admitted_at ON hospitalizations(admitted_at);

-- Hospitalization Visits
CREATE INDEX IF NOT EXISTS idx_hospitalization_visits_hospitalization_id ON hospitalization_visits(hospitalization_id);

-- Kennels
CREATE INDEX IF NOT EXISTS idx_kennels_tenant_id ON kennels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kennels_status ON kennels(current_status);

-- Consent Documents
CREATE INDEX IF NOT EXISTS idx_consent_documents_tenant_id ON consent_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_template_id ON consent_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_pet_id ON consent_documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_signed_by ON consent_documents(signed_by);

-- Insurance Claims
CREATE INDEX IF NOT EXISTS idx_insurance_claims_tenant_id ON insurance_claims(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_pet_id ON insurance_claims(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy_id ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_pet_id ON invoices(pet_id);
CREATE INDEX IF NOT EXISTS idx_invoices_owner_id ON invoices(owner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Invoice Items
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_service_id ON invoice_items(service_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);

-- Services
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- =============================================================================
-- I. UPDATED_AT TRIGGERS (TICKET-DB-005)
-- =============================================================================

-- Ensure handle_updated_at function exists
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables missing them
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'services', 'payment_methods', 'invoice_items',
        'lab_test_catalog', 'lab_test_panels', 'lab_orders', 'lab_results',
        'hospitalizations', 'kennels',
        'consent_templates', 'consent_documents',
        'insurance_providers', 'insurance_policies', 'insurance_claims',
        'invoices'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        -- Check if table exists and trigger doesn't exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            EXECUTE format('
                DROP TRIGGER IF EXISTS handle_updated_at ON %I;
                CREATE TRIGGER handle_updated_at
                    BEFORE UPDATE ON %I
                    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
            ', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
