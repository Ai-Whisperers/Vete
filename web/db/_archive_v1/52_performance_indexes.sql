-- =============================================================================
-- 52_PERFORMANCE_INDEXES.SQL
-- =============================================================================
-- Additional performance indexes for frequently queried columns.
-- Addresses TICKET-DB-003: Missing indexes on high-frequency query patterns.
-- =============================================================================

-- =============================================================================
-- A. APPOINTMENTS
-- =============================================================================

-- Index for service_id - frequently joined for service details
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);

-- Composite index for common appointment queries (date + status)
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status)
    WHERE status NOT IN ('cancelled');

-- Composite index for vet schedule queries
CREATE INDEX IF NOT EXISTS idx_appointments_vet_date ON appointments(vet_id, appointment_date)
    WHERE vet_id IS NOT NULL AND status NOT IN ('cancelled');

-- =============================================================================
-- B. LAB ORDERS
-- =============================================================================

-- Index for ordered_by - frequently used to track who ordered tests
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_by ON lab_orders(ordered_by);

-- Composite index for lab order queries by tenant and status
CREATE INDEX IF NOT EXISTS idx_lab_orders_tenant_status ON lab_orders(tenant_id, status)
    WHERE status IN ('ordered', 'in_progress', 'specimen_collected');

-- Index for medical record association
CREATE INDEX IF NOT EXISTS idx_lab_orders_medical_record ON lab_orders(medical_record_id)
    WHERE medical_record_id IS NOT NULL;

-- Index for hospitalization association
CREATE INDEX IF NOT EXISTS idx_lab_orders_hospitalization ON lab_orders(hospitalization_id)
    WHERE hospitalization_id IS NOT NULL;

-- =============================================================================
-- C. LAB ORDER ITEMS
-- =============================================================================

-- Composite index for test lookups
CREATE INDEX IF NOT EXISTS idx_lab_order_items_test ON lab_order_items(test_id, status)
    WHERE test_id IS NOT NULL;

-- Composite index for panel lookups
CREATE INDEX IF NOT EXISTS idx_lab_order_items_panel ON lab_order_items(panel_id, status)
    WHERE panel_id IS NOT NULL;

-- =============================================================================
-- D. CONSENT DOCUMENTS
-- =============================================================================

-- Index for template_id - frequently joined for template details
CREATE INDEX IF NOT EXISTS idx_consent_documents_template ON consent_documents(template_id);

-- Composite index for active consents by template
CREATE INDEX IF NOT EXISTS idx_consent_documents_template_status ON consent_documents(template_id, status)
    WHERE status = 'active';

-- Index for medical record association
CREATE INDEX IF NOT EXISTS idx_consent_documents_medical_record ON consent_documents(medical_record_id)
    WHERE medical_record_id IS NOT NULL;

-- =============================================================================
-- E. ADDITIONAL COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =============================================================================

-- Pets: Owner + tenant (for multi-clinic access patterns)
CREATE INDEX IF NOT EXISTS idx_pets_owner_tenant ON pets(owner_id, tenant_id);

-- Medical Records: Pet + type (for filtering by record type)
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_type ON medical_records(pet_id, type, created_at DESC);

-- Vaccines: Pet + next due (for reminder queries)
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_next_due ON vaccines(pet_id, next_due_date)
    WHERE status = 'verified' AND next_due_date IS NOT NULL;

-- Prescriptions: Pet + vet (for prescription history)
CREATE INDEX IF NOT EXISTS idx_prescriptions_pet_vet ON prescriptions(pet_id, vet_id);

-- Lab Results: Order + critical (for critical value alerts)
CREATE INDEX IF NOT EXISTS idx_lab_results_order_critical ON lab_results(lab_order_id, is_critical)
    WHERE is_critical = TRUE;

-- Hospitalization Vitals: Hospitalization + recorded time
CREATE INDEX IF NOT EXISTS idx_hosp_vitals_hosp_time ON hospitalization_vitals(hospitalization_id, recorded_at DESC);

-- Messages: Conversation + created time (for conversation history)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON messages(conversation_id, created_at DESC);

-- Messages: Sender + type (for filtering by sender and message type)
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_id, message_type);

-- Appointments: Tenant + date range (for calendar queries)
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON appointments(tenant_id, appointment_date);

-- Store Products: Tenant + active (for active product queries)
CREATE INDEX IF NOT EXISTS idx_store_products_tenant_active ON store_products(tenant_id, is_active)
    WHERE is_active = TRUE;

-- Store Inventory: Product + low stock alert
CREATE INDEX IF NOT EXISTS idx_store_inventory_product_stock ON store_inventory(product_id, stock_quantity, min_stock_level)
    WHERE stock_quantity <= min_stock_level;

-- Expenses: Tenant + date (for financial reports)
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_date ON expenses(clinic_id, date DESC);

-- Insurance Claims: Tenant + status (for claims dashboard)
CREATE INDEX IF NOT EXISTS idx_insurance_claims_tenant_status ON insurance_claims(tenant_id, status)
    WHERE status IN ('submitted', 'under_review', 'pending_documents');

-- =============================================================================
-- F. FOREIGN KEY INDEXES FOR CASCADING DELETES
-- =============================================================================

-- These indexes improve performance of ON DELETE CASCADE operations

-- Services (for appointments)
CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);

-- Invoice Items (for invoice queries)
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_service ON invoice_items(service_id)
    WHERE service_id IS NOT NULL;

-- Payment Methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods(tenant_id);

-- =============================================================================
-- G. FULL-TEXT SEARCH INDEXES
-- =============================================================================

-- Medical records: Full-text search on notes
CREATE INDEX IF NOT EXISTS idx_medical_records_notes_trgm ON medical_records
    USING gin (notes gin_trgm_ops)
    WHERE notes IS NOT NULL;

-- Prescriptions: Full-text search on drug name and instructions
CREATE INDEX IF NOT EXISTS idx_prescriptions_drug_trgm ON prescriptions
    USING gin (drug_name gin_trgm_ops);

-- Store products: Full-text search on name and description
CREATE INDEX IF NOT EXISTS idx_store_products_name_trgm ON store_products
    USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_store_products_description_trgm ON store_products
    USING gin (description gin_trgm_ops)
    WHERE description IS NOT NULL;

-- Messages: Full-text search on content
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages
    USING gin (content gin_trgm_ops)
    WHERE content IS NOT NULL AND message_type = 'text';

-- =============================================================================
-- H. PARTIAL INDEXES FOR STATUS FILTERING
-- =============================================================================

-- Active hospitalizations (most commonly queried)
CREATE INDEX IF NOT EXISTS idx_hospitalizations_active_detail ON hospitalizations(tenant_id, kennel_id, acuity_level)
    WHERE status = 'active';

-- Pending appointments (for today's schedule)
CREATE INDEX IF NOT EXISTS idx_appointments_pending_today ON appointments(tenant_id, vet_id, start_time)
    WHERE status IN ('pending', 'confirmed') AND appointment_date = CURRENT_DATE;

-- Scheduled hospitalization treatments (for treatment schedule)
CREATE INDEX IF NOT EXISTS idx_hosp_treatments_scheduled_detail ON hospitalization_treatments(hospitalization_id, treatment_type, scheduled_at)
    WHERE status = 'scheduled';

-- Pending consent requests (for follow-up)
CREATE INDEX IF NOT EXISTS idx_consent_requests_pending_detail ON consent_requests(tenant_id, expires_at)
    WHERE status IN ('pending', 'sent', 'viewed');

-- Active blanket consents (for quick consent checks)
CREATE INDEX IF NOT EXISTS idx_blanket_consents_active_detail ON blanket_consents(tenant_id, owner_id, consent_type, pet_id)
    WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > CURRENT_DATE);

-- Unread messages (for notification badges)
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, sender_type)
    WHERE status IN ('sent', 'delivered');

-- =============================================================================
-- I. COVERING INDEXES FOR FREQUENTLY ACCESSED COLUMNS
-- =============================================================================

-- Appointments with all commonly selected columns
CREATE INDEX IF NOT EXISTS idx_appointments_covering ON appointments(tenant_id, appointment_date, status)
    INCLUDE (pet_id, vet_id, start_time, end_time, reason);

-- Pets with owner info
CREATE INDEX IF NOT EXISTS idx_pets_covering ON pets(tenant_id, owner_id)
    INCLUDE (name, species, breed, date_of_birth);

-- Lab orders with status info
CREATE INDEX IF NOT EXISTS idx_lab_orders_covering ON lab_orders(tenant_id, pet_id, status)
    INCLUDE (order_number, ordered_at, ordered_by);

-- Insurance claims with amount info
CREATE INDEX IF NOT EXISTS idx_insurance_claims_covering ON insurance_claims(tenant_id, pet_id, status)
    INCLUDE (claim_number, date_of_service, claimed_amount, approved_amount);

-- =============================================================================
-- J. INDEXES FOR REPORTING AND ANALYTICS
-- =============================================================================

-- Revenue reporting by date
CREATE INDEX IF NOT EXISTS idx_invoices_date_status ON invoices(tenant_id, created_at, status)
    WHERE status NOT IN ('draft', 'cancelled');

-- Service usage analytics
CREATE INDEX IF NOT EXISTS idx_appointments_service_date ON appointments(service_id, appointment_date)
    WHERE status = 'completed';

-- Inventory turnover
CREATE INDEX IF NOT EXISTS idx_store_inventory_transactions_date ON store_inventory_transactions(tenant_id, type, created_at DESC);

-- Lab test frequency
CREATE INDEX IF NOT EXISTS idx_lab_order_items_test_date ON lab_order_items(test_id, created_at DESC)
    WHERE test_id IS NOT NULL AND status = 'completed';

-- Disease surveillance
CREATE INDEX IF NOT EXISTS idx_disease_reports_date_location ON disease_reports(tenant_id, reported_date DESC, location_zone)
    WHERE location_zone IS NOT NULL;

-- =============================================================================
-- PERFORMANCE INDEXES COMPLETE
-- =============================================================================

-- NOTES:
-- - All indexes use IF NOT EXISTS to prevent errors on re-run
-- - Partial indexes (with WHERE clauses) reduce index size and improve write performance
-- - Covering indexes (with INCLUDE) reduce the need for table lookups
-- - Composite indexes follow the "equality first, range last" rule for optimal query planning
-- - Trigram indexes (gin_trgm_ops) enable fast fuzzy search for text fields
