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
