-- =============================================================================
-- FULL DATABASE SETUP SCRIPT
-- =============================================================================
-- Generated: 2025-12-18T13:44:29.992Z
--
-- This file combines all SQL migrations in the correct order.
-- Copy and paste into Supabase SQL Editor to set up the database.
--
-- Options used:
--   Reset: YES (will delete all data!)
--   Seed:  YES (demo data included)
-- =============================================================================


-- =============================================================================
-- FILE: 00_cleanup.sql
-- =============================================================================

-- =============================================================================
-- 00_CLEANUP.SQL
-- =============================================================================
-- Complete database cleanup script. Drops ALL tables, functions, triggers,
-- storage buckets, and policies. DATA WILL BE PERMANENTLY LOST.
--
-- Run this ONLY when you need to completely reset the database.
-- =============================================================================

-- =============================================================================
-- 1. DROP MATERIALIZED VIEWS
-- =============================================================================

-- Core materialized views (from 31_materialized_views.sql)
DROP MATERIALIZED VIEW IF EXISTS mv_clinic_dashboard_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_pet_statistics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_appointment_analytics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_revenue_analytics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_service_popularity CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_vaccine_compliance CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_client_retention CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_inventory_alerts CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_disease_heatmap CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_staff_performance CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_client_summary CASCADE;

-- Enhanced materialized views (from 57_materialized_views.sql)
DROP MATERIALIZED VIEW IF EXISTS mv_clinic_dashboard_stats_v2 CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_appointment_analytics_daily CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_inventory_alerts_detailed CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_pet_health_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_revenue_by_service CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_client_lifetime_value CASCADE;

-- =============================================================================
-- 2. DROP REGULAR VIEWS
-- =============================================================================
DROP VIEW IF EXISTS public_health_heatmap CASCADE;
DROP VIEW IF EXISTS low_stock_products CASCADE;
DROP VIEW IF EXISTS expiring_products CASCADE;
DROP VIEW IF EXISTS active_pets CASCADE;
DROP VIEW IF EXISTS active_vaccines CASCADE;
DROP VIEW IF EXISTS active_medical_records CASCADE;
DROP VIEW IF EXISTS active_appointments CASCADE;
DROP VIEW IF EXISTS active_invoices CASCADE;
DROP VIEW IF EXISTS active_hospitalizations CASCADE;
DROP VIEW IF EXISTS active_conversations CASCADE;
DROP VIEW IF EXISTS trash_bin CASCADE;
DROP VIEW IF EXISTS recent_job_executions CASCADE;
DROP VIEW IF EXISTS job_statistics CASCADE;
DROP VIEW IF EXISTS scheduled_jobs CASCADE;
DROP VIEW IF EXISTS critical_security_events CASCADE;
DROP VIEW IF EXISTS audit_activity_summary CASCADE;

-- =============================================================================
-- 3. UNSCHEDULE PG_CRON JOBS
-- =============================================================================
DO $$
BEGIN
    -- Only run if pg_cron extension exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE 'vete_%';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- pg_cron not available, skip
    NULL;
END $$;

-- =============================================================================
-- 4. DROP TABLES (reverse dependency order with CASCADE)
-- =============================================================================

-- Scheduled Jobs & Audit
DROP TABLE IF EXISTS scheduled_job_log CASCADE;
DROP TABLE IF EXISTS materialized_view_refresh_log CASCADE;

-- Enhanced Audit (30)
DROP TABLE IF EXISTS data_access_log CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS audit_configuration CASCADE;
DROP TABLE IF EXISTS audit_log_enhanced CASCADE;

-- Archived Tables (29)
DROP TABLE IF EXISTS archived_consent_documents CASCADE;
DROP TABLE IF EXISTS archived_invoices CASCADE;
DROP TABLE IF EXISTS archived_medical_records CASCADE;
DROP TABLE IF EXISTS archived_pets CASCADE;

-- Insurance (28)
DROP TABLE IF EXISTS insurance_claim_stats CASCADE;
DROP TABLE IF EXISTS insurance_eob CASCADE;
DROP TABLE IF EXISTS insurance_claim_communications CASCADE;
DROP TABLE IF EXISTS insurance_claim_documents CASCADE;
DROP TABLE IF EXISTS insurance_pre_authorizations CASCADE;
DROP TABLE IF EXISTS insurance_claim_items CASCADE;
DROP TABLE IF EXISTS insurance_claims CASCADE;
DROP TABLE IF EXISTS pet_insurance_policies CASCADE;
DROP TABLE IF EXISTS insurance_providers CASCADE;

-- Messaging (27)
DROP TABLE IF EXISTS auto_reply_rules CASCADE;
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS communication_preferences CASCADE;
DROP TABLE IF EXISTS broadcast_recipients CASCADE;
DROP TABLE IF EXISTS broadcast_campaigns CASCADE;
DROP TABLE IF EXISTS quick_replies CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Staff (26)
DROP TABLE IF EXISTS staff_reviews CASCADE;
DROP TABLE IF EXISTS staff_tasks CASCADE;
DROP TABLE IF EXISTS staff_availability_overrides CASCADE;
DROP TABLE IF EXISTS time_off_balances CASCADE;
DROP TABLE IF EXISTS time_off_requests CASCADE;
DROP TABLE IF EXISTS time_off_types CASCADE;
DROP TABLE IF EXISTS staff_shifts CASCADE;
DROP TABLE IF EXISTS staff_schedule_entries CASCADE;
DROP TABLE IF EXISTS staff_schedules CASCADE;
DROP TABLE IF EXISTS staff_profiles CASCADE;

-- Consent (25)
DROP TABLE IF EXISTS blanket_consents CASCADE;
DROP TABLE IF EXISTS consent_requests CASCADE;
DROP TABLE IF EXISTS consent_audit_log CASCADE;
DROP TABLE IF EXISTS consent_documents CASCADE;
DROP TABLE IF EXISTS consent_template_fields CASCADE;
DROP TABLE IF EXISTS consent_templates CASCADE;

-- Lab Results (24)
DROP TABLE IF EXISTS external_lab_integrations CASCADE;
DROP TABLE IF EXISTS lab_result_comments CASCADE;
DROP TABLE IF EXISTS lab_result_attachments CASCADE;
DROP TABLE IF EXISTS lab_results CASCADE;
DROP TABLE IF EXISTS lab_order_items CASCADE;
DROP TABLE IF EXISTS lab_orders CASCADE;
DROP TABLE IF EXISTS lab_reference_ranges CASCADE;
DROP TABLE IF EXISTS lab_panel_tests CASCADE;
DROP TABLE IF EXISTS lab_test_panels CASCADE;
DROP TABLE IF EXISTS lab_test_catalog CASCADE;

-- Hospitalization (23)
DROP TABLE IF EXISTS hospitalization_documents CASCADE;
DROP TABLE IF EXISTS hospitalization_visits CASCADE;
DROP TABLE IF EXISTS kennel_transfers CASCADE;
DROP TABLE IF EXISTS hospitalization_feedings CASCADE;
DROP TABLE IF EXISTS hospitalization_treatments CASCADE;
DROP TABLE IF EXISTS hospitalization_vitals CASCADE;
DROP TABLE IF EXISTS hospitalizations CASCADE;
DROP TABLE IF EXISTS kennels CASCADE;

-- Reminders (22)
DROP TABLE IF EXISTS reminder_rules CASCADE;
DROP TABLE IF EXISTS notification_log CASCADE;
DROP TABLE IF EXISTS notification_queue CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notification_channels CASCADE;

-- Invoicing (21)
DROP TABLE IF EXISTS invoice_sequences CASCADE;
DROP TABLE IF EXISTS recurring_invoice_items CASCADE;
DROP TABLE IF EXISTS recurring_invoice_templates CASCADE;
DROP TABLE IF EXISTS client_credits CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS services CASCADE;

-- Epidemiology & Audit (10)
DROP TABLE IF EXISTS disease_reports CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Safety Features (09)
DROP TABLE IF EXISTS lost_pets CASCADE;
DROP TABLE IF EXISTS pet_qr_codes CASCADE;

-- Finance (08)
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_points CASCADE;

-- Inventory/Store (07)
DROP TABLE IF EXISTS store_price_history CASCADE;
DROP TABLE IF EXISTS store_campaign_items CASCADE;
DROP TABLE IF EXISTS store_campaigns CASCADE;
DROP TABLE IF EXISTS store_inventory_transactions CASCADE;
DROP TABLE IF EXISTS store_inventory CASCADE;
DROP TABLE IF EXISTS store_products CASCADE;
DROP TABLE IF EXISTS store_categories CASCADE;

-- Appointments (06)
DROP TABLE IF EXISTS appointments CASCADE;

-- Clinical/Medical (05)
DROP TABLE IF EXISTS euthanasia_assessments CASCADE;
DROP TABLE IF EXISTS reproductive_cycles CASCADE;
DROP TABLE IF EXISTS dicom_images CASCADE;
DROP TABLE IF EXISTS voice_notes CASCADE;
DROP TABLE IF EXISTS vaccine_reactions CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;

-- Reference Data (05)
DROP TABLE IF EXISTS growth_standards CASCADE;
DROP TABLE IF EXISTS drug_dosages CASCADE;
DROP TABLE IF EXISTS diagnosis_codes CASCADE;
DROP TABLE IF EXISTS vaccine_templates CASCADE;

-- Core Medical (04)
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS clinic_patient_access CASCADE;

-- Products & Tags (03)
DROP TABLE IF EXISTS qr_tags CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Vaccines & Pets (03)
DROP TABLE IF EXISTS vaccines CASCADE;
DROP TABLE IF EXISTS pets CASCADE;

-- Users & Clinics (02)
DROP TABLE IF EXISTS clinic_invites CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- =============================================================================
-- 5. DROP TRIGGERS (from auth.users)
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================================================
-- 6. DROP FUNCTIONS
-- =============================================================================

-- Scheduled Job Functions (32)
DROP FUNCTION IF EXISTS public.trigger_job(text) CASCADE;
DROP FUNCTION IF EXISTS public.job_update_statistics() CASCADE;
DROP FUNCTION IF EXISTS public.job_generate_recurring_invoices() CASCADE;
DROP FUNCTION IF EXISTS public.job_clean_job_logs() CASCADE;
DROP FUNCTION IF EXISTS public.job_update_policy_status() CASCADE;
DROP FUNCTION IF EXISTS public.job_expire_preauthorizations() CASCADE;
DROP FUNCTION IF EXISTS public.job_update_invoice_status() CASCADE;
DROP FUNCTION IF EXISTS public.job_process_notifications() CASCADE;
DROP FUNCTION IF EXISTS public.job_generate_appointment_reminders() CASCADE;
DROP FUNCTION IF EXISTS public.job_generate_vaccine_reminders() CASCADE;
DROP FUNCTION IF EXISTS public.job_purge_audit_logs() CASCADE;
DROP FUNCTION IF EXISTS public.job_purge_deleted_records() CASCADE;
DROP FUNCTION IF EXISTS public.job_expire_consents() CASCADE;
DROP FUNCTION IF EXISTS public.job_refresh_dashboard_views() CASCADE;
DROP FUNCTION IF EXISTS public.job_refresh_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS public.run_scheduled_job(text, text) CASCADE;

-- Materialized View Functions (31 + 57)
DROP FUNCTION IF EXISTS public.refresh_dashboard_views() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_all_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_enhanced_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_critical_dashboard_views() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_all_views_complete() CASCADE;
DROP FUNCTION IF EXISTS public.job_refresh_enhanced_views() CASCADE;
DROP FUNCTION IF EXISTS public.job_refresh_critical_views() CASCADE;

-- Enhanced Audit Functions (30)
DROP FUNCTION IF EXISTS public.purge_expired_audit_logs() CASCADE;
DROP FUNCTION IF EXISTS public.get_security_summary(text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_record_audit_history(text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.log_security_event(text, uuid, jsonb, text, inet) CASCADE;
DROP FUNCTION IF EXISTS public.disable_audit_for_table(text) CASCADE;
DROP FUNCTION IF EXISTS public.enable_audit_for_table(text, text, text[]) CASCADE;
DROP FUNCTION IF EXISTS public.audit_trigger_func() CASCADE;

-- Soft Delete Functions (29)
DROP FUNCTION IF EXISTS public.purge_old_deleted_records(integer) CASCADE;
DROP FUNCTION IF EXISTS public.permanent_delete_pet(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.restore_pet(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.soft_delete_pet(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.restore_deleted(text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.soft_delete(text, uuid, uuid) CASCADE;

-- Insurance Functions (28)
DROP FUNCTION IF EXISTS public.update_claim_status() CASCADE;
DROP FUNCTION IF EXISTS public.get_policy_claims_summary(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_pet_active_insurance(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_claim_totals(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.generate_claim_number(text) CASCADE;

-- Messaging Functions (27)
DROP FUNCTION IF EXISTS public.can_send_message(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_conversation_summary(text) CASCADE;
DROP FUNCTION IF EXISTS public.render_message_template(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.mark_conversation_read(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_on_message() CASCADE;

-- Staff Functions (26)
DROP FUNCTION IF EXISTS public.get_today_schedule(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_time_off_balance() CASCADE;
DROP FUNCTION IF EXISTS public.get_staff_availability(text, date, date, uuid) CASCADE;

-- Consent Functions (25)
DROP FUNCTION IF EXISTS public.expire_old_consents() CASCADE;
DROP FUNCTION IF EXISTS public.check_consent_exists(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.log_consent_action() CASCADE;
DROP FUNCTION IF EXISTS public.generate_consent_number(text) CASCADE;

-- Lab Results Functions (24)
DROP FUNCTION IF EXISTS public.get_pet_lab_history(uuid, uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.update_lab_order_status() CASCADE;
DROP FUNCTION IF EXISTS public.evaluate_lab_result(decimal, uuid, text, integer, text) CASCADE;
DROP FUNCTION IF EXISTS public.generate_lab_order_number(text) CASCADE;

-- Hospitalization Functions (23)
DROP FUNCTION IF EXISTS public.get_pending_treatments(text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_hospitalization_census(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_kennel_status() CASCADE;
DROP FUNCTION IF EXISTS public.generate_hospitalization_number(text) CASCADE;

-- Reminder Functions (22)
DROP FUNCTION IF EXISTS public.process_pending_reminders() CASCADE;
DROP FUNCTION IF EXISTS public.generate_appointment_reminders(text) CASCADE;
DROP FUNCTION IF EXISTS public.generate_vaccine_reminders(text) CASCADE;

-- Invoicing Functions (21)
DROP FUNCTION IF EXISTS public.calculate_invoice_totals() CASCADE;
DROP FUNCTION IF EXISTS public.generate_invoice_number(text) CASCADE;

-- Core Functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_staff_of(text) CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Pet & Vaccine Functions
DROP FUNCTION IF EXISTS public.handle_new_pet_vaccines() CASCADE;
DROP FUNCTION IF EXISTS public.get_pet_by_tag(text) CASCADE;
DROP FUNCTION IF EXISTS public.assign_tag_to_pet(text, uuid) CASCADE;

-- Inventory Functions
DROP FUNCTION IF EXISTS public.process_inventory_transaction() CASCADE;
DROP FUNCTION IF EXISTS public.track_price_change() CASCADE;
DROP FUNCTION IF EXISTS public.import_inventory_batch(text, uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.update_timestamp_column() CASCADE;

-- Security Functions
DROP FUNCTION IF EXISTS public.protect_critical_profile_columns() CASCADE;
DROP FUNCTION IF EXISTS public.update_pet_qr_codes_updated_at() CASCADE;

-- RPC Functions
DROP FUNCTION IF EXISTS public.get_clinic_stats(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_network_stats() CASCADE;
DROP FUNCTION IF EXISTS public.search_pets_global(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.grant_clinic_access(uuid, text) CASCADE;

-- Epidemiology Functions
DROP FUNCTION IF EXISTS public.create_disease_report() CASCADE;
DROP FUNCTION IF EXISTS public.log_action(text, uuid, text, text, jsonb) CASCADE;

-- =============================================================================
-- 7. DROP STORAGE BUCKETS AND POLICIES
-- =============================================================================

-- Drop all policies on storage.objects first
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Delete objects and buckets
DELETE FROM storage.objects WHERE bucket_id IN (
    'vaccines', 'pets', 'records', 'store-products', 'pet-qr-codes', 'receipts',
    'consent-documents', 'lab-results', 'hospitalization-docs', 'message-attachments'
);
DELETE FROM storage.buckets WHERE id IN (
    'vaccines', 'pets', 'records', 'store-products', 'pet-qr-codes', 'receipts',
    'consent-documents', 'lab-results', 'hospitalization-docs', 'message-attachments'
);

-- =============================================================================
-- 8. DROP REALTIME PUBLICATION
-- =============================================================================
DROP PUBLICATION IF EXISTS supabase_realtime;

-- =============================================================================
-- 9. REMOVE DEMO USERS (Safety - won't error if they don't exist)
-- =============================================================================
DELETE FROM auth.users WHERE email IN (
    'admin@demo.com',
    'vet@demo.com',
    'owner@demo.com',
    'owner2@demo.com',
    'vet@petlife.com',
    'pending_vet@demo.com'
);

-- =============================================================================
-- CLEANUP COMPLETE
-- =============================================================================
-- Total tables dropped: ~100+
-- Total functions dropped: ~60+
-- Total materialized views dropped: 10
-- Total regular views dropped: 15+
-- =============================================================================



-- =============================================================================
-- FILE: 01_extensions.sql
-- =============================================================================

-- =============================================================================
-- 01_EXTENSIONS.SQL
-- =============================================================================
-- PostgreSQL extensions required for the application.
-- These must be enabled before creating any tables.
-- =============================================================================

-- UUID generation (for primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions (for password hashing in seed data)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigram matching (for fuzzy search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- EXTENSIONS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 02_schema_core.sql
-- =============================================================================

-- =============================================================================
-- 02_SCHEMA_CORE.SQL
-- =============================================================================
-- Core tables: tenants (clinics), profiles (users), and clinic invites.
-- These are the foundation tables that other tables depend on.
-- =============================================================================

-- =============================================================================
-- A. TENANTS (Clinics)
-- =============================================================================
-- Multi-tenant support: each clinic is a tenant with isolated data.
-- Using text ID for readable URLs (e.g., 'adris', 'petlife')

CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,                    -- Slug: 'adris', 'petlife'
    name TEXT NOT NULL,                     -- Display name: 'Veterinaria Adris'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize default tenants (required before creating profiles)
INSERT INTO tenants (id, name) VALUES
    ('adris', 'Veterinaria Adris'),
    ('petlife', 'PetLife Center')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- B. PROFILES (Users: Owners, Vets, Admins)
-- =============================================================================
-- Extends auth.users with application-specific data.
-- Created automatically via trigger when a user signs up.

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Identity
    full_name TEXT,
    email TEXT,
    phone TEXT,
    secondary_phone TEXT,
    avatar_url TEXT,

    -- Role-based access
    role TEXT NOT NULL DEFAULT 'owner'
        CHECK (role IN ('owner', 'vet', 'admin')),

    -- Owner-specific
    client_code TEXT,                       -- Unique ID per tenant for billing
    address TEXT,
    city TEXT,

    -- Vet-specific
    signature_url TEXT,                     -- Digital signature for prescriptions

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR char_length(phone) >= 6),
    CONSTRAINT profiles_email_format CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- =============================================================================
-- C. CLINIC INVITES
-- =============================================================================
-- Pending invitations for staff (vets/admins) to join a clinic.
-- When a user signs up with a matching email, they get the invited role.

CREATE TABLE IF NOT EXISTS clinic_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('vet', 'admin')),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One invite per email per tenant
    UNIQUE(email, tenant_id)
);

-- =============================================================================
-- SCHEMA CORE COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 03_schema_pets.sql
-- =============================================================================

-- =============================================================================
-- 03_SCHEMA_PETS.SQL
-- =============================================================================
-- Pet management tables: pets, vaccines, vaccine templates, vaccine reactions.
-- =============================================================================

-- =============================================================================
-- A. PETS
-- =============================================================================
-- Core pet information linked to owner (profile) and tenant.

CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Basic Info
    name TEXT NOT NULL,
    species TEXT NOT NULL,                  -- 'dog', 'cat', 'rabbit', 'ferret', etc.
    breed TEXT,
    birth_date DATE,
    sex TEXT CHECK (sex IN ('male', 'female')),
    is_neutered BOOLEAN DEFAULT FALSE,

    -- Physical Attributes
    weight_kg NUMERIC(5,2),
    color TEXT,
    photo_url TEXT,

    -- Identification
    microchip_id TEXT UNIQUE,

    -- Health & Behavior
    temperament TEXT,                       -- 'friendly', 'shy', 'aggressive', 'unknown'
    existing_conditions TEXT,               -- Free text summary
    allergies TEXT,

    -- Diet
    diet_category TEXT,                     -- 'balanced', 'raw', 'prescription', etc.
    diet_notes TEXT,

    -- General Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT pets_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0)
);

-- =============================================================================
-- B. VACCINE TEMPLATES
-- =============================================================================
-- Default vaccination schedules per species.
-- Used to auto-create pending vaccines when a pet is registered.

CREATE TABLE IF NOT EXISTS vaccine_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species TEXT NOT NULL,                  -- 'dog', 'cat', 'rabbit', 'ferret'
    vaccine_name TEXT NOT NULL,
    frequency TEXT,                         -- 'annual', 'one-time', 'puppy-series'
    is_mandatory BOOLEAN DEFAULT FALSE,
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One template per vaccine per species
    UNIQUE(species, vaccine_name)
);

-- Seed default templates (Paraguay context)
INSERT INTO vaccine_templates (species, vaccine_name, is_mandatory, frequency, description) VALUES
    -- Dogs
    ('dog', 'Rabia', TRUE, 'annual', 'Obligatoria por ley. Anual a partir de los 3 meses.'),
    ('dog', 'Sextuple/Polivalente', TRUE, 'annual', 'Moquillo, Parvovirus, Hepatitis, Leptospirosis, Parainfluenza. Refuerzo anual.'),
    -- Cats
    ('cat', 'Rabia', TRUE, 'annual', 'Obligatoria por ley. Anual.'),
    ('cat', 'Triple Felina', TRUE, 'annual', 'Rinotraqueitis, Calicivirus, Panleucopenia. Refuerzo anual.'),
    ('cat', 'Leucemia Felina (FeLV)', FALSE, 'annual', 'Recomendada para gatos con acceso al exterior.'),
    -- Rabbits
    ('rabbit', 'Mixomatosis', TRUE, 'biannual', 'Alta mortalidad. Semestral o anual según riesgo.'),
    ('rabbit', 'Enfermedad Hemorrágica Viral (RHD)', TRUE, 'annual', 'Mortal. Refuerzo anual.'),
    -- Ferrets
    ('ferret', 'Rabia', TRUE, 'annual', 'Obligatoria. Anual.'),
    ('ferret', 'Moquillo (Distemper)', TRUE, 'annual', 'Muy susceptible. Vacuna específica o canina recombinante.')
ON CONFLICT (species, vaccine_name) DO NOTHING;

-- =============================================================================
-- C. VACCINES
-- =============================================================================
-- Individual vaccine records for each pet.

CREATE TABLE IF NOT EXISTS vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Vaccine Details
    name TEXT NOT NULL,
    administered_date DATE,
    next_due_date DATE,
    batch_number TEXT,

    -- Administration
    administered_by UUID REFERENCES profiles(id),   -- Vet who administered
    vet_signature TEXT,                             -- Digital signature

    -- Status Workflow
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'rejected')),

    -- Evidence
    photos TEXT[],                                  -- Array of photo URLs

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT vaccines_dates_logic CHECK (
        next_due_date IS NULL OR administered_date IS NULL OR next_due_date >= administered_date
    )
);

-- =============================================================================
-- D. VACCINE REACTIONS
-- =============================================================================
-- Track adverse reactions to vaccines for safety monitoring.

CREATE TABLE IF NOT EXISTS vaccine_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vaccine_id UUID REFERENCES vaccines(id) ON DELETE CASCADE,

    -- Reaction Details
    vaccine_brand TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reaction_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. QR TAGS
-- =============================================================================
-- Physical QR tags for pet identification (collars, etc.)

CREATE TABLE IF NOT EXISTS qr_tags (
    code TEXT PRIMARY KEY,                          -- Unique tag code
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    tenant_id TEXT REFERENCES tenants(id),          -- Batch ownership

    -- Status
    status TEXT NOT NULL DEFAULT 'unassigned'
        CHECK (status IN ('active', 'unassigned', 'lost')),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. CLINIC PATIENT ACCESS
-- =============================================================================
-- Cross-clinic access for pets (e.g., referrals, emergencies)

CREATE TABLE IF NOT EXISTS clinic_patient_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Access Level
    access_level TEXT DEFAULT 'write'
        CHECK (access_level IN ('read', 'write')),

    -- Metadata
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One access record per clinic-pet pair
    UNIQUE(clinic_id, pet_id)
);

-- =============================================================================
-- SCHEMA PETS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 05_schema_clinical.sql
-- =============================================================================

-- =============================================================================
-- 05_SCHEMA_CLINICAL.SQL
-- =============================================================================
-- Clinical reference tables and assessment tools:
-- - Diagnosis codes (VeNom/SNOMED)
-- - Drug dosages
-- - Growth standards
-- - Reproductive cycles
-- - Euthanasia assessments (HHHHHMM scale)
-- =============================================================================

-- =============================================================================
-- A. DIAGNOSIS CODES
-- =============================================================================
-- Standardized diagnosis codes (VeNom, SNOMED, or custom).

CREATE TABLE IF NOT EXISTS diagnosis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,              -- e.g., '1001', 'VN-123'
    term TEXT NOT NULL,                     -- e.g., 'Otitis externa'
    standard TEXT DEFAULT 'custom'
        CHECK (standard IN ('venom', 'snomed', 'custom')),
    category TEXT,                          -- e.g., 'Dermatology', 'Cardiology'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial diagnosis codes (VeNom subset)
INSERT INTO diagnosis_codes (code, term, standard, category) VALUES
    ('1001', 'Otitis externa', 'venom', 'Dermatology'),
    ('1002', 'Pyoderma', 'venom', 'Dermatology'),
    ('1003', 'Gastroenteritis', 'venom', 'Gastroenterology'),
    ('1004', 'Fracture', 'venom', 'Orthopedics'),
    ('1005', 'Conjunctivitis', 'venom', 'Ophthalmology'),
    ('1006', 'Periodontal disease', 'venom', 'Dentistry'),
    ('1007', 'Diabetes mellitus', 'venom', 'Endocrinology'),
    ('1008', 'Chronic kidney disease', 'venom', 'Nephrology'),
    ('1009', 'Heartworm disease', 'venom', 'Cardiology'),
    ('1010', 'Obesity', 'venom', 'Nutrition')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- B. DRUG DOSAGES
-- =============================================================================
-- Reference table for drug dosing calculations.

CREATE TABLE IF NOT EXISTS drug_dosages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    species TEXT DEFAULT 'all'
        CHECK (species IN ('dog', 'cat', 'all')),

    -- Dosage Range
    min_dose_mg_kg NUMERIC(10,2),
    max_dose_mg_kg NUMERIC(10,2),
    concentration_mg_ml NUMERIC(10,2),

    -- Administration
    route TEXT,                             -- 'oral', 'iv', 'im', 'sc'
    frequency TEXT,                         -- 'once daily', 'twice daily', etc.
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One entry per drug-species combination
    UNIQUE(name, species)
);

-- Seed common drug dosages
INSERT INTO drug_dosages (name, species, min_dose_mg_kg, max_dose_mg_kg, concentration_mg_ml, frequency, notes) VALUES
    ('Amoxicillin', 'all', 10.00, 20.00, 50.00, 'twice daily', NULL),
    ('Meloxicam', 'dog', 0.10, 0.20, 1.50, 'once daily', 'Loading dose @ 0.2 mg/kg'),
    ('Meloxicam', 'cat', 0.05, 0.05, 0.50, 'once daily', 'Use with caution in cats'),
    ('Tramadol', 'all', 2.00, 5.00, 50.00, 'every 8-12 hours', NULL),
    ('Cephalexin', 'all', 22.00, 30.00, 250.00, 'twice daily', 'Available as capsules'),
    ('Metronidazole', 'all', 10.00, 15.00, 50.00, 'twice daily', NULL),
    ('Enrofloxacin', 'dog', 5.00, 20.00, 50.00, 'once daily', 'Avoid in young animals'),
    ('Prednisolone', 'all', 0.50, 2.00, 5.00, 'once daily', 'Taper dose when stopping')
ON CONFLICT (name, species) DO NOTHING;

-- =============================================================================
-- C. GROWTH STANDARDS
-- =============================================================================
-- Weight percentiles by breed/age for growth tracking.

CREATE TABLE IF NOT EXISTS growth_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breed TEXT NOT NULL,                    -- 'Labrador Retriever', 'Medium Dog', etc.
    gender TEXT CHECK (gender IN ('male', 'female')),
    age_weeks INTEGER NOT NULL,
    weight_kg NUMERIC(10,2) NOT NULL,
    percentile TEXT DEFAULT 'P50',          -- 'P25', 'P50', 'P75'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One entry per breed-gender-age-percentile
    UNIQUE(breed, gender, age_weeks, percentile)
);

-- Seed medium dog growth standards
INSERT INTO growth_standards (breed, gender, age_weeks, weight_kg, percentile) VALUES
    -- Male Medium Dog
    ('Medium Dog', 'male', 8, 3.5, 'P50'),
    ('Medium Dog', 'male', 12, 7.0, 'P50'),
    ('Medium Dog', 'male', 16, 11.0, 'P50'),
    ('Medium Dog', 'male', 24, 16.0, 'P50'),
    ('Medium Dog', 'male', 36, 19.5, 'P50'),
    ('Medium Dog', 'male', 52, 22.0, 'P50'),
    -- Female Medium Dog
    ('Medium Dog', 'female', 8, 3.2, 'P50'),
    ('Medium Dog', 'female', 12, 6.5, 'P50'),
    ('Medium Dog', 'female', 16, 10.0, 'P50'),
    ('Medium Dog', 'female', 24, 14.5, 'P50'),
    ('Medium Dog', 'female', 36, 17.5, 'P50'),
    ('Medium Dog', 'female', 52, 19.0, 'P50')
ON CONFLICT (breed, gender, age_weeks, percentile) DO NOTHING;

-- =============================================================================
-- D. REPRODUCTIVE CYCLES
-- =============================================================================
-- Track reproductive cycles for breeding management.

CREATE TABLE IF NOT EXISTS reproductive_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Cycle Details
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ NOT NULL,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Validate dates
    CONSTRAINT reproductive_cycles_dates CHECK (cycle_end >= cycle_start)
);

-- =============================================================================
-- E. EUTHANASIA ASSESSMENTS (HHHHHMM Scale)
-- =============================================================================
-- Quality of life assessments using the HHHHHMM scale (0-70).
-- Categories: Hurt, Hunger, Hydration, Hygiene, Happiness, Mobility, More Good Days

CREATE TABLE IF NOT EXISTS euthanasia_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Assessment
    score INTEGER NOT NULL
        CHECK (score >= 0 AND score <= 70),     -- HHHHHMM scale: 7 categories x 10 max
    notes TEXT,

    -- Who assessed
    assessed_by UUID REFERENCES profiles(id),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA CLINICAL COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 04_schema_medical.sql
-- =============================================================================

-- =============================================================================
-- 04_SCHEMA_MEDICAL.SQL
-- =============================================================================
-- Medical records, prescriptions, voice notes, and DICOM images.
-- =============================================================================

-- =============================================================================
-- A. MEDICAL RECORDS
-- =============================================================================
-- General medical history entries for pets.

CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    performed_by UUID REFERENCES profiles(id),

    -- Record Details
    type TEXT NOT NULL CHECK (type IN (
        'consultation', 'exam', 'surgery', 'hospitalization', 'wellness', 'other'
    )),
    title TEXT NOT NULL,
    diagnosis TEXT,
    diagnosis_code UUID REFERENCES diagnosis_codes(id),  -- Link to standardized code
    visit_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,

    -- Vitals (JSONB for flexibility)
    vitals JSONB,                           -- { weight, temp, hr, rr, bp }

    -- Attachments
    attachments TEXT[],                     -- Array of file URLs

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. PRESCRIPTIONS
-- =============================================================================
-- Digital prescriptions with drugs array and digital signature.

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES profiles(id),            -- Prescribing vet

    -- Prescription Content
    drugs JSONB NOT NULL DEFAULT '[]'::jsonb,       -- Array of drug objects
    notes TEXT,

    -- Digital Signature
    digital_signature_hash TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),

    -- QR Code for verification
    qr_code_url TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- C. VOICE NOTES
-- =============================================================================
-- Audio dictation with optional transcription.

CREATE TABLE IF NOT EXISTS voice_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Content
    note_text TEXT,                         -- Transcribed text
    audio_url TEXT,                         -- Storage URL

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. DICOM IMAGES
-- =============================================================================
-- Medical imaging (X-rays, ultrasounds, etc.)

CREATE TABLE IF NOT EXISTS dicom_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Image Details
    image_oid TEXT NOT NULL,                -- Object identifier or storage path
    modality TEXT,                          -- 'XR', 'US', 'CT', 'MRI'
    body_part TEXT,
    taken_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA MEDICAL COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 06_schema_appointments.sql
-- =============================================================================

-- =============================================================================
-- 06_SCHEMA_APPOINTMENTS.SQL
-- =============================================================================
-- Appointment booking and scheduling system.
-- =============================================================================

-- =============================================================================
-- A. APPOINTMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES profiles(id),            -- Assigned/requested vet

    -- Scheduling
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Appointment Details
    reason TEXT NOT NULL,                           -- 'Vaccination', 'Checkup', etc.
    notes TEXT,                                     -- Internal notes for staff

    -- Status Workflow
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),

    -- Audit
    created_by UUID REFERENCES auth.users(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT appointments_dates_order CHECK (end_time > start_time)
);

-- =============================================================================
-- SCHEMA APPOINTMENTS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 07_schema_inventory.sql
-- =============================================================================

-- =============================================================================
-- 07_SCHEMA_INVENTORY.SQL
-- =============================================================================
-- Store and inventory management system:
-- - Product catalog
-- - Stock levels with weighted average cost
-- - Transaction ledger
-- - Campaigns/promotions
-- - Price history
-- =============================================================================

-- =============================================================================
-- A. STORE CATEGORIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,                     -- URL-friendly name
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One slug per tenant
    UNIQUE(tenant_id, slug)
);

-- =============================================================================
-- B. STORE PRODUCTS (Catalog)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,

    -- Identification
    sku TEXT,                               -- Stock Keeping Unit
    barcode TEXT,

    -- Product Info
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    -- Pricing
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One SKU per tenant
    UNIQUE(tenant_id, sku)
);

-- =============================================================================
-- C. STORE INVENTORY (Current Stock Levels)
-- =============================================================================
-- Tracks current quantity and weighted average cost per product.

CREATE TABLE IF NOT EXISTS store_inventory (
    product_id UUID PRIMARY KEY REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Stock
    stock_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,    -- Numeric for fractional units
    min_stock_level NUMERIC(12,2) DEFAULT 0,            -- Reorder point

    -- Costing
    weighted_average_cost NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Expiry Tracking
    expiry_date DATE,
    batch_number TEXT,
    supplier_name TEXT,

    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. STORE INVENTORY TRANSACTIONS (Ledger)
-- =============================================================================
-- Immutable transaction log for stock movements.

CREATE TABLE IF NOT EXISTS store_inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Transaction Details
    type TEXT NOT NULL CHECK (type IN (
        'purchase', 'sale', 'adjustment', 'return', 'damage', 'theft', 'expired'
    )),
    quantity NUMERIC(12,2) NOT NULL,        -- Positive = add, Negative = remove
    unit_cost NUMERIC(12,2),                -- Cost per unit at time of transaction

    -- Reference
    reference_id UUID,                      -- Link to order/invoice
    notes TEXT,

    -- Audit
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. STORE CAMPAIGNS (Promotions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Campaign Info
    name TEXT NOT NULL,
    description TEXT,

    -- Duration
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Validate dates
    CONSTRAINT store_campaigns_dates CHECK (end_date > start_date)
);

-- =============================================================================
-- F. STORE CAMPAIGN ITEMS
-- =============================================================================
-- Products included in a campaign with their discounts.

CREATE TABLE IF NOT EXISTS store_campaign_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES store_campaigns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Discount
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(12,2) NOT NULL,

    -- One product per campaign
    UNIQUE(campaign_id, product_id)
);

-- =============================================================================
-- G. STORE PRICE HISTORY
-- =============================================================================
-- Tracks all price changes for audit/analytics.

CREATE TABLE IF NOT EXISTS store_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Price Change
    old_price NUMERIC(12,2),
    new_price NUMERIC(12,2) NOT NULL,

    -- Audit
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- H. LEGACY PRODUCTS TABLE (for backwards compatibility)
-- =============================================================================
-- Simple products table used in earlier versions.

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA INVENTORY COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 08_schema_finance.sql
-- =============================================================================

-- =============================================================================
-- 08_SCHEMA_FINANCE.SQL
-- =============================================================================
-- Financial management: expenses and loyalty programs.
-- =============================================================================

-- =============================================================================
-- A. EXPENSES
-- =============================================================================
-- Track clinic operational expenses.

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT NOT NULL REFERENCES tenants(id),

    -- Expense Details
    category TEXT NOT NULL CHECK (category IN (
        'rent', 'utilities', 'supplies', 'payroll', 'marketing', 'software', 'other'
    )),
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Proof
    proof_url TEXT,                         -- Receipt image

    -- Audit
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. LOYALTY POINTS (Balance)
-- =============================================================================
-- Current loyalty points balance per user.

CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Balance
    points INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One balance per user
    UNIQUE(user_id)
);

-- =============================================================================
-- C. LOYALTY TRANSACTIONS (Ledger)
-- =============================================================================
-- Immutable log of all points earned/spent.

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT REFERENCES tenants(id),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,

    -- Transaction
    points INTEGER NOT NULL,                -- Positive = earn, Negative = spend
    description TEXT,                       -- e.g., 'Vaccine Reward', 'Redeemed for Shampoo'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA FINANCE COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 09_schema_safety.sql
-- =============================================================================

-- =============================================================================
-- 09_SCHEMA_SAFETY.SQL
-- =============================================================================
-- Pet safety features: QR codes for collars and lost & found registry.
-- =============================================================================

-- =============================================================================
-- A. PET QR CODES
-- =============================================================================
-- Digital QR codes for pet identification (different from physical qr_tags).
-- Stored in Supabase Storage with metadata here.

CREATE TABLE IF NOT EXISTS pet_qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- QR Code
    qr_code_url TEXT NOT NULL,              -- Storage URL
    qr_data TEXT NOT NULL,                  -- JSON payload with pet ID + emergency contact

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Only one active QR per pet
    CONSTRAINT pet_qr_codes_one_active UNIQUE(pet_id, is_active)
);

-- =============================================================================
-- B. LOST PETS REGISTRY
-- =============================================================================
-- Public registry for lost and found pets.

CREATE TABLE IF NOT EXISTS lost_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Reporter
    reported_by UUID NOT NULL REFERENCES profiles(id),

    -- Status
    status TEXT DEFAULT 'lost'
        CHECK (status IN ('lost', 'found', 'reunited')),

    -- Last Seen Info
    last_seen_location TEXT,
    last_seen_date DATE,
    last_seen_time TIME,

    -- Finder Info (when status = 'found')
    finder_contact TEXT,
    finder_notes TEXT,

    -- Notes
    notes TEXT,

    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA SAFETY COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 10_schema_epidemiology.sql
-- =============================================================================

-- =============================================================================
-- 10_SCHEMA_EPIDEMIOLOGY.SQL
-- =============================================================================
-- Public health intelligence: disease tracking, outbreak mapping, and audit logs.
-- =============================================================================

-- =============================================================================
-- A. DISEASE REPORTS
-- =============================================================================
-- Anonymized disease reports for epidemiological analysis.

CREATE TABLE IF NOT EXISTS disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    diagnosis_code_id UUID REFERENCES diagnosis_codes(id),

    -- Anonymized Pet Data
    species TEXT NOT NULL,
    age_months INTEGER,
    is_vaccinated BOOLEAN,

    -- Location (zone, not exact address)
    location_zone TEXT,                     -- City/neighborhood

    -- Report Details
    reported_date DATE NOT NULL,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. AUDIT LOGS
-- =============================================================================
-- Security and compliance audit trail.

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    user_id UUID REFERENCES profiles(id),

    -- Action Details
    action TEXT NOT NULL,                   -- 'LOGIN', 'VIEW_PATIENT', 'DELETE_RX'
    resource TEXT,                          -- 'patients/123', 'prescriptions/456'
    details JSONB,                          -- Additional metadata

    -- Request Info
    ip_address TEXT,
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA EPIDEMIOLOGY COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 11_indexes.sql
-- =============================================================================

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



-- =============================================================================
-- FILE: 12_functions.sql
-- =============================================================================

-- =============================================================================
-- 12_FUNCTIONS.SQL
-- =============================================================================
-- Utility functions used across the application.
-- =============================================================================

-- =============================================================================
-- A. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
-- Automatically updates the updated_at column on row modification.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- B. IS_STAFF_OF (Authorization Helper)
-- =============================================================================
-- Checks if the current user is a staff member (vet/admin) of a given tenant.
-- Used in RLS policies for row-level security.

CREATE OR REPLACE FUNCTION public.is_staff_of(in_tenant_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND tenant_id = in_tenant_id
        AND role IN ('vet', 'admin')
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- C. HANDLE_NEW_USER (Auth Trigger)
-- =============================================================================
-- Creates a profile when a new user signs up.
-- Uses invite table to determine role and tenant.
--
-- BEHAVIOR:
-- - If user has an invite: Use invite's tenant_id and role
-- - If user has no invite: Create profile with NULL tenant_id (app handles assignment)
-- - Pet owners without invites must be assigned to a tenant via the app
--
-- NOTE: Previously defaulted to 'adris' which was problematic for multi-tenancy.
-- Now requires explicit tenant assignment through invites or app logic.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    invite_record RECORD;
    v_tenant_id TEXT;
    v_role TEXT;
BEGIN
    -- Look for invite
    SELECT tenant_id, role INTO invite_record
    FROM public.clinic_invites
    WHERE email = NEW.email
    LIMIT 1;

    -- Determine tenant and role
    IF invite_record.tenant_id IS NOT NULL THEN
        -- User was invited to a specific clinic
        v_tenant_id := invite_record.tenant_id;
        v_role := COALESCE(invite_record.role, 'owner');

        -- Clean up used invite
        DELETE FROM public.clinic_invites WHERE email = NEW.email;
    ELSE
        -- No invite - check if this is a known demo/test account
        -- This allows seed scripts to work without requiring invites for demo users
        IF NEW.email IN ('admin@demo.com', 'vet@demo.com', 'owner@demo.com', 'owner2@demo.com') THEN
            v_tenant_id := 'adris';
            v_role := CASE
                WHEN NEW.email = 'admin@demo.com' THEN 'admin'
                WHEN NEW.email = 'vet@demo.com' THEN 'vet'
                ELSE 'owner'
            END;
        ELSIF NEW.email IN ('vet@petlife.com', 'admin@petlife.com') THEN
            v_tenant_id := 'petlife';
            v_role := CASE
                WHEN NEW.email = 'admin@petlife.com' THEN 'admin'
                ELSE 'vet'
            END;
        ELSE
            -- Unknown user without invite - profile created with NULL tenant
            -- App must handle tenant assignment (e.g., during booking flow)
            v_tenant_id := NULL;
            v_role := 'owner';
        END IF;
    END IF;

    -- Create profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url, tenant_id, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        v_tenant_id,
        v_role
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- D. PROTECT_CRITICAL_PROFILE_COLUMNS (Security)
-- =============================================================================
-- Prevents users from modifying their own role or tenant_id.

CREATE OR REPLACE FUNCTION public.protect_critical_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Only service_role can modify role or tenant_id
    IF (current_user NOT IN ('postgres', 'service_role')) THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.tenant_id IS DISTINCT FROM OLD.tenant_id) THEN
            RAISE EXCEPTION 'You are not authorized to change role or tenant_id.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- E. HANDLE_NEW_PET_VACCINES (Auto-assign vaccines)
-- =============================================================================
-- Creates pending vaccine records based on templates when a pet is registered.

CREATE OR REPLACE FUNCTION public.handle_new_pet_vaccines()
RETURNS TRIGGER AS $$
DECLARE
    template RECORD;
BEGIN
    FOR template IN
        SELECT * FROM vaccine_templates WHERE species = LOWER(NEW.species)
    LOOP
        INSERT INTO vaccines (pet_id, name, status)
        VALUES (NEW.id, template.vaccine_name, 'pending');
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- F. PROCESS_INVENTORY_TRANSACTION (WAC Calculation)
-- =============================================================================
-- Updates stock and weighted average cost after inventory transactions.

CREATE OR REPLACE FUNCTION public.process_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
    current_stock NUMERIC;
    current_wac NUMERIC;
    new_stock NUMERIC;
    new_wac NUMERIC;
BEGIN
    -- Get current values (with lock)
    SELECT stock_quantity, weighted_average_cost INTO current_stock, current_wac
    FROM store_inventory
    WHERE product_id = NEW.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Initialize inventory if missing
        INSERT INTO store_inventory (product_id, tenant_id, stock_quantity, weighted_average_cost)
        VALUES (NEW.product_id, NEW.tenant_id, 0, 0)
        RETURNING stock_quantity, weighted_average_cost INTO current_stock, current_wac;
    END IF;

    -- Calculate new stock
    new_stock := current_stock + NEW.quantity;

    -- Calculate WAC only for additions
    IF NEW.quantity > 0 AND NEW.unit_cost IS NOT NULL AND NEW.unit_cost > 0 THEN
        IF new_stock > 0 THEN
            new_wac := ((current_stock * current_wac) + (NEW.quantity * NEW.unit_cost)) / new_stock;
        ELSE
            new_wac := NEW.unit_cost;
        END IF;
    ELSE
        new_wac := current_wac;
    END IF;

    -- Update inventory
    UPDATE store_inventory
    SET stock_quantity = new_stock,
        weighted_average_cost = new_wac,
        updated_at = NOW()
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- G. TRACK_PRICE_CHANGE (Audit)
-- =============================================================================
-- Records price changes in history table.

CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.base_price IS DISTINCT FROM NEW.base_price) THEN
        INSERT INTO store_price_history (tenant_id, product_id, old_price, new_price, changed_at)
        VALUES (NEW.tenant_id, NEW.id, OLD.base_price, NEW.base_price, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. CREATE_DISEASE_REPORT (Epidemiology)
-- =============================================================================
-- Auto-creates disease reports from medical records with diagnosis codes.

CREATE OR REPLACE FUNCTION public.create_disease_report()
RETURNS TRIGGER AS $$
DECLARE
    v_location_zone TEXT;
    v_age_months INTEGER;
    v_is_vaccinated BOOLEAN;
BEGIN
    -- Only create report if diagnosis code is set
    IF NEW.diagnosis_code IS NOT NULL THEN
        -- Fetch anonymized data
        SELECT
            pr.city,
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) * 12 +
            EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.birth_date)),
            EXISTS(SELECT 1 FROM vaccines v WHERE v.pet_id = p.id AND v.status = 'verified')
        INTO v_location_zone, v_age_months, v_is_vaccinated
        FROM pets p
        JOIN profiles pr ON p.owner_id = pr.id
        WHERE p.id = NEW.pet_id;

        -- Insert disease report
        INSERT INTO disease_reports (
            tenant_id, diagnosis_code_id, species, reported_date,
            location_zone, severity, age_months, is_vaccinated
        )
        SELECT
            p.tenant_id,
            NEW.diagnosis_code,
            p.species,
            COALESCE(NEW.visit_date, CURRENT_DATE),
            v_location_zone,
            CASE
                WHEN NEW.notes ILIKE '%grave%' OR NEW.notes ILIKE '%severo%' THEN 'severe'
                WHEN NEW.notes ILIKE '%moderado%' THEN 'moderate'
                ELSE 'mild'
            END,
            v_age_months,
            v_is_vaccinated
        FROM pets p
        WHERE p.id = NEW.pet_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- I. LOG_ACTION (Audit Helper)
-- =============================================================================
-- Helper function for audit logging.

CREATE OR REPLACE FUNCTION public.log_action(
    p_tenant_id TEXT,
    p_user_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_details JSONB
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_logs (tenant_id, user_id, action, resource, details)
    VALUES (p_tenant_id, p_user_id, p_action, p_resource, p_details)
    RETURNING id INTO log_id;
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- J. IMPORT_INVENTORY_BATCH (Bulk Import)
-- =============================================================================
-- Atomic bulk import for inventory from Excel/CSV.
-- Supports comprehensive fields: barcode, min_stock_level, expiry_date,
-- batch_number, supplier_name, and is_active status.

CREATE OR REPLACE FUNCTION public.import_inventory_batch(
    p_tenant_id TEXT,
    p_performer_id UUID,
    p_rows JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_row JSONB;
    v_success_count INT := 0;
    v_error_list TEXT[] := ARRAY[]::TEXT[];
    v_product_id UUID;
    v_cat_id UUID;
    v_sku TEXT;
    v_name TEXT;
    v_cat_name TEXT;
    v_slug TEXT;
    v_price NUMERIC;
    v_qty NUMERIC;
    v_cost NUMERIC;
    v_op TEXT;
    v_description TEXT;
    v_barcode TEXT;
    v_min_stock NUMERIC;
    v_expiry_date DATE;
    v_batch_number TEXT;
    v_supplier_name TEXT;
    v_is_active BOOLEAN;
    v_old_qty NUMERIC;
    v_old_cost NUMERIC;
    v_new_wac NUMERIC;
BEGIN
    FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows)
    LOOP
        BEGIN
            -- Extract all fields from row
            v_op := LOWER(TRIM(v_row->>'operation'));
            v_sku := TRIM(v_row->>'sku');
            v_name := TRIM(v_row->>'name');
            v_cat_name := TRIM(v_row->>'category');
            v_price := COALESCE((v_row->>'price')::NUMERIC, 0);
            v_qty := COALESCE((v_row->>'quantity')::NUMERIC, 0);
            v_cost := COALESCE((v_row->>'cost')::NUMERIC, 0);
            v_description := v_row->>'description';
            v_barcode := NULLIF(TRIM(v_row->>'barcode'), '');
            v_min_stock := COALESCE((v_row->>'min_stock_level')::NUMERIC, 0);
            v_batch_number := NULLIF(TRIM(v_row->>'batch_number'), '');
            v_supplier_name := NULLIF(TRIM(v_row->>'supplier_name'), '');
            v_is_active := COALESCE((v_row->>'is_active')::BOOLEAN, TRUE);

            -- Parse expiry date
            v_expiry_date := NULL;
            IF v_row->>'expiry_date' IS NOT NULL AND TRIM(v_row->>'expiry_date') <> '' THEN
                BEGIN
                    v_expiry_date := (v_row->>'expiry_date')::DATE;
                EXCEPTION WHEN OTHERS THEN
                    v_expiry_date := NULL;
                END;
            END IF;

            -- Skip empty rows or instruction rows
            IF v_op = '' AND v_sku = '' AND v_name = '' THEN
                CONTINUE;
            END IF;

            -- Create/Update Category
            v_cat_id := NULL;
            IF v_cat_name IS NOT NULL AND v_cat_name <> '' THEN
                v_slug := LOWER(REGEXP_REPLACE(v_cat_name, '\s+', '-', 'g'));
                INSERT INTO store_categories (tenant_id, name, slug)
                VALUES (p_tenant_id, v_cat_name, v_slug)
                ON CONFLICT (tenant_id, slug) DO UPDATE SET name = v_cat_name
                RETURNING id INTO v_cat_id;
            END IF;

            -- Product Logic
            IF v_op = 'new product' OR v_sku IS NULL OR v_sku = '' THEN
                -- Create new product
                INSERT INTO store_products (
                    tenant_id,
                    category_id,
                    sku,
                    name,
                    description,
                    base_price,
                    barcode,
                    is_active
                )
                VALUES (
                    p_tenant_id,
                    v_cat_id,
                    COALESCE(NULLIF(v_sku, ''), 'AUTO_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || v_success_count),
                    v_name,
                    v_description,
                    v_price,
                    v_barcode,
                    v_is_active
                )
                RETURNING id INTO v_product_id;

                -- Create inventory record for new product
                INSERT INTO store_inventory (
                    product_id,
                    tenant_id,
                    stock_quantity,
                    min_stock_level,
                    weighted_average_cost,
                    expiry_date,
                    batch_number,
                    supplier_name
                )
                VALUES (
                    v_product_id,
                    p_tenant_id,
                    v_qty,
                    v_min_stock,
                    CASE WHEN v_cost > 0 THEN v_cost ELSE 0 END,
                    v_expiry_date,
                    v_batch_number,
                    v_supplier_name
                );

                -- Log initial stock as purchase if qty > 0
                IF v_qty > 0 THEN
                    INSERT INTO store_inventory_transactions (
                        tenant_id, product_id, type, quantity, unit_cost, performed_by, notes
                    )
                    VALUES (
                        p_tenant_id, v_product_id, 'purchase', v_qty, v_cost, p_performer_id, 'Stock inicial - Importación'
                    );
                END IF;

            ELSE
                -- Find existing product
                SELECT id INTO v_product_id FROM store_products
                WHERE tenant_id = p_tenant_id AND sku = v_sku;

                IF NOT FOUND THEN
                    RAISE EXCEPTION 'SKU % no encontrado', v_sku;
                END IF;

                -- Update product fields if provided
                IF v_name IS NOT NULL AND v_name <> '' THEN
                    UPDATE store_products
                    SET
                        name = v_name,
                        category_id = COALESCE(v_cat_id, category_id),
                        description = COALESCE(NULLIF(v_description, ''), description),
                        barcode = COALESCE(v_barcode, barcode),
                        is_active = v_is_active,
                        updated_at = NOW()
                    WHERE id = v_product_id;
                END IF;

                -- Update price if Price Update operation
                IF v_price > 0 AND v_op LIKE '%price%' THEN
                    UPDATE store_products SET base_price = v_price, updated_at = NOW() WHERE id = v_product_id;
                END IF;

                -- Ensure inventory record exists
                INSERT INTO store_inventory (product_id, tenant_id, stock_quantity, weighted_average_cost)
                VALUES (v_product_id, p_tenant_id, 0, 0)
                ON CONFLICT (product_id) DO NOTHING;

                -- Update inventory metadata if provided
                IF v_min_stock > 0 OR v_expiry_date IS NOT NULL OR v_batch_number IS NOT NULL OR v_supplier_name IS NOT NULL THEN
                    UPDATE store_inventory
                    SET
                        min_stock_level = CASE WHEN v_min_stock > 0 THEN v_min_stock ELSE min_stock_level END,
                        expiry_date = COALESCE(v_expiry_date, expiry_date),
                        batch_number = COALESCE(v_batch_number, batch_number),
                        supplier_name = COALESCE(v_supplier_name, supplier_name),
                        updated_at = NOW()
                    WHERE product_id = v_product_id;
                END IF;
            END IF;

            -- Process Inventory Transaction (if qty != 0 or it's a purchase)
            IF v_qty <> 0 OR v_op LIKE '%purchase%' THEN
                -- Get current inventory state
                SELECT stock_quantity, weighted_average_cost
                INTO v_old_qty, v_old_cost
                FROM store_inventory
                WHERE product_id = v_product_id;

                v_old_qty := COALESCE(v_old_qty, 0);
                v_old_cost := COALESCE(v_old_cost, 0);

                -- Calculate new weighted average cost for purchases
                IF v_op LIKE '%purchase%' AND v_qty > 0 AND v_cost > 0 THEN
                    IF (v_old_qty + v_qty) > 0 THEN
                        v_new_wac := ((v_old_qty * v_old_cost) + (v_qty * v_cost)) / (v_old_qty + v_qty);
                    ELSE
                        v_new_wac := v_cost;
                    END IF;
                ELSE
                    v_new_wac := v_old_cost;
                END IF;

                -- Update inventory
                UPDATE store_inventory
                SET
                    stock_quantity = stock_quantity + v_qty,
                    weighted_average_cost = v_new_wac,
                    expiry_date = COALESCE(v_expiry_date, expiry_date),
                    batch_number = COALESCE(v_batch_number, batch_number),
                    supplier_name = COALESCE(v_supplier_name, supplier_name),
                    updated_at = NOW()
                WHERE product_id = v_product_id;

                -- Log transaction
                INSERT INTO store_inventory_transactions (
                    tenant_id, product_id, type, quantity, unit_cost, performed_by, notes
                )
                VALUES (
                    p_tenant_id, v_product_id,
                    CASE
                        WHEN v_op LIKE '%purchase%' THEN 'purchase'
                        WHEN v_op LIKE '%sale%' THEN 'sale'
                        WHEN v_op LIKE '%damage%' THEN 'damage'
                        WHEN v_op LIKE '%theft%' THEN 'theft'
                        WHEN v_op LIKE '%expired%' THEN 'expired'
                        WHEN v_op LIKE '%return%' THEN 'return'
                        ELSE 'adjustment'
                    END,
                    v_qty,
                    CASE WHEN v_cost > 0 THEN v_cost ELSE NULL END,
                    p_performer_id,
                    'Importación masiva'
                );
            END IF;

            v_success_count := v_success_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_error_list := ARRAY_APPEND(v_error_list, 'Fila ' || (v_success_count + 1) || ' (SKU: ' || COALESCE(v_sku, 'N/A') || '): ' || SQLERRM);
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'success_count', v_success_count,
        'errors', v_error_list
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTIONS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 13_triggers.sql
-- =============================================================================

-- =============================================================================
-- 13_TRIGGERS.SQL
-- =============================================================================
-- All database triggers.
-- =============================================================================

-- =============================================================================
-- A. UPDATED_AT TRIGGERS
-- =============================================================================
-- Automatically maintain updated_at columns.

-- Core Tables
DROP TRIGGER IF EXISTS set_updated_at_tenants ON tenants;
CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Pet Tables
DROP TRIGGER IF EXISTS set_updated_at_pets ON pets;
CREATE TRIGGER set_updated_at_pets
    BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_vaccines ON vaccines;
CREATE TRIGGER set_updated_at_vaccines
    BEFORE UPDATE ON vaccines
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_qr_tags ON qr_tags;
CREATE TRIGGER set_updated_at_qr_tags
    BEFORE UPDATE ON qr_tags
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Medical Tables
DROP TRIGGER IF EXISTS set_updated_at_medical_records ON medical_records;
CREATE TRIGGER set_updated_at_medical_records
    BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_prescriptions ON prescriptions;
CREATE TRIGGER set_updated_at_prescriptions
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_diagnosis_codes ON diagnosis_codes;
CREATE TRIGGER set_updated_at_diagnosis_codes
    BEFORE UPDATE ON diagnosis_codes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Clinical Tables
DROP TRIGGER IF EXISTS set_updated_at_reproductive_cycles ON reproductive_cycles;
CREATE TRIGGER set_updated_at_reproductive_cycles
    BEFORE UPDATE ON reproductive_cycles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Appointments
DROP TRIGGER IF EXISTS set_updated_at_appointments ON appointments;
CREATE TRIGGER set_updated_at_appointments
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Inventory Tables
DROP TRIGGER IF EXISTS set_updated_at_store_categories ON store_categories;
CREATE TRIGGER set_updated_at_store_categories
    BEFORE UPDATE ON store_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_store_products ON store_products;
CREATE TRIGGER set_updated_at_store_products
    BEFORE UPDATE ON store_products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_store_campaigns ON store_campaigns;
CREATE TRIGGER set_updated_at_store_campaigns
    BEFORE UPDATE ON store_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_products ON products;
CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Safety Tables
DROP TRIGGER IF EXISTS set_updated_at_pet_qr_codes ON pet_qr_codes;
CREATE TRIGGER set_updated_at_pet_qr_codes
    BEFORE UPDATE ON pet_qr_codes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- B. AUTH TRIGGER
-- =============================================================================
-- Create profile on user signup.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- C. SECURITY TRIGGER
-- =============================================================================
-- Prevent unauthorized changes to critical profile columns.

DROP TRIGGER IF EXISTS protect_profile_changes ON profiles;
CREATE TRIGGER protect_profile_changes
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_critical_profile_columns();

-- =============================================================================
-- D. PET VACCINE TRIGGER
-- =============================================================================
-- Auto-create pending vaccines when a pet is registered.

DROP TRIGGER IF EXISTS on_pet_created_add_vaccines ON pets;
CREATE TRIGGER on_pet_created_add_vaccines
    AFTER INSERT ON pets
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_pet_vaccines();

-- =============================================================================
-- E. INVENTORY TRIGGER
-- =============================================================================
-- Update stock and WAC on inventory transactions.

DROP TRIGGER IF EXISTS on_inventory_transaction ON store_inventory_transactions;
CREATE TRIGGER on_inventory_transaction
    AFTER INSERT ON store_inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION public.process_inventory_transaction();

-- =============================================================================
-- F. PRICE HISTORY TRIGGER
-- =============================================================================
-- Track price changes.

DROP TRIGGER IF EXISTS on_price_change ON store_products;
CREATE TRIGGER on_price_change
    AFTER UPDATE ON store_products
    FOR EACH ROW EXECUTE FUNCTION public.track_price_change();

-- =============================================================================
-- G. EPIDEMIOLOGY TRIGGER
-- =============================================================================
-- Auto-create disease reports from medical records.

DROP TRIGGER IF EXISTS auto_disease_report ON medical_records;
CREATE TRIGGER auto_disease_report
    AFTER INSERT ON medical_records
    FOR EACH ROW EXECUTE FUNCTION public.create_disease_report();

-- =============================================================================
-- TRIGGERS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 14_rls_policies.sql
-- =============================================================================

-- =============================================================================
-- 14_RLS_POLICIES.SQL
-- =============================================================================
-- Row Level Security policies for all tables.
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_patient_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dicom_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_dosages ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproductive_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE euthanasia_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_campaign_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- A. TENANTS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated can view tenants" ON tenants;
CREATE POLICY "Authenticated can view tenants" ON tenants
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- B. PROFILES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all profiles in tenant" ON profiles;
CREATE POLICY "Staff can view all profiles in tenant" ON profiles
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view profile of pet owner with active QR" ON profiles;
CREATE POLICY "Public can view profile of pet owner with active QR" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            JOIN pet_qr_codes ON pet_qr_codes.pet_id = pets.id
            WHERE pets.owner_id = profiles.id
            AND pet_qr_codes.is_active = TRUE
        )
    );

-- =============================================================================
-- C. CLINIC INVITES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Admins manage invites" ON clinic_invites;
CREATE POLICY "Admins manage invites" ON clinic_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
            AND tenant_id = clinic_invites.tenant_id
        )
    );

-- =============================================================================
-- D. PETS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can access own pets" ON pets;
CREATE POLICY "Owners can access own pets" ON pets
    FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Staff can access all pets in tenant" ON pets;
CREATE POLICY "Staff can access all pets in tenant" ON pets
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Owners can modify own pets" ON pets;
CREATE POLICY "Owners can modify own pets" ON pets
    FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Staff can modify all pets in tenant" ON pets;
CREATE POLICY "Staff can modify all pets in tenant" ON pets
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Public can view pets with active QR codes" ON pets;
CREATE POLICY "Public can view pets with active QR codes" ON pets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pet_qr_codes
            WHERE pet_qr_codes.pet_id = pets.id
            AND pet_qr_codes.is_active = TRUE
        )
    );

-- =============================================================================
-- E. VACCINE TEMPLATES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can read vaccine templates" ON vaccine_templates;
CREATE POLICY "Public can read vaccine templates" ON vaccine_templates
    FOR SELECT USING (TRUE);

-- =============================================================================
-- F. VACCINES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can access pet vaccines" ON vaccines;
CREATE POLICY "Owners can access pet vaccines" ON vaccines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccines.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage vaccines" ON vaccines;
CREATE POLICY "Staff can manage vaccines" ON vaccines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccines.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

DROP POLICY IF EXISTS "Owners can modify own pet vaccines" ON vaccines;
CREATE POLICY "Owners can modify own pet vaccines" ON vaccines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccines.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

-- =============================================================================
-- G. VACCINE REACTIONS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view vaccine reactions" ON vaccine_reactions;
CREATE POLICY "Owners can view vaccine reactions" ON vaccine_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccine_reactions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can insert vaccine reactions" ON vaccine_reactions;
CREATE POLICY "Owners can insert vaccine reactions" ON vaccine_reactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccine_reactions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage vaccine reactions" ON vaccine_reactions;
CREATE POLICY "Staff can manage vaccine reactions" ON vaccine_reactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = vaccine_reactions.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- H. QR TAGS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can view tags" ON qr_tags;
CREATE POLICY "Public can view tags" ON qr_tags
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Owner or staff can update tags" ON qr_tags;
CREATE POLICY "Owner or staff can update tags" ON qr_tags
    FOR UPDATE USING (
        pet_id IS NULL  -- Unassigned can be claimed
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = qr_tags.pet_id
            AND (pets.owner_id = auth.uid() OR public.is_staff_of(pets.tenant_id))
        )
    );

-- =============================================================================
-- I. CLINIC PATIENT ACCESS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can manage access" ON clinic_patient_access;
CREATE POLICY "Staff can manage access" ON clinic_patient_access
    FOR ALL USING (public.is_staff_of(clinic_id));

-- =============================================================================
-- J. MEDICAL RECORDS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view own pet records" ON medical_records;
CREATE POLICY "Owners can view own pet records" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = medical_records.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage medical records" ON medical_records;
CREATE POLICY "Staff can manage medical records" ON medical_records
    FOR ALL USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- K. PRESCRIPTIONS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view prescriptions" ON prescriptions;
CREATE POLICY "Owners can view prescriptions" ON prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = prescriptions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage prescriptions" ON prescriptions;
CREATE POLICY "Staff can manage prescriptions" ON prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = prescriptions.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- L. VOICE NOTES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view voice notes" ON voice_notes;
CREATE POLICY "Owners can view voice notes" ON voice_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = voice_notes.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage voice notes" ON voice_notes;
CREATE POLICY "Staff can manage voice notes" ON voice_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = voice_notes.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- M. DICOM IMAGES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view dicom images" ON dicom_images;
CREATE POLICY "Owners can view dicom images" ON dicom_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = dicom_images.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage dicom images" ON dicom_images;
CREATE POLICY "Staff can manage dicom images" ON dicom_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = dicom_images.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- N. REFERENCE DATA POLICIES (Public Read)
-- =============================================================================

DROP POLICY IF EXISTS "Public can read diagnosis codes" ON diagnosis_codes;
CREATE POLICY "Public can read diagnosis codes" ON diagnosis_codes
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can read drug dosages" ON drug_dosages;
CREATE POLICY "Public can read drug dosages" ON drug_dosages
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can read growth standards" ON growth_standards;
CREATE POLICY "Public can read growth standards" ON growth_standards
    FOR SELECT USING (TRUE);

-- =============================================================================
-- O. REPRODUCTIVE CYCLES POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view reproductive cycles" ON reproductive_cycles;
CREATE POLICY "Owners can view reproductive cycles" ON reproductive_cycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = reproductive_cycles.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage reproductive cycles" ON reproductive_cycles;
CREATE POLICY "Staff can manage reproductive cycles" ON reproductive_cycles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = reproductive_cycles.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- P. EUTHANASIA ASSESSMENTS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view euthanasia assessments" ON euthanasia_assessments;
CREATE POLICY "Owners can view euthanasia assessments" ON euthanasia_assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = euthanasia_assessments.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage euthanasia assessments" ON euthanasia_assessments;
CREATE POLICY "Staff can manage euthanasia assessments" ON euthanasia_assessments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = euthanasia_assessments.pet_id
            AND public.is_staff_of(pets.tenant_id)
        )
    );

-- =============================================================================
-- Q. APPOINTMENTS POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view own appointments" ON appointments;
CREATE POLICY "Owners can view own appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = appointments.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can book appointments" ON appointments;
CREATE POLICY "Owners can book appointments" ON appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = appointments.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can cancel own appointments" ON appointments;
CREATE POLICY "Owners can cancel own appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = appointments.pet_id
            AND pets.owner_id = auth.uid()
        )
    ) WITH CHECK (status = 'cancelled');

DROP POLICY IF EXISTS "Staff can view all appointments" ON appointments;
CREATE POLICY "Staff can view all appointments" ON appointments
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
CREATE POLICY "Staff can manage appointments" ON appointments
    FOR ALL USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- R. STORE/INVENTORY POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can manage store categories" ON store_categories;
CREATE POLICY "Staff can manage store categories" ON store_categories
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view store categories" ON store_categories;
CREATE POLICY "Tenant can view store categories" ON store_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = store_categories.tenant_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage store products" ON store_products;
CREATE POLICY "Staff can manage store products" ON store_products
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view store products" ON store_products;
CREATE POLICY "Tenant can view store products" ON store_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = store_products.tenant_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage store inventory" ON store_inventory;
CREATE POLICY "Staff can manage store inventory" ON store_inventory
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage inventory transactions" ON store_inventory_transactions;
CREATE POLICY "Staff can manage inventory transactions" ON store_inventory_transactions
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage store campaigns" ON store_campaigns;
CREATE POLICY "Staff can manage store campaigns" ON store_campaigns
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view store campaigns" ON store_campaigns;
CREATE POLICY "Tenant can view store campaigns" ON store_campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = store_campaigns.tenant_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage campaign items" ON store_campaign_items;
CREATE POLICY "Staff can manage campaign items" ON store_campaign_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM store_campaigns
            WHERE store_campaigns.id = store_campaign_items.campaign_id
            AND public.is_staff_of(store_campaigns.tenant_id)
        )
    );

DROP POLICY IF EXISTS "Staff can view price history" ON store_price_history;
CREATE POLICY "Staff can view price history" ON store_price_history
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage products" ON products;
CREATE POLICY "Staff can manage products" ON products
    FOR ALL USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Tenant can view products" ON products;
CREATE POLICY "Tenant can view products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.tenant_id = products.tenant_id
        )
    );

-- =============================================================================
-- S. FINANCE POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Admins can manage expenses" ON expenses;
CREATE POLICY "Admins can manage expenses" ON expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Staff can view expenses" ON expenses;
CREATE POLICY "Staff can view expenses" ON expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'vet')
        )
    );

DROP POLICY IF EXISTS "Users can view own loyalty points" ON loyalty_points;
CREATE POLICY "Users can view own loyalty points" ON loyalty_points
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage loyalty points" ON loyalty_points;
CREATE POLICY "Staff can manage loyalty points" ON loyalty_points
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('vet', 'admin')
        )
    );

DROP POLICY IF EXISTS "Owners can view loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Owners can view loyalty transactions" ON loyalty_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = loyalty_transactions.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Staff can manage loyalty transactions" ON loyalty_transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- T. SAFETY POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Owners can view own pet QR codes" ON pet_qr_codes;
CREATE POLICY "Owners can view own pet QR codes" ON pet_qr_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_qr_codes.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create QR codes for own pets" ON pet_qr_codes;
CREATE POLICY "Owners can create QR codes for own pets" ON pet_qr_codes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_qr_codes.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage QR codes" ON pet_qr_codes;
CREATE POLICY "Staff can manage QR codes" ON pet_qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN pets pt ON pt.tenant_id = p.tenant_id
            WHERE p.id = auth.uid()
            AND p.role IN ('vet', 'admin')
            AND pt.id = pet_qr_codes.pet_id
        )
    );

DROP POLICY IF EXISTS "Anyone can view active lost pets" ON lost_pets;
CREATE POLICY "Anyone can view active lost pets" ON lost_pets
    FOR SELECT USING (status IN ('lost', 'found'));

DROP POLICY IF EXISTS "Owners can report own pets as lost" ON lost_pets;
CREATE POLICY "Owners can report own pets as lost" ON lost_pets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lost_pets.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can update own lost pet reports" ON lost_pets;
CREATE POLICY "Owners can update own lost pet reports" ON lost_pets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lost_pets.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can update lost pet reports" ON lost_pets;
CREATE POLICY "Staff can update lost pet reports" ON lost_pets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN pets pt ON pt.tenant_id = p.tenant_id
            WHERE p.id = auth.uid()
            AND p.role IN ('vet', 'admin')
            AND pt.id = lost_pets.pet_id
        )
    );

-- =============================================================================
-- U. EPIDEMIOLOGY POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can view disease reports" ON disease_reports;
CREATE POLICY "Staff can view disease reports" ON disease_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 15_rpcs.sql
-- =============================================================================

-- =============================================================================
-- 15_RPCS.SQL
-- =============================================================================
-- Remote Procedure Calls (RPCs) for complex operations.
-- =============================================================================

-- =============================================================================
-- A. GET_CLINIC_STATS
-- =============================================================================
-- Returns dashboard statistics for a clinic.

CREATE OR REPLACE FUNCTION public.get_clinic_stats(clinic_id TEXT)
RETURNS JSON AS $$
DECLARE
    total_pets INT;
    pending_vaccines INT;
    upcoming_appointments INT;
    is_staff BOOLEAN;
BEGIN
    SELECT public.is_staff_of(clinic_id) INTO is_staff;

    IF NOT is_staff THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    SELECT COUNT(*) INTO total_pets
    FROM pets
    WHERE tenant_id = clinic_id;

    SELECT COUNT(*) INTO pending_vaccines
    FROM vaccines v
    JOIN pets p ON v.pet_id = p.id
    WHERE p.tenant_id = clinic_id
    AND v.status = 'pending';

    SELECT COUNT(*) INTO upcoming_appointments
    FROM appointments
    WHERE tenant_id = clinic_id
    AND start_time >= NOW()
    AND status = 'confirmed';

    RETURN json_build_object(
        'pets', total_pets,
        'pending_vaccines', pending_vaccines,
        'upcoming_appointments', upcoming_appointments
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. GET_PET_BY_TAG
-- =============================================================================
-- Public lookup of pet info by QR tag code.

CREATE OR REPLACE FUNCTION public.get_pet_by_tag(tag_code TEXT)
RETURNS JSON AS $$
DECLARE
    tag_record RECORD;
    pet_record RECORD;
    owner_record RECORD;
    vaccine_status TEXT := 'unknown';
BEGIN
    SELECT * INTO tag_record FROM qr_tags WHERE code = tag_code;

    IF tag_record IS NULL THEN
        RETURN json_build_object('status', 'not_found');
    END IF;

    IF tag_record.pet_id IS NULL THEN
        RETURN json_build_object('status', 'unassigned', 'code', tag_code);
    END IF;

    SELECT * INTO pet_record FROM pets WHERE id = tag_record.pet_id;
    SELECT full_name, phone INTO owner_record FROM profiles WHERE id = pet_record.owner_id;

    IF EXISTS (
        SELECT 1 FROM vaccines
        WHERE pet_id = pet_record.id
        AND status = 'verified'
        AND administered_date > (NOW() - INTERVAL '1 year')
    ) THEN
        vaccine_status := 'up_to_date';
    ELSE
        vaccine_status := 'needs_check';
    END IF;

    RETURN json_build_object(
        'status', 'assigned',
        'pet', json_build_object(
            'name', pet_record.name,
            'species', pet_record.species,
            'breed', pet_record.breed,
            'photo_url', pet_record.photo_url,
            'diet_notes', pet_record.diet_notes
        ),
        'owner', json_build_object(
            'name', owner_record.full_name,
            'phone', owner_record.phone
        ),
        'vaccine_status', vaccine_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. ASSIGN_TAG_TO_PET
-- =============================================================================
-- Assigns an unassigned QR tag to a pet.

CREATE OR REPLACE FUNCTION public.assign_tag_to_pet(tag_code TEXT, target_pet_id UUID)
RETURNS JSON AS $$
DECLARE
    tag_record RECORD;
BEGIN
    SELECT * INTO tag_record FROM qr_tags WHERE code = tag_code;

    IF tag_record IS NULL THEN
        RETURN json_build_object('error', 'Tag not found');
    END IF;

    IF tag_record.status != 'unassigned' THEN
        RETURN json_build_object('error', 'Tag already assigned');
    END IF;

    -- Check authorization
    IF NOT EXISTS (
        SELECT 1 FROM pets
        WHERE id = target_pet_id
        AND (owner_id = auth.uid() OR public.is_staff_of(tenant_id))
    ) THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    UPDATE qr_tags
    SET pet_id = target_pet_id, status = 'active', updated_at = NOW()
    WHERE code = tag_code;

    RETURN json_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- D. GET_NETWORK_STATS
-- =============================================================================
-- Public network-wide statistics.

CREATE OR REPLACE FUNCTION public.get_network_stats()
RETURNS JSON AS $$
DECLARE
    total_pets INT;
    total_vaccines INT;
    top_species TEXT;
BEGIN
    SELECT COUNT(*) INTO total_pets FROM pets;
    SELECT COUNT(*) INTO total_vaccines FROM vaccines WHERE status = 'verified';
    SELECT species INTO top_species FROM pets GROUP BY species ORDER BY COUNT(*) DESC LIMIT 1;

    RETURN json_build_object(
        'total_pets', total_pets,
        'total_vaccines', total_vaccines,
        'most_popular_species', top_species
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- E. SEARCH_PETS_GLOBAL
-- =============================================================================
-- Global pet search with privacy protection.

CREATE OR REPLACE FUNCTION public.search_pets_global(search_query TEXT, requesting_clinic_id TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    species TEXT,
    breed TEXT,
    photo_url TEXT,
    microchip_id TEXT,
    tenant_id TEXT,
    owner_name TEXT,
    owner_phone TEXT,
    is_local BOOLEAN,
    has_access BOOLEAN
) AS $$
DECLARE
    is_authorized BOOLEAN;
BEGIN
    -- Verify requester is staff
    SELECT public.is_staff_of(requesting_clinic_id) INTO is_authorized;
    IF NOT is_authorized THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.species,
        p.breed,
        p.photo_url,
        p.microchip_id,
        p.tenant_id,
        CASE
            WHEN (p.tenant_id = requesting_clinic_id OR cpa.id IS NOT NULL) THEN pr.full_name
            ELSE 'Privacy Protected'::TEXT
        END AS owner_name,
        CASE
            WHEN (p.tenant_id = requesting_clinic_id OR cpa.id IS NOT NULL) THEN pr.phone
            ELSE NULL::TEXT
        END AS owner_phone,
        (p.tenant_id = requesting_clinic_id) AS is_local,
        (p.tenant_id = requesting_clinic_id OR cpa.id IS NOT NULL) AS has_access
    FROM pets p
    JOIN profiles pr ON p.owner_id = pr.id
    LEFT JOIN clinic_patient_access cpa ON cpa.pet_id = p.id AND cpa.clinic_id = requesting_clinic_id
    WHERE
        (p.name ILIKE '%' || search_query || '%' OR p.microchip_id ILIKE '%' || search_query || '%')
    ORDER BY is_local DESC, p.name ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- F. GRANT_CLINIC_ACCESS
-- =============================================================================
-- Grants a clinic access to a pet's records.

CREATE OR REPLACE FUNCTION public.grant_clinic_access(target_pet_id UUID, target_clinic_id TEXT)
RETURNS JSON AS $$
BEGIN
    -- Check if already local
    IF EXISTS (SELECT 1 FROM pets WHERE id = target_pet_id AND tenant_id = target_clinic_id) THEN
        RETURN json_build_object('status', 'already_local');
    END IF;

    INSERT INTO clinic_patient_access (clinic_id, pet_id, access_level)
    VALUES (target_clinic_id, target_pet_id, 'write')
    ON CONFLICT (clinic_id, pet_id) DO NOTHING;

    RETURN json_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- G. GET_CLIENT_PET_COUNTS
-- =============================================================================
-- Returns pet counts for a batch of client IDs (optimized aggregation).

CREATE OR REPLACE FUNCTION public.get_client_pet_counts(
    client_ids UUID[],
    p_tenant_id TEXT
)
RETURNS TABLE (
    owner_id UUID,
    pet_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.owner_id,
        COUNT(*)::BIGINT AS pet_count
    FROM pets p
    WHERE p.owner_id = ANY(client_ids)
      AND p.tenant_id = p_tenant_id
      AND p.deleted_at IS NULL
    GROUP BY p.owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- H. GET_CLIENT_LAST_APPOINTMENTS
-- =============================================================================
-- Returns last appointment date for a batch of client IDs (optimized aggregation).

CREATE OR REPLACE FUNCTION public.get_client_last_appointments(
    client_ids UUID[],
    p_tenant_id TEXT
)
RETURNS TABLE (
    owner_id UUID,
    last_appointment TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.owner_id)
        p.owner_id,
        a.start_time AS last_appointment
    FROM appointments a
    JOIN pets p ON a.pet_id = p.id
    WHERE p.owner_id = ANY(client_ids)
      AND a.tenant_id = p_tenant_id
      AND a.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY p.owner_id, a.start_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- RPCS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 16_storage.sql
-- =============================================================================

-- =============================================================================
-- 16_STORAGE.SQL
-- =============================================================================
-- Supabase Storage buckets and policies.
-- =============================================================================

-- =============================================================================
-- A. CREATE STORAGE BUCKETS
-- =============================================================================

-- Vaccines (vaccine photos/certificates)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vaccines', 'vaccines', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Pets (pet photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pets', 'pets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Records (medical attachments)
INSERT INTO storage.buckets (id, name, public)
VALUES ('records', 'records', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Store Products (product images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-products', 'store-products', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Pet QR Codes (generated QR images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-qr-codes', 'pet-qr-codes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Receipts (expense proofs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', FALSE)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- B. VACCINES BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated can upload vaccines" ON storage.objects;
CREATE POLICY "Authenticated can upload vaccines" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'vaccines');

DROP POLICY IF EXISTS "Public can view vaccines" ON storage.objects;
CREATE POLICY "Public can view vaccines" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'vaccines');

-- =============================================================================
-- C. PETS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated can upload pets" ON storage.objects;
CREATE POLICY "Authenticated can upload pets" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'pets');

DROP POLICY IF EXISTS "Public can view pets" ON storage.objects;
CREATE POLICY "Public can view pets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pets');

-- =============================================================================
-- D. RECORDS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can upload records" ON storage.objects;
CREATE POLICY "Staff can upload records" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'records'
        AND public.is_staff_of((SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    );

DROP POLICY IF EXISTS "Public can view records" ON storage.objects;
CREATE POLICY "Public can view records" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'records');

-- =============================================================================
-- E. STORE PRODUCTS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can view store products" ON storage.objects;
CREATE POLICY "Public can view store products" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'store-products');

DROP POLICY IF EXISTS "Staff can upload store products" ON storage.objects;
CREATE POLICY "Staff can upload store products" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'store-products');

DROP POLICY IF EXISTS "Staff can manage store products" ON storage.objects;
CREATE POLICY "Staff can manage store products" ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'store-products');

-- =============================================================================
-- F. PET QR CODES BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can view QR codes" ON storage.objects;
CREATE POLICY "Public can view QR codes" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pet-qr-codes');

DROP POLICY IF EXISTS "Owners can upload QR codes" ON storage.objects;
CREATE POLICY "Owners can upload QR codes" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'pet-qr-codes'
        AND auth.uid() IN (
            SELECT owner_id FROM pets WHERE id::TEXT = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Owners can delete QR codes" ON storage.objects;
CREATE POLICY "Owners can delete QR codes" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'pet-qr-codes'
        AND auth.uid() IN (
            SELECT owner_id FROM pets WHERE id::TEXT = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Staff can manage QR codes" ON storage.objects;
CREATE POLICY "Staff can manage QR codes" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'pet-qr-codes'
        AND EXISTS (
            SELECT 1 FROM profiles p
            JOIN pets pt ON pt.tenant_id = p.tenant_id
            WHERE p.id = auth.uid()
            AND p.role IN ('vet', 'admin')
            AND pt.id::TEXT = (storage.foldername(name))[1]
        )
    );

-- =============================================================================
-- G. RECEIPTS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can manage receipts" ON storage.objects;
CREATE POLICY "Staff can manage receipts" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'receipts'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- STORAGE COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 17_realtime.sql
-- =============================================================================

-- =============================================================================
-- 17_REALTIME.SQL
-- =============================================================================
-- Supabase Realtime subscriptions.
-- =============================================================================

-- =============================================================================
-- A. CREATE REALTIME PUBLICATION
-- =============================================================================
-- Subscribe to changes on these tables for real-time updates.

BEGIN;

DROP PUBLICATION IF EXISTS supabase_realtime;

CREATE PUBLICATION supabase_realtime FOR TABLE
    pets,
    vaccines,
    clinic_invites,
    medical_records,
    appointments,
    qr_tags,
    lost_pets;

COMMIT;

-- =============================================================================
-- B. VIEWS FOR DASHBOARDS
-- =============================================================================

-- Low Stock Products View
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
    p.id,
    p.name,
    p.sku,
    i.stock_quantity,
    i.min_stock_level,
    i.expiry_date,
    i.batch_number,
    p.tenant_id
FROM store_products p
INNER JOIN store_inventory i ON p.id = i.product_id
WHERE i.stock_quantity <= i.min_stock_level
  AND p.is_active = TRUE;

-- Expiring Products View (within 30 days)
CREATE OR REPLACE VIEW expiring_products AS
SELECT
    p.id,
    p.name,
    p.sku,
    i.stock_quantity,
    i.expiry_date,
    i.batch_number,
    p.tenant_id,
    (i.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM store_products p
INNER JOIN store_inventory i ON p.id = i.product_id
WHERE i.expiry_date IS NOT NULL
  AND i.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND i.expiry_date >= CURRENT_DATE
  AND p.is_active = TRUE
ORDER BY i.expiry_date ASC;

-- Public Health Heatmap View
CREATE OR REPLACE VIEW public_health_heatmap AS
SELECT
    dr.diagnosis_code_id,
    dc.code AS diagnosis_code,
    dc.term AS diagnosis_name,
    dr.species,
    dr.location_zone,
    DATE_TRUNC('week', dr.reported_date) AS week,
    COUNT(*) AS case_count,
    AVG(CASE
        WHEN dr.severity = 'mild' THEN 1
        WHEN dr.severity = 'moderate' THEN 2
        WHEN dr.severity = 'severe' THEN 3
    END) AS avg_severity
FROM disease_reports dr
LEFT JOIN diagnosis_codes dc ON dr.diagnosis_code_id = dc.id
WHERE dr.reported_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY dr.diagnosis_code_id, dc.code, dc.term, dr.species, dr.location_zone, DATE_TRUNC('week', dr.reported_date);

-- Grant access to views
GRANT SELECT ON low_stock_products TO authenticated;
GRANT SELECT ON expiring_products TO authenticated;
GRANT SELECT ON public_health_heatmap TO authenticated;

-- =============================================================================
-- REALTIME COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 21_schema_invoicing.sql
-- =============================================================================

-- =============================================================================
-- 21_SCHEMA_INVOICING.SQL
-- =============================================================================
-- Complete invoicing and payment system for veterinary services.
-- Includes: invoices, invoice items, payments, payment methods, and credits.
-- =============================================================================

-- =============================================================================
-- A. SERVICES CATALOG
-- =============================================================================
-- Billable services offered by the clinic.

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Service Details
    code TEXT,                              -- Internal code: 'CONSULT-001'
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,                          -- 'consultation', 'surgery', 'grooming', 'lab', etc.

    -- Pricing
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 10.00,    -- IVA percentage
    is_taxable BOOLEAN DEFAULT TRUE,

    -- Duration (for scheduling)
    duration_minutes INTEGER DEFAULT 30,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- B. PAYMENT METHODS
-- =============================================================================
-- Available payment methods per tenant.

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Method Details
    name TEXT NOT NULL,                     -- 'Efectivo', 'Tarjeta Débito', 'Transferencia'
    type TEXT NOT NULL CHECK (type IN (
        'cash', 'debit_card', 'credit_card', 'bank_transfer',
        'mobile_payment', 'check', 'credit', 'other'
    )),

    -- Processing
    processing_fee_percent NUMERIC(5,2) DEFAULT 0,
    processing_fee_fixed NUMERIC(10,2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default payment methods
INSERT INTO payment_methods (tenant_id, name, type, is_default) VALUES
    ('adris', 'Efectivo', 'cash', TRUE),
    ('adris', 'Tarjeta de Débito', 'debit_card', FALSE),
    ('adris', 'Tarjeta de Crédito', 'credit_card', FALSE),
    ('adris', 'Transferencia Bancaria', 'bank_transfer', FALSE),
    ('petlife', 'Efectivo', 'cash', TRUE),
    ('petlife', 'Tarjeta de Débito', 'debit_card', FALSE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- C. INVOICES
-- =============================================================================
-- Invoice header with totals and status.

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Invoice Number (human-readable, per tenant)
    invoice_number TEXT NOT NULL,

    -- Client & Pet
    client_id UUID NOT NULL REFERENCES profiles(id),
    pet_id UUID REFERENCES pets(id),        -- Optional: can invoice without pet

    -- Related Records
    appointment_id UUID REFERENCES appointments(id),
    medical_record_id UUID REFERENCES medical_records(id),

    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,

    -- Totals (calculated from items)
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Discount
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) DEFAULT 0,
    discount_reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'
    )),

    -- Notes
    notes TEXT,
    internal_notes TEXT,                    -- Staff only

    -- Audit
    created_by UUID REFERENCES profiles(id),
    cancelled_by UUID REFERENCES profiles(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, invoice_number)
);

-- =============================================================================
-- D. INVOICE ITEMS
-- =============================================================================
-- Line items on an invoice (services, products, or custom).

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Item Type
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product', 'custom')),

    -- Reference (based on type)
    service_id UUID REFERENCES services(id),
    product_id UUID REFERENCES store_products(id),

    -- Item Details (copied at time of invoice for historical accuracy)
    description TEXT NOT NULL,

    -- Pricing
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    tax_rate NUMERIC(5,2) DEFAULT 10.00,
    is_taxable BOOLEAN DEFAULT TRUE,

    -- Discount (per item)
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12,2) DEFAULT 0,

    -- Calculated
    subtotal NUMERIC(12,2) NOT NULL,        -- quantity * unit_price - discount
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,           -- subtotal + tax

    -- Order
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. PAYMENTS
-- =============================================================================
-- Individual payment transactions.

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),

    -- Payment Details
    payment_method_id UUID REFERENCES payment_methods(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Reference
    reference_number TEXT,                  -- Check number, transaction ID, etc.

    -- Status
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'failed', 'refunded', 'cancelled'
    )),

    -- Notes
    notes TEXT,

    -- Audit
    received_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. REFUNDS
-- =============================================================================
-- Track refunds separately for clarity.

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    payment_id UUID REFERENCES payments(id),    -- Original payment being refunded

    -- Refund Details
    amount NUMERIC(12,2) NOT NULL,
    refund_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT NOT NULL,

    -- Method
    refund_method TEXT CHECK (refund_method IN (
        'original_method', 'cash', 'bank_transfer', 'credit', 'other'
    )),

    -- Status
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'failed'
    )),

    -- Audit
    processed_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- G. CLIENT CREDITS
-- =============================================================================
-- Store credit / prepaid balance.

CREATE TABLE IF NOT EXISTS client_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    client_id UUID NOT NULL REFERENCES profiles(id),

    -- Credit Details
    amount NUMERIC(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'deposit', 'refund_credit', 'promotional', 'adjustment'
    )),

    -- Reference
    invoice_id UUID REFERENCES invoices(id),
    notes TEXT,

    -- Expiry
    expires_at TIMESTAMPTZ,

    -- Status
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_invoice_id UUID REFERENCES invoices(id),

    -- Audit
    created_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- H. RECURRING INVOICES (Templates)
-- =============================================================================
-- For subscription services or regular treatments.

CREATE TABLE IF NOT EXISTS recurring_invoice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    client_id UUID NOT NULL REFERENCES profiles(id),
    pet_id UUID REFERENCES pets(id),

    -- Template Details
    name TEXT NOT NULL,                     -- 'Monthly Grooming', 'Chronic Medication'

    -- Schedule
    frequency TEXT NOT NULL CHECK (frequency IN (
        'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
    )),
    next_invoice_date DATE NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES recurring_invoice_templates(id) ON DELETE CASCADE,

    -- Item Details
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product', 'custom')),
    service_id UUID REFERENCES services(id),
    product_id UUID REFERENCES store_products(id),
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- I. INVOICE SEQUENCES (Per Tenant)
-- =============================================================================
-- Track invoice numbering per tenant.

CREATE TABLE IF NOT EXISTS invoice_sequences (
    tenant_id TEXT PRIMARY KEY REFERENCES tenants(id),
    prefix TEXT DEFAULT 'INV',
    current_number INTEGER NOT NULL DEFAULT 0,
    format TEXT DEFAULT '{prefix}-{year}-{number}',  -- INV-2024-00001
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize sequences
INSERT INTO invoice_sequences (tenant_id, prefix, current_number) VALUES
    ('adris', 'ADR', 0),
    ('petlife', 'PL', 0)
ON CONFLICT (tenant_id) DO NOTHING;

-- =============================================================================
-- J. FUNCTION: Generate Invoice Number
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_invoice_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_number INTEGER;
    v_year TEXT;
    v_invoice_number TEXT;
BEGIN
    -- Lock and increment
    UPDATE invoice_sequences
    SET current_number = current_number + 1,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id
    RETURNING prefix, current_number INTO v_prefix, v_number;

    -- If no sequence exists, create one
    IF NOT FOUND THEN
        INSERT INTO invoice_sequences (tenant_id, prefix, current_number)
        VALUES (p_tenant_id, 'INV', 1)
        RETURNING prefix, current_number INTO v_prefix, v_number;
    END IF;

    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    v_invoice_number := v_prefix || '-' || v_year || '-' || LPAD(v_number::TEXT, 5, '0');

    RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- K. FUNCTION: Calculate Invoice Totals
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_invoice_totals(p_invoice_id UUID)
RETURNS VOID AS $$
DECLARE
    v_subtotal NUMERIC(12,2);
    v_tax_amount NUMERIC(12,2);
    v_discount_amount NUMERIC(12,2);
    v_total NUMERIC(12,2);
    v_amount_paid NUMERIC(12,2);
    v_invoice RECORD;
BEGIN
    -- Get invoice for discount calculation
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

    -- Sum items
    SELECT
        COALESCE(SUM(subtotal), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO v_subtotal, v_tax_amount
    FROM invoice_items
    WHERE invoice_id = p_invoice_id;

    -- Calculate discount
    IF v_invoice.discount_type = 'percentage' THEN
        v_discount_amount := v_subtotal * (v_invoice.discount_value / 100);
    ELSE
        v_discount_amount := COALESCE(v_invoice.discount_value, 0);
    END IF;

    -- Calculate total
    v_total := v_subtotal + v_tax_amount - v_discount_amount;

    -- Sum payments
    SELECT COALESCE(SUM(amount), 0) INTO v_amount_paid
    FROM payments
    WHERE invoice_id = p_invoice_id AND status = 'completed';

    -- Subtract refunds
    SELECT v_amount_paid - COALESCE(SUM(amount), 0) INTO v_amount_paid
    FROM refunds
    WHERE invoice_id = p_invoice_id AND status = 'completed';

    -- Update invoice
    UPDATE invoices SET
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        discount_amount = v_discount_amount,
        total = v_total,
        amount_paid = v_amount_paid,
        balance_due = v_total - v_amount_paid,
        status = CASE
            WHEN v_total - v_amount_paid <= 0 THEN 'paid'
            WHEN v_amount_paid > 0 THEN 'partial'
            WHEN v_invoice.due_date < CURRENT_DATE AND v_invoice.status NOT IN ('paid', 'cancelled') THEN 'overdue'
            ELSE v_invoice.status
        END,
        updated_at = NOW()
    WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- L. TRIGGERS: Auto-calculate totals
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_invoice()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_invoice_totals(OLD.invoice_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_invoice_totals(NEW.invoice_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalc_invoice_on_item_change ON invoice_items;
CREATE TRIGGER recalc_invoice_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_invoice();

DROP TRIGGER IF EXISTS recalc_invoice_on_payment ON payments;
CREATE TRIGGER recalc_invoice_on_payment
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_invoice();

DROP TRIGGER IF EXISTS recalc_invoice_on_refund ON refunds;
CREATE TRIGGER recalc_invoice_on_refund
    AFTER INSERT OR UPDATE OR DELETE ON refunds
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_invoice();

-- =============================================================================
-- M. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods(tenant_id);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_pet ON invoices(pet_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_service ON invoice_items(service_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_refunds_invoice ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_client ON client_credits(client_id);
CREATE INDEX IF NOT EXISTS idx_client_credits_unused ON client_credits(is_used) WHERE is_used = FALSE;

CREATE INDEX IF NOT EXISTS idx_recurring_templates_tenant ON recurring_invoice_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_next_date ON recurring_invoice_templates(next_invoice_date);

-- =============================================================================
-- N. RLS POLICIES
-- =============================================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_items ENABLE ROW LEVEL SECURITY;

-- Services: Staff manage, all view
CREATE POLICY "Staff manage services" ON services FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Tenant view services" ON services FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tenant_id = services.tenant_id)
);

-- Payment Methods: Staff manage, all view
CREATE POLICY "Staff manage payment methods" ON payment_methods FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Tenant view payment methods" ON payment_methods FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tenant_id = payment_methods.tenant_id)
);

-- Invoices: Staff manage, clients view own
CREATE POLICY "Staff manage invoices" ON invoices FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own invoices" ON invoices FOR SELECT USING (client_id = auth.uid());

-- Invoice Items: Via invoice access
CREATE POLICY "Access invoice items via invoice" ON invoice_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND (public.is_staff_of(invoices.tenant_id) OR invoices.client_id = auth.uid())
    )
);

-- Payments: Staff manage, clients view own
CREATE POLICY "Staff manage payments" ON payments FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.client_id = auth.uid())
);

-- Refunds: Staff only
CREATE POLICY "Staff manage refunds" ON refunds FOR ALL USING (public.is_staff_of(tenant_id));

-- Client Credits: Staff manage, clients view own
CREATE POLICY "Staff manage credits" ON client_credits FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own credits" ON client_credits FOR SELECT USING (client_id = auth.uid());

-- Recurring Templates: Staff only
CREATE POLICY "Staff manage recurring templates" ON recurring_invoice_templates FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Staff manage recurring items" ON recurring_invoice_items FOR ALL USING (
    EXISTS (SELECT 1 FROM recurring_invoice_templates t WHERE t.id = recurring_invoice_items.template_id AND public.is_staff_of(t.tenant_id))
);

-- =============================================================================
-- INVOICING SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 22_schema_reminders.sql
-- =============================================================================

-- =============================================================================
-- 22_SCHEMA_REMINDERS.SQL
-- =============================================================================
-- Reminder and notification system for vaccines, appointments, and follow-ups.
-- Supports multiple channels: SMS, Email, WhatsApp, Push notifications.
-- =============================================================================

-- =============================================================================
-- A. NOTIFICATION CHANNELS
-- =============================================================================
-- Available notification channels per tenant.

CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Channel Details
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    )),
    name TEXT NOT NULL,                     -- 'Email Principal', 'WhatsApp Business'

    -- Configuration (encrypted in production)
    config JSONB,                           -- API keys, sender info, etc.

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, channel_type)
);

-- =============================================================================
-- B. NOTIFICATION TEMPLATES
-- =============================================================================
-- Message templates for different reminder types.

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Template Details
    name TEXT NOT NULL,                     -- 'Vaccine Reminder', 'Appointment Confirmation'
    type TEXT NOT NULL CHECK (type IN (
        'vaccine_reminder', 'vaccine_overdue',
        'appointment_reminder', 'appointment_confirmation', 'appointment_cancelled',
        'invoice_sent', 'payment_received', 'payment_overdue',
        'birthday', 'follow_up', 'lab_results_ready',
        'hospitalization_update', 'custom'
    )),
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    )),

    -- Content
    subject TEXT,                           -- For email
    body TEXT NOT NULL,                     -- Message body with {{variables}}

    -- Variables available: {{pet_name}}, {{owner_name}}, {{clinic_name}},
    -- {{vaccine_name}}, {{due_date}}, {{appointment_date}}, {{appointment_time}}

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, type, channel_type)
);

-- Seed default templates
INSERT INTO notification_templates (tenant_id, name, type, channel_type, subject, body) VALUES
    -- Vaccine Reminders
    ('adris', 'Recordatorio de Vacuna', 'vaccine_reminder', 'sms',
     NULL, 'Hola {{owner_name}}! Recordatorio: {{pet_name}} tiene su vacuna {{vaccine_name}} programada para el {{due_date}}. Veterinaria Adris.'),
    ('adris', 'Recordatorio de Vacuna', 'vaccine_reminder', 'email',
     'Recordatorio de Vacuna para {{pet_name}}',
     'Estimado/a {{owner_name}},\n\nLe recordamos que {{pet_name}} tiene programada su vacuna {{vaccine_name}} para el {{due_date}}.\n\nPor favor, contáctenos para agendar su cita.\n\nSaludos,\nVeterinaria Adris'),
    ('adris', 'Vacuna Vencida', 'vaccine_overdue', 'sms',
     NULL, 'IMPORTANTE: {{pet_name}} tiene la vacuna {{vaccine_name}} vencida desde {{due_date}}. Contacte a Veterinaria Adris para programar.'),

    -- Appointment Reminders
    ('adris', 'Confirmación de Cita', 'appointment_confirmation', 'sms',
     NULL, 'Cita confirmada para {{pet_name}} el {{appointment_date}} a las {{appointment_time}}. Veterinaria Adris.'),
    ('adris', 'Recordatorio de Cita', 'appointment_reminder', 'sms',
     NULL, 'Recordatorio: Mañana {{pet_name}} tiene cita a las {{appointment_time}}. Veterinaria Adris.'),

    -- Birthday
    ('adris', 'Feliz Cumpleaños', 'birthday', 'sms',
     NULL, '🎂 Feliz cumpleaños {{pet_name}}! De parte de todo el equipo de Veterinaria Adris.')
ON CONFLICT (tenant_id, type, channel_type) DO NOTHING;

-- =============================================================================
-- C. CLIENT NOTIFICATION PREFERENCES
-- =============================================================================
-- Per-client preferences for how they want to be contacted.

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Preferences by Type
    vaccine_reminders BOOLEAN DEFAULT TRUE,
    appointment_reminders BOOLEAN DEFAULT TRUE,
    payment_reminders BOOLEAN DEFAULT TRUE,
    promotional BOOLEAN DEFAULT FALSE,
    birthday_greetings BOOLEAN DEFAULT TRUE,

    -- Preferred Channels (ordered by preference)
    preferred_channels TEXT[] DEFAULT ARRAY['sms', 'email'],

    -- Contact Info Override
    preferred_phone TEXT,
    preferred_email TEXT,

    -- Timing
    reminder_days_before INTEGER DEFAULT 3,     -- Days before due date
    reminder_time TIME DEFAULT '09:00:00',      -- Preferred time to receive

    -- Quiet Hours
    quiet_start TIME DEFAULT '21:00:00',
    quiet_end TIME DEFAULT '08:00:00',

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(client_id)
);

-- =============================================================================
-- D. REMINDERS
-- =============================================================================
-- Scheduled reminders to be sent.

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Target
    client_id UUID NOT NULL REFERENCES profiles(id),
    pet_id UUID REFERENCES pets(id),

    -- Reminder Type
    type TEXT NOT NULL CHECK (type IN (
        'vaccine_reminder', 'vaccine_overdue',
        'appointment_reminder', 'appointment_confirmation', 'appointment_cancelled',
        'invoice_sent', 'payment_received', 'payment_overdue',
        'birthday', 'follow_up', 'lab_results_ready',
        'hospitalization_update', 'custom'
    )),

    -- Reference
    reference_type TEXT,                    -- 'vaccine', 'appointment', 'invoice'
    reference_id UUID,                      -- ID of the related record

    -- Schedule
    scheduled_at TIMESTAMPTZ NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'sent', 'failed', 'cancelled', 'skipped'
    )),

    -- Attempts
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMPTZ,
    next_attempt_at TIMESTAMPTZ,

    -- Error Tracking
    error_message TEXT,

    -- Custom Content (overrides template)
    custom_subject TEXT,
    custom_body TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. NOTIFICATION QUEUE
-- =============================================================================
-- Actual messages ready to be sent.

CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    reminder_id UUID REFERENCES reminders(id) ON DELETE SET NULL,

    -- Recipient
    client_id UUID NOT NULL REFERENCES profiles(id),

    -- Channel
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    )),

    -- Destination
    destination TEXT NOT NULL,              -- Phone number or email

    -- Content
    subject TEXT,
    body TEXT NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'
    )),

    -- Tracking
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,                  -- For email tracking
    clicked_at TIMESTAMPTZ,

    -- Error
    error_code TEXT,
    error_message TEXT,

    -- External Reference
    external_id TEXT,                       -- Twilio SID, SendGrid ID, etc.

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. NOTIFICATION LOG
-- =============================================================================
-- Historical log of all sent notifications.

CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    queue_id UUID REFERENCES notification_queue(id),
    reminder_id UUID REFERENCES reminders(id),

    -- Details
    client_id UUID NOT NULL REFERENCES profiles(id),
    channel_type TEXT NOT NULL,
    destination TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,

    -- Result
    status TEXT NOT NULL,                   -- 'sent', 'delivered', 'failed', 'bounced'
    error_message TEXT,

    -- Timing
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,

    -- Cost (for SMS/WhatsApp tracking)
    cost NUMERIC(10,4),
    currency TEXT DEFAULT 'PYG'
);

-- =============================================================================
-- G. AUTO-REMINDER RULES
-- =============================================================================
-- Automatic reminder generation rules.

CREATE TABLE IF NOT EXISTS reminder_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Rule Details
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'vaccine_due', 'vaccine_overdue',
        'appointment_before', 'birthday',
        'follow_up_after_visit', 'wellness_checkup'
    )),

    -- Timing
    days_offset INTEGER NOT NULL,           -- Days before (-) or after (+) trigger
    time_of_day TIME DEFAULT '09:00:00',

    -- Channels
    channels TEXT[] DEFAULT ARRAY['sms'],

    -- Conditions
    conditions JSONB,                       -- Species, vaccine type, etc.

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default rules
INSERT INTO reminder_rules (tenant_id, name, type, days_offset, channels) VALUES
    ('adris', 'Recordatorio 7 días antes', 'vaccine_due', -7, ARRAY['email']),
    ('adris', 'Recordatorio 3 días antes', 'vaccine_due', -3, ARRAY['sms']),
    ('adris', 'Recordatorio 1 día antes', 'vaccine_due', -1, ARRAY['sms', 'whatsapp']),
    ('adris', 'Vacuna vencida', 'vaccine_overdue', 1, ARRAY['sms']),
    ('adris', 'Vacuna muy vencida', 'vaccine_overdue', 7, ARRAY['sms', 'email']),
    ('adris', 'Recordatorio cita día anterior', 'appointment_before', -1, ARRAY['sms']),
    ('adris', 'Recordatorio cita 2 horas', 'appointment_before', 0, ARRAY['sms']),
    ('adris', 'Cumpleaños mascota', 'birthday', 0, ARRAY['sms'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- H. FUNCTION: Generate Vaccine Reminders
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_vaccine_reminders()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_rule RECORD;
    v_vaccine RECORD;
    v_scheduled_at TIMESTAMPTZ;
BEGIN
    -- Loop through active rules
    FOR v_rule IN
        SELECT * FROM reminder_rules
        WHERE is_active = TRUE AND type IN ('vaccine_due', 'vaccine_overdue')
    LOOP
        -- Find vaccines matching the rule
        FOR v_vaccine IN
            SELECT v.*, p.owner_id, p.name as pet_name, p.tenant_id
            FROM vaccines v
            JOIN pets p ON v.pet_id = p.id
            WHERE p.tenant_id = v_rule.tenant_id
            AND v.status = 'pending'
            AND v.next_due_date IS NOT NULL
            AND v.next_due_date + (v_rule.days_offset || ' days')::INTERVAL = CURRENT_DATE
        LOOP
            -- Check if reminder already exists
            IF NOT EXISTS (
                SELECT 1 FROM reminders
                WHERE reference_type = 'vaccine'
                AND reference_id = v_vaccine.id
                AND type = v_rule.type
                AND DATE(scheduled_at) = CURRENT_DATE
            ) THEN
                -- Calculate scheduled time
                v_scheduled_at := CURRENT_DATE + v_rule.time_of_day;

                -- Create reminder
                INSERT INTO reminders (
                    tenant_id, client_id, pet_id, type,
                    reference_type, reference_id, scheduled_at
                ) VALUES (
                    v_vaccine.tenant_id, v_vaccine.owner_id, v_vaccine.pet_id,
                    CASE WHEN v_rule.days_offset < 0 THEN 'vaccine_reminder' ELSE 'vaccine_overdue' END,
                    'vaccine', v_vaccine.id, v_scheduled_at
                );

                v_count := v_count + 1;
            END IF;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- I. FUNCTION: Generate Appointment Reminders
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_appointment_reminders()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_appointment RECORD;
BEGIN
    -- 24-hour reminder
    FOR v_appointment IN
        SELECT a.*, p.owner_id, p.name as pet_name
        FROM appointments a
        JOIN pets p ON a.pet_id = p.id
        WHERE a.status = 'confirmed'
        AND DATE(a.start_time) = CURRENT_DATE + INTERVAL '1 day'
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM reminders
            WHERE reference_type = 'appointment'
            AND reference_id = v_appointment.id
            AND type = 'appointment_reminder'
        ) THEN
            INSERT INTO reminders (
                tenant_id, client_id, pet_id, type,
                reference_type, reference_id, scheduled_at
            ) VALUES (
                v_appointment.tenant_id, v_appointment.owner_id, v_appointment.pet_id,
                'appointment_reminder', 'appointment', v_appointment.id,
                NOW() + INTERVAL '1 hour'
            );
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- J. FUNCTION: Process Reminder Queue
-- =============================================================================

CREATE OR REPLACE FUNCTION process_pending_reminders()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_reminder RECORD;
    v_template RECORD;
    v_prefs RECORD;
    v_channel TEXT;
    v_destination TEXT;
    v_body TEXT;
    v_subject TEXT;
    v_pet RECORD;
    v_client RECORD;
    v_tenant RECORD;
BEGIN
    FOR v_reminder IN
        SELECT r.*, p.name as pet_name, p.species
        FROM reminders r
        LEFT JOIN pets p ON r.pet_id = p.id
        WHERE r.status = 'pending'
        AND r.scheduled_at <= NOW()
        AND (r.next_attempt_at IS NULL OR r.next_attempt_at <= NOW())
        ORDER BY r.scheduled_at
        LIMIT 100
    LOOP
        -- Get client preferences
        SELECT * INTO v_prefs FROM notification_preferences WHERE client_id = v_reminder.client_id;

        -- Get client info
        SELECT * INTO v_client FROM profiles WHERE id = v_reminder.client_id;

        -- Get tenant info
        SELECT * INTO v_tenant FROM tenants WHERE id = v_reminder.tenant_id;

        -- Determine channel
        IF v_prefs IS NOT NULL AND array_length(v_prefs.preferred_channels, 1) > 0 THEN
            v_channel := v_prefs.preferred_channels[1];
        ELSE
            v_channel := 'sms';
        END IF;

        -- Get template
        SELECT * INTO v_template
        FROM notification_templates
        WHERE tenant_id = v_reminder.tenant_id
        AND type = v_reminder.type
        AND channel_type = v_channel
        AND is_active = TRUE;

        IF v_template IS NULL THEN
            -- No template, skip
            UPDATE reminders SET status = 'skipped', error_message = 'No template found' WHERE id = v_reminder.id;
            CONTINUE;
        END IF;

        -- Get destination
        IF v_channel = 'email' THEN
            v_destination := COALESCE(v_prefs.preferred_email, v_client.email);
        ELSE
            v_destination := COALESCE(v_prefs.preferred_phone, v_client.phone);
        END IF;

        IF v_destination IS NULL THEN
            UPDATE reminders SET status = 'skipped', error_message = 'No destination' WHERE id = v_reminder.id;
            CONTINUE;
        END IF;

        -- Replace variables in template
        v_body := v_template.body;
        v_body := REPLACE(v_body, '{{pet_name}}', COALESCE(v_reminder.pet_name, ''));
        v_body := REPLACE(v_body, '{{owner_name}}', COALESCE(v_client.full_name, ''));
        v_body := REPLACE(v_body, '{{clinic_name}}', COALESCE(v_tenant.name, ''));

        v_subject := v_template.subject;
        IF v_subject IS NOT NULL THEN
            v_subject := REPLACE(v_subject, '{{pet_name}}', COALESCE(v_reminder.pet_name, ''));
        END IF;

        -- Add to queue
        INSERT INTO notification_queue (
            tenant_id, reminder_id, client_id, channel_type,
            destination, subject, body
        ) VALUES (
            v_reminder.tenant_id, v_reminder.id, v_reminder.client_id, v_channel,
            v_destination, v_subject, v_body
        );

        -- Update reminder status
        UPDATE reminders
        SET status = 'processing', attempts = attempts + 1, last_attempt_at = NOW()
        WHERE id = v_reminder.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- K. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_notification_templates_tenant ON notification_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_client ON notification_preferences(client_id);

CREATE INDEX IF NOT EXISTS idx_reminders_tenant ON reminders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reminders_client ON reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_reference ON reminders(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant ON notification_queue(tenant_id);

CREATE INDEX IF NOT EXISTS idx_notification_log_client ON notification_log(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent ON notification_log(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_reminder_rules_tenant ON reminder_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reminder_rules_active ON reminder_rules(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- L. RLS POLICIES
-- =============================================================================

ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;

-- Channels & Templates: Staff only
CREATE POLICY "Staff manage notification channels" ON notification_channels FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Staff manage notification templates" ON notification_templates FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Staff manage reminder rules" ON reminder_rules FOR ALL USING (public.is_staff_of(tenant_id));

-- Preferences: Users manage own
CREATE POLICY "Users manage own preferences" ON notification_preferences FOR ALL USING (client_id = auth.uid());
CREATE POLICY "Staff view preferences" ON notification_preferences FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('vet', 'admin'))
);

-- Reminders: Staff manage, clients view own
CREATE POLICY "Staff manage reminders" ON reminders FOR ALL USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own reminders" ON reminders FOR SELECT USING (client_id = auth.uid());

-- Queue: Staff only
CREATE POLICY "Staff manage notification queue" ON notification_queue FOR ALL USING (public.is_staff_of(tenant_id));

-- Log: Staff view, clients view own
CREATE POLICY "Staff view notification log" ON notification_log FOR SELECT USING (public.is_staff_of(tenant_id));
CREATE POLICY "Clients view own notification log" ON notification_log FOR SELECT USING (client_id = auth.uid());

-- =============================================================================
-- REMINDERS SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 23_schema_hospitalization.sql
-- =============================================================================

-- =============================================================================
-- 23_SCHEMA_HOSPITALIZATION.SQL
-- =============================================================================
-- Hospitalization and boarding management for veterinary clinics.
-- Includes kennels, hospitalization records, vitals monitoring, and feeding.
-- =============================================================================

-- =============================================================================
-- A. KENNELS / CAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS kennels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Kennel info
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    location TEXT, -- e.g., 'Ward A', 'ICU', 'Isolation'
    kennel_type TEXT NOT NULL DEFAULT 'standard' CHECK (kennel_type IN (
        'standard', 'large', 'small', 'icu', 'isolation', 'exotic', 'recovery'
    )),

    -- Specifications
    size_category TEXT NOT NULL DEFAULT 'medium' CHECK (size_category IN ('small', 'medium', 'large', 'xlarge')),
    max_weight_kg DECIMAL(6,2),
    species_allowed TEXT[] DEFAULT ARRAY['dog', 'cat'],

    -- Features
    has_oxygen BOOLEAN DEFAULT FALSE,
    has_heating BOOLEAN DEFAULT FALSE,
    has_iv_pole BOOLEAN DEFAULT FALSE,
    has_camera BOOLEAN DEFAULT FALSE,

    -- Pricing
    daily_rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    icu_surcharge DECIMAL(12,2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    current_status TEXT DEFAULT 'available' CHECK (current_status IN (
        'available', 'occupied', 'cleaning', 'maintenance', 'reserved'
    )),

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- =============================================================================
-- B. HOSPITALIZATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    kennel_id UUID REFERENCES kennels(id) ON DELETE SET NULL,

    -- Hospitalization info
    hospitalization_number TEXT NOT NULL,
    hospitalization_type TEXT NOT NULL DEFAULT 'medical' CHECK (hospitalization_type IN (
        'medical', 'surgical', 'boarding', 'observation', 'emergency', 'quarantine'
    )),

    -- Dates
    admitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_discharge_at TIMESTAMPTZ,
    actual_discharge_at TIMESTAMPTZ,

    -- Admitting info
    admitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    discharged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    primary_vet_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Clinical info
    admission_reason TEXT NOT NULL,
    admission_diagnosis TEXT,
    admission_weight_kg DECIMAL(6,2),
    discharge_diagnosis TEXT,
    discharge_weight_kg DECIMAL(6,2),
    discharge_instructions TEXT,

    -- Treatment plan
    treatment_plan JSONB DEFAULT '{}',
    -- Structure: {
    --   "medications": [{"name": "", "dose": "", "frequency": "", "route": ""}],
    --   "procedures": [{"name": "", "frequency": ""}],
    --   "monitoring": {"vitals_frequency": "q4h", "special_observations": []}
    -- }

    -- Diet
    diet_instructions TEXT,
    feeding_schedule JSONB DEFAULT '[]',
    -- Structure: [{"time": "08:00", "food": "", "amount": "", "special_instructions": ""}]

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'discharged', 'transferred', 'deceased', 'escaped'
    )),
    acuity_level TEXT DEFAULT 'stable' CHECK (acuity_level IN (
        'critical', 'unstable', 'stable', 'improving', 'ready_for_discharge'
    )),

    -- Emergency contacts
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    owner_consent_given BOOLEAN DEFAULT FALSE,
    consent_document_url TEXT,

    -- Billing
    estimated_daily_cost DECIMAL(12,2),
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT FALSE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Metadata
    notes TEXT,
    internal_notes TEXT, -- Staff only notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, hospitalization_number)
);

-- =============================================================================
-- C. HOSPITALIZATION VITALS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Who recorded
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Vital signs
    temperature_celsius DECIMAL(4,1),
    heart_rate_bpm INTEGER,
    respiratory_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    oxygen_saturation DECIMAL(4,1),
    weight_kg DECIMAL(6,2),

    -- Pain assessment (0-10 scale)
    pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
    pain_location TEXT,

    -- Hydration
    hydration_status TEXT CHECK (hydration_status IN (
        'normal', 'mild_dehydration', 'moderate_dehydration', 'severe_dehydration'
    )),

    -- Mental status
    mental_status TEXT CHECK (mental_status IN (
        'alert', 'responsive', 'lethargic', 'obtunded', 'comatose'
    )),

    -- GI status
    appetite TEXT CHECK (appetite IN ('normal', 'decreased', 'none', 'increased')),
    vomiting BOOLEAN DEFAULT FALSE,
    diarrhea BOOLEAN DEFAULT FALSE,
    urination TEXT CHECK (urination IN ('normal', 'increased', 'decreased', 'none', 'blood')),
    defecation TEXT CHECK (defecation IN ('normal', 'constipated', 'diarrhea', 'none', 'blood')),

    -- IV/Fluids
    iv_fluid_type TEXT,
    iv_rate_ml_hr INTEGER,
    total_fluids_in_ml INTEGER,
    total_fluids_out_ml INTEGER,

    -- Observations
    observations TEXT,
    abnormalities TEXT,

    -- Photos/attachments
    photo_urls TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. HOSPITALIZATION TREATMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Treatment info
    treatment_type TEXT NOT NULL CHECK (treatment_type IN (
        'medication', 'procedure', 'fluid_therapy', 'feeding', 'wound_care',
        'physical_therapy', 'diagnostic', 'other'
    )),
    treatment_name TEXT NOT NULL,

    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,

    -- Who
    scheduled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Details
    dosage TEXT,
    route TEXT, -- oral, IV, IM, SC, topical, etc.
    quantity DECIMAL(10,2),
    unit TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'completed', 'skipped', 'refused', 'held'
    )),
    skip_reason TEXT,

    -- Outcome
    response TEXT,
    adverse_reaction BOOLEAN DEFAULT FALSE,
    adverse_reaction_details TEXT,

    -- Billing
    is_billable BOOLEAN DEFAULT TRUE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    charge_amount DECIMAL(12,2),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. FEEDING LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_feedings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Feeding info
    scheduled_at TIMESTAMPTZ NOT NULL,
    fed_at TIMESTAMPTZ,
    fed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Food details
    food_type TEXT NOT NULL,
    amount_offered TEXT,
    amount_consumed TEXT,
    consumption_percentage INTEGER CHECK (consumption_percentage >= 0 AND consumption_percentage <= 100),

    -- Method
    feeding_method TEXT DEFAULT 'voluntary' CHECK (feeding_method IN (
        'voluntary', 'assisted', 'syringe', 'tube', 'iv_nutrition'
    )),

    -- Water
    water_offered BOOLEAN DEFAULT TRUE,
    water_consumed TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'fed', 'refused', 'vomited', 'skipped'
    )),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. KENNEL TRANSFERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS kennel_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Transfer details
    from_kennel_id UUID REFERENCES kennels(id) ON DELETE SET NULL,
    to_kennel_id UUID REFERENCES kennels(id) ON DELETE SET NULL,
    transferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transferred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Reason
    reason TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- G. VISITATION LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Visitor info
    visitor_name TEXT NOT NULL,
    visitor_relationship TEXT, -- owner, family, other
    visitor_phone TEXT,

    -- Visit details
    visit_start TIMESTAMPTZ NOT NULL,
    visit_end TIMESTAMPTZ,

    -- Authorization
    authorized_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,
    pet_response TEXT, -- How the pet responded to the visit

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. HOSPITALIZATION DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS hospitalization_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,

    -- Document info
    document_type TEXT NOT NULL CHECK (document_type IN (
        'consent', 'estimate', 'discharge_summary', 'lab_result',
        'imaging', 'referral', 'other'
    )),
    title TEXT NOT NULL,
    description TEXT,

    -- File
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,

    -- Who
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_kennels_tenant ON kennels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kennels_status ON kennels(current_status) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_kennels_type ON kennels(tenant_id, kennel_type);

CREATE INDEX IF NOT EXISTS idx_hospitalizations_tenant ON hospitalizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_pet ON hospitalizations(pet_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_kennel ON hospitalizations(kennel_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON hospitalizations(status);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_active ON hospitalizations(tenant_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_hospitalizations_dates ON hospitalizations(admitted_at, actual_discharge_at);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_vet ON hospitalizations(primary_vet_id);

CREATE INDEX IF NOT EXISTS idx_hosp_vitals_hospitalization ON hospitalization_vitals(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_vitals_time ON hospitalization_vitals(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_hosp_treatments_hospitalization ON hospitalization_treatments(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_treatments_scheduled ON hospitalization_treatments(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_hosp_treatments_status ON hospitalization_treatments(status);

CREATE INDEX IF NOT EXISTS idx_hosp_feedings_hospitalization ON hospitalization_feedings(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_feedings_scheduled ON hospitalization_feedings(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_kennel_transfers_hospitalization ON kennel_transfers(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_visits_hospitalization ON hospitalization_visits(hospitalization_id);
CREATE INDEX IF NOT EXISTS idx_hosp_documents_hospitalization ON hospitalization_documents(hospitalization_id);

-- =============================================================================
-- J. TRIGGERS
-- =============================================================================

-- Update timestamps
CREATE TRIGGER update_kennels_updated_at
    BEFORE UPDATE ON kennels
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_hospitalizations_updated_at
    BEFORE UPDATE ON hospitalizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_hospitalization_treatments_updated_at
    BEFORE UPDATE ON hospitalization_treatments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- K. FUNCTIONS
-- =============================================================================

-- Generate hospitalization number
CREATE OR REPLACE FUNCTION generate_hospitalization_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
    v_number TEXT;
BEGIN
    v_prefix := 'H';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(hospitalization_number FROM 4) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM hospitalizations
    WHERE tenant_id = p_tenant_id
      AND hospitalization_number LIKE v_prefix || v_year || '%';

    v_number := v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');

    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Update kennel status based on hospitalizations
CREATE OR REPLACE FUNCTION update_kennel_status()
RETURNS TRIGGER AS $$
BEGIN
    -- When hospitalization is created or kennel assigned
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.kennel_id IS DISTINCT FROM OLD.kennel_id) THEN
        -- Mark new kennel as occupied
        IF NEW.kennel_id IS NOT NULL AND NEW.status = 'active' THEN
            UPDATE kennels SET current_status = 'occupied' WHERE id = NEW.kennel_id;
        END IF;

        -- Mark old kennel as available (if changed)
        IF TG_OP = 'UPDATE' AND OLD.kennel_id IS NOT NULL AND OLD.kennel_id != NEW.kennel_id THEN
            UPDATE kennels SET current_status = 'cleaning' WHERE id = OLD.kennel_id;
        END IF;
    END IF;

    -- When hospitalization is discharged
    IF TG_OP = 'UPDATE' AND NEW.status IN ('discharged', 'transferred', 'deceased') AND OLD.status = 'active' THEN
        IF NEW.kennel_id IS NOT NULL THEN
            UPDATE kennels SET current_status = 'cleaning' WHERE id = NEW.kennel_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hospitalization_kennel_status
    AFTER INSERT OR UPDATE ON hospitalizations
    FOR EACH ROW EXECUTE FUNCTION update_kennel_status();

-- Get current hospitalizations summary
CREATE OR REPLACE FUNCTION get_hospitalization_census(p_tenant_id TEXT)
RETURNS TABLE (
    total_active INTEGER,
    by_type JSONB,
    by_acuity JSONB,
    kennel_availability JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM hospitalizations WHERE tenant_id = p_tenant_id AND status = 'active'),
        (SELECT COALESCE(jsonb_object_agg(hospitalization_type, cnt), '{}'::jsonb)
         FROM (SELECT hospitalization_type, COUNT(*) as cnt
               FROM hospitalizations WHERE tenant_id = p_tenant_id AND status = 'active'
               GROUP BY hospitalization_type) t),
        (SELECT COALESCE(jsonb_object_agg(acuity_level, cnt), '{}'::jsonb)
         FROM (SELECT acuity_level, COUNT(*) as cnt
               FROM hospitalizations WHERE tenant_id = p_tenant_id AND status = 'active'
               GROUP BY acuity_level) t),
        (SELECT COALESCE(jsonb_object_agg(current_status, cnt), '{}'::jsonb)
         FROM (SELECT current_status, COUNT(*) as cnt
               FROM kennels WHERE tenant_id = p_tenant_id AND is_active = TRUE
               GROUP BY current_status) t);
END;
$$ LANGUAGE plpgsql;

-- Get pending treatments
CREATE OR REPLACE FUNCTION get_pending_treatments(
    p_tenant_id TEXT,
    p_hours_ahead INTEGER DEFAULT 4
)
RETURNS TABLE (
    treatment_id UUID,
    hospitalization_id UUID,
    pet_name TEXT,
    kennel_code TEXT,
    treatment_type TEXT,
    treatment_name TEXT,
    scheduled_at TIMESTAMPTZ,
    dosage TEXT,
    route TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.hospitalization_id,
        p.name,
        k.code,
        t.treatment_type,
        t.treatment_name,
        t.scheduled_at,
        t.dosage,
        t.route
    FROM hospitalization_treatments t
    JOIN hospitalizations h ON t.hospitalization_id = h.id
    JOIN pets p ON h.pet_id = p.id
    LEFT JOIN kennels k ON h.kennel_id = k.id
    WHERE h.tenant_id = p_tenant_id
      AND h.status = 'active'
      AND t.status = 'scheduled'
      AND t.scheduled_at <= NOW() + (p_hours_ahead || ' hours')::INTERVAL
    ORDER BY t.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- L. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE kennels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kennel_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_documents ENABLE ROW LEVEL SECURITY;

-- Kennels: Staff can manage
CREATE POLICY kennels_select ON kennels FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY kennels_insert ON kennels FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY kennels_update ON kennels FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY kennels_delete ON kennels FOR DELETE TO authenticated
    USING (is_staff_of(tenant_id));

-- Hospitalizations: Staff can manage, owners can view their pets
CREATE POLICY hospitalizations_select_staff ON hospitalizations FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY hospitalizations_select_owner ON hospitalizations FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pets WHERE pets.id = hospitalizations.pet_id AND pets.owner_id = auth.uid()
        )
    );

CREATE POLICY hospitalizations_insert ON hospitalizations FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY hospitalizations_update ON hospitalizations FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY hospitalizations_delete ON hospitalizations FOR DELETE TO authenticated
    USING (is_staff_of(tenant_id));

-- Vitals: Staff only
CREATE POLICY hosp_vitals_select ON hospitalization_vitals FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_vitals.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_vitals_insert ON hospitalization_vitals FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_vitals.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY hosp_vitals_update ON hospitalization_vitals FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_vitals.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Treatments: Staff only
CREATE POLICY hosp_treatments_select ON hospitalization_treatments FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_treatments.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_treatments_insert ON hospitalization_treatments FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_treatments.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY hosp_treatments_update ON hospitalization_treatments FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_treatments.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Feedings: Staff only for management
CREATE POLICY hosp_feedings_select ON hospitalization_feedings FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_feedings.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_feedings_insert ON hospitalization_feedings FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_feedings.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

CREATE POLICY hosp_feedings_update ON hospitalization_feedings FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_feedings.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Transfers: Staff only
CREATE POLICY kennel_transfers_all ON kennel_transfers FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = kennel_transfers.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Visits: Staff and owners
CREATE POLICY hosp_visits_select ON hospitalization_visits FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_visits.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_visits_insert ON hospitalization_visits FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_visits.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- Documents: Staff and owners can view
CREATE POLICY hosp_documents_select ON hospitalization_documents FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_documents.hospitalization_id
            AND (is_staff_of(h.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = h.pet_id AND pets.owner_id = auth.uid()))
        )
    );

CREATE POLICY hosp_documents_insert ON hospitalization_documents FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hospitalizations h WHERE h.id = hospitalization_documents.hospitalization_id
            AND is_staff_of(h.tenant_id)
        )
    );

-- =============================================================================
-- HOSPITALIZATION SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 24_schema_lab_results.sql
-- =============================================================================

-- =============================================================================
-- 24_SCHEMA_LAB_RESULTS.SQL
-- =============================================================================
-- Laboratory results and diagnostic testing for veterinary clinics.
-- Includes test panels, results, reference ranges, and external lab integration.
-- =============================================================================

-- =============================================================================
-- A. LAB TEST CATALOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_test_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global template

    -- Test info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'hematology', 'chemistry', 'urinalysis', 'serology', 'microbiology',
        'cytology', 'histopathology', 'parasitology', 'endocrinology',
        'coagulation', 'immunology', 'toxicology', 'genetics', 'other'
    )),

    -- Description
    description TEXT,
    specimen_type TEXT, -- blood, urine, feces, tissue, swab, etc.
    specimen_requirements TEXT, -- fasting, specific container, etc.

    -- Turnaround
    turnaround_hours INTEGER,
    is_in_house BOOLEAN DEFAULT FALSE, -- Can be done at clinic

    -- Pricing
    base_price DECIMAL(12,2),
    external_lab_cost DECIMAL(12,2),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- Unique index for global codes (tenant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_test_catalog_global_code
ON lab_test_catalog (code) WHERE tenant_id IS NULL;

-- =============================================================================
-- B. LAB TEST PANELS (Groups of tests)
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_test_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,

    -- Panel info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Pricing
    panel_price DECIMAL(12,2), -- Discounted price vs individual tests

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS lab_panel_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID NOT NULL REFERENCES lab_test_panels(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES lab_test_catalog(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,

    UNIQUE(panel_id, test_id)
);

-- =============================================================================
-- C. REFERENCE RANGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_reference_ranges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES lab_test_catalog(id) ON DELETE CASCADE,

    -- Applicability
    species TEXT NOT NULL,
    breed TEXT, -- NULL = all breeds
    age_min_months INTEGER,
    age_max_months INTEGER,
    sex TEXT CHECK (sex IN ('male', 'female', 'neutered_male', 'neutered_female')),

    -- Component (for tests with multiple values)
    component_name TEXT NOT NULL DEFAULT 'result',

    -- Range values
    unit TEXT NOT NULL,
    range_low DECIMAL(12,4),
    range_high DECIMAL(12,4),
    critical_low DECIMAL(12,4),
    critical_high DECIMAL(12,4),

    -- Display
    decimal_places INTEGER DEFAULT 2,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. LAB ORDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Order info
    order_number TEXT NOT NULL,
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ordered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Clinical context
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,
    clinical_notes TEXT,
    fasting_status TEXT CHECK (fasting_status IN ('fasted', 'non_fasted', 'unknown')),

    -- Specimen collection
    specimen_collected_at TIMESTAMPTZ,
    specimen_collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    specimen_type TEXT,
    specimen_quality TEXT CHECK (specimen_quality IN ('adequate', 'hemolyzed', 'lipemic', 'icteric', 'clotted', 'insufficient')),

    -- Processing
    lab_type TEXT NOT NULL DEFAULT 'in_house' CHECK (lab_type IN ('in_house', 'external')),
    external_lab_name TEXT,
    external_lab_accession TEXT,
    sent_to_lab_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN (
        'ordered', 'specimen_collected', 'in_progress', 'completed',
        'partial', 'cancelled', 'rejected'
    )),
    priority TEXT DEFAULT 'routine' CHECK (priority IN ('stat', 'urgent', 'routine')),

    -- Results
    results_received_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    has_critical_values BOOLEAN DEFAULT FALSE,
    critical_values_acknowledged BOOLEAN DEFAULT FALSE,
    critical_values_acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Billing
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    total_cost DECIMAL(12,2),

    -- Notes
    notes TEXT,
    internal_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, order_number)
);

-- =============================================================================
-- E. LAB ORDER ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,

    -- What was ordered
    test_id UUID REFERENCES lab_test_catalog(id) ON DELETE SET NULL,
    panel_id UUID REFERENCES lab_test_panels(id) ON DELETE SET NULL,

    -- Custom test (if not in catalog)
    custom_test_name TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled'
    )),

    -- Pricing
    price DECIMAL(12,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT lab_order_item_test_check CHECK (
        test_id IS NOT NULL OR panel_id IS NOT NULL OR custom_test_name IS NOT NULL
    )
);

-- =============================================================================
-- F. LAB RESULTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    lab_order_item_id UUID REFERENCES lab_order_items(id) ON DELETE CASCADE,
    test_id UUID REFERENCES lab_test_catalog(id) ON DELETE SET NULL,

    -- Result identification
    component_name TEXT NOT NULL DEFAULT 'result',

    -- Value
    result_type TEXT NOT NULL DEFAULT 'numeric' CHECK (result_type IN (
        'numeric', 'text', 'positive_negative', 'reactive_nonreactive',
        'detected_not_detected', 'qualitative'
    )),
    numeric_value DECIMAL(12,4),
    text_value TEXT,
    unit TEXT,

    -- Interpretation
    reference_range_id UUID REFERENCES lab_reference_ranges(id) ON DELETE SET NULL,
    range_low DECIMAL(12,4),
    range_high DECIMAL(12,4),
    flag TEXT CHECK (flag IN ('normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal')),
    is_critical BOOLEAN DEFAULT FALSE,

    -- Method and quality
    method TEXT,
    instrument TEXT,
    dilution_factor DECIMAL(6,2),
    quality_flag TEXT,

    -- Entered by
    entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entered_at TIMESTAMPTZ DEFAULT NOW(),

    -- Verification
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- G. LAB RESULT ATTACHMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_result_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,

    -- Attachment info
    attachment_type TEXT NOT NULL CHECK (attachment_type IN (
        'report_pdf', 'image', 'graph', 'raw_data', 'external_report', 'other'
    )),
    title TEXT NOT NULL,
    description TEXT,

    -- File
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,

    -- Who
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. LAB RESULT COMMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_result_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    lab_result_id UUID REFERENCES lab_results(id) ON DELETE CASCADE,

    -- Comment
    comment_type TEXT NOT NULL DEFAULT 'interpretation' CHECK (comment_type IN (
        'interpretation', 'recommendation', 'follow_up', 'technical', 'other'
    )),
    comment TEXT NOT NULL,

    -- Who
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. EXTERNAL LAB INTEGRATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS external_lab_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Lab info
    lab_name TEXT NOT NULL,
    lab_code TEXT NOT NULL,
    api_endpoint TEXT,

    -- Credentials (encrypted)
    credentials JSONB DEFAULT '{}',

    -- Mappings
    test_mappings JSONB DEFAULT '{}', -- Map local test codes to lab codes
    species_mappings JSONB DEFAULT '{}',

    -- Settings
    auto_send_orders BOOLEAN DEFAULT FALSE,
    auto_receive_results BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, lab_code)
);

-- =============================================================================
-- J. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_tenant ON lab_test_catalog(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_category ON lab_test_catalog(category);
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_code ON lab_test_catalog(code);

CREATE INDEX IF NOT EXISTS idx_lab_test_panels_tenant ON lab_test_panels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_panel_tests_panel ON lab_panel_tests(panel_id);

CREATE INDEX IF NOT EXISTS idx_lab_reference_ranges_test ON lab_reference_ranges(test_id);
CREATE INDEX IF NOT EXISTS idx_lab_reference_ranges_species ON lab_reference_ranges(species);

CREATE INDEX IF NOT EXISTS idx_lab_orders_tenant ON lab_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet ON lab_orders(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_ordered_at ON lab_orders(ordered_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_orders_critical ON lab_orders(has_critical_values) WHERE has_critical_values = TRUE;
CREATE INDEX IF NOT EXISTS idx_lab_orders_medical_record ON lab_orders(medical_record_id);

CREATE INDEX IF NOT EXISTS idx_lab_order_items_order ON lab_order_items(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_order_items_test ON lab_order_items(test_id);

CREATE INDEX IF NOT EXISTS idx_lab_results_order ON lab_results(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test ON lab_results(test_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_critical ON lab_results(is_critical) WHERE is_critical = TRUE;
CREATE INDEX IF NOT EXISTS idx_lab_results_flag ON lab_results(flag);

CREATE INDEX IF NOT EXISTS idx_lab_attachments_order ON lab_result_attachments(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_comments_order ON lab_result_comments(lab_order_id);

-- =============================================================================
-- K. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_lab_test_catalog_updated_at
    BEFORE UPDATE ON lab_test_catalog
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_test_panels_updated_at
    BEFORE UPDATE ON lab_test_panels
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_reference_ranges_updated_at
    BEFORE UPDATE ON lab_reference_ranges
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_orders_updated_at
    BEFORE UPDATE ON lab_orders
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lab_results_updated_at
    BEFORE UPDATE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_external_lab_integrations_updated_at
    BEFORE UPDATE ON external_lab_integrations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- L. FUNCTIONS
-- =============================================================================

-- Generate lab order number
CREATE OR REPLACE FUNCTION generate_lab_order_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
BEGIN
    v_prefix := 'LAB';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM lab_orders
    WHERE tenant_id = p_tenant_id
      AND order_number LIKE v_prefix || v_year || '%';

    RETURN v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Evaluate result against reference range
CREATE OR REPLACE FUNCTION evaluate_lab_result(
    p_numeric_value DECIMAL,
    p_test_id UUID,
    p_species TEXT,
    p_age_months INTEGER DEFAULT NULL,
    p_sex TEXT DEFAULT NULL
)
RETURNS TABLE (
    flag TEXT,
    is_critical BOOLEAN,
    range_low DECIMAL,
    range_high DECIMAL,
    unit TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN p_numeric_value < rr.critical_low THEN 'critical_low'
            WHEN p_numeric_value > rr.critical_high THEN 'critical_high'
            WHEN p_numeric_value < rr.range_low THEN 'low'
            WHEN p_numeric_value > rr.range_high THEN 'high'
            ELSE 'normal'
        END::TEXT,
        (p_numeric_value < rr.critical_low OR p_numeric_value > rr.critical_high)::BOOLEAN,
        rr.range_low,
        rr.range_high,
        rr.unit
    FROM lab_reference_ranges rr
    WHERE rr.test_id = p_test_id
      AND rr.species = p_species
      AND (rr.age_min_months IS NULL OR p_age_months >= rr.age_min_months)
      AND (rr.age_max_months IS NULL OR p_age_months <= rr.age_max_months)
      AND (rr.sex IS NULL OR rr.sex = p_sex)
    ORDER BY
        CASE WHEN rr.breed IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN rr.age_min_months IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN rr.sex IS NOT NULL THEN 0 ELSE 1 END
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Update order status when results change
CREATE OR REPLACE FUNCTION update_lab_order_status()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id UUID;
    v_total_items INTEGER;
    v_completed_items INTEGER;
    v_has_critical BOOLEAN;
BEGIN
    v_order_id := COALESCE(NEW.lab_order_id, OLD.lab_order_id);

    -- Count items
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_total_items, v_completed_items
    FROM lab_order_items
    WHERE lab_order_id = v_order_id;

    -- Check for critical values
    SELECT EXISTS(SELECT 1 FROM lab_results WHERE lab_order_id = v_order_id AND is_critical = TRUE)
    INTO v_has_critical;

    -- Update order status
    UPDATE lab_orders SET
        status = CASE
            WHEN v_completed_items = 0 THEN 'in_progress'
            WHEN v_completed_items = v_total_items THEN 'completed'
            ELSE 'partial'
        END,
        has_critical_values = v_has_critical,
        results_received_at = CASE
            WHEN v_completed_items > 0 AND results_received_at IS NULL THEN NOW()
            ELSE results_received_at
        END
    WHERE id = v_order_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lab_results_update_order_status
    AFTER INSERT OR UPDATE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION update_lab_order_status();

-- Get lab results history for a pet
CREATE OR REPLACE FUNCTION get_pet_lab_history(
    p_pet_id UUID,
    p_test_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    ordered_at TIMESTAMPTZ,
    test_name TEXT,
    component_name TEXT,
    numeric_value DECIMAL,
    text_value TEXT,
    unit TEXT,
    flag TEXT,
    is_critical BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lo.id,
        lo.order_number,
        lo.ordered_at,
        ltc.name,
        lr.component_name,
        lr.numeric_value,
        lr.text_value,
        lr.unit,
        lr.flag,
        lr.is_critical
    FROM lab_orders lo
    JOIN lab_results lr ON lo.id = lr.lab_order_id
    LEFT JOIN lab_test_catalog ltc ON lr.test_id = ltc.id
    WHERE lo.pet_id = p_pet_id
      AND lo.status IN ('completed', 'partial')
      AND (p_test_id IS NULL OR lr.test_id = p_test_id)
    ORDER BY lo.ordered_at DESC, ltc.name, lr.component_name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- M. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_panel_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reference_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_result_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_lab_integrations ENABLE ROW LEVEL SECURITY;

-- Lab Test Catalog: Global templates visible to all, tenant-specific to staff
CREATE POLICY lab_test_catalog_select ON lab_test_catalog FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY lab_test_catalog_insert ON lab_test_catalog FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

CREATE POLICY lab_test_catalog_update ON lab_test_catalog FOR UPDATE TO authenticated
    USING (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Lab Test Panels
CREATE POLICY lab_test_panels_select ON lab_test_panels FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY lab_test_panels_insert ON lab_test_panels FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY lab_test_panels_update ON lab_test_panels FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Panel Tests
CREATE POLICY lab_panel_tests_all ON lab_panel_tests FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_test_panels p WHERE p.id = lab_panel_tests.panel_id AND is_staff_of(p.tenant_id))
    );

-- Reference Ranges: Read for staff, global readable
CREATE POLICY lab_reference_ranges_select ON lab_reference_ranges FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY lab_reference_ranges_insert ON lab_reference_ranges FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_test_catalog t WHERE t.id = lab_reference_ranges.test_id
                AND (t.tenant_id IS NULL OR is_staff_of(t.tenant_id)))
    );

-- Lab Orders: Staff manage, owners view their pets
CREATE POLICY lab_orders_select_staff ON lab_orders FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY lab_orders_select_owner ON lab_orders FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM pets WHERE pets.id = lab_orders.pet_id AND pets.owner_id = auth.uid())
    );

CREATE POLICY lab_orders_insert ON lab_orders FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY lab_orders_update ON lab_orders FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Lab Order Items
CREATE POLICY lab_order_items_select ON lab_order_items FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_order_items.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_order_items_insert ON lab_order_items FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_order_items.lab_order_id AND is_staff_of(lo.tenant_id))
    );

-- Lab Results
CREATE POLICY lab_results_select ON lab_results FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_results.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_results_insert ON lab_results FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_results.lab_order_id AND is_staff_of(lo.tenant_id))
    );

CREATE POLICY lab_results_update ON lab_results FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_results.lab_order_id AND is_staff_of(lo.tenant_id))
    );

-- Attachments and Comments
CREATE POLICY lab_attachments_select ON lab_result_attachments FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_attachments.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_attachments_insert ON lab_result_attachments FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_attachments.lab_order_id AND is_staff_of(lo.tenant_id))
    );

CREATE POLICY lab_comments_select ON lab_result_comments FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_comments.lab_order_id
                AND (is_staff_of(lo.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = lo.pet_id AND pets.owner_id = auth.uid())))
    );

CREATE POLICY lab_comments_insert ON lab_result_comments FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM lab_orders lo WHERE lo.id = lab_result_comments.lab_order_id AND is_staff_of(lo.tenant_id))
    );

-- External Lab Integrations: Staff only
CREATE POLICY external_lab_integrations_all ON external_lab_integrations FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- =============================================================================
-- N. SEED COMMON LAB TESTS
-- =============================================================================

INSERT INTO lab_test_catalog (tenant_id, code, name, category, specimen_type, is_in_house) VALUES
    (NULL, 'CBC', 'Complete Blood Count', 'hematology', 'EDTA blood', TRUE),
    (NULL, 'CHEM10', 'Chemistry Panel 10', 'chemistry', 'Serum', TRUE),
    (NULL, 'UA', 'Urinalysis', 'urinalysis', 'Urine', TRUE),
    (NULL, 'FT4', 'Free T4', 'endocrinology', 'Serum', FALSE),
    (NULL, 'TSH', 'Thyroid Stimulating Hormone', 'endocrinology', 'Serum', FALSE),
    (NULL, 'CORT', 'Cortisol', 'endocrinology', 'Serum', FALSE),
    (NULL, 'PARVO', 'Parvovirus Antigen', 'serology', 'Feces', TRUE),
    (NULL, 'FIV-FELV', 'FIV/FeLV Combo', 'serology', 'Whole blood', TRUE),
    (NULL, 'HW', 'Heartworm Antigen', 'serology', 'Whole blood', TRUE),
    (NULL, 'FECAL', 'Fecal Float', 'parasitology', 'Feces', TRUE),
    (NULL, 'CYTO', 'Cytology', 'cytology', 'Aspirate/Swab', FALSE),
    (NULL, 'HISTO', 'Histopathology', 'histopathology', 'Tissue', FALSE),
    (NULL, 'CULTURE', 'Bacterial Culture & Sensitivity', 'microbiology', 'Swab', FALSE),
    (NULL, 'PT-PTT', 'Coagulation Panel', 'coagulation', 'Citrate blood', FALSE),
    (NULL, 'LIPA', 'Lipase', 'chemistry', 'Serum', TRUE),
    (NULL, 'AMYL', 'Amylase', 'chemistry', 'Serum', TRUE),
    (NULL, 'BILE', 'Bile Acids', 'chemistry', 'Serum', FALSE),
    (NULL, 'LEPT', 'Leptospirosis Antibody', 'serology', 'Serum', FALSE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- LAB RESULTS SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 25_schema_consent.sql
-- =============================================================================

-- =============================================================================
-- 25_SCHEMA_CONSENT.SQL
-- =============================================================================
-- Digital consent forms and document signing for veterinary clinics.
-- Includes templates, signatures, and audit trail.
-- =============================================================================

-- =============================================================================
-- A. CONSENT TEMPLATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global template

    -- Template info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'surgery', 'anesthesia', 'treatment', 'euthanasia', 'boarding',
        'grooming', 'dental', 'vaccination', 'diagnostic', 'general',
        'release', 'financial', 'emergency', 'research'
    )),

    -- Content
    title TEXT NOT NULL,
    description TEXT,
    content_html TEXT NOT NULL, -- Rich text content with placeholders
    -- Placeholders: {{pet_name}}, {{owner_name}}, {{procedure}}, {{date}}, etc.

    -- Requirements
    requires_witness BOOLEAN DEFAULT FALSE,
    requires_id_verification BOOLEAN DEFAULT FALSE,
    requires_payment_acknowledgment BOOLEAN DEFAULT FALSE,
    min_age_to_sign INTEGER DEFAULT 18,

    -- Expiration
    validity_days INTEGER, -- NULL = never expires
    can_be_revoked BOOLEAN DEFAULT TRUE,

    -- Language
    language TEXT DEFAULT 'es',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,

    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code, version)
);

-- Unique index for global templates (tenant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_templates_global_code_version
ON consent_templates (code, version) WHERE tenant_id IS NULL;

-- =============================================================================
-- B. CONSENT TEMPLATE FIELDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES consent_templates(id) ON DELETE CASCADE,

    -- Field info
    field_name TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN (
        'text', 'number', 'date', 'checkbox', 'radio', 'select', 'textarea', 'signature'
    )),

    -- Validation
    is_required BOOLEAN DEFAULT FALSE,
    default_value TEXT,
    options JSONB, -- For select/radio: [{"value": "", "label": ""}]
    validation_regex TEXT,
    min_length INTEGER,
    max_length INTEGER,

    -- Display
    display_order INTEGER DEFAULT 0,
    help_text TEXT,
    placeholder TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- C. CONSENT DOCUMENTS (Signed consents)
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES consent_templates(id) ON DELETE SET NULL,

    -- Document number
    document_number TEXT NOT NULL,

    -- Related entities
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,

    -- Content (snapshot at time of signing)
    template_version INTEGER,
    rendered_content_html TEXT NOT NULL,
    field_values JSONB DEFAULT '{}',

    -- Signer info
    signer_name TEXT NOT NULL,
    signer_email TEXT,
    signer_phone TEXT,
    signer_id_type TEXT, -- cedula, passport, license
    signer_id_number TEXT,
    signer_relationship TEXT, -- owner, authorized_representative, guardian

    -- Signature
    signature_type TEXT NOT NULL CHECK (signature_type IN (
        'digital', 'typed', 'drawn', 'biometric', 'in_person'
    )),
    signature_data TEXT, -- Base64 image or typed name
    signature_hash TEXT, -- SHA256 hash for verification

    -- Witness (if required)
    witness_name TEXT,
    witness_signature_data TEXT,
    witness_signed_at TIMESTAMPTZ,

    -- Staff who facilitated
    facilitated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Timestamps
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revocation_reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'pending', 'active', 'expired', 'revoked', 'superseded'
    )),

    -- Verification
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB,

    -- PDF archive
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, document_number)
);

-- =============================================================================
-- D. CONSENT AUDIT LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_document_id UUID NOT NULL REFERENCES consent_documents(id) ON DELETE CASCADE,

    -- Action
    action TEXT NOT NULL CHECK (action IN (
        'created', 'viewed', 'signed', 'witnessed', 'revoked',
        'expired', 'pdf_generated', 'pdf_downloaded', 'emailed', 'printed'
    )),

    -- Who
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_by_name TEXT,

    -- Details
    details JSONB DEFAULT '{}',

    -- Context
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. CONSENT REQUESTS (For remote signing)
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES consent_templates(id) ON DELETE CASCADE,

    -- Request info
    request_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),

    -- Related entities
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

    -- Recipient
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    recipient_phone TEXT,

    -- Pre-filled data
    prefilled_data JSONB DEFAULT '{}',

    -- Request details
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    reminder_sent_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'viewed', 'signed', 'expired', 'cancelled'
    )),

    -- Result
    consent_document_id UUID REFERENCES consent_documents(id) ON DELETE SET NULL,

    -- Notes
    message TEXT, -- Custom message to recipient

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. BLANKET CONSENTS (Standing authorizations)
-- =============================================================================

CREATE TABLE IF NOT EXISTS blanket_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Scope
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'emergency_treatment', 'routine_care', 'vaccination',
        'diagnostic_imaging', 'blood_work', 'medication',
        'minor_procedures', 'communication', 'photo_release'
    )),

    -- Which pets (NULL = all)
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,

    -- Limits
    max_amount DECIMAL(12,2), -- Maximum cost without additional consent
    valid_procedures TEXT[], -- Specific procedures allowed

    -- Validity
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Signature
    signature_data TEXT,
    consent_document_id UUID REFERENCES consent_documents(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, owner_id, consent_type, pet_id)
);

-- =============================================================================
-- G. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_consent_templates_tenant ON consent_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_templates_category ON consent_templates(category);
CREATE INDEX IF NOT EXISTS idx_consent_templates_active ON consent_templates(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_consent_template_fields_template ON consent_template_fields(template_id);

CREATE INDEX IF NOT EXISTS idx_consent_documents_tenant ON consent_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_pet ON consent_documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_owner ON consent_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_status ON consent_documents(status);
CREATE INDEX IF NOT EXISTS idx_consent_documents_signed_at ON consent_documents(signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_documents_expires ON consent_documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consent_documents_appointment ON consent_documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consent_documents_hospitalization ON consent_documents(hospitalization_id);

CREATE INDEX IF NOT EXISTS idx_consent_audit_document ON consent_audit_log(consent_document_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_action ON consent_audit_log(action);

CREATE INDEX IF NOT EXISTS idx_consent_requests_tenant ON consent_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_requests_token ON consent_requests(request_token);
CREATE INDEX IF NOT EXISTS idx_consent_requests_status ON consent_requests(status);
CREATE INDEX IF NOT EXISTS idx_consent_requests_expires ON consent_requests(expires_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_blanket_consents_tenant ON blanket_consents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blanket_consents_owner ON blanket_consents(owner_id);
CREATE INDEX IF NOT EXISTS idx_blanket_consents_pet ON blanket_consents(pet_id);
CREATE INDEX IF NOT EXISTS idx_blanket_consents_active ON blanket_consents(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- H. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_consent_templates_updated_at
    BEFORE UPDATE ON consent_templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_consent_documents_updated_at
    BEFORE UPDATE ON consent_documents
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_consent_requests_updated_at
    BEFORE UPDATE ON consent_requests
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_blanket_consents_updated_at
    BEFORE UPDATE ON blanket_consents
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- I. FUNCTIONS
-- =============================================================================

-- Generate consent document number
CREATE OR REPLACE FUNCTION generate_consent_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
BEGIN
    v_prefix := 'CON';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(document_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM consent_documents
    WHERE tenant_id = p_tenant_id
      AND document_number LIKE v_prefix || v_year || '%';

    RETURN v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Log consent action
CREATE OR REPLACE FUNCTION log_consent_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
        VALUES (NEW.id, 'created', auth.uid(), jsonb_build_object('template_id', NEW.template_id));

        IF NEW.status = 'active' THEN
            INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
            VALUES (NEW.id, 'signed', auth.uid(), jsonb_build_object('signer_name', NEW.signer_name));
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            IF NEW.status = 'revoked' THEN
                INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
                VALUES (NEW.id, 'revoked', auth.uid(), jsonb_build_object('reason', NEW.revocation_reason));
            ELSIF NEW.status = 'expired' THEN
                INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
                VALUES (NEW.id, 'expired', NULL, '{}');
            END IF;
        END IF;

        IF OLD.pdf_url IS NULL AND NEW.pdf_url IS NOT NULL THEN
            INSERT INTO consent_audit_log (consent_document_id, action, performed_by, details)
            VALUES (NEW.id, 'pdf_generated', auth.uid(), jsonb_build_object('url', NEW.pdf_url));
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_document_audit
    AFTER INSERT OR UPDATE ON consent_documents
    FOR EACH ROW EXECUTE FUNCTION log_consent_action();

-- Check if consent exists for procedure
CREATE OR REPLACE FUNCTION check_consent_exists(
    p_pet_id UUID,
    p_consent_category TEXT,
    p_tenant_id TEXT
)
RETURNS TABLE (
    has_valid_consent BOOLEAN,
    consent_document_id UUID,
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE,
        cd.id,
        cd.signed_at,
        cd.expires_at
    FROM consent_documents cd
    JOIN consent_templates ct ON cd.template_id = ct.id
    WHERE cd.pet_id = p_pet_id
      AND cd.tenant_id = p_tenant_id
      AND ct.category = p_consent_category
      AND cd.status = 'active'
      AND (cd.expires_at IS NULL OR cd.expires_at > NOW())
    ORDER BY cd.signed_at DESC
    LIMIT 1;

    -- If no specific consent, check blanket consent
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            TRUE,
            bc.consent_document_id,
            bc.granted_at,
            bc.expires_at
        FROM blanket_consents bc
        WHERE (bc.pet_id = p_pet_id OR bc.pet_id IS NULL)
          AND bc.tenant_id = p_tenant_id
          AND bc.consent_type = CASE p_consent_category
              WHEN 'surgery' THEN 'emergency_treatment'
              WHEN 'vaccination' THEN 'vaccination'
              WHEN 'diagnostic' THEN 'diagnostic_imaging'
              ELSE 'routine_care'
          END
          AND bc.is_active = TRUE
          AND (bc.expires_at IS NULL OR bc.expires_at > NOW())
        LIMIT 1;
    END IF;

    -- Return no consent found
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Expire old consents
CREATE OR REPLACE FUNCTION expire_old_consents()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE consent_documents
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;

    UPDATE consent_requests
    SET status = 'expired'
    WHERE status IN ('pending', 'sent', 'viewed')
      AND expires_at < NOW();

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- J. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blanket_consents ENABLE ROW LEVEL SECURITY;

-- Consent Templates: Global visible to all, tenant-specific to staff
CREATE POLICY consent_templates_select ON consent_templates FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY consent_templates_insert ON consent_templates FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

CREATE POLICY consent_templates_update ON consent_templates FOR UPDATE TO authenticated
    USING (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Template Fields
CREATE POLICY consent_template_fields_select ON consent_template_fields FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM consent_templates t WHERE t.id = consent_template_fields.template_id
                AND (t.tenant_id IS NULL OR is_staff_of(t.tenant_id)))
    );

CREATE POLICY consent_template_fields_insert ON consent_template_fields FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM consent_templates t WHERE t.id = consent_template_fields.template_id
                AND t.tenant_id IS NOT NULL AND is_staff_of(t.tenant_id))
    );

-- Consent Documents: Staff manage, owners view their own
CREATE POLICY consent_documents_select_staff ON consent_documents FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY consent_documents_select_owner ON consent_documents FOR SELECT TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY consent_documents_insert ON consent_documents FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id) OR owner_id = auth.uid());

CREATE POLICY consent_documents_update ON consent_documents FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Audit Log: Staff only
CREATE POLICY consent_audit_log_select ON consent_audit_log FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM consent_documents cd WHERE cd.id = consent_audit_log.consent_document_id
                AND is_staff_of(cd.tenant_id))
    );

CREATE POLICY consent_audit_log_insert ON consent_audit_log FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM consent_documents cd WHERE cd.id = consent_audit_log.consent_document_id
                AND (is_staff_of(cd.tenant_id) OR cd.owner_id = auth.uid()))
    );

-- Consent Requests: Staff manage
CREATE POLICY consent_requests_select ON consent_requests FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY consent_requests_insert ON consent_requests FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY consent_requests_update ON consent_requests FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Blanket Consents: Staff and owners
CREATE POLICY blanket_consents_select_staff ON blanket_consents FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY blanket_consents_select_owner ON blanket_consents FOR SELECT TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY blanket_consents_insert ON blanket_consents FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id) OR owner_id = auth.uid());

CREATE POLICY blanket_consents_update ON blanket_consents FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id) OR owner_id = auth.uid());

-- =============================================================================
-- K. SEED CONSENT TEMPLATES
-- =============================================================================

INSERT INTO consent_templates (tenant_id, code, name, category, title, content_html, requires_witness, language) VALUES
(NULL, 'SURGERY_GENERAL', 'Consentimiento Quirúrgico General', 'surgery',
 'Consentimiento para Procedimiento Quirúrgico',
 '<h2>Consentimiento Informado para Cirugía</h2>
<p>Yo, <strong>{{owner_name}}</strong>, propietario/a de <strong>{{pet_name}}</strong>, autorizo al equipo veterinario de {{clinic_name}} a realizar el siguiente procedimiento quirúrgico:</p>
<p><strong>Procedimiento:</strong> {{procedure}}</p>
<p>Entiendo que:</p>
<ul>
<li>Toda cirugía conlleva riesgos, incluyendo pero no limitados a: reacciones a la anestesia, hemorragias, infecciones y en casos raros, la muerte.</li>
<li>Se me ha explicado el procedimiento y he tenido la oportunidad de hacer preguntas.</li>
<li>Autorizo cualquier procedimiento adicional que el veterinario considere necesario durante la cirugía.</li>
</ul>
<p>Declaro haber recibido información sobre los cuidados pre y post operatorios.</p>',
 TRUE, 'es'),

(NULL, 'ANESTHESIA', 'Consentimiento Anestésico', 'anesthesia',
 'Consentimiento para Anestesia',
 '<h2>Consentimiento para Procedimiento Anestésico</h2>
<p>Yo, <strong>{{owner_name}}</strong>, autorizo la administración de anestesia a mi mascota <strong>{{pet_name}}</strong>.</p>
<p>Entiendo los riesgos asociados con la anestesia y he informado al veterinario sobre cualquier condición de salud preexistente.</p>',
 FALSE, 'es'),

(NULL, 'EUTHANASIA', 'Consentimiento para Eutanasia', 'euthanasia',
 'Autorización para Eutanasia Humanitaria',
 '<h2>Consentimiento para Eutanasia</h2>
<p>Yo, <strong>{{owner_name}}</strong>, solicito y autorizo la eutanasia humanitaria de mi mascota <strong>{{pet_name}}</strong>.</p>
<p>Confirmo que:</p>
<ul>
<li>Esta decisión ha sido tomada de manera informada y voluntaria.</li>
<li>He tenido la oportunidad de discutir alternativas con el veterinario.</li>
<li>Entiendo que este procedimiento es irreversible.</li>
</ul>
<p><strong>Disposición de restos:</strong> {{disposition_choice}}</p>',
 TRUE, 'es'),

(NULL, 'BOARDING', 'Contrato de Hospedaje', 'boarding',
 'Contrato de Servicio de Hospedaje',
 '<h2>Contrato de Hospedaje</h2>
<p>Yo, <strong>{{owner_name}}</strong>, dejo a mi mascota <strong>{{pet_name}}</strong> bajo el cuidado de {{clinic_name}} durante el período:</p>
<p><strong>Desde:</strong> {{start_date}} <strong>Hasta:</strong> {{end_date}}</p>
<p>Autorizo el tratamiento médico de emergencia si fuera necesario y acepto los términos y condiciones del servicio de hospedaje.</p>',
 FALSE, 'es'),

(NULL, 'PHOTO_RELEASE', 'Autorización de Uso de Imagen', 'general',
 'Autorización para Uso de Fotografías',
 '<h2>Autorización de Uso de Imagen</h2>
<p>Yo, <strong>{{owner_name}}</strong>, autorizo a {{clinic_name}} a utilizar fotografías de mi mascota <strong>{{pet_name}}</strong> para fines promocionales, educativos y en redes sociales.</p>',
 FALSE, 'es')

ON CONFLICT DO NOTHING;

-- =============================================================================
-- CONSENT SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 26_schema_staff.sql
-- =============================================================================

-- =============================================================================
-- 26_SCHEMA_STAFF.SQL
-- =============================================================================
-- Staff management and scheduling for veterinary clinics.
-- Includes staff profiles, schedules, time off, and shift management.
-- =============================================================================

-- =============================================================================
-- A. STAFF PROFILES (Extended info beyond profiles table)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Employment info
    employee_id TEXT,
    hire_date DATE,
    termination_date DATE,
    employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN (
        'full_time', 'part_time', 'contract', 'intern', 'volunteer'
    )),
    employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN (
        'active', 'on_leave', 'suspended', 'terminated'
    )),

    -- Position
    job_title TEXT NOT NULL,
    department TEXT,
    specializations TEXT[],
    license_number TEXT,
    license_expiry DATE,

    -- Schedule preferences
    preferred_shift TEXT CHECK (preferred_shift IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),
    max_hours_per_week INTEGER DEFAULT 40,
    can_work_weekends BOOLEAN DEFAULT TRUE,
    can_work_holidays BOOLEAN DEFAULT FALSE,

    -- Contact (work)
    work_phone TEXT,
    work_email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    -- Compensation (reference only - actual payroll in separate system)
    hourly_rate DECIMAL(10,2),
    salary_type TEXT CHECK (salary_type IN ('hourly', 'salary', 'commission')),

    -- Skills and certifications
    certifications JSONB DEFAULT '[]',
    -- Structure: [{"name": "", "issued_by": "", "issued_date": "", "expiry_date": ""}]
    skills TEXT[],
    languages TEXT[] DEFAULT ARRAY['es'],

    -- Settings
    color_code TEXT DEFAULT '#3B82F6', -- For calendar display
    can_be_booked BOOLEAN DEFAULT TRUE, -- Can clients book directly

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, tenant_id),
    UNIQUE(tenant_id, employee_id)
);

-- =============================================================================
-- B. WORK SCHEDULES (Regular weekly schedule)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,

    -- Schedule info
    name TEXT NOT NULL DEFAULT 'Regular Schedule',
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES staff_schedules(id) ON DELETE CASCADE,

    -- Day and time
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Break
    break_start TIME,
    break_end TIME,

    -- Location/room
    location TEXT,

    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_break_range CHECK (break_end IS NULL OR break_end > break_start)
);

-- =============================================================================
-- C. SHIFTS (Actual worked shifts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Shift timing
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,

    -- Break
    break_minutes INTEGER DEFAULT 0,

    -- Type
    shift_type TEXT NOT NULL DEFAULT 'regular' CHECK (shift_type IN (
        'regular', 'overtime', 'on_call', 'emergency', 'training', 'meeting'
    )),

    -- Location
    location TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled'
    )),

    -- Clock in/out
    clock_in_at TIMESTAMPTZ,
    clock_out_at TIMESTAMPTZ,
    clock_in_method TEXT CHECK (clock_in_method IN ('manual', 'badge', 'biometric', 'app')),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. TIME OFF REQUESTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS time_off_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,

    -- Type info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Settings
    is_paid BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    max_days_per_year INTEGER,
    min_notice_days INTEGER DEFAULT 1,
    color_code TEXT DEFAULT '#EF4444',

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- Unique index for global time off types (tenant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_time_off_types_global_code
ON time_off_types (code) WHERE tenant_id IS NULL;

CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    time_off_type_id UUID NOT NULL REFERENCES time_off_types(id) ON DELETE CASCADE,

    -- Request details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_half_day BOOLEAN DEFAULT FALSE, -- Start afternoon
    end_half_day BOOLEAN DEFAULT FALSE, -- End morning

    -- Hours/days
    total_days DECIMAL(4,1) NOT NULL,
    total_hours DECIMAL(5,1),

    -- Reason
    reason TEXT,
    attachment_url TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'denied', 'cancelled', 'withdrawn'
    )),

    -- Approval
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Coverage
    coverage_notes TEXT,
    covering_staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- =============================================================================
-- E. TIME OFF BALANCES
-- =============================================================================

CREATE TABLE IF NOT EXISTS time_off_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    time_off_type_id UUID NOT NULL REFERENCES time_off_types(id) ON DELETE CASCADE,

    -- Year
    year INTEGER NOT NULL,

    -- Balance
    allocated_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    used_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    pending_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    carried_over_days DECIMAL(5,1) NOT NULL DEFAULT 0,

    -- Calculated
    available_days DECIMAL(5,1) GENERATED ALWAYS AS (
        allocated_days + carried_over_days - used_days - pending_days
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(staff_profile_id, time_off_type_id, year)
);

-- =============================================================================
-- F. AVAILABILITY OVERRIDES
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_availability_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,

    -- Date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Override type
    override_type TEXT NOT NULL CHECK (override_type IN (
        'available', 'unavailable', 'limited'
    )),

    -- If limited, specify hours
    start_time TIME,
    end_time TIME,

    -- Reason
    reason TEXT,

    -- Recurring?
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'weekly', 'monthly'

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_override_dates CHECK (end_date >= start_date)
);

-- =============================================================================
-- G. STAFF TASKS
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Assignment
    assigned_to UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Task info
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Timing
    due_date TIMESTAMPTZ,
    reminder_at TIMESTAMPTZ,

    -- Related entities
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled', 'deferred'
    )),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. PERFORMANCE / REVIEWS (Simple tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,

    -- Review info
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_type TEXT NOT NULL DEFAULT 'annual' CHECK (review_type IN (
        'annual', 'probation', 'mid_year', 'project', 'incident'
    )),

    -- Reviewer
    reviewed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,

    -- Ratings (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    ratings JSONB DEFAULT '{}',
    -- Structure: {"punctuality": 4, "teamwork": 5, "technical_skills": 4, ...}

    -- Feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,

    -- Employee acknowledgment
    employee_acknowledged BOOLEAN DEFAULT FALSE,
    employee_acknowledged_at TIMESTAMPTZ,
    employee_comments TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'acknowledged', 'finalized'
    )),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_staff_profiles_tenant ON staff_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_user ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_status ON staff_profiles(employment_status);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_bookable ON staff_profiles(can_be_booked) WHERE can_be_booked = TRUE;

CREATE INDEX IF NOT EXISTS idx_staff_schedules_profile ON staff_schedules(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_active ON staff_schedules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_staff_schedule_entries_schedule ON staff_schedule_entries(schedule_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_entries_day ON staff_schedule_entries(day_of_week);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_profile ON staff_shifts(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_tenant ON staff_shifts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_dates ON staff_shifts(scheduled_start, scheduled_end);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_status ON staff_shifts(status);

CREATE INDEX IF NOT EXISTS idx_time_off_types_tenant ON time_off_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_profile ON time_off_requests(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_tenant ON time_off_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON time_off_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_time_off_balances_profile ON time_off_balances(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_off_balances_year ON time_off_balances(year);

CREATE INDEX IF NOT EXISTS idx_staff_availability_profile ON staff_availability_overrides(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_dates ON staff_availability_overrides(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_staff_tasks_tenant ON staff_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned ON staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_due ON staff_tasks(due_date) WHERE status NOT IN ('completed', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_staff_reviews_profile ON staff_reviews(staff_profile_id);

-- =============================================================================
-- J. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_staff_profiles_updated_at
    BEFORE UPDATE ON staff_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_schedules_updated_at
    BEFORE UPDATE ON staff_schedules
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_shifts_updated_at
    BEFORE UPDATE ON staff_shifts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON time_off_requests
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_time_off_balances_updated_at
    BEFORE UPDATE ON time_off_balances
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_tasks_updated_at
    BEFORE UPDATE ON staff_tasks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_staff_reviews_updated_at
    BEFORE UPDATE ON staff_reviews
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- K. FUNCTIONS
-- =============================================================================

-- Get staff availability for a date range
CREATE OR REPLACE FUNCTION get_staff_availability(
    p_tenant_id TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_staff_id UUID DEFAULT NULL
)
RETURNS TABLE (
    staff_profile_id UUID,
    staff_name TEXT,
    date DATE,
    is_available BOOLEAN,
    start_time TIME,
    end_time TIME,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS date
    ),
    staff_list AS (
        SELECT sp.id, p.full_name
        FROM staff_profiles sp
        JOIN profiles p ON sp.user_id = p.id
        WHERE sp.tenant_id = p_tenant_id
          AND sp.employment_status = 'active'
          AND (p_staff_id IS NULL OR sp.id = p_staff_id)
    ),
    regular_schedule AS (
        SELECT
            sl.id AS staff_profile_id,
            sl.full_name AS staff_name,
            ds.date,
            sse.start_time,
            sse.end_time
        FROM staff_list sl
        CROSS JOIN date_series ds
        LEFT JOIN staff_schedules ss ON sl.id = ss.staff_profile_id AND ss.is_active = TRUE
        LEFT JOIN staff_schedule_entries sse ON ss.id = sse.schedule_id
            AND sse.day_of_week = EXTRACT(DOW FROM ds.date)
    ),
    time_off AS (
        SELECT
            tor.staff_profile_id,
            tor.start_date,
            tor.end_date
        FROM time_off_requests tor
        WHERE tor.tenant_id = p_tenant_id
          AND tor.status = 'approved'
          AND tor.start_date <= p_end_date
          AND tor.end_date >= p_start_date
    ),
    overrides AS (
        SELECT
            sao.staff_profile_id,
            sao.start_date,
            sao.end_date,
            sao.override_type,
            sao.start_time,
            sao.end_time,
            sao.reason
        FROM staff_availability_overrides sao
        JOIN staff_list sl ON sao.staff_profile_id = sl.id
        WHERE sao.start_date <= p_end_date
          AND sao.end_date >= p_start_date
    )
    SELECT
        rs.staff_profile_id,
        rs.staff_name,
        rs.date,
        CASE
            WHEN EXISTS (SELECT 1 FROM time_off t WHERE t.staff_profile_id = rs.staff_profile_id
                        AND rs.date BETWEEN t.start_date AND t.end_date) THEN FALSE
            WHEN EXISTS (SELECT 1 FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
                        AND rs.date BETWEEN o.start_date AND o.end_date
                        AND o.override_type = 'unavailable') THEN FALSE
            WHEN rs.start_time IS NOT NULL THEN TRUE
            ELSE FALSE
        END AS is_available,
        COALESCE(
            (SELECT o.start_time FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
             AND rs.date BETWEEN o.start_date AND o.end_date AND o.override_type = 'limited' LIMIT 1),
            rs.start_time
        ) AS start_time,
        COALESCE(
            (SELECT o.end_time FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
             AND rs.date BETWEEN o.start_date AND o.end_date AND o.override_type = 'limited' LIMIT 1),
            rs.end_time
        ) AS end_time,
        (SELECT o.reason FROM overrides o WHERE o.staff_profile_id = rs.staff_profile_id
         AND rs.date BETWEEN o.start_date AND o.end_date LIMIT 1) AS reason
    FROM regular_schedule rs
    ORDER BY rs.staff_profile_id, rs.date;
END;
$$ LANGUAGE plpgsql;

-- Update time off balance when request is approved/cancelled
CREATE OR REPLACE FUNCTION update_time_off_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Request approved
        IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
            UPDATE time_off_balances
            SET used_days = used_days + NEW.total_days,
                pending_days = pending_days - NEW.total_days
            WHERE staff_profile_id = NEW.staff_profile_id
              AND time_off_type_id = NEW.time_off_type_id
              AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        -- Request denied or withdrawn
        IF OLD.status = 'pending' AND NEW.status IN ('denied', 'withdrawn') THEN
            UPDATE time_off_balances
            SET pending_days = pending_days - NEW.total_days
            WHERE staff_profile_id = NEW.staff_profile_id
              AND time_off_type_id = NEW.time_off_type_id
              AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        -- Approved request cancelled
        IF OLD.status = 'approved' AND NEW.status = 'cancelled' THEN
            UPDATE time_off_balances
            SET used_days = used_days - NEW.total_days
            WHERE staff_profile_id = NEW.staff_profile_id
              AND time_off_type_id = NEW.time_off_type_id
              AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        -- New request - add to pending
        UPDATE time_off_balances
        SET pending_days = pending_days + NEW.total_days
        WHERE staff_profile_id = NEW.staff_profile_id
          AND time_off_type_id = NEW.time_off_type_id
          AND year = EXTRACT(YEAR FROM NEW.start_date);

        -- Create balance record if doesn't exist
        INSERT INTO time_off_balances (staff_profile_id, time_off_type_id, year, pending_days)
        VALUES (NEW.staff_profile_id, NEW.time_off_type_id, EXTRACT(YEAR FROM NEW.start_date), NEW.total_days)
        ON CONFLICT (staff_profile_id, time_off_type_id, year) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_off_request_balance_update
    AFTER INSERT OR UPDATE ON time_off_requests
    FOR EACH ROW EXECUTE FUNCTION update_time_off_balance();

-- Get staff schedule for today
CREATE OR REPLACE FUNCTION get_today_schedule(p_tenant_id TEXT)
RETURNS TABLE (
    staff_profile_id UUID,
    staff_name TEXT,
    job_title TEXT,
    shift_start TIMESTAMPTZ,
    shift_end TIMESTAMPTZ,
    shift_status TEXT,
    is_clocked_in BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sp.id,
        p.full_name,
        sp.job_title,
        ss.scheduled_start,
        ss.scheduled_end,
        ss.status,
        ss.clock_in_at IS NOT NULL AND ss.clock_out_at IS NULL
    FROM staff_profiles sp
    JOIN profiles p ON sp.user_id = p.id
    LEFT JOIN staff_shifts ss ON sp.id = ss.staff_profile_id
        AND ss.scheduled_start::date = CURRENT_DATE
    WHERE sp.tenant_id = p_tenant_id
      AND sp.employment_status = 'active'
    ORDER BY ss.scheduled_start NULLS LAST, p.full_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- L. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_reviews ENABLE ROW LEVEL SECURITY;

-- Staff Profiles: Staff can view colleagues, manage own
CREATE POLICY staff_profiles_select ON staff_profiles FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY staff_profiles_insert ON staff_profiles FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY staff_profiles_update ON staff_profiles FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id) AND (user_id = auth.uid() OR
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')));

-- Schedules: Staff can view, admins manage
CREATE POLICY staff_schedules_select ON staff_schedules FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_schedules.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY staff_schedules_insert ON staff_schedules FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_schedules.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY staff_schedules_update ON staff_schedules FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_schedules.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

-- Schedule Entries
CREATE POLICY staff_schedule_entries_all ON staff_schedule_entries FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_schedules ss
                JOIN staff_profiles sp ON ss.staff_profile_id = sp.id
                WHERE ss.id = staff_schedule_entries.schedule_id AND is_staff_of(sp.tenant_id))
    );

-- Shifts
CREATE POLICY staff_shifts_select ON staff_shifts FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY staff_shifts_insert ON staff_shifts FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY staff_shifts_update ON staff_shifts FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Time Off Types
CREATE POLICY time_off_types_select ON time_off_types FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY time_off_types_insert ON time_off_types FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Time Off Requests: Staff view own, admins view all
CREATE POLICY time_off_requests_select ON time_off_requests FOR SELECT TO authenticated
    USING (
        is_staff_of(tenant_id) AND (
            EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = time_off_requests.staff_profile_id
                    AND sp.user_id = auth.uid())
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

CREATE POLICY time_off_requests_insert ON time_off_requests FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = time_off_requests.staff_profile_id
                AND sp.user_id = auth.uid() AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY time_off_requests_update ON time_off_requests FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Time Off Balances
CREATE POLICY time_off_balances_select ON time_off_balances FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = time_off_balances.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND (sp.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
    );

-- Availability Overrides
CREATE POLICY staff_availability_select ON staff_availability_overrides FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_availability_overrides.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

CREATE POLICY staff_availability_insert ON staff_availability_overrides FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_availability_overrides.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND (sp.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
    );

-- Tasks
CREATE POLICY staff_tasks_select ON staff_tasks FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY staff_tasks_insert ON staff_tasks FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY staff_tasks_update ON staff_tasks FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Reviews: Admin only for full access, staff can view own
CREATE POLICY staff_reviews_select ON staff_reviews FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_reviews.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND (sp.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
    );

CREATE POLICY staff_reviews_insert ON staff_reviews FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_reviews.staff_profile_id
                AND is_staff_of(sp.tenant_id)
                AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    );

CREATE POLICY staff_reviews_update ON staff_reviews FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = staff_reviews.staff_profile_id
                AND is_staff_of(sp.tenant_id))
    );

-- =============================================================================
-- M. SEED TIME OFF TYPES
-- =============================================================================

INSERT INTO time_off_types (tenant_id, code, name, is_paid, requires_approval, max_days_per_year, color_code) VALUES
    (NULL, 'VACATION', 'Vacaciones', TRUE, TRUE, 15, '#22C55E'),
    (NULL, 'SICK', 'Enfermedad', TRUE, TRUE, NULL, '#EF4444'),
    (NULL, 'PERSONAL', 'Personal', TRUE, TRUE, 3, '#3B82F6'),
    (NULL, 'MATERNITY', 'Maternidad', TRUE, TRUE, 84, '#EC4899'),
    (NULL, 'PATERNITY', 'Paternidad', TRUE, TRUE, 14, '#8B5CF6'),
    (NULL, 'BEREAVEMENT', 'Duelo', TRUE, FALSE, 5, '#6B7280'),
    (NULL, 'UNPAID', 'Sin Goce de Sueldo', FALSE, TRUE, NULL, '#F59E0B'),
    (NULL, 'TRAINING', 'Capacitación', TRUE, TRUE, 10, '#06B6D4')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STAFF SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 27_schema_messaging.sql
-- =============================================================================

-- =============================================================================
-- 27_SCHEMA_MESSAGING.SQL
-- =============================================================================
-- Client communication and messaging system for veterinary clinics.
-- Includes conversations, messages, templates, and broadcast campaigns.
-- =============================================================================

-- =============================================================================
-- A. CONVERSATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Participants
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL, -- Optional: pet-specific conversation

    -- Conversation info
    subject TEXT,
    channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN (
        'in_app', 'sms', 'whatsapp', 'email'
    )),

    -- Status
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'pending', 'resolved', 'closed', 'spam'
    )),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- Timestamps
    last_message_at TIMESTAMPTZ,
    last_client_message_at TIMESTAMPTZ,
    last_staff_message_at TIMESTAMPTZ,
    client_last_read_at TIMESTAMPTZ,
    staff_last_read_at TIMESTAMPTZ,

    -- Counts
    unread_client_count INTEGER DEFAULT 0,
    unread_staff_count INTEGER DEFAULT 0,

    -- Related entities
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,

    -- Tags
    tags TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- B. MESSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Sender
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'staff', 'system', 'bot')),
    sender_name TEXT, -- Cached for display

    -- Content
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN (
        'text', 'image', 'file', 'audio', 'video', 'location',
        'appointment_card', 'invoice_card', 'prescription_card', 'system'
    )),
    content TEXT,
    content_html TEXT, -- Rich text version

    -- Attachments
    attachments JSONB DEFAULT '[]',
    -- Structure: [{"type": "image", "url": "", "name": "", "size": 0}]

    -- Rich cards (for appointment_card, invoice_card, etc.)
    card_data JSONB,

    -- Reply to
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- Delivery status
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN (
        'pending', 'sent', 'delivered', 'read', 'failed'
    )),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_reason TEXT,

    -- External channel info
    external_message_id TEXT, -- ID from SMS/WhatsApp provider
    external_channel TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- C. MESSAGE TEMPLATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global

    -- Template info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'appointment', 'reminder', 'follow_up', 'marketing', 'transactional',
        'welcome', 'feedback', 'custom'
    )),

    -- Content
    subject TEXT, -- For email
    content TEXT NOT NULL,
    content_html TEXT,

    -- Variables
    variables TEXT[], -- {{pet_name}}, {{appointment_date}}, etc.

    -- Channel settings
    channels TEXT[] DEFAULT ARRAY['in_app'],
    sms_approved BOOLEAN DEFAULT FALSE, -- Pre-approved for SMS
    whatsapp_template_id TEXT,

    -- Language
    language TEXT DEFAULT 'es',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- Unique index for global message templates (tenant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_templates_global_code
ON message_templates (code) WHERE tenant_id IS NULL;

-- =============================================================================
-- D. QUICK REPLIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Quick reply info
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,

    -- Usage
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Ordering
    display_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. BROADCAST CAMPAIGNS
-- =============================================================================

CREATE TABLE IF NOT EXISTS broadcast_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Campaign info
    name TEXT NOT NULL,
    description TEXT,

    -- Content
    template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    content_html TEXT,

    -- Channel
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'sms', 'whatsapp', 'email')),

    -- Audience
    audience_type TEXT NOT NULL CHECK (audience_type IN (
        'all_clients', 'pet_species', 'pet_breed', 'last_visit',
        'no_visit', 'vaccine_due', 'custom_list', 'segment'
    )),
    audience_filter JSONB DEFAULT '{}',
    -- Examples:
    -- {"species": "dog"}
    -- {"last_visit_days_ago": {"min": 30, "max": 90}}
    -- {"vaccine_type": "Rabies", "due_within_days": 30}

    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'
    )),

    -- Stats
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,

    -- Creator
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. BROADCAST RECIPIENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES broadcast_campaigns(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Contact info used
    contact_value TEXT, -- Phone or email used

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'delivered', 'read', 'failed', 'unsubscribed'
    )),

    -- Tracking
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_reason TEXT,

    -- Message reference
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    external_message_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(campaign_id, client_id)
);

-- =============================================================================
-- G. COMMUNICATION PREFERENCES
-- =============================================================================

CREATE TABLE IF NOT EXISTS communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global preference

    -- Channel preferences
    allow_sms BOOLEAN DEFAULT TRUE,
    allow_whatsapp BOOLEAN DEFAULT TRUE,
    allow_email BOOLEAN DEFAULT TRUE,
    allow_in_app BOOLEAN DEFAULT TRUE,
    allow_push BOOLEAN DEFAULT TRUE,

    -- Contact info
    preferred_phone TEXT,
    preferred_email TEXT,
    whatsapp_number TEXT,

    -- Type preferences
    allow_appointment_reminders BOOLEAN DEFAULT TRUE,
    allow_vaccine_reminders BOOLEAN DEFAULT TRUE,
    allow_marketing BOOLEAN DEFAULT FALSE,
    allow_feedback_requests BOOLEAN DEFAULT TRUE,

    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',

    -- Language
    preferred_language TEXT DEFAULT 'es',

    -- Timezone
    timezone TEXT DEFAULT 'America/Asuncion',

    -- Unsubscribe
    unsubscribed_at TIMESTAMPTZ,
    unsubscribe_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, tenant_id)
);

-- Note: notification_preferences table is defined in 22_schema_reminders.sql
-- with client_id column (not user_id/tenant_id), so no additional index needed here

-- =============================================================================
-- H. MESSAGE REACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    reaction TEXT NOT NULL, -- emoji or reaction type

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(message_id, user_id, reaction)
);

-- =============================================================================
-- I. CANNED RESPONSES / AUTO-REPLIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS auto_reply_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Rule info
    name TEXT NOT NULL,
    description TEXT,

    -- Trigger
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'keyword', 'after_hours', 'no_response', 'first_message', 'all'
    )),
    trigger_keywords TEXT[], -- For keyword trigger
    trigger_after_minutes INTEGER, -- For no_response trigger

    -- Response
    response_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    response_content TEXT,

    -- Conditions
    active_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- Days of week
    active_start_time TIME,
    active_end_time TIME,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- J. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_pet ON conversations(pet_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_unread_staff ON conversations(unread_staff_count) WHERE unread_staff_count > 0;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

CREATE INDEX IF NOT EXISTS idx_message_templates_tenant ON message_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_code ON message_templates(code);

CREATE INDEX IF NOT EXISTS idx_quick_replies_tenant ON quick_replies(tenant_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_tenant ON broadcast_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_status ON broadcast_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_scheduled ON broadcast_campaigns(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_campaign ON broadcast_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_client ON broadcast_recipients(client_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_status ON broadcast_recipients(status);

CREATE INDEX IF NOT EXISTS idx_communication_prefs_user ON communication_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_prefs_tenant ON communication_preferences(tenant_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_tenant ON auto_reply_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_active ON auto_reply_rules(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- K. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_broadcast_campaigns_updated_at
    BEFORE UPDATE ON broadcast_campaigns
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_communication_prefs_updated_at
    BEFORE UPDATE ON communication_preferences
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_auto_reply_rules_updated_at
    BEFORE UPDATE ON auto_reply_rules
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- L. FUNCTIONS
-- =============================================================================

-- Update conversation when message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET
        last_message_at = NEW.created_at,
        last_client_message_at = CASE WHEN NEW.sender_type = 'client' THEN NEW.created_at ELSE last_client_message_at END,
        last_staff_message_at = CASE WHEN NEW.sender_type = 'staff' THEN NEW.created_at ELSE last_staff_message_at END,
        unread_client_count = CASE WHEN NEW.sender_type IN ('staff', 'system') THEN unread_client_count + 1 ELSE unread_client_count END,
        unread_staff_count = CASE WHEN NEW.sender_type = 'client' THEN unread_staff_count + 1 ELSE unread_staff_count END,
        status = CASE WHEN status = 'resolved' AND NEW.sender_type = 'client' THEN 'open' ELSE status END
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_update_conversation
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
    p_conversation_id UUID,
    p_user_type TEXT -- 'client' or 'staff'
)
RETURNS VOID AS $$
BEGIN
    IF p_user_type = 'client' THEN
        UPDATE conversations SET
            client_last_read_at = NOW(),
            unread_client_count = 0
        WHERE id = p_conversation_id;

        UPDATE messages SET
            status = 'read',
            read_at = NOW()
        WHERE conversation_id = p_conversation_id
          AND sender_type IN ('staff', 'system')
          AND status != 'read';
    ELSE
        UPDATE conversations SET
            staff_last_read_at = NOW(),
            unread_staff_count = 0
        WHERE id = p_conversation_id;

        UPDATE messages SET
            status = 'read',
            read_at = NOW()
        WHERE conversation_id = p_conversation_id
          AND sender_type = 'client'
          AND status != 'read';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Render template with variables
CREATE OR REPLACE FUNCTION render_message_template(
    p_template_id UUID,
    p_variables JSONB
)
RETURNS TABLE (
    subject TEXT,
    content TEXT,
    content_html TEXT
) AS $$
DECLARE
    v_template message_templates%ROWTYPE;
    v_key TEXT;
    v_value TEXT;
    v_content TEXT;
    v_content_html TEXT;
    v_subject TEXT;
BEGIN
    SELECT * INTO v_template FROM message_templates WHERE id = p_template_id;

    IF v_template IS NULL THEN
        RETURN;
    END IF;

    v_content := v_template.content;
    v_content_html := v_template.content_html;
    v_subject := v_template.subject;

    FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables)
    LOOP
        v_content := REPLACE(v_content, '{{' || v_key || '}}', COALESCE(v_value, ''));
        IF v_content_html IS NOT NULL THEN
            v_content_html := REPLACE(v_content_html, '{{' || v_key || '}}', COALESCE(v_value, ''));
        END IF;
        IF v_subject IS NOT NULL THEN
            v_subject := REPLACE(v_subject, '{{' || v_key || '}}', COALESCE(v_value, ''));
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_subject, v_content, v_content_html;
END;
$$ LANGUAGE plpgsql;

-- Get conversation summary for dashboard
CREATE OR REPLACE FUNCTION get_conversation_summary(p_tenant_id TEXT)
RETURNS TABLE (
    total_open INTEGER,
    total_pending INTEGER,
    unread_count INTEGER,
    avg_response_time_hours DECIMAL,
    by_priority JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE status = 'open')::INTEGER,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER,
        SUM(unread_staff_count)::INTEGER,
        ROUND(AVG(EXTRACT(EPOCH FROM (last_staff_message_at - last_client_message_at)) / 3600)::DECIMAL, 2),
        COALESCE(jsonb_object_agg(priority, cnt) FILTER (WHERE priority IS NOT NULL), '{}'::jsonb)
    FROM (
        SELECT
            status,
            unread_staff_count,
            last_staff_message_at,
            last_client_message_at,
            priority,
            COUNT(*) OVER (PARTITION BY priority) as cnt
        FROM conversations
        WHERE tenant_id = p_tenant_id
          AND status IN ('open', 'pending')
    ) t;
END;
$$ LANGUAGE plpgsql;

-- Check if can send message (respects preferences and quiet hours)
CREATE OR REPLACE FUNCTION can_send_message(
    p_user_id UUID,
    p_channel TEXT,
    p_message_type TEXT DEFAULT 'transactional'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_prefs communication_preferences%ROWTYPE;
    v_now TIME;
BEGIN
    SELECT * INTO v_prefs FROM communication_preferences WHERE user_id = p_user_id LIMIT 1;

    IF v_prefs IS NULL THEN
        RETURN TRUE; -- No preferences = allow all
    END IF;

    -- Check channel preference
    IF p_channel = 'sms' AND NOT v_prefs.allow_sms THEN RETURN FALSE; END IF;
    IF p_channel = 'whatsapp' AND NOT v_prefs.allow_whatsapp THEN RETURN FALSE; END IF;
    IF p_channel = 'email' AND NOT v_prefs.allow_email THEN RETURN FALSE; END IF;
    IF p_channel = 'in_app' AND NOT v_prefs.allow_in_app THEN RETURN FALSE; END IF;

    -- Check message type preference
    IF p_message_type = 'marketing' AND NOT v_prefs.allow_marketing THEN RETURN FALSE; END IF;

    -- Check quiet hours (except for urgent)
    IF v_prefs.quiet_hours_enabled AND p_message_type != 'urgent' THEN
        v_now := LOCALTIME;
        IF v_prefs.quiet_hours_start < v_prefs.quiet_hours_end THEN
            IF v_now >= v_prefs.quiet_hours_start AND v_now < v_prefs.quiet_hours_end THEN
                RETURN FALSE;
            END IF;
        ELSE -- Quiet hours span midnight
            IF v_now >= v_prefs.quiet_hours_start OR v_now < v_prefs.quiet_hours_end THEN
                RETURN FALSE;
            END IF;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- M. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;

-- Conversations: Staff see all, clients see their own
CREATE POLICY conversations_select_staff ON conversations FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY conversations_select_client ON conversations FOR SELECT TO authenticated
    USING (client_id = auth.uid());

CREATE POLICY conversations_insert ON conversations FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id) OR client_id = auth.uid());

CREATE POLICY conversations_update ON conversations FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id) OR client_id = auth.uid());

-- Messages
CREATE POLICY messages_select ON messages FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
                AND (is_staff_of(c.tenant_id) OR c.client_id = auth.uid()))
    );

CREATE POLICY messages_insert ON messages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
                AND (is_staff_of(c.tenant_id) OR c.client_id = auth.uid()))
    );

-- Message Templates
CREATE POLICY message_templates_select ON message_templates FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY message_templates_insert ON message_templates FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

CREATE POLICY message_templates_update ON message_templates FOR UPDATE TO authenticated
    USING (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Quick Replies
CREATE POLICY quick_replies_all ON quick_replies FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- Broadcast Campaigns
CREATE POLICY broadcast_campaigns_all ON broadcast_campaigns FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- Broadcast Recipients
CREATE POLICY broadcast_recipients_select ON broadcast_recipients FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM broadcast_campaigns bc WHERE bc.id = broadcast_recipients.campaign_id
                AND is_staff_of(bc.tenant_id))
        OR client_id = auth.uid()
    );

CREATE POLICY broadcast_recipients_insert ON broadcast_recipients FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM broadcast_campaigns bc WHERE bc.id = broadcast_recipients.campaign_id
                AND is_staff_of(bc.tenant_id))
    );

-- Communication Preferences
CREATE POLICY communication_prefs_select ON communication_preferences FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR (tenant_id IS NOT NULL AND is_staff_of(tenant_id)));

CREATE POLICY communication_prefs_insert ON communication_preferences FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY communication_prefs_update ON communication_preferences FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Message Reactions
CREATE POLICY message_reactions_select ON message_reactions FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM messages m JOIN conversations c ON m.conversation_id = c.id
                WHERE m.id = message_reactions.message_id
                AND (is_staff_of(c.tenant_id) OR c.client_id = auth.uid()))
    );

CREATE POLICY message_reactions_insert ON message_reactions FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY message_reactions_delete ON message_reactions FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Auto Reply Rules
CREATE POLICY auto_reply_rules_all ON auto_reply_rules FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- =============================================================================
-- N. SEED MESSAGE TEMPLATES
-- =============================================================================

INSERT INTO message_templates (tenant_id, code, name, category, content, variables, channels) VALUES
(NULL, 'APPT_CONFIRM', 'Confirmación de Cita', 'appointment',
 'Hola {{owner_name}}, tu cita para {{pet_name}} ha sido confirmada para el {{appointment_date}} a las {{appointment_time}}. Te esperamos en {{clinic_name}}.',
 ARRAY['owner_name', 'pet_name', 'appointment_date', 'appointment_time', 'clinic_name'],
 ARRAY['in_app', 'sms', 'whatsapp']),

(NULL, 'APPT_REMINDER_24H', 'Recordatorio de Cita (24h)', 'reminder',
 'Hola {{owner_name}}, te recordamos que tienes una cita mañana {{appointment_date}} a las {{appointment_time}} para {{pet_name}} en {{clinic_name}}.',
 ARRAY['owner_name', 'pet_name', 'appointment_date', 'appointment_time', 'clinic_name'],
 ARRAY['in_app', 'sms', 'whatsapp']),

(NULL, 'VACCINE_REMINDER', 'Recordatorio de Vacuna', 'reminder',
 'Hola {{owner_name}}, {{pet_name}} tiene pendiente la vacuna {{vaccine_name}}. Por favor agenda una cita llamando al {{clinic_phone}}.',
 ARRAY['owner_name', 'pet_name', 'vaccine_name', 'clinic_phone'],
 ARRAY['in_app', 'sms']),

(NULL, 'FOLLOW_UP', 'Seguimiento Post-Consulta', 'follow_up',
 'Hola {{owner_name}}, ¿cómo sigue {{pet_name}} después de su última visita? Si tienes alguna duda, no dudes en contactarnos.',
 ARRAY['owner_name', 'pet_name'],
 ARRAY['in_app', 'whatsapp']),

(NULL, 'WELCOME', 'Bienvenida', 'welcome',
 'Bienvenido/a a {{clinic_name}}, {{owner_name}}! Gracias por registrar a {{pet_name}}. Estamos aquí para cuidar de tu mascota.',
 ARRAY['clinic_name', 'owner_name', 'pet_name'],
 ARRAY['in_app', 'email']),

(NULL, 'INVOICE_READY', 'Factura Lista', 'transactional',
 'Hola {{owner_name}}, tu factura #{{invoice_number}} por {{amount}} está lista. Puedes verla en tu portal de cliente.',
 ARRAY['owner_name', 'invoice_number', 'amount'],
 ARRAY['in_app', 'email']),

(NULL, 'LAB_RESULTS', 'Resultados de Laboratorio', 'transactional',
 'Hola {{owner_name}}, los resultados de laboratorio de {{pet_name}} están listos. Puedes verlos en tu portal o contactarnos para más información.',
 ARRAY['owner_name', 'pet_name'],
 ARRAY['in_app', 'sms'])

ON CONFLICT DO NOTHING;

-- =============================================================================
-- MESSAGING SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 28_schema_insurance.sql
-- =============================================================================

-- =============================================================================
-- 28_SCHEMA_INSURANCE.SQL
-- =============================================================================
-- Pet insurance and claims management for veterinary clinics.
-- Includes policies, claims, pre-authorizations, and EOB handling.
-- =============================================================================

-- =============================================================================
-- A. INSURANCE PROVIDERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Provider info
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    website TEXT,

    -- Contact
    claims_phone TEXT,
    claims_email TEXT,
    claims_fax TEXT,
    claims_address TEXT,

    -- Integration
    api_endpoint TEXT,
    supports_electronic_claims BOOLEAN DEFAULT FALSE,
    supports_pre_auth BOOLEAN DEFAULT FALSE,
    provider_portal_url TEXT,

    -- Claim settings
    claim_submission_method TEXT DEFAULT 'manual' CHECK (claim_submission_method IN (
        'manual', 'email', 'fax', 'portal', 'api'
    )),
    typical_processing_days INTEGER DEFAULT 14,
    requires_itemized_invoice BOOLEAN DEFAULT TRUE,
    requires_medical_records BOOLEAN DEFAULT TRUE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- B. PET INSURANCE POLICIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS pet_insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES insurance_providers(id) ON DELETE RESTRICT,

    -- Policy info
    policy_number TEXT NOT NULL,
    group_number TEXT,
    member_id TEXT,

    -- Policyholder (may differ from pet owner)
    policyholder_name TEXT NOT NULL,
    policyholder_phone TEXT,
    policyholder_email TEXT,
    policyholder_address TEXT,

    -- Coverage dates
    effective_date DATE NOT NULL,
    expiration_date DATE,
    enrollment_date DATE,

    -- Plan details
    plan_name TEXT,
    plan_type TEXT CHECK (plan_type IN (
        'accident_only', 'accident_illness', 'comprehensive', 'wellness', 'custom'
    )),

    -- Coverage limits
    annual_limit DECIMAL(12,2),
    per_incident_limit DECIMAL(12,2),
    lifetime_limit DECIMAL(12,2),
    deductible_amount DECIMAL(12,2),
    deductible_type TEXT DEFAULT 'annual' CHECK (deductible_type IN ('annual', 'per_incident', 'per_condition')),
    coinsurance_percentage DECIMAL(5,2), -- % clinic is paid (e.g., 80%)
    copay_amount DECIMAL(12,2),

    -- Waiting periods (in days)
    accident_waiting_period INTEGER DEFAULT 0,
    illness_waiting_period INTEGER DEFAULT 14,
    orthopedic_waiting_period INTEGER DEFAULT 180,

    -- Exclusions and notes
    pre_existing_conditions TEXT[],
    excluded_conditions TEXT[],
    coverage_notes TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'pending', 'active', 'expired', 'cancelled', 'suspended'
    )),

    -- Verification
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Document
    policy_document_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider_id, policy_number)
);

-- =============================================================================
-- C. INSURANCE CLAIMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES pet_insurance_policies(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Claim info
    claim_number TEXT, -- Our internal number
    provider_claim_number TEXT, -- Insurance company's number

    -- Related entities
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,

    -- Claim details
    claim_type TEXT NOT NULL CHECK (claim_type IN (
        'accident', 'illness', 'wellness', 'preventive', 'emergency', 'surgery', 'hospitalization'
    )),
    date_of_service DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    diagnosis_code TEXT,
    treatment_description TEXT NOT NULL,

    -- Amounts
    total_charges DECIMAL(12,2) NOT NULL,
    claimed_amount DECIMAL(12,2) NOT NULL,
    deductible_applied DECIMAL(12,2) DEFAULT 0,
    coinsurance_amount DECIMAL(12,2) DEFAULT 0,
    approved_amount DECIMAL(12,2),
    paid_amount DECIMAL(12,2),
    adjustment_amount DECIMAL(12,2) DEFAULT 0,
    adjustment_reason TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_documents', 'submitted', 'under_review',
        'approved', 'partially_approved', 'denied', 'paid', 'appealed', 'closed'
    )),

    -- Dates
    submitted_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,

    -- Submission
    submission_method TEXT CHECK (submission_method IN ('email', 'fax', 'portal', 'api', 'mail')),
    confirmation_number TEXT,

    -- Payment
    payment_method TEXT CHECK (payment_method IN ('check', 'eft', 'credit')),
    payment_reference TEXT,
    payment_to TEXT CHECK (payment_to IN ('clinic', 'policyholder')),

    -- Denial
    denial_reason TEXT,
    denial_code TEXT,
    can_appeal BOOLEAN DEFAULT TRUE,
    appeal_deadline DATE,

    -- Staff handling
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    internal_notes TEXT,
    provider_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. CLAIM LINE ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,

    -- Item details
    service_date DATE NOT NULL,
    service_code TEXT, -- CPT/procedure code if applicable
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,

    -- Approval
    approved_amount DECIMAL(12,2),
    denial_reason TEXT,

    -- Related
    invoice_item_id UUID REFERENCES invoice_items(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. PRE-AUTHORIZATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_pre_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES pet_insurance_policies(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

    -- Pre-auth info
    pre_auth_number TEXT,
    provider_reference TEXT,

    -- Requested procedure
    procedure_description TEXT NOT NULL,
    procedure_code TEXT,
    diagnosis TEXT NOT NULL,
    estimated_cost DECIMAL(12,2) NOT NULL,
    planned_date DATE,

    -- Medical justification
    clinical_justification TEXT NOT NULL,
    supporting_documents TEXT[],

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'draft', 'submitted', 'pending', 'approved', 'denied', 'expired', 'cancelled'
    )),

    -- Approval details
    approved_amount DECIMAL(12,2),
    approved_procedures TEXT[],
    conditions TEXT,
    valid_from DATE,
    valid_until DATE,

    -- Denial
    denial_reason TEXT,

    -- Dates
    submitted_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,

    -- Staff
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. CLAIM DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES insurance_claims(id) ON DELETE CASCADE,
    pre_auth_id UUID REFERENCES insurance_pre_authorizations(id) ON DELETE CASCADE,

    -- Document info
    document_type TEXT NOT NULL CHECK (document_type IN (
        'invoice', 'itemized_statement', 'medical_record', 'lab_result',
        'imaging', 'prescription', 'referral', 'consent', 'eob', 'other'
    )),
    title TEXT NOT NULL,
    description TEXT,

    -- File
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,

    -- Status
    sent_to_insurance BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,

    -- Who
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT claim_or_preauth CHECK (claim_id IS NOT NULL OR pre_auth_id IS NOT NULL)
);

-- =============================================================================
-- G. CLAIM COMMUNICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,

    -- Communication details
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    channel TEXT NOT NULL CHECK (channel IN ('phone', 'email', 'fax', 'portal', 'mail')),

    -- Content
    subject TEXT,
    content TEXT NOT NULL,
    attachments TEXT[],

    -- Contact
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    reference_number TEXT,

    -- Who
    staff_member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Follow-up
    requires_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- H. EXPLANATION OF BENEFITS (EOB)
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_eob (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,

    -- EOB info
    eob_number TEXT,
    eob_date DATE NOT NULL,

    -- Amounts
    billed_amount DECIMAL(12,2) NOT NULL,
    allowed_amount DECIMAL(12,2),
    deductible_amount DECIMAL(12,2),
    coinsurance_amount DECIMAL(12,2),
    copay_amount DECIMAL(12,2),
    other_adjustments DECIMAL(12,2),
    paid_amount DECIMAL(12,2) NOT NULL,
    patient_responsibility DECIMAL(12,2),

    -- Details
    adjustment_codes TEXT[],
    remark_codes TEXT[],
    denial_codes TEXT[],
    notes TEXT,

    -- Document
    eob_document_url TEXT,

    -- Processing
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- I. INSURANCE STATISTICS (For reporting)
-- =============================================================================

CREATE TABLE IF NOT EXISTS insurance_claim_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Counts
    claims_submitted INTEGER DEFAULT 0,
    claims_approved INTEGER DEFAULT 0,
    claims_denied INTEGER DEFAULT 0,
    claims_pending INTEGER DEFAULT 0,

    -- Amounts
    total_submitted DECIMAL(12,2) DEFAULT 0,
    total_approved DECIMAL(12,2) DEFAULT 0,
    total_paid DECIMAL(12,2) DEFAULT 0,
    total_denied DECIMAL(12,2) DEFAULT 0,

    -- Performance
    avg_processing_days DECIMAL(5,1),
    approval_rate DECIMAL(5,2),

    -- Common denials
    top_denial_reasons JSONB DEFAULT '[]',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, provider_id, period_start, period_end)
);

-- =============================================================================
-- J. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_insurance_providers_code ON insurance_providers(code);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_active ON insurance_providers(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_tenant ON pet_insurance_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_pet ON pet_insurance_policies(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_provider ON pet_insurance_policies(provider_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_status ON pet_insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_number ON pet_insurance_policies(policy_number);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_tenant ON insurance_claims(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_pet ON insurance_claims(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_invoice ON insurance_claims(invoice_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_submitted ON insurance_claims(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_items_claim ON insurance_claim_items(claim_id);

CREATE INDEX IF NOT EXISTS idx_insurance_pre_auth_tenant ON insurance_pre_authorizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_pre_auth_policy ON insurance_pre_authorizations(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_pre_auth_status ON insurance_pre_authorizations(status);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_docs_claim ON insurance_claim_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claim_docs_preauth ON insurance_claim_documents(pre_auth_id);

CREATE INDEX IF NOT EXISTS idx_insurance_claim_comms_claim ON insurance_claim_communications(claim_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claim_comms_followup ON insurance_claim_communications(follow_up_date)
    WHERE requires_follow_up = TRUE AND follow_up_completed = FALSE;

CREATE INDEX IF NOT EXISTS idx_insurance_eob_claim ON insurance_eob(claim_id);

CREATE INDEX IF NOT EXISTS idx_insurance_stats_tenant ON insurance_claim_stats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_stats_provider ON insurance_claim_stats(provider_id);

-- =============================================================================
-- K. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_insurance_providers_updated_at
    BEFORE UPDATE ON insurance_providers
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_pet_insurance_policies_updated_at
    BEFORE UPDATE ON pet_insurance_policies
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_insurance_claims_updated_at
    BEFORE UPDATE ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_insurance_pre_auth_updated_at
    BEFORE UPDATE ON insurance_pre_authorizations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_insurance_stats_updated_at
    BEFORE UPDATE ON insurance_claim_stats
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- L. FUNCTIONS
-- =============================================================================

-- Generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number(p_tenant_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_year TEXT;
    v_sequence INTEGER;
BEGIN
    v_prefix := 'CLM';
    v_year := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(claim_number FROM 6) AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM insurance_claims
    WHERE tenant_id = p_tenant_id
      AND claim_number LIKE v_prefix || v_year || '%';

    RETURN v_prefix || v_year || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Calculate claim totals
CREATE OR REPLACE FUNCTION calculate_claim_totals(p_claim_id UUID)
RETURNS TABLE (
    total_charges DECIMAL,
    total_approved DECIMAL,
    patient_responsibility DECIMAL
) AS $$
DECLARE
    v_claim insurance_claims%ROWTYPE;
BEGIN
    SELECT * INTO v_claim FROM insurance_claims WHERE id = p_claim_id;

    RETURN QUERY
    SELECT
        COALESCE(SUM(total_price), 0)::DECIMAL,
        COALESCE(SUM(approved_amount), 0)::DECIMAL,
        (COALESCE(SUM(total_price), 0) - COALESCE(SUM(approved_amount), 0) +
         v_claim.deductible_applied + v_claim.coinsurance_amount)::DECIMAL
    FROM insurance_claim_items
    WHERE claim_id = p_claim_id;
END;
$$ LANGUAGE plpgsql;

-- Check if pet has active insurance
CREATE OR REPLACE FUNCTION get_pet_active_insurance(p_pet_id UUID)
RETURNS TABLE (
    policy_id UUID,
    provider_name TEXT,
    policy_number TEXT,
    plan_name TEXT,
    annual_limit DECIMAL,
    deductible DECIMAL,
    coinsurance DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pip.id,
        ip.name,
        pip.policy_number,
        pip.plan_name,
        pip.annual_limit,
        pip.deductible_amount,
        pip.coinsurance_percentage
    FROM pet_insurance_policies pip
    JOIN insurance_providers ip ON pip.provider_id = ip.id
    WHERE pip.pet_id = p_pet_id
      AND pip.status = 'active'
      AND (pip.expiration_date IS NULL OR pip.expiration_date >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Get claims summary for a policy
CREATE OR REPLACE FUNCTION get_policy_claims_summary(p_policy_id UUID)
RETURNS TABLE (
    total_claims INTEGER,
    total_submitted DECIMAL,
    total_approved DECIMAL,
    total_paid DECIMAL,
    ytd_deductible_met DECIMAL,
    pending_claims INTEGER
) AS $$
DECLARE
    v_year INTEGER;
BEGIN
    v_year := EXTRACT(YEAR FROM CURRENT_DATE);

    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER,
        COALESCE(SUM(claimed_amount), 0)::DECIMAL,
        COALESCE(SUM(approved_amount), 0)::DECIMAL,
        COALESCE(SUM(paid_amount), 0)::DECIMAL,
        COALESCE(SUM(deductible_applied) FILTER (WHERE EXTRACT(YEAR FROM date_of_service) = v_year), 0)::DECIMAL,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review', 'pending_documents'))::INTEGER
    FROM insurance_claims
    WHERE policy_id = p_policy_id;
END;
$$ LANGUAGE plpgsql;

-- Update claim status and trigger appropriate actions
CREATE OR REPLACE FUNCTION update_claim_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Set timestamps based on status changes
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'submitted' THEN
                NEW.submitted_at := COALESCE(NEW.submitted_at, NOW());
            WHEN 'approved', 'partially_approved', 'denied' THEN
                NEW.processed_at := COALESCE(NEW.processed_at, NOW());
            WHEN 'paid' THEN
                NEW.paid_at := COALESCE(NEW.paid_at, NOW());
            WHEN 'closed' THEN
                NEW.closed_at := COALESCE(NEW.closed_at, NOW());
            ELSE
                -- No action needed
        END CASE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER insurance_claim_status_update
    BEFORE UPDATE ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION update_claim_status();

-- =============================================================================
-- M. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_pre_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_eob ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claim_stats ENABLE ROW LEVEL SECURITY;

-- Insurance Providers: Public read
CREATE POLICY insurance_providers_select ON insurance_providers FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY insurance_providers_insert ON insurance_providers FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY insurance_providers_update ON insurance_providers FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Pet Insurance Policies: Staff and pet owners
CREATE POLICY pet_insurance_policies_select_staff ON pet_insurance_policies FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY pet_insurance_policies_select_owner ON pet_insurance_policies FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_insurance_policies.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY pet_insurance_policies_insert ON pet_insurance_policies FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY pet_insurance_policies_update ON pet_insurance_policies FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Insurance Claims: Staff manage, owners view
CREATE POLICY insurance_claims_select_staff ON insurance_claims FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY insurance_claims_select_owner ON insurance_claims FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = insurance_claims.pet_id AND pets.owner_id = auth.uid()));

CREATE POLICY insurance_claims_insert ON insurance_claims FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY insurance_claims_update ON insurance_claims FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Claim Items
CREATE POLICY insurance_claim_items_select ON insurance_claim_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_items.claim_id
           AND (is_staff_of(ic.tenant_id) OR EXISTS (SELECT 1 FROM pets WHERE pets.id = ic.pet_id AND pets.owner_id = auth.uid()))));

CREATE POLICY insurance_claim_items_insert ON insurance_claim_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_items.claim_id AND is_staff_of(ic.tenant_id)));

-- Pre-authorizations: Staff only
CREATE POLICY insurance_pre_auth_select ON insurance_pre_authorizations FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY insurance_pre_auth_insert ON insurance_pre_authorizations FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id));

CREATE POLICY insurance_pre_auth_update ON insurance_pre_authorizations FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id));

-- Documents, Communications, EOB: Staff only
CREATE POLICY insurance_claim_docs_all ON insurance_claim_documents FOR ALL TO authenticated
    USING (
        (claim_id IS NOT NULL AND EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_documents.claim_id AND is_staff_of(ic.tenant_id)))
        OR
        (pre_auth_id IS NOT NULL AND EXISTS (SELECT 1 FROM insurance_pre_authorizations pa WHERE pa.id = insurance_claim_documents.pre_auth_id AND is_staff_of(pa.tenant_id)))
    );

CREATE POLICY insurance_claim_comms_all ON insurance_claim_communications FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_claim_communications.claim_id AND is_staff_of(ic.tenant_id)));

CREATE POLICY insurance_eob_all ON insurance_eob FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM insurance_claims ic WHERE ic.id = insurance_eob.claim_id AND is_staff_of(ic.tenant_id)));

-- Stats: Staff only
CREATE POLICY insurance_stats_select ON insurance_claim_stats FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

-- =============================================================================
-- N. SEED INSURANCE PROVIDERS
-- =============================================================================

INSERT INTO insurance_providers (code, name, website, supports_electronic_claims, typical_processing_days) VALUES
    ('PETPLAN', 'Petplan', 'https://www.petplan.com', FALSE, 14),
    ('EMBRACE', 'Embrace Pet Insurance', 'https://www.embracepetinsurance.com', FALSE, 10),
    ('NATIONWIDE', 'Nationwide Pet Insurance', 'https://www.petinsurance.com', FALSE, 14),
    ('TRUPANION', 'Trupanion', 'https://www.trupanion.com', TRUE, 5),
    ('HEALTHY_PAWS', 'Healthy Paws', 'https://www.healthypawspetinsurance.com', FALSE, 7),
    ('FIGO', 'Figo Pet Insurance', 'https://www.figopetinsurance.com', FALSE, 10),
    ('ASPCA', 'ASPCA Pet Health Insurance', 'https://www.aspcapetinsurance.com', FALSE, 14),
    ('OTHER', 'Other Provider', NULL, FALSE, 21)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- INSURANCE SCHEMA COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 29_soft_deletes.sql
-- =============================================================================

-- =============================================================================
-- 29_SOFT_DELETES.SQL
-- =============================================================================
-- Implements soft delete functionality for data recovery and compliance.
-- Adds deleted_at columns and archive tables for critical data.
-- =============================================================================

-- =============================================================================
-- A. ADD SOFT DELETE COLUMNS TO CRITICAL TABLES
-- =============================================================================

-- Core tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Pet-related tables
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE vaccines ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Financial tables
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Hospitalization
ALTER TABLE hospitalizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE hospitalizations ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Lab results
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Consent
ALTER TABLE consent_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE consent_documents ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Messages
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- =============================================================================
-- B. CREATE INDEXES FOR SOFT DELETE QUERIES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pets_deleted ON pets(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vaccines_deleted ON vaccines(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_medical_records_deleted ON medical_records(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_deleted ON prescriptions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_deleted ON appointments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_deleted ON payments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hospitalizations_deleted ON hospitalizations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_orders_deleted ON lab_orders(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consent_documents_deleted ON consent_documents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_deleted ON conversations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- C. ARCHIVE TABLES FOR PERMANENT DELETION
-- =============================================================================

-- Archive table for permanently deleted pets
CREATE TABLE IF NOT EXISTS archived_pets (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    tenant_id TEXT NOT NULL,
    owner_id UUID,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for medical records
CREATE TABLE IF NOT EXISTS archived_medical_records (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    pet_id UUID,
    tenant_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for invoices (financial compliance)
CREATE TABLE IF NOT EXISTS archived_invoices (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    invoice_number TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for consent documents (legal compliance)
CREATE TABLE IF NOT EXISTS archived_consent_documents (
    id UUID PRIMARY KEY,
    original_data JSONB NOT NULL,
    document_number TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL,
    deleted_by UUID,
    deletion_reason TEXT,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- D. SOFT DELETE FUNCTIONS
-- =============================================================================

-- Generic soft delete function
CREATE OR REPLACE FUNCTION soft_delete(
    p_table_name TEXT,
    p_id UUID,
    p_deleted_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sql TEXT;
    v_affected INTEGER;
BEGIN
    v_sql := format(
        'UPDATE %I SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND deleted_at IS NULL',
        p_table_name
    );

    EXECUTE v_sql USING p_deleted_by, p_id;
    GET DIAGNOSTICS v_affected = ROW_COUNT;

    RETURN v_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Restore soft deleted record
CREATE OR REPLACE FUNCTION restore_deleted(
    p_table_name TEXT,
    p_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sql TEXT;
    v_affected INTEGER;
BEGIN
    v_sql := format(
        'UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
        p_table_name
    );

    EXECUTE v_sql USING p_id;
    GET DIAGNOSTICS v_affected = ROW_COUNT;

    RETURN v_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- Soft delete pet with cascade to related records
CREATE OR REPLACE FUNCTION soft_delete_pet(
    p_pet_id UUID,
    p_deleted_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Soft delete the pet
    UPDATE pets SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE id = p_pet_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Soft delete related records
    UPDATE vaccines SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE medical_records SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE prescriptions SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE appointments SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE hospitalizations SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    UPDATE lab_orders SET deleted_at = NOW(), deleted_by = p_deleted_by
    WHERE pet_id = p_pet_id AND deleted_at IS NULL;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Restore pet with cascade
CREATE OR REPLACE FUNCTION restore_pet(p_pet_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Restore the pet
    UPDATE pets SET deleted_at = NULL, deleted_by = NULL
    WHERE id = p_pet_id AND deleted_at IS NOT NULL;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Restore related records
    UPDATE vaccines SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE medical_records SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE prescriptions SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE appointments SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE hospitalizations SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    UPDATE lab_orders SET deleted_at = NULL, deleted_by = NULL
    WHERE pet_id = p_pet_id AND deleted_at IS NOT NULL;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Permanently delete and archive a pet
CREATE OR REPLACE FUNCTION permanent_delete_pet(
    p_pet_id UUID,
    p_deletion_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_pet pets%ROWTYPE;
BEGIN
    -- Get the pet data
    SELECT * INTO v_pet FROM pets WHERE id = p_pet_id;

    IF v_pet IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Archive the pet
    INSERT INTO archived_pets (id, original_data, tenant_id, owner_id, deleted_at, deleted_by, deletion_reason)
    VALUES (
        v_pet.id,
        to_jsonb(v_pet),
        v_pet.tenant_id,
        v_pet.owner_id,
        COALESCE(v_pet.deleted_at, NOW()),
        v_pet.deleted_by,
        p_deletion_reason
    );

    -- Archive medical records
    INSERT INTO archived_medical_records (id, original_data, pet_id, tenant_id, deleted_at, deleted_by, deletion_reason)
    SELECT
        mr.id,
        to_jsonb(mr),
        mr.pet_id,
        mr.tenant_id,
        COALESCE(mr.deleted_at, NOW()),
        mr.deleted_by,
        p_deletion_reason
    FROM medical_records mr
    WHERE mr.pet_id = p_pet_id;

    -- Delete the pet (cascades to related tables)
    DELETE FROM pets WHERE id = p_pet_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- E. VIEWS FOR ACTIVE RECORDS (Exclude soft deleted)
-- =============================================================================

-- Active pets view
CREATE OR REPLACE VIEW active_pets AS
SELECT * FROM pets WHERE deleted_at IS NULL;

-- Active vaccines view
CREATE OR REPLACE VIEW active_vaccines AS
SELECT * FROM vaccines WHERE deleted_at IS NULL;

-- Active medical records view
CREATE OR REPLACE VIEW active_medical_records AS
SELECT * FROM medical_records WHERE deleted_at IS NULL;

-- Active appointments view
CREATE OR REPLACE VIEW active_appointments AS
SELECT * FROM appointments WHERE deleted_at IS NULL;

-- Active invoices view
CREATE OR REPLACE VIEW active_invoices AS
SELECT * FROM invoices WHERE deleted_at IS NULL;

-- Active hospitalizations view
CREATE OR REPLACE VIEW active_hospitalizations AS
SELECT * FROM hospitalizations WHERE deleted_at IS NULL;

-- Active conversations view
CREATE OR REPLACE VIEW active_conversations AS
SELECT * FROM conversations WHERE deleted_at IS NULL;

-- =============================================================================
-- F. TRASH BIN VIEW
-- =============================================================================

-- Combined trash bin view for all deleted records
CREATE OR REPLACE VIEW trash_bin AS
SELECT
    id,
    'pet' AS record_type,
    name AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM pets WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'medical_record' AS record_type,
    title,
    tenant_id,
    deleted_at,
    deleted_by
FROM medical_records WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'appointment' AS record_type,
    reason AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM appointments WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'invoice' AS record_type,
    invoice_number AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM invoices WHERE deleted_at IS NOT NULL

UNION ALL

SELECT
    id,
    'hospitalization' AS record_type,
    hospitalization_number AS title,
    tenant_id,
    deleted_at,
    deleted_by
FROM hospitalizations WHERE deleted_at IS NOT NULL

ORDER BY deleted_at DESC;

-- =============================================================================
-- G. AUTOMATIC PURGE FUNCTION
-- =============================================================================

-- Permanently delete records older than retention period
CREATE OR REPLACE FUNCTION purge_old_deleted_records(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS TABLE (
    table_name TEXT,
    records_purged INTEGER
) AS $$
DECLARE
    v_cutoff_date TIMESTAMPTZ;
    v_count INTEGER;
BEGIN
    v_cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;

    -- Purge old deleted pets (archive first)
    WITH deleted AS (
        SELECT p.* FROM pets p
        WHERE p.deleted_at < v_cutoff_date
    )
    INSERT INTO archived_pets (id, original_data, tenant_id, owner_id, deleted_at, deleted_by, deletion_reason)
    SELECT id, to_jsonb(deleted.*), tenant_id, owner_id, deleted_at, deleted_by, 'Auto-purged after retention period'
    FROM deleted
    ON CONFLICT (id) DO NOTHING;

    DELETE FROM pets WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'pets'; records_purged := v_count;
    RETURN NEXT;

    -- Purge old deleted medical records
    WITH deleted AS (
        SELECT mr.* FROM medical_records mr
        WHERE mr.deleted_at < v_cutoff_date
    )
    INSERT INTO archived_medical_records (id, original_data, pet_id, tenant_id, deleted_at, deleted_by, deletion_reason)
    SELECT id, to_jsonb(deleted.*), pet_id, tenant_id, deleted_at, deleted_by, 'Auto-purged after retention period'
    FROM deleted
    ON CONFLICT (id) DO NOTHING;

    DELETE FROM medical_records WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'medical_records'; records_purged := v_count;
    RETURN NEXT;

    -- Purge old deleted invoices (archive for compliance)
    WITH deleted AS (
        SELECT i.* FROM invoices i
        WHERE i.deleted_at < v_cutoff_date
    )
    INSERT INTO archived_invoices (id, original_data, invoice_number, tenant_id, deleted_at, deleted_by, deletion_reason)
    SELECT id, to_jsonb(deleted.*), invoice_number, tenant_id, deleted_at, deleted_by, 'Auto-purged after retention period'
    FROM deleted
    ON CONFLICT (id) DO NOTHING;

    DELETE FROM invoices WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'invoices'; records_purged := v_count;
    RETURN NEXT;

    -- Purge vaccines (no archive, referenced by pet archive)
    DELETE FROM vaccines WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'vaccines'; records_purged := v_count;
    RETURN NEXT;

    -- Purge appointments
    DELETE FROM appointments WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'appointments'; records_purged := v_count;
    RETURN NEXT;

    -- Purge prescriptions
    DELETE FROM prescriptions WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'prescriptions'; records_purged := v_count;
    RETURN NEXT;

    -- Purge hospitalizations
    DELETE FROM hospitalizations WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'hospitalizations'; records_purged := v_count;
    RETURN NEXT;

    -- Purge lab orders
    DELETE FROM lab_orders WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'lab_orders'; records_purged := v_count;
    RETURN NEXT;

    -- Purge messages and conversations
    DELETE FROM messages WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'messages'; records_purged := v_count;
    RETURN NEXT;

    DELETE FROM conversations WHERE deleted_at < v_cutoff_date;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    table_name := 'conversations'; records_purged := v_count;
    RETURN NEXT;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. GRANT ACCESS TO VIEWS
-- =============================================================================

GRANT SELECT ON active_pets TO authenticated;
GRANT SELECT ON active_vaccines TO authenticated;
GRANT SELECT ON active_medical_records TO authenticated;
GRANT SELECT ON active_appointments TO authenticated;
GRANT SELECT ON active_invoices TO authenticated;
GRANT SELECT ON active_hospitalizations TO authenticated;
GRANT SELECT ON active_conversations TO authenticated;
GRANT SELECT ON trash_bin TO authenticated;

-- =============================================================================
-- I. RLS FOR ARCHIVE TABLES
-- =============================================================================

ALTER TABLE archived_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_consent_documents ENABLE ROW LEVEL SECURITY;

-- Archives are admin-only access
CREATE POLICY archived_pets_admin ON archived_pets FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY archived_medical_records_admin ON archived_medical_records FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY archived_invoices_admin ON archived_invoices FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY archived_consent_documents_admin ON archived_consent_documents FOR ALL TO authenticated
    USING (is_staff_of(tenant_id) AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- SOFT DELETES COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 30_enhanced_audit.sql
-- =============================================================================

-- =============================================================================
-- 30_ENHANCED_AUDIT.SQL
-- =============================================================================
-- Enhanced audit logging system for compliance and security tracking.
-- Captures detailed change history with before/after values.
-- =============================================================================

-- =============================================================================
-- A. ENHANCED AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_log_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What changed
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),

    -- Change details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],

    -- Context
    tenant_id TEXT,
    user_id UUID,
    user_email TEXT,
    user_role TEXT,
    session_id TEXT,

    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    api_endpoint TEXT,

    -- Timestamp
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Compliance
    data_classification TEXT DEFAULT 'internal' CHECK (data_classification IN (
        'public', 'internal', 'confidential', 'restricted'
    )),
    retention_until DATE,
    compliance_tags TEXT[]
);

-- =============================================================================
-- B. AUDIT CONFIGURATION TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,

    -- What to audit
    audit_inserts BOOLEAN DEFAULT TRUE,
    audit_updates BOOLEAN DEFAULT TRUE,
    audit_deletes BOOLEAN DEFAULT TRUE,

    -- What to capture
    capture_old_values BOOLEAN DEFAULT TRUE,
    capture_new_values BOOLEAN DEFAULT TRUE,
    excluded_columns TEXT[] DEFAULT ARRAY['updated_at', 'created_at'],
    sensitive_columns TEXT[] DEFAULT ARRAY[]::TEXT[], -- Columns to mask

    -- Classification
    data_classification TEXT DEFAULT 'internal',

    -- Retention
    retention_days INTEGER DEFAULT 365,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- C. SECURITY EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event type
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_success', 'login_failure', 'logout', 'password_change',
        'password_reset_request', 'password_reset_complete',
        'mfa_enabled', 'mfa_disabled', 'mfa_challenge_success', 'mfa_challenge_failure',
        'role_change', 'permission_denied', 'suspicious_activity',
        'data_export', 'bulk_delete', 'api_key_created', 'api_key_revoked',
        'session_hijack_attempt', 'brute_force_detected', 'account_locked',
        'account_unlocked', 'email_change', 'phone_change'
    )),

    -- Who
    user_id UUID,
    user_email TEXT,
    target_user_id UUID, -- For actions on other users

    -- Context
    tenant_id TEXT,
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB,

    -- Details
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),

    -- Status
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,

    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- D. DATA ACCESS LOG (For sensitive data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What was accessed
    table_name TEXT NOT NULL,
    record_id UUID,
    record_count INTEGER,
    query_type TEXT NOT NULL CHECK (query_type IN ('SELECT', 'EXPORT', 'REPORT', 'API')),

    -- Who accessed
    user_id UUID,
    user_email TEXT,
    user_role TEXT,

    -- Context
    tenant_id TEXT,
    ip_address INET,
    purpose TEXT,
    justification TEXT,

    -- Query info
    query_hash TEXT, -- Hash of the query for pattern analysis
    fields_accessed TEXT[],
    filter_criteria JSONB,

    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- E. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_enhanced_table ON audit_log_enhanced(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_record ON audit_log_enhanced(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_user ON audit_log_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_tenant ON audit_log_enhanced(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_time ON audit_log_enhanced(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_operation ON audit_log_enhanced(operation);
CREATE INDEX IF NOT EXISTS idx_audit_enhanced_table_record ON audit_log_enhanced(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_time ON security_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_unacked ON security_events(acknowledged) WHERE acknowledged = FALSE;
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

CREATE INDEX IF NOT EXISTS idx_data_access_table ON data_access_log(table_name);
CREATE INDEX IF NOT EXISTS idx_data_access_user ON data_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_time ON data_access_log(occurred_at DESC);

-- =============================================================================
-- F. AUDIT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_config audit_configuration%ROWTYPE;
    v_old_values JSONB;
    v_new_values JSONB;
    v_changed_fields TEXT[];
    v_user_id UUID;
    v_user_email TEXT;
    v_user_role TEXT;
    v_tenant_id TEXT;
    v_key TEXT;
BEGIN
    -- Get configuration for this table
    SELECT * INTO v_config FROM audit_configuration
    WHERE table_name = TG_TABLE_NAME AND is_active = TRUE;

    -- If no config or not auditing this operation, skip
    IF v_config IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'INSERT' AND NOT v_config.audit_inserts THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' AND NOT v_config.audit_updates THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'DELETE' AND NOT v_config.audit_deletes THEN
        RETURN OLD;
    END IF;

    -- Get current user context
    BEGIN
        v_user_id := auth.uid();
        SELECT email, role INTO v_user_email, v_user_role
        FROM profiles WHERE id = v_user_id;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Prepare old/new values
    IF TG_OP IN ('UPDATE', 'DELETE') AND v_config.capture_old_values THEN
        v_old_values := to_jsonb(OLD);

        -- Remove excluded columns
        FOREACH v_key IN ARRAY COALESCE(v_config.excluded_columns, ARRAY[]::TEXT[])
        LOOP
            v_old_values := v_old_values - v_key;
        END LOOP;

        -- Mask sensitive columns
        FOREACH v_key IN ARRAY COALESCE(v_config.sensitive_columns, ARRAY[]::TEXT[])
        LOOP
            IF v_old_values ? v_key THEN
                v_old_values := jsonb_set(v_old_values, ARRAY[v_key], '"[REDACTED]"');
            END IF;
        END LOOP;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') AND v_config.capture_new_values THEN
        v_new_values := to_jsonb(NEW);

        -- Remove excluded columns
        FOREACH v_key IN ARRAY COALESCE(v_config.excluded_columns, ARRAY[]::TEXT[])
        LOOP
            v_new_values := v_new_values - v_key;
        END LOOP;

        -- Mask sensitive columns
        FOREACH v_key IN ARRAY COALESCE(v_config.sensitive_columns, ARRAY[]::TEXT[])
        LOOP
            IF v_new_values ? v_key THEN
                v_new_values := jsonb_set(v_new_values, ARRAY[v_key], '"[REDACTED]"');
            END IF;
        END LOOP;
    END IF;

    -- Calculate changed fields for UPDATE
    IF TG_OP = 'UPDATE' THEN
        SELECT ARRAY_AGG(key) INTO v_changed_fields
        FROM (
            SELECT key
            FROM jsonb_each(to_jsonb(NEW)) n
            FULL OUTER JOIN jsonb_each(to_jsonb(OLD)) o USING (key)
            WHERE n.value IS DISTINCT FROM o.value
              AND key != ALL(COALESCE(v_config.excluded_columns, ARRAY[]::TEXT[]))
        ) changed;
    END IF;

    -- Get tenant_id if it exists
    IF TG_OP = 'DELETE' THEN
        v_tenant_id := OLD.tenant_id;
    ELSE
        v_tenant_id := NEW.tenant_id;
    END IF;

    -- Insert audit record
    INSERT INTO audit_log_enhanced (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        tenant_id,
        user_id,
        user_email,
        user_role,
        data_classification,
        retention_until
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_old_values,
        v_new_values,
        v_changed_fields,
        v_tenant_id,
        v_user_id,
        v_user_email,
        v_user_role,
        v_config.data_classification,
        CURRENT_DATE + (v_config.retention_days || ' days')::INTERVAL
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- G. HELPER FUNCTIONS
-- =============================================================================

-- Enable auditing for a table
CREATE OR REPLACE FUNCTION enable_audit_for_table(
    p_table_name TEXT,
    p_classification TEXT DEFAULT 'internal',
    p_sensitive_columns TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update configuration
    INSERT INTO audit_configuration (table_name, data_classification, sensitive_columns)
    VALUES (p_table_name, p_classification, p_sensitive_columns)
    ON CONFLICT (table_name) DO UPDATE SET
        is_active = TRUE,
        data_classification = EXCLUDED.data_classification,
        sensitive_columns = EXCLUDED.sensitive_columns;

    -- Create trigger if not exists
    EXECUTE format(
        'DROP TRIGGER IF EXISTS audit_trigger_%I ON %I',
        p_table_name, p_table_name
    );

    EXECUTE format(
        'CREATE TRIGGER audit_trigger_%I
         AFTER INSERT OR UPDATE OR DELETE ON %I
         FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()',
        p_table_name, p_table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Disable auditing for a table
CREATE OR REPLACE FUNCTION disable_audit_for_table(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE audit_configuration SET is_active = FALSE WHERE table_name = p_table_name;

    EXECUTE format(
        'DROP TRIGGER IF EXISTS audit_trigger_%I ON %I',
        p_table_name, p_table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Log security event
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::JSONB,
    p_severity TEXT DEFAULT 'info',
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_user_email TEXT;
BEGIN
    -- Get user email if user_id provided
    IF p_user_id IS NOT NULL THEN
        SELECT email INTO v_user_email FROM profiles WHERE id = p_user_id;
    END IF;

    INSERT INTO security_events (
        event_type,
        user_id,
        user_email,
        details,
        severity,
        ip_address
    ) VALUES (
        p_event_type,
        COALESCE(p_user_id, auth.uid()),
        v_user_email,
        p_details,
        p_severity,
        p_ip_address
    ) RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Get audit history for a record
CREATE OR REPLACE FUNCTION get_record_audit_history(
    p_table_name TEXT,
    p_record_id UUID
)
RETURNS TABLE (
    operation TEXT,
    changed_fields TEXT[],
    old_values JSONB,
    new_values JSONB,
    user_email TEXT,
    occurred_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.operation,
        a.changed_fields,
        a.old_values,
        a.new_values,
        a.user_email,
        a.occurred_at
    FROM audit_log_enhanced a
    WHERE a.table_name = p_table_name
      AND a.record_id = p_record_id
    ORDER BY a.occurred_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get recent security events summary
CREATE OR REPLACE FUNCTION get_security_summary(
    p_tenant_id TEXT DEFAULT NULL,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    event_type TEXT,
    count BIGINT,
    latest_occurrence TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        se.event_type,
        COUNT(*),
        MAX(se.occurred_at)
    FROM security_events se
    WHERE se.occurred_at > NOW() - (p_hours || ' hours')::INTERVAL
      AND (p_tenant_id IS NULL OR se.tenant_id = p_tenant_id)
    GROUP BY se.event_type
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Purge old audit logs based on retention
CREATE OR REPLACE FUNCTION purge_expired_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM audit_log_enhanced
    WHERE retention_until < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. ENABLE AUDITING FOR CRITICAL TABLES
-- =============================================================================

-- Medical data (confidential)
SELECT enable_audit_for_table('pets', 'confidential', ARRAY['microchip_id']);
SELECT enable_audit_for_table('medical_records', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('prescriptions', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('vaccines', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('lab_results', 'confidential', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('hospitalizations', 'confidential', ARRAY[]::TEXT[]);

-- Financial data (restricted)
SELECT enable_audit_for_table('invoices', 'restricted', ARRAY[]::TEXT[]);
SELECT enable_audit_for_table('payments', 'restricted', ARRAY['payment_reference']);
SELECT enable_audit_for_table('refunds', 'restricted', ARRAY[]::TEXT[]);

-- Consent documents (restricted)
SELECT enable_audit_for_table('consent_documents', 'restricted', ARRAY['signature_data', 'signature_hash']);

-- User/Profile data (confidential)
SELECT enable_audit_for_table('profiles', 'confidential', ARRAY['phone']);

-- Insurance (confidential)
SELECT enable_audit_for_table('pet_insurance_policies', 'confidential', ARRAY['policy_number', 'member_id']);
SELECT enable_audit_for_table('insurance_claims', 'confidential', ARRAY[]::TEXT[]);

-- =============================================================================
-- I. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE audit_log_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;

-- Audit logs: Admin only
CREATE POLICY audit_log_enhanced_admin ON audit_log_enhanced FOR SELECT TO authenticated
    USING (
        (tenant_id IS NULL OR is_staff_of(tenant_id))
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Audit configuration: Admin only
CREATE POLICY audit_configuration_admin ON audit_configuration FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Security events: Admin only, can see their tenant's events
CREATE POLICY security_events_admin ON security_events FOR SELECT TO authenticated
    USING (
        (tenant_id IS NULL OR is_staff_of(tenant_id))
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Data access log: Admin only
CREATE POLICY data_access_log_admin ON data_access_log FOR SELECT TO authenticated
    USING (
        (tenant_id IS NULL OR is_staff_of(tenant_id))
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =============================================================================
-- J. VIEWS FOR AUDIT REPORTING
-- =============================================================================

-- Recent high-severity security events
CREATE OR REPLACE VIEW critical_security_events AS
SELECT
    se.id,
    se.event_type,
    se.user_email,
    se.details,
    se.ip_address,
    se.occurred_at,
    se.acknowledged
FROM security_events se
WHERE se.severity = 'critical'
  AND se.occurred_at > NOW() - INTERVAL '7 days'
ORDER BY se.occurred_at DESC;

-- Audit activity summary by table
CREATE OR REPLACE VIEW audit_activity_summary AS
SELECT
    table_name,
    operation,
    COUNT(*) as operation_count,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(occurred_at) as last_activity
FROM audit_log_enhanced
WHERE occurred_at > NOW() - INTERVAL '30 days'
GROUP BY table_name, operation
ORDER BY table_name, operation;

-- Grant access to views
GRANT SELECT ON critical_security_events TO authenticated;
GRANT SELECT ON audit_activity_summary TO authenticated;

-- =============================================================================
-- ENHANCED AUDIT COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 31_materialized_views.sql
-- =============================================================================

-- =============================================================================
-- 31_MATERIALIZED_VIEWS.SQL
-- =============================================================================
-- Materialized views for dashboard performance optimization.
-- Pre-computed aggregations that are refreshed periodically.
-- =============================================================================

-- =============================================================================
-- A. CLINIC DASHBOARD STATS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_clinic_dashboard_stats AS
SELECT
    t.id AS tenant_id,
    t.name AS clinic_name,

    -- Pet counts
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) AS total_pets,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'dog') AS total_dogs,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'cat') AS total_cats,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species NOT IN ('dog', 'cat')) AS total_other,

    -- Client counts
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role = 'owner') AS total_clients,

    -- Today's appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE) AS today_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'confirmed') AS today_confirmed,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'completed') AS today_completed,

    -- This week appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND a.start_time >= DATE_TRUNC('week', CURRENT_DATE) AND a.start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days') AS week_appointments,

    -- Medical records this month
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.deleted_at IS NULL AND DATE_TRUNC('month', mr.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS month_records,

    -- Vaccines pending
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending') AS vaccines_pending,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date <= CURRENT_DATE + INTERVAL '7 days') AS vaccines_due_soon,

    -- Active hospitalizations
    COUNT(DISTINCT h.id) FILTER (WHERE h.deleted_at IS NULL AND h.status = 'active') AS active_hospitalizations,

    -- Pending lab orders
    COUNT(DISTINCT lo.id) FILTER (WHERE lo.deleted_at IS NULL AND lo.status IN ('ordered', 'specimen_collected', 'in_progress')) AS pending_lab_orders,

    -- Revenue this month
    COALESCE(SUM(inv.total) FILTER (WHERE inv.deleted_at IS NULL AND DATE_TRUNC('month', inv.created_at) = DATE_TRUNC('month', CURRENT_DATE) AND inv.status = 'paid'), 0) AS month_revenue,

    -- Outstanding invoices
    COALESCE(SUM(inv.balance_due) FILTER (WHERE inv.deleted_at IS NULL AND inv.status IN ('sent', 'overdue')), 0) AS outstanding_balance,

    NOW() AS refreshed_at

FROM tenants t
LEFT JOIN pets p ON p.tenant_id = t.id
LEFT JOIN profiles pr ON pr.tenant_id = t.id
LEFT JOIN appointments a ON a.tenant_id = t.id
LEFT JOIN medical_records mr ON mr.tenant_id = t.id
LEFT JOIN vaccines v ON v.pet_id = p.id
LEFT JOIN hospitalizations h ON h.tenant_id = t.id
LEFT JOIN lab_orders lo ON lo.tenant_id = t.id
LEFT JOIN invoices inv ON inv.tenant_id = t.id
GROUP BY t.id, t.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_clinic_dashboard_tenant ON mv_clinic_dashboard_stats(tenant_id);

-- =============================================================================
-- B. PET STATISTICS BY SPECIES/BREED
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pet_statistics AS
SELECT
    tenant_id,
    species,
    breed,
    COUNT(*) AS count,
    AVG(weight_kg) AS avg_weight,
    AVG(EXTRACT(YEAR FROM AGE(COALESCE(birth_date, CURRENT_DATE)))) AS avg_age_years,
    COUNT(*) FILTER (WHERE is_neutered = TRUE) AS neutered_count,
    COUNT(*) FILTER (WHERE sex = 'male') AS male_count,
    COUNT(*) FILTER (WHERE sex = 'female') AS female_count,
    NOW() AS refreshed_at
FROM pets
WHERE deleted_at IS NULL
GROUP BY tenant_id, species, breed;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pet_stats ON mv_pet_statistics(tenant_id, species, COALESCE(breed, 'Unknown'));

-- =============================================================================
-- C. APPOINTMENT ANALYTICS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_appointment_analytics AS
SELECT
    tenant_id,
    DATE_TRUNC('month', start_time) AS month,
    COUNT(*) AS total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
    COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) AS completion_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'no_show') / NULLIF(COUNT(*), 0), 2) AS no_show_rate,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS avg_duration_minutes,
    NOW() AS refreshed_at
FROM appointments
WHERE deleted_at IS NULL
  AND start_time >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY tenant_id, DATE_TRUNC('month', start_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_appt_analytics ON mv_appointment_analytics(tenant_id, month);

-- =============================================================================
-- D. REVENUE ANALYTICS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_analytics AS
SELECT
    tenant_id,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS invoice_count,
    SUM(subtotal) AS gross_revenue,
    SUM(discount_amount) AS total_discounts,
    SUM(tax_amount) AS total_taxes,
    SUM(total) AS net_revenue,
    SUM(total) FILTER (WHERE status = 'paid') AS collected_revenue,
    SUM(balance_due) FILTER (WHERE status IN ('sent', 'overdue')) AS outstanding_revenue,
    AVG(total) AS avg_invoice_amount,
    COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
    NOW() AS refreshed_at
FROM invoices
WHERE deleted_at IS NULL
  AND created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY tenant_id, DATE_TRUNC('month', created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_revenue_analytics ON mv_revenue_analytics(tenant_id, month);

-- =============================================================================
-- E. SERVICE POPULARITY
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_service_popularity AS
SELECT
    s.tenant_id,
    s.id AS service_id,
    s.name AS service_name,
    s.category,
    COUNT(ii.id) AS times_used,
    SUM(ii.quantity) AS total_quantity,
    SUM(ii.quantity * ii.unit_price) AS total_revenue,
    AVG(ii.unit_price) AS avg_price,
    DATE_TRUNC('month', MAX(i.created_at)) AS last_used_month,
    NOW() AS refreshed_at
FROM services s
LEFT JOIN invoice_items ii ON ii.service_id = s.id
LEFT JOIN invoices i ON ii.invoice_id = i.id AND i.deleted_at IS NULL
WHERE s.is_active = TRUE
  AND (i.created_at IS NULL OR i.created_at >= CURRENT_DATE - INTERVAL '12 months')
GROUP BY s.tenant_id, s.id, s.name, s.category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_service_popularity ON mv_service_popularity(tenant_id, service_id);

-- =============================================================================
-- F. VACCINE COMPLIANCE
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vaccine_compliance AS
SELECT
    p.tenant_id,
    v.name AS vaccine_name,
    COUNT(DISTINCT v.pet_id) AS total_pets,
    COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'verified') AS vaccinated,
    COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'pending') AS pending,
    COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'pending' AND v.next_due_date < CURRENT_DATE) AS overdue,
    ROUND(100.0 * COUNT(DISTINCT v.pet_id) FILTER (WHERE v.status = 'verified') / NULLIF(COUNT(DISTINCT v.pet_id), 0), 2) AS compliance_rate,
    NOW() AS refreshed_at
FROM vaccines v
JOIN pets p ON v.pet_id = p.id
WHERE v.deleted_at IS NULL
  AND p.deleted_at IS NULL
GROUP BY p.tenant_id, v.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_vaccine_compliance ON mv_vaccine_compliance(tenant_id, vaccine_name);

-- =============================================================================
-- G. CLIENT RETENTION METRICS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_retention AS
SELECT
    tenant_id,
    DATE_TRUNC('month', first_visit) AS cohort_month,
    COUNT(DISTINCT owner_id) AS cohort_size,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 1 AND visit_count > 1) AS returned_month_1,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 3 AND visit_count > 1) AS returned_month_3,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 6 AND visit_count > 1) AS returned_month_6,
    COUNT(DISTINCT owner_id) FILTER (WHERE months_since_first <= 12 AND visit_count > 1) AS returned_month_12,
    NOW() AS refreshed_at
FROM (
    SELECT
        p.tenant_id,
        p.owner_id,
        MIN(a.start_time) AS first_visit,
        MAX(a.start_time) AS last_visit,
        COUNT(a.id) AS visit_count,
        EXTRACT(MONTH FROM AGE(MAX(a.start_time), MIN(a.start_time))) AS months_since_first
    FROM pets p
    JOIN appointments a ON a.pet_id = p.id AND a.status = 'completed' AND a.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
    GROUP BY p.tenant_id, p.owner_id
) cohorts
GROUP BY tenant_id, DATE_TRUNC('month', first_visit);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_client_retention ON mv_client_retention(tenant_id, cohort_month);

-- =============================================================================
-- H. INVENTORY ALERTS
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inventory_alerts AS
SELECT
    sp.tenant_id,
    sp.id AS product_id,
    sp.name AS product_name,
    sp.sku,
    si.stock_quantity,
    si.min_stock_level,
    si.expiry_date,
    si.batch_number,
    CASE
        WHEN si.stock_quantity <= 0 THEN 'out_of_stock'
        WHEN si.stock_quantity <= si.min_stock_level THEN 'low_stock'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE THEN 'expired'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'ok'
    END AS alert_type,
    NOW() AS refreshed_at
FROM store_products sp
JOIN store_inventory si ON sp.id = si.product_id
WHERE sp.is_active = TRUE
  AND (
    si.stock_quantity <= si.min_stock_level
    OR si.stock_quantity <= 0
    OR (si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days')
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_alerts ON mv_inventory_alerts(tenant_id, product_id, batch_number);

-- =============================================================================
-- I. PUBLIC HEALTH HEATMAP (Enhanced)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_disease_heatmap AS
SELECT
    dr.tenant_id,
    dc.code AS diagnosis_code,
    dc.term AS diagnosis_name,
    dr.species,
    dr.location_zone,
    DATE_TRUNC('week', dr.reported_date) AS week,
    COUNT(*) AS case_count,
    AVG(CASE
        WHEN dr.severity = 'mild' THEN 1
        WHEN dr.severity = 'moderate' THEN 2
        WHEN dr.severity = 'severe' THEN 3
        ELSE 0
    END) AS avg_severity,
    NOW() AS refreshed_at
FROM disease_reports dr
LEFT JOIN diagnosis_codes dc ON dr.diagnosis_code_id = dc.id
WHERE dr.reported_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY dr.tenant_id, dc.code, dc.term, dr.species, dr.location_zone, DATE_TRUNC('week', dr.reported_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_disease_heatmap ON mv_disease_heatmap(tenant_id, diagnosis_code, species, location_zone, week);

-- =============================================================================
-- J. STAFF PERFORMANCE
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_staff_performance AS
SELECT
    sp.tenant_id,
    sp.id AS staff_profile_id,
    p.full_name AS staff_name,
    sp.job_title,
    DATE_TRUNC('month', a.start_time) AS month,

    -- Appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.vet_id = sp.user_id) AS appointments_handled,
    COUNT(DISTINCT a.id) FILTER (WHERE a.vet_id = sp.user_id AND a.status = 'completed') AS appointments_completed,

    -- Medical records
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.performed_by = sp.user_id) AS records_created,

    -- Average rating (if feedback system exists)
    -- AVG(f.rating) FILTER (WHERE f.staff_id = sp.user_id) AS avg_rating,

    NOW() AS refreshed_at
FROM staff_profiles sp
JOIN profiles p ON sp.user_id = p.id
LEFT JOIN appointments a ON a.tenant_id = sp.tenant_id
    AND a.start_time >= CURRENT_DATE - INTERVAL '12 months'
    AND a.deleted_at IS NULL
LEFT JOIN medical_records mr ON mr.tenant_id = sp.tenant_id
    AND mr.created_at >= CURRENT_DATE - INTERVAL '12 months'
    AND mr.deleted_at IS NULL
WHERE sp.employment_status = 'active'
GROUP BY sp.tenant_id, sp.id, p.full_name, sp.job_title, DATE_TRUNC('month', a.start_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_staff_performance ON mv_staff_performance(tenant_id, staff_profile_id, month);

-- =============================================================================
-- K. REFRESH FUNCTIONS
-- =============================================================================

-- Refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS TABLE (view_name TEXT, refreshed_at TIMESTAMPTZ) AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats;
    view_name := 'mv_clinic_dashboard_stats'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_statistics;
    view_name := 'mv_pet_statistics'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_appointment_analytics;
    view_name := 'mv_appointment_analytics'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_analytics;
    view_name := 'mv_revenue_analytics'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_service_popularity;
    view_name := 'mv_service_popularity'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vaccine_compliance;
    view_name := 'mv_vaccine_compliance'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_retention;
    view_name := 'mv_client_retention'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts;
    view_name := 'mv_inventory_alerts'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_disease_heatmap;
    view_name := 'mv_disease_heatmap'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_staff_performance;
    view_name := 'mv_staff_performance'; refreshed_at := NOW(); RETURN NEXT;

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_summary;
    view_name := 'mv_client_summary'; refreshed_at := NOW(); RETURN NEXT;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Refresh dashboard views only (for frequent updates)
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_summary;
END;
$$ LANGUAGE plpgsql;

-- Track last refresh times
CREATE TABLE IF NOT EXISTS materialized_view_refresh_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    view_name TEXT NOT NULL,
    refresh_started_at TIMESTAMPTZ NOT NULL,
    refresh_completed_at TIMESTAMPTZ,
    duration_seconds DECIMAL(10,2),
    rows_affected INTEGER,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_mv_refresh_log_view ON materialized_view_refresh_log(view_name);
CREATE INDEX IF NOT EXISTS idx_mv_refresh_log_time ON materialized_view_refresh_log(refresh_started_at DESC);

-- =============================================================================
-- L. CLIENT SUMMARY (for /api/clients optimization)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_summary AS
SELECT
    pr.id AS client_id,
    pr.tenant_id,
    pr.full_name,
    pr.email,
    pr.phone,
    pr.created_at,
    COUNT(DISTINCT p.id) AS pet_count,
    MAX(a.start_time) AS last_appointment_date,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS completed_appointments_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'cancelled' OR a.status = 'no_show') AS missed_appointments_count,
    SUM(COALESCE(inv.total, 0)) FILTER (WHERE inv.status = 'paid') AS lifetime_value,
    MAX(inv.created_at) AS last_invoice_date,
    NOW() AS refreshed_at
FROM profiles pr
LEFT JOIN pets p ON p.owner_id = pr.id AND p.tenant_id = pr.tenant_id AND p.deleted_at IS NULL
LEFT JOIN appointments a ON a.pet_id = p.id AND a.tenant_id = pr.tenant_id AND a.deleted_at IS NULL
LEFT JOIN invoices inv ON inv.client_id = pr.id AND inv.tenant_id = pr.tenant_id AND inv.deleted_at IS NULL
WHERE pr.role = 'owner'
GROUP BY pr.id, pr.tenant_id, pr.full_name, pr.email, pr.phone, pr.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_client_summary_client ON mv_client_summary(client_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_tenant ON mv_client_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_name ON mv_client_summary(tenant_id, full_name);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_email ON mv_client_summary(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_pet_count ON mv_client_summary(tenant_id, pet_count);
CREATE INDEX IF NOT EXISTS idx_mv_client_summary_last_appt ON mv_client_summary(tenant_id, last_appointment_date);

-- =============================================================================
-- M. GRANT ACCESS TO MATERIALIZED VIEWS
-- =============================================================================

GRANT SELECT ON mv_clinic_dashboard_stats TO authenticated;
GRANT SELECT ON mv_pet_statistics TO authenticated;
GRANT SELECT ON mv_appointment_analytics TO authenticated;
GRANT SELECT ON mv_revenue_analytics TO authenticated;
GRANT SELECT ON mv_service_popularity TO authenticated;
GRANT SELECT ON mv_vaccine_compliance TO authenticated;
GRANT SELECT ON mv_client_retention TO authenticated;
GRANT SELECT ON mv_inventory_alerts TO authenticated;
GRANT SELECT ON mv_disease_heatmap TO authenticated;
GRANT SELECT ON mv_staff_performance TO authenticated;
GRANT SELECT ON mv_client_summary TO authenticated;

-- =============================================================================
-- MATERIALIZED VIEWS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 32_scheduled_jobs.sql
-- =============================================================================

-- =============================================================================
-- 32_SCHEDULED_JOBS.SQL
-- =============================================================================
-- Scheduled jobs using pg_cron for automated maintenance and background tasks.
-- NOTE: pg_cron must be enabled in your Supabase project settings.
-- =============================================================================

-- =============================================================================
-- A. ENABLE PG_CRON EXTENSION
-- =============================================================================

-- Note: In Supabase, pg_cron is available but may need to be enabled
-- Go to Database > Extensions and enable pg_cron

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres (required for Supabase)
GRANT USAGE ON SCHEMA cron TO postgres;

-- =============================================================================
-- B. JOB EXECUTION LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS scheduled_job_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    result JSONB,
    error_message TEXT,
    rows_affected INTEGER
);

CREATE INDEX IF NOT EXISTS idx_job_log_name ON scheduled_job_log(job_name);
CREATE INDEX IF NOT EXISTS idx_job_log_time ON scheduled_job_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_log_status ON scheduled_job_log(status);

-- =============================================================================
-- C. JOB WRAPPER FUNCTION
-- =============================================================================

-- Generic job wrapper that logs execution
CREATE OR REPLACE FUNCTION run_scheduled_job(
    p_job_name TEXT,
    p_function_name TEXT
)
RETURNS VOID AS $$
DECLARE
    v_log_id UUID;
    v_start_time TIMESTAMPTZ;
    v_result JSONB;
    v_rows INTEGER;
BEGIN
    v_start_time := NOW();

    -- Log job start
    INSERT INTO scheduled_job_log (job_name, started_at)
    VALUES (p_job_name, v_start_time)
    RETURNING id INTO v_log_id;

    -- Execute the job function
    BEGIN
        EXECUTE format('SELECT %I()', p_function_name);
        GET DIAGNOSTICS v_rows = ROW_COUNT;

        -- Log success
        UPDATE scheduled_job_log
        SET completed_at = NOW(),
            duration_ms = EXTRACT(MILLISECONDS FROM (NOW() - v_start_time)),
            status = 'completed',
            rows_affected = v_rows
        WHERE id = v_log_id;

    EXCEPTION WHEN OTHERS THEN
        -- Log failure
        UPDATE scheduled_job_log
        SET completed_at = NOW(),
            duration_ms = EXTRACT(MILLISECONDS FROM (NOW() - v_start_time)),
            status = 'failed',
            error_message = SQLERRM
        WHERE id = v_log_id;

        RAISE WARNING 'Scheduled job % failed: %', p_job_name, SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- D. MAINTENANCE JOBS
-- =============================================================================

-- 1. Refresh Materialized Views (every hour)
CREATE OR REPLACE FUNCTION job_refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_all_materialized_views();
END;
$$ LANGUAGE plpgsql;

-- 2. Refresh Dashboard Views Only (every 15 minutes)
CREATE OR REPLACE FUNCTION job_refresh_dashboard_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_dashboard_views();
END;
$$ LANGUAGE plpgsql;

-- 3. Expire Old Consents
CREATE OR REPLACE FUNCTION job_expire_consents()
RETURNS VOID AS $$
BEGIN
    PERFORM expire_old_consents();
END;
$$ LANGUAGE plpgsql;

-- 4. Purge Soft Deleted Records (older than 90 days)
CREATE OR REPLACE FUNCTION job_purge_deleted_records()
RETURNS VOID AS $$
BEGIN
    PERFORM purge_old_deleted_records(90);
END;
$$ LANGUAGE plpgsql;

-- 5. Purge Old Audit Logs
CREATE OR REPLACE FUNCTION job_purge_audit_logs()
RETURNS VOID AS $$
BEGIN
    PERFORM purge_expired_audit_logs();
END;
$$ LANGUAGE plpgsql;

-- 6. Generate Vaccine Reminders
CREATE OR REPLACE FUNCTION job_generate_vaccine_reminders()
RETURNS VOID AS $$
DECLARE
    v_tenant RECORD;
BEGIN
    FOR v_tenant IN SELECT id FROM tenants LOOP
        PERFORM generate_vaccine_reminders(v_tenant.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Generate Appointment Reminders
CREATE OR REPLACE FUNCTION job_generate_appointment_reminders()
RETURNS VOID AS $$
DECLARE
    v_tenant RECORD;
BEGIN
    FOR v_tenant IN SELECT id FROM tenants LOOP
        PERFORM generate_appointment_reminders(v_tenant.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Process Notification Queue
CREATE OR REPLACE FUNCTION job_process_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_processed INTEGER := 0;
    v_notification RECORD;
BEGIN
    -- Get pending notifications
    FOR v_notification IN
        SELECT nq.* FROM notification_queue nq
        WHERE nq.status = 'pending'
          AND nq.scheduled_for <= NOW()
        ORDER BY nq.scheduled_for
        LIMIT 100
    LOOP
        -- Mark as processing
        UPDATE notification_queue SET status = 'processing' WHERE id = v_notification.id;

        -- Here you would integrate with your notification service
        -- For now, just mark as sent (actual sending would be done via edge function)
        UPDATE notification_queue
        SET status = 'sent',
            sent_at = NOW()
        WHERE id = v_notification.id;

        v_processed := v_processed + 1;
    END LOOP;

    RETURN v_processed;
END;
$$ LANGUAGE plpgsql;

-- 9. Update Invoice Status (mark overdue)
CREATE OR REPLACE FUNCTION job_update_invoice_status()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE invoices
    SET status = 'overdue'
    WHERE status = 'sent'
      AND due_date < CURRENT_DATE
      AND deleted_at IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Expire Insurance Pre-authorizations
CREATE OR REPLACE FUNCTION job_expire_preauthorizations()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE insurance_pre_authorizations
    SET status = 'expired'
    WHERE status = 'approved'
      AND valid_until < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 11. Clean Old Job Logs (keep last 30 days)
CREATE OR REPLACE FUNCTION job_clean_job_logs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM scheduled_job_log
    WHERE started_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Update Insurance Policy Status
CREATE OR REPLACE FUNCTION job_update_policy_status()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE pet_insurance_policies
    SET status = 'expired'
    WHERE status = 'active'
      AND expiration_date < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Generate Recurring Invoices
CREATE OR REPLACE FUNCTION job_generate_recurring_invoices()
RETURNS INTEGER AS $$
DECLARE
    v_template RECORD;
    v_count INTEGER := 0;
    v_next_date DATE;
BEGIN
    FOR v_template IN
        SELECT * FROM recurring_invoice_templates
        WHERE is_active = TRUE
          AND next_generation_date <= CURRENT_DATE
          AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    LOOP
        -- Generate invoice from template
        INSERT INTO invoices (
            tenant_id,
            client_id,
            invoice_number,
            subtotal,
            tax_rate,
            tax_amount,
            discount_amount,
            total_amount,
            balance_due,
            due_date,
            status,
            notes
        )
        SELECT
            v_template.tenant_id,
            v_template.client_id,
            generate_invoice_number(v_template.tenant_id),
            v_template.subtotal,
            v_template.tax_rate,
            v_template.tax_amount,
            v_template.discount_amount,
            v_template.total_amount,
            v_template.total_amount,
            CURRENT_DATE + v_template.payment_terms_days,
            'draft',
            'Generated from recurring template'
        ;

        -- Copy line items
        INSERT INTO invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
        SELECT
            (SELECT id FROM invoices ORDER BY created_at DESC LIMIT 1),
            service_id,
            description,
            quantity,
            unit_price,
            total_price
        FROM recurring_invoice_items
        WHERE template_id = v_template.id;

        -- Calculate next generation date
        v_next_date := CASE v_template.frequency
            WHEN 'weekly' THEN v_template.next_generation_date + INTERVAL '7 days'
            WHEN 'biweekly' THEN v_template.next_generation_date + INTERVAL '14 days'
            WHEN 'monthly' THEN v_template.next_generation_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN v_template.next_generation_date + INTERVAL '3 months'
            WHEN 'annually' THEN v_template.next_generation_date + INTERVAL '1 year'
        END;

        -- Update template
        UPDATE recurring_invoice_templates
        SET next_generation_date = v_next_date,
            last_generated_at = NOW()
        WHERE id = v_template.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Database Statistics Update
CREATE OR REPLACE FUNCTION job_update_statistics()
RETURNS VOID AS $$
BEGIN
    -- Analyze frequently queried tables
    ANALYZE pets;
    ANALYZE appointments;
    ANALYZE medical_records;
    ANALYZE invoices;
    ANALYZE vaccines;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- E. SCHEDULE JOBS
-- =============================================================================

-- Note: These schedules assume pg_cron is enabled in Supabase
-- Cron syntax: minute hour day month day_of_week

-- Remove existing jobs (if re-running this script)
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE 'vete_%';

-- Schedule jobs
SELECT cron.schedule(
    'vete_refresh_dashboard',
    '*/15 * * * *', -- Every 15 minutes
    $$SELECT run_scheduled_job('refresh_dashboard', 'job_refresh_dashboard_views')$$
);

SELECT cron.schedule(
    'vete_refresh_materialized_views',
    '0 * * * *', -- Every hour at minute 0
    $$SELECT run_scheduled_job('refresh_mv', 'job_refresh_materialized_views')$$
);

SELECT cron.schedule(
    'vete_generate_vaccine_reminders',
    '0 8 * * *', -- Daily at 8 AM
    $$SELECT run_scheduled_job('vaccine_reminders', 'job_generate_vaccine_reminders')$$
);

SELECT cron.schedule(
    'vete_generate_appointment_reminders',
    '0 7,14 * * *', -- Twice daily at 7 AM and 2 PM
    $$SELECT run_scheduled_job('appointment_reminders', 'job_generate_appointment_reminders')$$
);

SELECT cron.schedule(
    'vete_process_notifications',
    '*/5 * * * *', -- Every 5 minutes
    $$SELECT run_scheduled_job('process_notifications', 'job_process_notifications')$$
);

SELECT cron.schedule(
    'vete_update_invoice_status',
    '0 1 * * *', -- Daily at 1 AM
    $$SELECT run_scheduled_job('update_invoices', 'job_update_invoice_status')$$
);

SELECT cron.schedule(
    'vete_expire_consents',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT run_scheduled_job('expire_consents', 'job_expire_consents')$$
);

SELECT cron.schedule(
    'vete_expire_preauthorizations',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT run_scheduled_job('expire_preauths', 'job_expire_preauthorizations')$$
);

SELECT cron.schedule(
    'vete_update_policy_status',
    '0 2 * * *', -- Daily at 2 AM
    $$SELECT run_scheduled_job('update_policies', 'job_update_policy_status')$$
);

SELECT cron.schedule(
    'vete_generate_recurring_invoices',
    '0 6 * * *', -- Daily at 6 AM
    $$SELECT run_scheduled_job('recurring_invoices', 'job_generate_recurring_invoices')$$
);

SELECT cron.schedule(
    'vete_purge_deleted_records',
    '0 3 * * 0', -- Weekly on Sunday at 3 AM
    $$SELECT run_scheduled_job('purge_deleted', 'job_purge_deleted_records')$$
);

SELECT cron.schedule(
    'vete_purge_audit_logs',
    '0 4 * * 0', -- Weekly on Sunday at 4 AM
    $$SELECT run_scheduled_job('purge_audit', 'job_purge_audit_logs')$$
);

SELECT cron.schedule(
    'vete_clean_job_logs',
    '0 5 * * 0', -- Weekly on Sunday at 5 AM
    $$SELECT run_scheduled_job('clean_job_logs', 'job_clean_job_logs')$$
);

SELECT cron.schedule(
    'vete_update_statistics',
    '0 4 * * *', -- Daily at 4 AM
    $$SELECT run_scheduled_job('update_stats', 'job_update_statistics')$$
);

-- =============================================================================
-- F. JOB MONITORING VIEWS
-- =============================================================================

-- Recent job executions
CREATE OR REPLACE VIEW recent_job_executions AS
SELECT
    job_name,
    started_at,
    completed_at,
    duration_ms,
    status,
    rows_affected,
    error_message
FROM scheduled_job_log
WHERE started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;

-- Job statistics
CREATE OR REPLACE VIEW job_statistics AS
SELECT
    job_name,
    COUNT(*) AS total_runs,
    COUNT(*) FILTER (WHERE status = 'completed') AS successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_runs,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) AS success_rate,
    AVG(duration_ms) FILTER (WHERE status = 'completed') AS avg_duration_ms,
    MAX(started_at) AS last_run
FROM scheduled_job_log
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY job_name
ORDER BY job_name;

-- Currently scheduled jobs
CREATE OR REPLACE VIEW scheduled_jobs AS
SELECT
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    active
FROM cron.job
WHERE jobname LIKE 'vete_%'
ORDER BY jobname;

GRANT SELECT ON recent_job_executions TO authenticated;
GRANT SELECT ON job_statistics TO authenticated;
GRANT SELECT ON scheduled_jobs TO authenticated;

-- =============================================================================
-- G. MANUAL JOB EXECUTION FUNCTION
-- =============================================================================

-- Allow admins to manually trigger jobs
CREATE OR REPLACE FUNCTION trigger_job(p_job_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_function_name TEXT;
BEGIN
    -- Validate job name and get function
    v_function_name := CASE p_job_name
        WHEN 'refresh_dashboard' THEN 'job_refresh_dashboard_views'
        WHEN 'refresh_mv' THEN 'job_refresh_materialized_views'
        WHEN 'vaccine_reminders' THEN 'job_generate_vaccine_reminders'
        WHEN 'appointment_reminders' THEN 'job_generate_appointment_reminders'
        WHEN 'process_notifications' THEN 'job_process_notifications'
        WHEN 'update_invoices' THEN 'job_update_invoice_status'
        WHEN 'expire_consents' THEN 'job_expire_consents'
        WHEN 'purge_deleted' THEN 'job_purge_deleted_records'
        WHEN 'purge_audit' THEN 'job_purge_audit_logs'
        WHEN 'recurring_invoices' THEN 'job_generate_recurring_invoices'
        ELSE NULL
    END;

    IF v_function_name IS NULL THEN
        RETURN 'Unknown job: ' || p_job_name;
    END IF;

    PERFORM run_scheduled_job(p_job_name, v_function_name);
    RETURN 'Job triggered: ' || p_job_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SCHEDULED JOBS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 50_rls_policies_complete.sql
-- =============================================================================

-- =============================================================================
-- 50_RLS_POLICIES_COMPLETE.SQL
-- =============================================================================
-- Complete RLS policies for all tables missing row-level security.
-- This migration addresses TICKET-DB-001 from TICKETS.md.
-- =============================================================================

-- =============================================================================
-- A. LABORATORY TABLES
-- =============================================================================

-- A1. LAB_TEST_CATALOG
ALTER TABLE lab_test_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read lab test catalog" ON lab_test_catalog;
CREATE POLICY "Public can read lab test catalog" ON lab_test_catalog
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage tenant lab tests" ON lab_test_catalog;
CREATE POLICY "Staff can manage tenant lab tests" ON lab_test_catalog
    FOR ALL USING (
        tenant_id IS NULL  -- Global templates are read-only via SELECT policy
        OR public.is_staff_of(tenant_id)
    );

-- A2. LAB_TEST_PANELS
ALTER TABLE lab_test_panels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view lab panels" ON lab_test_panels;
CREATE POLICY "Staff can view lab panels" ON lab_test_panels
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage lab panels" ON lab_test_panels;
CREATE POLICY "Staff can manage lab panels" ON lab_test_panels
    FOR ALL USING (public.is_staff_of(tenant_id));

-- A3. LAB_PANEL_TESTS
ALTER TABLE lab_panel_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage panel tests" ON lab_panel_tests;
CREATE POLICY "Staff can manage panel tests" ON lab_panel_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_test_panels
            WHERE lab_test_panels.id = lab_panel_tests.panel_id
            AND public.is_staff_of(lab_test_panels.tenant_id)
        )
    );

-- A4. LAB_REFERENCE_RANGES
ALTER TABLE lab_reference_ranges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read reference ranges" ON lab_reference_ranges;
CREATE POLICY "Public can read reference ranges" ON lab_reference_ranges
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage reference ranges" ON lab_reference_ranges;
CREATE POLICY "Staff can manage reference ranges" ON lab_reference_ranges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_test_catalog
            WHERE lab_test_catalog.id = lab_reference_ranges.test_id
            AND (
                lab_test_catalog.tenant_id IS NULL
                OR public.is_staff_of(lab_test_catalog.tenant_id)
            )
        )
    );

-- A5. LAB_ORDERS
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pet lab orders" ON lab_orders;
CREATE POLICY "Owners can view own pet lab orders" ON lab_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = lab_orders.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage lab orders" ON lab_orders;
CREATE POLICY "Staff can manage lab orders" ON lab_orders
    FOR ALL USING (public.is_staff_of(tenant_id));

-- A6. LAB_ORDER_ITEMS
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own lab order items" ON lab_order_items;
CREATE POLICY "Owners can view own lab order items" ON lab_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            JOIN pets ON pets.id = lab_orders.pet_id
            WHERE lab_orders.id = lab_order_items.lab_order_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage lab order items" ON lab_order_items;
CREATE POLICY "Staff can manage lab order items" ON lab_order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            WHERE lab_orders.id = lab_order_items.lab_order_id
            AND public.is_staff_of(lab_orders.tenant_id)
        )
    );

-- A7. LAB_RESULTS
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own lab results" ON lab_results;
CREATE POLICY "Owners can view own lab results" ON lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            JOIN pets ON pets.id = lab_orders.pet_id
            WHERE lab_orders.id = lab_results.lab_order_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage lab results" ON lab_results;
CREATE POLICY "Staff can manage lab results" ON lab_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lab_orders
            WHERE lab_orders.id = lab_results.lab_order_id
            AND public.is_staff_of(lab_orders.tenant_id)
        )
    );

-- A8. EXTERNAL_LAB_ORDERS (table doesn't exist - skipped)

-- =============================================================================
-- B. HOSPITALIZATION TABLES
-- =============================================================================

-- B1. KENNELS
ALTER TABLE kennels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view kennels" ON kennels;
CREATE POLICY "Staff can view kennels" ON kennels
    FOR SELECT USING (public.is_staff_of(tenant_id));

DROP POLICY IF EXISTS "Staff can manage kennels" ON kennels;
CREATE POLICY "Staff can manage kennels" ON kennels
    FOR ALL USING (public.is_staff_of(tenant_id));

-- B2. HOSPITALIZATIONS
ALTER TABLE hospitalizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pet hospitalizations" ON hospitalizations;
CREATE POLICY "Owners can view own pet hospitalizations" ON hospitalizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = hospitalizations.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalizations" ON hospitalizations;
CREATE POLICY "Staff can manage hospitalizations" ON hospitalizations
    FOR ALL USING (public.is_staff_of(tenant_id));

-- B3. HOSPITALIZATION_VISITS
ALTER TABLE hospitalization_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own hospitalization visits" ON hospitalization_visits;
CREATE POLICY "Owners can view own hospitalization visits" ON hospitalization_visits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_visits.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalization visits" ON hospitalization_visits;
CREATE POLICY "Staff can manage hospitalization visits" ON hospitalization_visits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_visits.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- B4. HOSPITALIZATION_VITALS
ALTER TABLE hospitalization_vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own hospitalization vitals" ON hospitalization_vitals;
CREATE POLICY "Owners can view own hospitalization vitals" ON hospitalization_vitals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            JOIN pets ON pets.id = hospitalizations.pet_id
            WHERE hospitalizations.id = hospitalization_vitals.hospitalization_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage hospitalization vitals" ON hospitalization_vitals;
CREATE POLICY "Staff can manage hospitalization vitals" ON hospitalization_vitals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospitalizations
            WHERE hospitalizations.id = hospitalization_vitals.hospitalization_id
            AND public.is_staff_of(hospitalizations.tenant_id)
        )
    );

-- B5-B8. SKIPPED: hospitalization_medications, hospitalization_procedures,
--         hospitalization_feeding_log, hospitalization_billing (tables don't exist)

-- =============================================================================
-- C. CONSENT TABLES
-- =============================================================================

-- C1. CONSENT_TEMPLATES
ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read consent templates" ON consent_templates;
CREATE POLICY "Public can read consent templates" ON consent_templates
    FOR SELECT USING (
        is_active = TRUE
        AND (
            tenant_id IS NULL  -- Global templates
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.tenant_id = consent_templates.tenant_id
            )
        )
    );

DROP POLICY IF EXISTS "Staff can manage consent templates" ON consent_templates;
CREATE POLICY "Staff can manage consent templates" ON consent_templates
    FOR ALL USING (
        tenant_id IS NULL  -- Global templates read-only
        OR public.is_staff_of(tenant_id)
    );

-- C2. CONSENT_TEMPLATE_FIELDS
ALTER TABLE consent_template_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view template fields" ON consent_template_fields;
CREATE POLICY "Users can view template fields" ON consent_template_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM consent_templates
            WHERE consent_templates.id = consent_template_fields.template_id
            AND (
                consent_templates.tenant_id IS NULL
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.tenant_id = consent_templates.tenant_id
                )
            )
        )
    );

DROP POLICY IF EXISTS "Staff can manage template fields" ON consent_template_fields;
CREATE POLICY "Staff can manage template fields" ON consent_template_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM consent_templates
            WHERE consent_templates.id = consent_template_fields.template_id
            AND public.is_staff_of(consent_templates.tenant_id)
        )
    );

-- C3. CONSENT_DOCUMENTS
ALTER TABLE consent_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own consent documents" ON consent_documents;
CREATE POLICY "Owners can view own consent documents" ON consent_documents
    FOR SELECT USING (
        signer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = consent_documents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create consent documents" ON consent_documents;
CREATE POLICY "Owners can create consent documents" ON consent_documents
    FOR INSERT WITH CHECK (
        signer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = consent_documents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage consent documents" ON consent_documents;
CREATE POLICY "Staff can manage consent documents" ON consent_documents
    FOR ALL USING (public.is_staff_of(tenant_id));

-- C4. CONSENT_SIGNATURES
ALTER TABLE consent_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own signatures" ON consent_signatures;
CREATE POLICY "Users can view own signatures" ON consent_signatures
    FOR SELECT USING (
        signer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM consent_documents
            WHERE consent_documents.id = consent_signatures.consent_document_id
            AND public.is_staff_of(consent_documents.tenant_id)
        )
    );

DROP POLICY IF EXISTS "Users can create own signatures" ON consent_signatures;
CREATE POLICY "Users can create own signatures" ON consent_signatures
    FOR INSERT WITH CHECK (signer_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage signatures" ON consent_signatures;
CREATE POLICY "Staff can manage signatures" ON consent_signatures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM consent_documents
            WHERE consent_documents.id = consent_signatures.consent_document_id
            AND public.is_staff_of(consent_documents.tenant_id)
        )
    );

-- C5. CONSENT_REQUESTS
ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own consent requests" ON consent_requests;
CREATE POLICY "Owners can view own consent requests" ON consent_requests
    FOR SELECT USING (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = consent_requests.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage consent requests" ON consent_requests;
CREATE POLICY "Staff can manage consent requests" ON consent_requests
    FOR ALL USING (public.is_staff_of(tenant_id));

-- C6. BLANKET_CONSENTS
ALTER TABLE blanket_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own blanket consents" ON blanket_consents;
CREATE POLICY "Owners can view own blanket consents" ON blanket_consents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = blanket_consents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create blanket consents" ON blanket_consents;
CREATE POLICY "Owners can create blanket consents" ON blanket_consents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = blanket_consents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can update own blanket consents" ON blanket_consents;
CREATE POLICY "Owners can update own blanket consents" ON blanket_consents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = blanket_consents.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage blanket consents" ON blanket_consents;
CREATE POLICY "Staff can manage blanket consents" ON blanket_consents
    FOR ALL USING (public.is_staff_of(tenant_id));

-- =============================================================================
-- D. MESSAGING TABLES
-- =============================================================================

-- D1. CONVERSATIONS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view own conversations" ON conversations;
CREATE POLICY "Clients can view own conversations" ON conversations
    FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients can create conversations" ON conversations;
CREATE POLICY "Clients can create conversations" ON conversations
    FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients can update own conversations" ON conversations;
CREATE POLICY "Clients can update own conversations" ON conversations
    FOR UPDATE USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage conversations" ON conversations;
CREATE POLICY "Staff can manage conversations" ON conversations
    FOR ALL USING (public.is_staff_of(tenant_id));

-- D2. MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.client_id = auth.uid()
                OR public.is_staff_of(conversations.tenant_id)
            )
        )
    );

DROP POLICY IF EXISTS "Users can send messages to own conversations" ON messages;
CREATE POLICY "Users can send messages to own conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.client_id = auth.uid()
                OR public.is_staff_of(conversations.tenant_id)
            )
        )
    );

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- D3. MESSAGE_TEMPLATES
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view message templates" ON message_templates;
CREATE POLICY "Staff can view message templates" ON message_templates
    FOR SELECT USING (
        tenant_id IS NULL  -- Global templates
        OR public.is_staff_of(tenant_id)
    );

DROP POLICY IF EXISTS "Staff can manage message templates" ON message_templates;
CREATE POLICY "Staff can manage message templates" ON message_templates
    FOR ALL USING (public.is_staff_of(tenant_id));

-- D4. BROADCAST_CAMPAIGNS
ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage broadcast campaigns" ON broadcast_campaigns;
CREATE POLICY "Staff can manage broadcast campaigns" ON broadcast_campaigns
    FOR ALL USING (public.is_staff_of(tenant_id));

-- D5. BROADCAST_RECIPIENTS
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage broadcast recipients" ON broadcast_recipients;
CREATE POLICY "Staff can manage broadcast recipients" ON broadcast_recipients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM broadcast_campaigns
            WHERE broadcast_campaigns.id = broadcast_recipients.campaign_id
            AND public.is_staff_of(broadcast_campaigns.tenant_id)
        )
    );

-- D6. MESSAGE_ATTACHMENTS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view attachments in own conversations" ON message_attachments;
CREATE POLICY "Users can view attachments in own conversations" ON message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages
            JOIN conversations ON conversations.id = messages.conversation_id
            WHERE messages.id = message_attachments.message_id
            AND (
                conversations.client_id = auth.uid()
                OR public.is_staff_of(conversations.tenant_id)
            )
        )
    );

DROP POLICY IF EXISTS "Users can create attachments for own messages" ON message_attachments;
CREATE POLICY "Users can create attachments for own messages" ON message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_attachments.message_id
            AND messages.sender_id = auth.uid()
        )
    );

-- =============================================================================
-- E. INSURANCE TABLES
-- =============================================================================

-- E1. INSURANCE_PROVIDERS
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read insurance providers" ON insurance_providers;
CREATE POLICY "Public can read insurance providers" ON insurance_providers
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Staff can manage insurance providers" ON insurance_providers;
CREATE POLICY "Staff can manage insurance providers" ON insurance_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- E2. PET_INSURANCE_POLICIES
ALTER TABLE pet_insurance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pet insurance" ON pet_insurance_policies;
CREATE POLICY "Owners can view own pet insurance" ON pet_insurance_policies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_insurance_policies.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can create pet insurance" ON pet_insurance_policies;
CREATE POLICY "Owners can create pet insurance" ON pet_insurance_policies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_insurance_policies.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can update own pet insurance" ON pet_insurance_policies;
CREATE POLICY "Owners can update own pet insurance" ON pet_insurance_policies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_insurance_policies.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage pet insurance" ON pet_insurance_policies;
CREATE POLICY "Staff can manage pet insurance" ON pet_insurance_policies
    FOR ALL USING (public.is_staff_of(tenant_id));

-- E3. INSURANCE_CLAIMS
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own insurance claims" ON insurance_claims;
CREATE POLICY "Owners can view own insurance claims" ON insurance_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = insurance_claims.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage insurance claims" ON insurance_claims;
CREATE POLICY "Staff can manage insurance claims" ON insurance_claims
    FOR ALL USING (public.is_staff_of(tenant_id));

-- E4. INSURANCE_CLAIM_ITEMS
ALTER TABLE insurance_claim_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own claim items" ON insurance_claim_items;
CREATE POLICY "Owners can view own claim items" ON insurance_claim_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            JOIN pets ON pets.id = insurance_claims.pet_id
            WHERE insurance_claims.id = insurance_claim_items.claim_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage claim items" ON insurance_claim_items;
CREATE POLICY "Staff can manage claim items" ON insurance_claim_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            WHERE insurance_claims.id = insurance_claim_items.claim_id
            AND public.is_staff_of(insurance_claims.tenant_id)
        )
    );

-- E5. INSURANCE_PRE_AUTHORIZATIONS
ALTER TABLE insurance_pre_authorizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own pre-authorizations" ON insurance_pre_authorizations;
CREATE POLICY "Owners can view own pre-authorizations" ON insurance_pre_authorizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = insurance_pre_authorizations.pet_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage pre-authorizations" ON insurance_pre_authorizations;
CREATE POLICY "Staff can manage pre-authorizations" ON insurance_pre_authorizations
    FOR ALL USING (public.is_staff_of(tenant_id));

-- E6. INSURANCE_EOB
ALTER TABLE insurance_eob ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own EOBs" ON insurance_eob;
CREATE POLICY "Owners can view own EOBs" ON insurance_eob
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            JOIN pets ON pets.id = insurance_claims.pet_id
            WHERE insurance_claims.id = insurance_eob.claim_id
            AND pets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can manage EOBs" ON insurance_eob;
CREATE POLICY "Staff can manage EOBs" ON insurance_eob
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            WHERE insurance_claims.id = insurance_eob.claim_id
            AND public.is_staff_of(insurance_claims.tenant_id)
        )
    );

-- =============================================================================
-- F. SYSTEM/BACKGROUND TABLES
-- =============================================================================

-- F1. SCHEDULED_JOB_LOG
ALTER TABLE scheduled_job_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view job logs" ON scheduled_job_log;
CREATE POLICY "Admins can view job logs" ON scheduled_job_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can insert job logs" ON scheduled_job_log;
CREATE POLICY "System can insert job logs" ON scheduled_job_log
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "System can update job logs" ON scheduled_job_log;
CREATE POLICY "System can update job logs" ON scheduled_job_log
    FOR UPDATE USING (TRUE);

-- F2. MATERIALIZED_VIEW_REFRESH_LOG
ALTER TABLE materialized_view_refresh_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view refresh logs" ON materialized_view_refresh_log;
CREATE POLICY "Admins can view refresh logs" ON materialized_view_refresh_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "System can insert refresh logs" ON materialized_view_refresh_log;
CREATE POLICY "System can insert refresh logs" ON materialized_view_refresh_log
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "System can update refresh logs" ON materialized_view_refresh_log;
CREATE POLICY "System can update refresh logs" ON materialized_view_refresh_log
    FOR UPDATE USING (TRUE);

-- =============================================================================
-- RLS POLICIES COMPLETE
-- =============================================================================

-- Summary of tables secured:
-- Laboratory: lab_test_catalog, lab_test_panels, lab_panel_tests, lab_reference_ranges,
--             lab_orders, lab_order_items, lab_results, external_lab_orders
-- Hospitalization: kennels, hospitalizations, hospitalization_visits, hospitalization_vitals,
--                  hospitalization_medications, hospitalization_procedures,
--                  hospitalization_feeding_log, hospitalization_billing
-- Consent: consent_templates, consent_template_fields, consent_documents,
--          consent_signatures, consent_requests, blanket_consents
-- Messaging: conversations, messages, message_templates, broadcast_campaigns,
--            broadcast_recipients, message_attachments
-- Insurance: insurance_providers, pet_insurance_policies, insurance_claims,
--            insurance_claim_items, insurance_pre_authorizations, insurance_eob
-- System: scheduled_job_log, materialized_view_refresh_log



-- =============================================================================
-- FILE: 51_fk_cascades.sql
-- =============================================================================

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



-- =============================================================================
-- FILE: 52_performance_indexes.sql
-- =============================================================================

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



-- =============================================================================
-- FILE: 53_updated_at_triggers.sql
-- =============================================================================

-- =============================================================================
-- 53_UPDATED_AT_TRIGGERS.SQL
-- =============================================================================
-- Add updated_at triggers to tables that are missing them.
-- Based on TICKET-DB-005 in TICKETS.md
-- =============================================================================

-- Ensure handle_updated_at() function exists
-- This function is defined in 12_functions.sql but we verify it here
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at'
    ) THEN
        RAISE EXCEPTION 'handle_updated_at() function does not exist. Run 12_functions.sql first.';
    END IF;
END $$;

-- =============================================================================
-- A. SERVICES AND PAYMENT METHODS (Invoicing Schema)
-- =============================================================================

-- Services table
DROP TRIGGER IF EXISTS set_updated_at_services ON services;
CREATE TRIGGER set_updated_at_services
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Payment methods table
DROP TRIGGER IF EXISTS set_updated_at_payment_methods ON payment_methods;
CREATE TRIGGER set_updated_at_payment_methods
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Invoices (already has trigger in 13_triggers.sql via invoice recalculation logic)
-- Invoice sequences
DROP TRIGGER IF EXISTS set_updated_at_invoice_sequences ON invoice_sequences;
CREATE TRIGGER set_updated_at_invoice_sequences
    BEFORE UPDATE ON invoice_sequences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Recurring invoice templates
DROP TRIGGER IF EXISTS set_updated_at_recurring_invoice_templates ON recurring_invoice_templates;
CREATE TRIGGER set_updated_at_recurring_invoice_templates
    BEFORE UPDATE ON recurring_invoice_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- B. REMINDERS AND NOTIFICATIONS
-- =============================================================================

-- Notification channels
DROP TRIGGER IF EXISTS set_updated_at_notification_channels ON notification_channels;
CREATE TRIGGER set_updated_at_notification_channels
    BEFORE UPDATE ON notification_channels
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Notification templates
DROP TRIGGER IF EXISTS set_updated_at_notification_templates ON notification_templates;
CREATE TRIGGER set_updated_at_notification_templates
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Notification preferences
DROP TRIGGER IF EXISTS set_updated_at_notification_preferences ON notification_preferences;
CREATE TRIGGER set_updated_at_notification_preferences
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Reminders
DROP TRIGGER IF EXISTS set_updated_at_reminders ON reminders;
CREATE TRIGGER set_updated_at_reminders
    BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- C. LAB RESULTS
-- =============================================================================
-- Note: Lab tables already have triggers in 24_schema_lab_results.sql
-- This section is included for documentation but triggers are commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_lab_test_catalog ON lab_test_catalog;
-- CREATE TRIGGER set_updated_at_lab_test_catalog
--     BEFORE UPDATE ON lab_test_catalog
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_lab_test_panels ON lab_test_panels;
-- CREATE TRIGGER set_updated_at_lab_test_panels
--     BEFORE UPDATE ON lab_test_panels
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_lab_reference_ranges ON lab_reference_ranges;
-- CREATE TRIGGER set_updated_at_lab_reference_ranges
--     BEFORE UPDATE ON lab_reference_ranges
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_lab_orders ON lab_orders;
-- CREATE TRIGGER set_updated_at_lab_orders
--     BEFORE UPDATE ON lab_orders
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_lab_results ON lab_results;
-- CREATE TRIGGER set_updated_at_lab_results
--     BEFORE UPDATE ON lab_results
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_external_lab_integrations ON external_lab_integrations;
-- CREATE TRIGGER set_updated_at_external_lab_integrations
--     BEFORE UPDATE ON external_lab_integrations
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- D. HOSPITALIZATION
-- =============================================================================
-- Note: Hospitalization tables already have triggers in 23_schema_hospitalization.sql
-- This section is included for documentation but triggers are commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_kennels ON kennels;
-- CREATE TRIGGER set_updated_at_kennels
--     BEFORE UPDATE ON kennels
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_hospitalizations ON hospitalizations;
-- CREATE TRIGGER set_updated_at_hospitalizations
--     BEFORE UPDATE ON hospitalizations
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_hospitalization_treatments ON hospitalization_treatments;
-- CREATE TRIGGER set_updated_at_hospitalization_treatments
--     BEFORE UPDATE ON hospitalization_treatments
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- E. CONSENT FORMS
-- =============================================================================
-- Note: Consent tables already have triggers in 25_schema_consent.sql
-- This section is included for documentation but triggers are commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_consent_templates ON consent_templates;
-- CREATE TRIGGER set_updated_at_consent_templates
--     BEFORE UPDATE ON consent_templates
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_consent_documents ON consent_documents;
-- CREATE TRIGGER set_updated_at_consent_documents
--     BEFORE UPDATE ON consent_documents
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_consent_requests ON consent_requests;
-- CREATE TRIGGER set_updated_at_consent_requests
--     BEFORE UPDATE ON consent_requests
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_blanket_consents ON blanket_consents;
-- CREATE TRIGGER set_updated_at_blanket_consents
--     BEFORE UPDATE ON blanket_consents
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- F. MESSAGING
-- =============================================================================
-- Note: Messaging tables already have triggers in 27_schema_messaging.sql
-- This section is included for documentation but triggers are commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_conversations ON conversations;
-- CREATE TRIGGER set_updated_at_conversations
--     BEFORE UPDATE ON conversations
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_messages ON messages;
-- CREATE TRIGGER set_updated_at_messages
--     BEFORE UPDATE ON messages
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_message_templates ON message_templates;
-- CREATE TRIGGER set_updated_at_message_templates
--     BEFORE UPDATE ON message_templates
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_broadcast_campaigns ON broadcast_campaigns;
-- CREATE TRIGGER set_updated_at_broadcast_campaigns
--     BEFORE UPDATE ON broadcast_campaigns
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_communication_prefs ON communication_preferences;
-- CREATE TRIGGER set_updated_at_communication_prefs
--     BEFORE UPDATE ON communication_preferences
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_auto_reply_rules ON auto_reply_rules;
-- CREATE TRIGGER set_updated_at_auto_reply_rules
--     BEFORE UPDATE ON auto_reply_rules
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- G. INSURANCE
-- =============================================================================
-- Note: Insurance tables already have triggers in 28_schema_insurance.sql
-- This section is included for documentation but triggers are commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_insurance_providers ON insurance_providers;
-- CREATE TRIGGER set_updated_at_insurance_providers
--     BEFORE UPDATE ON insurance_providers
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_pet_insurance_policies ON pet_insurance_policies;
-- CREATE TRIGGER set_updated_at_pet_insurance_policies
--     BEFORE UPDATE ON pet_insurance_policies
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_insurance_claims ON insurance_claims;
-- CREATE TRIGGER set_updated_at_insurance_claims
--     BEFORE UPDATE ON insurance_claims
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_insurance_pre_auth ON insurance_pre_authorizations;
-- CREATE TRIGGER set_updated_at_insurance_pre_auth
--     BEFORE UPDATE ON insurance_pre_authorizations
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_insurance_claim_stats ON insurance_claim_stats;
-- CREATE TRIGGER set_updated_at_insurance_claim_stats
--     BEFORE UPDATE ON insurance_claim_stats
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- H. STORE ENHANCEMENTS
-- =============================================================================
-- Note: Store enhancement tables already have triggers in 82_store_enhancements.sql
-- This section is included for documentation but triggers are commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_store_brands ON store_brands;
-- CREATE TRIGGER set_updated_at_store_brands
--     BEFORE UPDATE ON store_brands
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_store_subcategories ON store_subcategories;
-- CREATE TRIGGER set_updated_at_store_subcategories
--     BEFORE UPDATE ON store_subcategories
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_store_variants ON store_variants;
-- CREATE TRIGGER set_updated_at_store_variants
--     BEFORE UPDATE ON store_variants
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_store_reviews ON store_reviews;
-- CREATE TRIGGER set_updated_at_store_reviews
--     BEFORE UPDATE ON store_reviews
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_store_coupons ON store_coupons;
-- CREATE TRIGGER set_updated_at_store_coupons
--     BEFORE UPDATE ON store_coupons
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at_store_prescriptions ON store_prescriptions;
-- CREATE TRIGGER set_updated_at_store_prescriptions
--     BEFORE UPDATE ON store_prescriptions
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- I. STORE ORDERS
-- =============================================================================
-- Note: Store orders table already has trigger in 83_store_orders.sql
-- This section is included for documentation but trigger is commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_store_orders ON store_orders;
-- CREATE TRIGGER set_updated_at_store_orders
--     BEFORE UPDATE ON store_orders
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- J. WHATSAPP TEMPLATES
-- =============================================================================
-- Note: WhatsApp templates table already has trigger in 70_whatsapp_messages.sql
-- This section is included for documentation but trigger is commented out
-- to prevent duplicate trigger errors.

-- DROP TRIGGER IF EXISTS set_updated_at_whatsapp_templates ON whatsapp_templates;
-- CREATE TRIGGER set_updated_at_whatsapp_templates
--     BEFORE UPDATE ON whatsapp_templates
--     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- K. ENHANCED AUDIT
-- =============================================================================
-- Note: Audit tables may have updated_at but don't typically need triggers
-- as they are append-only logs

-- =============================================================================
-- UPDATED_AT TRIGGERS COMPLETE
-- =============================================================================

-- Summary:
-- This migration adds updated_at triggers to tables that were missing them,
-- specifically:
-- - services
-- - payment_methods
-- - invoice_sequences
-- - recurring_invoice_templates
-- - notification_channels
-- - notification_templates
-- - notification_preferences
-- - reminders
--
-- Many other tables already have their triggers defined in their respective
-- schema files (lab_*, hospitalization_*, consent_*, messaging_*, insurance_*).
-- These are documented above with commented-out code to prevent duplicate triggers.



-- =============================================================================
-- FILE: 54_tenant_setup.sql
-- =============================================================================

-- =============================================================================
-- 54_TENANT_SETUP.SQL
-- =============================================================================
-- Tenant onboarding function to replace hardcoded tenant IDs in seed scripts.
-- Creates a new tenant with all required default data.
-- =============================================================================

-- =============================================================================
-- A. MAIN TENANT SETUP FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION setup_new_tenant(
    p_tenant_id TEXT,
    p_tenant_name TEXT
)
RETURNS void AS $$
BEGIN
    -- =============================================================================
    -- 1. INSERT TENANT
    -- =============================================================================
    INSERT INTO tenants (id, name)
    VALUES (p_tenant_id, p_tenant_name)
    ON CONFLICT (id) DO NOTHING;

    -- =============================================================================
    -- 2. PAYMENT METHODS (Required for invoicing)
    -- =============================================================================
    INSERT INTO payment_methods (tenant_id, name, type, is_default) VALUES
        (p_tenant_id, 'Efectivo', 'cash', TRUE),
        (p_tenant_id, 'Tarjeta de Crédito', 'credit_card', FALSE),
        (p_tenant_id, 'Tarjeta de Débito', 'debit_card', FALSE),
        (p_tenant_id, 'Transferencia Bancaria', 'bank_transfer', FALSE),
        (p_tenant_id, 'Pago Móvil', 'mobile_payment', FALSE)
    ON CONFLICT DO NOTHING;

    -- =============================================================================
    -- 3. INVOICE SEQUENCE (Required for invoice numbering)
    -- =============================================================================
    INSERT INTO invoice_sequences (tenant_id, prefix, current_number, format)
    VALUES (
        p_tenant_id,
        UPPER(LEFT(p_tenant_id, 3)),  -- First 3 chars as prefix (e.g., 'ADR', 'PET')
        0,
        '{prefix}-{year}-{number}'
    )
    ON CONFLICT (tenant_id) DO NOTHING;

    -- =============================================================================
    -- 4. DEFAULT SERVICES (Common veterinary services)
    -- =============================================================================
    INSERT INTO services (tenant_id, code, name, category, base_price, duration_minutes, is_taxable) VALUES
        (p_tenant_id, 'CONSULT-001', 'Consulta General', 'consultation', 150000, 30, TRUE),
        (p_tenant_id, 'CONSULT-002', 'Consulta de Emergencia', 'consultation', 300000, 45, TRUE),
        (p_tenant_id, 'VAC-001', 'Vacunación Antirrábica', 'vaccination', 80000, 15, TRUE),
        (p_tenant_id, 'VAC-002', 'Vacunación Séxtuple (Perros)', 'vaccination', 120000, 15, TRUE),
        (p_tenant_id, 'VAC-003', 'Vacunación Triple Felina', 'vaccination', 100000, 15, TRUE),
        (p_tenant_id, 'SURG-001', 'Castración (Perro)', 'surgery', 400000, 120, TRUE),
        (p_tenant_id, 'SURG-002', 'Castración (Gato)', 'surgery', 300000, 90, TRUE),
        (p_tenant_id, 'EXAM-001', 'Análisis de Sangre Completo', 'lab', 250000, 30, TRUE),
        (p_tenant_id, 'EXAM-002', 'Radiografía Simple', 'imaging', 200000, 20, TRUE),
        (p_tenant_id, 'EXAM-003', 'Ecografía Abdominal', 'imaging', 350000, 30, TRUE),
        (p_tenant_id, 'GROOM-001', 'Baño y Corte', 'grooming', 150000, 60, TRUE),
        (p_tenant_id, 'DENT-001', 'Limpieza Dental', 'dentistry', 300000, 60, TRUE),
        (p_tenant_id, 'HOSP-001', 'Hospitalización (día)', 'hospitalization', 200000, 1440, TRUE)
    ON CONFLICT (tenant_id, code) DO NOTHING;

    -- =============================================================================
    -- 5. DEFAULT STORE CATEGORIES (For inventory)
    -- =============================================================================
    INSERT INTO store_categories (tenant_id, name, slug, description) VALUES
        (p_tenant_id, 'Alimento para Perros', 'alimento-perros', 'Alimentos balanceados y naturales para perros'),
        (p_tenant_id, 'Alimento para Gatos', 'alimento-gatos', 'Alimentos balanceados y naturales para gatos'),
        (p_tenant_id, 'Antiparasitarios', 'antiparasitarios', 'Productos contra pulgas, garrapatas y parásitos'),
        (p_tenant_id, 'Accesorios', 'accesorios', 'Collares, correas, juguetes y más'),
        (p_tenant_id, 'Higiene', 'higiene', 'Shampoos, cepillos y productos de limpieza'),
        (p_tenant_id, 'Medicamentos', 'medicamentos', 'Medicamentos veterinarios')
    ON CONFLICT (tenant_id, slug) DO NOTHING;

    -- =============================================================================
    -- 6. NOTIFICATION TEMPLATES (For reminders)
    -- =============================================================================
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminder_templates') THEN
        INSERT INTO reminder_templates (tenant_id, name, type, template_text, days_before, is_active) VALUES
            (p_tenant_id, 'Recordatorio de Vacuna', 'vaccine_due',
             'Hola {owner_name}, recordamos que {pet_name} tiene programada su vacuna {vaccine_name} para el {due_date}.',
             7, TRUE),
            (p_tenant_id, 'Recordatorio de Cita', 'appointment',
             'Hola {owner_name}, le recordamos su cita con {pet_name} para el {appointment_date} a las {appointment_time}.',
             1, TRUE),
            (p_tenant_id, 'Seguimiento Post-Cirugía', 'post_surgery',
             'Hola {owner_name}, ¿cómo se encuentra {pet_name} después de la cirugía? Por favor responda este mensaje o llámenos si tiene dudas.',
             1, TRUE)
        ON CONFLICT DO NOTHING;
    END IF;

    -- =============================================================================
    -- NOTIFICATION
    -- =============================================================================
    RAISE NOTICE 'Tenant % (%) created successfully with default data', p_tenant_name, p_tenant_id;

END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- B. HELPER FUNCTION: Validate Tenant Exists
-- =============================================================================

CREATE OR REPLACE FUNCTION tenant_exists(p_tenant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM tenants WHERE id = p_tenant_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- C. HELPER FUNCTION: Get Tenant Info
-- =============================================================================

CREATE OR REPLACE FUNCTION get_tenant_info(p_tenant_id TEXT)
RETURNS TABLE (
    tenant_id TEXT,
    tenant_name TEXT,
    payment_methods_count BIGINT,
    services_count BIGINT,
    categories_count BIGINT,
    users_count BIGINT,
    pets_count BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id AS tenant_id,
        t.name AS tenant_name,
        (SELECT COUNT(*) FROM payment_methods WHERE tenant_id = t.id) AS payment_methods_count,
        (SELECT COUNT(*) FROM services WHERE tenant_id = t.id) AS services_count,
        (SELECT COUNT(*) FROM store_categories WHERE tenant_id = t.id) AS categories_count,
        (SELECT COUNT(*) FROM profiles WHERE tenant_id = t.id) AS users_count,
        (SELECT COUNT(*) FROM pets WHERE tenant_id = t.id) AS pets_count,
        t.created_at
    FROM tenants t
    WHERE t.id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- D. HELPER FUNCTION: Delete Tenant (Use with caution!)
-- =============================================================================

CREATE OR REPLACE FUNCTION delete_tenant_cascade(p_tenant_id TEXT)
RETURNS void AS $$
BEGIN
    -- This will cascade delete all related data due to foreign key constraints
    -- USE WITH EXTREME CAUTION - THIS IS IRREVERSIBLE

    RAISE WARNING 'Deleting tenant % and ALL associated data...', p_tenant_id;

    -- Delete tenant (will cascade to all related tables)
    DELETE FROM tenants WHERE id = p_tenant_id;

    RAISE NOTICE 'Tenant % deleted successfully', p_tenant_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USAGE EXAMPLES
-- =============================================================================

-- Create a new tenant with all default data:
-- SELECT setup_new_tenant('myclinic', 'My Veterinary Clinic');

-- Check if tenant exists:
-- SELECT tenant_exists('myclinic');

-- Get tenant info and statistics:
-- SELECT * FROM get_tenant_info('myclinic');

-- Delete tenant (DANGEROUS - deletes all data):
-- SELECT delete_tenant_cascade('myclinic');

-- =============================================================================
-- TENANT SETUP COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 55_appointment_overlap.sql
-- =============================================================================

-- =============================================================================
-- 55_APPOINTMENT_OVERLAP.SQL
-- =============================================================================
-- Database function to check for appointment time overlaps.
-- This ensures proper slot availability checking and prevents double-booking.
-- =============================================================================

-- =============================================================================
-- A. CHECK APPOINTMENT OVERLAP FUNCTION
-- =============================================================================

-- Function to check if an appointment overlaps with existing appointments
-- Returns TRUE if there is an overlap, FALSE otherwise
-- Works with both appointment_date column (if exists) or extracts date from start_time
CREATE OR REPLACE FUNCTION check_appointment_overlap(
    p_tenant_id TEXT,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    has_overlap BOOLEAN;
    new_start_timestamp TIMESTAMPTZ;
    new_end_timestamp TIMESTAMPTZ;
BEGIN
    -- Create full timestamps for comparison
    new_start_timestamp := (p_date || 'T' || p_start_time || ':00')::TIMESTAMPTZ;
    new_end_timestamp := (p_date || 'T' || p_end_time || ':00')::TIMESTAMPTZ;

    -- Check for overlapping appointments using the standard overlap logic:
    -- Two time ranges [A_start, A_end) and [B_start, B_end) overlap if:
    -- A_start < B_end AND A_end > B_start
    SELECT EXISTS (
        SELECT 1
        FROM appointments
        WHERE tenant_id = p_tenant_id
          AND (
            -- Check using appointment_date column if it exists
            (appointment_date IS NOT NULL AND appointment_date = p_date)
            OR
            -- Fallback to extracting date from start_time
            (appointment_date IS NULL AND DATE(start_time) = p_date)
          )
          AND status NOT IN ('cancelled', 'no_show')
          -- Exclude specific appointment (useful for rescheduling)
          AND (p_exclude_id IS NULL OR id != p_exclude_id)
          -- Optionally filter by vet
          AND (p_vet_id IS NULL OR vet_id = p_vet_id)
          -- Overlap check: new slot starts before existing ends AND new slot ends after existing starts
          AND start_time < new_end_timestamp
          AND end_time > new_start_timestamp
    ) INTO has_overlap;

    RETURN has_overlap;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- B. GET AVAILABLE SLOTS FUNCTION
-- =============================================================================

-- Function to get all available time slots for a given date
-- This respects working hours, lunch breaks, and existing appointments
CREATE OR REPLACE FUNCTION get_available_slots(
    p_tenant_id TEXT,
    p_date DATE,
    p_slot_duration_minutes INTEGER DEFAULT 30,
    p_work_start TIME DEFAULT '08:00',
    p_work_end TIME DEFAULT '18:00',
    p_break_start TIME DEFAULT '12:00',
    p_break_end TIME DEFAULT '14:00',
    p_vet_id UUID DEFAULT NULL
) RETURNS TABLE (
    slot_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    current_minutes INTEGER;
    end_minutes INTEGER;
    break_start_minutes INTEGER;
    break_end_minutes INTEGER;
    slot_start TIME;
    slot_end TIME;
    overlaps BOOLEAN;
BEGIN
    -- Convert times to minutes for easier calculation
    current_minutes := EXTRACT(HOUR FROM p_work_start) * 60 + EXTRACT(MINUTE FROM p_work_start);
    end_minutes := EXTRACT(HOUR FROM p_work_end) * 60 + EXTRACT(MINUTE FROM p_work_end);
    break_start_minutes := EXTRACT(HOUR FROM p_break_start) * 60 + EXTRACT(MINUTE FROM p_break_start);
    break_end_minutes := EXTRACT(HOUR FROM p_break_end) * 60 + EXTRACT(MINUTE FROM p_break_end);

    -- Generate slots
    WHILE current_minutes + p_slot_duration_minutes <= end_minutes LOOP
        slot_start := make_time(current_minutes / 60, current_minutes % 60, 0);
        slot_end := make_time((current_minutes + p_slot_duration_minutes) / 60,
                              (current_minutes + p_slot_duration_minutes) % 60, 0);

        -- Skip slots that overlap with lunch break
        IF NOT (
            (current_minutes >= break_start_minutes AND current_minutes < break_end_minutes) OR
            (current_minutes + p_slot_duration_minutes > break_start_minutes AND
             current_minutes + p_slot_duration_minutes <= break_end_minutes) OR
            (current_minutes < break_start_minutes AND
             current_minutes + p_slot_duration_minutes > break_end_minutes)
        ) THEN
            -- Check if this slot overlaps with existing appointments
            overlaps := check_appointment_overlap(
                p_tenant_id,
                p_date,
                slot_start,
                slot_end,
                p_vet_id,
                NULL
            );

            -- Return the slot
            slot_time := slot_start;
            is_available := NOT overlaps;
            RETURN NEXT;
        END IF;

        -- Move to next slot
        current_minutes := current_minutes + p_slot_duration_minutes;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- C. HELPER COMMENTS
-- =============================================================================

-- Usage examples:
--
-- 1. Check if a specific time slot has an overlap:
--    SELECT check_appointment_overlap('adris', '2024-12-20', '09:00', '09:30');
--
-- 2. Check overlap excluding a specific appointment (for rescheduling):
--    SELECT check_appointment_overlap('adris', '2024-12-20', '09:00', '09:30', NULL, 'appointment-uuid');
--
-- 3. Get all available slots for a date:
--    SELECT * FROM get_available_slots('adris', '2024-12-20');
--
-- 4. Get available slots with custom hours:
--    SELECT * FROM get_available_slots('adris', '2024-12-20', 30, '08:00', '20:00', '12:00', '14:00');
--
-- 5. Get available slots for a specific vet:
--    SELECT * FROM get_available_slots('adris', '2024-12-20', 30, '08:00', '18:00', '12:00', '14:00', 'vet-uuid');

-- =============================================================================
-- D. ADD appointment_date COLUMN IF IT DOESN'T EXIST
-- =============================================================================

-- Add appointment_date column to support easier querying
-- This is a denormalized column derived from start_time
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;

-- Create index on appointment_date if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);

-- Create trigger to automatically populate appointment_date from start_time
CREATE OR REPLACE FUNCTION sync_appointment_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.appointment_date := DATE(NEW.start_time);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_appointment_date ON appointments;

-- Create trigger
CREATE TRIGGER trigger_sync_appointment_date
    BEFORE INSERT OR UPDATE OF start_time ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION sync_appointment_date();

-- Backfill existing appointments
UPDATE appointments
SET appointment_date = DATE(start_time)
WHERE appointment_date IS NULL;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 56_appointment_functions.sql
-- =============================================================================

-- =============================================================================
-- 56_APPOINTMENT_FUNCTIONS.SQL
-- =============================================================================
-- Functions for appointment validation and management.
-- =============================================================================

-- =============================================================================
-- A. CHECK_APPOINTMENT_OVERLAP
-- =============================================================================
-- Validates if a proposed appointment time overlaps with existing appointments.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_start_time: Start time of the proposed appointment (TIMESTAMPTZ)
--   p_end_time: End time of the proposed appointment (TIMESTAMPTZ)
--   p_vet_id: Optional - Specific vet to check for (NULL = check all)
--   p_exclude_id: Optional - Exclude specific appointment ID (for updates)
--
-- Returns:
--   TRUE if there IS an overlap (conflict exists)
--   FALSE if there is NO overlap (time slot is available)
--
-- Usage:
--   SELECT check_appointment_overlap(
--     'adris',
--     '2024-12-18 10:00:00-04',
--     '2024-12-18 11:00:00-04',
--     '123e4567-e89b-12d3-a456-426614174000',
--     NULL
--   );

CREATE OR REPLACE FUNCTION check_appointment_overlap(
    p_tenant_id TEXT,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM appointments
        WHERE tenant_id = p_tenant_id
        AND deleted_at IS NULL
        AND status NOT IN ('cancelled', 'no_show', 'rejected')
        AND (p_exclude_id IS NULL OR id != p_exclude_id)
        AND (p_vet_id IS NULL OR vet_id = p_vet_id)
        AND start_time < p_end_time
        AND end_time > p_start_time
    );
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION check_appointment_overlap IS
'Checks if a time slot overlaps with existing appointments. Returns TRUE if overlap exists (conflict), FALSE if slot is available.';

-- =============================================================================
-- B. GET_AVAILABLE_SLOTS
-- =============================================================================
-- Gets available appointment slots for a given date and vet.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_date: Date to check (DATE)
--   p_vet_id: Optional - Specific vet (NULL = check all)
--   p_slot_duration: Duration of each slot in minutes (default 30)
--   p_start_hour: Start of working hours (default 8)
--   p_end_hour: End of working hours (default 18)
--
-- Returns:
--   Table of available time slots with start_time, end_time, and is_available

CREATE OR REPLACE FUNCTION get_available_slots(
    p_tenant_id TEXT,
    p_date DATE,
    p_vet_id UUID DEFAULT NULL,
    p_slot_duration INTEGER DEFAULT 30,
    p_start_hour INTEGER DEFAULT 8,
    p_end_hour INTEGER DEFAULT 18
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    is_available BOOLEAN
) AS $$
DECLARE
    v_current_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_slot_start TIMESTAMPTZ;
    v_slot_end TIMESTAMPTZ;
BEGIN
    -- Calculate start and end times for the day
    v_current_time := (p_date + (p_start_hour || ' hours')::INTERVAL)::TIMESTAMPTZ;
    v_end_time := (p_date + (p_end_hour || ' hours')::INTERVAL)::TIMESTAMPTZ;

    -- Generate time slots
    WHILE v_current_time < v_end_time LOOP
        v_slot_start := v_current_time;
        v_slot_end := v_current_time + (p_slot_duration || ' minutes')::INTERVAL;

        -- Check if slot is available
        slot_start := v_slot_start;
        slot_end := v_slot_end;
        is_available := NOT check_appointment_overlap(
            p_tenant_id,
            v_slot_start,
            v_slot_end,
            p_vet_id,
            NULL
        );

        RETURN NEXT;

        v_current_time := v_slot_end;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_available_slots IS
'Returns all time slots for a given date with availability status for appointment booking.';

-- =============================================================================
-- C. COUNT_DAILY_APPOINTMENTS
-- =============================================================================
-- Counts active appointments for a specific date.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_date: Date to count appointments for
--   p_vet_id: Optional - Specific vet (NULL = all vets)
--
-- Returns:
--   Integer count of active appointments

CREATE OR REPLACE FUNCTION count_daily_appointments(
    p_tenant_id TEXT,
    p_date DATE,
    p_vet_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM appointments
    WHERE tenant_id = p_tenant_id
    AND deleted_at IS NULL
    AND status NOT IN ('cancelled', 'no_show', 'rejected')
    AND DATE(start_time) = p_date
    AND (p_vet_id IS NULL OR vet_id = p_vet_id);
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION count_daily_appointments IS
'Counts the number of active appointments for a given date and optional vet.';

-- =============================================================================
-- D. VALIDATE_APPOINTMENT_TIME
-- =============================================================================
-- Comprehensive validation for appointment booking.
-- Checks for overlaps, business hours, and date validity.
--
-- Parameters:
--   p_tenant_id: Tenant to check within
--   p_start_time: Start time of the proposed appointment
--   p_end_time: End time of the proposed appointment
--   p_vet_id: Optional - Specific vet
--   p_exclude_id: Optional - Exclude specific appointment ID
--
-- Returns:
--   JSON with validation result: {"valid": boolean, "message": "error message"}

CREATE OR REPLACE FUNCTION validate_appointment_time(
    p_tenant_id TEXT,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_vet_id UUID DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_hour INTEGER;
BEGIN
    -- Check that end time is after start time
    IF p_end_time <= p_start_time THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'La hora de fin debe ser posterior a la hora de inicio'
        );
    END IF;

    -- Check that appointment is not in the past
    IF p_start_time < NOW() THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'No se pueden crear citas en el pasado'
        );
    END IF;

    -- Check business hours (8 AM - 6 PM)
    v_hour := EXTRACT(HOUR FROM p_start_time);
    IF v_hour < 8 OR v_hour >= 18 THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'Las citas deben estar entre las 8:00 y las 18:00'
        );
    END IF;

    -- Check for overlaps
    IF check_appointment_overlap(p_tenant_id, p_start_time, p_end_time, p_vet_id, p_exclude_id) THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'Ya existe una cita en este horario'
        );
    END IF;

    -- All validations passed
    RETURN jsonb_build_object(
        'valid', TRUE,
        'message', 'Horario disponible'
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION validate_appointment_time IS
'Comprehensive appointment time validation returning detailed error messages.';

-- =============================================================================
-- APPOINTMENT FUNCTIONS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 57_materialized_views.sql
-- =============================================================================

-- =============================================================================
-- 57_MATERIALIZED_VIEWS.SQL
-- =============================================================================
-- Additional materialized views for enhanced analytics and performance.
-- Complements existing views in 31_materialized_views.sql
--
-- NOTE: The core materialized views (mv_clinic_dashboard_stats,
-- mv_appointment_analytics, mv_inventory_alerts) are defined in
-- 31_materialized_views.sql. This file provides supplementary views.
-- =============================================================================

-- =============================================================================
-- A. ENHANCED CLINIC DASHBOARD STATS (Optimized Version)
-- =============================================================================
-- Improved version with better performance and additional metrics
-- If you want to replace the existing view, first drop it:
-- DROP MATERIALIZED VIEW IF EXISTS mv_clinic_dashboard_stats CASCADE;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_clinic_dashboard_stats_v2 AS
SELECT
    t.id AS tenant_id,
    t.name AS clinic_name,

    -- Pet counts (active pets only)
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) AS total_pets,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'dog') AS total_dogs,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species = 'cat') AS total_cats,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND p.species NOT IN ('dog', 'cat')) AS total_other,

    -- New pets this month
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL AND DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS new_pets_this_month,

    -- Client counts
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role = 'owner') AS total_clients,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role = 'owner' AND DATE_TRUNC('month', pr.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS new_clients_this_month,

    -- Today's appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE) AS today_appointments,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'confirmed') AS today_confirmed,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'completed') AS today_completed,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE AND a.status = 'pending') AS today_pending,

    -- Tomorrow's appointments (for planning)
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL AND DATE(a.start_time) = CURRENT_DATE + INTERVAL '1 day') AS tomorrow_appointments,

    -- This week appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL
        AND a.start_time >= DATE_TRUNC('week', CURRENT_DATE)
        AND a.start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days') AS week_appointments,

    -- Medical records this month
    COUNT(DISTINCT mr.id) FILTER (WHERE mr.deleted_at IS NULL AND DATE_TRUNC('month', mr.created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS month_records,

    -- Vaccines pending
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending') AS vaccines_pending,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date <= CURRENT_DATE) AS vaccines_overdue,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date > CURRENT_DATE AND v.next_due_date <= CURRENT_DATE + INTERVAL '7 days') AS vaccines_due_this_week,
    COUNT(DISTINCT v.id) FILTER (WHERE v.deleted_at IS NULL AND v.status = 'pending' AND v.next_due_date > CURRENT_DATE + INTERVAL '7 days' AND v.next_due_date <= CURRENT_DATE + INTERVAL '30 days') AS vaccines_due_this_month,

    -- Active hospitalizations
    COUNT(DISTINCT h.id) FILTER (WHERE h.deleted_at IS NULL AND h.status = 'active') AS active_hospitalizations,

    -- Pending lab orders
    COUNT(DISTINCT lo.id) FILTER (WHERE lo.deleted_at IS NULL AND lo.status IN ('ordered', 'specimen_collected', 'in_progress')) AS pending_lab_orders,

    -- Revenue metrics
    COALESCE(SUM(inv.total) FILTER (WHERE inv.deleted_at IS NULL AND DATE_TRUNC('month', inv.created_at) = DATE_TRUNC('month', CURRENT_DATE) AND inv.status = 'paid'), 0) AS month_revenue,
    COALESCE(SUM(inv.total) FILTER (WHERE inv.deleted_at IS NULL AND DATE(inv.created_at) = CURRENT_DATE AND inv.status = 'paid'), 0) AS today_revenue,

    -- Outstanding invoices
    COALESCE(SUM(inv.balance_due) FILTER (WHERE inv.deleted_at IS NULL AND inv.status IN ('sent', 'overdue')), 0) AS outstanding_balance,
    COUNT(DISTINCT inv.id) FILTER (WHERE inv.deleted_at IS NULL AND inv.status = 'overdue') AS overdue_invoice_count,

    -- Staff metrics
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.role IN ('vet', 'admin')) AS total_staff,

    -- Last refresh
    NOW() AS refreshed_at

FROM tenants t
LEFT JOIN pets p ON p.tenant_id = t.id
LEFT JOIN profiles pr ON pr.tenant_id = t.id
LEFT JOIN appointments a ON a.tenant_id = t.id
LEFT JOIN medical_records mr ON mr.tenant_id = t.id
LEFT JOIN vaccines v ON v.pet_id = p.id
LEFT JOIN hospitalizations h ON h.tenant_id = t.id
LEFT JOIN lab_orders lo ON lo.tenant_id = t.id
LEFT JOIN invoices inv ON inv.tenant_id = t.id
GROUP BY t.id, t.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_clinic_dashboard_v2_tenant ON mv_clinic_dashboard_stats_v2(tenant_id);

-- =============================================================================
-- B. ENHANCED APPOINTMENT ANALYTICS (Daily Granularity)
-- =============================================================================
-- Daily appointment metrics for detailed scheduling analysis

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_appointment_analytics_daily AS
SELECT
    tenant_id,
    DATE(start_time) AS appointment_date,
    EXTRACT(DOW FROM start_time) AS day_of_week, -- 0=Sunday, 6=Saturday
    EXTRACT(HOUR FROM start_time) AS hour_of_day,

    -- Appointment counts
    COUNT(*) AS total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
    COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending,
    COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,

    -- Rates
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2) AS completion_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'no_show') / NULLIF(COUNT(*), 0), 2) AS no_show_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / NULLIF(COUNT(*), 0), 2) AS cancellation_rate,

    -- Duration metrics
    AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS avg_duration_minutes,
    MIN(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS min_duration_minutes,
    MAX(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) AS max_duration_minutes,

    -- Unique metrics
    COUNT(DISTINCT pet_id) AS unique_pets,
    COUNT(DISTINCT vet_id) AS unique_vets,

    NOW() AS refreshed_at

FROM appointments
WHERE deleted_at IS NULL
  AND start_time >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY tenant_id, DATE(start_time), EXTRACT(DOW FROM start_time), EXTRACT(HOUR FROM start_time);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_appt_daily ON mv_appointment_analytics_daily(tenant_id, appointment_date, hour_of_day);
CREATE INDEX IF NOT EXISTS idx_mv_appt_daily_dow ON mv_appointment_analytics_daily(tenant_id, day_of_week);

-- =============================================================================
-- C. ENHANCED INVENTORY ALERTS (Multi-level Alerts)
-- =============================================================================
-- Comprehensive inventory monitoring with priority levels

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inventory_alerts_detailed AS
SELECT
    sp.tenant_id,
    sp.id AS product_id,
    sp.name AS product_name,
    sp.sku,
    sc.name AS category_name,

    -- Stock levels
    si.stock_quantity,
    si.min_stock_level,
    si.weighted_average_cost,
    si.expiry_date,
    si.batch_number,
    si.supplier_name,

    -- Alert classification
    CASE
        WHEN si.stock_quantity <= 0 THEN 'critical_out_of_stock'
        WHEN si.stock_quantity <= si.min_stock_level * 0.25 THEN 'critical_very_low'
        WHEN si.stock_quantity <= si.min_stock_level * 0.5 THEN 'high_low_stock'
        WHEN si.stock_quantity <= si.min_stock_level THEN 'medium_approaching_min'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE THEN 'critical_expired'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'high_expiring_week'
        WHEN si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'medium_expiring_month'
        ELSE 'low_monitor'
    END AS alert_level,

    -- Priority score (higher = more urgent)
    CASE
        WHEN si.stock_quantity <= 0 THEN 100
        WHEN si.expiry_date <= CURRENT_DATE THEN 95
        WHEN si.stock_quantity <= si.min_stock_level * 0.25 THEN 90
        WHEN si.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 85
        WHEN si.stock_quantity <= si.min_stock_level * 0.5 THEN 70
        WHEN si.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 60
        WHEN si.stock_quantity <= si.min_stock_level THEN 50
        ELSE 10
    END AS priority_score,

    -- Financial impact
    (si.min_stock_level - si.stock_quantity) * si.weighted_average_cost AS reorder_cost_estimate,
    si.stock_quantity * si.weighted_average_cost AS current_stock_value,

    -- Days until critical
    CASE
        WHEN si.expiry_date IS NOT NULL
        THEN EXTRACT(DAY FROM (si.expiry_date - CURRENT_DATE))
        ELSE NULL
    END AS days_until_expiry,

    NOW() AS refreshed_at

FROM store_products sp
JOIN store_inventory si ON sp.id = si.product_id
LEFT JOIN store_categories sc ON sp.category_id = sc.id
WHERE sp.is_active = TRUE
  AND (
    si.stock_quantity <= si.min_stock_level
    OR si.stock_quantity <= 0
    OR (si.expiry_date IS NOT NULL AND si.expiry_date <= CURRENT_DATE + INTERVAL '30 days')
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inv_alerts_detailed ON mv_inventory_alerts_detailed(tenant_id, product_id, COALESCE(batch_number, 'no-batch'));
CREATE INDEX IF NOT EXISTS idx_mv_inv_alerts_priority ON mv_inventory_alerts_detailed(tenant_id, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_mv_inv_alerts_level ON mv_inventory_alerts_detailed(tenant_id, alert_level);

-- =============================================================================
-- D. PET HEALTH SUMMARY
-- =============================================================================
-- Quick health overview per pet for dashboard

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pet_health_summary AS
SELECT
    p.id AS pet_id,
    p.tenant_id,
    p.name AS pet_name,
    p.species,
    p.owner_id,
    pr.full_name AS owner_name,

    -- Age calculation
    EXTRACT(YEAR FROM AGE(COALESCE(p.birth_date, CURRENT_DATE))) AS age_years,

    -- Vaccine status
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'verified') AS vaccines_complete,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'pending') AS vaccines_pending,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'pending' AND v.next_due_date < CURRENT_DATE) AS vaccines_overdue,
    MIN(v.next_due_date) FILTER (WHERE v.status = 'pending' AND v.next_due_date >= CURRENT_DATE) AS next_vaccine_due,

    -- Medical records
    COUNT(DISTINCT mr.id) AS total_medical_records,
    MAX(mr.created_at) AS last_medical_record_date,

    -- Appointments
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS total_visits,
    MAX(a.start_time) FILTER (WHERE a.status = 'completed') AS last_visit_date,
    MIN(a.start_time) FILTER (WHERE a.start_time > NOW() AND a.status IN ('pending', 'confirmed')) AS next_appointment,

    -- Health indicators
    EXISTS(SELECT 1 FROM medical_records mr2 WHERE mr2.pet_id = p.id AND mr2.record_type = 'chronic_condition' AND mr2.deleted_at IS NULL) AS has_chronic_conditions,
    p.allergies IS NOT NULL AND p.allergies != '' AS has_allergies,

    -- Days since last visit
    EXTRACT(DAY FROM (NOW() - MAX(a.start_time) FILTER (WHERE a.status = 'completed'))) AS days_since_last_visit,

    NOW() AS refreshed_at

FROM pets p
LEFT JOIN profiles pr ON p.owner_id = pr.id
LEFT JOIN vaccines v ON v.pet_id = p.id AND v.deleted_at IS NULL
LEFT JOIN medical_records mr ON mr.pet_id = p.id AND mr.deleted_at IS NULL
LEFT JOIN appointments a ON a.pet_id = p.id AND a.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.tenant_id, p.name, p.species, p.owner_id, pr.full_name, p.birth_date, p.allergies;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pet_health_pet ON mv_pet_health_summary(pet_id);
CREATE INDEX IF NOT EXISTS idx_mv_pet_health_tenant ON mv_pet_health_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mv_pet_health_overdue ON mv_pet_health_summary(tenant_id, vaccines_overdue) WHERE vaccines_overdue > 0;
CREATE INDEX IF NOT EXISTS idx_mv_pet_health_next_vaccine ON mv_pet_health_summary(tenant_id, next_vaccine_due);

-- =============================================================================
-- E. REVENUE BREAKDOWN BY SERVICE
-- =============================================================================
-- Service-level revenue analytics

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_by_service AS
SELECT
    s.tenant_id,
    DATE_TRUNC('month', i.created_at) AS month,
    s.id AS service_id,
    s.name AS service_name,
    s.category AS service_category,

    -- Volume metrics
    COUNT(DISTINCT ii.id) AS times_invoiced,
    SUM(ii.quantity) AS total_quantity,

    -- Revenue metrics
    SUM(ii.quantity * ii.unit_price) AS total_revenue,
    AVG(ii.unit_price) AS avg_unit_price,
    MIN(ii.unit_price) AS min_unit_price,
    MAX(ii.unit_price) AS max_unit_price,

    -- Client metrics
    COUNT(DISTINCT i.client_id) AS unique_clients,

    NOW() AS refreshed_at

FROM services s
LEFT JOIN invoice_items ii ON ii.service_id = s.id
LEFT JOIN invoices i ON ii.invoice_id = i.id AND i.deleted_at IS NULL AND i.status = 'paid'
WHERE s.is_active = TRUE
  AND i.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY s.tenant_id, DATE_TRUNC('month', i.created_at), s.id, s.name, s.category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_revenue_service ON mv_revenue_by_service(tenant_id, service_id, month);
CREATE INDEX IF NOT EXISTS idx_mv_revenue_service_month ON mv_revenue_by_service(tenant_id, month);
CREATE INDEX IF NOT EXISTS idx_mv_revenue_service_category ON mv_revenue_by_service(tenant_id, service_category, month);

-- =============================================================================
-- F. CLIENT LIFETIME VALUE ENHANCED
-- =============================================================================
-- Comprehensive client value metrics

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_client_lifetime_value AS
SELECT
    pr.id AS client_id,
    pr.tenant_id,
    pr.full_name,
    pr.email,
    pr.phone,

    -- Pet portfolio
    COUNT(DISTINCT p.id) AS total_pets,
    COUNT(DISTINCT p.id) FILTER (WHERE p.species = 'dog') AS dog_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.species = 'cat') AS cat_count,

    -- Visit history
    MIN(a.start_time) FILTER (WHERE a.status = 'completed') AS first_visit_date,
    MAX(a.start_time) FILTER (WHERE a.status = 'completed') AS last_visit_date,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS total_completed_visits,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'no_show') AS total_no_shows,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'cancelled') AS total_cancellations,

    -- Financial metrics
    COALESCE(SUM(inv.total) FILTER (WHERE inv.status = 'paid'), 0) AS lifetime_revenue,
    COALESCE(AVG(inv.total) FILTER (WHERE inv.status = 'paid'), 0) AS avg_invoice_amount,
    COALESCE(SUM(inv.balance_due) FILTER (WHERE inv.status IN ('sent', 'overdue')), 0) AS current_balance_due,

    -- Engagement metrics
    EXTRACT(DAY FROM (MAX(a.start_time) FILTER (WHERE a.status = 'completed') - MIN(a.start_time) FILTER (WHERE a.status = 'completed'))) AS customer_lifetime_days,
    CASE
        WHEN MAX(a.start_time) FILTER (WHERE a.status = 'completed') >= CURRENT_DATE - INTERVAL '90 days' THEN 'active'
        WHEN MAX(a.start_time) FILTER (WHERE a.status = 'completed') >= CURRENT_DATE - INTERVAL '180 days' THEN 'at_risk'
        WHEN MAX(a.start_time) FILTER (WHERE a.status = 'completed') IS NULL THEN 'never_visited'
        ELSE 'churned'
    END AS client_status,

    -- Loyalty indicators
    COUNT(DISTINCT DATE_TRUNC('month', a.start_time)) FILTER (WHERE a.status = 'completed') AS active_months,
    COALESCE(lp.balance, 0) AS loyalty_points_balance,

    NOW() AS refreshed_at

FROM profiles pr
LEFT JOIN pets p ON p.owner_id = pr.id AND p.tenant_id = pr.tenant_id AND p.deleted_at IS NULL
LEFT JOIN appointments a ON a.pet_id = p.id AND a.tenant_id = pr.tenant_id AND a.deleted_at IS NULL
LEFT JOIN invoices inv ON inv.client_id = pr.id AND inv.tenant_id = pr.tenant_id AND inv.deleted_at IS NULL
LEFT JOIN loyalty_points lp ON lp.user_id = pr.id
WHERE pr.role = 'owner'
GROUP BY pr.id, pr.tenant_id, pr.full_name, pr.email, pr.phone, lp.balance;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_client_ltv_client ON mv_client_lifetime_value(client_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_ltv_tenant ON mv_client_lifetime_value(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mv_client_ltv_status ON mv_client_lifetime_value(tenant_id, client_status);
CREATE INDEX IF NOT EXISTS idx_mv_client_ltv_revenue ON mv_client_lifetime_value(tenant_id, lifetime_revenue DESC);

-- =============================================================================
-- G. REFRESH FUNCTIONS FOR NEW VIEWS
-- =============================================================================

-- Refresh all enhanced materialized views
CREATE OR REPLACE FUNCTION refresh_enhanced_materialized_views()
RETURNS TABLE (view_name TEXT, refreshed_at TIMESTAMPTZ, duration_ms INTEGER) AS $$
DECLARE
    v_start TIMESTAMPTZ;
    v_duration INTEGER;
BEGIN
    -- mv_clinic_dashboard_stats_v2
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats_v2;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_clinic_dashboard_stats_v2';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_appointment_analytics_daily
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_appointment_analytics_daily;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_appointment_analytics_daily';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_inventory_alerts_detailed
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts_detailed;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_inventory_alerts_detailed';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_pet_health_summary
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_health_summary;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_pet_health_summary';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_revenue_by_service
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_by_service;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_revenue_by_service';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    -- mv_client_lifetime_value
    v_start := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_lifetime_value;
    v_duration := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start));
    view_name := 'mv_client_lifetime_value';
    refreshed_at := NOW();
    duration_ms := v_duration;
    RETURN NEXT;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Quick dashboard refresh (most frequently accessed views)
CREATE OR REPLACE FUNCTION refresh_critical_dashboard_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_clinic_dashboard_stats_v2;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_alerts_detailed;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pet_health_summary;
END;
$$ LANGUAGE plpgsql;

-- Scheduled job wrapper functions
CREATE OR REPLACE FUNCTION job_refresh_enhanced_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_enhanced_materialized_views();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION job_refresh_critical_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_critical_dashboard_views();
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- H. GRANT ACCESS TO NEW VIEWS
-- =============================================================================

GRANT SELECT ON mv_clinic_dashboard_stats_v2 TO authenticated;
GRANT SELECT ON mv_appointment_analytics_daily TO authenticated;
GRANT SELECT ON mv_inventory_alerts_detailed TO authenticated;
GRANT SELECT ON mv_pet_health_summary TO authenticated;
GRANT SELECT ON mv_revenue_by_service TO authenticated;
GRANT SELECT ON mv_client_lifetime_value TO authenticated;

-- =============================================================================
-- I. SCHEDULED JOBS FOR NEW VIEWS (Optional - Add to 32_scheduled_jobs.sql)
-- =============================================================================

-- To add these jobs to your cron schedule, run:
-- SELECT cron.schedule(
--     'vete_refresh_enhanced_views',
--     '0 */2 * * *', -- Every 2 hours
--     $$SELECT run_scheduled_job('refresh_enhanced', 'job_refresh_enhanced_views')$$
-- );
--
-- SELECT cron.schedule(
--     'vete_refresh_critical_views',
--     '*/10 * * * *', -- Every 10 minutes
--     $$SELECT run_scheduled_job('refresh_critical', 'job_refresh_critical_views')$$
-- );

-- =============================================================================
-- J. UTILITY: Manual Refresh All (Core + Enhanced)
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_all_views_complete()
RETURNS TABLE (
    view_name TEXT,
    refreshed_at TIMESTAMPTZ,
    status TEXT
) AS $$
BEGIN
    -- Core views from 31_materialized_views.sql
    BEGIN
        PERFORM refresh_all_materialized_views();
        view_name := 'core_views_batch';
        refreshed_at := NOW();
        status := 'completed';
        RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
        view_name := 'core_views_batch';
        refreshed_at := NOW();
        status := 'failed: ' || SQLERRM;
        RETURN NEXT;
    END;

    -- Enhanced views from this file
    BEGIN
        PERFORM refresh_enhanced_materialized_views();
        view_name := 'enhanced_views_batch';
        refreshed_at := NOW();
        status := 'completed';
        RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
        view_name := 'enhanced_views_batch';
        refreshed_at := NOW();
        status := 'failed: ' || SQLERRM;
        RETURN NEXT;
    END;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ENHANCED MATERIALIZED VIEWS COMPLETE
-- =============================================================================
--
-- Summary of views created:
-- 1. mv_clinic_dashboard_stats_v2 - Enhanced dashboard with more metrics
-- 2. mv_appointment_analytics_daily - Daily appointment patterns
-- 3. mv_inventory_alerts_detailed - Multi-level inventory alerts
-- 4. mv_pet_health_summary - Per-pet health overview
-- 5. mv_revenue_by_service - Service-level revenue breakdown
-- 6. mv_client_lifetime_value - Comprehensive client value metrics
--
-- Usage:
-- - Query views directly: SELECT * FROM mv_clinic_dashboard_stats_v2 WHERE tenant_id = 'adris';
-- - Refresh all enhanced views: SELECT * FROM refresh_enhanced_materialized_views();
-- - Refresh critical views only: SELECT refresh_critical_dashboard_views();
-- - Refresh everything: SELECT * FROM refresh_all_views_complete();
--
-- Performance notes:
-- - Views include unique indexes for CONCURRENT refresh (no locks)
-- - Refresh times logged via refresh functions
-- - Schedule appropriately based on data volume and update frequency
-- =============================================================================



-- =============================================================================
-- FILE: 58_appointment_workflow.sql
-- =============================================================================

-- =============================================================================
-- 55_APPOINTMENT_WORKFLOW.SQL
-- =============================================================================
-- Adds workflow columns and extended status values for staff appointment management.
-- =============================================================================

-- A. Update status CHECK constraint to include new workflow statuses
-- First drop the existing constraint, then add the new one
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
    CHECK (status IN (
        'pending',       -- Initial booking, awaiting confirmation
        'confirmed',     -- Confirmed by staff
        'checked_in',    -- Patient has arrived
        'in_progress',   -- Consultation in progress
        'completed',     -- Appointment finished
        'cancelled',     -- Cancelled by owner or staff
        'no_show',       -- Patient didn't arrive
        'rejected'       -- Rejected by staff (legacy)
    ));

-- B. Add workflow tracking columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES profiles(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES profiles(id);

-- C. Add index for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_date_status
    ON appointments(tenant_id, start_time, status);

CREATE INDEX IF NOT EXISTS idx_appointments_today
    ON appointments(tenant_id, start_time)
    WHERE status NOT IN ('cancelled', 'no_show');

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 70_whatsapp_messages.sql
-- =============================================================================

-- WhatsApp Messages Table
-- Stores all inbound and outbound WhatsApp messages via Twilio

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  client_id UUID REFERENCES profiles(id),
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  twilio_sid TEXT,
  conversation_type TEXT CHECK (conversation_type IN ('appointment_reminder', 'vaccine_reminder', 'general', 'support')),
  related_id UUID, -- Can reference appointments, pets, etc.
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_tenant ON whatsapp_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_client ON whatsapp_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_twilio ON whatsapp_messages(twilio_sid);

-- Enable RLS
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Staff can view all messages for their clinic
CREATE POLICY "Staff view clinic messages" ON whatsapp_messages
  FOR SELECT USING (is_staff_of(tenant_id));

-- Staff can send messages
CREATE POLICY "Staff send messages" ON whatsapp_messages
  FOR INSERT WITH CHECK (is_staff_of(tenant_id));

-- Staff can update message status
CREATE POLICY "Staff update messages" ON whatsapp_messages
  FOR UPDATE USING (is_staff_of(tenant_id));

-- WhatsApp Templates Table
-- Reusable message templates with variable placeholders

CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('appointment_reminder', 'vaccine_reminder', 'general', 'support')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Staff can manage templates
CREATE POLICY "Staff manage templates" ON whatsapp_templates
  FOR ALL USING (is_staff_of(tenant_id));

-- Trigger to update updated_at
CREATE TRIGGER handle_whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert default templates for existing tenants (optional)
-- This can be run manually or as part of tenant onboarding
/*
INSERT INTO whatsapp_templates (tenant_id, name, content, variables, category)
SELECT 
  t.id,
  'Recordatorio de cita',
  'Hola {{client_name}}! 🐾 Te recordamos que {{pet_name}} tiene cita el {{date}} a las {{time}}. ¿Confirmas asistencia?',
  ARRAY['client_name', 'pet_name', 'date', 'time'],
  'appointment_reminder'
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM whatsapp_templates wt 
  WHERE wt.tenant_id = t.id AND wt.name = 'Recordatorio de cita'
);
*/

COMMENT ON TABLE whatsapp_messages IS 'WhatsApp message log for all inbound/outbound messages via Twilio';
COMMENT ON TABLE whatsapp_templates IS 'Reusable WhatsApp message templates with variable placeholders';



-- =============================================================================
-- FILE: 80_fix_missing_rls_and_indexes.sql
-- =============================================================================

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



-- =============================================================================
-- FILE: 81_checkout_functions.sql
-- =============================================================================

-- =============================================================================
-- 81_CHECKOUT_FUNCTIONS.SQL
-- =============================================================================
-- TICKET-BIZ-003: Functions for checkout and stock management
-- =============================================================================

-- =============================================================================
-- A. DECREMENT_STOCK
-- =============================================================================
-- Atomically decrements stock for a product. Returns the new stock quantity.
-- Uses row-level locking to prevent race conditions.

CREATE OR REPLACE FUNCTION public.decrement_stock(
    p_product_id UUID,
    p_tenant_id TEXT,
    p_quantity INT
) RETURNS INT AS $$
DECLARE
    current_stock INT;
    new_stock INT;
BEGIN
    -- Lock the row and get current stock
    SELECT stock_quantity INTO current_stock
    FROM store_inventory
    WHERE product_id = p_product_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found in inventory';
    END IF;

    IF current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, p_quantity;
    END IF;

    -- Decrement stock
    new_stock := current_stock - p_quantity;

    UPDATE store_inventory
    SET
        stock_quantity = new_stock,
        updated_at = NOW()
    WHERE product_id = p_product_id
    AND tenant_id = p_tenant_id;

    -- Log the transaction
    INSERT INTO store_inventory_transactions (
        tenant_id,
        product_id,
        type,
        quantity,
        notes,
        performed_by,
        created_at
    ) VALUES (
        p_tenant_id,
        p_product_id,
        'sale',
        -p_quantity,
        'Checkout via store',
        NULL,
        NOW()
    );

    RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. VALIDATE_STOCK
-- =============================================================================
-- Validates that all items in a cart have sufficient stock.
-- Returns a JSON array of items with insufficient stock.

CREATE OR REPLACE FUNCTION public.validate_stock(
    p_tenant_id TEXT,
    p_items JSONB -- Array of {sku: string, quantity: int}
) RETURNS JSONB AS $$
DECLARE
    item JSONB;
    product_record RECORD;
    errors JSONB := '[]'::JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT
            sp.id,
            sp.sku,
            sp.name,
            COALESCE(si.stock_quantity, 0) as stock
        INTO product_record
        FROM store_products sp
        LEFT JOIN store_inventory si ON si.product_id = sp.id AND si.tenant_id = p_tenant_id
        WHERE sp.tenant_id = p_tenant_id
        AND sp.sku = item->>'sku';

        IF product_record IS NULL THEN
            errors := errors || jsonb_build_object(
                'sku', item->>'sku',
                'error', 'Product not found',
                'requested', (item->>'quantity')::INT,
                'available', 0
            );
        ELSIF product_record.stock < (item->>'quantity')::INT THEN
            errors := errors || jsonb_build_object(
                'sku', item->>'sku',
                'name', product_record.name,
                'error', 'Insufficient stock',
                'requested', (item->>'quantity')::INT,
                'available', product_record.stock
            );
        END IF;
    END LOOP;

    RETURN errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. PROCESS_CHECKOUT (Atomic checkout)
-- =============================================================================
-- Atomically processes a checkout: validates stock, creates invoice, decrements stock.
-- This ensures consistency even with concurrent requests.

CREATE OR REPLACE FUNCTION public.process_checkout(
    p_tenant_id TEXT,
    p_user_id UUID,
    p_items JSONB, -- Array of {sku, name, price, quantity, type}
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    stock_errors JSONB;
    product_items JSONB;
    item JSONB;
    invoice_id UUID;
    invoice_number TEXT;
    subtotal NUMERIC := 0;
    tax_rate NUMERIC := 10;
    tax_amount NUMERIC;
    total NUMERIC;
    product_record RECORD;
BEGIN
    -- 1. Filter product items for stock validation
    SELECT jsonb_agg(i) INTO product_items
    FROM jsonb_array_elements(p_items) i
    WHERE i->>'type' = 'product';

    -- 2. Validate stock if there are products
    IF product_items IS NOT NULL AND jsonb_array_length(product_items) > 0 THEN
        SELECT public.validate_stock(p_tenant_id, product_items) INTO stock_errors;

        IF jsonb_array_length(stock_errors) > 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient stock',
                'stock_errors', stock_errors
            );
        END IF;
    END IF;

    -- 3. Calculate totals
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        subtotal := subtotal + ((item->>'price')::NUMERIC * (item->>'quantity')::INT);
    END LOOP;

    subtotal := ROUND(subtotal, 2);
    tax_amount := ROUND(subtotal * tax_rate / 100, 2);
    total := ROUND(subtotal + tax_amount, 2);

    -- 4. Generate invoice number
    invoice_number := 'INV-' || EXTRACT(EPOCH FROM NOW())::BIGINT;

    -- 5. Create invoice
    INSERT INTO invoices (
        tenant_id,
        invoice_number,
        owner_id,
        status,
        subtotal,
        tax_rate,
        tax_amount,
        total,
        amount_paid,
        amount_due,
        notes,
        due_date,
        created_by
    ) VALUES (
        p_tenant_id,
        invoice_number,
        p_user_id,
        'pending',
        subtotal,
        tax_rate,
        tax_amount,
        total,
        0,
        total,
        COALESCE(p_notes, 'Pedido desde tienda online'),
        NOW() + INTERVAL '7 days',
        p_user_id
    ) RETURNING id INTO invoice_id;

    -- 6. Create invoice items and decrement stock
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insert invoice item
        INSERT INTO invoice_items (
            invoice_id,
            description,
            quantity,
            unit_price,
            discount_percent,
            line_total
        ) VALUES (
            invoice_id,
            item->>'name',
            (item->>'quantity')::INT,
            (item->>'price')::NUMERIC,
            0,
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT, 2)
        );

        -- Decrement stock for products
        IF item->>'type' = 'product' THEN
            SELECT sp.id INTO product_record
            FROM store_products sp
            WHERE sp.tenant_id = p_tenant_id
            AND sp.sku = item->>'id';

            IF product_record.id IS NOT NULL THEN
                PERFORM public.decrement_stock(
                    product_record.id,
                    p_tenant_id,
                    (item->>'quantity')::INT
                );
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'invoice', jsonb_build_object(
            'id', invoice_id,
            'invoice_number', invoice_number,
            'total', total,
            'status', 'pending'
        )
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.decrement_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_checkout TO authenticated;

-- =============================================================================
-- D. RECORD_PAYMENT (Atomic payment recording)
-- =============================================================================
-- TICKET-BIZ-005: Atomically records a payment to prevent race conditions.
-- Uses row-level locking to ensure concurrent payments don't corrupt data.

CREATE OR REPLACE FUNCTION public.record_invoice_payment(
    p_invoice_id UUID,
    p_tenant_id TEXT,
    p_amount NUMERIC,
    p_payment_method TEXT DEFAULT 'cash',
    p_reference_number TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_received_by UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_invoice RECORD;
    v_new_amount_paid NUMERIC;
    v_new_amount_due NUMERIC;
    v_new_status TEXT;
    v_payment_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    SELECT id, status, total, amount_paid, amount_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'void' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede pagar una factura anulada');
    END IF;

    IF v_invoice.status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Esta factura ya está pagada');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'El monto debe ser mayor a 0');
    END IF;

    IF p_amount > v_invoice.amount_due THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('El monto excede el saldo pendiente (%s)', v_invoice.amount_due)
        );
    END IF;

    -- Calculate new amounts
    v_new_amount_paid := v_invoice.amount_paid + p_amount;
    v_new_amount_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE WHEN v_new_amount_due <= 0 THEN 'paid' ELSE 'partial' END;

    -- Create payment record
    INSERT INTO payments (
        tenant_id,
        invoice_id,
        amount,
        payment_method,
        reference_number,
        notes,
        received_by,
        paid_at
    ) VALUES (
        p_tenant_id,
        p_invoice_id,
        p_amount,
        p_payment_method,
        p_reference_number,
        p_notes,
        p_received_by,
        NOW()
    ) RETURNING id INTO v_payment_id;

    -- Update invoice
    UPDATE invoices
    SET
        amount_paid = v_new_amount_paid,
        amount_due = v_new_amount_due,
        status = v_new_status,
        paid_at = CASE WHEN v_new_status = 'paid' THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'amount_paid', v_new_amount_paid,
        'amount_due', v_new_amount_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- E. PROCESS_REFUND (Atomic refund processing)
-- =============================================================================
-- TICKET-BIZ-005: Atomically processes a refund to prevent race conditions.
-- Uses the refunds table for dedicated refund tracking.

CREATE OR REPLACE FUNCTION public.process_invoice_refund(
    p_invoice_id UUID,
    p_tenant_id TEXT,
    p_amount NUMERIC,
    p_reason TEXT DEFAULT NULL,
    p_payment_id UUID DEFAULT NULL,
    p_processed_by UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_invoice RECORD;
    v_new_amount_paid NUMERIC;
    v_new_amount_due NUMERIC;
    v_new_status TEXT;
    v_refund_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    SELECT id, status, total, amount_paid, amount_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'void' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede reembolsar una factura anulada');
    END IF;

    IF v_invoice.amount_paid <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'No hay pagos para reembolsar');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'El monto debe ser mayor a 0');
    END IF;

    IF p_amount > v_invoice.amount_paid THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('El monto excede lo pagado (%s)', v_invoice.amount_paid)
        );
    END IF;

    IF p_reason IS NULL OR p_reason = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Se requiere una razón para el reembolso');
    END IF;

    -- Calculate new amounts
    v_new_amount_paid := v_invoice.amount_paid - p_amount;
    v_new_amount_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE
        WHEN v_new_amount_paid <= 0 THEN 'refunded'
        WHEN v_new_amount_due > 0 THEN 'partial'
        ELSE v_invoice.status
    END;

    -- Create refund record in dedicated refunds table
    INSERT INTO refunds (
        tenant_id,
        invoice_id,
        payment_id,
        amount,
        reason,
        refunded_by,
        refunded_at
    ) VALUES (
        p_tenant_id,
        p_invoice_id,
        p_payment_id,
        p_amount,
        p_reason,
        p_processed_by,
        NOW()
    ) RETURNING id INTO v_refund_id;

    -- Update invoice
    UPDATE invoices
    SET
        amount_paid = v_new_amount_paid,
        amount_due = v_new_amount_due,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'refund_id', v_refund_id,
        'amount_paid', v_new_amount_paid,
        'amount_due', v_new_amount_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.record_invoice_payment TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_invoice_refund TO authenticated;

-- =============================================================================
-- CHECKOUT AND PAYMENT FUNCTIONS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 82_store_enhancements.sql
-- =============================================================================

-- =============================================================================
-- 82_STORE_ENHANCEMENTS.SQL
-- =============================================================================
-- Enhanced store features for veterinary e-commerce:
-- - Brands management
-- - Product variants (sizes, flavors)
-- - Customer reviews and ratings
-- - Wishlists
-- - Stock alerts
-- - Coupon codes
-- - Recently viewed products
-- - Product Q&A
-- - Enhanced product attributes (species, life stages, health conditions)
-- =============================================================================

-- =============================================================================
-- A. STORE BRANDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Brand Info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,

    -- Display
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One slug per tenant
    UNIQUE(tenant_id, slug)
);

-- =============================================================================
-- B. STORE SUBCATEGORIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    category_id UUID NOT NULL REFERENCES store_categories(id) ON DELETE CASCADE,

    -- Subcategory Info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT,

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One slug per category
    UNIQUE(category_id, slug)
);

-- =============================================================================
-- C. ENHANCE STORE_PRODUCTS TABLE
-- =============================================================================

-- Add brand reference
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES store_brands(id) ON DELETE SET NULL;

-- Add subcategory reference
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES store_subcategories(id) ON DELETE SET NULL;

-- Add short description for cards
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add pet-specific attributes
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS species TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS life_stages TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS breed_sizes TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS health_conditions TEXT[] DEFAULT '{}';

-- Add product specifications
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS ingredients TEXT;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS nutritional_info JSONB DEFAULT '{}';

-- Add physical attributes
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS weight_grams NUMERIC(10,2);

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS dimensions JSONB;

-- Add prescription flag
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_prescription_required BOOLEAN DEFAULT FALSE;

-- Add display flags
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;

-- Add rating cache (denormalized for performance)
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(2,1) DEFAULT 0;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add sales tracking
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add SEO fields
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add sort order
ALTER TABLE store_products
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- =============================================================================
-- D. STORE PRODUCT VARIANTS (Sizes, Flavors, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Variant Info
    sku TEXT NOT NULL,
    name TEXT NOT NULL,                          -- "15kg", "Pollo", etc.
    variant_type TEXT NOT NULL,                  -- "size", "flavor", "color", "weight"

    -- Pricing
    price_modifier NUMERIC(12,2) DEFAULT 0,      -- Added to base_price

    -- Stock (separate from main inventory)
    stock_quantity INTEGER DEFAULT 0,

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique SKU per tenant
    UNIQUE(tenant_id, sku)
);

-- =============================================================================
-- E. STORE PRODUCT IMAGES (Multiple images per product)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Image Info
    image_url TEXT NOT NULL,
    alt_text TEXT,

    -- Display
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- F. STORE REVIEWS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    order_id UUID,                              -- Link to purchase

    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,

    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One review per user per product
    UNIQUE(user_id, product_id)
);

-- =============================================================================
-- G. STORE REVIEW IMAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES store_reviews(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Image Info
    image_url TEXT NOT NULL,

    -- Display
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- H. STORE REVIEW HELPFUL VOTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES store_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Vote type
    is_helpful BOOLEAN NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One vote per user per review
    UNIQUE(user_id, review_id)
);

-- =============================================================================
-- I. STORE WISHLISTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Optional variant
    variant_id UUID REFERENCES store_product_variants(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    -- Notification
    notify_on_sale BOOLEAN DEFAULT TRUE,
    notify_on_stock BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One product per user
    UNIQUE(user_id, product_id)
);

-- =============================================================================
-- J. STORE STOCK ALERTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Contact
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,

    -- Optional variant
    variant_id UUID REFERENCES store_product_variants(id) ON DELETE SET NULL,

    -- Status
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One alert per email per product
    UNIQUE(email, product_id)
);

-- =============================================================================
-- K. STORE COUPONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Coupon Info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Discount
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value NUMERIC(12,2) NOT NULL,

    -- Limits
    minimum_purchase NUMERIC(12,2) DEFAULT 0,
    maximum_discount NUMERIC(12,2),             -- Cap for percentage discounts
    max_uses INTEGER,                           -- Total uses allowed
    max_uses_per_user INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,

    -- Validity
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,

    -- Restrictions
    applies_to_sale_items BOOLEAN DEFAULT TRUE,
    first_purchase_only BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique code per tenant
    UNIQUE(tenant_id, code),

    -- Validate dates
    CONSTRAINT store_coupons_dates CHECK (valid_until > valid_from)
);

-- =============================================================================
-- L. STORE COUPON USAGE
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES store_coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Usage Details
    order_id UUID,                              -- Link to order/invoice
    discount_applied NUMERIC(12,2) NOT NULL,

    -- Metadata
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- M. STORE PRODUCT QUESTIONS (Q&A)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_product_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Question
    question TEXT NOT NULL,

    -- Answer (by staff)
    answer TEXT,
    answered_by UUID REFERENCES profiles(id),
    answered_at TIMESTAMPTZ,

    -- Status
    is_public BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- N. STORE RECENTLY VIEWED
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Metadata
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_count INTEGER DEFAULT 1,

    -- Keep only latest view per user/product
    UNIQUE(user_id, product_id)
);

-- =============================================================================
-- O. STORE RELATED PRODUCTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_related_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    related_product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),

    -- Relation Type
    relation_type TEXT NOT NULL CHECK (relation_type IN (
        'similar',           -- Similar products
        'complementary',     -- Goes well with
        'upgrade',           -- Better version
        'accessory',         -- Accessories for product
        'frequently_bought'  -- Often bought together
    )),

    -- Display
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- No duplicates
    UNIQUE(product_id, related_product_id, relation_type),

    -- No self-reference
    CONSTRAINT no_self_relation CHECK (product_id != related_product_id)
);

-- =============================================================================
-- P. STORE PRESCRIPTIONS (for prescription-required products)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Pet (optional but recommended)
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,

    -- Prescription Document
    prescription_url TEXT,
    prescription_number TEXT,

    -- Issuing Vet
    vet_name TEXT,
    vet_license TEXT,
    vet_id UUID REFERENCES profiles(id),          -- If internal vet

    -- Validity
    issued_date DATE NOT NULL,
    expiry_date DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'rejected', 'expired'
    )),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Q. STORE PRESCRIPTION PRODUCTS (link prescriptions to allowed products)
-- =============================================================================

CREATE TABLE IF NOT EXISTS store_prescription_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES store_prescriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

    -- Quantity authorized
    quantity_authorized INTEGER DEFAULT 1,
    quantity_purchased INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One product per prescription
    UNIQUE(prescription_id, product_id)
);

-- =============================================================================
-- R. ENHANCE STORE_CATEGORIES TABLE
-- =============================================================================

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS icon TEXT;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE store_categories
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Brands
CREATE INDEX IF NOT EXISTS idx_store_brands_tenant ON store_brands(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_brands_slug ON store_brands(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_store_brands_featured ON store_brands(tenant_id, is_featured) WHERE is_featured = TRUE;

-- Subcategories
CREATE INDEX IF NOT EXISTS idx_store_subcategories_tenant ON store_subcategories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_subcategories_category ON store_subcategories(category_id);

-- Product enhancements
CREATE INDEX IF NOT EXISTS idx_store_products_brand ON store_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_store_products_subcategory ON store_products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_store_products_species ON store_products USING GIN(species);
CREATE INDEX IF NOT EXISTS idx_store_products_life_stages ON store_products USING GIN(life_stages);
CREATE INDEX IF NOT EXISTS idx_store_products_breed_sizes ON store_products USING GIN(breed_sizes);
CREATE INDEX IF NOT EXISTS idx_store_products_health_conditions ON store_products USING GIN(health_conditions);
CREATE INDEX IF NOT EXISTS idx_store_products_featured ON store_products(tenant_id, is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_new_arrival ON store_products(tenant_id, is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_best_seller ON store_products(tenant_id, is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_prescription ON store_products(tenant_id, is_prescription_required) WHERE is_prescription_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_store_products_rating ON store_products(tenant_id, avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_store_products_sales ON store_products(tenant_id, sales_count DESC);

-- Variants
CREATE INDEX IF NOT EXISTS idx_store_variants_product ON store_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_store_variants_tenant ON store_product_variants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_variants_sku ON store_product_variants(tenant_id, sku);

-- Images
CREATE INDEX IF NOT EXISTS idx_store_images_product ON store_product_images(product_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_store_reviews_product ON store_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_user ON store_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_tenant ON store_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_rating ON store_reviews(product_id, rating);
CREATE INDEX IF NOT EXISTS idx_store_reviews_helpful ON store_reviews(product_id, helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_store_reviews_featured ON store_reviews(tenant_id, is_featured) WHERE is_featured = TRUE;

-- Review Images
CREATE INDEX IF NOT EXISTS idx_store_review_images_review ON store_review_images(review_id);

-- Review Votes
CREATE INDEX IF NOT EXISTS idx_store_review_votes_review ON store_review_votes(review_id);

-- Wishlists
CREATE INDEX IF NOT EXISTS idx_store_wishlists_user ON store_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_store_wishlists_product ON store_wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_store_wishlists_tenant ON store_wishlists(tenant_id);

-- Stock Alerts
CREATE INDEX IF NOT EXISTS idx_store_stock_alerts_product ON store_stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_store_stock_alerts_email ON store_stock_alerts(email);
CREATE INDEX IF NOT EXISTS idx_store_stock_alerts_pending ON store_stock_alerts(product_id, notified) WHERE notified = FALSE;

-- Coupons
CREATE INDEX IF NOT EXISTS idx_store_coupons_tenant ON store_coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_coupons_code ON store_coupons(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_store_coupons_active ON store_coupons(tenant_id, is_active, valid_from, valid_until);

-- Coupon Usage
CREATE INDEX IF NOT EXISTS idx_store_coupon_usage_coupon ON store_coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_store_coupon_usage_user ON store_coupon_usage(user_id);

-- Questions
CREATE INDEX IF NOT EXISTS idx_store_questions_product ON store_product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_store_questions_unanswered ON store_product_questions(product_id, answered_at) WHERE answered_at IS NULL;

-- Recently Viewed
CREATE INDEX IF NOT EXISTS idx_store_recently_viewed_user ON store_recently_viewed(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_recently_viewed_product ON store_recently_viewed(product_id);

-- Related Products
CREATE INDEX IF NOT EXISTS idx_store_related_product ON store_related_products(product_id);
CREATE INDEX IF NOT EXISTS idx_store_related_type ON store_related_products(product_id, relation_type);

-- Prescriptions
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_user ON store_prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_tenant ON store_prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_status ON store_prescriptions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_store_prescriptions_pet ON store_prescriptions(pet_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE store_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_related_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_prescription_products ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - BRANDS
-- =============================================================================

CREATE POLICY "Anyone can view active brands" ON store_brands
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff can manage brands" ON store_brands
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - SUBCATEGORIES
-- =============================================================================

CREATE POLICY "Anyone can view active subcategories" ON store_subcategories
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff can manage subcategories" ON store_subcategories
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - VARIANTS
-- =============================================================================

CREATE POLICY "Anyone can view active variants" ON store_product_variants
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Staff can manage variants" ON store_product_variants
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - PRODUCT IMAGES
-- =============================================================================

CREATE POLICY "Anyone can view product images" ON store_product_images
    FOR SELECT USING (TRUE);

CREATE POLICY "Staff can manage product images" ON store_product_images
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - REVIEWS
-- =============================================================================

CREATE POLICY "Anyone can view approved reviews" ON store_reviews
    FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Users can create their own reviews" ON store_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON store_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON store_reviews
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Staff can manage all reviews" ON store_reviews
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - REVIEW IMAGES
-- =============================================================================

CREATE POLICY "Anyone can view review images" ON store_review_images
    FOR SELECT USING (TRUE);

CREATE POLICY "Review owner can manage images" ON store_review_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM store_reviews
            WHERE store_reviews.id = store_review_images.review_id
            AND store_reviews.user_id = auth.uid()
        )
    );

-- =============================================================================
-- RLS POLICIES - REVIEW VOTES
-- =============================================================================

CREATE POLICY "Anyone can view votes" ON store_review_votes
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage their own votes" ON store_review_votes
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES - WISHLISTS
-- =============================================================================

CREATE POLICY "Users can view their own wishlist" ON store_wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON store_wishlists
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES - STOCK ALERTS
-- =============================================================================

CREATE POLICY "Users can view their own alerts" ON store_stock_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts" ON store_stock_alerts
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Staff can view all alerts" ON store_stock_alerts
    FOR SELECT USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - COUPONS
-- =============================================================================

CREATE POLICY "Anyone can view active coupons" ON store_coupons
    FOR SELECT USING (
        is_active = TRUE
        AND NOW() >= valid_from
        AND NOW() <= valid_until
    );

CREATE POLICY "Staff can manage coupons" ON store_coupons
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - COUPON USAGE
-- =============================================================================

CREATE POLICY "Users can view their own usage" ON store_coupon_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON store_coupon_usage
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Staff can view all usage" ON store_coupon_usage
    FOR SELECT USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - QUESTIONS
-- =============================================================================

CREATE POLICY "Anyone can view public questions" ON store_product_questions
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can ask questions" ON store_product_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage questions" ON store_product_questions
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - RECENTLY VIEWED
-- =============================================================================

CREATE POLICY "Users can view their own history" ON store_recently_viewed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own history" ON store_recently_viewed
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES - RELATED PRODUCTS
-- =============================================================================

CREATE POLICY "Anyone can view related products" ON store_related_products
    FOR SELECT USING (TRUE);

CREATE POLICY "Staff can manage related products" ON store_related_products
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - PRESCRIPTIONS
-- =============================================================================

CREATE POLICY "Users can view their own prescriptions" ON store_prescriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create prescriptions" ON store_prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage prescriptions" ON store_prescriptions
    FOR ALL USING (is_staff_of(tenant_id));

-- =============================================================================
-- RLS POLICIES - PRESCRIPTION PRODUCTS
-- =============================================================================

CREATE POLICY "Users can view their prescription products" ON store_prescription_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM store_prescriptions
            WHERE store_prescriptions.id = store_prescription_products.prescription_id
            AND store_prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage prescription products" ON store_prescription_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM store_prescriptions
            WHERE store_prescriptions.id = store_prescription_products.prescription_id
            AND is_staff_of(store_prescriptions.tenant_id)
        )
    );

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update product rating cache
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE store_products
        SET
            avg_rating = (
                SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
                FROM store_reviews
                WHERE product_id = NEW.product_id AND is_approved = TRUE
            ),
            review_count = (
                SELECT COUNT(*)
                FROM store_reviews
                WHERE product_id = NEW.product_id AND is_approved = TRUE
            )
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE store_products
        SET
            avg_rating = (
                SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
                FROM store_reviews
                WHERE product_id = OLD.product_id AND is_approved = TRUE
            ),
            review_count = (
                SELECT COUNT(*)
                FROM store_reviews
                WHERE product_id = OLD.product_id AND is_approved = TRUE
            )
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_product_rating ON store_reviews;
CREATE TRIGGER trigger_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON store_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE store_reviews
        SET helpful_count = (
            SELECT COUNT(*)
            FROM store_review_votes
            WHERE review_id = NEW.review_id AND is_helpful = TRUE
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE store_reviews
        SET helpful_count = (
            SELECT COUNT(*)
            FROM store_review_votes
            WHERE review_id = OLD.review_id AND is_helpful = TRUE
        )
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_review_helpful ON store_review_votes;
CREATE TRIGGER trigger_update_review_helpful
    AFTER INSERT OR UPDATE OR DELETE ON store_review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE store_coupons
    SET used_count = used_count + 1
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for coupon usage
DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON store_coupon_usage;
CREATE TRIGGER trigger_increment_coupon_usage
    AFTER INSERT ON store_coupon_usage
    FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
    p_tenant_id TEXT,
    p_code TEXT,
    p_user_id UUID,
    p_cart_total NUMERIC
)
RETURNS JSONB AS $$
DECLARE
    v_coupon RECORD;
    v_user_usage INTEGER;
    v_discount NUMERIC;
BEGIN
    -- Find coupon
    SELECT * INTO v_coupon
    FROM store_coupons
    WHERE tenant_id = p_tenant_id
    AND UPPER(code) = UPPER(p_code)
    AND is_active = TRUE
    AND NOW() >= valid_from
    AND NOW() <= valid_until;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Cupón no válido o expirado');
    END IF;

    -- Check max uses
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Cupón agotado');
    END IF;

    -- Check user usage
    SELECT COUNT(*) INTO v_user_usage
    FROM store_coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

    IF v_user_usage >= v_coupon.max_uses_per_user THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Ya usaste este cupón');
    END IF;

    -- Check minimum purchase
    IF p_cart_total < v_coupon.minimum_purchase THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'error', format('Compra mínima: Gs. %s', v_coupon.minimum_purchase)
        );
    END IF;

    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := p_cart_total * (v_coupon.discount_value / 100);
        IF v_coupon.maximum_discount IS NOT NULL THEN
            v_discount := LEAST(v_discount, v_coupon.maximum_discount);
        END IF;
    ELSIF v_coupon.discount_type = 'fixed_amount' THEN
        v_discount := LEAST(v_coupon.discount_value, p_cart_total);
    ELSE
        v_discount := 0; -- free_shipping handled separately
    END IF;

    RETURN jsonb_build_object(
        'valid', TRUE,
        'coupon_id', v_coupon.id,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'calculated_discount', v_discount,
        'name', v_coupon.name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product with full details
CREATE OR REPLACE FUNCTION get_product_details(
    p_tenant_id TEXT,
    p_product_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_product JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', p.id,
        'sku', p.sku,
        'name', p.name,
        'short_description', p.short_description,
        'description', p.description,
        'base_price', p.base_price,
        'specifications', p.specifications,
        'features', p.features,
        'ingredients', p.ingredients,
        'nutritional_info', p.nutritional_info,
        'species', p.species,
        'life_stages', p.life_stages,
        'breed_sizes', p.breed_sizes,
        'health_conditions', p.health_conditions,
        'is_prescription_required', p.is_prescription_required,
        'avg_rating', p.avg_rating,
        'review_count', p.review_count,
        'sales_count', p.sales_count,
        'is_featured', p.is_featured,
        'is_new_arrival', p.is_new_arrival,
        'is_best_seller', p.is_best_seller,
        'meta_title', p.meta_title,
        'meta_description', p.meta_description,
        'category', jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug
        ),
        'subcategory', CASE WHEN sc.id IS NOT NULL THEN
            jsonb_build_object('id', sc.id, 'name', sc.name, 'slug', sc.slug)
        ELSE NULL END,
        'brand', CASE WHEN b.id IS NOT NULL THEN
            jsonb_build_object('id', b.id, 'name', b.name, 'slug', b.slug, 'logo_url', b.logo_url)
        ELSE NULL END,
        'inventory', jsonb_build_object(
            'stock_quantity', COALESCE(i.stock_quantity, 0),
            'min_stock_level', i.min_stock_level
        ),
        'images', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', img.id,
                    'image_url', img.image_url,
                    'alt_text', img.alt_text,
                    'is_primary', img.is_primary
                ) ORDER BY img.sort_order
            ), '[]')
            FROM store_product_images img
            WHERE img.product_id = p.id
        ),
        'variants', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', v.id,
                    'sku', v.sku,
                    'name', v.name,
                    'variant_type', v.variant_type,
                    'price_modifier', v.price_modifier,
                    'stock_quantity', v.stock_quantity,
                    'is_default', v.is_default
                ) ORDER BY v.sort_order
            ), '[]')
            FROM store_product_variants v
            WHERE v.product_id = p.id AND v.is_active = TRUE
        )
    ) INTO v_product
    FROM store_products p
    LEFT JOIN store_categories c ON c.id = p.category_id
    LEFT JOIN store_subcategories sc ON sc.id = p.subcategory_id
    LEFT JOIN store_brands b ON b.id = p.brand_id
    LEFT JOIN store_inventory i ON i.product_id = p.id
    WHERE p.id = p_product_id
    AND p.tenant_id = p_tenant_id
    AND p.is_active = TRUE;

    RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track product view
CREATE OR REPLACE FUNCTION track_product_view(
    p_user_id UUID,
    p_product_id UUID,
    p_tenant_id TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Update recently viewed
    INSERT INTO store_recently_viewed (user_id, product_id, tenant_id, viewed_at, view_count)
    VALUES (p_user_id, p_product_id, p_tenant_id, NOW(), 1)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET
        viewed_at = NOW(),
        view_count = store_recently_viewed.view_count + 1;

    -- Update product view count
    UPDATE store_products
    SET view_count = view_count + 1
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

CREATE TRIGGER handle_updated_at_store_brands
    BEFORE UPDATE ON store_brands
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_subcategories
    BEFORE UPDATE ON store_subcategories
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_variants
    BEFORE UPDATE ON store_product_variants
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_reviews
    BEFORE UPDATE ON store_reviews
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_coupons
    BEFORE UPDATE ON store_coupons
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_store_prescriptions
    BEFORE UPDATE ON store_prescriptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE store_brands IS 'Product brands/manufacturers';
COMMENT ON TABLE store_subcategories IS 'Subcategories within main categories';
COMMENT ON TABLE store_product_variants IS 'Product variations (size, flavor, color)';
COMMENT ON TABLE store_product_images IS 'Multiple images per product';
COMMENT ON TABLE store_reviews IS 'Customer product reviews and ratings';
COMMENT ON TABLE store_review_images IS 'Photos attached to reviews';
COMMENT ON TABLE store_review_votes IS 'Helpful/not helpful votes on reviews';
COMMENT ON TABLE store_wishlists IS 'User saved products for later';
COMMENT ON TABLE store_stock_alerts IS 'Notify user when product back in stock';
COMMENT ON TABLE store_coupons IS 'Discount codes and vouchers';
COMMENT ON TABLE store_coupon_usage IS 'Track coupon redemptions';
COMMENT ON TABLE store_product_questions IS 'Customer Q&A on products';
COMMENT ON TABLE store_recently_viewed IS 'Track user product browsing history';
COMMENT ON TABLE store_related_products IS 'Product relationships (similar, complementary)';
COMMENT ON TABLE store_prescriptions IS 'Vet prescriptions for prescription products';
COMMENT ON TABLE store_prescription_products IS 'Products authorized by prescription';

-- =============================================================================
-- STORE ENHANCEMENTS MIGRATION COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 83_store_orders.sql
-- =============================================================================

-- =============================================================================
-- STORE ORDERS - E-commerce order management tables
-- =============================================================================

-- Store Orders table
CREATE TABLE IF NOT EXISTS store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),

  -- Pricing
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  coupon_id UUID REFERENCES store_coupons(id),
  coupon_code TEXT,
  shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 10,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Addresses (JSONB for flexibility)
  shipping_address JSONB,
  billing_address JSONB,

  -- Delivery info
  shipping_method TEXT DEFAULT 'standard',
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Payment
  payment_method TEXT DEFAULT 'cash_on_delivery',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'failed')),
  paid_at TIMESTAMPTZ,

  -- Additional info
  notes TEXT,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  UNIQUE(tenant_id, order_number)
);

-- Store Order Items table
CREATE TABLE IF NOT EXISTS store_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES store_products(id),
  variant_id UUID REFERENCES store_product_variants(id),

  -- Product snapshot (in case product changes later)
  product_name TEXT NOT NULL,
  variant_name TEXT,

  -- Pricing
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  line_total NUMERIC(12, 2) NOT NULL,

  -- Status (for partial fulfillment)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'returned')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store Order Status History (for tracking status changes)
CREATE TABLE IF NOT EXISTS store_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_store_orders_tenant ON store_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_user ON store_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_store_orders_created ON store_orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_orders_number ON store_orders(tenant_id, order_number);

CREATE INDEX IF NOT EXISTS idx_store_order_items_order ON store_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_store_order_items_product ON store_order_items(product_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_status_history ENABLE ROW LEVEL SECURITY;

-- Orders: Users see own orders, staff see all in tenant
CREATE POLICY "Users view own orders" ON store_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff view all orders" ON store_orders FOR SELECT
  USING (is_staff_of(tenant_id));

CREATE POLICY "Users create own orders" ON store_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff manage orders" ON store_orders FOR ALL
  USING (is_staff_of(tenant_id));

-- Order items: Same as orders
CREATE POLICY "Users view own order items" ON store_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_items.order_id
    AND store_orders.user_id = auth.uid()
  ));

CREATE POLICY "Staff view all order items" ON store_order_items FOR SELECT
  USING (is_staff_of(tenant_id));

CREATE POLICY "Users create own order items" ON store_order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_items.order_id
    AND store_orders.user_id = auth.uid()
  ));

CREATE POLICY "Staff manage order items" ON store_order_items FOR ALL
  USING (is_staff_of(tenant_id));

-- Status history: Same access as orders
CREATE POLICY "Users view own order history" ON store_order_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_status_history.order_id
    AND store_orders.user_id = auth.uid()
  ));

CREATE POLICY "Staff manage order history" ON store_order_status_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM store_orders WHERE store_orders.id = store_order_status_history.order_id
    AND is_staff_of(store_orders.tenant_id)
  ));

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Decrement stock when order is placed
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE store_inventory
  SET
    stock_quantity = stock_quantity - p_quantity,
    updated_at = NOW()
  WHERE product_id = p_product_id
  AND stock_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment stock (for cancellations/returns)
CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE store_inventory
  SET
    stock_quantity = stock_quantity + p_quantity,
    updated_at = NOW()
  WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE store_coupons
  SET
    used_count = used_count + 1,
    updated_at = NOW()
  WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment product sales count
CREATE OR REPLACE FUNCTION increment_product_sales(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE store_products
  SET
    sales_count = sales_count + p_quantity,
    updated_at = NOW()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update order updated_at
CREATE TRIGGER handle_store_orders_updated_at
  BEFORE UPDATE ON store_orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO store_order_status_history (order_id, previous_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status_change
  AFTER UPDATE OF status ON store_orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION decrement_stock TO authenticated;
GRANT EXECUTE ON FUNCTION increment_stock TO authenticated;
GRANT EXECUTE ON FUNCTION increment_coupon_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_sales TO authenticated;



-- =============================================================================
-- FILE: 84_notification_read_status.sql
-- =============================================================================

-- =============================================================================
-- 84_NOTIFICATION_READ_STATUS.SQL
-- =============================================================================
-- Add 'read' status and read_at timestamp to notification_queue table
-- =============================================================================

-- Add 'read' status to the existing status check constraint
ALTER TABLE notification_queue
  DROP CONSTRAINT IF EXISTS notification_queue_status_check;

ALTER TABLE notification_queue
  ADD CONSTRAINT notification_queue_status_check
  CHECK (status IN (
    'queued', 'sending', 'sent', 'delivered', 'read', 'failed', 'bounced'
  ));

-- Add read_at timestamp column
ALTER TABLE notification_queue
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add index for read status queries
CREATE INDEX IF NOT EXISTS idx_notification_queue_read_status
  ON notification_queue(client_id, status)
  WHERE status IN ('queued', 'delivered', 'read');

-- Add index for read_at timestamp
CREATE INDEX IF NOT EXISTS idx_notification_queue_read_at
  ON notification_queue(read_at DESC)
  WHERE read_at IS NOT NULL;

-- Update existing RLS policy to allow users to mark their own notifications as read
DROP POLICY IF EXISTS "Users mark own notifications as read" ON notification_queue;

CREATE POLICY "Users mark own notifications as read" ON notification_queue
  FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- =============================================================================
-- NOTIFICATION READ STATUS MIGRATION COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 85_fix_checkout_inventory_table.sql
-- =============================================================================

-- =============================================================================
-- 85_FIX_CHECKOUT_INVENTORY_TABLE.SQL
-- =============================================================================
-- TICKET-BIZ-003: Fix decrement_stock function to use correct table name
-- =============================================================================
-- This migration updates the decrement_stock function to use
-- store_inventory_transactions instead of inventory_transactions
-- =============================================================================

-- Drop and recreate the decrement_stock function with correct table name
DROP FUNCTION IF EXISTS public.decrement_stock(UUID, TEXT, INT);

CREATE OR REPLACE FUNCTION public.decrement_stock(
    p_product_id UUID,
    p_tenant_id TEXT,
    p_quantity INT
) RETURNS INT AS $$
DECLARE
    current_stock INT;
    new_stock INT;
BEGIN
    -- Lock the row and get current stock
    SELECT stock_quantity INTO current_stock
    FROM store_inventory
    WHERE product_id = p_product_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found in inventory';
    END IF;

    IF current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, p_quantity;
    END IF;

    -- Decrement stock
    new_stock := current_stock - p_quantity;

    UPDATE store_inventory
    SET
        stock_quantity = new_stock,
        updated_at = NOW()
    WHERE product_id = p_product_id
    AND tenant_id = p_tenant_id;

    -- Log the transaction (FIXED: use store_inventory_transactions)
    INSERT INTO store_inventory_transactions (
        tenant_id,
        product_id,
        type,
        quantity,
        notes,
        performed_by,
        created_at
    ) VALUES (
        p_tenant_id,
        p_product_id,
        'sale',
        -p_quantity,
        'Checkout via store',
        NULL,
        NOW()
    );

    RETURN new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.decrement_stock TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 86_owner_clinic_connections.sql
-- =============================================================================

-- =============================================================================
-- 85_OWNER_CLINIC_CONNECTIONS.SQL
-- =============================================================================
-- Functions for implicit owner-clinic connections.
-- An owner is "connected" to a clinic if they have any interaction with it:
-- - Has a pet registered at that clinic
-- - Has booked an appointment at that clinic
-- - Has started a conversation with that clinic
-- =============================================================================

-- =============================================================================
-- A. IS_OWNER_CONNECTED_TO_CLINIC
-- =============================================================================
-- Checks if an owner has any interaction with a specific clinic.
-- Used to determine if clinic staff can access owner's data.

CREATE OR REPLACE FUNCTION public.is_owner_connected_to_clinic(
    p_owner_id UUID,
    p_clinic_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        -- Has a pet registered at this clinic
        SELECT 1 FROM pets
        WHERE owner_id = p_owner_id
        AND tenant_id = p_clinic_id
        AND deleted_at IS NULL
    ) OR EXISTS (
        -- Has booked an appointment at this clinic
        SELECT 1 FROM appointments
        WHERE user_id = p_owner_id
        AND tenant_id = p_clinic_id
    ) OR EXISTS (
        -- Has started a conversation with this clinic
        SELECT 1 FROM conversations
        WHERE client_id = p_owner_id
        AND tenant_id = p_clinic_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. GET_CONNECTED_OWNER_IDS
-- =============================================================================
-- Returns all owner IDs that are connected to a specific clinic.
-- Used by staff to query all accessible owners.

CREATE OR REPLACE FUNCTION public.get_connected_owner_ids(
    p_clinic_id TEXT
)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT owner_id FROM (
        -- Owners with pets at this clinic
        SELECT owner_id FROM pets
        WHERE tenant_id = p_clinic_id
        AND deleted_at IS NULL

        UNION

        -- Owners with appointments at this clinic
        SELECT user_id AS owner_id FROM appointments
        WHERE tenant_id = p_clinic_id

        UNION

        -- Owners with conversations at this clinic
        SELECT client_id AS owner_id FROM conversations
        WHERE tenant_id = p_clinic_id
    ) AS connected_owners;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. GET_CONNECTED_PETS_FOR_CLINIC
-- =============================================================================
-- Returns all pets accessible to a clinic through connected owners.
-- This includes ALL pets of connected owners, not just those registered at the clinic.

CREATE OR REPLACE FUNCTION public.get_connected_pets_for_clinic(
    p_clinic_id TEXT
)
RETURNS TABLE (
    id UUID,
    owner_id UUID,
    tenant_id TEXT,
    name TEXT,
    species TEXT,
    breed TEXT,
    weight_kg NUMERIC,
    photo_url TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.owner_id,
        p.tenant_id,
        p.name,
        p.species,
        p.breed,
        p.weight_kg,
        p.photo_url,
        p.created_at
    FROM pets p
    WHERE p.deleted_at IS NULL
    AND p.owner_id IN (SELECT get_connected_owner_ids(p_clinic_id))
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON FUNCTION public.is_owner_connected_to_clinic IS
'Checks if an owner has any interaction (pet, appointment, conversation) with a clinic';

COMMENT ON FUNCTION public.get_connected_owner_ids IS
'Returns all owner IDs connected to a clinic through any interaction';

COMMENT ON FUNCTION public.get_connected_pets_for_clinic IS
'Returns all pets accessible to a clinic through connected owners';

-- =============================================================================
-- OWNER CLINIC CONNECTIONS COMPLETE
-- =============================================================================



-- =============================================================================
-- FILE: 88_fix_checkout_schema_mismatch.sql
-- =============================================================================

-- =============================================================================
-- 88_FIX_CHECKOUT_SCHEMA_MISMATCH.SQL
-- =============================================================================
-- Fixes column name mismatches between checkout functions and invoice schema.
--
-- Issues fixed:
-- - owner_id -> client_id (invoices table uses client_id)
-- - amount_due -> balance_due (invoices table uses balance_due)
-- - Removed tax_rate column usage (tax is calculated per-item)
-- =============================================================================

-- =============================================================================
-- A. FIX PROCESS_CHECKOUT FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.process_checkout(
    p_tenant_id TEXT,
    p_user_id UUID,
    p_items JSONB, -- Array of {sku, name, price, quantity, type}
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    stock_errors JSONB;
    product_items JSONB;
    item JSONB;
    invoice_id UUID;
    invoice_number TEXT;
    subtotal NUMERIC := 0;
    tax_rate NUMERIC := 10;  -- Local variable, not stored
    tax_amount NUMERIC;
    total NUMERIC;
    product_record RECORD;
BEGIN
    -- 1. Filter product items for stock validation
    SELECT jsonb_agg(i) INTO product_items
    FROM jsonb_array_elements(p_items) i
    WHERE i->>'type' = 'product';

    -- 2. Validate stock if there are products
    IF product_items IS NOT NULL AND jsonb_array_length(product_items) > 0 THEN
        SELECT public.validate_stock(p_tenant_id, product_items) INTO stock_errors;

        IF jsonb_array_length(stock_errors) > 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient stock',
                'stock_errors', stock_errors
            );
        END IF;
    END IF;

    -- 3. Calculate totals
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        subtotal := subtotal + ((item->>'price')::NUMERIC * (item->>'quantity')::INT);
    END LOOP;

    subtotal := ROUND(subtotal, 2);
    tax_amount := ROUND(subtotal * tax_rate / 100, 2);
    total := ROUND(subtotal + tax_amount, 2);

    -- 4. Generate invoice number
    -- Try to use the generate_invoice_number function if it exists
    BEGIN
        invoice_number := generate_invoice_number(p_tenant_id);
    EXCEPTION WHEN OTHERS THEN
        invoice_number := 'INV-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    END;

    -- 5. Create invoice (using correct column names from 21_schema_invoicing.sql)
    INSERT INTO invoices (
        tenant_id,
        invoice_number,
        client_id,           -- FIXED: was owner_id
        status,
        subtotal,
        tax_amount,          -- FIXED: removed tax_rate (not a column)
        total,
        amount_paid,
        balance_due,         -- FIXED: was amount_due
        notes,
        due_date,
        created_by
    ) VALUES (
        p_tenant_id,
        invoice_number,
        p_user_id,
        'sent',              -- FIXED: was 'pending', but schema uses 'draft', 'sent', etc.
        subtotal,
        tax_amount,
        total,
        0,
        total,
        COALESCE(p_notes, 'Pedido desde tienda online'),
        CURRENT_DATE + INTERVAL '7 days',
        p_user_id
    ) RETURNING id INTO invoice_id;

    -- 6. Create invoice items and decrement stock
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insert invoice item (using correct column names from invoice_items)
        INSERT INTO invoice_items (
            invoice_id,
            item_type,
            description,
            quantity,
            unit_price,
            is_taxable,
            tax_rate,
            subtotal,
            tax_amount,
            total
        ) VALUES (
            invoice_id,
            CASE WHEN item->>'type' = 'product' THEN 'product' ELSE 'service' END,
            item->>'name',
            (item->>'quantity')::INT,
            (item->>'price')::NUMERIC,
            TRUE,
            tax_rate,
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT, 2),
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT * tax_rate / 100, 2),
            ROUND((item->>'price')::NUMERIC * (item->>'quantity')::INT * (1 + tax_rate / 100), 2)
        );

        -- Decrement stock for products
        IF item->>'type' = 'product' THEN
            SELECT sp.id INTO product_record
            FROM store_products sp
            WHERE sp.tenant_id = p_tenant_id
            AND sp.sku = item->>'id';

            IF product_record.id IS NOT NULL THEN
                PERFORM public.decrement_stock(
                    product_record.id,
                    p_tenant_id,
                    (item->>'quantity')::INT
                );
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'invoice', jsonb_build_object(
            'id', invoice_id,
            'invoice_number', invoice_number,
            'total', total,
            'status', 'sent'
        )
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- B. FIX RECORD_INVOICE_PAYMENT FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.record_invoice_payment(
    p_invoice_id UUID,
    p_tenant_id TEXT,
    p_amount NUMERIC,
    p_payment_method TEXT DEFAULT 'cash',
    p_reference_number TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_received_by UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_invoice RECORD;
    v_new_amount_paid NUMERIC;
    v_new_balance_due NUMERIC;
    v_new_status TEXT;
    v_payment_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    -- FIXED: Using balance_due instead of amount_due
    SELECT id, status, total, amount_paid, balance_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede pagar una factura cancelada');
    END IF;

    IF v_invoice.status = 'paid' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Esta factura ya está pagada');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'El monto debe ser mayor a 0');
    END IF;

    IF p_amount > v_invoice.balance_due THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('El monto excede el saldo pendiente (%s)', v_invoice.balance_due)
        );
    END IF;

    -- Calculate new amounts
    v_new_amount_paid := v_invoice.amount_paid + p_amount;
    v_new_balance_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE WHEN v_new_balance_due <= 0 THEN 'paid' ELSE 'partial' END;

    -- Create payment record
    INSERT INTO payments (
        tenant_id,
        invoice_id,
        amount,
        payment_method,
        reference_number,
        notes,
        received_by,
        paid_at
    ) VALUES (
        p_tenant_id,
        p_invoice_id,
        p_amount,
        p_payment_method,
        p_reference_number,
        p_notes,
        p_received_by,
        NOW()
    ) RETURNING id INTO v_payment_id;

    -- Update invoice
    UPDATE invoices
    SET
        amount_paid = v_new_amount_paid,
        balance_due = v_new_balance_due,  -- FIXED: was amount_due
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'amount_paid', v_new_amount_paid,
        'balance_due', v_new_balance_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- C. FIX PROCESS_INVOICE_REFUND FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.process_invoice_refund(
    p_invoice_id UUID,
    p_tenant_id TEXT,
    p_amount NUMERIC,
    p_reason TEXT DEFAULT NULL,
    p_payment_id UUID DEFAULT NULL,
    p_processed_by UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_invoice RECORD;
    v_new_amount_paid NUMERIC;
    v_new_balance_due NUMERIC;
    v_new_status TEXT;
    v_refund_id UUID;
BEGIN
    -- Lock the invoice row and get current state
    -- FIXED: Using balance_due instead of amount_due
    SELECT id, status, total, amount_paid, balance_due, tenant_id
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_invoice IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Factura no encontrada');
    END IF;

    IF v_invoice.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede reembolsar una factura cancelada');
    END IF;

    IF v_invoice.amount_paid <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'No hay pagos para reembolsar');
    END IF;

    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'El monto debe ser mayor a 0');
    END IF;

    IF p_amount > v_invoice.amount_paid THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('El monto excede lo pagado (%s)', v_invoice.amount_paid)
        );
    END IF;

    IF p_reason IS NULL OR p_reason = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Se requiere una razón para el reembolso');
    END IF;

    -- Calculate new amounts
    v_new_amount_paid := v_invoice.amount_paid - p_amount;
    v_new_balance_due := v_invoice.total - v_new_amount_paid;
    v_new_status := CASE
        WHEN v_new_amount_paid <= 0 THEN 'refunded'
        WHEN v_new_balance_due > 0 THEN 'partial'
        ELSE v_invoice.status
    END;

    -- Create refund record in dedicated refunds table
    INSERT INTO refunds (
        tenant_id,
        invoice_id,
        payment_id,
        amount,
        reason,
        refunded_by,
        refunded_at
    ) VALUES (
        p_tenant_id,
        p_invoice_id,
        p_payment_id,
        p_amount,
        p_reason,
        p_processed_by,
        NOW()
    ) RETURNING id INTO v_refund_id;

    -- Update invoice
    UPDATE invoices
    SET
        amount_paid = v_new_amount_paid,
        balance_due = v_new_balance_due,  -- FIXED: was amount_due
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true,
        'refund_id', v_refund_id,
        'amount_paid', v_new_amount_paid,
        'balance_due', v_new_balance_due,
        'status', v_new_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION public.process_checkout TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_invoice_payment TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_invoice_refund TO authenticated;

-- =============================================================================
-- SCHEMA MISMATCH FIX COMPLETE
-- =============================================================================
--
-- Changes made:
-- 1. process_checkout: owner_id -> client_id, removed tax_rate column,
--    amount_due -> balance_due, fixed invoice_items columns
-- 2. record_invoice_payment: amount_due -> balance_due
-- 3. process_invoice_refund: amount_due -> balance_due
--
-- =============================================================================



-- =============================================================================
-- FILE: 89_exec_sql_helper.sql
-- =============================================================================

-- =============================================================================
-- 89_EXEC_SQL_HELPER.SQL
-- =============================================================================
-- Helper function for executing SQL from scripts.
--
-- SECURITY WARNING: This function allows arbitrary SQL execution and should
-- only be callable by service_role. It is designed for setup/migration scripts.
-- =============================================================================

-- Only create if it doesn't exist (prevents overwriting security settings)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'exec_sql') THEN
        EXECUTE $func$
            CREATE FUNCTION public.exec_sql(sql_query TEXT)
            RETURNS JSONB
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = public
            AS $inner$
            DECLARE
                result_count INT;
            BEGIN
                -- Only allow service_role or postgres
                IF current_user NOT IN ('postgres', 'service_role') THEN
                    RETURN jsonb_build_object(
                        'success', false,
                        'error', 'Unauthorized: Only service_role can execute SQL'
                    );
                END IF;

                -- Execute the SQL
                EXECUTE sql_query;
                GET DIAGNOSTICS result_count = ROW_COUNT;

                RETURN jsonb_build_object(
                    'success', true,
                    'rows_affected', result_count
                );

            EXCEPTION WHEN OTHERS THEN
                RETURN jsonb_build_object(
                    'success', false,
                    'error', SQLERRM,
                    'detail', SQLSTATE
                );
            END;
            $inner$;
        $func$;

        -- Revoke from public and only grant to service_role
        REVOKE ALL ON FUNCTION public.exec_sql FROM PUBLIC;
        REVOKE ALL ON FUNCTION public.exec_sql FROM anon;
        REVOKE ALL ON FUNCTION public.exec_sql FROM authenticated;
        -- Note: service_role can always call SECURITY DEFINER functions

        RAISE NOTICE 'exec_sql function created';
    ELSE
        RAISE NOTICE 'exec_sql function already exists';
    END IF;
END $$;

-- =============================================================================
-- HELPER FUNCTION COMPLETE
-- =============================================================================
--
-- Usage from TypeScript (requires service_role key):
--
--   const { data, error } = await supabaseAdmin.rpc('exec_sql', {
--     sql_query: 'SELECT 1'
--   });
--
-- =============================================================================



-- =============================================================================
-- FILE: 90_seed_tenants.sql
-- =============================================================================

-- =============================================================================
-- 90_SEED_TENANTS.SQL
-- =============================================================================
-- Creates tenant records for multi-tenancy.
-- This is the first seed file and must run before all other seed files.
-- =============================================================================

INSERT INTO tenants (id, name, subdomain, is_active) VALUES
    ('adris', 'Veterinaria Adris', 'adris', TRUE),
    ('petlife', 'PetLife Center', 'petlife', TRUE),
    ('testclinic', 'Test Clinic', 'testclinic', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active;

-- =============================================================================
-- TENANTS CREATED
-- =============================================================================



-- =============================================================================
-- FILE: 91_seed_demo_users.sql
-- =============================================================================

-- =============================================================================
-- 91_SEED_DEMO_USERS.SQL
-- =============================================================================
-- Creates demo users in auth.users for testing.
-- Requires service_role access (run via Supabase SQL Editor or service key).
--
-- Password for all users: password123
-- Bcrypt hash: $2a$10$PznXH/XK.SADSqvV2P1DhOkVOLGO0J1.eVQXR.cSx.qxDUbClnpXy
-- =============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_password_hash TEXT := '$2a$10$PznXH/XK.SADSqvV2P1DhOkVOLGO0J1.eVQXR.cSx.qxDUbClnpXy';
BEGIN
    -- =========================================================================
    -- ADRIS CLINIC USERS
    -- =========================================================================

    -- owner@demo.com - Pet Owner (Juan Perez)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'owner@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Juan Perez"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: owner@demo.com';
    END IF;

    -- owner2@demo.com - Pet Owner (Maria Gonzalez)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner2@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'owner2@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Maria Gonzalez"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: owner2@demo.com';
    END IF;

    -- vet@demo.com - Veterinarian (Dr. House)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vet@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'vet@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Dr. House"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: vet@demo.com';
    END IF;

    -- admin@demo.com - Clinic Admin
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@demo.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'admin@demo.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Admin Adris"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: admin@demo.com';
    END IF;

    -- =========================================================================
    -- PETLIFE CLINIC USERS
    -- =========================================================================

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vet@petlife.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'vet@petlife.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Dr. PetLife"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: vet@petlife.com';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@petlife.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, recovery_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated', 'admin@petlife.com', v_password_hash,
            NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Admin PetLife"}', NOW(), NOW(), '', ''
        );
        RAISE NOTICE 'Created user: admin@petlife.com';
    END IF;

    RAISE NOTICE 'Auth users created';
END $$;

-- =============================================================================
-- CREATE PROFILES FOR DEMO USERS
-- =============================================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- owner@demo.com -> adris, owner
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id, phone)
        VALUES (v_user_id, 'owner@demo.com', 'Juan Perez', 'owner', 'adris', '+595981234567')
        ON CONFLICT (id) DO UPDATE SET
            role = 'owner', tenant_id = 'adris', full_name = 'Juan Perez', phone = '+595981234567';
    END IF;

    -- owner2@demo.com -> adris, owner
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner2@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id, phone)
        VALUES (v_user_id, 'owner2@demo.com', 'Maria Gonzalez', 'owner', 'adris', '+595987654321')
        ON CONFLICT (id) DO UPDATE SET
            role = 'owner', tenant_id = 'adris', full_name = 'Maria Gonzalez', phone = '+595987654321';
    END IF;

    -- vet@demo.com -> adris, vet
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'vet@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'vet@demo.com', 'Dr. House', 'vet', 'adris')
        ON CONFLICT (id) DO UPDATE SET
            role = 'vet', tenant_id = 'adris', full_name = 'Dr. House';
    END IF;

    -- admin@demo.com -> adris, admin
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@demo.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'admin@demo.com', 'Admin Adris', 'admin', 'adris')
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin', tenant_id = 'adris', full_name = 'Admin Adris';
    END IF;

    -- vet@petlife.com -> petlife, vet
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'vet@petlife.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'vet@petlife.com', 'Dr. PetLife', 'vet', 'petlife')
        ON CONFLICT (id) DO UPDATE SET
            role = 'vet', tenant_id = 'petlife', full_name = 'Dr. PetLife';
    END IF;

    -- admin@petlife.com -> petlife, admin
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@petlife.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'admin@petlife.com', 'Admin PetLife', 'admin', 'petlife')
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin', tenant_id = 'petlife', full_name = 'Admin PetLife';
    END IF;

    RAISE NOTICE 'Profiles created/updated';
END $$;

-- =============================================================================
-- DEMO USERS READY
-- =============================================================================
--
-- | Email             | Password    | Role   | Tenant   |
-- |-------------------|-------------|--------|----------|
-- | owner@demo.com    | password123 | owner  | adris    |
-- | owner2@demo.com   | password123 | owner  | adris    |
-- | vet@demo.com      | password123 | vet    | adris    |
-- | admin@demo.com    | password123 | admin  | adris    |
-- | vet@petlife.com   | password123 | vet    | petlife  |
-- | admin@petlife.com | password123 | admin  | petlife  |
--
-- =============================================================================



-- =============================================================================
-- FILE: 92_seed_services.sql
-- =============================================================================

-- =============================================================================
-- 92_SEED_SERVICES.SQL
-- =============================================================================
-- Creates service catalog for clinics.
-- =============================================================================

INSERT INTO services (tenant_id, code, name, category, base_price, duration_minutes, is_taxable, description) VALUES
    -- =========================================================================
    -- ADRIS CLINIC SERVICES
    -- =========================================================================

    -- Consultations
    ('adris', 'CONSULT-GEN', 'Consulta General', 'consultation', 150000, 30, TRUE, 'Consulta medica general'),
    ('adris', 'CONSULT-URG', 'Urgencia', 'consultation', 250000, 45, TRUE, 'Atencion de urgencia'),
    ('adris', 'CONSULT-SPEC', 'Consulta Especializada', 'consultation', 200000, 45, TRUE, 'Consulta con especialista'),

    -- Grooming
    ('adris', 'BATH-S', 'Bano Perro Pequeno', 'grooming', 50000, 45, TRUE, 'Bano completo para perros pequenos (hasta 10kg)'),
    ('adris', 'BATH-M', 'Bano Perro Mediano', 'grooming', 70000, 60, TRUE, 'Bano completo para perros medianos (10-25kg)'),
    ('adris', 'BATH-L', 'Bano Perro Grande', 'grooming', 90000, 75, TRUE, 'Bano completo para perros grandes (25kg+)'),
    ('adris', 'BATH-CAT', 'Bano Gato', 'grooming', 60000, 45, TRUE, 'Bano completo para gatos'),
    ('adris', 'NAIL-001', 'Corte de Unas', 'grooming', 25000, 15, TRUE, 'Corte de unas para perros y gatos'),
    ('adris', 'HAIRCUT-001', 'Corte de Pelo', 'grooming', 80000, 60, TRUE, 'Corte de pelo segun raza'),
    ('adris', 'GROOM-FULL', 'Estetica Completa', 'grooming', 120000, 90, TRUE, 'Bano, corte, unas y limpieza de oidos'),

    -- Treatments
    ('adris', 'DESPAR-INT', 'Desparasitacion Interna', 'treatment', 35000, 15, TRUE, 'Antiparasitario interno oral'),
    ('adris', 'DESPAR-EXT', 'Desparasitacion Externa', 'treatment', 45000, 10, TRUE, 'Pipeta antiparasitaria'),
    ('adris', 'CLEAN-EARS', 'Limpieza de Oidos', 'treatment', 30000, 20, TRUE, 'Limpieza profunda de oidos'),
    ('adris', 'CLEAN-GLANDS', 'Vaciado de Glandulas', 'treatment', 40000, 15, TRUE, 'Vaciado de glandulas anales'),
    ('adris', 'DENTAL-CLEAN', 'Limpieza Dental', 'treatment', 180000, 60, TRUE, 'Limpieza dental con ultrasonido'),

    -- Vaccines
    ('adris', 'VAC-RABIES', 'Vacuna Antirrabica', 'vaccination', 80000, 15, TRUE, 'Vacuna contra la rabia'),
    ('adris', 'VAC-SEXTUPLE', 'Vacuna Sextuple', 'vaccination', 120000, 15, TRUE, 'Vacuna sextuple canina (DHLPP)'),
    ('adris', 'VAC-TRIPLE', 'Triple Felina', 'vaccination', 100000, 15, TRUE, 'Vacuna triple para gatos'),
    ('adris', 'VAC-LEUK', 'Leucemia Felina', 'vaccination', 110000, 15, TRUE, 'Vacuna contra leucemia felina'),
    ('adris', 'VAC-BORDETELLA', 'Bordetella', 'vaccination', 75000, 15, TRUE, 'Vacuna contra tos de perrera'),

    -- Surgeries
    ('adris', 'SURG-NEUTER-M', 'Castracion Macho', 'surgery', 350000, 60, TRUE, 'Castracion de macho'),
    ('adris', 'SURG-SPAY-F', 'Esterilizacion Hembra', 'surgery', 450000, 90, TRUE, 'Esterilizacion de hembra (OVH)'),

    -- Diagnostics
    ('adris', 'XRAY-001', 'Radiografia', 'diagnostic', 150000, 30, TRUE, 'Radiografia simple'),
    ('adris', 'ECHO-001', 'Ecografia Abdominal', 'diagnostic', 200000, 45, TRUE, 'Ecografia abdominal completa'),
    ('adris', 'BLOOD-001', 'Hemograma Completo', 'diagnostic', 80000, 15, TRUE, 'Analisis de sangre completo'),

    -- Identification
    ('adris', 'CHIP-001', 'Microchip', 'identification', 120000, 15, TRUE, 'Colocacion de microchip con registro'),
    ('adris', 'QR-TAG', 'Placa QR', 'identification', 45000, 5, TRUE, 'Placa identificadora con codigo QR'),

    -- =========================================================================
    -- PETLIFE CLINIC SERVICES
    -- =========================================================================

    ('petlife', 'CONSULT-001', 'Consulta General', 'consultation', 100000, 30, TRUE, 'Consulta medica general'),
    ('petlife', 'BATH-ALL', 'Bano Completo', 'grooming', 55000, 60, TRUE, 'Servicio de bano para cualquier tamano'),
    ('petlife', 'VAC-RABIES', 'Vacuna Antirrabica', 'vaccination', 75000, 15, TRUE, 'Vacuna contra la rabia'),
    ('petlife', 'VAC-MULTI', 'Vacuna Multiple', 'vaccination', 95000, 15, TRUE, 'Vacuna multiple canina o felina')

ON CONFLICT (tenant_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description;

-- =============================================================================
-- SERVICES CREATED
-- =============================================================================



-- =============================================================================
-- FILE: 93_seed_store.sql
-- =============================================================================

-- =============================================================================
-- 93_SEED_STORE.SQL
-- =============================================================================
-- Creates store categories, products, and inventory for testing.
-- =============================================================================

-- =============================================================================
-- 1. STORE CATEGORIES
-- =============================================================================

INSERT INTO store_categories (tenant_id, name, slug, description) VALUES
    -- Adris categories
    ('adris', 'Alimento Perros', 'alimento-perros', 'Alimento para perros de todas las edades'),
    ('adris', 'Alimento Gatos', 'alimento-gatos', 'Alimento para gatos de todas las edades'),
    ('adris', 'Antiparasitarios', 'antiparasitarios', 'Productos antiparasitarios internos y externos'),
    ('adris', 'Accesorios', 'accesorios', 'Collares, correas y accesorios'),
    ('adris', 'Higiene', 'higiene', 'Productos de higiene y limpieza'),
    ('adris', 'Juguetes', 'juguetes', 'Juguetes para perros y gatos'),
    ('adris', 'Camas y Casas', 'camas-casas', 'Camas, cuchas y transportadoras'),
    ('adris', 'Snacks y Premios', 'snacks-premios', 'Galletas, huesos y premios'),
    -- PetLife categories
    ('petlife', 'Alimentos', 'alimentos', 'Alimentos para mascotas'),
    ('petlife', 'Accesorios', 'accesorios', 'Accesorios varios')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- =============================================================================
-- 2. STORE PRODUCTS
-- =============================================================================

DO $$
DECLARE
    v_cat_dog_food UUID;
    v_cat_cat_food UUID;
    v_cat_anti UUID;
    v_cat_acc UUID;
    v_cat_hyg UUID;
    v_cat_toys UUID;
    v_cat_snacks UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO v_cat_dog_food FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-perros';
    SELECT id INTO v_cat_cat_food FROM store_categories WHERE tenant_id = 'adris' AND slug = 'alimento-gatos';
    SELECT id INTO v_cat_anti FROM store_categories WHERE tenant_id = 'adris' AND slug = 'antiparasitarios';
    SELECT id INTO v_cat_acc FROM store_categories WHERE tenant_id = 'adris' AND slug = 'accesorios';
    SELECT id INTO v_cat_hyg FROM store_categories WHERE tenant_id = 'adris' AND slug = 'higiene';
    SELECT id INTO v_cat_toys FROM store_categories WHERE tenant_id = 'adris' AND slug = 'juguetes';
    SELECT id INTO v_cat_snacks FROM store_categories WHERE tenant_id = 'adris' AND slug = 'snacks-premios';

    -- Insert products
    INSERT INTO store_products (tenant_id, sku, name, description, base_price, is_active, category_id) VALUES
        -- Dog Food
        ('adris', 'FOOD-DOG-001', 'Royal Canin Medium Adult 3kg', 'Alimento premium para perros adultos medianos', 85000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-002', 'Royal Canin Puppy 2kg', 'Alimento para cachorros', 75000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-003', 'Pro Plan Adult 7.5kg', 'Alimento super premium adultos', 180000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-004', 'Pedigree Adulto 15kg', 'Alimento economico adultos', 95000, TRUE, v_cat_dog_food),
        ('adris', 'FOOD-DOG-005', 'Royal Canin Mini Adult 1kg', 'Alimento para perros pequenos', 45000, TRUE, v_cat_dog_food),
        -- Cat Food
        ('adris', 'FOOD-CAT-001', 'Royal Canin Indoor 1.5kg', 'Alimento para gatos de interior', 65000, TRUE, v_cat_cat_food),
        ('adris', 'FOOD-CAT-002', 'Whiskas Adulto Pollo 1kg', 'Alimento para gatos adultos', 35000, TRUE, v_cat_cat_food),
        ('adris', 'FOOD-CAT-003', 'Pro Plan Urinary 3kg', 'Alimento para gatos con problemas urinarios', 120000, TRUE, v_cat_cat_food),
        ('adris', 'FOOD-CAT-004', 'Royal Canin Kitten 1kg', 'Alimento para gatitos', 55000, TRUE, v_cat_cat_food),
        -- Antiparasitics
        ('adris', 'ANTI-001', 'NexGard Spectra M (7-15kg)', 'Antiparasitario masticable mensual', 85000, TRUE, v_cat_anti),
        ('adris', 'ANTI-002', 'NexGard Spectra L (15-30kg)', 'Antiparasitario masticable mensual', 95000, TRUE, v_cat_anti),
        ('adris', 'ANTI-003', 'Frontline Plus Perro M', 'Pipeta antipulgas y garrapatas', 55000, TRUE, v_cat_anti),
        ('adris', 'ANTI-004', 'Frontline Plus Gato', 'Pipeta antipulgas para gatos', 50000, TRUE, v_cat_anti),
        ('adris', 'ANTI-005', 'Seresto Collar Perro M', 'Collar antiparasitario 8 meses', 180000, TRUE, v_cat_anti),
        ('adris', 'ANTI-006', 'Bravecto Perro M', 'Antiparasitario trimestral', 150000, TRUE, v_cat_anti),
        -- Accessories
        ('adris', 'ACC-001', 'Collar Nylon M', 'Collar ajustable para perro mediano', 25000, TRUE, v_cat_acc),
        ('adris', 'ACC-002', 'Correa Retractil 5m', 'Correa extensible con freno', 65000, TRUE, v_cat_acc),
        ('adris', 'ACC-003', 'Arnes Acolchado M', 'Arnes ergonomico para paseo', 55000, TRUE, v_cat_acc),
        ('adris', 'ACC-004', 'Plato Doble Inox', 'Comedero y bebedero acero inoxidable', 35000, TRUE, v_cat_acc),
        ('adris', 'ACC-005', 'Transportadora M', 'Transportadora para viajes', 120000, TRUE, v_cat_acc),
        -- Hygiene
        ('adris', 'HYG-001', 'Shampoo Antipulgas 500ml', 'Shampoo medicado contra pulgas', 35000, TRUE, v_cat_hyg),
        ('adris', 'HYG-002', 'Shampoo Pelo Blanco 500ml', 'Shampoo especial para pelo claro', 40000, TRUE, v_cat_hyg),
        ('adris', 'HYG-003', 'Cepillo Deslanador', 'Cepillo para remover pelo muerto', 45000, TRUE, v_cat_hyg),
        ('adris', 'HYG-004', 'Toallitas Humedas x50', 'Toallitas para limpieza rapida', 25000, TRUE, v_cat_hyg),
        ('adris', 'HYG-005', 'Cortaunas Profesional', 'Cortaunas de acero inoxidable', 30000, TRUE, v_cat_hyg),
        -- Toys
        ('adris', 'TOY-001', 'Kong Classic M', 'Juguete rellenable resistente', 55000, TRUE, v_cat_toys),
        ('adris', 'TOY-002', 'Pelota Tennis x3', 'Set de 3 pelotas de tennis', 20000, TRUE, v_cat_toys),
        ('adris', 'TOY-003', 'Hueso Nylon Sabor', 'Hueso de nylon con sabor', 30000, TRUE, v_cat_toys),
        ('adris', 'TOY-004', 'Cuerda Interactiva', 'Cuerda para juego de tira', 18000, TRUE, v_cat_toys),
        -- Snacks
        ('adris', 'SNACK-001', 'Dentastix x7', 'Snacks dentales para perros', 25000, TRUE, v_cat_snacks),
        ('adris', 'SNACK-002', 'Galletas Entrenamiento x100', 'Galletas pequenas para premiar', 18000, TRUE, v_cat_snacks),
        ('adris', 'SNACK-003', 'Hueso Natural M', 'Hueso natural de res', 15000, TRUE, v_cat_snacks)
    ON CONFLICT (tenant_id, sku) DO UPDATE SET
        name = EXCLUDED.name,
        base_price = EXCLUDED.base_price,
        category_id = EXCLUDED.category_id,
        is_active = EXCLUDED.is_active;

    RAISE NOTICE 'Store products created';
END $$;

-- =============================================================================
-- 3. INVENTORY
-- =============================================================================

INSERT INTO store_inventory (tenant_id, product_id, stock_quantity, min_stock_level, weighted_average_cost)
SELECT
    'adris',
    sp.id,
    CASE
        WHEN sp.sku LIKE 'FOOD-%' THEN 30 + (random() * 20)::int
        WHEN sp.sku LIKE 'ANTI-%' THEN 15 + (random() * 15)::int
        WHEN sp.sku LIKE 'ACC-%' THEN 10 + (random() * 10)::int
        WHEN sp.sku LIKE 'HYG-%' THEN 20 + (random() * 10)::int
        WHEN sp.sku LIKE 'TOY-%' THEN 15 + (random() * 10)::int
        WHEN sp.sku LIKE 'SNACK-%' THEN 25 + (random() * 15)::int
        ELSE 10
    END,
    5,
    sp.base_price * 0.6  -- 60% cost margin
FROM store_products sp
WHERE sp.tenant_id = 'adris'
ON CONFLICT (product_id) DO UPDATE SET
    stock_quantity = EXCLUDED.stock_quantity,
    min_stock_level = EXCLUDED.min_stock_level,
    weighted_average_cost = EXCLUDED.weighted_average_cost;

-- =============================================================================
-- STORE DATA CREATED
-- =============================================================================



-- =============================================================================
-- FILE: 94_seed_pets.sql
-- =============================================================================

-- =============================================================================
-- 94_SEED_PETS.SQL
-- =============================================================================
-- Creates pets, vaccines, medical records for demo users.
-- Requires 91_seed_demo_users.sql to have run first.
-- =============================================================================

DO $$
DECLARE
    v_owner_juan UUID;
    v_owner_maria UUID;
    v_vet_house UUID;
    v_pet_firulais UUID;
    v_pet_mishi UUID;
    v_pet_luna UUID;
    v_pet_thor UUID;
    v_pet_max UUID;
BEGIN
    -- =========================================================================
    -- GET USER IDs
    -- =========================================================================

    SELECT id INTO v_owner_juan FROM auth.users WHERE email = 'owner@demo.com';
    SELECT id INTO v_owner_maria FROM auth.users WHERE email = 'owner2@demo.com';
    SELECT id INTO v_vet_house FROM auth.users WHERE email = 'vet@demo.com';

    IF v_owner_juan IS NULL THEN
        RAISE NOTICE 'ERROR: owner@demo.com not found. Run 91_seed_demo_users.sql first!';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating pets for owner@demo.com (%)...', v_owner_juan;

    -- =========================================================================
    -- CLEAN EXISTING DATA (idempotent)
    -- =========================================================================

    DELETE FROM vaccines WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM medical_records WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM appointments WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM qr_tags WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_juan);
    DELETE FROM pets WHERE owner_id = v_owner_juan;

    IF v_owner_maria IS NOT NULL THEN
        DELETE FROM vaccines WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM medical_records WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM appointments WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM qr_tags WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = v_owner_maria);
        DELETE FROM pets WHERE owner_id = v_owner_maria;
    END IF;

    -- =========================================================================
    -- JUAN'S PETS (owner@demo.com)
    -- =========================================================================

    -- Firulais - Golden Retriever
    INSERT INTO pets (
        owner_id, tenant_id, name, species, breed, birth_date,
        weight_kg, sex, is_neutered, color, temperament,
        microchip_id, diet_category, diet_notes
    ) VALUES (
        v_owner_juan, 'adris', 'Firulais', 'dog', 'Golden Retriever', '2020-03-15',
        28.5, 'male', TRUE, 'Dorado', 'friendly',
        '9810000001', 'balanced', 'Royal Canin Adulto'
    ) RETURNING id INTO v_pet_firulais;

    -- Mishi - Siamese cat
    INSERT INTO pets (
        owner_id, tenant_id, name, species, breed, birth_date,
        weight_kg, sex, is_neutered, color, temperament,
        diet_category, diet_notes
    ) VALUES (
        v_owner_juan, 'adris', 'Mishi', 'cat', 'Siames', '2021-06-20',
        4.2, 'female', FALSE, 'Cream point', 'shy',
        'premium', 'Royal Canin Indoor'
    ) RETURNING id INTO v_pet_mishi;

    -- Luna - Labrador
    INSERT INTO pets (
        owner_id, tenant_id, name, species, breed, birth_date,
        weight_kg, sex, is_neutered, color, temperament,
        microchip_id, diet_category, diet_notes
    ) VALUES (
        v_owner_juan, 'adris', 'Luna', 'dog', 'Labrador Retriever', '2022-01-10',
        22.0, 'female', TRUE, 'Negro', 'playful',
        '9810000003', 'balanced', 'Pro Plan Adulto'
    ) RETURNING id INTO v_pet_luna;

    RAISE NOTICE 'Created 3 pets for Juan: Firulais, Mishi, Luna';

    -- =========================================================================
    -- MARIA'S PETS (owner2@demo.com)
    -- =========================================================================

    IF v_owner_maria IS NOT NULL THEN
        -- Thor - French Bulldog
        INSERT INTO pets (
            owner_id, tenant_id, name, species, breed, birth_date,
            weight_kg, sex, is_neutered, color, temperament, microchip_id
        ) VALUES (
            v_owner_maria, 'adris', 'Thor', 'dog', 'Bulldog Frances', '2021-09-05',
            12.0, 'male', TRUE, 'Atigrado', 'calm', '9810000002'
        ) RETURNING id INTO v_pet_thor;

        -- Max - Beagle
        INSERT INTO pets (
            owner_id, tenant_id, name, species, breed, birth_date,
            weight_kg, sex, is_neutered, color, temperament, microchip_id
        ) VALUES (
            v_owner_maria, 'adris', 'Max', 'dog', 'Beagle', '2019-11-20',
            14.5, 'male', TRUE, 'Tricolor', 'energetic', '9810000004'
        ) RETURNING id INTO v_pet_max;

        RAISE NOTICE 'Created 2 pets for Maria: Thor, Max';
    END IF;

    -- =========================================================================
    -- VACCINES
    -- =========================================================================

    -- Firulais vaccines (up to date)
    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number, notes) VALUES
        (v_pet_firulais, 'Antirrabica', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-RAB-001', 'Sin reacciones'),
        (v_pet_firulais, 'Sextuple (DHLPP)', '2024-01-15', '2025-01-15', 'verified', v_vet_house, 'LOT-2024-SEX-001', NULL),
        (v_pet_firulais, 'Bordetella', NULL, CURRENT_DATE + INTERVAL '7 days', 'pending', NULL, NULL, 'Proxima dosis');

    -- Mishi vaccines (partially vaccinated)
    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number, notes) VALUES
        (v_pet_mishi, 'Triple Felina', '2024-06-01', '2025-06-01', 'verified', v_vet_house, 'LOT-2024-TF-001', NULL),
        (v_pet_mishi, 'Leucemia Felina', NULL, CURRENT_DATE + INTERVAL '14 days', 'pending', NULL, NULL, 'Pendiente primera dosis');

    -- Luna vaccines (up to date)
    INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number, notes) VALUES
        (v_pet_luna, 'Antirrabica', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-RAB-002', NULL),
        (v_pet_luna, 'Sextuple (DHLPP)', '2024-03-10', '2025-03-10', 'verified', v_vet_house, 'LOT-2024-SEX-002', NULL);

    -- Thor vaccines (recent)
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, administered_by, batch_number) VALUES
            (v_pet_thor, 'Antirrabica', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'verified', v_vet_house, 'LOT-2024-RAB-003'),
            (v_pet_thor, 'Sextuple (DHLPP)', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'verified', v_vet_house, 'LOT-2024-SEX-003');
    END IF;

    -- Max vaccines (OVERDUE - for testing alerts)
    IF v_pet_max IS NOT NULL THEN
        INSERT INTO vaccines (pet_id, name, administered_date, next_due_date, status, notes) VALUES
            (v_pet_max, 'Antirrabica', '2023-11-20', '2024-11-20', 'pending', 'VENCIDA - Contactar al dueno'),
            (v_pet_max, 'Sextuple (DHLPP)', '2023-11-20', '2024-11-20', 'pending', 'VENCIDA');
    END IF;

    RAISE NOTICE 'Vaccines created';

    -- =========================================================================
    -- MEDICAL RECORDS
    -- =========================================================================

    INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date) VALUES
        -- Firulais records
        (v_pet_firulais, 'adris', v_vet_house, 'consultation', 'Control Anual 2024', 'Paciente sano', 'Peso estable. Pelaje brillante. Sin alteraciones.', '2024-01-15'),
        (v_pet_firulais, 'adris', v_vet_house, 'vaccination', 'Vacunacion Anual', 'Vacunas aplicadas', 'Antirrabica y sextuple. Sin reacciones adversas.', '2024-01-15'),
        -- Mishi records
        (v_pet_mishi, 'adris', v_vet_house, 'consultation', 'Primera Consulta', 'Gata sana', 'Nuevo paciente. Examen fisico normal.', '2024-05-01'),
        (v_pet_mishi, 'adris', v_vet_house, 'vaccination', 'Triple Felina', 'Vacuna aplicada', 'Primera dosis de triple felina.', '2024-06-01'),
        -- Luna records
        (v_pet_luna, 'adris', v_vet_house, 'surgery', 'Esterilizacion (OVH)', 'Ovariohisterectomia', 'Cirugia sin complicaciones.', '2024-02-15'),
        (v_pet_luna, 'adris', v_vet_house, 'consultation', 'Control Post-quirurgico', 'Recuperacion exitosa', 'Herida cicatrizando correctamente.', '2024-02-25');

    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date) VALUES
            (v_pet_thor, 'adris', v_vet_house, 'surgery', 'Castracion', 'Orquiectomia electiva', 'Procedimiento sin complicaciones.', CURRENT_DATE - INTERVAL '90 days');
    END IF;

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO medical_records (pet_id, tenant_id, performed_by, type, title, diagnosis, notes, visit_date) VALUES
            (v_pet_max, 'adris', v_vet_house, 'consultation', 'Dermatitis Alergica', 'Dermatitis atopica', 'Lesiones eritematosas en axilas y abdomen.', CURRENT_DATE - INTERVAL '15 days'),
            (v_pet_max, 'adris', v_vet_house, 'consultation', 'Control Dermatitis', 'Mejoria parcial', 'Lesiones en proceso de resolucion.', CURRENT_DATE - INTERVAL '8 days');
    END IF;

    RAISE NOTICE 'Medical records created';

    -- =========================================================================
    -- QR TAGS
    -- =========================================================================

    INSERT INTO qr_tags (code, pet_id, tenant_id, status) VALUES
        ('QR-ADRIS-001', v_pet_firulais, 'adris', 'active'),
        ('QR-ADRIS-002', v_pet_luna, 'adris', 'active'),
        ('QR-ADRIS-003', v_pet_thor, 'adris', 'active'),
        ('QR-ADRIS-004', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-005', NULL, 'adris', 'unassigned'),
        ('QR-ADRIS-006', NULL, 'adris', 'unassigned');

    RAISE NOTICE 'QR tags created';

    -- =========================================================================
    -- OWNER-CLINIC CONNECTIONS
    -- =========================================================================

    INSERT INTO owner_clinic_connections (owner_id, tenant_id, connection_type)
    VALUES (v_owner_juan, 'adris', 'pet_registered')
    ON CONFLICT (owner_id, tenant_id) DO NOTHING;

    IF v_owner_maria IS NOT NULL THEN
        INSERT INTO owner_clinic_connections (owner_id, tenant_id, connection_type)
        VALUES (v_owner_maria, 'adris', 'pet_registered')
        ON CONFLICT (owner_id, tenant_id) DO NOTHING;
    END IF;

    -- =========================================================================
    -- SUMMARY
    -- =========================================================================

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'PETS CREATED SUCCESSFULLY!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'owner@demo.com: 3 pets (Firulais, Mishi, Luna)';
    IF v_owner_maria IS NOT NULL THEN
        RAISE NOTICE 'owner2@demo.com: 2 pets (Thor, Max)';
    END IF;
    RAISE NOTICE '============================================';

END $$;

-- =============================================================================
-- PETS SEEDED
-- =============================================================================



-- =============================================================================
-- FILE: 95_seed_appointments.sql
-- =============================================================================

-- =============================================================================
-- 95_SEED_APPOINTMENTS.SQL
-- =============================================================================
-- Creates sample appointments for testing.
-- Requires 94_seed_pets.sql to have run first.
-- =============================================================================

DO $$
DECLARE
    v_owner_juan UUID;
    v_owner_maria UUID;
    v_vet_house UUID;
    v_pet_firulais UUID;
    v_pet_mishi UUID;
    v_pet_luna UUID;
    v_pet_thor UUID;
    v_pet_max UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO v_owner_juan FROM auth.users WHERE email = 'owner@demo.com';
    SELECT id INTO v_owner_maria FROM auth.users WHERE email = 'owner2@demo.com';
    SELECT id INTO v_vet_house FROM auth.users WHERE email = 'vet@demo.com';

    IF v_owner_juan IS NULL THEN
        RAISE NOTICE 'ERROR: owner@demo.com not found. Run previous seed files first!';
        RETURN;
    END IF;

    -- Get pet IDs
    SELECT id INTO v_pet_firulais FROM pets WHERE owner_id = v_owner_juan AND name = 'Firulais';
    SELECT id INTO v_pet_mishi FROM pets WHERE owner_id = v_owner_juan AND name = 'Mishi';
    SELECT id INTO v_pet_luna FROM pets WHERE owner_id = v_owner_juan AND name = 'Luna';

    IF v_owner_maria IS NOT NULL THEN
        SELECT id INTO v_pet_thor FROM pets WHERE owner_id = v_owner_maria AND name = 'Thor';
        SELECT id INTO v_pet_max FROM pets WHERE owner_id = v_owner_maria AND name = 'Max';
    END IF;

    IF v_pet_firulais IS NULL THEN
        RAISE NOTICE 'ERROR: Pets not found. Run 94_seed_pets.sql first!';
        RETURN;
    END IF;

    -- Clean existing appointments
    DELETE FROM appointments WHERE tenant_id = 'adris'
        AND pet_id IN (v_pet_firulais, v_pet_mishi, v_pet_luna, v_pet_thor, v_pet_max);

    -- =========================================================================
    -- CREATE APPOINTMENTS
    -- =========================================================================

    -- Past appointments (completed)
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE - INTERVAL '7 days' + TIME '10:00',
         CURRENT_DATE - INTERVAL '7 days' + TIME '10:30',
         'completed', 'Control post-vacunacion', 'Sin reacciones adversas.', v_owner_juan),
        ('adris', v_pet_luna, v_vet_house,
         CURRENT_DATE - INTERVAL '14 days' + TIME '11:00',
         CURRENT_DATE - INTERVAL '14 days' + TIME '11:30',
         'completed', 'Control post-cirugia', 'Recuperacion completa.', v_owner_juan);

    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE - INTERVAL '14 days' + TIME '15:00',
             CURRENT_DATE - INTERVAL '14 days' + TIME '15:30',
             'completed', 'Vacunacion', 'Vacunas aplicadas correctamente.', v_owner_maria);
    END IF;

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE - INTERVAL '8 days' + TIME '16:00',
             CURRENT_DATE - INTERVAL '8 days' + TIME '16:30',
             'completed', 'Control dermatitis', 'Mejoria notable.', v_owner_maria);
    END IF;

    -- Today's appointments
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_mishi, v_vet_house,
         CURRENT_DATE + TIME '14:00',
         CURRENT_DATE + TIME '14:30',
         'confirmed', 'Vacunacion pendiente', 'Leucemia felina primera dosis.', v_owner_juan);

    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE + TIME '16:00',
             CURRENT_DATE + TIME '16:30',
             'confirmed', 'Control dermatitis', v_owner_maria);
    END IF;

    -- Tomorrow's appointments
    IF v_pet_thor IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_thor, v_vet_house,
             CURRENT_DATE + INTERVAL '1 day' + TIME '09:00',
             CURRENT_DATE + INTERVAL '1 day' + TIME '10:00',
             'confirmed', 'Revision general', 'Control de peso.', v_owner_maria);
    END IF;

    -- Next week appointments
    INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
        ('adris', v_pet_luna, NULL,
         CURRENT_DATE + INTERVAL '5 days' + TIME '11:00',
         CURRENT_DATE + INTERVAL '5 days' + TIME '12:00',
         'pending', 'Bano y corte', 'Traer toalla propia.', v_owner_juan),
        ('adris', v_pet_firulais, v_vet_house,
         CURRENT_DATE + INTERVAL '7 days' + TIME '10:00',
         CURRENT_DATE + INTERVAL '7 days' + TIME '10:30',
         'confirmed', 'Vacuna Bordetella', NULL, v_owner_juan);

    -- Cancelled appointment (for history)
    IF v_pet_max IS NOT NULL THEN
        INSERT INTO appointments (tenant_id, pet_id, vet_id, start_time, end_time, status, reason, notes, created_by) VALUES
            ('adris', v_pet_max, v_vet_house,
             CURRENT_DATE - INTERVAL '3 days' + TIME '16:00',
             CURRENT_DATE - INTERVAL '3 days' + TIME '16:30',
             'cancelled', 'Control dermatitis', 'Cancelado por el dueno - reagendado.', v_owner_maria);
    END IF;

    RAISE NOTICE 'Appointments created';

END $$;

-- =============================================================================
-- APPOINTMENTS SEEDED
-- =============================================================================



-- =============================================================================
-- FILE: 96_seed_invites.sql
-- =============================================================================

-- =============================================================================
-- 96_SEED_INVITES.SQL
-- =============================================================================
-- Creates clinic invites for testing the signup flow.
-- =============================================================================

INSERT INTO clinic_invites (tenant_id, email, role) VALUES
    -- Adris invites
    ('adris', 'newvet@demo.com', 'vet'),
    ('adris', 'newadmin@demo.com', 'admin'),
    ('adris', 'newowner@demo.com', 'owner'),
    -- PetLife invites
    ('petlife', 'newvet@petlife.com', 'vet'),
    ('petlife', 'newadmin@petlife.com', 'admin'),
    -- Test clinic invites
    ('testclinic', 'testadmin@test.com', 'admin'),
    ('testclinic', 'testvet@test.com', 'vet')
ON CONFLICT (email, tenant_id) DO NOTHING;

-- =============================================================================
-- INVITES CREATED
-- =============================================================================
--
-- These emails can be used to test the signup flow:
-- - Sign up with one of these emails
-- - The user will be automatically assigned to the correct tenant/role
--
-- =============================================================================



-- =============================================================================
-- FILE: 99_seed_finalize.sql
-- =============================================================================

-- =============================================================================
-- 99_SEED_FINALIZE.SQL
-- =============================================================================
-- Final seed file - refreshes views and validates data.
-- This should be the LAST seed file to run.
-- =============================================================================

-- =============================================================================
-- 1. REFRESH MATERIALIZED VIEWS
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'refresh_all_materialized_views') THEN
        PERFORM refresh_all_materialized_views();
        RAISE NOTICE 'Materialized views refreshed';
    ELSE
        -- Manually refresh if function doesn't exist
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'daily_stats') THEN
            REFRESH MATERIALIZED VIEW daily_stats;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'monthly_revenue') THEN
            REFRESH MATERIALIZED VIEW monthly_revenue;
        END IF;
        RAISE NOTICE 'Materialized views refreshed manually';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not refresh materialized views: %', SQLERRM;
END $$;

-- =============================================================================
-- 2. VALIDATION SUMMARY
-- =============================================================================

DO $$
DECLARE
    v_tenants INT;
    v_users INT;
    v_pets INT;
    v_services INT;
    v_products INT;
    v_appointments INT;
BEGIN
    SELECT COUNT(*) INTO v_tenants FROM tenants;
    SELECT COUNT(*) INTO v_users FROM auth.users WHERE email LIKE '%@demo.com' OR email LIKE '%@petlife.com';
    SELECT COUNT(*) INTO v_pets FROM pets;
    SELECT COUNT(*) INTO v_services FROM services;
    SELECT COUNT(*) INTO v_products FROM store_products;
    SELECT COUNT(*) INTO v_appointments FROM appointments;

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DATABASE SEED COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tenants:      %', v_tenants;
    RAISE NOTICE 'Demo Users:   %', v_users;
    RAISE NOTICE 'Pets:         %', v_pets;
    RAISE NOTICE 'Services:     %', v_services;
    RAISE NOTICE 'Products:     %', v_products;
    RAISE NOTICE 'Appointments: %', v_appointments;
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'TEST ACCOUNTS (password: password123):';
    RAISE NOTICE '  owner@demo.com   - Pet owner with 3 pets';
    RAISE NOTICE '  owner2@demo.com  - Pet owner with 2 pets';
    RAISE NOTICE '  vet@demo.com     - Veterinarian';
    RAISE NOTICE '  admin@demo.com   - Clinic admin';
    RAISE NOTICE '';
    RAISE NOTICE 'Access the app at:';
    RAISE NOTICE '  http://localhost:3000/adris';
    RAISE NOTICE '  http://localhost:3000/petlife';
    RAISE NOTICE '============================================';
END $$;

-- =============================================================================
-- SEED COMPLETE
-- =============================================================================


