-- =============================================================================
-- 00_CLEANUP.SQL
-- =============================================================================
-- Drops all tables, functions, and triggers in correct order.
-- USE WITH CAUTION - This will delete ALL data!
--
-- Run this before re-applying migrations for a fresh start.
-- =============================================================================

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- =============================================================================
-- DROP TABLES (Reverse dependency order)
-- =============================================================================

-- System / Audit
DROP TABLE IF EXISTS public.disease_reports CASCADE;
DROP TABLE IF EXISTS public.lost_pets CASCADE;
DROP TABLE IF EXISTS public.qr_tag_scans CASCADE;
DROP TABLE IF EXISTS public.qr_tags CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Staff
DROP TABLE IF EXISTS public.staff_time_off CASCADE;
DROP TABLE IF EXISTS public.time_off_types CASCADE;
DROP TABLE IF EXISTS public.staff_schedule_entries CASCADE;
DROP TABLE IF EXISTS public.staff_schedules CASCADE;
DROP TABLE IF EXISTS public.staff_profiles CASCADE;

-- Insurance
DROP TABLE IF EXISTS public.insurance_claim_documents CASCADE;
DROP TABLE IF EXISTS public.insurance_claim_items CASCADE;
DROP TABLE IF EXISTS public.insurance_claims CASCADE;
DROP TABLE IF EXISTS public.insurance_policies CASCADE;
DROP TABLE IF EXISTS public.insurance_providers CASCADE;

-- Communications
DROP TABLE IF EXISTS public.communication_preferences CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.message_templates CASCADE;

-- Store
DROP TABLE IF EXISTS public.store_price_history CASCADE;
DROP TABLE IF EXISTS public.store_coupons CASCADE;
DROP TABLE IF EXISTS public.store_campaign_items CASCADE;
DROP TABLE IF EXISTS public.store_campaigns CASCADE;
DROP TABLE IF EXISTS public.store_inventory_transactions CASCADE;
DROP TABLE IF EXISTS public.store_inventory CASCADE;
DROP TABLE IF EXISTS public.store_products CASCADE;
DROP TABLE IF EXISTS public.store_brands CASCADE;
DROP TABLE IF EXISTS public.store_categories CASCADE;

-- Finance
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.loyalty_points CASCADE;
DROP TABLE IF EXISTS public.loyalty_rules CASCADE;
DROP TABLE IF EXISTS public.expense_categories CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.client_credits CASCADE;
DROP TABLE IF EXISTS public.refunds CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;

-- Scheduling
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;

-- Clinical / Medical Records
DROP TABLE IF EXISTS public.consent_documents CASCADE;
DROP TABLE IF EXISTS public.consent_templates CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;

-- Hospitalization
DROP TABLE IF EXISTS public.hospitalization_notes CASCADE;
DROP TABLE IF EXISTS public.hospitalization_feedings CASCADE;
DROP TABLE IF EXISTS public.hospitalization_treatments CASCADE;
DROP TABLE IF EXISTS public.hospitalization_medications CASCADE;
DROP TABLE IF EXISTS public.hospitalization_vitals CASCADE;
DROP TABLE IF EXISTS public.hospitalizations CASCADE;
DROP TABLE IF EXISTS public.kennels CASCADE;

-- Lab
DROP TABLE IF EXISTS public.lab_result_comments CASCADE;
DROP TABLE IF EXISTS public.lab_result_attachments CASCADE;
DROP TABLE IF EXISTS public.lab_results CASCADE;
DROP TABLE IF EXISTS public.lab_order_items CASCADE;
DROP TABLE IF EXISTS public.lab_orders CASCADE;
DROP TABLE IF EXISTS public.lab_panels CASCADE;
DROP TABLE IF EXISTS public.lab_test_catalog CASCADE;

-- Clinical Reference
DROP TABLE IF EXISTS public.euthanasia_assessments CASCADE;
DROP TABLE IF EXISTS public.reproductive_cycles CASCADE;
DROP TABLE IF EXISTS public.growth_standards CASCADE;
DROP TABLE IF EXISTS public.drug_dosages CASCADE;
DROP TABLE IF EXISTS public.diagnosis_codes CASCADE;

-- Pets
DROP TABLE IF EXISTS public.vaccine_reactions CASCADE;
DROP TABLE IF EXISTS public.vaccines CASCADE;
DROP TABLE IF EXISTS public.vaccine_templates CASCADE;
DROP TABLE IF EXISTS public.pets CASCADE;

-- Core
DROP TABLE IF EXISTS public.clinic_invites CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- =============================================================================
-- DROP FUNCTIONS
-- =============================================================================

-- Audit functions
DROP FUNCTION IF EXISTS public.get_unread_notification_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.generate_qr_code(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_qr_tag_on_scan() CASCADE;
DROP FUNCTION IF EXISTS public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.log_audit(TEXT, TEXT, TEXT, UUID, JSONB, JSONB) CASCADE;

-- Staff functions
DROP FUNCTION IF EXISTS public.check_staff_availability(UUID, DATE, TIME, TIME) CASCADE;

-- Insurance functions
DROP FUNCTION IF EXISTS public.get_pet_active_insurance(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.generate_claim_number(TEXT) CASCADE;

-- Communication functions
DROP FUNCTION IF EXISTS public.mark_conversation_read(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_on_message() CASCADE;

-- Store functions
DROP FUNCTION IF EXISTS public.validate_coupon(TEXT, TEXT, UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.track_price_change() CASCADE;
DROP FUNCTION IF EXISTS public.update_inventory_on_transaction() CASCADE;

-- Finance functions
DROP FUNCTION IF EXISTS public.get_expense_summary(TEXT, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_loyalty_points(TEXT, NUMERIC, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_loyalty_balance() CASCADE;
DROP FUNCTION IF EXISTS public.update_invoice_on_payment() CASCADE;
DROP FUNCTION IF EXISTS public.update_invoice_totals() CASCADE;
DROP FUNCTION IF EXISTS public.generate_invoice_number(TEXT) CASCADE;

-- Clinical functions
DROP FUNCTION IF EXISTS public.generate_consent_number(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.generate_prescription_number(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.generate_admission_number(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_kennel_status() CASCADE;
DROP FUNCTION IF EXISTS public.generate_lab_order_number(TEXT) CASCADE;

-- Scheduling functions
DROP FUNCTION IF EXISTS public.get_available_slots(TEXT, DATE, UUID, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.validate_appointment_booking() CASCADE;
DROP FUNCTION IF EXISTS public.check_appointment_overlap(TEXT, UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) CASCADE;

-- Pet functions
DROP FUNCTION IF EXISTS public.search_pets(TEXT, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_pet_age(UUID) CASCADE;

-- Core functions
DROP FUNCTION IF EXISTS public.create_clinic_invite(TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.expire_old_invites() CASCADE;
DROP FUNCTION IF EXISTS public.generate_sequence_number(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.restore_deleted(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.soft_delete(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.protect_critical_profile_columns() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_tenant() CASCADE;
DROP FUNCTION IF EXISTS public.is_owner_of_pet(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_staff_of(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- =============================================================================
-- RE-ENABLE TRIGGERS
-- =============================================================================

SET session_replication_role = 'origin';

-- =============================================================================
-- DONE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Database cleanup complete!';
    RAISE NOTICE 'All tables and functions have been dropped.';
    RAISE NOTICE '============================================';
END $$;

