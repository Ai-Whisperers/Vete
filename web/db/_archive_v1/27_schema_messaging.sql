-- =============================================================================
-- 27_SCHEMA_MESSAGING.SQL
-- =============================================================================
-- Client communication and messaging system for veterinary clinics.
-- Includes conversations, messages, templates, and broadcast campaigns.
-- =============================================================================

-- =============================================================================
-- A. CONVERSATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Participants
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL, -- Optional: pet-specific conversation

    -- Conversation info
    subject TEXT,
    channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN (
        'in_app', 'sms', 'whatsapp', 'email'
    )),

    -- Status
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'pending', 'resolved', 'closed', 'spam'
    )),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,

    -- Timestamps
    last_message_at TIMESTAMPTZ,
    last_client_message_at TIMESTAMPTZ,
    last_staff_message_at TIMESTAMPTZ,
    client_last_read_at TIMESTAMPTZ,
    staff_last_read_at TIMESTAMPTZ,

    -- Counts
    unread_client_count INTEGER DEFAULT 0,
    unread_staff_count INTEGER DEFAULT 0,

    -- Related entities
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,

    -- Tags
    tags TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- B. MESSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Sender
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'staff', 'system', 'bot')),
    sender_name TEXT, -- Cached for display

    -- Content
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN (
        'text', 'image', 'file', 'audio', 'video', 'location',
        'appointment_card', 'invoice_card', 'prescription_card', 'system'
    )),
    content TEXT,
    content_html TEXT, -- Rich text version

    -- Attachments
    attachments JSONB DEFAULT '[]',
    -- Structure: [{"type": "image", "url": "", "name": "", "size": 0}]

    -- Rich cards (for appointment_card, invoice_card, etc.)
    card_data JSONB,

    -- Reply to
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- Delivery status
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN (
        'pending', 'sent', 'delivered', 'read', 'failed'
    )),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_reason TEXT,

    -- External channel info
    external_message_id TEXT, -- ID from SMS/WhatsApp provider
    external_channel TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- C. MESSAGE TEMPLATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global

    -- Template info
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'appointment', 'reminder', 'follow_up', 'marketing', 'transactional',
        'welcome', 'feedback', 'custom'
    )),

    -- Content
    subject TEXT, -- For email
    content TEXT NOT NULL,
    content_html TEXT,

    -- Variables
    variables TEXT[], -- {{pet_name}}, {{appointment_date}}, etc.

    -- Channel settings
    channels TEXT[] DEFAULT ARRAY['in_app'],
    sms_approved BOOLEAN DEFAULT FALSE, -- Pre-approved for SMS
    whatsapp_template_id TEXT,

    -- Language
    language TEXT DEFAULT 'es',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, code)
);

-- Unique index for global message templates (tenant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_templates_global_code
ON message_templates (code) WHERE tenant_id IS NULL;

-- =============================================================================
-- D. QUICK REPLIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Quick reply info
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,

    -- Usage
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Ordering
    display_order INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- E. BROADCAST CAMPAIGNS
-- =============================================================================

CREATE TABLE IF NOT EXISTS broadcast_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Campaign info
    name TEXT NOT NULL,
    description TEXT,

    -- Content
    template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    content_html TEXT,

    -- Channel
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'sms', 'whatsapp', 'email')),

    -- Audience
    audience_type TEXT NOT NULL CHECK (audience_type IN (
        'all_clients', 'pet_species', 'pet_breed', 'last_visit',
        'no_visit', 'vaccine_due', 'custom_list', 'segment'
    )),
    audience_filter JSONB DEFAULT '{}',
    -- Examples:
    -- {"species": "dog"}
    -- {"last_visit_days_ago": {"min": 30, "max": 90}}
    -- {"vaccine_type": "Rabies", "due_within_days": 30}

    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'
    )),

    -- Stats
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,

    -- Creator
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- F. BROADCAST RECIPIENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES broadcast_campaigns(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Contact info used
    contact_value TEXT, -- Phone or email used

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'delivered', 'read', 'failed', 'unsubscribed'
    )),

    -- Tracking
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_reason TEXT,

    -- Message reference
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    external_message_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(campaign_id, client_id)
);

-- =============================================================================
-- G. COMMUNICATION PREFERENCES
-- =============================================================================

CREATE TABLE IF NOT EXISTS communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global preference

    -- Channel preferences
    allow_sms BOOLEAN DEFAULT TRUE,
    allow_whatsapp BOOLEAN DEFAULT TRUE,
    allow_email BOOLEAN DEFAULT TRUE,
    allow_in_app BOOLEAN DEFAULT TRUE,
    allow_push BOOLEAN DEFAULT TRUE,

    -- Contact info
    preferred_phone TEXT,
    preferred_email TEXT,
    whatsapp_number TEXT,

    -- Type preferences
    allow_appointment_reminders BOOLEAN DEFAULT TRUE,
    allow_vaccine_reminders BOOLEAN DEFAULT TRUE,
    allow_marketing BOOLEAN DEFAULT FALSE,
    allow_feedback_requests BOOLEAN DEFAULT TRUE,

    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',

    -- Language
    preferred_language TEXT DEFAULT 'es',

    -- Timezone
    timezone TEXT DEFAULT 'America/Asuncion',

    -- Unsubscribe
    unsubscribed_at TIMESTAMPTZ,
    unsubscribe_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, tenant_id)
);

-- Note: notification_preferences table is defined in 22_schema_reminders.sql
-- with client_id column (not user_id/tenant_id), so no additional index needed here

-- =============================================================================
-- H. MESSAGE REACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    reaction TEXT NOT NULL, -- emoji or reaction type

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(message_id, user_id, reaction)
);

-- =============================================================================
-- I. CANNED RESPONSES / AUTO-REPLIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS auto_reply_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Rule info
    name TEXT NOT NULL,
    description TEXT,

    -- Trigger
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'keyword', 'after_hours', 'no_response', 'first_message', 'all'
    )),
    trigger_keywords TEXT[], -- For keyword trigger
    trigger_after_minutes INTEGER, -- For no_response trigger

    -- Response
    response_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    response_content TEXT,

    -- Conditions
    active_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- Days of week
    active_start_time TIME,
    active_end_time TIME,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- J. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_pet ON conversations(pet_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_unread_staff ON conversations(unread_staff_count) WHERE unread_staff_count > 0;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

CREATE INDEX IF NOT EXISTS idx_message_templates_tenant ON message_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_code ON message_templates(code);

CREATE INDEX IF NOT EXISTS idx_quick_replies_tenant ON quick_replies(tenant_id);

CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_tenant ON broadcast_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_status ON broadcast_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_campaigns_scheduled ON broadcast_campaigns(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_campaign ON broadcast_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_client ON broadcast_recipients(client_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_status ON broadcast_recipients(status);

CREATE INDEX IF NOT EXISTS idx_communication_prefs_user ON communication_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_prefs_tenant ON communication_preferences(tenant_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_tenant ON auto_reply_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_active ON auto_reply_rules(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- K. TRIGGERS
-- =============================================================================

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_broadcast_campaigns_updated_at
    BEFORE UPDATE ON broadcast_campaigns
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_communication_prefs_updated_at
    BEFORE UPDATE ON communication_preferences
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_auto_reply_rules_updated_at
    BEFORE UPDATE ON auto_reply_rules
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- L. FUNCTIONS
-- =============================================================================

-- Update conversation when message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET
        last_message_at = NEW.created_at,
        last_client_message_at = CASE WHEN NEW.sender_type = 'client' THEN NEW.created_at ELSE last_client_message_at END,
        last_staff_message_at = CASE WHEN NEW.sender_type = 'staff' THEN NEW.created_at ELSE last_staff_message_at END,
        unread_client_count = CASE WHEN NEW.sender_type IN ('staff', 'system') THEN unread_client_count + 1 ELSE unread_client_count END,
        unread_staff_count = CASE WHEN NEW.sender_type = 'client' THEN unread_staff_count + 1 ELSE unread_staff_count END,
        status = CASE WHEN status = 'resolved' AND NEW.sender_type = 'client' THEN 'open' ELSE status END
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_update_conversation
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
    p_conversation_id UUID,
    p_user_type TEXT -- 'client' or 'staff'
)
RETURNS VOID AS $$
BEGIN
    IF p_user_type = 'client' THEN
        UPDATE conversations SET
            client_last_read_at = NOW(),
            unread_client_count = 0
        WHERE id = p_conversation_id;

        UPDATE messages SET
            status = 'read',
            read_at = NOW()
        WHERE conversation_id = p_conversation_id
          AND sender_type IN ('staff', 'system')
          AND status != 'read';
    ELSE
        UPDATE conversations SET
            staff_last_read_at = NOW(),
            unread_staff_count = 0
        WHERE id = p_conversation_id;

        UPDATE messages SET
            status = 'read',
            read_at = NOW()
        WHERE conversation_id = p_conversation_id
          AND sender_type = 'client'
          AND status != 'read';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Render template with variables
CREATE OR REPLACE FUNCTION render_message_template(
    p_template_id UUID,
    p_variables JSONB
)
RETURNS TABLE (
    subject TEXT,
    content TEXT,
    content_html TEXT
) AS $$
DECLARE
    v_template message_templates%ROWTYPE;
    v_key TEXT;
    v_value TEXT;
    v_content TEXT;
    v_content_html TEXT;
    v_subject TEXT;
BEGIN
    SELECT * INTO v_template FROM message_templates WHERE id = p_template_id;

    IF v_template IS NULL THEN
        RETURN;
    END IF;

    v_content := v_template.content;
    v_content_html := v_template.content_html;
    v_subject := v_template.subject;

    FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables)
    LOOP
        v_content := REPLACE(v_content, '{{' || v_key || '}}', COALESCE(v_value, ''));
        IF v_content_html IS NOT NULL THEN
            v_content_html := REPLACE(v_content_html, '{{' || v_key || '}}', COALESCE(v_value, ''));
        END IF;
        IF v_subject IS NOT NULL THEN
            v_subject := REPLACE(v_subject, '{{' || v_key || '}}', COALESCE(v_value, ''));
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_subject, v_content, v_content_html;
END;
$$ LANGUAGE plpgsql;

-- Get conversation summary for dashboard
CREATE OR REPLACE FUNCTION get_conversation_summary(p_tenant_id TEXT)
RETURNS TABLE (
    total_open INTEGER,
    total_pending INTEGER,
    unread_count INTEGER,
    avg_response_time_hours DECIMAL,
    by_priority JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE status = 'open')::INTEGER,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER,
        SUM(unread_staff_count)::INTEGER,
        ROUND(AVG(EXTRACT(EPOCH FROM (last_staff_message_at - last_client_message_at)) / 3600)::DECIMAL, 2),
        COALESCE(jsonb_object_agg(priority, cnt) FILTER (WHERE priority IS NOT NULL), '{}'::jsonb)
    FROM (
        SELECT
            status,
            unread_staff_count,
            last_staff_message_at,
            last_client_message_at,
            priority,
            COUNT(*) OVER (PARTITION BY priority) as cnt
        FROM conversations
        WHERE tenant_id = p_tenant_id
          AND status IN ('open', 'pending')
    ) t;
END;
$$ LANGUAGE plpgsql;

-- Check if can send message (respects preferences and quiet hours)
CREATE OR REPLACE FUNCTION can_send_message(
    p_user_id UUID,
    p_channel TEXT,
    p_message_type TEXT DEFAULT 'transactional'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_prefs communication_preferences%ROWTYPE;
    v_now TIME;
BEGIN
    SELECT * INTO v_prefs FROM communication_preferences WHERE user_id = p_user_id LIMIT 1;

    IF v_prefs IS NULL THEN
        RETURN TRUE; -- No preferences = allow all
    END IF;

    -- Check channel preference
    IF p_channel = 'sms' AND NOT v_prefs.allow_sms THEN RETURN FALSE; END IF;
    IF p_channel = 'whatsapp' AND NOT v_prefs.allow_whatsapp THEN RETURN FALSE; END IF;
    IF p_channel = 'email' AND NOT v_prefs.allow_email THEN RETURN FALSE; END IF;
    IF p_channel = 'in_app' AND NOT v_prefs.allow_in_app THEN RETURN FALSE; END IF;

    -- Check message type preference
    IF p_message_type = 'marketing' AND NOT v_prefs.allow_marketing THEN RETURN FALSE; END IF;

    -- Check quiet hours (except for urgent)
    IF v_prefs.quiet_hours_enabled AND p_message_type != 'urgent' THEN
        v_now := LOCALTIME;
        IF v_prefs.quiet_hours_start < v_prefs.quiet_hours_end THEN
            IF v_now >= v_prefs.quiet_hours_start AND v_now < v_prefs.quiet_hours_end THEN
                RETURN FALSE;
            END IF;
        ELSE -- Quiet hours span midnight
            IF v_now >= v_prefs.quiet_hours_start OR v_now < v_prefs.quiet_hours_end THEN
                RETURN FALSE;
            END IF;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- M. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;

-- Conversations: Staff see all, clients see their own
CREATE POLICY conversations_select_staff ON conversations FOR SELECT TO authenticated
    USING (is_staff_of(tenant_id));

CREATE POLICY conversations_select_client ON conversations FOR SELECT TO authenticated
    USING (client_id = auth.uid());

CREATE POLICY conversations_insert ON conversations FOR INSERT TO authenticated
    WITH CHECK (is_staff_of(tenant_id) OR client_id = auth.uid());

CREATE POLICY conversations_update ON conversations FOR UPDATE TO authenticated
    USING (is_staff_of(tenant_id) OR client_id = auth.uid());

-- Messages
CREATE POLICY messages_select ON messages FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
                AND (is_staff_of(c.tenant_id) OR c.client_id = auth.uid()))
    );

CREATE POLICY messages_insert ON messages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
                AND (is_staff_of(c.tenant_id) OR c.client_id = auth.uid()))
    );

-- Message Templates
CREATE POLICY message_templates_select ON message_templates FOR SELECT TO authenticated
    USING (tenant_id IS NULL OR is_staff_of(tenant_id));

CREATE POLICY message_templates_insert ON message_templates FOR INSERT TO authenticated
    WITH CHECK (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

CREATE POLICY message_templates_update ON message_templates FOR UPDATE TO authenticated
    USING (tenant_id IS NOT NULL AND is_staff_of(tenant_id));

-- Quick Replies
CREATE POLICY quick_replies_all ON quick_replies FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- Broadcast Campaigns
CREATE POLICY broadcast_campaigns_all ON broadcast_campaigns FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- Broadcast Recipients
CREATE POLICY broadcast_recipients_select ON broadcast_recipients FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM broadcast_campaigns bc WHERE bc.id = broadcast_recipients.campaign_id
                AND is_staff_of(bc.tenant_id))
        OR client_id = auth.uid()
    );

CREATE POLICY broadcast_recipients_insert ON broadcast_recipients FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM broadcast_campaigns bc WHERE bc.id = broadcast_recipients.campaign_id
                AND is_staff_of(bc.tenant_id))
    );

-- Communication Preferences
CREATE POLICY communication_prefs_select ON communication_preferences FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR (tenant_id IS NOT NULL AND is_staff_of(tenant_id)));

CREATE POLICY communication_prefs_insert ON communication_preferences FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY communication_prefs_update ON communication_preferences FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Message Reactions
CREATE POLICY message_reactions_select ON message_reactions FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM messages m JOIN conversations c ON m.conversation_id = c.id
                WHERE m.id = message_reactions.message_id
                AND (is_staff_of(c.tenant_id) OR c.client_id = auth.uid()))
    );

CREATE POLICY message_reactions_insert ON message_reactions FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY message_reactions_delete ON message_reactions FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Auto Reply Rules
CREATE POLICY auto_reply_rules_all ON auto_reply_rules FOR ALL TO authenticated
    USING (is_staff_of(tenant_id))
    WITH CHECK (is_staff_of(tenant_id));

-- =============================================================================
-- N. SEED MESSAGE TEMPLATES
-- =============================================================================

INSERT INTO message_templates (tenant_id, code, name, category, content, variables, channels) VALUES
(NULL, 'APPT_CONFIRM', 'Confirmación de Cita', 'appointment',
 'Hola {{owner_name}}, tu cita para {{pet_name}} ha sido confirmada para el {{appointment_date}} a las {{appointment_time}}. Te esperamos en {{clinic_name}}.',
 ARRAY['owner_name', 'pet_name', 'appointment_date', 'appointment_time', 'clinic_name'],
 ARRAY['in_app', 'sms', 'whatsapp']),

(NULL, 'APPT_REMINDER_24H', 'Recordatorio de Cita (24h)', 'reminder',
 'Hola {{owner_name}}, te recordamos que tienes una cita mañana {{appointment_date}} a las {{appointment_time}} para {{pet_name}} en {{clinic_name}}.',
 ARRAY['owner_name', 'pet_name', 'appointment_date', 'appointment_time', 'clinic_name'],
 ARRAY['in_app', 'sms', 'whatsapp']),

(NULL, 'VACCINE_REMINDER', 'Recordatorio de Vacuna', 'reminder',
 'Hola {{owner_name}}, {{pet_name}} tiene pendiente la vacuna {{vaccine_name}}. Por favor agenda una cita llamando al {{clinic_phone}}.',
 ARRAY['owner_name', 'pet_name', 'vaccine_name', 'clinic_phone'],
 ARRAY['in_app', 'sms']),

(NULL, 'FOLLOW_UP', 'Seguimiento Post-Consulta', 'follow_up',
 'Hola {{owner_name}}, ¿cómo sigue {{pet_name}} después de su última visita? Si tienes alguna duda, no dudes en contactarnos.',
 ARRAY['owner_name', 'pet_name'],
 ARRAY['in_app', 'whatsapp']),

(NULL, 'WELCOME', 'Bienvenida', 'welcome',
 'Bienvenido/a a {{clinic_name}}, {{owner_name}}! Gracias por registrar a {{pet_name}}. Estamos aquí para cuidar de tu mascota.',
 ARRAY['clinic_name', 'owner_name', 'pet_name'],
 ARRAY['in_app', 'email']),

(NULL, 'INVOICE_READY', 'Factura Lista', 'transactional',
 'Hola {{owner_name}}, tu factura #{{invoice_number}} por {{amount}} está lista. Puedes verla en tu portal de cliente.',
 ARRAY['owner_name', 'invoice_number', 'amount'],
 ARRAY['in_app', 'email']),

(NULL, 'LAB_RESULTS', 'Resultados de Laboratorio', 'transactional',
 'Hola {{owner_name}}, los resultados de laboratorio de {{pet_name}} están listos. Puedes verlos en tu portal o contactarnos para más información.',
 ARRAY['owner_name', 'pet_name'],
 ARRAY['in_app', 'sms'])

ON CONFLICT DO NOTHING;

-- =============================================================================
-- MESSAGING SCHEMA COMPLETE
-- =============================================================================
