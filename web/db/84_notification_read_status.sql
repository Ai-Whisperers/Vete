-- =============================================================================
-- 84_NOTIFICATION_READ_STATUS.SQL
-- =============================================================================
-- Add 'read' status and read_at timestamp to notification_queue table
-- =============================================================================

-- Add 'read' status to the existing status check constraint
ALTER TABLE notification_queue
  DROP CONSTRAINT IF EXISTS notification_queue_status_check;

ALTER TABLE notification_queue
  ADD CONSTRAINT notification_queue_status_check
  CHECK (status IN (
    'queued', 'sending', 'sent', 'delivered', 'read', 'failed', 'bounced'
  ));

-- Add read_at timestamp column
ALTER TABLE notification_queue
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add index for read status queries
CREATE INDEX IF NOT EXISTS idx_notification_queue_read_status
  ON notification_queue(client_id, status)
  WHERE status IN ('queued', 'delivered', 'read');

-- Add index for read_at timestamp
CREATE INDEX IF NOT EXISTS idx_notification_queue_read_at
  ON notification_queue(read_at DESC)
  WHERE read_at IS NOT NULL;

-- Update existing RLS policy to allow users to mark their own notifications as read
DROP POLICY IF EXISTS "Users mark own notifications as read" ON notification_queue;

CREATE POLICY "Users mark own notifications as read" ON notification_queue
  FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- =============================================================================
-- NOTIFICATION READ STATUS MIGRATION COMPLETE
-- =============================================================================
