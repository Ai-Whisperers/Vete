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
