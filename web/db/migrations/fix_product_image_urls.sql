-- Migration: Fix broken product image URLs
-- Replace all 4pets.com.py URLs with working Unsplash images
-- Run this in Supabase SQL Editor

-- Update store_products table
UPDATE store_products
SET image_url = CASE
    -- Dog antiparasitics (advantage, bravecto, nexgard, simparica, seresto, scalibor, frontline)
    WHEN image_url LIKE '%advantage-dog%' OR image_url LIKE '%advantage-multi-dog%'
         OR image_url LIKE '%bravecto%' OR image_url LIKE '%nexgard%'
         OR image_url LIKE '%simparica%' OR image_url LIKE '%seresto-dog%'
         OR image_url LIKE '%scalibor%' OR image_url LIKE '%frontline%'
    THEN 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop'

    -- Cat products
    WHEN image_url LIKE '%advantage-cat%' OR image_url LIKE '%advantage-multi-cat%'
         OR image_url LIKE '%seresto-cat%' OR image_url LIKE '%cat-chow%'
         OR image_url LIKE '%whiskas%' OR image_url LIKE '%felix%'
         OR image_url LIKE '%matisse%' OR image_url LIKE '%three-cats%'
         OR image_url LIKE '%sheba%' OR image_url LIKE '%gourmet%'
         OR image_url LIKE '%primogato%' OR image_url LIKE '%catron%'
         OR image_url LIKE '%kets%' OR image_url LIKE '%progato%'
    THEN 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop'

    -- Dog food
    WHEN image_url LIKE '%dog-chow%' OR image_url LIKE '%pro-plan%' OR image_url LIKE '%proplan%'
         OR image_url LIKE '%hills%' OR image_url LIKE '%pedigree%'
         OR image_url LIKE '%royal-canin%' OR image_url LIKE '%nd-%'
         OR image_url LIKE '%excellent%' OR image_url LIKE '%cibau%'
         OR image_url LIKE '%ganador%' OR image_url LIKE '%primocao%'
         OR image_url LIKE '%monello%' OR image_url LIKE '%three-dogs%'
         OR image_url LIKE '%formula-natural%' OR image_url LIKE '%vitalcan%'
         OR image_url LIKE '%vet-life%' OR image_url LIKE '%birbo%'
    THEN 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop'

    -- Grooming products
    WHEN image_url LIKE '%furminator%' OR image_url LIKE '%tropiclean%'
    THEN 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=400&fit=crop'

    -- Accessories/toys
    WHEN image_url LIKE '%kong%' OR image_url LIKE '%trixie%'
         OR image_url LIKE '%ferplast%' OR image_url LIKE '%chuckit%'
         OR image_url LIKE '%catit%' OR image_url LIKE '%zeedog%'
    THEN 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop'

    -- Medical supplies
    WHEN image_url LIKE '%vetnil%' OR image_url LIKE '%bd.com%'
    THEN 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'

    -- Wet dog food
    WHEN image_url LIKE '%cesar%'
    THEN 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop'

    -- Default fallback for any remaining 4pets URLs
    ELSE 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop'
END
WHERE image_url LIKE '%4pets.com.py%' OR image_url LIKE '%www.bd.com%';

-- Update store_categories table
UPDATE store_categories
SET image_url = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop'
WHERE image_url LIKE '%4pets.com.py%';

-- Show count of updated rows
SELECT 'Products updated' as table_name, COUNT(*) as rows_affected
FROM store_products
WHERE image_url LIKE '%unsplash%';
