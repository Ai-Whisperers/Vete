-- =============================================================================
-- 16_STORAGE.SQL
-- =============================================================================
-- Supabase Storage buckets and policies.
-- =============================================================================

-- =============================================================================
-- A. CREATE STORAGE BUCKETS
-- =============================================================================

-- Vaccines (vaccine photos/certificates)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vaccines', 'vaccines', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Pets (pet photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pets', 'pets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Records (medical attachments)
INSERT INTO storage.buckets (id, name, public)
VALUES ('records', 'records', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Store Products (product images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-products', 'store-products', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Pet QR Codes (generated QR images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-qr-codes', 'pet-qr-codes', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Receipts (expense proofs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', FALSE)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- B. VACCINES BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated can upload vaccines" ON storage.objects;
CREATE POLICY "Authenticated can upload vaccines" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'vaccines');

DROP POLICY IF EXISTS "Public can view vaccines" ON storage.objects;
CREATE POLICY "Public can view vaccines" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'vaccines');

-- =============================================================================
-- C. PETS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated can upload pets" ON storage.objects;
CREATE POLICY "Authenticated can upload pets" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'pets');

DROP POLICY IF EXISTS "Public can view pets" ON storage.objects;
CREATE POLICY "Public can view pets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pets');

-- =============================================================================
-- D. RECORDS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can upload records" ON storage.objects;
CREATE POLICY "Staff can upload records" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'records'
        AND public.is_staff_of((SELECT tenant_id FROM profiles WHERE id = auth.uid()))
    );

DROP POLICY IF EXISTS "Public can view records" ON storage.objects;
CREATE POLICY "Public can view records" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'records');

-- =============================================================================
-- E. STORE PRODUCTS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can view store products" ON storage.objects;
CREATE POLICY "Public can view store products" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'store-products');

DROP POLICY IF EXISTS "Staff can upload store products" ON storage.objects;
CREATE POLICY "Staff can upload store products" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'store-products');

DROP POLICY IF EXISTS "Staff can manage store products" ON storage.objects;
CREATE POLICY "Staff can manage store products" ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'store-products');

-- =============================================================================
-- F. PET QR CODES BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Public can view QR codes" ON storage.objects;
CREATE POLICY "Public can view QR codes" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pet-qr-codes');

DROP POLICY IF EXISTS "Owners can upload QR codes" ON storage.objects;
CREATE POLICY "Owners can upload QR codes" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'pet-qr-codes'
        AND auth.uid() IN (
            SELECT owner_id FROM pets WHERE id::TEXT = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Owners can delete QR codes" ON storage.objects;
CREATE POLICY "Owners can delete QR codes" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'pet-qr-codes'
        AND auth.uid() IN (
            SELECT owner_id FROM pets WHERE id::TEXT = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Staff can manage QR codes" ON storage.objects;
CREATE POLICY "Staff can manage QR codes" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'pet-qr-codes'
        AND EXISTS (
            SELECT 1 FROM profiles p
            JOIN pets pt ON pt.tenant_id = p.tenant_id
            WHERE p.id = auth.uid()
            AND p.role IN ('vet', 'admin')
            AND pt.id::TEXT = (storage.foldername(name))[1]
        )
    );

-- =============================================================================
-- G. RECEIPTS BUCKET POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Staff can manage receipts" ON storage.objects;
CREATE POLICY "Staff can manage receipts" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'receipts'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- STORAGE COMPLETE
-- =============================================================================
