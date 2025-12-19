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
