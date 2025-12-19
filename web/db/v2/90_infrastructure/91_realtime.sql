-- =============================================================================
-- 91_REALTIME.SQL
-- =============================================================================
-- Supabase Realtime subscriptions for live updates.
--
-- Tables enabled for realtime:
--   - appointments     → Calendar updates
--   - conversations    → New messages
--   - messages         → Chat updates
--   - notifications    → In-app notifications
--   - hospitalizations → Patient status changes
--   - pets             → Pet profile updates
--   - vaccines         → Vaccine status changes
--   - qr_tags          → QR scan events
--   - lost_pets        → Lost pet alerts
--   - clinic_invites   → New staff invitations
--
-- Dependencies: All table modules
-- =============================================================================

-- =============================================================================
-- A. CREATE REALTIME PUBLICATION
-- =============================================================================
-- Subscribe to changes on these tables for real-time updates.
-- Note: RLS policies still apply to realtime subscriptions.

BEGIN;

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create publication with selected tables
CREATE PUBLICATION supabase_realtime FOR TABLE
    public.appointments,
    public.conversations,
    public.messages,
    public.notifications,
    public.hospitalizations,
    public.pets,
    public.vaccines,
    public.qr_tags,
    public.lost_pets,
    public.clinic_invites,
    public.lab_orders,
    public.invoices;

COMMIT;

-- =============================================================================
-- B. REALTIME HELPER FUNCTION
-- =============================================================================
-- Function to broadcast custom events (useful for notifications)

CREATE OR REPLACE FUNCTION public.broadcast_realtime_event(
    p_channel TEXT,
    p_event TEXT,
    p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
    -- This is a placeholder for Supabase Realtime broadcast
    -- In practice, you'd use Supabase client-side subscriptions
    -- or pg_notify for server-side events
    PERFORM pg_notify(
        p_channel,
        json_build_object(
            'event', p_event,
            'payload', p_payload,
            'timestamp', NOW()
        )::text
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- REALTIME SETUP COMPLETE
-- =============================================================================
