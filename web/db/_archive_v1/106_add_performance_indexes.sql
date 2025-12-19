-- Add missing performance indexes

-- Appointments by date (slot queries)
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON appointments(tenant_id, appointment_date);

-- Invoices by client and status
CREATE INDEX IF NOT EXISTS idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status);

-- Lab orders by pet
CREATE INDEX IF NOT EXISTS idx_lab_orders_pet ON lab_orders(pet_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_tenant_status ON lab_orders(tenant_id, status);

-- Hospitalizations by status (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_hospitalizations_active ON hospitalizations(tenant_id, status) WHERE status = 'active';

-- Products by category
CREATE INDEX IF NOT EXISTS idx_products_category ON store_products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON store_products(tenant_id, is_active) WHERE deleted_at IS NULL;

-- Messages by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Vaccines by pet and status
CREATE INDEX IF NOT EXISTS idx_vaccines_pet_status ON vaccines(pet_id, status);
CREATE INDEX IF NOT EXISTS idx_vaccines_due_date ON vaccines(next_due_date) WHERE status = 'pending';
