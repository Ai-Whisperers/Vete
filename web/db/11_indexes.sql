-- =============================================================================
-- 11_INDEXES.SQL
-- =============================================================================
-- Performance indexes for all tables.
-- Includes indexes for:
-- - Foreign keys (required for efficient JOINs and ON DELETE)
-- - Frequently queried columns
-- - Fuzzy search (trigram)
-- =============================================================================

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_tenant_role ON profiles(id, tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON profiles USING gin (email gin_trgm_ops);

-- Clinic Invites
CREATE INDEX IF NOT EXISTS idx_clinic_invites_tenant_id ON clinic_invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clinic_invites_email ON clinic_invites(email);

-- =============================================================================
-- PET TABLES
-- =============================================================================

-- Pets
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_tenant_id ON pets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pets_microchip ON pets(microchip_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_name_trgm ON pets USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pets_microchip_trgm ON pets USING gin (microchip_id gin_trgm_ops);

-- Vaccines
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_id ON vaccines(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccines_status ON vaccines(status);
CREATE INDEX IF NOT EXISTS idx_vaccines_administered_by ON vaccines(administered_by);
CREATE INDEX IF NOT EXISTS idx_vaccines_next_due_date ON vaccines(next_due_date);

-- Vaccine Reactions
CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_pet_id ON vaccine_reactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccine_reactions_vaccine_id ON vaccine_reactions(vaccine_id);

-- QR Tags
CREATE INDEX IF NOT EXISTS idx_qr_tags_pet_id ON qr_tags(pet_id);
CREATE INDEX IF NOT EXISTS idx_qr_tags_tenant_id ON qr_tags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qr_tags_status ON qr_tags(status);

-- Clinic Patient Access
CREATE INDEX IF NOT EXISTS idx_clinic_patient_access_clinic_id ON clinic_patient_access(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_patient_access_pet_id ON clinic_patient_access(pet_id);

-- =============================================================================
-- MEDICAL TABLES
-- =============================================================================

-- Medical Records
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_id ON medical_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_performed_by ON medical_records(performed_by);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(type);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_diagnosis_code ON medical_records(diagnosis_code);

-- Prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_pet_id ON prescriptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_vet_id ON prescriptions(vet_id);

-- Voice Notes
CREATE INDEX IF NOT EXISTS idx_voice_notes_pet_id ON voice_notes(pet_id);

-- DICOM Images
CREATE INDEX IF NOT EXISTS idx_dicom_images_pet_id ON dicom_images(pet_id);

-- =============================================================================
-- CLINICAL TABLES
-- =============================================================================

-- Diagnosis Codes
CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_category ON diagnosis_codes(category);
CREATE INDEX IF NOT EXISTS idx_diagnosis_codes_term_trgm ON diagnosis_codes USING gin (term gin_trgm_ops);

-- Drug Dosages
CREATE INDEX IF NOT EXISTS idx_drug_dosages_name ON drug_dosages(name);
CREATE INDEX IF NOT EXISTS idx_drug_dosages_species ON drug_dosages(species);

-- Growth Standards
CREATE INDEX IF NOT EXISTS idx_growth_standards_lookup ON growth_standards(breed, gender, age_weeks);

-- Reproductive Cycles
CREATE INDEX IF NOT EXISTS idx_reproductive_cycles_pet_id ON reproductive_cycles(pet_id);

-- Euthanasia Assessments
CREATE INDEX IF NOT EXISTS idx_euthanasia_assessments_pet_id ON euthanasia_assessments(pet_id);

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =============================================================================
-- INVENTORY TABLES
-- =============================================================================

-- Store Categories
CREATE INDEX IF NOT EXISTS idx_store_categories_tenant_id ON store_categories(tenant_id);

-- Store Products
CREATE INDEX IF NOT EXISTS idx_store_products_tenant_id ON store_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_products_category_id ON store_products(category_id);
CREATE INDEX IF NOT EXISTS idx_store_products_sku ON store_products(sku);
CREATE INDEX IF NOT EXISTS idx_store_products_is_active ON store_products(is_active);

-- Store Inventory
CREATE INDEX IF NOT EXISTS idx_store_inventory_tenant_id ON store_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_expiry ON store_inventory(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_store_inventory_low_stock ON store_inventory(stock_quantity, min_stock_level);

-- Store Inventory Transactions
CREATE INDEX IF NOT EXISTS idx_store_inventory_transactions_product_id ON store_inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_transactions_tenant_id ON store_inventory_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_transactions_type ON store_inventory_transactions(type);
CREATE INDEX IF NOT EXISTS idx_store_inventory_transactions_created_at ON store_inventory_transactions(created_at DESC);

-- Store Campaigns
CREATE INDEX IF NOT EXISTS idx_store_campaigns_tenant_id ON store_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_campaigns_active ON store_campaigns(is_active, start_date, end_date);

-- Store Campaign Items
CREATE INDEX IF NOT EXISTS idx_store_campaign_items_campaign_id ON store_campaign_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_store_campaign_items_product_id ON store_campaign_items(product_id);

-- Store Price History
CREATE INDEX IF NOT EXISTS idx_store_price_history_product_id ON store_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_store_price_history_changed_at ON store_price_history(changed_at DESC);

-- Legacy Products
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);

-- =============================================================================
-- FINANCE TABLES
-- =============================================================================

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expenses_clinic_id ON expenses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- Loyalty Points
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);

-- Loyalty Transactions
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_pet_id ON loyalty_transactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_clinic_id ON loyalty_transactions(clinic_id);

-- =============================================================================
-- SAFETY TABLES
-- =============================================================================

-- Pet QR Codes
CREATE INDEX IF NOT EXISTS idx_pet_qr_codes_pet_id ON pet_qr_codes(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_qr_codes_is_active ON pet_qr_codes(is_active) WHERE is_active = TRUE;

-- Lost Pets
CREATE INDEX IF NOT EXISTS idx_lost_pets_pet_id ON lost_pets(pet_id);
CREATE INDEX IF NOT EXISTS idx_lost_pets_status ON lost_pets(status);
CREATE INDEX IF NOT EXISTS idx_lost_pets_created_at ON lost_pets(created_at DESC);

-- =============================================================================
-- EPIDEMIOLOGY TABLES
-- =============================================================================

-- Disease Reports
CREATE INDEX IF NOT EXISTS idx_disease_reports_tenant_id ON disease_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_diagnosis_code ON disease_reports(diagnosis_code_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_species ON disease_reports(species);
CREATE INDEX IF NOT EXISTS idx_disease_reports_location ON disease_reports(location_zone);
CREATE INDEX IF NOT EXISTS idx_disease_reports_date ON disease_reports(reported_date DESC);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- INDEXES COMPLETE
-- =============================================================================
