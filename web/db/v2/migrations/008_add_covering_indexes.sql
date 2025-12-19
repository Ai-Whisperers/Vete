-- =============================================================================
-- 008_ADD_COVERING_INDEXES.SQL - Performance indexes for common queries
-- =============================================================================
BEGIN;

-- Appointments calendar
CREATE INDEX IF NOT EXISTS idx_appointments_calendar ON public.appointments (tenant_id, start_time, status)
    INCLUDE (pet_id, vet_id, service_id, end_time, duration_minutes, reason) WHERE deleted_at IS NULL;

-- Invoice listing
CREATE INDEX IF NOT EXISTS idx_invoices_list ON public.invoices (tenant_id, invoice_date DESC)
    INCLUDE (invoice_number, client_id, total, status, amount_paid) WHERE deleted_at IS NULL;

-- Unpaid invoices
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid ON public.invoices (tenant_id, status, due_date)
    INCLUDE (invoice_number, client_id, total) WHERE status NOT IN ('paid', 'void', 'refunded') AND deleted_at IS NULL;

-- Pet listing
CREATE INDEX IF NOT EXISTS idx_pets_tenant_list ON public.pets (tenant_id, name)
    INCLUDE (owner_id, species, breed, photo_url, is_deceased) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pets_owner_list ON public.pets (owner_id)
    INCLUDE (name, species, breed, photo_url, birth_date, is_deceased) WHERE deleted_at IS NULL;

-- Vaccine history
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_history ON public.vaccines (pet_id, administered_date DESC)
    INCLUDE (name, status, next_due_date, administered_by) WHERE deleted_at IS NULL;

-- Due vaccines
CREATE INDEX IF NOT EXISTS idx_vaccines_due ON public.vaccines (tenant_id, next_due_date)
    INCLUDE (pet_id, name, status) WHERE next_due_date IS NOT NULL AND status = 'completed' AND deleted_at IS NULL;

-- Services for booking
CREATE INDEX IF NOT EXISTS idx_services_booking ON public.services (tenant_id, category, display_order)
    INCLUDE (name, base_price, duration_minutes, is_featured) WHERE is_active = true AND deleted_at IS NULL;

-- Products by category
CREATE INDEX IF NOT EXISTS idx_products_category_list ON public.store_products (tenant_id, category_id)
    INCLUDE (name, base_price, sale_price, image_url, is_featured) WHERE is_active = true;

-- Active hospitalizations
CREATE INDEX IF NOT EXISTS idx_hospitalizations_board ON public.hospitalizations (tenant_id, status, priority)
    INCLUDE (pet_id, kennel_id, admitted_at, diagnosis, primary_vet_id)
    WHERE status NOT IN ('discharged', 'deceased', 'transferred') AND deleted_at IS NULL;

-- Conversation inbox
CREATE INDEX IF NOT EXISTS idx_conversations_inbox ON public.conversations (tenant_id, unread_staff_count DESC, last_message_at DESC)
    INCLUDE (client_id, pet_id, subject, status, priority);

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread_list ON public.notifications (user_id, created_at DESC)
    INCLUDE (type, title, message, reference_type, reference_id) WHERE read_at IS NULL AND dismissed_at IS NULL;

-- Staff listing
CREATE INDEX IF NOT EXISTS idx_profiles_staff_list ON public.profiles (tenant_id, role)
    INCLUDE (full_name, email, phone, avatar_url) WHERE role IN ('vet', 'admin') AND deleted_at IS NULL;

-- Client listing
CREATE INDEX IF NOT EXISTS idx_profiles_client_list ON public.profiles (tenant_id)
    INCLUDE (full_name, email, phone, client_code, avatar_url) WHERE role = 'owner' AND deleted_at IS NULL;

-- Daily payments report
CREATE INDEX IF NOT EXISTS idx_payments_daily_report ON public.payments (tenant_id, payment_date DESC)
    INCLUDE (invoice_id, amount, payment_method_name, status) WHERE status = 'completed';

COMMIT;
