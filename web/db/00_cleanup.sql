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
