CREATE TABLE "system_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "clinic_product_assignments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vaccine_protocols" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "consent_templates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invoice_sequences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "store_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "store_brands" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "store_products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "store_inventory" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "store_inventory_transactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "materialized_view_refresh_log" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "scheduled_job_log" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP VIEW "public"."tenant_public_info";--> statement-breakpoint
DROP VIEW "public"."recent_job_executions";--> statement-breakpoint
DROP VIEW "public"."job_statistics";--> statement-breakpoint
DROP POLICY "Service role manage demo accounts" ON "demo_accounts" CASCADE;--> statement-breakpoint
DROP TABLE "demo_accounts" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access" ON "clinic_invites" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage invites" ON "clinic_invites" CASCADE;--> statement-breakpoint
DROP TABLE "clinic_invites" CASCADE;--> statement-breakpoint
DROP TABLE "clinic_patient_access" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage assignments" ON "clinic_product_assignments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access assignments" ON "clinic_product_assignments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access product assignments" ON "clinic_product_assignments" CASCADE;--> statement-breakpoint
DROP TABLE "clinic_product_assignments" CASCADE;--> statement-breakpoint
DROP POLICY "Owners manage own pets" ON "pets" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access" ON "pets" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage tenant pets" ON "pets" CASCADE;--> statement-breakpoint
DROP TABLE "pets" CASCADE;--> statement-breakpoint
DROP POLICY "Public lookup tags" ON "qr_tags" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access tags" ON "qr_tags" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage tags" ON "qr_tags" CASCADE;--> statement-breakpoint
DROP TABLE "qr_tags" CASCADE;--> statement-breakpoint
DROP TABLE "voice_notes" CASCADE;--> statement-breakpoint
DROP TABLE "dicom_images" CASCADE;--> statement-breakpoint
DROP POLICY "Owners manage own lost pets" ON "lost_pets" CASCADE;--> statement-breakpoint
DROP POLICY "Public view lost pets" ON "lost_pets" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access lost pets" ON "lost_pets" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage lost pets" ON "lost_pets" CASCADE;--> statement-breakpoint
DROP TABLE "lost_pets" CASCADE;--> statement-breakpoint
DROP POLICY "Public read global templates" ON "vaccine_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access templates" ON "vaccine_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage tenant templates" ON "vaccine_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Staff read tenant templates" ON "vaccine_templates" CASCADE;--> statement-breakpoint
DROP TABLE "vaccine_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet vaccines" ON "vaccines" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access vaccines" ON "vaccines" CASCADE;--> statement-breakpoint
DROP TABLE "vaccines" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet reactions" ON "vaccine_reactions" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access reactions" ON "vaccine_reactions" CASCADE;--> statement-breakpoint
DROP TABLE "vaccine_reactions" CASCADE;--> statement-breakpoint
DROP POLICY "Admin manage sequences" ON "document_sequences" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access sequences" ON "document_sequences" CASCADE;--> statement-breakpoint
DROP TABLE "document_sequences" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access preauth" ON "insurance_preauth" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage preauth" ON "insurance_preauth" CASCADE;--> statement-breakpoint
DROP TABLE "insurance_preauth" CASCADE;--> statement-breakpoint
DROP TABLE "products" CASCADE;--> statement-breakpoint
DROP TABLE "vaccine_protocols" CASCADE;--> statement-breakpoint
DROP TABLE "pet_qr_codes" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage clinic_pets" ON "clinic_pets" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view their pets clinic relationships" ON "clinic_pets" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access clinic_pets" ON "clinic_pets" CASCADE;--> statement-breakpoint
DROP TABLE "clinic_pets" CASCADE;--> statement-breakpoint
DROP POLICY "Public read diagnosis codes" ON "diagnosis_codes" CASCADE;--> statement-breakpoint
DROP POLICY "Service role manage diagnosis codes" ON "diagnosis_codes" CASCADE;--> statement-breakpoint
DROP TABLE "diagnosis_codes" CASCADE;--> statement-breakpoint
DROP POLICY "Public read drug dosages" ON "drug_dosages" CASCADE;--> statement-breakpoint
DROP POLICY "Service role manage drug dosages" ON "drug_dosages" CASCADE;--> statement-breakpoint
DROP TABLE "drug_dosages" CASCADE;--> statement-breakpoint
DROP POLICY "Public read growth standards" ON "growth_standards" CASCADE;--> statement-breakpoint
DROP POLICY "Service role manage growth standards" ON "growth_standards" CASCADE;--> statement-breakpoint
DROP TABLE "growth_standards" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet cycles" ON "reproductive_cycles" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access cycles" ON "reproductive_cycles" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage reproductive cycles" ON "reproductive_cycles" CASCADE;--> statement-breakpoint
DROP TABLE "reproductive_cycles" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet assessments" ON "euthanasia_assessments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access assessments" ON "euthanasia_assessments" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage assessments" ON "euthanasia_assessments" CASCADE;--> statement-breakpoint
DROP TABLE "euthanasia_assessments" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic templates managed by staff" ON "consent_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Global templates viewable by all" ON "consent_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access consent_templates" ON "consent_templates" CASCADE;--> statement-breakpoint
DROP TABLE "consent_templates" CASCADE;--> statement-breakpoint
DROP TABLE "invoice_sequences" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet records" ON "medical_records" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access records" ON "medical_records" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage medical records" ON "medical_records" CASCADE;--> statement-breakpoint
DROP TABLE "medical_records" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet prescriptions" ON "prescriptions" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access prescriptions" ON "prescriptions" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage prescriptions" ON "prescriptions" CASCADE;--> statement-breakpoint
DROP TABLE "prescriptions" CASCADE;--> statement-breakpoint
DROP TABLE "notification_channels" CASCADE;--> statement-breakpoint
DROP TABLE "notification_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Users manage own preferences" ON "notification_preferences" CASCADE;--> statement-breakpoint
DROP TABLE "notification_preferences" CASCADE;--> statement-breakpoint
DROP TABLE "notification_log" CASCADE;--> statement-breakpoint
DROP TABLE "reminder_rules" CASCADE;--> statement-breakpoint
DROP POLICY "Public view active services" ON "services" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access" ON "services" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage services" ON "services" CASCADE;--> statement-breakpoint
DROP TABLE "services" CASCADE;--> statement-breakpoint
DROP POLICY "Owners cancel appointments" ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Owners create appointments" ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet appointments" ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access" ON "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage appointments" ON "appointments" CASCADE;--> statement-breakpoint
DROP TABLE "appointments" CASCADE;--> statement-breakpoint
DROP POLICY "Authenticated users view suppliers" ON "suppliers" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage suppliers" ON "suppliers" CASCADE;--> statement-breakpoint
DROP POLICY "Platform admins manage global suppliers" ON "suppliers" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access suppliers" ON "suppliers" CASCADE;--> statement-breakpoint
DROP TABLE "suppliers" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalization_visits" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalization_documents" CASCADE;--> statement-breakpoint
DROP POLICY "Authenticated users view categories" ON "store_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage categories" ON "store_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Platform admins manage global categories" ON "store_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access categories" ON "store_categories" CASCADE;--> statement-breakpoint
DROP TABLE "store_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Authenticated users view brands" ON "store_brands" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage brands" ON "store_brands" CASCADE;--> statement-breakpoint
DROP POLICY "Platform admins manage global brands" ON "store_brands" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access brands" ON "store_brands" CASCADE;--> statement-breakpoint
DROP TABLE "store_brands" CASCADE;--> statement-breakpoint
DROP POLICY "Authenticated users view products" ON "store_products" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage products" ON "store_products" CASCADE;--> statement-breakpoint
DROP POLICY "Platform admins manage global products" ON "store_products" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access products" ON "store_products" CASCADE;--> statement-breakpoint
DROP TABLE "store_products" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage inventory" ON "store_inventory" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access inventory" ON "store_inventory" CASCADE;--> statement-breakpoint
DROP TABLE "store_inventory" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_panels" CASCADE;--> statement-breakpoint
DROP TABLE "lab_panel_tests" CASCADE;--> statement-breakpoint
DROP TABLE "lab_reference_ranges" CASCADE;--> statement-breakpoint
DROP TABLE "external_lab_integrations" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage campaigns" ON "store_campaigns" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access campaigns" ON "store_campaigns" CASCADE;--> statement-breakpoint
DROP TABLE "store_campaigns" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage coupons" ON "store_coupons" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access coupons" ON "store_coupons" CASCADE;--> statement-breakpoint
DROP TABLE "store_coupons" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage orders" ON "store_orders" CASCADE;--> statement-breakpoint
DROP POLICY "Customers view own orders" ON "store_orders" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access orders" ON "store_orders" CASCADE;--> statement-breakpoint
DROP TABLE "store_orders" CASCADE;--> statement-breakpoint
DROP POLICY "Customers view own order_items" ON "store_order_items" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access order_items" ON "store_order_items" CASCADE;--> statement-breakpoint
DROP TABLE "store_order_items" CASCADE;--> statement-breakpoint
DROP TABLE "consent_template_fields" CASCADE;--> statement-breakpoint
DROP TABLE "consent_audit_log" CASCADE;--> statement-breakpoint
DROP TABLE "consent_requests" CASCADE;--> statement-breakpoint
DROP TABLE "blanket_consents" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff moderate reviews" ON "store_reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Customers manage own reviews" ON "store_reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Public view approved reviews" ON "store_reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access reviews" ON "store_reviews" CASCADE;--> statement-breakpoint
DROP TABLE "store_reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Customers manage own wishlist" ON "store_wishlist" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access wishlist" ON "store_wishlist" CASCADE;--> statement-breakpoint
DROP TABLE "store_wishlist" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage procurement" ON "procurement_leads" CASCADE;--> statement-breakpoint
DROP POLICY "Platform admins view procurement" ON "procurement_leads" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access procurement" ON "procurement_leads" CASCADE;--> statement-breakpoint
DROP TABLE "procurement_leads" CASCADE;--> statement-breakpoint
DROP TABLE "staff_shifts" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access payment methods" ON "payment_methods" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage payment methods" ON "payment_methods" CASCADE;--> statement-breakpoint
DROP TABLE "payment_methods" CASCADE;--> statement-breakpoint
DROP TABLE "time_off_requests" CASCADE;--> statement-breakpoint
DROP TABLE "time_off_balances" CASCADE;--> statement-breakpoint
DROP TABLE "staff_availability_overrides" CASCADE;--> statement-breakpoint
DROP TABLE "staff_tasks" CASCADE;--> statement-breakpoint
DROP TABLE "staff_reviews" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own invoices" ON "invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access invoices" ON "invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage invoices" ON "invoices" CASCADE;--> statement-breakpoint
DROP TABLE "invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view invoice items" ON "invoice_items" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access invoice items" ON "invoice_items" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage invoice items" ON "invoice_items" CASCADE;--> statement-breakpoint
DROP TABLE "invoice_items" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own payments" ON "payments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access payments" ON "payments" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage payments" ON "payments" CASCADE;--> statement-breakpoint
DROP TABLE "payments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access refunds" ON "refunds" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage refunds" ON "refunds" CASCADE;--> statement-breakpoint
DROP TABLE "refunds" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view notes" ON "hospitalization_notes" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access notes" ON "hospitalization_notes" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage notes" ON "hospitalization_notes" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalization_notes" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access expenses" ON "expenses" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage expenses" ON "expenses" CASCADE;--> statement-breakpoint
DROP TABLE "expenses" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access expense categories" ON "expense_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage expense categories" ON "expense_categories" CASCADE;--> statement-breakpoint
DROP TABLE "expense_categories" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own points" ON "loyalty_points" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access loyalty points" ON "loyalty_points" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage loyalty points" ON "loyalty_points" CASCADE;--> statement-breakpoint
DROP TABLE "loyalty_points" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own transactions" ON "loyalty_transactions" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access loyalty transactions" ON "loyalty_transactions" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage loyalty transactions" ON "loyalty_transactions" CASCADE;--> statement-breakpoint
DROP TABLE "loyalty_transactions" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access preferences" ON "communication_preferences" CASCADE;--> statement-breakpoint
DROP POLICY "Staff view preferences" ON "communication_preferences" CASCADE;--> statement-breakpoint
DROP POLICY "Users manage own preferences" ON "communication_preferences" CASCADE;--> statement-breakpoint
DROP TABLE "communication_preferences" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage inventory_txns" ON "store_inventory_transactions" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access inv txn" ON "store_inventory_transactions" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access inventory_txns" ON "store_inventory_transactions" CASCADE;--> statement-breakpoint
DROP TABLE "store_inventory_transactions" CASCADE;--> statement-breakpoint
DROP TABLE "archived_pets" CASCADE;--> statement-breakpoint
DROP TABLE "archived_medical_records" CASCADE;--> statement-breakpoint
DROP TABLE "archived_invoices" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access kennels" ON "kennels" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage kennels" ON "kennels" CASCADE;--> statement-breakpoint
DROP TABLE "kennels" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet hospitalizations" ON "hospitalizations" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access hospitalizations" ON "hospitalizations" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage hospitalizations" ON "hospitalizations" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalizations" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view vitals" ON "hospitalization_vitals" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access vitals" ON "hospitalization_vitals" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage vitals" ON "hospitalization_vitals" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalization_vitals" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access medications" ON "hospitalization_medications" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage medications" ON "hospitalization_medications" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalization_medications" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access treatments" ON "hospitalization_treatments" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage treatments" ON "hospitalization_treatments" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalization_treatments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access feedings" ON "hospitalization_feedings" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage feedings" ON "hospitalization_feedings" CASCADE;--> statement-breakpoint
DROP TABLE "hospitalization_feedings" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage campaign_items" ON "store_campaign_items" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access campaign items" ON "store_campaign_items" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access campaign_items" ON "store_campaign_items" CASCADE;--> statement-breakpoint
DROP TABLE "store_campaign_items" CASCADE;--> statement-breakpoint
DROP TABLE "audit_log_enhanced" CASCADE;--> statement-breakpoint
DROP TABLE "audit_configuration" CASCADE;--> statement-breakpoint
DROP TABLE "security_events" CASCADE;--> statement-breakpoint
DROP TABLE "data_access_log" CASCADE;--> statement-breakpoint
DROP TABLE "materialized_view_refresh_log" CASCADE;--> statement-breakpoint
DROP TABLE "scheduled_job_log" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access loyalty rules" ON "loyalty_rules" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage loyalty rules" ON "loyalty_rules" CASCADE;--> statement-breakpoint
DROP TABLE "loyalty_rules" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view active subcategories" ON "store_subcategories" CASCADE;--> statement-breakpoint
DROP TABLE "store_subcategories" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access comments" ON "lab_result_comments" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage comments" ON "lab_result_comments" CASCADE;--> statement-breakpoint
DROP TABLE "lab_result_comments" CASCADE;--> statement-breakpoint
DROP POLICY "Public read lab tests" ON "lab_test_catalog" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access lab tests" ON "lab_test_catalog" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage tenant tests" ON "lab_test_catalog" CASCADE;--> statement-breakpoint
DROP TABLE "lab_test_catalog" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view active variants" ON "store_product_variants" CASCADE;--> statement-breakpoint
DROP TABLE "store_product_variants" CASCADE;--> statement-breakpoint
DROP POLICY "Public read lab panels" ON "lab_panels" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access panels" ON "lab_panels" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage panels" ON "lab_panels" CASCADE;--> statement-breakpoint
DROP TABLE "lab_panels" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet lab orders" ON "lab_orders" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access lab orders" ON "lab_orders" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage lab orders" ON "lab_orders" CASCADE;--> statement-breakpoint
DROP TABLE "lab_orders" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view order items" ON "lab_order_items" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access order items" ON "lab_order_items" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage order items" ON "lab_order_items" CASCADE;--> statement-breakpoint
DROP TABLE "lab_order_items" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view results" ON "lab_results" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access results" ON "lab_results" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage results" ON "lab_results" CASCADE;--> statement-breakpoint
DROP TABLE "lab_results" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view attachments" ON "lab_result_attachments" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access attachments" ON "lab_result_attachments" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage attachments" ON "lab_result_attachments" CASCADE;--> statement-breakpoint
DROP TABLE "lab_result_attachments" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own credits" ON "client_credits" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access credits" ON "client_credits" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage credits" ON "client_credits" CASCADE;--> statement-breakpoint
DROP TABLE "client_credits" CASCADE;--> statement-breakpoint
DROP POLICY "Public read providers" ON "insurance_providers" CASCADE;--> statement-breakpoint
DROP POLICY "Service role manage providers" ON "insurance_providers" CASCADE;--> statement-breakpoint
DROP TABLE "insurance_providers" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet policies" ON "insurance_policies" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access policies" ON "insurance_policies" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage policies" ON "insurance_policies" CASCADE;--> statement-breakpoint
DROP TABLE "insurance_policies" CASCADE;--> statement-breakpoint
DROP POLICY "Owners view pet claims" ON "insurance_claims" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access claims" ON "insurance_claims" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage claims" ON "insurance_claims" CASCADE;--> statement-breakpoint
DROP TABLE "insurance_claims" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access claim items" ON "insurance_claim_items" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage claim items" ON "insurance_claim_items" CASCADE;--> statement-breakpoint
DROP TABLE "insurance_claim_items" CASCADE;--> statement-breakpoint
DROP POLICY "Clients create conversations" ON "conversations" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own conversations" ON "conversations" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access conversations" ON "conversations" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage conversations" ON "conversations" CASCADE;--> statement-breakpoint
DROP TABLE "conversations" CASCADE;--> statement-breakpoint
DROP POLICY "Clients send messages" ON "messages" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own messages" ON "messages" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access messages" ON "messages" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage messages" ON "messages" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
DROP POLICY "Read templates" ON "message_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Service role manage templates" ON "message_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage templates" ON "message_templates" CASCADE;--> statement-breakpoint
DROP TABLE "message_templates" CASCADE;--> statement-breakpoint
DROP POLICY "Clients view own reminders" ON "reminders" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access reminders" ON "reminders" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage reminders" ON "reminders" CASCADE;--> statement-breakpoint
DROP TABLE "reminders" CASCADE;--> statement-breakpoint
DROP POLICY "Public log scans" ON "qr_tag_scans" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access scans" ON "qr_tag_scans" CASCADE;--> statement-breakpoint
DROP TABLE "qr_tag_scans" CASCADE;--> statement-breakpoint
DROP POLICY "Admin manage all profiles" ON "staff_profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access staff profiles" ON "staff_profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage own profile" ON "staff_profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Staff view all profiles" ON "staff_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "staff_profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Admin manage schedules" ON "staff_schedules" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access schedules" ON "staff_schedules" CASCADE;--> statement-breakpoint
DROP POLICY "Staff view schedules" ON "staff_schedules" CASCADE;--> statement-breakpoint
DROP TABLE "staff_schedules" CASCADE;--> statement-breakpoint
DROP POLICY "Access schedule entries" ON "staff_schedule_entries" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access entries" ON "staff_schedule_entries" CASCADE;--> statement-breakpoint
DROP TABLE "staff_schedule_entries" CASCADE;--> statement-breakpoint
DROP POLICY "Admin manage time off types" ON "time_off_types" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access time off types" ON "time_off_types" CASCADE;--> statement-breakpoint
DROP POLICY "Staff view time off types" ON "time_off_types" CASCADE;--> statement-breakpoint
DROP TABLE "time_off_types" CASCADE;--> statement-breakpoint
DROP POLICY "Admin manage time off" ON "staff_time_off" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access time off" ON "staff_time_off" CASCADE;--> statement-breakpoint
DROP POLICY "Staff request time off" ON "staff_time_off" CASCADE;--> statement-breakpoint
DROP POLICY "Staff view own time off" ON "staff_time_off" CASCADE;--> statement-breakpoint
DROP TABLE "staff_time_off" CASCADE;--> statement-breakpoint
DROP POLICY "Clinic staff manage clinic memberships" ON "clinic_profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access clinic_profiles" ON "clinic_profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users view own clinic memberships" ON "clinic_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "clinic_profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access queue" ON "notification_queue" CASCADE;--> statement-breakpoint
DROP POLICY "Staff manage queue" ON "notification_queue" CASCADE;--> statement-breakpoint
DROP TABLE "notification_queue" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access price history" ON "store_price_history" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access price_history" ON "store_price_history" CASCADE;--> statement-breakpoint
DROP TABLE "store_price_history" CASCADE;--> statement-breakpoint
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_id_format";--> statement-breakpoint
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_id_length";--> statement-breakpoint
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_name_length";--> statement-breakpoint
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_plan_check";--> statement-breakpoint
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_settings_is_object";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_email_format";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_name_length";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_phone_length";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_preferred_contact_check";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_role_check";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_staff_requires_info";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_deleted_by_fkey";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_tenant_id_fkey";
--> statement-breakpoint
DROP INDEX "idx_tenants_active";--> statement-breakpoint
DROP INDEX "idx_tenants_name";--> statement-breakpoint
DROP INDEX "idx_tenants_plan";--> statement-breakpoint
DROP INDEX "idx_tenants_settings_gin";--> statement-breakpoint
DROP INDEX "idx_profiles_client_list";--> statement-breakpoint
DROP INDEX "idx_profiles_deleted";--> statement-breakpoint
DROP INDEX "idx_profiles_email";--> statement-breakpoint
DROP INDEX "idx_profiles_email_lower";--> statement-breakpoint
DROP INDEX "idx_profiles_name_search";--> statement-breakpoint
DROP INDEX "idx_profiles_role";--> statement-breakpoint
DROP INDEX "idx_profiles_specializations_gin";--> statement-breakpoint
DROP INDEX "idx_profiles_staff_list";--> statement-breakpoint
DROP INDEX "idx_profiles_staff_lookup";--> statement-breakpoint
DROP INDEX "idx_profiles_tenant";--> statement-breakpoint
DROP INDEX "idx_profiles_tenant_role";--> statement-breakpoint
DROP INDEX "idx_profiles_unique_email_per_tenant";--> statement-breakpoint
DROP INDEX "idx_unique_client_code";--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "features_enabled" SET DEFAULT '{"core"}';--> statement-breakpoint
ALTER TABLE "system_configs" ADD CONSTRAINT "system_configs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_deleted_by_profiles_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
DROP POLICY "Authenticated users view own tenant" ON "tenants" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access" ON "tenants" CASCADE;--> statement-breakpoint
DROP POLICY "Service role full access" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Staff update tenant profiles" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Staff view tenant profiles" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users insert own profile" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users update own profile" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "Users view own profile" ON "profiles" CASCADE;--> statement-breakpoint
DROP TYPE "public"."acuity_level";--> statement-breakpoint
DROP TYPE "public"."appointment_status";--> statement-breakpoint
DROP TYPE "public"."claim_status";--> statement-breakpoint
DROP TYPE "public"."claim_type";--> statement-breakpoint
DROP TYPE "public"."contact_preference";--> statement-breakpoint
DROP TYPE "public"."conversation_status";--> statement-breakpoint
DROP TYPE "public"."coverage_type";--> statement-breakpoint
DROP TYPE "public"."diagnosis_standard";--> statement-breakpoint
DROP TYPE "public"."discount_type";--> statement-breakpoint
DROP TYPE "public"."expense_category";--> statement-breakpoint
DROP TYPE "public"."growth_percentile";--> statement-breakpoint
DROP TYPE "public"."hospitalization_status";--> statement-breakpoint
DROP TYPE "public"."inventory_transaction_type";--> statement-breakpoint
DROP TYPE "public"."invite_status";--> statement-breakpoint
DROP TYPE "public"."invoice_status";--> statement-breakpoint
DROP TYPE "public"."lab_order_status";--> statement-breakpoint
DROP TYPE "public"."loyalty_tier";--> statement-breakpoint
DROP TYPE "public"."loyalty_transaction_type";--> statement-breakpoint
DROP TYPE "public"."medical_record_type";--> statement-breakpoint
DROP TYPE "public"."message_channel";--> statement-breakpoint
DROP TYPE "public"."message_status";--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
DROP TYPE "public"."pet_sex";--> statement-breakpoint
DROP TYPE "public"."pet_species";--> statement-breakpoint
DROP TYPE "public"."policy_status";--> statement-breakpoint
DROP TYPE "public"."prescription_status";--> statement-breakpoint
DROP TYPE "public"."service_category";--> statement-breakpoint
DROP TYPE "public"."severity_level";--> statement-breakpoint
DROP TYPE "public"."time_off_status";--> statement-breakpoint
DROP TYPE "public"."time_off_type";--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
DROP TYPE "public"."vaccine_status";--> statement-breakpoint
DROP TYPE "public"."workflow_status";