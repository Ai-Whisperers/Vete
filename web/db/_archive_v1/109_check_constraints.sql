-- =============================================================================
-- 109_CHECK_CONSTRAINTS.SQL
-- =============================================================================
-- Add data validation constraints to ensure data integrity at the database level
-- These constraints prevent invalid data from being inserted or updated
-- =============================================================================

-- =============================================================================
-- A. FINANCIAL CONSTRAINTS
-- =============================================================================

-- Services - price validation
ALTER TABLE services
ADD CONSTRAINT IF NOT EXISTS services_price_positive
    CHECK (base_price >= 0);

ALTER TABLE services
ADD CONSTRAINT IF NOT EXISTS services_duration_positive
    CHECK (duration_minutes > 0);

-- Store products - price validation
ALTER TABLE store_products
ADD CONSTRAINT IF NOT EXISTS products_price_positive
    CHECK (base_price >= 0);

-- Invoice items - price and quantity validation
ALTER TABLE invoice_items
ADD CONSTRAINT IF NOT EXISTS invoice_items_price_positive
    CHECK (unit_price >= 0);

ALTER TABLE invoice_items
ADD CONSTRAINT IF NOT EXISTS invoice_items_quantity_positive
    CHECK (quantity > 0);

ALTER TABLE invoice_items
ADD CONSTRAINT IF NOT EXISTS invoice_items_total_consistent
    CHECK (total_price = unit_price * quantity);

-- Invoices - amount validation
ALTER TABLE invoices
ADD CONSTRAINT IF NOT EXISTS invoices_subtotal_positive
    CHECK (subtotal >= 0);

ALTER TABLE invoices
ADD CONSTRAINT IF NOT EXISTS invoices_tax_nonnegative
    CHECK (tax_amount >= 0);

ALTER TABLE invoices
ADD CONSTRAINT IF NOT EXISTS invoices_discount_nonnegative
    CHECK (discount_amount >= 0);

ALTER TABLE invoices
ADD CONSTRAINT IF NOT EXISTS invoices_total_positive
    CHECK (total_amount >= 0);

ALTER TABLE invoices
ADD CONSTRAINT IF NOT EXISTS invoices_balance_valid
    CHECK (balance_due >= 0 AND balance_due <= total_amount);

-- Payments - amount validation
ALTER TABLE payments
ADD CONSTRAINT IF NOT EXISTS payments_amount_positive
    CHECK (amount > 0);

-- Refunds - amount validation
ALTER TABLE refunds
ADD CONSTRAINT IF NOT EXISTS refunds_amount_positive
    CHECK (amount > 0);

-- Expenses - amount validation
ALTER TABLE expenses
ADD CONSTRAINT IF NOT EXISTS expenses_amount_positive
    CHECK (amount >= 0);

-- Loyalty points - balance validation
ALTER TABLE loyalty_points
ADD CONSTRAINT IF NOT EXISTS loyalty_points_balance_nonnegative
    CHECK (balance >= 0);

ALTER TABLE loyalty_points
ADD CONSTRAINT IF NOT EXISTS loyalty_points_lifetime_nonnegative
    CHECK (lifetime_earned >= 0);

-- Store coupons - discount validation
ALTER TABLE store_coupons
ADD CONSTRAINT IF NOT EXISTS coupons_discount_positive
    CHECK (
        (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100) OR
        (discount_type = 'fixed' AND discount_value > 0)
    );

ALTER TABLE store_coupons
ADD CONSTRAINT IF NOT EXISTS coupons_min_purchase_nonnegative
    CHECK (min_purchase_amount >= 0);

ALTER TABLE store_coupons
ADD CONSTRAINT IF NOT EXISTS coupons_max_discount_nonnegative
    CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0);

-- Kennels - daily rate validation
ALTER TABLE kennels
ADD CONSTRAINT IF NOT EXISTS kennels_daily_rate_positive
    CHECK (daily_rate >= 0);

-- =============================================================================
-- B. INVENTORY CONSTRAINTS
-- =============================================================================

-- Store inventory - quantity validation
ALTER TABLE store_inventory
ADD CONSTRAINT IF NOT EXISTS inventory_quantity_nonnegative
    CHECK (stock_quantity >= 0);

ALTER TABLE store_inventory
ADD CONSTRAINT IF NOT EXISTS inventory_reorder_point_nonnegative
    CHECK (reorder_point >= 0);

ALTER TABLE store_inventory
ADD CONSTRAINT IF NOT EXISTS inventory_cost_nonnegative
    CHECK (weighted_average_cost >= 0);

-- Store order items - quantity validation
ALTER TABLE store_order_items
ADD CONSTRAINT IF NOT EXISTS order_items_quantity_positive
    CHECK (quantity > 0);

ALTER TABLE store_order_items
ADD CONSTRAINT IF NOT EXISTS order_items_price_positive
    CHECK (unit_price >= 0);

-- =============================================================================
-- C. DATE & TIME CONSTRAINTS
-- =============================================================================

-- Appointments - end time after start time
ALTER TABLE appointments
ADD CONSTRAINT IF NOT EXISTS appointments_end_after_start
    CHECK (end_time > start_time);

-- Hospitalizations - discharge after admit
ALTER TABLE hospitalizations
ADD CONSTRAINT IF NOT EXISTS hospitalizations_discharge_after_admit
    CHECK (discharged_at IS NULL OR discharged_at > admitted_at);

-- Insurance policies - end date after start date
ALTER TABLE pet_insurance_policies
ADD CONSTRAINT IF NOT EXISTS policies_end_after_start
    CHECK (expiration_date IS NULL OR expiration_date > start_date);

-- Staff time off - end date after start date
ALTER TABLE staff_time_off
ADD CONSTRAINT IF NOT EXISTS time_off_end_after_start
    CHECK (end_date >= start_date);

-- Vaccines - next due after administered
ALTER TABLE vaccines
ADD CONSTRAINT IF NOT EXISTS vaccines_next_due_after_administered
    CHECK (next_due_date IS NULL OR next_due_date >= administered_date);

-- Prescriptions - valid until after created
ALTER TABLE prescriptions
ADD CONSTRAINT IF NOT EXISTS prescriptions_valid_until_future
    CHECK (valid_until IS NULL OR valid_until >= created_at::date);

-- Store campaigns - end date after start date
ALTER TABLE store_campaigns
ADD CONSTRAINT IF NOT EXISTS campaigns_end_after_start
    CHECK (valid_to IS NULL OR valid_to >= valid_from);

-- Consent documents - signed after created
ALTER TABLE consent_documents
ADD CONSTRAINT IF NOT EXISTS consents_signed_after_created
    CHECK (signed_at IS NULL OR signed_at >= created_at);

-- =============================================================================
-- D. CONTACT INFORMATION CONSTRAINTS
-- =============================================================================

-- Profiles - phone number validation (basic length check)
ALTER TABLE profiles
ADD CONSTRAINT IF NOT EXISTS profiles_phone_format
    CHECK (phone IS NULL OR length(phone) >= 6);

-- Profiles - email validation (basic format check)
ALTER TABLE profiles
ADD CONSTRAINT IF NOT EXISTS profiles_email_format
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Tenants - contact email validation
ALTER TABLE tenants
ADD CONSTRAINT IF NOT EXISTS tenants_email_format
    CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- =============================================================================
-- E. PET CONSTRAINTS
-- =============================================================================

-- Pets - weight validation
ALTER TABLE pets
ADD CONSTRAINT IF NOT EXISTS pets_weight_positive
    CHECK (weight_kg IS NULL OR weight_kg > 0);

-- Pets - species validation
ALTER TABLE pets
ADD CONSTRAINT IF NOT EXISTS pets_species_valid
    CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea_pig', 'ferret', 'reptile', 'other'));

-- Pets - sex validation
ALTER TABLE pets
ADD CONSTRAINT IF NOT EXISTS pets_sex_valid
    CHECK (sex IN ('male', 'female', 'unknown'));

-- Pets - birth date not in future
ALTER TABLE pets
ADD CONSTRAINT IF NOT EXISTS pets_birth_date_not_future
    CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE);

-- QR tags - code format validation (alphanumeric, min length)
ALTER TABLE qr_tags
ADD CONSTRAINT IF NOT EXISTS qr_tags_code_format
    CHECK (code ~ '^[A-Z0-9]{6,}$');

-- =============================================================================
-- F. CLINICAL CONSTRAINTS
-- =============================================================================

-- Euthanasia assessments - score validation (0-10 scale)
ALTER TABLE euthanasia_assessments
ADD CONSTRAINT IF NOT EXISTS euthanasia_scores_valid
    CHECK (
        hurt_score BETWEEN 0 AND 10 AND
        hunger_score BETWEEN 0 AND 10 AND
        hydration_score BETWEEN 0 AND 10 AND
        hygiene_score BETWEEN 0 AND 10 AND
        happiness_score BETWEEN 0 AND 10 AND
        mobility_score BETWEEN 0 AND 10 AND
        more_good_days_score BETWEEN 0 AND 10 AND
        total_score BETWEEN 0 AND 70
    );

-- Hospitalization vitals - temperature range (Celsius)
ALTER TABLE hospitalization_vitals
ADD CONSTRAINT IF NOT EXISTS vitals_temperature_range
    CHECK (temperature IS NULL OR temperature BETWEEN 30 AND 45);

-- Hospitalization vitals - heart rate range (bpm)
ALTER TABLE hospitalization_vitals
ADD CONSTRAINT IF NOT EXISTS vitals_heart_rate_range
    CHECK (heart_rate IS NULL OR heart_rate BETWEEN 20 AND 300);

-- Hospitalization vitals - respiratory rate range (breaths per minute)
ALTER TABLE hospitalization_vitals
ADD CONSTRAINT IF NOT EXISTS vitals_respiratory_rate_range
    CHECK (respiratory_rate IS NULL OR respiratory_rate BETWEEN 5 AND 100);

-- Hospitalization vitals - pain score validation (0-10 scale)
ALTER TABLE hospitalization_vitals
ADD CONSTRAINT IF NOT EXISTS vitals_pain_score_range
    CHECK (pain_score IS NULL OR pain_score BETWEEN 0 AND 10);

-- Hospitalization vitals - weight validation
ALTER TABLE hospitalization_vitals
ADD CONSTRAINT IF NOT EXISTS vitals_weight_positive
    CHECK (weight_kg IS NULL OR weight_kg > 0);

-- Drug dosages - dose validation
ALTER TABLE drug_dosages
ADD CONSTRAINT IF NOT EXISTS drug_dosage_positive
    CHECK (dose_mg_per_kg > 0);

-- Lab results - value validation for numeric results
ALTER TABLE lab_results
ADD CONSTRAINT IF NOT EXISTS lab_results_numeric_value_valid
    CHECK (
        result_type != 'numeric' OR
        (value IS NOT NULL AND value ~ '^-?[0-9]+\.?[0-9]*$')
    );

-- =============================================================================
-- G. STATUS & ENUM CONSTRAINTS
-- =============================================================================

-- Appointments - status validation
ALTER TABLE appointments
ADD CONSTRAINT IF NOT EXISTS appointments_status_valid
    CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'));

-- Invoices - status validation
ALTER TABLE invoices
ADD CONSTRAINT IF NOT EXISTS invoices_status_valid
    CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled', 'refunded'));

-- Payments - status validation
ALTER TABLE payments
ADD CONSTRAINT IF NOT EXISTS payments_status_valid
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded'));

-- Store orders - status validation
ALTER TABLE store_orders
ADD CONSTRAINT IF NOT EXISTS orders_status_valid
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- Hospitalizations - status validation
ALTER TABLE hospitalizations
ADD CONSTRAINT IF NOT EXISTS hospitalizations_status_valid
    CHECK (status IN ('admitted', 'in_treatment', 'recovery', 'discharged', 'transferred'));

-- Hospitalizations - acuity level validation
ALTER TABLE hospitalizations
ADD CONSTRAINT IF NOT EXISTS hospitalizations_acuity_valid
    CHECK (acuity_level IN ('low', 'medium', 'high', 'critical'));

-- Lab orders - status validation
ALTER TABLE lab_orders
ADD CONSTRAINT IF NOT EXISTS lab_orders_status_valid
    CHECK (status IN ('pending', 'collected', 'processing', 'completed', 'cancelled'));

-- Insurance claims - status validation
ALTER TABLE insurance_claims
ADD CONSTRAINT IF NOT EXISTS claims_status_valid
    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'partially_approved', 'denied', 'paid'));

-- Reminders - status validation
ALTER TABLE reminders
ADD CONSTRAINT IF NOT EXISTS reminders_status_valid
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled'));

-- Vaccines - status validation
ALTER TABLE vaccines
ADD CONSTRAINT IF NOT EXISTS vaccines_status_valid
    CHECK (status IN ('scheduled', 'administered', 'overdue', 'waived'));

-- QR tags - active status is boolean
ALTER TABLE qr_tags
ADD CONSTRAINT IF NOT EXISTS qr_tags_active_boolean
    CHECK (is_active IN (TRUE, FALSE));

-- =============================================================================
-- H. RATING & REVIEW CONSTRAINTS
-- =============================================================================

-- Store product reviews - rating validation (1-5 stars)
ALTER TABLE store_product_reviews
ADD CONSTRAINT IF NOT EXISTS reviews_rating_valid
    CHECK (rating BETWEEN 1 AND 5);

-- =============================================================================
-- I. CAPACITY & LIMIT CONSTRAINTS
-- =============================================================================

-- Kennels - capacity validation
ALTER TABLE kennels
ADD CONSTRAINT IF NOT EXISTS kennels_max_capacity_positive
    CHECK (max_capacity > 0);

-- Store coupons - usage validation
ALTER TABLE store_coupons
ADD CONSTRAINT IF NOT EXISTS coupons_usage_valid
    CHECK (
        usage_limit IS NULL OR usage_limit > 0
    );

ALTER TABLE store_coupons
ADD CONSTRAINT IF NOT EXISTS coupons_per_user_limit_valid
    CHECK (
        usage_limit_per_user IS NULL OR usage_limit_per_user > 0
    );

-- Staff time off types - max days validation
ALTER TABLE staff_time_off_types
ADD CONSTRAINT IF NOT EXISTS time_off_types_max_days_positive
    CHECK (max_days_per_year IS NULL OR max_days_per_year > 0);

-- =============================================================================
-- J. REPRODUCTIVE CYCLE CONSTRAINTS
-- =============================================================================

-- Reproductive cycles - duration validation
ALTER TABLE reproductive_cycles
ADD CONSTRAINT IF NOT EXISTS cycles_end_after_start
    CHECK (end_date IS NULL OR end_date >= start_date);

-- Reproductive cycles - cycle type validation
ALTER TABLE reproductive_cycles
ADD CONSTRAINT IF NOT EXISTS cycles_type_valid
    CHECK (cycle_type IN ('heat', 'pregnancy', 'lactation', 'anestrus'));

-- =============================================================================
-- K. MESSAGING CONSTRAINTS
-- =============================================================================

-- Messages - sender type validation
ALTER TABLE messages
ADD CONSTRAINT IF NOT EXISTS messages_sender_type_valid
    CHECK (sender_type IN ('client', 'staff', 'system'));

-- Messages - status validation
ALTER TABLE messages
ADD CONSTRAINT IF NOT EXISTS messages_status_valid
    CHECK (status IN ('sent', 'delivered', 'read', 'failed'));

-- WhatsApp messages - direction validation
ALTER TABLE whatsapp_messages
ADD CONSTRAINT IF NOT EXISTS whatsapp_direction_valid
    CHECK (direction IN ('inbound', 'outbound'));

-- WhatsApp messages - status validation
ALTER TABLE whatsapp_messages
ADD CONSTRAINT IF NOT EXISTS whatsapp_status_valid
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed'));

-- Conversations - channel validation
ALTER TABLE conversations
ADD CONSTRAINT IF NOT EXISTS conversations_channel_valid
    CHECK (channel IN ('internal', 'whatsapp', 'email', 'sms'));

-- Conversations - status validation
ALTER TABLE conversations
ADD CONSTRAINT IF NOT EXISTS conversations_status_valid
    CHECK (status IN ('active', 'archived', 'closed'));

-- =============================================================================
-- L. AUDIT LOG CONSTRAINTS
-- =============================================================================

-- Audit logs - action validation
ALTER TABLE audit_logs
ADD CONSTRAINT IF NOT EXISTS audit_logs_action_valid
    CHECK (action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import'));

-- =============================================================================
-- CHECK CONSTRAINTS COMPLETE
-- =============================================================================

-- Summary:
-- - Financial: Price, amount, discount validations
-- - Inventory: Stock quantity, reorder point validations
-- - Date/Time: End dates after start dates
-- - Contact: Email and phone format validations
-- - Pets: Weight, species, sex, birth date validations
-- - Clinical: Vital signs ranges, scores (0-10), drug dosages
-- - Status: Enum value validations for workflow states
-- - Ratings: Star ratings (1-5)
-- - Capacity: Limits and usage validations
-- - Messaging: Sender types, directions, statuses
-- - Audit: Action type validations
