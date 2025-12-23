-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."acuity_level" AS ENUM('low', 'normal', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('draft', 'submitted', 'under_review', 'approved', 'partially_approved', 'denied', 'paid');--> statement-breakpoint
CREATE TYPE "public"."claim_type" AS ENUM('treatment', 'surgery', 'hospitalization', 'medication', 'diagnostic', 'other');--> statement-breakpoint
CREATE TYPE "public"."contact_preference" AS ENUM('phone', 'email', 'whatsapp', 'sms');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('open', 'pending', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."coverage_type" AS ENUM('basic', 'standard', 'premium', 'comprehensive');--> statement-breakpoint
CREATE TYPE "public"."diagnosis_standard" AS ENUM('venom', 'snomed', 'custom');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount', 'buy_x_get_y');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('supplies', 'utilities', 'payroll', 'rent', 'equipment', 'marketing', 'insurance', 'taxes', 'travel', 'maintenance', 'professional_services', 'training', 'other');--> statement-breakpoint
CREATE TYPE "public"."growth_percentile" AS ENUM('P3', 'P10', 'P25', 'P50', 'P75', 'P90', 'P97');--> statement-breakpoint
CREATE TYPE "public"."hospitalization_status" AS ENUM('admitted', 'in_treatment', 'stable', 'critical', 'discharged', 'transferred', 'deceased');--> statement-breakpoint
CREATE TYPE "public"."inventory_transaction_type" AS ENUM('purchase', 'sale', 'adjustment', 'return', 'transfer', 'waste', 'reservation');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."lab_order_status" AS ENUM('pending', 'collected', 'processing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."loyalty_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."loyalty_transaction_type" AS ENUM('earn', 'redeem', 'expire', 'adjust', 'bonus');--> statement-breakpoint
CREATE TYPE "public"."medical_record_type" AS ENUM('consultation', 'surgery', 'emergency', 'vaccination', 'checkup', 'dental', 'grooming', 'lab_result', 'imaging', 'other');--> statement-breakpoint
CREATE TYPE "public"."message_channel" AS ENUM('internal', 'whatsapp', 'email', 'sms');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."pet_sex" AS ENUM('male', 'female', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."pet_species" AS ENUM('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other');--> statement-breakpoint
CREATE TYPE "public"."policy_status" AS ENUM('pending', 'active', 'expired', 'cancelled', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('draft', 'active', 'dispensed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('consultation', 'vaccination', 'grooming', 'surgery', 'diagnostic', 'dental', 'emergency', 'hospitalization', 'treatment', 'identification', 'other');--> statement-breakpoint
CREATE TYPE "public"."severity_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."time_off_status" AS ENUM('pending', 'approved', 'denied', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."time_off_type" AS ENUM('vacation', 'sick', 'personal', 'maternity', 'paternity', 'unpaid', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'vet', 'admin');--> statement-breakpoint
CREATE TYPE "public"."vaccine_status" AS ENUM('scheduled', 'completed', 'missed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('draft', 'pending', 'active', 'completed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"phone" text,
	"whatsapp" text,
	"email" text,
	"address" text,
	"city" text,
	"country" text DEFAULT 'Paraguay',
	"ruc" text,
	"logo_url" text,
	"website_url" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"business_hours" jsonb DEFAULT '{}'::jsonb,
	"features_enabled" text[] DEFAULT '{"RAY['core'::tex"}',
	"plan" text DEFAULT 'free',
	"plan_expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_id_format" CHECK (id ~ '^[a-z][a-z0-9_-]*$'::text),
	CONSTRAINT "tenants_id_length" CHECK ((char_length(id) >= 2) AND (char_length(id) <= 50)),
	CONSTRAINT "tenants_name_length" CHECK ((char_length(name) >= 2) AND (char_length(name) <= 100)),
	CONSTRAINT "tenants_plan_check" CHECK (plan = ANY (ARRAY['free'::text, 'starter'::text, 'professional'::text, 'enterprise'::text])),
	CONSTRAINT "tenants_settings_is_object" CHECK ((settings IS NULL) OR (jsonb_typeof(settings) = 'object'::text))
);
--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" text,
	"full_name" text,
	"email" text,
	"phone" text,
	"secondary_phone" text,
	"avatar_url" text,
	"role" text DEFAULT 'owner' NOT NULL,
	"client_code" text,
	"address" text,
	"city" text,
	"document_type" text,
	"document_number" text,
	"preferred_contact" text DEFAULT 'phone',
	"notes" text,
	"signature_url" text,
	"license_number" text,
	"specializations" text[],
	"bio" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_format" CHECK ((email IS NULL) OR (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
	CONSTRAINT "profiles_name_length" CHECK ((full_name IS NULL) OR (char_length(full_name) >= 2)),
	CONSTRAINT "profiles_phone_length" CHECK ((phone IS NULL) OR (char_length(phone) >= 6)),
	CONSTRAINT "profiles_preferred_contact_check" CHECK (preferred_contact = ANY (ARRAY['phone'::text, 'email'::text, 'whatsapp'::text, 'sms'::text])),
	CONSTRAINT "profiles_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'vet'::text, 'admin'::text])),
	CONSTRAINT "profiles_staff_requires_info" CHECK ((role = 'owner'::text) OR ((full_name IS NOT NULL) AND (email IS NOT NULL)))
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "demo_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"tenant_id" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"full_name" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demo_accounts_email_key" UNIQUE("email"),
	CONSTRAINT "demo_accounts_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'vet'::text, 'admin'::text]))
);
--> statement-breakpoint
ALTER TABLE "demo_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clinic_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"invited_by" uuid,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + '7 days'::interval),
	"accepted_at" timestamp with time zone,
	"accepted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinic_invites_email_format" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
	CONSTRAINT "clinic_invites_message_length" CHECK ((message IS NULL) OR (char_length(message) <= 500)),
	CONSTRAINT "clinic_invites_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'vet'::text, 'admin'::text])),
	CONSTRAINT "clinic_invites_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "clinic_invites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clinic_patient_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" text NOT NULL,
	"pet_id" uuid NOT NULL,
	"access_level" text DEFAULT 'write',
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinic_patient_access_clinic_id_pet_id_key" UNIQUE("clinic_id","pet_id"),
	CONSTRAINT "clinic_patient_access_access_level_check" CHECK (access_level = ANY (ARRAY['read'::text, 'write'::text]))
);
--> statement-breakpoint
ALTER TABLE "clinic_patient_access" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clinic_product_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"catalog_product_id" uuid NOT NULL,
	"sale_price" numeric(12, 2) NOT NULL,
	"min_stock_level" numeric(12, 2) DEFAULT '0',
	"location" text,
	"requires_prescription" boolean DEFAULT false,
	"margin_percentage" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinic_product_assignments_tenant_id_catalog_product_id_key" UNIQUE("tenant_id","catalog_product_id")
);
--> statement-breakpoint
ALTER TABLE "clinic_product_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"tenant_id" text,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"color" text,
	"sex" text,
	"birth_date" date,
	"birth_date_estimated" boolean DEFAULT false,
	"is_neutered" boolean DEFAULT false,
	"neutered_date" date,
	"weight_kg" numeric(6, 2),
	"weight_updated_at" timestamp with time zone,
	"microchip_number" text,
	"microchip_date" date,
	"registration_number" text,
	"photo_url" text,
	"photos" text[] DEFAULT '{"RAY"}',
	"is_deceased" boolean DEFAULT false,
	"deceased_date" date,
	"deceased_reason" text,
	"blood_type" text,
	"allergies" text[] DEFAULT '{"RAY"}',
	"chronic_conditions" text[] DEFAULT '{"RAY"}',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"diet_category" text,
	"diet_notes" text,
	"temperament" text,
	CONSTRAINT "pets_allergies_limit" CHECK ((allergies IS NULL) OR (array_length(allergies, 1) IS NULL) OR (array_length(allergies, 1) <= 50)),
	CONSTRAINT "pets_birth_not_future" CHECK ((birth_date IS NULL) OR (birth_date <= CURRENT_DATE)),
	CONSTRAINT "pets_conditions_limit" CHECK ((chronic_conditions IS NULL) OR (array_length(chronic_conditions, 1) IS NULL) OR (array_length(chronic_conditions, 1) <= 50)),
	CONSTRAINT "pets_deceased_consistency" CHECK (((is_deceased = false) AND (deceased_date IS NULL)) OR (is_deceased = true)),
	CONSTRAINT "pets_name_length" CHECK ((char_length(name) >= 1) AND (char_length(name) <= 100)),
	CONSTRAINT "pets_neutered_consistency" CHECK (((is_neutered = false) AND (neutered_date IS NULL)) OR (is_neutered = true)),
	CONSTRAINT "pets_sex_check" CHECK (sex = ANY (ARRAY['male'::text, 'female'::text, 'unknown'::text])),
	CONSTRAINT "pets_species_check" CHECK (species = ANY (ARRAY['dog'::text, 'cat'::text, 'bird'::text, 'rabbit'::text, 'hamster'::text, 'fish'::text, 'reptile'::text, 'other'::text])),
	CONSTRAINT "pets_weight_positive" CHECK ((weight_kg IS NULL) OR (weight_kg > (0)::numeric))
);
--> statement-breakpoint
ALTER TABLE "pets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "qr_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"pet_id" uuid,
	"code" text NOT NULL,
	"batch_number" text,
	"batch_id" text,
	"is_registered" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp with time zone,
	"assigned_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_tags_code_key" UNIQUE("code"),
	CONSTRAINT "qr_tags_code_format" CHECK (char_length(code) >= 6)
);
--> statement-breakpoint
ALTER TABLE "qr_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "voice_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"note_text" text,
	"audio_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voice_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "dicom_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"image_oid" text NOT NULL,
	"modality" text,
	"body_part" text,
	"taken_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dicom_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lost_pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"status" text DEFAULT 'lost' NOT NULL,
	"last_seen_location" text,
	"last_seen_lat" numeric(10, 7),
	"last_seen_lng" numeric(10, 7),
	"last_seen_at" timestamp with time zone,
	"reported_by" uuid,
	"contact_phone" text,
	"contact_email" text,
	"found_at" timestamp with time zone,
	"found_location" text,
	"found_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lost_pets_status_check" CHECK (status = ANY (ARRAY['lost'::text, 'found'::text, 'reunited'::text]))
);
--> statement-breakpoint
ALTER TABLE "lost_pets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vaccine_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"name" text NOT NULL,
	"species" text[] NOT NULL,
	"description" text,
	"min_age_weeks" integer,
	"recommended_age_weeks" integer,
	"booster_interval_days" integer,
	"is_required" boolean DEFAULT false,
	"display_order" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vaccine_templates_interval_positive" CHECK ((booster_interval_days IS NULL) OR (booster_interval_days > 0)),
	CONSTRAINT "vaccine_templates_name_length" CHECK ((char_length(name) >= 2) AND (char_length(name) <= 100))
);
--> statement-breakpoint
ALTER TABLE "vaccine_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vaccines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"administered_by_clinic" text,
	"template_id" uuid,
	"administered_by" uuid,
	"name" text NOT NULL,
	"batch_number" text,
	"manufacturer" text,
	"route" text,
	"dosage" text,
	"lot_expiry" date,
	"administered_date" date NOT NULL,
	"next_due_date" date,
	"status" text DEFAULT 'completed' NOT NULL,
	"vet_signature" text,
	"certificate_url" text,
	"adverse_reactions" text,
	"photos" text[] DEFAULT '{"RAY"}',
	"notes" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vaccines_date_order" CHECK ((next_due_date IS NULL) OR (next_due_date > administered_date)),
	CONSTRAINT "vaccines_name_length" CHECK ((char_length(name) >= 2) AND (char_length(name) <= 100)),
	CONSTRAINT "vaccines_route_check" CHECK (route = ANY (ARRAY['oral'::text, 'PO'::text, 'IV'::text, 'IM'::text, 'SC'::text, 'SQ'::text, 'topical'::text, 'inhaled'::text, 'rectal'::text, 'ophthalmic'::text, 'otic'::text])),
	CONSTRAINT "vaccines_status_check" CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'missed'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "vaccines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vaccine_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"vaccine_id" uuid,
	"vaccine_name" text NOT NULL,
	"vaccine_brand" text,
	"reaction_date" date DEFAULT CURRENT_DATE NOT NULL,
	"onset_hours" integer,
	"severity" text DEFAULT 'low' NOT NULL,
	"reaction_type" text,
	"symptoms" text[],
	"treatment" text,
	"outcome" text,
	"hospitalization_required" boolean DEFAULT false,
	"recovery_days" integer,
	"notes" text,
	"reported_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vaccine_reactions_reaction_type_check" CHECK (reaction_type = ANY (ARRAY['local'::text, 'systemic'::text, 'allergic'::text, 'anaphylactic'::text, 'other'::text])),
	CONSTRAINT "vaccine_reactions_severity_check" CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))
);
--> statement-breakpoint
ALTER TABLE "vaccine_reactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "document_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"document_type" text NOT NULL,
	"year" integer NOT NULL,
	"current_sequence" integer DEFAULT 0 NOT NULL,
	"prefix" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_sequences_tenant_id_document_type_year_key" UNIQUE("tenant_id","document_type","year")
);
--> statement-breakpoint
ALTER TABLE "document_sequences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "insurance_preauth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"policy_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"request_number" text,
	"procedure_description" text NOT NULL,
	"estimated_cost" numeric(12, 2),
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_amount" numeric(12, 2),
	"valid_until" date,
	"authorization_code" text,
	"denial_reason" text,
	"submitted_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"submitted_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insurance_preauth_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'submitted'::text, 'approved'::text, 'denied'::text, 'expired'::text]))
);
--> statement-breakpoint
ALTER TABLE "insurance_preauth" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vaccine_protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vaccine_name" text NOT NULL,
	"vaccine_code" text NOT NULL,
	"species" text NOT NULL,
	"type" text NOT NULL,
	"diseases_prevented" text[] NOT NULL,
	"first_dose_weeks" integer,
	"booster_intervals_months" integer[],
	"duration_years" integer,
	"manufacturer" text,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vaccine_protocols_vaccine_code_key" UNIQUE("vaccine_code"),
	CONSTRAINT "vaccine_protocols_species_check" CHECK (species = ANY (ARRAY['dog'::text, 'cat'::text, 'all'::text])),
	CONSTRAINT "vaccine_protocols_type_check" CHECK (type = ANY (ARRAY['core'::text, 'non-core'::text, 'lifestyle'::text]))
);
--> statement-breakpoint
CREATE TABLE "pet_qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"qr_code_url" text NOT NULL,
	"qr_data" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pet_qr_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clinic_pets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"first_visit_date" timestamp with time zone DEFAULT now() NOT NULL,
	"last_visit_date" timestamp with time zone,
	"visit_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinic_pets_pet_id_tenant_id_key" UNIQUE("pet_id","tenant_id")
);
--> statement-breakpoint
ALTER TABLE "clinic_pets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "diagnosis_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"term" text NOT NULL,
	"standard" text DEFAULT 'custom',
	"category" text,
	"description" text,
	"species" text[] DEFAULT '{"RAY['all'::tex"}',
	"severity" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diagnosis_codes_code_key" UNIQUE("code"),
	CONSTRAINT "diagnosis_codes_code_length" CHECK (char_length(code) >= 2),
	CONSTRAINT "diagnosis_codes_severity_check" CHECK (severity = ANY (ARRAY['mild'::text, 'moderate'::text, 'severe'::text, 'critical'::text])),
	CONSTRAINT "diagnosis_codes_standard_check" CHECK (standard = ANY (ARRAY['venom'::text, 'snomed'::text, 'custom'::text])),
	CONSTRAINT "diagnosis_codes_term_length" CHECK (char_length(term) >= 2)
);
--> statement-breakpoint
ALTER TABLE "diagnosis_codes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "drug_dosages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"generic_name" text,
	"species" text DEFAULT 'all',
	"category" text,
	"min_dose_mg_kg" numeric(10, 2),
	"max_dose_mg_kg" numeric(10, 2),
	"concentration_mg_ml" numeric(10, 2),
	"route" text,
	"frequency" text,
	"max_daily_dose_mg_kg" numeric(10, 2),
	"contraindications" text[],
	"side_effects" text[],
	"notes" text,
	"requires_prescription" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drug_dosages_name_species_key" UNIQUE("name","species"),
	CONSTRAINT "drug_dosages_category_check" CHECK (category = ANY (ARRAY['antibiotic'::text, 'analgesic'::text, 'nsaid'::text, 'corticosteroid'::text, 'antiemetic'::text, 'cardiac'::text, 'antifungal'::text, 'antiparasitic'::text, 'sedative'::text, 'steroid'::text, 'heartworm'::text, 'vaccine'::text, 'other'::text])),
	CONSTRAINT "drug_dosages_concentration_mg_ml_check" CHECK ((concentration_mg_ml IS NULL) OR (concentration_mg_ml > (0)::numeric)),
	CONSTRAINT "drug_dosages_dose_order" CHECK ((min_dose_mg_kg IS NULL) OR (max_dose_mg_kg IS NULL) OR (max_dose_mg_kg >= min_dose_mg_kg)),
	CONSTRAINT "drug_dosages_max_daily_dose_mg_kg_check" CHECK ((max_daily_dose_mg_kg IS NULL) OR (max_daily_dose_mg_kg >= (0)::numeric)),
	CONSTRAINT "drug_dosages_max_dose_mg_kg_check" CHECK ((max_dose_mg_kg IS NULL) OR (max_dose_mg_kg >= (0)::numeric)),
	CONSTRAINT "drug_dosages_min_dose_mg_kg_check" CHECK ((min_dose_mg_kg IS NULL) OR (min_dose_mg_kg >= (0)::numeric)),
	CONSTRAINT "drug_dosages_name_length" CHECK (char_length(name) >= 2),
	CONSTRAINT "drug_dosages_route_check" CHECK ((route IS NULL) OR (route = ANY (ARRAY['oral'::text, 'PO'::text, 'IV'::text, 'IM'::text, 'SC'::text, 'SQ'::text, 'topical'::text, 'inhaled'::text, 'rectal'::text, 'ophthalmic'::text, 'otic'::text]))),
	CONSTRAINT "drug_dosages_species_check" CHECK (species = ANY (ARRAY['dog'::text, 'cat'::text, 'bird'::text, 'rabbit'::text, 'all'::text]))
);
--> statement-breakpoint
ALTER TABLE "drug_dosages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "growth_standards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"species" text DEFAULT 'dog' NOT NULL,
	"breed" text,
	"breed_category" text,
	"gender" text,
	"age_weeks" integer NOT NULL,
	"weight_kg" numeric(10, 2) NOT NULL,
	"percentile" text DEFAULT 'P50',
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "growth_standards_species_breed_gender_age_weeks_percentile_key" UNIQUE("species","breed","gender","age_weeks","percentile"),
	CONSTRAINT "growth_standards_age_weeks_check" CHECK (age_weeks >= 0),
	CONSTRAINT "growth_standards_gender_check" CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
	CONSTRAINT "growth_standards_percentile_check" CHECK (percentile = ANY (ARRAY['P3'::text, 'P10'::text, 'P25'::text, 'P50'::text, 'P75'::text, 'P90'::text, 'P97'::text])),
	CONSTRAINT "growth_standards_species_check" CHECK (species = ANY (ARRAY['dog'::text, 'cat'::text])),
	CONSTRAINT "growth_standards_weight_kg_check" CHECK (weight_kg > (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "growth_standards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reproductive_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"cycle_type" text DEFAULT 'heat' NOT NULL,
	"cycle_start" timestamp with time zone NOT NULL,
	"cycle_end" timestamp with time zone,
	"mating_date" date,
	"expected_due_date" date,
	"actual_birth_date" date,
	"litter_size" integer,
	"notes" text,
	"recorded_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reproductive_cycles_cycle_type_check" CHECK (cycle_type = ANY (ARRAY['heat'::text, 'pregnancy'::text, 'lactation'::text, 'anestrus'::text])),
	CONSTRAINT "reproductive_cycles_dates" CHECK ((cycle_end IS NULL) OR (cycle_end >= cycle_start)),
	CONSTRAINT "reproductive_cycles_litter_size_check" CHECK ((litter_size IS NULL) OR (litter_size >= 0))
);
--> statement-breakpoint
ALTER TABLE "reproductive_cycles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "euthanasia_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"hurt_score" integer NOT NULL,
	"hunger_score" integer NOT NULL,
	"hydration_score" integer NOT NULL,
	"hygiene_score" integer NOT NULL,
	"happiness_score" integer NOT NULL,
	"mobility_score" integer NOT NULL,
	"more_good_days_score" integer NOT NULL,
	"total_score" integer NOT NULL,
	"notes" text,
	"recommendations" text,
	"assessed_by" uuid,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "euthanasia_assessments_happiness_score_check" CHECK ((happiness_score >= 0) AND (happiness_score <= 10)),
	CONSTRAINT "euthanasia_assessments_hunger_score_check" CHECK ((hunger_score >= 0) AND (hunger_score <= 10)),
	CONSTRAINT "euthanasia_assessments_hurt_score_check" CHECK ((hurt_score >= 0) AND (hurt_score <= 10)),
	CONSTRAINT "euthanasia_assessments_hydration_score_check" CHECK ((hydration_score >= 0) AND (hydration_score <= 10)),
	CONSTRAINT "euthanasia_assessments_hygiene_score_check" CHECK ((hygiene_score >= 0) AND (hygiene_score <= 10)),
	CONSTRAINT "euthanasia_assessments_mobility_score_check" CHECK ((mobility_score >= 0) AND (mobility_score <= 10)),
	CONSTRAINT "euthanasia_assessments_more_good_days_score_check" CHECK ((more_good_days_score >= 0) AND (more_good_days_score <= 10)),
	CONSTRAINT "euthanasia_assessments_total_score_check" CHECK ((total_score >= 0) AND (total_score <= 70))
);
--> statement-breakpoint
ALTER TABLE "euthanasia_assessments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "consent_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"content_html" text NOT NULL,
	"requires_witness" boolean DEFAULT false,
	"validity_days" integer,
	"version" text DEFAULT '1.0',
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consent_templates_tenant_code" UNIQUE("tenant_id","code"),
	CONSTRAINT "consent_templates_global_code" UNIQUE("code"),
	CONSTRAINT "consent_templates_category_check" CHECK (category = ANY (ARRAY['surgical'::text, 'anesthetic'::text, 'diagnostic'::text, 'therapeutic'::text, 'vaccination'::text, 'euthanasia'::text, 'general'::text])),
	CONSTRAINT "consent_templates_code_length" CHECK ((char_length(code) >= 2) AND (char_length(code) <= 50)),
	CONSTRAINT "consent_templates_name_length" CHECK ((char_length(name) >= 2) AND (char_length(name) <= 200)),
	CONSTRAINT "consent_templates_version_format" CHECK (version ~ '^\d+\.\d+$'::text)
);
--> statement-breakpoint
ALTER TABLE "consent_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoice_sequences" (
	"tenant_id" text PRIMARY KEY NOT NULL,
	"prefix" text DEFAULT 'INV',
	"current_number" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"vet_id" uuid,
	"record_type" text NOT NULL,
	"visit_date" timestamp with time zone DEFAULT now() NOT NULL,
	"chief_complaint" text,
	"history" text,
	"physical_exam" text,
	"weight_kg" numeric(6, 2),
	"temperature_celsius" numeric(4, 1),
	"heart_rate_bpm" integer,
	"respiratory_rate_rpm" integer,
	"blood_pressure" text,
	"body_condition_score" integer,
	"diagnosis_code" text,
	"diagnosis_text" text,
	"assessment" text,
	"clinical_notes" text,
	"treatment_plan" text,
	"medications_prescribed" text,
	"followup_date" date,
	"follow_up_notes" text,
	"is_emergency" boolean DEFAULT false,
	"requires_followup" boolean DEFAULT false,
	"notes" text,
	"attachments" text[] DEFAULT '{"RAY"}',
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medical_records_body_condition_score_check" CHECK ((body_condition_score IS NULL) OR ((body_condition_score >= 1) AND (body_condition_score <= 9))),
	CONSTRAINT "medical_records_heart_rate_bpm_check" CHECK ((heart_rate_bpm IS NULL) OR ((heart_rate_bpm >= 20) AND (heart_rate_bpm <= 400))),
	CONSTRAINT "medical_records_record_type_check" CHECK (record_type = ANY (ARRAY['consultation'::text, 'surgery'::text, 'emergency'::text, 'vaccination'::text, 'checkup'::text, 'dental'::text, 'grooming'::text, 'lab_result'::text, 'imaging'::text, 'follow_up'::text, 'other'::text])),
	CONSTRAINT "medical_records_respiratory_rate_rpm_check" CHECK ((respiratory_rate_rpm IS NULL) OR ((respiratory_rate_rpm >= 5) AND (respiratory_rate_rpm <= 150))),
	CONSTRAINT "medical_records_temperature_celsius_check" CHECK ((temperature_celsius IS NULL) OR ((temperature_celsius >= (30)::numeric) AND (temperature_celsius <= (45)::numeric))),
	CONSTRAINT "medical_records_visit_not_future" CHECK (visit_date <= (now() + '1 day'::interval)),
	CONSTRAINT "medical_records_weight_kg_check" CHECK ((weight_kg IS NULL) OR (weight_kg > (0)::numeric))
);
--> statement-breakpoint
ALTER TABLE "medical_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"vet_id" uuid NOT NULL,
	"medical_record_id" uuid,
	"prescription_number" text NOT NULL,
	"prescribed_date" date DEFAULT CURRENT_DATE NOT NULL,
	"valid_until" date,
	"medications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"signature_url" text,
	"signed_at" timestamp with time zone,
	"status" text DEFAULT 'active',
	"pdf_url" text,
	"notes" text,
	"pharmacist_notes" text,
	"dispensing_notes" text,
	"dispensed_at" timestamp with time zone,
	"dispensed_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prescriptions_tenant_id_prescription_number_key" UNIQUE("tenant_id","prescription_number"),
	CONSTRAINT "prescriptions_medications_is_array" CHECK (jsonb_typeof(medications) = 'array'::text),
	CONSTRAINT "prescriptions_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'dispensed'::text, 'expired'::text, 'cancelled'::text])),
	CONSTRAINT "prescriptions_valid_until_after_prescribed" CHECK ((valid_until IS NULL) OR (valid_until >= prescribed_date))
);
--> statement-breakpoint
ALTER TABLE "prescriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"channel_type" text NOT NULL,
	"name" text NOT NULL,
	"config" jsonb,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_channels_tenant_id_channel_type_key" UNIQUE("tenant_id","channel_type"),
	CONSTRAINT "notification_channels_channel_type_check" CHECK (channel_type = ANY (ARRAY['email'::text, 'sms'::text, 'whatsapp'::text, 'push'::text, 'in_app'::text]))
);
--> statement-breakpoint
ALTER TABLE "notification_channels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"channel_type" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_tenant_id_type_channel_type_key" UNIQUE("tenant_id","type","channel_type"),
	CONSTRAINT "notification_templates_channel_type_check" CHECK (channel_type = ANY (ARRAY['email'::text, 'sms'::text, 'whatsapp'::text, 'push'::text, 'in_app'::text])),
	CONSTRAINT "notification_templates_type_check" CHECK (type = ANY (ARRAY['vaccine_reminder'::text, 'vaccine_overdue'::text, 'appointment_reminder'::text, 'appointment_confirmation'::text, 'appointment_cancelled'::text, 'invoice_sent'::text, 'payment_received'::text, 'payment_overdue'::text, 'birthday'::text, 'follow_up'::text, 'lab_results_ready'::text, 'hospitalization_update'::text, 'custom'::text]))
);
--> statement-breakpoint
ALTER TABLE "notification_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"vaccine_reminders" boolean DEFAULT true,
	"appointment_reminders" boolean DEFAULT true,
	"payment_reminders" boolean DEFAULT true,
	"promotional" boolean DEFAULT false,
	"birthday_greetings" boolean DEFAULT true,
	"preferred_channels" text[] DEFAULT '{"RAY['sms'::text","'email'::tex"}',
	"preferred_phone" text,
	"preferred_email" text,
	"reminder_days_before" integer DEFAULT 3,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_client_id_key" UNIQUE("client_id")
);
--> statement-breakpoint
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"queue_id" uuid,
	"reminder_id" uuid,
	"client_id" uuid NOT NULL,
	"channel_type" text NOT NULL,
	"destination" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notification_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reminder_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"days_offset" integer NOT NULL,
	"time_of_day" time DEFAULT '09:00:00',
	"channels" text[] DEFAULT '{"RAY['sms'::tex"}',
	"conditions" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reminder_rules_type_check" CHECK (type = ANY (ARRAY['vaccine_due'::text, 'vaccine_overdue'::text, 'appointment_before'::text, 'birthday'::text, 'follow_up_after_visit'::text, 'wellness_checkup'::text]))
);
--> statement-breakpoint
ALTER TABLE "reminder_rules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'PYG' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '10.00',
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"buffer_minutes" integer DEFAULT 0,
	"max_daily_bookings" integer,
	"requires_appointment" boolean DEFAULT true,
	"available_days" integer[] DEFAULT '{RAY[1,2,3,4,}',
	"available_start_time" time DEFAULT '08:00:00',
	"available_end_time" time DEFAULT '18:00:00',
	"requires_deposit" boolean DEFAULT false,
	"deposit_percentage" numeric(5, 2),
	"species_allowed" text[],
	"display_order" integer DEFAULT 100,
	"is_featured" boolean DEFAULT false,
	"icon" text,
	"color" text,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_base_price_check" CHECK (base_price >= (0)::numeric),
	CONSTRAINT "services_buffer_minutes_check" CHECK (buffer_minutes >= 0),
	CONSTRAINT "services_buffer_non_negative" CHECK ((buffer_minutes IS NULL) OR (buffer_minutes >= 0)),
	CONSTRAINT "services_category_check" CHECK (category = ANY (ARRAY['consultation'::text, 'vaccination'::text, 'grooming'::text, 'surgery'::text, 'diagnostic'::text, 'dental'::text, 'emergency'::text, 'hospitalization'::text, 'treatment'::text, 'identification'::text, 'other'::text])),
	CONSTRAINT "services_deposit_percentage_check" CHECK ((deposit_percentage IS NULL) OR ((deposit_percentage >= (0)::numeric) AND (deposit_percentage <= (100)::numeric))),
	CONSTRAINT "services_duration_minutes_check" CHECK (duration_minutes > 0),
	CONSTRAINT "services_max_daily_bookings_check" CHECK ((max_daily_bookings IS NULL) OR (max_daily_bookings > 0)),
	CONSTRAINT "services_name_length" CHECK ((char_length(name) >= 2) AND (char_length(name) <= 100)),
	CONSTRAINT "services_tax_rate_check" CHECK ((tax_rate >= (0)::numeric) AND (tax_rate <= (100)::numeric)),
	CONSTRAINT "services_tax_rate_valid" CHECK ((tax_rate IS NULL) OR ((tax_rate >= (0)::numeric) AND (tax_rate <= (100)::numeric))),
	CONSTRAINT "services_time_order" CHECK (available_start_time < available_end_time)
);
--> statement-breakpoint
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"pet_id" uuid NOT NULL,
	"service_id" uuid,
	"vet_id" uuid,
	"created_by" uuid,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"reason" text,
	"notes" text,
	"internal_notes" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancellation_reason" text,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_duration_matches" CHECK ((EXTRACT(epoch FROM (end_time - start_time)) / (60)::numeric) = (duration_minutes)::numeric),
	CONSTRAINT "appointments_duration_minutes_check" CHECK (duration_minutes > 0),
	CONSTRAINT "appointments_status_check" CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'checked_in'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])),
	CONSTRAINT "appointments_time_order" CHECK (end_time > start_time)
);
--> statement-breakpoint
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"name" text NOT NULL,
	"legal_name" text,
	"tax_id" text,
	"contact_info" jsonb DEFAULT '{}'::jsonb,
	"website" text,
	"supplier_type" text DEFAULT 'products',
	"is_platform_provider" boolean DEFAULT false,
	"minimum_order_amount" numeric(12, 2),
	"payment_terms" text,
	"delivery_time_days" integer,
	"verification_status" text DEFAULT 'pending',
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_supplier_type_check" CHECK (supplier_type = ANY (ARRAY['products'::text, 'services'::text, 'both'::text])),
	CONSTRAINT "suppliers_verification_status_check" CHECK (verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text]))
);
--> statement-breakpoint
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalization_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"visitor_name" text NOT NULL,
	"visitor_relationship" text,
	"visit_start" timestamp with time zone NOT NULL,
	"visit_end" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hospitalization_visits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalization_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"title" text NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "hospitalization_documents_document_type_check" CHECK (document_type = ANY (ARRAY['consent'::text, 'treatment_plan'::text, 'discharge_summary'::text, 'lab_result'::text, 'image'::text, 'other'::text]))
);
--> statement-breakpoint
ALTER TABLE "hospitalization_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"level" integer DEFAULT 1,
	"image_url" text,
	"display_order" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"is_global_catalog" boolean DEFAULT false,
	"created_by_tenant_id" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_categories_level_check" CHECK ((level >= 1) AND (level <= 5))
);
--> statement-breakpoint
ALTER TABLE "store_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo_url" text,
	"website" text,
	"country_origin" text,
	"is_active" boolean DEFAULT true,
	"is_global_catalog" boolean DEFAULT false,
	"created_by_tenant_id" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_brands" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"category_id" uuid,
	"brand_id" uuid,
	"sku" text,
	"barcode" text,
	"name" text NOT NULL,
	"description" text,
	"short_description" text,
	"purchase_unit" text DEFAULT 'Unidad',
	"sale_unit" text DEFAULT 'Unidad',
	"conversion_factor" numeric(12, 4) DEFAULT '1',
	"purchase_price" numeric(12, 2),
	"unit_cost" numeric(12, 4) GENERATED ALWAYS AS (
CASE
    WHEN ((purchase_price IS NOT NULL) AND (conversion_factor > (0)::numeric)) THEN (purchase_price / conversion_factor)
    ELSE NULL::numeric
END) STORED,
	"base_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"sale_price" numeric(12, 2),
	"cost_price" numeric(12, 2),
	"default_supplier_id" uuid,
	"image_url" text,
	"images" text[] DEFAULT '{""}',
	"weight_grams" numeric(10, 2),
	"dimensions" jsonb,
	"attributes" jsonb DEFAULT '{}'::jsonb,
	"target_species" text[],
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"requires_prescription" boolean DEFAULT false,
	"display_order" integer DEFAULT 100,
	"is_global_catalog" boolean DEFAULT false,
	"created_by_tenant_id" text,
	"verification_status" text DEFAULT 'pending',
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"meta_title" text,
	"meta_description" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_products_base_price_check" CHECK (base_price >= (0)::numeric),
	CONSTRAINT "store_products_conversion_factor_check" CHECK (conversion_factor > (0)::numeric),
	CONSTRAINT "store_products_cost_price_check" CHECK ((cost_price IS NULL) OR (cost_price >= (0)::numeric)),
	CONSTRAINT "store_products_purchase_price_check" CHECK ((purchase_price IS NULL) OR (purchase_price >= (0)::numeric)),
	CONSTRAINT "store_products_purchase_unit_check" CHECK (purchase_unit = ANY (ARRAY['Unidad'::text, 'Caja'::text, 'Pack'::text, 'Bolsa'::text, 'Frasco'::text, 'Bulto'::text, 'Display'::text, 'Blister'::text, 'Paquete'::text, 'Kg'::text, 'L'::text])),
	CONSTRAINT "store_products_sale_price_check" CHECK ((sale_price IS NULL) OR (sale_price >= (0)::numeric)),
	CONSTRAINT "store_products_sale_unit_check" CHECK (sale_unit = ANY (ARRAY['Unidad'::text, 'Tableta'::text, 'Ampolla'::text, 'Cápsula'::text, 'Comprimido'::text, 'ml'::text, 'g'::text, 'Kg'::text, 'Dosis'::text, 'Aplicación'::text, 'Bolsa'::text, 'Frasco'::text, 'Caja'::text, 'Sobre'::text, 'Pipeta'::text])),
	CONSTRAINT "store_products_verification_status_check" CHECK (verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'needs_review'::text]))
);
--> statement-breakpoint
ALTER TABLE "store_products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"stock_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"reserved_quantity" numeric(12, 2) DEFAULT '0',
	"available_quantity" numeric(12, 2) GENERATED ALWAYS AS ((stock_quantity - reserved_quantity)) STORED,
	"min_stock_level" numeric(12, 2) DEFAULT '0',
	"reorder_quantity" numeric(12, 2),
	"reorder_point" numeric(12, 2),
	"weighted_average_cost" numeric(12, 2) DEFAULT '0',
	"location" text,
	"bin_number" text,
	"batch_number" text,
	"expiry_date" date,
	"supplier_name" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_inventory_product_id_key" UNIQUE("product_id"),
	CONSTRAINT "store_inventory_reserved_quantity_check" CHECK (reserved_quantity >= (0)::numeric),
	CONSTRAINT "store_inventory_reserved_valid" CHECK (COALESCE(reserved_quantity, (0)::numeric) <= stock_quantity),
	CONSTRAINT "store_inventory_stock_non_negative" CHECK (stock_quantity >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "store_inventory" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_test_panels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"panel_price" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "lab_test_panels_tenant_id_code_key" UNIQUE("tenant_id","code")
);
--> statement-breakpoint
ALTER TABLE "lab_test_panels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_panel_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"panel_id" uuid NOT NULL,
	"test_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0,
	CONSTRAINT "lab_panel_tests_panel_id_test_id_key" UNIQUE("panel_id","test_id")
);
--> statement-breakpoint
ALTER TABLE "lab_panel_tests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_reference_ranges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"age_min_months" integer,
	"age_max_months" integer,
	"sex" text,
	"component_name" text DEFAULT 'result' NOT NULL,
	"unit" text NOT NULL,
	"range_low" numeric(12, 4),
	"range_high" numeric(12, 4),
	"critical_low" numeric(12, 4),
	"critical_high" numeric(12, 4),
	"decimal_places" integer DEFAULT 2,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "lab_reference_ranges_sex_check" CHECK (sex = ANY (ARRAY['male'::text, 'female'::text, 'neutered_male'::text, 'neutered_female'::text]))
);
--> statement-breakpoint
ALTER TABLE "lab_reference_ranges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "external_lab_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"lab_name" text NOT NULL,
	"lab_code" text NOT NULL,
	"api_endpoint" text,
	"credentials" jsonb DEFAULT '{}'::jsonb,
	"test_mappings" jsonb DEFAULT '{}'::jsonb,
	"species_mappings" jsonb DEFAULT '{}'::jsonb,
	"auto_send_orders" boolean DEFAULT false,
	"auto_receive_results" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"last_sync_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "external_lab_integrations_tenant_id_lab_code_key" UNIQUE("tenant_id","lab_code")
);
--> statement-breakpoint
ALTER TABLE "external_lab_integrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"campaign_type" text DEFAULT 'sale',
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"discount_type" text,
	"discount_value" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_campaigns_campaign_type_check" CHECK (campaign_type = ANY (ARRAY['sale'::text, 'bogo'::text, 'bundle'::text, 'flash'::text, 'seasonal'::text])),
	CONSTRAINT "store_campaigns_dates" CHECK (end_date > start_date),
	CONSTRAINT "store_campaigns_discount_type_check" CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text]))
);
--> statement-breakpoint
ALTER TABLE "store_campaigns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text,
	"description" text,
	"type" text NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"minimum_order_amount" numeric(12, 2),
	"applicable_categories" uuid[],
	"applicable_products" uuid[],
	"usage_limit" integer,
	"usage_limit_per_user" integer,
	"used_count" integer DEFAULT 0,
	"starts_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_coupons_tenant_id_code_key" UNIQUE("tenant_id","code"),
	CONSTRAINT "store_coupons_type_check" CHECK (type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text, 'free_shipping'::text])),
	CONSTRAINT "store_coupons_value_check" CHECK (value > (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "store_coupons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"order_number" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"shipping_cost" numeric(12, 2) DEFAULT '0',
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_address" jsonb,
	"shipping_method" text,
	"tracking_number" text,
	"payment_status" text DEFAULT 'pending',
	"payment_method" text,
	"payment_reference" text,
	"coupon_id" uuid,
	"coupon_code" text,
	"customer_notes" text,
	"internal_notes" text,
	"confirmed_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancellation_reason" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_orders_tenant_id_order_number_key" UNIQUE("tenant_id","order_number"),
	CONSTRAINT "store_orders_payment_status_check" CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
	CONSTRAINT "store_orders_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'ready'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'refunded'::text]))
);
--> statement-breakpoint
ALTER TABLE "store_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"total_price" numeric(12, 2) NOT NULL,
	"product_name" text NOT NULL,
	"product_sku" text,
	"product_image_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_order_items_quantity_check" CHECK (quantity > (0)::numeric),
	CONSTRAINT "store_order_items_unit_price_check" CHECK (unit_price >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "store_order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "consent_template_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"field_name" text NOT NULL,
	"field_label" text NOT NULL,
	"field_type" text NOT NULL,
	"is_required" boolean DEFAULT false,
	"default_value" text,
	"options" jsonb,
	"validation_regex" text,
	"min_length" integer,
	"max_length" integer,
	"display_order" integer DEFAULT 0,
	"help_text" text,
	"placeholder" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "consent_template_fields_field_type_check" CHECK (field_type = ANY (ARRAY['text'::text, 'number'::text, 'date'::text, 'checkbox'::text, 'radio'::text, 'select'::text, 'textarea'::text, 'signature'::text]))
);
--> statement-breakpoint
ALTER TABLE "consent_template_fields" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "consent_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consent_document_id" uuid NOT NULL,
	"action" text NOT NULL,
	"performed_by" uuid,
	"performed_by_name" text,
	"details" jsonb DEFAULT '{}'::jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "consent_audit_log_action_check" CHECK (action = ANY (ARRAY['created'::text, 'viewed'::text, 'signed'::text, 'witnessed'::text, 'revoked'::text, 'expired'::text, 'pdf_generated'::text, 'pdf_downloaded'::text, 'emailed'::text, 'printed'::text]))
);
--> statement-breakpoint
ALTER TABLE "consent_audit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "consent_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"template_id" uuid NOT NULL,
	"request_token" text DEFAULT encode(gen_random_bytes(32), 'hex'::text) NOT NULL,
	"pet_id" uuid,
	"appointment_id" uuid,
	"recipient_name" text NOT NULL,
	"recipient_email" text,
	"recipient_phone" text,
	"prefilled_data" jsonb DEFAULT '{}'::jsonb,
	"requested_by" uuid,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"reminder_sent_at" timestamp with time zone,
	"status" text DEFAULT 'pending' NOT NULL,
	"consent_document_id" uuid,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "consent_requests_request_token_key" UNIQUE("request_token"),
	CONSTRAINT "consent_requests_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'viewed'::text, 'signed'::text, 'expired'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "consent_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "blanket_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"consent_type" text NOT NULL,
	"pet_id" uuid,
	"max_amount" numeric(12, 2),
	"valid_procedures" text[],
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"signature_data" text,
	"consent_document_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "blanket_consents_tenant_id_owner_id_consent_type_pet_id_key" UNIQUE("tenant_id","owner_id","consent_type","pet_id"),
	CONSTRAINT "blanket_consents_consent_type_check" CHECK (consent_type = ANY (ARRAY['emergency_treatment'::text, 'routine_care'::text, 'vaccination'::text, 'diagnostic_imaging'::text, 'blood_work'::text, 'medication'::text, 'minor_procedures'::text, 'communication'::text, 'photo_release'::text]))
);
--> statement-breakpoint
ALTER TABLE "blanket_consents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"order_id" uuid,
	"rating" integer NOT NULL,
	"title" text,
	"content" text,
	"is_approved" boolean DEFAULT false,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_reviews_product_id_customer_id_key" UNIQUE("product_id","customer_id"),
	CONSTRAINT "store_reviews_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
ALTER TABLE "store_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_wishlist_customer_id_product_id_key" UNIQUE("customer_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "store_wishlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "procurement_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"raw_product_name" text NOT NULL,
	"raw_brand_name" text,
	"raw_supplier_name" text,
	"raw_price_paid" numeric(12, 2),
	"raw_quantity" numeric(12, 2),
	"raw_unit" text,
	"raw_invoice_date" date,
	"raw_data" jsonb,
	"matched_product_id" uuid,
	"matched_brand_id" uuid,
	"matched_supplier_id" uuid,
	"matched_category_id" uuid,
	"status" text DEFAULT 'new',
	"match_confidence" integer,
	"converted_product_id" uuid,
	"converted_at" timestamp with time zone,
	"converted_by" uuid,
	"is_new_product" boolean DEFAULT false,
	"is_new_brand" boolean DEFAULT false,
	"is_new_supplier" boolean DEFAULT false,
	"price_variance" numeric(5, 2),
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"processed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "procurement_leads_match_confidence_check" CHECK ((match_confidence IS NULL) OR ((match_confidence >= 0) AND (match_confidence <= 100))),
	CONSTRAINT "procurement_leads_status_check" CHECK (status = ANY (ARRAY['new'::text, 'processing'::text, 'matched'::text, 'unmatched'::text, 'ignored'::text, 'converted'::text]))
);
--> statement-breakpoint
ALTER TABLE "procurement_leads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_profile_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"scheduled_start" timestamp with time zone NOT NULL,
	"scheduled_end" timestamp with time zone NOT NULL,
	"actual_start" timestamp with time zone,
	"actual_end" timestamp with time zone,
	"break_minutes" integer DEFAULT 0,
	"shift_type" text DEFAULT 'regular' NOT NULL,
	"location" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"clock_in_at" timestamp with time zone,
	"clock_out_at" timestamp with time zone,
	"clock_in_method" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "staff_shifts_clock_in_method_check" CHECK (clock_in_method = ANY (ARRAY['manual'::text, 'badge'::text, 'biometric'::text, 'app'::text])),
	CONSTRAINT "staff_shifts_shift_type_check" CHECK (shift_type = ANY (ARRAY['regular'::text, 'overtime'::text, 'on_call'::text, 'emergency'::text, 'training'::text, 'meeting'::text])),
	CONSTRAINT "staff_shifts_status_check" CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'no_show'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "staff_shifts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"requires_reference" boolean DEFAULT false,
	"fee_percentage" numeric(5, 2),
	"min_amount" numeric(12, 2),
	"max_amount" numeric(12, 2),
	"instructions" text,
	"display_order" integer DEFAULT 100,
	"icon" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_fee_percentage_check" CHECK ((fee_percentage IS NULL) OR (fee_percentage >= (0)::numeric)),
	CONSTRAINT "payment_methods_max_amount_check" CHECK ((max_amount IS NULL) OR (max_amount >= (0)::numeric)),
	CONSTRAINT "payment_methods_min_amount_check" CHECK ((min_amount IS NULL) OR (min_amount >= (0)::numeric)),
	CONSTRAINT "payment_methods_type_check" CHECK (type = ANY (ARRAY['cash'::text, 'card'::text, 'transfer'::text, 'check'::text, 'credit'::text, 'qr'::text, 'other'::text]))
);
--> statement-breakpoint
ALTER TABLE "payment_methods" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "time_off_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_profile_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"time_off_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_half_day" boolean DEFAULT false,
	"end_half_day" boolean DEFAULT false,
	"total_days" numeric(4, 1) NOT NULL,
	"total_hours" numeric(5, 1),
	"reason" text,
	"attachment_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"coverage_notes" text,
	"covering_staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "time_off_requests_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text, 'cancelled'::text, 'withdrawn'::text])),
	CONSTRAINT "valid_date_range" CHECK (end_date >= start_date)
);
--> statement-breakpoint
ALTER TABLE "time_off_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "time_off_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_profile_id" uuid NOT NULL,
	"time_off_type_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"allocated_days" numeric(5, 1) DEFAULT '0' NOT NULL,
	"used_days" numeric(5, 1) DEFAULT '0' NOT NULL,
	"pending_days" numeric(5, 1) DEFAULT '0' NOT NULL,
	"carried_over_days" numeric(5, 1) DEFAULT '0' NOT NULL,
	"available_days" numeric(5, 1) GENERATED ALWAYS AS ((((allocated_days + carried_over_days) - used_days) - pending_days)) STORED,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "time_off_balances_staff_profile_id_time_off_type_id_year_key" UNIQUE("staff_profile_id","time_off_type_id","year")
);
--> statement-breakpoint
ALTER TABLE "time_off_balances" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_availability_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_profile_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"override_type" text NOT NULL,
	"start_time" time,
	"end_time" time,
	"reason" text,
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "staff_availability_overrides_override_type_check" CHECK (override_type = ANY (ARRAY['available'::text, 'unavailable'::text, 'limited'::text])),
	CONSTRAINT "valid_override_dates" CHECK (end_date >= start_date)
);
--> statement-breakpoint
ALTER TABLE "staff_availability_overrides" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"assigned_to" uuid,
	"assigned_by" uuid,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'normal' NOT NULL,
	"due_date" timestamp with time zone,
	"reminder_at" timestamp with time zone,
	"pet_id" uuid,
	"appointment_id" uuid,
	"hospitalization_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "staff_tasks_priority_check" CHECK (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])),
	CONSTRAINT "staff_tasks_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'deferred'::text]))
);
--> statement-breakpoint
ALTER TABLE "staff_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_profile_id" uuid NOT NULL,
	"review_period_start" date NOT NULL,
	"review_period_end" date NOT NULL,
	"review_type" text DEFAULT 'annual' NOT NULL,
	"reviewed_by" uuid NOT NULL,
	"review_date" date NOT NULL,
	"overall_rating" integer,
	"ratings" jsonb DEFAULT '{}'::jsonb,
	"strengths" text,
	"areas_for_improvement" text,
	"goals_for_next_period" text,
	"employee_acknowledged" boolean DEFAULT false,
	"employee_acknowledged_at" timestamp with time zone,
	"employee_comments" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "staff_reviews_overall_rating_check" CHECK ((overall_rating >= 1) AND (overall_rating <= 5)),
	CONSTRAINT "staff_reviews_review_type_check" CHECK (review_type = ANY (ARRAY['annual'::text, 'probation'::text, 'mid_year'::text, 'project'::text, 'incident'::text])),
	CONSTRAINT "staff_reviews_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'acknowledged'::text, 'finalized'::text]))
);
--> statement-breakpoint
ALTER TABLE "staff_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"client_id" uuid NOT NULL,
	"pet_id" uuid,
	"appointment_id" uuid,
	"invoice_date" date DEFAULT CURRENT_DATE NOT NULL,
	"due_date" date,
	"subtotal" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"discount_percentage" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"amount_paid" numeric(12, 2) DEFAULT '0',
	"balance_due" numeric(12, 2) GENERATED ALWAYS AS ((total - amount_paid)) STORED,
	"currency" text DEFAULT 'PYG',
	"status" text DEFAULT 'draft' NOT NULL,
	"payment_terms" text,
	"notes" text,
	"internal_notes" text,
	"footer_text" text,
	"pdf_url" text,
	"pdf_generated_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"sent_to" text,
	"opened_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_tenant_id_invoice_number_key" UNIQUE("tenant_id","invoice_number"),
	CONSTRAINT "invoices_amounts_non_negative" CHECK ((subtotal >= (0)::numeric) AND (total >= (0)::numeric) AND (amount_paid >= (0)::numeric) AND (COALESCE(discount_amount, (0)::numeric) >= (0)::numeric) AND (COALESCE(tax_amount, (0)::numeric) >= (0)::numeric)),
	CONSTRAINT "invoices_due_date_valid" CHECK ((due_date IS NULL) OR (due_date >= invoice_date)),
	CONSTRAINT "invoices_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'viewed'::text, 'partial'::text, 'paid'::text, 'overdue'::text, 'void'::text, 'refunded'::text]))
);
--> statement-breakpoint
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"item_type" text DEFAULT 'service' NOT NULL,
	"service_id" uuid,
	"product_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"total" numeric(12, 2) DEFAULT '0',
	"display_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_items_discount_amount_check" CHECK (discount_amount >= (0)::numeric),
	CONSTRAINT "invoice_items_item_type_check" CHECK (item_type = ANY (ARRAY['service'::text, 'product'::text, 'discount'::text, 'custom'::text])),
	CONSTRAINT "invoice_items_quantity_check" CHECK (quantity > (0)::numeric),
	CONSTRAINT "invoice_items_quantity_valid" CHECK (((item_type = 'discount'::text) AND (quantity <> (0)::numeric)) OR ((item_type <> 'discount'::text) AND (quantity > (0)::numeric))),
	CONSTRAINT "invoice_items_tax_rate_check" CHECK ((tax_rate >= (0)::numeric) AND (tax_rate <= (100)::numeric)),
	CONSTRAINT "invoice_items_tax_rate_valid" CHECK ((tax_rate IS NULL) OR ((tax_rate >= (0)::numeric) AND (tax_rate <= (100)::numeric)))
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"invoice_id" uuid NOT NULL,
	"payment_number" text,
	"payment_date" date DEFAULT CURRENT_DATE NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method_id" uuid,
	"payment_method_name" text,
	"reference_number" text,
	"authorization_code" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"notes" text,
	"received_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_check" CHECK (amount > (0)::numeric),
	CONSTRAINT "payments_amount_positive" CHECK (amount > (0)::numeric),
	CONSTRAINT "payments_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text]))
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"payment_id" uuid NOT NULL,
	"refund_number" text,
	"refund_date" date DEFAULT CURRENT_DATE NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"processed_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refunds_amount_check" CHECK (amount > (0)::numeric),
	CONSTRAINT "refunds_amount_positive" CHECK (amount > (0)::numeric),
	CONSTRAINT "refunds_reason_required" CHECK ((reason IS NOT NULL) AND (char_length(TRIM(BOTH FROM reason)) > 0)),
	CONSTRAINT "refunds_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))
);
--> statement-breakpoint
ALTER TABLE "refunds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalization_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"note_type" text DEFAULT 'progress',
	"content" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hospitalization_notes_note_type_check" CHECK (note_type = ANY (ARRAY['progress'::text, 'doctor'::text, 'nursing'::text, 'discharge'::text, 'other'::text]))
);
--> statement-breakpoint
ALTER TABLE "hospitalization_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'PYG',
	"category" text NOT NULL,
	"subcategory" text,
	"expense_date" date DEFAULT CURRENT_DATE NOT NULL,
	"payment_date" date,
	"payment_method" text,
	"reference_number" text,
	"vendor_name" text,
	"receipt_url" text,
	"notes" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"status" text DEFAULT 'pending',
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expenses_amount_check" CHECK (amount > (0)::numeric),
	CONSTRAINT "expenses_category_check" CHECK (category = ANY (ARRAY['supplies'::text, 'utilities'::text, 'payroll'::text, 'rent'::text, 'equipment'::text, 'marketing'::text, 'insurance'::text, 'taxes'::text, 'travel'::text, 'maintenance'::text, 'professional_services'::text, 'training'::text, 'other'::text])),
	CONSTRAINT "expenses_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text, 'rejected'::text]))
);
--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"parent_id" uuid,
	"budget_monthly" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 100,
	"icon" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expense_categories_tenant_id_name_key" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
ALTER TABLE "expense_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "loyalty_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"lifetime_earned" integer DEFAULT 0,
	"lifetime_redeemed" integer DEFAULT 0,
	"tier" text DEFAULT 'bronze',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_points_tenant_id_client_id_key" UNIQUE("tenant_id","client_id"),
	CONSTRAINT "loyalty_points_balance_check" CHECK (balance >= 0),
	CONSTRAINT "loyalty_points_tier_check" CHECK (tier = ANY (ARRAY['bronze'::text, 'silver'::text, 'gold'::text, 'platinum'::text]))
);
--> statement-breakpoint
ALTER TABLE "loyalty_points" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"type" text NOT NULL,
	"points" integer NOT NULL,
	"description" text,
	"invoice_id" uuid,
	"order_id" uuid,
	"balance_after" integer,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_transactions_type_check" CHECK (type = ANY (ARRAY['earn'::text, 'redeem'::text, 'expire'::text, 'adjust'::text, 'bonus'::text]))
);
--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "communication_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" text,
	"allow_sms" boolean DEFAULT true,
	"allow_whatsapp" boolean DEFAULT true,
	"allow_email" boolean DEFAULT true,
	"allow_in_app" boolean DEFAULT true,
	"allow_push" boolean DEFAULT true,
	"preferred_phone" text,
	"preferred_email" text,
	"whatsapp_number" text,
	"allow_appointment_reminders" boolean DEFAULT true,
	"allow_vaccine_reminders" boolean DEFAULT true,
	"allow_marketing" boolean DEFAULT false,
	"allow_feedback_requests" boolean DEFAULT true,
	"quiet_hours_enabled" boolean DEFAULT false,
	"quiet_hours_start" time DEFAULT '22:00:00',
	"quiet_hours_end" time DEFAULT '08:00:00',
	"preferred_language" text DEFAULT 'es',
	"timezone" text DEFAULT 'America/Asuncion',
	"unsubscribed_at" timestamp with time zone,
	"unsubscribe_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "communication_preferences_user_id_tenant_id_key" UNIQUE("user_id","tenant_id")
);
--> statement-breakpoint
ALTER TABLE "communication_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"type" text NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit_cost" numeric(12, 2),
	"reference_type" text,
	"reference_id" uuid,
	"notes" text,
	"performed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_inventory_transactions_type_check" CHECK (type = ANY (ARRAY['purchase'::text, 'sale'::text, 'adjustment'::text, 'return'::text, 'damage'::text, 'theft'::text, 'expired'::text, 'transfer'::text]))
);
--> statement-breakpoint
ALTER TABLE "store_inventory_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "archived_pets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"original_data" jsonb NOT NULL,
	"tenant_id" text NOT NULL,
	"owner_id" uuid,
	"deleted_at" timestamp with time zone NOT NULL,
	"deleted_by" uuid,
	"deletion_reason" text,
	"archived_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "archived_pets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "archived_medical_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"original_data" jsonb NOT NULL,
	"pet_id" uuid,
	"tenant_id" text NOT NULL,
	"deleted_at" timestamp with time zone NOT NULL,
	"deleted_by" uuid,
	"deletion_reason" text,
	"archived_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "archived_medical_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "archived_invoices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"original_data" jsonb NOT NULL,
	"invoice_number" text NOT NULL,
	"tenant_id" text NOT NULL,
	"deleted_at" timestamp with time zone NOT NULL,
	"deleted_by" uuid,
	"deletion_reason" text,
	"archived_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "archived_invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "kennels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"location" text,
	"kennel_type" text DEFAULT 'standard',
	"max_occupancy" integer DEFAULT 1,
	"current_occupancy" integer DEFAULT 0,
	"max_weight_kg" numeric(6, 2),
	"features" text[],
	"daily_rate" numeric(12, 2) DEFAULT '0',
	"current_status" text DEFAULT 'available',
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kennels_tenant_id_code_key" UNIQUE("tenant_id","code"),
	CONSTRAINT "kennels_code_length" CHECK (char_length(code) >= 1),
	CONSTRAINT "kennels_current_occupancy_check" CHECK (current_occupancy >= 0),
	CONSTRAINT "kennels_current_status_check" CHECK (current_status = ANY (ARRAY['available'::text, 'occupied'::text, 'cleaning'::text, 'maintenance'::text, 'reserved'::text])),
	CONSTRAINT "kennels_daily_rate_check" CHECK (daily_rate >= (0)::numeric),
	CONSTRAINT "kennels_kennel_type_check" CHECK (kennel_type = ANY (ARRAY['standard'::text, 'isolation'::text, 'icu'::text, 'recovery'::text, 'large'::text, 'small'::text, 'extra-large'::text, 'oxygen'::text, 'exotic'::text])),
	CONSTRAINT "kennels_max_occupancy_check" CHECK (max_occupancy > 0),
	CONSTRAINT "kennels_max_weight_kg_check" CHECK ((max_weight_kg IS NULL) OR (max_weight_kg > (0)::numeric)),
	CONSTRAINT "kennels_name_length" CHECK (char_length(name) >= 1),
	CONSTRAINT "kennels_occupancy_valid" CHECK (current_occupancy <= max_occupancy)
);
--> statement-breakpoint
ALTER TABLE "kennels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"pet_id" uuid NOT NULL,
	"kennel_id" uuid,
	"primary_vet_id" uuid,
	"admitted_by" uuid,
	"admission_number" text NOT NULL,
	"admitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expected_discharge" timestamp with time zone,
	"actual_discharge" timestamp with time zone,
	"reason" text NOT NULL,
	"diagnosis" text,
	"notes" text,
	"discharge_instructions" text,
	"acuity_level" text DEFAULT 'normal',
	"status" text DEFAULT 'admitted' NOT NULL,
	"discharge_notes" text,
	"discharged_by" uuid,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" date,
	"estimated_cost" numeric(12, 2),
	"actual_cost" numeric(12, 2),
	"invoice_id" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hospitalizations_tenant_id_admission_number_key" UNIQUE("tenant_id","admission_number"),
	CONSTRAINT "hospitalizations_actual_cost_check" CHECK ((actual_cost IS NULL) OR (actual_cost >= (0)::numeric)),
	CONSTRAINT "hospitalizations_acuity_level_check" CHECK (acuity_level = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'critical'::text])),
	CONSTRAINT "hospitalizations_discharge_after_admission" CHECK ((actual_discharge IS NULL) OR (actual_discharge >= admitted_at)),
	CONSTRAINT "hospitalizations_estimated_cost_check" CHECK ((estimated_cost IS NULL) OR (estimated_cost >= (0)::numeric)),
	CONSTRAINT "hospitalizations_reason_length" CHECK (char_length(reason) >= 3),
	CONSTRAINT "hospitalizations_status_check" CHECK (status = ANY (ARRAY['admitted'::text, 'in_treatment'::text, 'stable'::text, 'critical'::text, 'recovering'::text, 'discharged'::text, 'deceased'::text, 'transferred'::text]))
);
--> statement-breakpoint
ALTER TABLE "hospitalizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalization_vitals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"temperature" numeric(4, 1),
	"heart_rate" integer,
	"respiratory_rate" integer,
	"blood_pressure_systolic" integer,
	"blood_pressure_diastolic" integer,
	"spo2" integer,
	"weight_kg" numeric(6, 2),
	"pain_score" integer,
	"mentation" text,
	"hydration_status" text,
	"notes" text,
	"recorded_by" uuid,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hospitalization_vitals_blood_pressure_diastolic_check" CHECK ((blood_pressure_diastolic IS NULL) OR ((blood_pressure_diastolic >= 20) AND (blood_pressure_diastolic <= 200))),
	CONSTRAINT "hospitalization_vitals_blood_pressure_systolic_check" CHECK ((blood_pressure_systolic IS NULL) OR ((blood_pressure_systolic >= 40) AND (blood_pressure_systolic <= 300))),
	CONSTRAINT "hospitalization_vitals_heart_rate_check" CHECK ((heart_rate IS NULL) OR ((heart_rate >= 20) AND (heart_rate <= 400))),
	CONSTRAINT "hospitalization_vitals_hydration_status_check" CHECK ((hydration_status IS NULL) OR (hydration_status = ANY (ARRAY['normal'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
	CONSTRAINT "hospitalization_vitals_mentation_check" CHECK ((mentation IS NULL) OR (mentation = ANY (ARRAY['bright'::text, 'quiet'::text, 'dull'::text, 'obtunded'::text, 'comatose'::text]))),
	CONSTRAINT "hospitalization_vitals_pain_score_check" CHECK ((pain_score IS NULL) OR ((pain_score >= 0) AND (pain_score <= 10))),
	CONSTRAINT "hospitalization_vitals_respiratory_rate_check" CHECK ((respiratory_rate IS NULL) OR ((respiratory_rate >= 5) AND (respiratory_rate <= 150))),
	CONSTRAINT "hospitalization_vitals_spo2_check" CHECK ((spo2 IS NULL) OR ((spo2 >= 0) AND (spo2 <= 100))),
	CONSTRAINT "hospitalization_vitals_temperature_check" CHECK ((temperature IS NULL) OR ((temperature >= (30)::numeric) AND (temperature <= (45)::numeric))),
	CONSTRAINT "hospitalization_vitals_weight_kg_check" CHECK ((weight_kg IS NULL) OR (weight_kg > (0)::numeric))
);
--> statement-breakpoint
ALTER TABLE "hospitalization_vitals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalization_medications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"medication_name" text NOT NULL,
	"dose" text NOT NULL,
	"route" text,
	"frequency" text,
	"scheduled_at" timestamp with time zone,
	"administered_at" timestamp with time zone,
	"skipped_reason" text,
	"status" text DEFAULT 'scheduled',
	"administered_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hospitalization_medications_route_check" CHECK ((route IS NULL) OR (route = ANY (ARRAY['oral'::text, 'IV'::text, 'IM'::text, 'SQ'::text, 'topical'::text, 'inhaled'::text, 'rectal'::text, 'ophthalmic'::text, 'otic'::text]))),
	CONSTRAINT "hospitalization_medications_status_check" CHECK (status = ANY (ARRAY['scheduled'::text, 'administered'::text, 'skipped'::text, 'held'::text]))
);
--> statement-breakpoint
ALTER TABLE "hospitalization_medications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalization_treatments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"treatment_type" text NOT NULL,
	"description" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"performed_at" timestamp with time zone,
	"status" text DEFAULT 'scheduled',
	"performed_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hospitalization_treatments_status_check" CHECK (status = ANY (ARRAY['scheduled'::text, 'performed'::text, 'skipped'::text, 'pending'::text]))
);
--> statement-breakpoint
ALTER TABLE "hospitalization_treatments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hospitalization_feedings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"food_type" text NOT NULL,
	"amount" text,
	"method" text,
	"scheduled_at" timestamp with time zone,
	"fed_at" timestamp with time zone,
	"consumed_amount" text,
	"appetite_score" integer,
	"vomited" boolean DEFAULT false,
	"status" text DEFAULT 'scheduled',
	"fed_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hospitalization_feedings_appetite_score_check" CHECK ((appetite_score IS NULL) OR ((appetite_score >= 0) AND (appetite_score <= 5))),
	CONSTRAINT "hospitalization_feedings_method_check" CHECK ((method IS NULL) OR (method = ANY (ARRAY['oral'::text, 'syringe'::text, 'tube'::text, 'assisted'::text]))),
	CONSTRAINT "hospitalization_feedings_status_check" CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'refused'::text, 'partial'::text]))
);
--> statement-breakpoint
ALTER TABLE "hospitalization_feedings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_campaign_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"discount_type" text,
	"discount_value" numeric(12, 2),
	CONSTRAINT "store_campaign_items_campaign_id_product_id_key" UNIQUE("campaign_id","product_id"),
	CONSTRAINT "store_campaign_items_discount_type_check" CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text]))
);
--> statement-breakpoint
ALTER TABLE "store_campaign_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "audit_log_enhanced" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_id" uuid NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_fields" text[],
	"tenant_id" text,
	"user_id" uuid,
	"user_email" text,
	"user_role" text,
	"session_id" text,
	"ip_address" "inet",
	"user_agent" text,
	"request_id" text,
	"api_endpoint" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data_classification" text DEFAULT 'internal',
	"retention_until" date,
	"compliance_tags" text[],
	CONSTRAINT "audit_log_enhanced_data_classification_check" CHECK (data_classification = ANY (ARRAY['public'::text, 'internal'::text, 'confidential'::text, 'restricted'::text])),
	CONSTRAINT "audit_log_enhanced_operation_check" CHECK (operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))
);
--> statement-breakpoint
ALTER TABLE "audit_log_enhanced" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "audit_configuration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"audit_inserts" boolean DEFAULT true,
	"audit_updates" boolean DEFAULT true,
	"audit_deletes" boolean DEFAULT true,
	"capture_old_values" boolean DEFAULT true,
	"capture_new_values" boolean DEFAULT true,
	"excluded_columns" text[] DEFAULT '{"RAY['updated_at'::text","'created_at'::tex"}',
	"sensitive_columns" text[] DEFAULT '{"RAY"}',
	"data_classification" text DEFAULT 'internal',
	"retention_days" integer DEFAULT 365,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "audit_configuration_table_name_key" UNIQUE("table_name")
);
--> statement-breakpoint
ALTER TABLE "audit_configuration" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"user_id" uuid,
	"user_email" text,
	"target_user_id" uuid,
	"tenant_id" text,
	"ip_address" "inet",
	"user_agent" text,
	"geolocation" jsonb,
	"details" jsonb DEFAULT '{}'::jsonb,
	"severity" text DEFAULT 'info',
	"acknowledged" boolean DEFAULT false,
	"acknowledged_by" uuid,
	"acknowledged_at" timestamp with time zone,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "security_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "data_access_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_id" uuid,
	"record_count" integer,
	"query_type" text NOT NULL,
	"user_id" uuid,
	"user_email" text,
	"user_role" text,
	"tenant_id" text,
	"ip_address" "inet",
	"purpose" text,
	"justification" text,
	"query_hash" text,
	"fields_accessed" text[],
	"filter_criteria" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "data_access_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "materialized_view_refresh_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"view_name" text NOT NULL,
	"refresh_started_at" timestamp with time zone NOT NULL,
	"refresh_completed_at" timestamp with time zone,
	"duration_seconds" numeric(10, 2),
	"rows_affected" integer,
	"status" text DEFAULT 'in_progress',
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "scheduled_job_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_name" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"duration_ms" integer,
	"status" text DEFAULT 'running',
	"result" jsonb,
	"error_message" text,
	"rows_affected" integer,
	CONSTRAINT "scheduled_job_log_status_check" CHECK (status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text]))
);
--> statement-breakpoint
CREATE TABLE "loyalty_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"points_per_currency" numeric(10, 4) DEFAULT '0.01',
	"min_purchase_amount" numeric(12, 2) DEFAULT '0',
	"max_points_per_transaction" integer,
	"service_category_multipliers" jsonb DEFAULT '{}'::jsonb,
	"tier_multipliers" jsonb DEFAULT '{"gold":1.5,"bronze":1,"silver":1.25,"platinum":2}'::jsonb,
	"points_value" numeric(10, 4) DEFAULT '100',
	"min_points_to_redeem" integer DEFAULT 100,
	"max_redemption_percentage" numeric(5, 2) DEFAULT '50',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "loyalty_rules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_subcategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_subcategories_category_id_slug_key" UNIQUE("category_id","slug")
);
--> statement-breakpoint
ALTER TABLE "store_subcategories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_result_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_order_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"comment" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lab_result_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_test_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"base_price" numeric(12, 2) DEFAULT '0',
	"reference_ranges" jsonb DEFAULT '{}'::jsonb,
	"turnaround_days" integer DEFAULT 1,
	"requires_fasting" boolean DEFAULT false,
	"sample_type" text,
	"sample_volume_ml" numeric(6, 2),
	"special_instructions" text,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 100,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_test_catalog_tenant_id_code_key" UNIQUE("tenant_id","code"),
	CONSTRAINT "lab_test_catalog_base_price_check" CHECK (base_price >= (0)::numeric),
	CONSTRAINT "lab_test_catalog_code_length" CHECK (char_length(code) >= 2),
	CONSTRAINT "lab_test_catalog_name_length" CHECK (char_length(name) >= 2),
	CONSTRAINT "lab_test_catalog_sample_type_check" CHECK ((sample_type IS NULL) OR (sample_type = ANY (ARRAY['blood'::text, 'serum'::text, 'plasma'::text, 'urine'::text, 'feces'::text, 'tissue'::text, 'swab'::text, 'citrated_blood'::text, 'edta_blood'::text, 'aspirate'::text, 'biopsy'::text, 'skin'::text, 'hair'::text, 'other'::text]))),
	CONSTRAINT "lab_test_catalog_sample_volume_ml_check" CHECK ((sample_volume_ml IS NULL) OR (sample_volume_ml > (0)::numeric)),
	CONSTRAINT "lab_test_catalog_turnaround_days_check" CHECK (turnaround_days > 0)
);
--> statement-breakpoint
ALTER TABLE "lab_test_catalog" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"variant_type" text NOT NULL,
	"price_modifier" numeric(12, 2) DEFAULT '0',
	"stock_quantity" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_product_variants_tenant_id_sku_key" UNIQUE("tenant_id","sku")
);
--> statement-breakpoint
ALTER TABLE "store_product_variants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_panels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"test_ids" uuid[] DEFAULT '{""}' NOT NULL,
	"panel_price" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 100,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_panels_tenant_id_code_key" UNIQUE("tenant_id","code"),
	CONSTRAINT "lab_panels_name_length" CHECK (char_length(name) >= 2),
	CONSTRAINT "lab_panels_panel_price_check" CHECK ((panel_price IS NULL) OR (panel_price >= (0)::numeric))
);
--> statement-breakpoint
ALTER TABLE "lab_panels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"order_number" text NOT NULL,
	"pet_id" uuid NOT NULL,
	"ordered_by" uuid,
	"medical_record_id" uuid,
	"priority" text DEFAULT 'routine',
	"clinical_notes" text,
	"fasting_confirmed" boolean DEFAULT false,
	"lab_type" text DEFAULT 'in_house',
	"reference_lab_name" text,
	"external_accession" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"collected_at" timestamp with time zone,
	"collected_by" uuid,
	"processing_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_orders_tenant_id_order_number_key" UNIQUE("tenant_id","order_number"),
	CONSTRAINT "lab_orders_lab_type_check" CHECK (lab_type = ANY (ARRAY['in_house'::text, 'reference_lab'::text])),
	CONSTRAINT "lab_orders_priority_check" CHECK (priority = ANY (ARRAY['stat'::text, 'urgent'::text, 'routine'::text])),
	CONSTRAINT "lab_orders_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'collected'::text, 'processing'::text, 'completed'::text, 'reviewed'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "lab_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_order_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"test_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"price" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_order_items_lab_order_id_test_id_key" UNIQUE("lab_order_id","test_id"),
	CONSTRAINT "lab_order_items_price_check" CHECK ((price IS NULL) OR (price >= (0)::numeric)),
	CONSTRAINT "lab_order_items_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "lab_order_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_order_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"test_id" uuid NOT NULL,
	"value" text NOT NULL,
	"numeric_value" numeric(12, 4),
	"unit" text,
	"reference_min" numeric(12, 4),
	"reference_max" numeric(12, 4),
	"flag" text,
	"is_abnormal" boolean DEFAULT false,
	"notes" text,
	"entered_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_results_lab_order_id_test_id_key" UNIQUE("lab_order_id","test_id"),
	CONSTRAINT "lab_results_flag_check" CHECK ((flag IS NULL) OR (flag = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'critical_low'::text, 'critical_high'::text])))
);
--> statement-breakpoint
ALTER TABLE "lab_results" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lab_result_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_order_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text,
	"file_size_bytes" integer,
	"description" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lab_result_attachments_file_size_bytes_check" CHECK ((file_size_bytes IS NULL) OR (file_size_bytes > 0))
);
--> statement-breakpoint
ALTER TABLE "lab_result_attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "client_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"invoice_id" uuid,
	"payment_id" uuid,
	"status" text DEFAULT 'active',
	"used_at" timestamp with time zone,
	"used_on_invoice_id" uuid,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_credits_status_check" CHECK (status = ANY (ARRAY['active'::text, 'used'::text, 'expired'::text])),
	CONSTRAINT "client_credits_type_check" CHECK (type = ANY (ARRAY['payment'::text, 'refund'::text, 'adjustment'::text, 'reward'::text, 'promo'::text]))
);
--> statement-breakpoint
ALTER TABLE "client_credits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "insurance_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"country" text,
	"logo_url" text,
	"website" text,
	"phone" text,
	"email" text,
	"claims_email" text,
	"claims_phone" text,
	"address" jsonb,
	"coverage_types" text[],
	"direct_billing" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insurance_providers_code_key" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "insurance_providers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "insurance_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"pet_id" uuid NOT NULL,
	"provider_id" uuid,
	"policy_number" text NOT NULL,
	"group_number" text,
	"coverage_type" text DEFAULT 'basic',
	"coverage_details" jsonb DEFAULT '{}'::jsonb,
	"annual_limit" numeric(12, 2),
	"deductible" numeric(12, 2),
	"copay_percentage" numeric(5, 2),
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"status" text DEFAULT 'active',
	"claims_contact_name" text,
	"claims_contact_phone" text,
	"claims_contact_email" text,
	"policy_document_url" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insurance_policies_coverage_type_check" CHECK (coverage_type = ANY (ARRAY['basic'::text, 'standard'::text, 'premium'::text, 'comprehensive'::text])),
	CONSTRAINT "insurance_policies_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'expired'::text, 'cancelled'::text, 'suspended'::text]))
);
--> statement-breakpoint
ALTER TABLE "insurance_policies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "insurance_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"policy_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"claim_number" text,
	"claim_type" text NOT NULL,
	"claimed_amount" numeric(12, 2) NOT NULL,
	"approved_amount" numeric(12, 2),
	"paid_amount" numeric(12, 2),
	"service_date" date NOT NULL,
	"submitted_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"denial_reason" text,
	"invoice_id" uuid,
	"medical_record_id" uuid,
	"supporting_documents" text[] DEFAULT '{""}',
	"notes" text,
	"provider_notes" text,
	"submitted_by" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insurance_claims_claim_type_check" CHECK (claim_type = ANY (ARRAY['treatment'::text, 'surgery'::text, 'hospitalization'::text, 'medication'::text, 'diagnostic'::text, 'other'::text])),
	CONSTRAINT "insurance_claims_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_review'::text, 'approved'::text, 'partially_approved'::text, 'denied'::text, 'paid'::text]))
);
--> statement-breakpoint
ALTER TABLE "insurance_claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "insurance_claim_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"description" text NOT NULL,
	"service_id" uuid,
	"quantity" integer DEFAULT 1,
	"amount" numeric(12, 2) NOT NULL,
	"approved_amount" numeric(12, 2),
	"is_covered" boolean,
	"denial_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insurance_claim_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"pet_id" uuid,
	"subject" text,
	"channel" text DEFAULT 'in_app' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'normal',
	"assigned_to" uuid,
	"assigned_at" timestamp with time zone,
	"last_message_at" timestamp with time zone,
	"last_client_message_at" timestamp with time zone,
	"last_staff_message_at" timestamp with time zone,
	"client_last_read_at" timestamp with time zone,
	"staff_last_read_at" timestamp with time zone,
	"unread_client_count" integer DEFAULT 0,
	"unread_staff_count" integer DEFAULT 0,
	"appointment_id" uuid,
	"tags" text[],
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_channel_check" CHECK (channel = ANY (ARRAY['in_app'::text, 'sms'::text, 'whatsapp'::text, 'email'::text])),
	CONSTRAINT "conversations_priority_check" CHECK (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])),
	CONSTRAINT "conversations_status_check" CHECK (status = ANY (ARRAY['open'::text, 'pending'::text, 'resolved'::text, 'closed'::text, 'spam'::text]))
);
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"sender_id" uuid,
	"sender_type" text NOT NULL,
	"sender_name" text,
	"message_type" text DEFAULT 'text' NOT NULL,
	"content" text,
	"content_html" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"card_data" jsonb,
	"reply_to_id" uuid,
	"status" text DEFAULT 'sent' NOT NULL,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"failed_reason" text,
	"external_message_id" text,
	"external_channel" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_message_type_check" CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text, 'audio'::text, 'video'::text, 'location'::text, 'appointment_card'::text, 'invoice_card'::text, 'prescription_card'::text, 'system'::text])),
	CONSTRAINT "messages_sender_type_check" CHECK (sender_type = ANY (ARRAY['client'::text, 'staff'::text, 'system'::text, 'bot'::text])),
	CONSTRAINT "messages_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'failed'::text]))
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"content_html" text,
	"variables" text[],
	"channels" text[] DEFAULT '{"RAY['in_app'::tex"}',
	"sms_approved" boolean DEFAULT false,
	"whatsapp_template_id" text,
	"language" text DEFAULT 'es',
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_templates_tenant_id_code_key" UNIQUE("tenant_id","code"),
	CONSTRAINT "message_templates_category_check" CHECK (category = ANY (ARRAY['appointment'::text, 'reminder'::text, 'follow_up'::text, 'marketing'::text, 'transactional'::text, 'welcome'::text, 'feedback'::text, 'custom'::text]))
);
--> statement-breakpoint
ALTER TABLE "message_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"pet_id" uuid,
	"type" text NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"last_attempt_at" timestamp with time zone,
	"next_attempt_at" timestamp with time zone,
	"error_message" text,
	"custom_subject" text,
	"custom_body" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reminders_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text, 'cancelled'::text, 'skipped'::text])),
	CONSTRAINT "reminders_type_check" CHECK (type = ANY (ARRAY['vaccine_reminder'::text, 'vaccine_overdue'::text, 'appointment_reminder'::text, 'appointment_confirmation'::text, 'appointment_cancelled'::text, 'invoice_sent'::text, 'payment_received'::text, 'payment_overdue'::text, 'birthday'::text, 'follow_up'::text, 'lab_results_ready'::text, 'hospitalization_update'::text, 'custom'::text]))
);
--> statement-breakpoint
ALTER TABLE "reminders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "qr_tag_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"tenant_id" text,
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"location_accuracy" numeric,
	"contact_attempted" boolean DEFAULT false,
	"contact_method" text,
	"contact_details" text,
	"scanned_by" uuid
);
--> statement-breakpoint
ALTER TABLE "qr_tag_scans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"license_number" text,
	"license_expiry" date,
	"specializations" text[],
	"education" text,
	"bio" text,
	"hire_date" date,
	"employment_type" text DEFAULT 'full_time',
	"department" text,
	"title" text,
	"hourly_rate" numeric(12, 2),
	"daily_rate" numeric(12, 2),
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"signature_url" text,
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_profiles_profile_id_key" UNIQUE("profile_id"),
	CONSTRAINT "staff_profiles_employment_type_check" CHECK (employment_type = ANY (ARRAY['full_time'::text, 'part_time'::text, 'contractor'::text, 'intern'::text]))
);
--> statement-breakpoint
ALTER TABLE "staff_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text DEFAULT 'Default',
	"is_default" boolean DEFAULT true,
	"effective_from" date DEFAULT CURRENT_DATE NOT NULL,
	"effective_until" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff_schedules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_schedule_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"break_start" time,
	"break_end" time,
	"location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_schedule_entries_break" CHECK (((break_start IS NULL) AND (break_end IS NULL)) OR ((break_start IS NOT NULL) AND (break_end IS NOT NULL) AND (break_end > break_start))),
	CONSTRAINT "staff_schedule_entries_day_of_week_check" CHECK ((day_of_week >= 1) AND (day_of_week <= 7)),
	CONSTRAINT "staff_schedule_entries_times" CHECK (end_time > start_time)
);
--> statement-breakpoint
ALTER TABLE "staff_schedule_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "time_off_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"is_paid" boolean DEFAULT true,
	"max_days_per_year" integer,
	"requires_approval" boolean DEFAULT true,
	"requires_documentation" boolean DEFAULT false,
	"color" text DEFAULT '#6366f1',
	"icon" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "time_off_types_tenant_id_code_key" UNIQUE("tenant_id","code")
);
--> statement-breakpoint
ALTER TABLE "time_off_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "staff_time_off" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"type_id" uuid,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_half_day" boolean DEFAULT false,
	"end_half_day" boolean DEFAULT false,
	"reason" text,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_time_off_dates" CHECK (end_date >= start_date),
	CONSTRAINT "staff_time_off_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text]))
);
--> statement-breakpoint
ALTER TABLE "staff_time_off" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clinic_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"invited_by" uuid,
	"invitation_accepted_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinic_profiles_profile_id_tenant_id_key" UNIQUE("profile_id","tenant_id"),
	CONSTRAINT "clinic_profiles_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'vet'::text, 'admin'::text]))
);
--> statement-breakpoint
ALTER TABLE "clinic_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"reminder_id" uuid,
	"client_id" uuid NOT NULL,
	"channel_type" text NOT NULL,
	"destination" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"error_code" text,
	"error_message" text,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_queue_channel_type_check" CHECK (channel_type = ANY (ARRAY['email'::text, 'sms'::text, 'whatsapp'::text, 'push'::text, 'in_app'::text])),
	CONSTRAINT "notification_queue_status_check" CHECK (status = ANY (ARRAY['queued'::text, 'sending'::text, 'sent'::text, 'delivered'::text, 'failed'::text, 'bounced'::text]))
);
--> statement-breakpoint
ALTER TABLE "notification_queue" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "store_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"old_price" numeric(12, 2),
	"new_price" numeric(12, 2) NOT NULL,
	"price_type" text DEFAULT 'base',
	"changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_price_history_price_type_check" CHECK (price_type = ANY (ARRAY['base'::text, 'sale'::text, 'cost'::text]))
);
--> statement-breakpoint
ALTER TABLE "store_price_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_accounts" ADD CONSTRAINT "demo_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_invites" ADD CONSTRAINT "clinic_invites_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_invites" ADD CONSTRAINT "clinic_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_invites" ADD CONSTRAINT "clinic_invites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_tags" ADD CONSTRAINT "qr_tags_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_tags" ADD CONSTRAINT "qr_tags_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_tags" ADD CONSTRAINT "qr_tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_pets" ADD CONSTRAINT "lost_pets_found_by_fkey" FOREIGN KEY ("found_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_pets" ADD CONSTRAINT "lost_pets_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_pets" ADD CONSTRAINT "lost_pets_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_pets" ADD CONSTRAINT "lost_pets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_administered_by_clinic_fkey" FOREIGN KEY ("administered_by_clinic") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_administered_by_fkey" FOREIGN KEY ("administered_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccines" ADD CONSTRAINT "vaccines_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."vaccine_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccine_reactions" ADD CONSTRAINT "vaccine_reactions_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccine_reactions" ADD CONSTRAINT "vaccine_reactions_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccine_reactions" ADD CONSTRAINT "vaccine_reactions_vaccine_id_fkey" FOREIGN KEY ("vaccine_id") REFERENCES "public"."vaccines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnosis_codes" ADD CONSTRAINT "diagnosis_codes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_dosages" ADD CONSTRAINT "drug_dosages_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "growth_standards" ADD CONSTRAINT "growth_standards_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reproductive_cycles" ADD CONSTRAINT "reproductive_cycles_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reproductive_cycles" ADD CONSTRAINT "reproductive_cycles_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reproductive_cycles" ADD CONSTRAINT "reproductive_cycles_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reproductive_cycles" ADD CONSTRAINT "reproductive_cycles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "euthanasia_assessments" ADD CONSTRAINT "euthanasia_assessments_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "euthanasia_assessments" ADD CONSTRAINT "euthanasia_assessments_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "euthanasia_assessments" ADD CONSTRAINT "euthanasia_assessments_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "euthanasia_assessments" ADD CONSTRAINT "euthanasia_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_templates" ADD CONSTRAINT "consent_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_templates" ADD CONSTRAINT "consent_templates_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_templates" ADD CONSTRAINT "consent_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_templates" ADD CONSTRAINT "consent_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_dispensed_by_fkey" FOREIGN KEY ("dispensed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_documents" ADD CONSTRAINT "hospitalization_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_created_by_tenant_id_fkey" FOREIGN KEY ("created_by_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."store_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_brands" ADD CONSTRAINT "store_brands_created_by_tenant_id_fkey" FOREIGN KEY ("created_by_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_brands" ADD CONSTRAINT "store_brands_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_brands" ADD CONSTRAINT "store_brands_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."store_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."store_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_created_by_tenant_id_fkey" FOREIGN KEY ("created_by_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_default_supplier_id_fkey" FOREIGN KEY ("default_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."store_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_panel_tests" ADD CONSTRAINT "lab_panel_tests_panel_id_fkey" FOREIGN KEY ("panel_id") REFERENCES "public"."lab_test_panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_campaigns" ADD CONSTRAINT "store_campaigns_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_campaigns" ADD CONSTRAINT "store_campaigns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_coupons" ADD CONSTRAINT "store_coupons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_coupons" ADD CONSTRAINT "store_coupons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."store_coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."store_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."store_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_audit_log" ADD CONSTRAINT "consent_audit_log_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_requests" ADD CONSTRAINT "consent_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blanket_consents" ADD CONSTRAINT "blanket_consents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."store_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."store_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_wishlist" ADD CONSTRAINT "store_wishlist_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_wishlist" ADD CONSTRAINT "store_wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."store_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_wishlist" ADD CONSTRAINT "store_wishlist_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_converted_by_fkey" FOREIGN KEY ("converted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_converted_product_id_fkey" FOREIGN KEY ("converted_product_id") REFERENCES "public"."store_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_matched_brand_id_fkey" FOREIGN KEY ("matched_brand_id") REFERENCES "public"."store_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_matched_category_id_fkey" FOREIGN KEY ("matched_category_id") REFERENCES "public"."store_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_matched_product_id_fkey" FOREIGN KEY ("matched_product_id") REFERENCES "public"."store_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_matched_supplier_id_fkey" FOREIGN KEY ("matched_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_leads" ADD CONSTRAINT "procurement_leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_tasks" ADD CONSTRAINT "staff_tasks_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_reviews" ADD CONSTRAINT "staff_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."store_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kennels" ADD CONSTRAINT "kennels_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kennels" ADD CONSTRAINT "kennels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_admitted_by_fkey" FOREIGN KEY ("admitted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_discharged_by_fkey" FOREIGN KEY ("discharged_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_kennel_id_fkey" FOREIGN KEY ("kennel_id") REFERENCES "public"."kennels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_primary_vet_id_fkey" FOREIGN KEY ("primary_vet_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_vitals" ADD CONSTRAINT "hospitalization_vitals_hospitalization_id_fkey" FOREIGN KEY ("hospitalization_id") REFERENCES "public"."hospitalizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_vitals" ADD CONSTRAINT "hospitalization_vitals_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_vitals" ADD CONSTRAINT "hospitalization_vitals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_medications" ADD CONSTRAINT "hospitalization_medications_administered_by_fkey" FOREIGN KEY ("administered_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_medications" ADD CONSTRAINT "hospitalization_medications_hospitalization_id_fkey" FOREIGN KEY ("hospitalization_id") REFERENCES "public"."hospitalizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_medications" ADD CONSTRAINT "hospitalization_medications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_treatments" ADD CONSTRAINT "hospitalization_treatments_hospitalization_id_fkey" FOREIGN KEY ("hospitalization_id") REFERENCES "public"."hospitalizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_treatments" ADD CONSTRAINT "hospitalization_treatments_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_treatments" ADD CONSTRAINT "hospitalization_treatments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_feedings" ADD CONSTRAINT "hospitalization_feedings_fed_by_fkey" FOREIGN KEY ("fed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_feedings" ADD CONSTRAINT "hospitalization_feedings_hospitalization_id_fkey" FOREIGN KEY ("hospitalization_id") REFERENCES "public"."hospitalizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitalization_feedings" ADD CONSTRAINT "hospitalization_feedings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_result_comments" ADD CONSTRAINT "lab_result_comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_result_comments" ADD CONSTRAINT "lab_result_comments_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_result_comments" ADD CONSTRAINT "lab_result_comments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_catalog" ADD CONSTRAINT "lab_test_catalog_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_test_catalog" ADD CONSTRAINT "lab_test_catalog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_panels" ADD CONSTRAINT "lab_panels_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_panels" ADD CONSTRAINT "lab_panels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_collected_by_fkey" FOREIGN KEY ("collected_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_ordered_by_fkey" FOREIGN KEY ("ordered_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_test_catalog"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_entered_by_fkey" FOREIGN KEY ("entered_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_test_catalog"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_result_attachments" ADD CONSTRAINT "lab_result_attachments_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_result_attachments" ADD CONSTRAINT "lab_result_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_result_attachments" ADD CONSTRAINT "lab_result_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."insurance_policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claim_items" ADD CONSTRAINT "insurance_claim_items_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."insurance_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claim_items" ADD CONSTRAINT "insurance_claim_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claim_items" ADD CONSTRAINT "insurance_claim_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_schedules" ADD CONSTRAINT "staff_schedules_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_schedules" ADD CONSTRAINT "staff_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_schedule_entries" ADD CONSTRAINT "staff_schedule_entries_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."staff_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_schedule_entries" ADD CONSTRAINT "staff_schedule_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_types" ADD CONSTRAINT "time_off_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_time_off" ADD CONSTRAINT "staff_time_off_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_time_off" ADD CONSTRAINT "staff_time_off_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_time_off" ADD CONSTRAINT "staff_time_off_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_time_off" ADD CONSTRAINT "staff_time_off_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."time_off_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tenants_active" ON "tenants" USING btree ("is_active" bool_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_tenants_name" ON "tenants" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_tenants_plan" ON "tenants" USING btree ("plan" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_tenants_settings_gin" ON "tenants" USING gin ("settings" jsonb_path_ops) WHERE ((settings IS NOT NULL) AND (settings <> '{}'::jsonb));--> statement-breakpoint
CREATE INDEX "idx_profiles_client_list" ON "profiles" USING btree ("tenant_id" text_ops,"full_name" text_ops,"email" text_ops,"phone" text_ops,"client_code" text_ops,"avatar_url" text_ops) WHERE ((role = 'owner'::text) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_profiles_deleted" ON "profiles" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_profiles_email" ON "profiles" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_email_lower" ON "profiles" USING btree (lower(email) text_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_name_search" ON "profiles" USING gin ("full_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_role" ON "profiles" USING btree ("role" text_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_specializations_gin" ON "profiles" USING gin ("specializations" array_ops) WHERE (specializations IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_profiles_staff_list" ON "profiles" USING btree ("tenant_id" text_ops,"role" text_ops,"full_name" text_ops,"email" text_ops,"phone" text_ops,"avatar_url" text_ops,"license_number" text_ops) WHERE ((role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_profiles_staff_lookup" ON "profiles" USING btree ("id" uuid_ops,"tenant_id" text_ops,"role" uuid_ops) WHERE ((role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_profiles_tenant" ON "profiles" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_tenant_role" ON "profiles" USING btree ("tenant_id" text_ops,"role" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_profiles_unique_email_per_tenant" ON "profiles" USING btree (tenant_id text_ops,lower(email) text_ops) WHERE ((tenant_id IS NOT NULL) AND (email IS NOT NULL) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_client_code" ON "profiles" USING btree ("tenant_id" text_ops,"client_code" text_ops) WHERE ((client_code IS NOT NULL) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_demo_accounts_email" ON "demo_accounts" USING btree ("email" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_clinic_invites_accepted_by" ON "clinic_invites" USING btree ("accepted_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_invites_email" ON "clinic_invites" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_invites_invited_by" ON "clinic_invites" USING btree ("invited_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_invites_pending" ON "clinic_invites" USING btree ("email" timestamptz_ops,"status" timestamptz_ops,"expires_at" text_ops) WHERE (status = 'pending'::text);--> statement-breakpoint
CREATE INDEX "idx_clinic_invites_tenant" ON "clinic_invites" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_invites_tenant_pending" ON "clinic_invites" USING btree ("tenant_id" text_ops,"status" text_ops,"email" text_ops,"role" text_ops,"expires_at" text_ops,"invited_by" text_ops) WHERE (status = 'pending'::text);--> statement-breakpoint
CREATE INDEX "idx_clinic_product_assignments_active" ON "clinic_product_assignments" USING btree ("tenant_id" text_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_clinic_product_assignments_catalog" ON "clinic_product_assignments" USING btree ("catalog_product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_product_assignments_product" ON "clinic_product_assignments" USING btree ("catalog_product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_product_assignments_tenant" ON "clinic_product_assignments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_pets_active" ON "pets" USING btree ("tenant_id" text_ops) WHERE ((deleted_at IS NULL) AND (is_deceased = false));--> statement-breakpoint
CREATE INDEX "idx_pets_allergies_gin" ON "pets" USING gin ("allergies" array_ops) WHERE ((allergies IS NOT NULL) AND (allergies <> '{}'::text[]));--> statement-breakpoint
CREATE INDEX "idx_pets_conditions_gin" ON "pets" USING gin ("chronic_conditions" array_ops) WHERE ((chronic_conditions IS NOT NULL) AND (chronic_conditions <> '{}'::text[]));--> statement-breakpoint
CREATE INDEX "idx_pets_name_search" ON "pets" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_pets_owner" ON "pets" USING btree ("owner_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_pets_owner_list" ON "pets" USING btree ("owner_id" uuid_ops,"name" uuid_ops,"species" uuid_ops,"breed" uuid_ops,"photo_url" uuid_ops,"birth_date" uuid_ops,"is_deceased" uuid_ops,"tenant_id" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_pets_owner_rls" ON "pets" USING btree ("id" uuid_ops,"owner_id" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_pets_species" ON "pets" USING btree ("tenant_id" text_ops,"species" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_pets_tenant" ON "pets" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_pets_tenant_list" ON "pets" USING btree ("tenant_id" text_ops,"name" text_ops,"owner_id" text_ops,"species" text_ops,"breed" text_ops,"photo_url" text_ops,"is_deceased" text_ops,"is_active" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_pets_tenant_owner" ON "pets" USING btree ("tenant_id" text_ops,"owner_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_microchip" ON "pets" USING btree ("microchip_number" text_ops) WHERE ((microchip_number IS NOT NULL) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_qr_tags_code" ON "qr_tags" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_qr_tags_pet" ON "qr_tags" USING btree ("pet_id" uuid_ops) WHERE (pet_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_qr_tags_tenant" ON "qr_tags" USING btree ("tenant_id" text_ops) WHERE (tenant_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_qr_tags_unassigned" ON "qr_tags" USING btree ("tenant_id" text_ops) WHERE ((pet_id IS NULL) AND (is_active = true));--> statement-breakpoint
CREATE INDEX "idx_lost_pets_location" ON "lost_pets" USING btree ("last_seen_lat" numeric_ops,"last_seen_lng" numeric_ops) WHERE ((status = 'lost'::text) AND (last_seen_lat IS NOT NULL));--> statement-breakpoint
CREATE INDEX "idx_lost_pets_pet" ON "lost_pets" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lost_pets_status" ON "lost_pets" USING btree ("status" text_ops) WHERE (status = 'lost'::text);--> statement-breakpoint
CREATE INDEX "idx_lost_pets_tenant" ON "lost_pets" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccine_templates_active" ON "vaccine_templates" USING btree ("id" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_vaccine_templates_global" ON "vaccine_templates" USING btree ("display_order" int4_ops) WHERE ((tenant_id IS NULL) AND (is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_vaccine_templates_species" ON "vaccine_templates" USING gin ("species" array_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccine_templates_tenant" ON "vaccine_templates" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccines_administered_by" ON "vaccines" USING btree ("administered_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccines_administered_by_clinic" ON "vaccines" USING btree ("administered_by_clinic" text_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccines_pet" ON "vaccines" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccines_pet_history" ON "vaccines" USING btree ("pet_id" date_ops,"administered_date" uuid_ops,"name" uuid_ops,"status" date_ops,"next_due_date" uuid_ops,"administered_by" date_ops,"batch_number" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_vaccines_template" ON "vaccines" USING btree ("template_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccine_reactions_pet" ON "vaccine_reactions" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_vaccine_reactions_severity" ON "vaccine_reactions" USING btree ("severity" text_ops) WHERE (severity = ANY (ARRAY['high'::text, 'critical'::text]));--> statement-breakpoint
CREATE INDEX "idx_vaccine_reactions_vaccine" ON "vaccine_reactions" USING btree ("vaccine_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_document_sequences_lookup" ON "document_sequences" USING btree ("tenant_id" int4_ops,"document_type" int4_ops,"year" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_preauth_policy" ON "insurance_preauth" USING btree ("policy_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_preauth_status" ON "insurance_preauth" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_preauth_tenant" ON "insurance_preauth" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_pets_active" ON "clinic_pets" USING btree ("tenant_id" bool_ops,"is_active" bool_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_clinic_pets_pet" ON "clinic_pets" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_pets_tenant" ON "clinic_pets" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_diagnosis_codes_active" ON "diagnosis_codes" USING btree ("id" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_diagnosis_codes_category" ON "diagnosis_codes" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_diagnosis_codes_code" ON "diagnosis_codes" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_diagnosis_codes_species" ON "diagnosis_codes" USING gin ("species" array_ops);--> statement-breakpoint
CREATE INDEX "idx_diagnosis_codes_standard" ON "diagnosis_codes" USING btree ("standard" text_ops);--> statement-breakpoint
CREATE INDEX "idx_diagnosis_codes_term_search" ON "diagnosis_codes" USING gin ("term" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_drug_dosages_active" ON "drug_dosages" USING btree ("id" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_drug_dosages_name" ON "drug_dosages" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_drug_dosages_name_search" ON "drug_dosages" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_drug_dosages_route" ON "drug_dosages" USING btree ("route" text_ops);--> statement-breakpoint
CREATE INDEX "idx_drug_dosages_species" ON "drug_dosages" USING btree ("species" text_ops);--> statement-breakpoint
CREATE INDEX "idx_growth_standards_active" ON "growth_standards" USING btree ("id" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_growth_standards_breed" ON "growth_standards" USING btree ("breed" text_ops);--> statement-breakpoint
CREATE INDEX "idx_growth_standards_lookup" ON "growth_standards" USING btree ("species" int4_ops,"breed" int4_ops,"gender" int4_ops,"age_weeks" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_growth_standards_species" ON "growth_standards" USING btree ("species" text_ops);--> statement-breakpoint
CREATE INDEX "idx_reproductive_cycles_dates" ON "reproductive_cycles" USING btree ("cycle_start" timestamptz_ops,"cycle_end" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_reproductive_cycles_pet" ON "reproductive_cycles" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reproductive_cycles_recorded_by" ON "reproductive_cycles" USING btree ("recorded_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reproductive_cycles_tenant" ON "reproductive_cycles" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_reproductive_cycles_type" ON "reproductive_cycles" USING btree ("cycle_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_euthanasia_assessments_assessed_by" ON "euthanasia_assessments" USING btree ("assessed_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_euthanasia_assessments_date" ON "euthanasia_assessments" USING btree ("assessed_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_euthanasia_assessments_pet" ON "euthanasia_assessments" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_euthanasia_assessments_tenant" ON "euthanasia_assessments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_templates_category" ON "consent_templates" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_templates_code" ON "consent_templates" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_templates_tenant" ON "consent_templates" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_medical_records_active" ON "medical_records" USING btree ("tenant_id" timestamptz_ops,"deleted_at" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_medical_records_date" ON "medical_records" USING btree ("visit_date" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_medical_records_diagnosis" ON "medical_records" USING btree ("diagnosis_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_medical_records_pet" ON "medical_records" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_medical_records_pet_history" ON "medical_records" USING btree ("pet_id" uuid_ops,"visit_date" timestamptz_ops,"record_type" uuid_ops,"diagnosis_text" timestamptz_ops,"vet_id" timestamptz_ops,"weight_kg" uuid_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_medical_records_tenant" ON "medical_records" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_medical_records_type" ON "medical_records" USING btree ("record_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_medical_records_vet" ON "medical_records" USING btree ("vet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_date" ON "prescriptions" USING btree ("prescribed_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_dispensed_by" ON "prescriptions" USING btree ("dispensed_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_medical_record" ON "prescriptions" USING btree ("medical_record_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_medications_gin" ON "prescriptions" USING gin ("medications" jsonb_path_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_number" ON "prescriptions" USING btree ("prescription_number" text_ops);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_pet" ON "prescriptions" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_pet_active" ON "prescriptions" USING btree ("pet_id" uuid_ops,"prescribed_date" date_ops,"prescription_number" uuid_ops,"status" date_ops,"valid_until" uuid_ops,"vet_id" date_ops) WHERE ((deleted_at IS NULL) AND (status = ANY (ARRAY['active'::text, 'dispensed'::text])));--> statement-breakpoint
CREATE INDEX "idx_prescriptions_status" ON "prescriptions" USING btree ("status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_tenant" ON "prescriptions" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_prescriptions_vet" ON "prescriptions" USING btree ("vet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_services_booking" ON "services" USING btree ("tenant_id" text_ops,"category" int4_ops,"display_order" text_ops,"name" int4_ops,"base_price" int4_ops,"duration_minutes" int4_ops,"is_featured" text_ops,"species_allowed" int4_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_services_category" ON "services" USING btree ("tenant_id" text_ops,"category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_services_featured" ON "services" USING btree ("tenant_id" text_ops,"is_featured" text_ops) WHERE ((is_featured = true) AND (is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_services_list" ON "services" USING btree ("tenant_id" text_ops,"display_order" text_ops,"name" text_ops,"category" text_ops,"base_price" int4_ops,"duration_minutes" int4_ops,"is_featured" text_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_services_tenant" ON "services" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_services_tenant_active" ON "services" USING btree ("tenant_id" bool_ops,"is_active" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_services_tenant_name_unique" ON "services" USING btree ("tenant_id" text_ops,"name" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_appointments_calendar" ON "appointments" USING btree ("tenant_id" text_ops,"start_time" text_ops,"status" text_ops,"pet_id" text_ops,"vet_id" timestamptz_ops,"service_id" text_ops,"end_time" timestamptz_ops,"duration_minutes" text_ops,"reason" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_appointments_cancelled_by" ON "appointments" USING btree ("cancelled_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_created_by" ON "appointments" USING btree ("created_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_owner_upcoming" ON "appointments" USING btree ("pet_id" uuid_ops,"start_time" timestamptz_ops,"tenant_id" uuid_ops,"service_id" timestamptz_ops,"vet_id" timestamptz_ops,"status" timestamptz_ops,"reason" uuid_ops) WHERE ((status = ANY (ARRAY['scheduled'::text, 'confirmed'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_appointments_pet" ON "appointments" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_service" ON "appointments" USING btree ("service_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_start_brin" ON "appointments" USING brin ("start_time" timestamptz_minmax_ops) WITH (pages_per_range=64);--> statement-breakpoint
CREATE INDEX "idx_appointments_tenant" ON "appointments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_tenant_date" ON "appointments" USING btree ("tenant_id" timestamptz_ops,"start_time" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_appointments_tenant_status" ON "appointments" USING btree ("tenant_id" text_ops,"status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_appointments_upcoming" ON "appointments" USING btree ("tenant_id" text_ops,"start_time" timestamptz_ops,"status" timestamptz_ops) WHERE ((status = ANY (ARRAY['scheduled'::text, 'confirmed'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_appointments_vet" ON "appointments" USING btree ("vet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_vet_overlap" ON "appointments" USING btree ("vet_id" timestamptz_ops,"start_time" timestamptz_ops,"end_time" uuid_ops) WHERE ((status <> ALL (ARRAY['cancelled'::text, 'no_show'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_appointments_vet_schedule" ON "appointments" USING btree ("vet_id" timestamptz_ops,"start_time" timestamptz_ops,"end_time" timestamptz_ops,"tenant_id" timestamptz_ops,"pet_id" timestamptz_ops,"service_id" timestamptz_ops,"status" timestamptz_ops) WHERE ((status <> ALL (ARRAY['cancelled'::text, 'no_show'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_suppliers_active" ON "suppliers" USING btree ("is_active" bool_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_suppliers_platform_provider" ON "suppliers" USING btree ("is_platform_provider" bool_ops) WHERE (is_platform_provider = true);--> statement-breakpoint
CREATE INDEX "idx_suppliers_tenant" ON "suppliers" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_suppliers_type" ON "suppliers" USING btree ("supplier_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_suppliers_verification" ON "suppliers" USING btree ("verification_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_categories_global_catalog" ON "store_categories" USING btree ("is_global_catalog" bool_ops) WHERE (is_global_catalog = true);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_store_categories_global_slug" ON "store_categories" USING btree ("slug" text_ops) WHERE (tenant_id IS NULL);--> statement-breakpoint
CREATE INDEX "idx_store_categories_level" ON "store_categories" USING btree ("level" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_store_categories_parent" ON "store_categories" USING btree ("parent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_categories_tenant_active" ON "store_categories" USING btree ("tenant_id" text_ops,"is_active" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_store_categories_tenant_slug" ON "store_categories" USING btree ("tenant_id" text_ops,"slug" text_ops) WHERE (tenant_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_store_brands_country" ON "store_brands" USING btree ("country_origin" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_brands_global_catalog" ON "store_brands" USING btree ("is_global_catalog" bool_ops) WHERE (is_global_catalog = true);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_store_brands_global_slug" ON "store_brands" USING btree ("slug" text_ops) WHERE (tenant_id IS NULL);--> statement-breakpoint
CREATE INDEX "idx_store_brands_tenant_active" ON "store_brands" USING btree ("tenant_id" bool_ops,"is_active" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_store_brands_tenant_slug" ON "store_brands" USING btree ("tenant_id" text_ops,"slug" text_ops) WHERE (tenant_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_store_products_active" ON "store_products" USING btree ("tenant_id" timestamptz_ops,"is_active" bool_ops,"deleted_at" text_ops,"name" text_ops,"base_price" text_ops,"sale_price" text_ops,"image_url" text_ops,"is_featured" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_store_products_brand" ON "store_products" USING btree ("brand_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_products_category" ON "store_products" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_products_featured" ON "store_products" USING btree ("is_featured" bool_ops) WHERE ((is_featured = true) AND (is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_store_products_global_catalog" ON "store_products" USING btree ("is_global_catalog" bool_ops) WHERE (is_global_catalog = true);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_store_products_global_sku" ON "store_products" USING btree ("sku" text_ops) WHERE ((tenant_id IS NULL) AND (sku IS NOT NULL));--> statement-breakpoint
CREATE INDEX "idx_store_products_prescription" ON "store_products" USING btree ("requires_prescription" bool_ops) WHERE (requires_prescription = true);--> statement-breakpoint
CREATE INDEX "idx_store_products_search" ON "store_products" USING gin (to_tsvector('spanish'::regconfig, ((name || ' '::text) || COALE tsvector_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_store_products_species" ON "store_products" USING gin ("target_species" array_ops) WHERE (target_species IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_store_products_supplier" ON "store_products" USING btree ("default_supplier_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_products_tenant" ON "store_products" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_store_products_tenant_sku" ON "store_products" USING btree ("tenant_id" text_ops,"sku" text_ops) WHERE ((tenant_id IS NOT NULL) AND (sku IS NOT NULL));--> statement-breakpoint
CREATE INDEX "idx_store_products_verification" ON "store_products" USING btree ("verification_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_available" ON "store_inventory" USING btree ("tenant_id" numeric_ops,"available_quantity" text_ops) WHERE (available_quantity > (0)::numeric);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_expiry" ON "store_inventory" USING btree ("expiry_date" date_ops) WHERE (expiry_date IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_product" ON "store_inventory" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_reorder" ON "store_inventory" USING btree ("tenant_id" numeric_ops,"reorder_point" numeric_ops) WHERE (reorder_point IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_tenant" ON "store_inventory" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_test_panels_tenant" ON "lab_test_panels" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_panel_tests_panel" ON "lab_panel_tests" USING btree ("panel_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_reference_ranges_species" ON "lab_reference_ranges" USING btree ("species" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_reference_ranges_test" ON "lab_reference_ranges" USING btree ("test_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_campaigns_active" ON "store_campaigns" USING btree ("tenant_id" text_ops,"is_active" text_ops,"start_date" timestamptz_ops,"end_date" bool_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_store_campaigns_dates" ON "store_campaigns" USING btree ("start_date" timestamptz_ops,"end_date" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_store_campaigns_tenant" ON "store_campaigns" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_campaigns_type" ON "store_campaigns" USING btree ("campaign_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_coupons_code" ON "store_coupons" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_coupons_tenant" ON "store_coupons" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_orders_created" ON "store_orders" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_store_orders_customer" ON "store_orders" USING btree ("customer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_orders_number" ON "store_orders" USING btree ("order_number" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_orders_payment_status" ON "store_orders" USING btree ("payment_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_orders_status" ON "store_orders" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_orders_tenant" ON "store_orders" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_order_items_order" ON "store_order_items" USING btree ("order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_order_items_product" ON "store_order_items" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_order_items_tenant" ON "store_order_items" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_template_fields_template" ON "consent_template_fields" USING btree ("template_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_audit_document" ON "consent_audit_log" USING btree ("consent_document_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_requests_status" ON "consent_requests" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_requests_tenant" ON "consent_requests" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_consent_requests_token" ON "consent_requests" USING btree ("request_token" text_ops);--> statement-breakpoint
CREATE INDEX "idx_blanket_consents_owner" ON "blanket_consents" USING btree ("owner_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_blanket_consents_tenant" ON "blanket_consents" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_reviews_approved" ON "store_reviews" USING btree ("is_approved" timestamptz_ops,"created_at" bool_ops) WHERE ((is_approved = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_store_reviews_customer" ON "store_reviews" USING btree ("customer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_reviews_product" ON "store_reviews" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_reviews_rating" ON "store_reviews" USING btree ("rating" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_store_reviews_tenant" ON "store_reviews" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_wishlist_customer" ON "store_wishlist" USING btree ("customer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_wishlist_product" ON "store_wishlist" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_wishlist_tenant" ON "store_wishlist" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_procurement_leads_confidence" ON "procurement_leads" USING btree ("match_confidence" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_procurement_leads_matched_product" ON "procurement_leads" USING btree ("matched_product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_procurement_leads_new_flags" ON "procurement_leads" USING btree ("is_new_product" bool_ops,"is_new_brand" bool_ops,"is_new_supplier" bool_ops) WHERE ((is_new_product = true) OR (is_new_brand = true) OR (is_new_supplier = true));--> statement-breakpoint
CREATE INDEX "idx_procurement_leads_status" ON "procurement_leads" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_procurement_leads_tenant" ON "procurement_leads" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_shifts_dates" ON "staff_shifts" USING btree ("scheduled_start" timestamptz_ops,"scheduled_end" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_shifts_profile" ON "staff_shifts" USING btree ("staff_profile_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_shifts_tenant" ON "staff_shifts" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_payment_methods_active" ON "payment_methods" USING btree ("is_active" bool_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE UNIQUE INDEX "idx_payment_methods_one_default" ON "payment_methods" USING btree ("tenant_id" text_ops) WHERE ((is_default = true) AND (is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_payment_methods_tenant" ON "payment_methods" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_time_off_requests_profile" ON "time_off_requests" USING btree ("staff_profile_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_time_off_requests_status" ON "time_off_requests" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_time_off_requests_tenant" ON "time_off_requests" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_tasks_assigned" ON "staff_tasks" USING btree ("assigned_to" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_tasks_status" ON "staff_tasks" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_tasks_tenant" ON "staff_tasks" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_reviews_profile" ON "staff_reviews" USING btree ("staff_profile_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_invoices_client" ON "invoices" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_invoices_client_history" ON "invoices" USING btree ("client_id" date_ops,"invoice_date" date_ops,"invoice_number" uuid_ops,"total" uuid_ops,"status" uuid_ops,"balance_due" date_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_invoices_date_brin" ON "invoices" USING brin ("invoice_date" date_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_invoices_list" ON "invoices" USING btree ("tenant_id" text_ops,"invoice_date" date_ops,"invoice_number" date_ops,"client_id" date_ops,"total" date_ops,"status" date_ops,"amount_paid" text_ops,"balance_due" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_invoices_overdue" ON "invoices" USING btree ("due_date" date_ops) WHERE ((status <> ALL (ARRAY['paid'::text, 'void'::text, 'refunded'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_invoices_pet" ON "invoices" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_invoices_tenant" ON "invoices" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_invoices_unpaid" ON "invoices" USING btree ("tenant_id" date_ops,"status" date_ops,"due_date" text_ops,"invoice_number" date_ops,"client_id" date_ops,"total" date_ops,"balance_due" date_ops) WHERE ((status <> ALL (ARRAY['paid'::text, 'void'::text, 'refunded'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_invoice_items_invoice" ON "invoice_items" USING btree ("invoice_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_invoice_items_product" ON "invoice_items" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_invoice_items_service" ON "invoice_items" USING btree ("service_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_invoice_items_tenant" ON "invoice_items" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_daily_report" ON "payments" USING btree ("tenant_id" text_ops,"payment_date" date_ops,"invoice_id" text_ops,"amount" text_ops,"payment_method_name" text_ops,"status" date_ops) WHERE (status = 'completed'::text);--> statement-breakpoint
CREATE INDEX "idx_payments_date_brin" ON "payments" USING brin ("payment_date" date_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_payments_invoice" ON "payments" USING btree ("invoice_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_invoice_list" ON "payments" USING btree ("invoice_id" date_ops,"payment_date" uuid_ops,"amount" date_ops,"payment_method_name" date_ops,"status" date_ops,"reference_number" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_payments_tenant" ON "payments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_refunds_payment" ON "refunds" USING btree ("payment_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_refunds_tenant" ON "refunds" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_notes_created_by" ON "hospitalization_notes" USING btree ("created_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_notes_hosp" ON "hospitalization_notes" USING btree ("hospitalization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_notes_tenant" ON "hospitalization_notes" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_expenses_category" ON "expenses" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_expenses_date_brin" ON "expenses" USING brin ("expense_date" date_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_expenses_report" ON "expenses" USING btree ("tenant_id" date_ops,"expense_date" text_ops,"category" date_ops,"amount" date_ops,"status" date_ops,"vendor_name" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_expenses_status" ON "expenses" USING btree ("status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_expenses_tenant" ON "expenses" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_expense_categories_tenant" ON "expense_categories" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_loyalty_points_client" ON "loyalty_points" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_loyalty_points_tenant" ON "loyalty_points" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_loyalty_transactions_client" ON "loyalty_transactions" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_loyalty_transactions_date_brin" ON "loyalty_transactions" USING brin ("created_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_loyalty_transactions_tenant" ON "loyalty_transactions" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_loyalty_transactions_type" ON "loyalty_transactions" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_communication_prefs_user" ON "communication_preferences" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_date" ON "store_inventory_transactions" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_product" ON "store_inventory_transactions" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_reference" ON "store_inventory_transactions" USING btree ("reference_type" text_ops,"reference_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_tenant" ON "store_inventory_transactions" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_type" ON "store_inventory_transactions" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_txn_date_brin" ON "store_inventory_transactions" USING brin ("created_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_txn_product" ON "store_inventory_transactions" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_inventory_txn_tenant" ON "store_inventory_transactions" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_kennels_available" ON "kennels" USING btree ("tenant_id" text_ops,"current_status" text_ops) WHERE ((current_status = 'available'::text) AND (is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_kennels_status" ON "kennels" USING btree ("current_status" text_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_kennels_tenant" ON "kennels" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_kennels_type" ON "kennels" USING btree ("tenant_id" text_ops,"kennel_type" text_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_active" ON "hospitalizations" USING btree ("tenant_id" text_ops,"status" text_ops) WHERE ((status <> ALL (ARRAY['discharged'::text, 'deceased'::text, 'transferred'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_admitted_by" ON "hospitalizations" USING btree ("admitted_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_board" ON "hospitalizations" USING btree ("tenant_id" text_ops,"status" text_ops,"acuity_level" text_ops,"pet_id" text_ops,"kennel_id" text_ops,"admitted_at" text_ops,"expected_discharge" text_ops,"diagnosis" text_ops,"primary_vet_id" text_ops) WHERE ((status <> ALL (ARRAY['discharged'::text, 'deceased'::text, 'transferred'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_discharged_by" ON "hospitalizations" USING btree ("discharged_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_kennel" ON "hospitalizations" USING btree ("kennel_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_hospitalizations_one_active_per_pet" ON "hospitalizations" USING btree ("pet_id" uuid_ops) WHERE ((status <> ALL (ARRAY['discharged'::text, 'deceased'::text, 'transferred'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_pet" ON "hospitalizations" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_primary_vet" ON "hospitalizations" USING btree ("primary_vet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_status" ON "hospitalizations" USING btree ("status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_hospitalizations_tenant" ON "hospitalizations" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_vitals_hosp" ON "hospitalization_vitals" USING btree ("hospitalization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_vitals_recorded_brin" ON "hospitalization_vitals" USING brin ("recorded_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_vitals_recorded_by" ON "hospitalization_vitals" USING btree ("recorded_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_vitals_tenant" ON "hospitalization_vitals" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_medications_administered_by" ON "hospitalization_medications" USING btree ("administered_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_medications_hosp" ON "hospitalization_medications" USING btree ("hospitalization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_medications_scheduled" ON "hospitalization_medications" USING btree ("scheduled_at" timestamptz_ops) WHERE (status = 'scheduled'::text);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_medications_tenant" ON "hospitalization_medications" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_meds_scheduled_brin" ON "hospitalization_medications" USING brin ("scheduled_at" timestamptz_minmax_ops) WITH (pages_per_range=32) WHERE (scheduled_at IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_treatments_hosp" ON "hospitalization_treatments" USING btree ("hospitalization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_treatments_performed_by" ON "hospitalization_treatments" USING btree ("performed_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_treatments_tenant" ON "hospitalization_treatments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_feedings_fed_by" ON "hospitalization_feedings" USING btree ("fed_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_feedings_hosp" ON "hospitalization_feedings" USING btree ("hospitalization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_hospitalization_feedings_tenant" ON "hospitalization_feedings" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_campaign_items_campaign" ON "store_campaign_items" USING btree ("campaign_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_campaign_items_product" ON "store_campaign_items" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_campaign_items_tenant" ON "store_campaign_items" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_enhanced_record" ON "audit_log_enhanced" USING btree ("record_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_enhanced_table" ON "audit_log_enhanced" USING btree ("table_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_enhanced_tenant" ON "audit_log_enhanced" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_enhanced_time" ON "audit_log_enhanced" USING btree ("occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_enhanced_user" ON "audit_log_enhanced" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_severity" ON "security_events" USING btree ("severity" text_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_time" ON "security_events" USING btree ("occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_type" ON "security_events" USING btree ("event_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_security_events_user" ON "security_events" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_data_access_table" ON "data_access_log" USING btree ("table_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_data_access_time" ON "data_access_log" USING btree ("occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_data_access_user" ON "data_access_log" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_mv_refresh_log_time" ON "materialized_view_refresh_log" USING btree ("refresh_started_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_mv_refresh_log_view" ON "materialized_view_refresh_log" USING btree ("view_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_job_log_name" ON "scheduled_job_log" USING btree ("job_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_job_log_time" ON "scheduled_job_log" USING btree ("started_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_loyalty_rules_tenant" ON "loyalty_rules" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_comments_created_by" ON "lab_result_comments" USING btree ("created_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_comments_order" ON "lab_result_comments" USING btree ("lab_order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_comments_tenant" ON "lab_result_comments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_test_catalog_active" ON "lab_test_catalog" USING btree ("is_active" bool_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_lab_test_catalog_category" ON "lab_test_catalog" USING btree ("category" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_lab_test_catalog_global_code" ON "lab_test_catalog" USING btree ("code" text_ops) WHERE ((tenant_id IS NULL) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_lab_test_catalog_name_search" ON "lab_test_catalog" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_test_catalog_ranges_gin" ON "lab_test_catalog" USING gin ("reference_ranges" jsonb_path_ops) WHERE ((reference_ranges IS NOT NULL) AND (reference_ranges <> '{}'::jsonb));--> statement-breakpoint
CREATE INDEX "idx_lab_test_catalog_sample_type" ON "lab_test_catalog" USING btree ("sample_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_test_catalog_tenant" ON "lab_test_catalog" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_panels_active" ON "lab_panels" USING btree ("is_active" bool_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_lab_panels_tenant" ON "lab_panels" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_collected_by" ON "lab_orders" USING btree ("collected_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_created_brin" ON "lab_orders" USING brin ("created_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_medical_record" ON "lab_orders" USING btree ("medical_record_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_ordered_by" ON "lab_orders" USING btree ("ordered_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_pending" ON "lab_orders" USING btree ("tenant_id" text_ops,"priority" text_ops) WHERE ((status = ANY (ARRAY['pending'::text, 'collected'::text, 'processing'::text])) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_lab_orders_pet" ON "lab_orders" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_reviewed_by" ON "lab_orders" USING btree ("reviewed_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_status" ON "lab_orders" USING btree ("status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_lab_orders_tenant" ON "lab_orders" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_order_items_order" ON "lab_order_items" USING btree ("lab_order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_order_items_status" ON "lab_order_items" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_order_items_tenant" ON "lab_order_items" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_order_items_test" ON "lab_order_items" USING btree ("test_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_results_abnormal" ON "lab_results" USING btree ("is_abnormal" bool_ops) WHERE (is_abnormal = true);--> statement-breakpoint
CREATE INDEX "idx_lab_results_entered_by" ON "lab_results" USING btree ("entered_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_results_flag" ON "lab_results" USING btree ("flag" text_ops) WHERE (flag = ANY (ARRAY['critical_low'::text, 'critical_high'::text]));--> statement-breakpoint
CREATE INDEX "idx_lab_results_order" ON "lab_results" USING btree ("lab_order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_results_tenant" ON "lab_results" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_results_test" ON "lab_results" USING btree ("test_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_attachments_order" ON "lab_result_attachments" USING btree ("lab_order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_attachments_tenant" ON "lab_result_attachments" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lab_attachments_uploaded_by" ON "lab_result_attachments" USING btree ("uploaded_by" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_client_credits_active" ON "client_credits" USING btree ("status" text_ops) WHERE (status = 'active'::text);--> statement-breakpoint
CREATE INDEX "idx_client_credits_client" ON "client_credits" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_client_credits_tenant" ON "client_credits" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_providers_active" ON "insurance_providers" USING btree ("is_active" bool_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_insurance_providers_address_gin" ON "insurance_providers" USING gin ("address" jsonb_path_ops) WHERE (address IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_insurance_policies_coverage_gin" ON "insurance_policies" USING gin ("coverage_details" jsonb_path_ops) WHERE ((coverage_details IS NOT NULL) AND (coverage_details <> '{}'::jsonb));--> statement-breakpoint
CREATE INDEX "idx_insurance_policies_pet" ON "insurance_policies" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_policies_provider" ON "insurance_policies" USING btree ("provider_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_policies_status" ON "insurance_policies" USING btree ("status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_insurance_policies_tenant" ON "insurance_policies" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_pet" ON "insurance_claims" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_policy" ON "insurance_claims" USING btree ("policy_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_status" ON "insurance_claims" USING btree ("status" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_insurance_claims_tenant" ON "insurance_claims" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_claim_items_claim" ON "insurance_claim_items" USING btree ("claim_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_insurance_claim_items_tenant" ON "insurance_claim_items" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_assigned" ON "conversations" USING btree ("assigned_to" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_client" ON "conversations" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_client_history" ON "conversations" USING btree ("client_id" timestamptz_ops,"last_message_at" uuid_ops,"tenant_id" uuid_ops,"subject" timestamptz_ops,"status" uuid_ops,"unread_client_count" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_inbox" ON "conversations" USING btree ("tenant_id" timestamptz_ops,"unread_staff_count" int4_ops,"last_message_at" int4_ops,"client_id" text_ops,"pet_id" int4_ops,"subject" int4_ops,"status" int4_ops,"priority" text_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_last_message" ON "conversations" USING btree ("last_message_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_pet" ON "conversations" USING btree ("pet_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_status" ON "conversations" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_tenant" ON "conversations" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_unread_staff" ON "conversations" USING btree ("unread_staff_count" int4_ops) WHERE (unread_staff_count > 0);--> statement-breakpoint
CREATE INDEX "idx_messages_attachments_gin" ON "messages" USING gin ("attachments" jsonb_path_ops) WHERE ((attachments IS NOT NULL) AND (attachments <> '[]'::jsonb));--> statement-breakpoint
CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_created_brin" ON "messages" USING brin ("created_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_messages_metadata_gin" ON "messages" USING gin ("metadata" jsonb_path_ops) WHERE ((metadata IS NOT NULL) AND (metadata <> '{}'::jsonb));--> statement-breakpoint
CREATE INDEX "idx_messages_sender" ON "messages" USING btree ("sender_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_status" ON "messages" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_tenant" ON "messages" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_message_templates_active" ON "message_templates" USING btree ("is_active" bool_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_message_templates_category" ON "message_templates" USING btree ("category" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_message_templates_global_code" ON "message_templates" USING btree ("code" text_ops) WHERE ((tenant_id IS NULL) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_message_templates_tenant" ON "message_templates" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_reminders_client" ON "reminders" USING btree ("client_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reminders_queue" ON "reminders" USING btree ("scheduled_at" text_ops,"status" text_ops,"tenant_id" text_ops,"client_id" text_ops,"pet_id" timestamptz_ops,"type" text_ops,"reference_type" text_ops,"reference_id" timestamptz_ops) WHERE (status = 'pending'::text);--> statement-breakpoint
CREATE INDEX "idx_reminders_reference" ON "reminders" USING btree ("reference_type" text_ops,"reference_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reminders_scheduled" ON "reminders" USING btree ("scheduled_at" timestamptz_ops) WHERE (status = 'pending'::text);--> statement-breakpoint
CREATE INDEX "idx_reminders_scheduled_brin" ON "reminders" USING brin ("scheduled_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_reminders_status" ON "reminders" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_reminders_tenant" ON "reminders" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_qr_tag_scans_scanned_brin" ON "qr_tag_scans" USING brin ("scanned_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_qr_tag_scans_tag" ON "qr_tag_scans" USING btree ("tag_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_qr_tag_scans_tenant" ON "qr_tag_scans" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_profiles_active" ON "staff_profiles" USING btree ("is_active" bool_ops) WHERE ((is_active = true) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_staff_profiles_profile" ON "staff_profiles" USING btree ("profile_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_profiles_tenant" ON "staff_profiles" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_schedules_active" ON "staff_schedules" USING btree ("is_active" bool_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_staff_schedules_staff" ON "staff_schedules" USING btree ("staff_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_schedules_tenant" ON "staff_schedules" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_schedule_entries_day" ON "staff_schedule_entries" USING btree ("day_of_week" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_schedule_entries_schedule" ON "staff_schedule_entries" USING btree ("schedule_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_schedule_entries_tenant" ON "staff_schedule_entries" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_time_off_types_tenant" ON "time_off_types" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_time_off_dates" ON "staff_time_off" USING btree ("start_date" date_ops,"end_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_time_off_staff" ON "staff_time_off" USING btree ("staff_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_staff_time_off_status" ON "staff_time_off" USING btree ("status" text_ops) WHERE (status = 'pending'::text);--> statement-breakpoint
CREATE INDEX "idx_staff_time_off_tenant" ON "staff_time_off" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_profiles_active" ON "clinic_profiles" USING btree ("tenant_id" text_ops,"is_active" bool_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_clinic_profiles_profile" ON "clinic_profiles" USING btree ("profile_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_clinic_profiles_tenant" ON "clinic_profiles" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_notification_queue_created_brin" ON "notification_queue" USING brin ("created_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_notification_queue_status" ON "notification_queue" USING btree ("status" text_ops) WHERE (status = 'queued'::text);--> statement-breakpoint
CREATE INDEX "idx_notification_queue_tenant" ON "notification_queue" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_store_price_history_date" ON "store_price_history" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_store_price_history_date_brin" ON "store_price_history" USING brin ("created_at" timestamptz_minmax_ops) WITH (pages_per_range=32);--> statement-breakpoint
CREATE INDEX "idx_store_price_history_product" ON "store_price_history" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_store_price_history_tenant" ON "store_price_history" USING btree ("tenant_id" text_ops);--> statement-breakpoint
CREATE VIEW "public"."tenant_public_info" AS (SELECT id, name, logo_url, city, country, is_active FROM tenants WHERE is_active = true);--> statement-breakpoint
CREATE VIEW "public"."recent_job_executions" AS (SELECT job_name, started_at, completed_at, duration_ms, status, rows_affected, error_message FROM scheduled_job_log WHERE started_at > (now() - '24:00:00'::interval) ORDER BY started_at DESC);--> statement-breakpoint
CREATE VIEW "public"."job_statistics" AS (SELECT job_name, count(*) AS total_runs, count(*) FILTER (WHERE status = 'completed'::text) AS successful_runs, count(*) FILTER (WHERE status = 'failed'::text) AS failed_runs, round(100.0 * count(*) FILTER (WHERE status = 'completed'::text)::numeric / NULLIF(count(*), 0)::numeric, 2) AS success_rate, avg(duration_ms) FILTER (WHERE status = 'completed'::text) AS avg_duration_ms, max(started_at) AS last_run FROM scheduled_job_log WHERE started_at > (now() - '7 days'::interval) GROUP BY job_name ORDER BY job_name);--> statement-breakpoint
CREATE POLICY "Authenticated users view own tenant" ON "tenants" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((is_active = true) AND ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.tenant_id = tenants.id)))) OR true)));--> statement-breakpoint
CREATE POLICY "Service role full access" ON "tenants" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access" ON "profiles" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Staff update tenant profiles" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Staff view tenant profiles" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users insert own profile" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users view own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role manage demo accounts" ON "demo_accounts" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Service role full access" ON "clinic_invites" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage invites" ON "clinic_invites" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clinic staff manage assignments" ON "clinic_product_assignments" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = clinic_product_assignments.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = clinic_product_assignments.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access assignments" ON "clinic_product_assignments" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access product assignments" ON "clinic_product_assignments" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Owners manage own pets" ON "pets" AS PERMISSIVE FOR ALL TO "authenticated" USING (((owner_id = auth.uid()) AND (deleted_at IS NULL))) WITH CHECK ((owner_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Service role full access" ON "pets" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage tenant pets" ON "pets" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public lookup tags" ON "qr_tags" AS PERMISSIVE FOR SELECT TO public USING (((is_active = true) AND (is_registered = true)));--> statement-breakpoint
CREATE POLICY "Service role full access tags" ON "qr_tags" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage tags" ON "qr_tags" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners manage own lost pets" ON "lost_pets" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_owner_of_pet(pet_id));--> statement-breakpoint
CREATE POLICY "Public view lost pets" ON "lost_pets" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role full access lost pets" ON "lost_pets" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage lost pets" ON "lost_pets" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public read global templates" ON "vaccine_templates" AS PERMISSIVE FOR SELECT TO public USING (((tenant_id IS NULL) AND (is_active = true) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access templates" ON "vaccine_templates" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage tenant templates" ON "vaccine_templates" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Staff read tenant templates" ON "vaccine_templates" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view pet vaccines" ON "vaccines" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access vaccines" ON "vaccines" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Owners view pet reactions" ON "vaccine_reactions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_owner_of_pet(pet_id));--> statement-breakpoint
CREATE POLICY "Service role full access reactions" ON "vaccine_reactions" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Admin manage sequences" ON "document_sequences" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = document_sequences.tenant_id) AND (p.role = 'admin'::text) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access sequences" ON "document_sequences" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access preauth" ON "insurance_preauth" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage preauth" ON "insurance_preauth" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clinic staff manage clinic_pets" ON "clinic_pets" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = clinic_pets.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = clinic_pets.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Owners view their pets clinic relationships" ON "clinic_pets" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access clinic_pets" ON "clinic_pets" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Public read diagnosis codes" ON "diagnosis_codes" AS PERMISSIVE FOR SELECT TO public USING ((deleted_at IS NULL));--> statement-breakpoint
CREATE POLICY "Service role manage diagnosis codes" ON "diagnosis_codes" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Public read drug dosages" ON "drug_dosages" AS PERMISSIVE FOR SELECT TO public USING ((deleted_at IS NULL));--> statement-breakpoint
CREATE POLICY "Service role manage drug dosages" ON "drug_dosages" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Public read growth standards" ON "growth_standards" AS PERMISSIVE FOR SELECT TO public USING ((deleted_at IS NULL));--> statement-breakpoint
CREATE POLICY "Service role manage growth standards" ON "growth_standards" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Owners view pet cycles" ON "reproductive_cycles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access cycles" ON "reproductive_cycles" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage reproductive cycles" ON "reproductive_cycles" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view pet assessments" ON "euthanasia_assessments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access assessments" ON "euthanasia_assessments" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage assessments" ON "euthanasia_assessments" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clinic templates managed by staff" ON "consent_templates" AS PERMISSIVE FOR ALL TO "authenticated" USING (((tenant_id IS NOT NULL) AND is_staff_of(tenant_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Global templates viewable by all" ON "consent_templates" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access consent_templates" ON "consent_templates" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Owners view pet records" ON "medical_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access records" ON "medical_records" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage medical records" ON "medical_records" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view pet prescriptions" ON "prescriptions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access prescriptions" ON "prescriptions" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage prescriptions" ON "prescriptions" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users manage own preferences" ON "notification_preferences" AS PERMISSIVE FOR ALL TO public USING ((client_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Public view active services" ON "services" AS PERMISSIVE FOR SELECT TO public USING (((is_active = true) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access" ON "services" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage services" ON "services" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners cancel appointments" ON "appointments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text])) AND (deleted_at IS NULL))) WITH CHECK ((status = 'cancelled'::text));--> statement-breakpoint
CREATE POLICY "Owners create appointments" ON "appointments" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view pet appointments" ON "appointments" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access" ON "appointments" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage appointments" ON "appointments" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Authenticated users view suppliers" ON "suppliers" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((tenant_id IS NULL) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = suppliers.tenant_id) AND (p.deleted_at IS NULL))))));--> statement-breakpoint
CREATE POLICY "Clinic staff manage suppliers" ON "suppliers" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Platform admins manage global suppliers" ON "suppliers" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access suppliers" ON "suppliers" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Authenticated users view categories" ON "store_categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((tenant_id IS NULL) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_categories.tenant_id) AND (p.deleted_at IS NULL))))));--> statement-breakpoint
CREATE POLICY "Clinic staff manage categories" ON "store_categories" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Platform admins manage global categories" ON "store_categories" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access categories" ON "store_categories" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Authenticated users view brands" ON "store_brands" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((tenant_id IS NULL) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_brands.tenant_id) AND (p.deleted_at IS NULL))))));--> statement-breakpoint
CREATE POLICY "Clinic staff manage brands" ON "store_brands" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Platform admins manage global brands" ON "store_brands" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access brands" ON "store_brands" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Authenticated users view products" ON "store_products" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((tenant_id IS NULL) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_products.tenant_id) AND (p.deleted_at IS NULL))))));--> statement-breakpoint
CREATE POLICY "Clinic staff manage products" ON "store_products" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Platform admins manage global products" ON "store_products" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access products" ON "store_products" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Clinic staff manage inventory" ON "store_inventory" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_inventory.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_inventory.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access inventory" ON "store_inventory" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Clinic staff manage campaigns" ON "store_campaigns" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_campaigns.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_campaigns.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access campaigns" ON "store_campaigns" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Clinic staff manage coupons" ON "store_coupons" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_coupons.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_coupons.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access coupons" ON "store_coupons" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Clinic staff manage orders" ON "store_orders" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_orders.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_orders.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Customers view own orders" ON "store_orders" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access orders" ON "store_orders" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Customers view own order_items" ON "store_order_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM store_orders o
  WHERE ((o.id = store_order_items.order_id) AND (o.customer_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Service role full access order_items" ON "store_order_items" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Clinic staff moderate reviews" ON "store_reviews" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_reviews.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_reviews.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Customers manage own reviews" ON "store_reviews" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public view approved reviews" ON "store_reviews" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role full access reviews" ON "store_reviews" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Customers manage own wishlist" ON "store_wishlist" AS PERMISSIVE FOR ALL TO "authenticated" USING ((customer_id = auth.uid())) WITH CHECK ((customer_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Service role full access wishlist" ON "store_wishlist" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Clinic staff manage procurement" ON "procurement_leads" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = procurement_leads.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = procurement_leads.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Platform admins view procurement" ON "procurement_leads" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access procurement" ON "procurement_leads" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access payment methods" ON "payment_methods" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage payment methods" ON "payment_methods" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients view own invoices" ON "invoices" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((client_id = auth.uid()) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access invoices" ON "invoices" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage invoices" ON "invoices" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients view invoice items" ON "invoice_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM invoices i
  WHERE ((i.id = invoice_items.invoice_id) AND (i.client_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Service role full access invoice items" ON "invoice_items" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage invoice items" ON "invoice_items" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients view own payments" ON "payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM invoices i
  WHERE ((i.id = payments.invoice_id) AND (i.client_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Service role full access payments" ON "payments" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage payments" ON "payments" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access refunds" ON "refunds" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage refunds" ON "refunds" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view notes" ON "hospitalization_notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM hospitalizations h
  WHERE ((h.id = hospitalization_notes.hospitalization_id) AND is_owner_of_pet(h.pet_id)))));--> statement-breakpoint
CREATE POLICY "Service role full access notes" ON "hospitalization_notes" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage notes" ON "hospitalization_notes" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access expenses" ON "expenses" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage expenses" ON "expenses" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access expense categories" ON "expense_categories" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage expense categories" ON "expense_categories" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients view own points" ON "loyalty_points" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((client_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Service role full access loyalty points" ON "loyalty_points" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage loyalty points" ON "loyalty_points" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients view own transactions" ON "loyalty_transactions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((client_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Service role full access loyalty transactions" ON "loyalty_transactions" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage loyalty transactions" ON "loyalty_transactions" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access preferences" ON "communication_preferences" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff view preferences" ON "communication_preferences" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users manage own preferences" ON "communication_preferences" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clinic staff manage inventory_txns" ON "store_inventory_transactions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_inventory_transactions.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_inventory_transactions.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access inv txn" ON "store_inventory_transactions" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access inventory_txns" ON "store_inventory_transactions" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access kennels" ON "kennels" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage kennels" ON "kennels" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view pet hospitalizations" ON "hospitalizations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access hospitalizations" ON "hospitalizations" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage hospitalizations" ON "hospitalizations" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view vitals" ON "hospitalization_vitals" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM hospitalizations h
  WHERE ((h.id = hospitalization_vitals.hospitalization_id) AND is_owner_of_pet(h.pet_id)))));--> statement-breakpoint
CREATE POLICY "Service role full access vitals" ON "hospitalization_vitals" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage vitals" ON "hospitalization_vitals" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access medications" ON "hospitalization_medications" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage medications" ON "hospitalization_medications" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access treatments" ON "hospitalization_treatments" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage treatments" ON "hospitalization_treatments" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access feedings" ON "hospitalization_feedings" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage feedings" ON "hospitalization_feedings" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clinic staff manage campaign_items" ON "store_campaign_items" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_campaign_items.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = store_campaign_items.tenant_id) AND (p.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access campaign items" ON "store_campaign_items" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access campaign_items" ON "store_campaign_items" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Service role full access loyalty rules" ON "loyalty_rules" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage loyalty rules" ON "loyalty_rules" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Anyone can view active subcategories" ON "store_subcategories" AS PERMISSIVE FOR SELECT TO public USING ((is_active = true));--> statement-breakpoint
CREATE POLICY "Service role full access comments" ON "lab_result_comments" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage comments" ON "lab_result_comments" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public read lab tests" ON "lab_test_catalog" AS PERMISSIVE FOR SELECT TO public USING (((is_active = true) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access lab tests" ON "lab_test_catalog" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage tenant tests" ON "lab_test_catalog" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Anyone can view active variants" ON "store_product_variants" AS PERMISSIVE FOR SELECT TO public USING ((is_active = true));--> statement-breakpoint
CREATE POLICY "Public read lab panels" ON "lab_panels" AS PERMISSIVE FOR SELECT TO public USING (((is_active = true) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access panels" ON "lab_panels" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage panels" ON "lab_panels" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view pet lab orders" ON "lab_orders" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (status = ANY (ARRAY['completed'::text, 'reviewed'::text])) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access lab orders" ON "lab_orders" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage lab orders" ON "lab_orders" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view order items" ON "lab_order_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM lab_orders lo
  WHERE ((lo.id = lab_order_items.lab_order_id) AND is_owner_of_pet(lo.pet_id) AND (lo.status = ANY (ARRAY['completed'::text, 'reviewed'::text]))))));--> statement-breakpoint
CREATE POLICY "Service role full access order items" ON "lab_order_items" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage order items" ON "lab_order_items" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view results" ON "lab_results" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM lab_orders lo
  WHERE ((lo.id = lab_results.lab_order_id) AND is_owner_of_pet(lo.pet_id) AND (lo.status = ANY (ARRAY['completed'::text, 'reviewed'::text]))))));--> statement-breakpoint
CREATE POLICY "Service role full access results" ON "lab_results" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage results" ON "lab_results" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view attachments" ON "lab_result_attachments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM lab_orders lo
  WHERE ((lo.id = lab_result_attachments.lab_order_id) AND is_owner_of_pet(lo.pet_id) AND (lo.status = ANY (ARRAY['completed'::text, 'reviewed'::text]))))));--> statement-breakpoint
CREATE POLICY "Service role full access attachments" ON "lab_result_attachments" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage attachments" ON "lab_result_attachments" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients view own credits" ON "client_credits" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((client_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Service role full access credits" ON "client_credits" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage credits" ON "client_credits" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public read providers" ON "insurance_providers" AS PERMISSIVE FOR SELECT TO public USING ((is_active = true));--> statement-breakpoint
CREATE POLICY "Service role manage providers" ON "insurance_providers" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Owners view pet policies" ON "insurance_policies" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access policies" ON "insurance_policies" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage policies" ON "insurance_policies" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Owners view pet claims" ON "insurance_claims" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((is_owner_of_pet(pet_id) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role full access claims" ON "insurance_claims" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage claims" ON "insurance_claims" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access claim items" ON "insurance_claim_items" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage claim items" ON "insurance_claim_items" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients create conversations" ON "conversations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((client_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Clients view own conversations" ON "conversations" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access conversations" ON "conversations" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage conversations" ON "conversations" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients send messages" ON "messages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((sender_type = 'client'::text) AND (sender_id = auth.uid())));--> statement-breakpoint
CREATE POLICY "Clients view own messages" ON "messages" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access messages" ON "messages" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage messages" ON "messages" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Read templates" ON "message_templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((((tenant_id IS NULL) OR is_staff_of(tenant_id)) AND (deleted_at IS NULL)));--> statement-breakpoint
CREATE POLICY "Service role manage templates" ON "message_templates" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage templates" ON "message_templates" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clients view own reminders" ON "reminders" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((client_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Service role full access reminders" ON "reminders" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage reminders" ON "reminders" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public log scans" ON "qr_tag_scans" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Service role full access scans" ON "qr_tag_scans" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Admin manage all profiles" ON "staff_profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = staff_profiles.tenant_id) AND (p.role = 'admin'::text) AND (p.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access staff profiles" ON "staff_profiles" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff manage own profile" ON "staff_profiles" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Staff view all profiles" ON "staff_profiles" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Admin manage schedules" ON "staff_schedules" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = staff_schedules.tenant_id) AND (p.role = 'admin'::text)))));--> statement-breakpoint
CREATE POLICY "Service role full access schedules" ON "staff_schedules" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff view schedules" ON "staff_schedules" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Access schedule entries" ON "staff_schedule_entries" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_staff_of(tenant_id));--> statement-breakpoint
CREATE POLICY "Service role full access entries" ON "staff_schedule_entries" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Admin manage time off types" ON "time_off_types" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = time_off_types.tenant_id) AND (p.role = 'admin'::text)))));--> statement-breakpoint
CREATE POLICY "Service role full access time off types" ON "time_off_types" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff view time off types" ON "time_off_types" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Admin manage time off" ON "staff_time_off" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.tenant_id = staff_time_off.tenant_id) AND (p.role = 'admin'::text)))));--> statement-breakpoint
CREATE POLICY "Service role full access time off" ON "staff_time_off" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Staff request time off" ON "staff_time_off" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Staff view own time off" ON "staff_time_off" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Clinic staff manage clinic memberships" ON "clinic_profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM clinic_profiles cp
  WHERE ((cp.profile_id = auth.uid()) AND (cp.tenant_id = clinic_profiles.tenant_id) AND (cp.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (cp.is_active = true) AND (cp.deleted_at IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM clinic_profiles cp
  WHERE ((cp.profile_id = auth.uid()) AND (cp.tenant_id = clinic_profiles.tenant_id) AND (cp.role = ANY (ARRAY['vet'::text, 'admin'::text])) AND (cp.is_active = true) AND (cp.deleted_at IS NULL)))));--> statement-breakpoint
CREATE POLICY "Service role full access clinic_profiles" ON "clinic_profiles" AS PERMISSIVE FOR ALL TO "service_role";--> statement-breakpoint
CREATE POLICY "Users view own clinic memberships" ON "clinic_profiles" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access queue" ON "notification_queue" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Staff manage queue" ON "notification_queue" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Service role full access price history" ON "store_price_history" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "Service role full access price_history" ON "store_price_history" AS PERMISSIVE FOR ALL TO "service_role";
*/