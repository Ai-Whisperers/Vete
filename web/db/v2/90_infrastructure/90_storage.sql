-- =============================================================================
-- 90_STORAGE.SQL
-- =============================================================================
-- Supabase Storage buckets and policies for file uploads.
--
-- Bucket organization:
--   - pets/         → Pet photos
--   - vaccines/     → Vaccine certificates/photos
--   - records/      → Medical record attachments
--   - prescriptions/→ Prescription PDFs
--   - invoices/     → Invoice PDFs
--   - lab/          → Lab result attachments
--   - consents/     → Signed consent documents
--   - store/        → Product images
--   - receipts/     → Expense receipts (private)
--   - qr-codes/     → Generated QR code images
--   - signatures/   → Digital signatures
--
-- Dependencies: 02_functions (is_staff_of)
-- =============================================================================

-- =============================================================================
-- A. CREATE STORAGE BUCKETS
-- =============================================================================

-- Pet photos (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pets',
    'pets',
    TRUE,
    5242880,  -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Vaccine certificates/photos (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vaccines',
    'vaccines',
    TRUE,
    10485760,  -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Medical record attachments (public read, staff write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'records',
    'records',
    TRUE,
    20971520,  -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Prescription PDFs (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'prescriptions',
    'prescriptions',
    TRUE,
    5242880,  -- 5MB
    ARRAY['application/pdf', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Invoice PDFs (public read for owners)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoices',
    'invoices',
    TRUE,
    5242880,  -- 5MB
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lab result attachments (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'lab',
    'lab',
    TRUE,
    20971520,  -- 20MB
    ARRAY['image/jpeg', 'image/png', 'application/pdf', 'text/csv']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Consent documents (public read for signers)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'consents',
    'consents',
    TRUE,
    5242880,  -- 5MB
    ARRAY['application/pdf', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Store product images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'store',
    'store',
    TRUE,
    5242880,  -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Expense receipts (private - staff only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    FALSE,
    10485760,  -- 10MB
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- QR code images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'qr-codes',
    'qr-codes',
    TRUE,
    1048576,  -- 1MB
    ARRAY['image/png', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Digital signatures (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'signatures',
    'signatures',
    TRUE,
    1048576,  -- 1MB
    ARRAY['image/png', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- B. STORAGE POLICIES - PETS BUCKET
-- =============================================================================

-- Anyone can view pet photos
DROP POLICY IF EXISTS "Public view pets" ON storage.objects;
CREATE POLICY "Public view pets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pets');

-- Authenticated users can upload pet photos
DROP POLICY IF EXISTS "Authenticated upload pets" ON storage.objects;
CREATE POLICY "Authenticated upload pets" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'pets');

-- Owners can delete their pet's photos
DROP POLICY IF EXISTS "Owners delete pets" ON storage.objects;
CREATE POLICY "Owners delete pets" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'pets'
        AND auth.uid() IN (
            SELECT owner_id FROM public.pets
            WHERE id::TEXT = (storage.foldername(name))[1]
        )
    );

-- =============================================================================
-- C. STORAGE POLICIES - VACCINES BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view vaccines" ON storage.objects;
CREATE POLICY "Public view vaccines" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'vaccines');

DROP POLICY IF EXISTS "Authenticated upload vaccines" ON storage.objects;
CREATE POLICY "Authenticated upload vaccines" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'vaccines');

-- =============================================================================
-- D. STORAGE POLICIES - RECORDS BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view records" ON storage.objects;
CREATE POLICY "Public view records" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'records');

DROP POLICY IF EXISTS "Staff upload records" ON storage.objects;
CREATE POLICY "Staff upload records" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'records'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

DROP POLICY IF EXISTS "Staff manage records" ON storage.objects;
CREATE POLICY "Staff manage records" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'records'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- E. STORAGE POLICIES - PRESCRIPTIONS BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view prescriptions" ON storage.objects;
CREATE POLICY "Public view prescriptions" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "Staff upload prescriptions" ON storage.objects;
CREATE POLICY "Staff upload prescriptions" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'prescriptions'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- F. STORAGE POLICIES - INVOICES BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view invoices" ON storage.objects;
CREATE POLICY "Public view invoices" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'invoices');

DROP POLICY IF EXISTS "Staff upload invoices" ON storage.objects;
CREATE POLICY "Staff upload invoices" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'invoices'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- G. STORAGE POLICIES - LAB BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view lab" ON storage.objects;
CREATE POLICY "Public view lab" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'lab');

DROP POLICY IF EXISTS "Staff upload lab" ON storage.objects;
CREATE POLICY "Staff upload lab" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'lab'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- H. STORAGE POLICIES - CONSENTS BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view consents" ON storage.objects;
CREATE POLICY "Public view consents" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'consents');

DROP POLICY IF EXISTS "Authenticated upload consents" ON storage.objects;
CREATE POLICY "Authenticated upload consents" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'consents');

-- =============================================================================
-- I. STORAGE POLICIES - STORE BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view store" ON storage.objects;
CREATE POLICY "Public view store" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'store');

DROP POLICY IF EXISTS "Staff manage store" ON storage.objects;
CREATE POLICY "Staff manage store" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'store'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- J. STORAGE POLICIES - RECEIPTS BUCKET (Private)
-- =============================================================================

DROP POLICY IF EXISTS "Staff manage receipts" ON storage.objects;
CREATE POLICY "Staff manage receipts" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'receipts'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- K. STORAGE POLICIES - QR-CODES BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view qr-codes" ON storage.objects;
CREATE POLICY "Public view qr-codes" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'qr-codes');

DROP POLICY IF EXISTS "Owners upload qr-codes" ON storage.objects;
CREATE POLICY "Owners upload qr-codes" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'qr-codes'
        AND auth.uid() IN (
            SELECT owner_id FROM public.pets
            WHERE id::TEXT = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Staff manage qr-codes" ON storage.objects;
CREATE POLICY "Staff manage qr-codes" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'qr-codes'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('vet', 'admin')
        )
    );

-- =============================================================================
-- L. STORAGE POLICIES - SIGNATURES BUCKET
-- =============================================================================

DROP POLICY IF EXISTS "Public view signatures" ON storage.objects;
CREATE POLICY "Public view signatures" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'signatures');

DROP POLICY IF EXISTS "Authenticated upload signatures" ON storage.objects;
CREATE POLICY "Authenticated upload signatures" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'signatures');

-- =============================================================================
-- STORAGE SETUP COMPLETE
-- =============================================================================
