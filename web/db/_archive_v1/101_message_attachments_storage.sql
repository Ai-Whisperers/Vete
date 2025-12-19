-- =============================================================================
-- 101_MESSAGE_ATTACHMENTS_STORAGE.SQL
-- =============================================================================
-- Storage bucket and policies for message attachments
-- =============================================================================

-- Create message-attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  TRUE,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- POLICIES
-- =============================================================================

-- Authenticated users can upload to message-attachments
DROP POLICY IF EXISTS "Authenticated can upload message attachments" ON storage.objects;
CREATE POLICY "Authenticated can upload message attachments" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'message-attachments');

-- Public can view message attachments (URLs are only shared in conversations)
DROP POLICY IF EXISTS "Public can view message attachments" ON storage.objects;
CREATE POLICY "Public can view message attachments" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'message-attachments');

-- Users can delete their own attachments
DROP POLICY IF EXISTS "Users can delete own message attachments" ON storage.objects;
CREATE POLICY "Users can delete own message attachments" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'message-attachments'
      AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

-- =============================================================================
-- MESSAGE ATTACHMENTS STORAGE COMPLETE
-- =============================================================================
