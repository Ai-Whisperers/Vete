-- Insert clinic product assignments for adris
INSERT INTO public.clinic_product_assignments (tenant_id, catalog_product_id, sale_price, min_stock_level, location, requires_prescription, is_active)
SELECT
  'adris' as tenant_id,
  sp.id as catalog_product_id,
  CASE
    WHEN sp.sku = 'RC-DOG-ADULT-MED-15KG' THEN 485000
    WHEN sp.sku = 'RC-DOG-ADULT-MED-3KG' THEN 125000
    WHEN sp.sku = 'RC-DOG-PUPPY-MED-15KG' THEN 520000
    WHEN sp.sku = 'RC-DOG-PUPPY-MED-3KG' THEN 135000
    WHEN sp.sku = 'RC-CAT-ADULT-4KG' THEN 195000
    WHEN sp.sku = 'RC-CAT-KITTEN-4KG' THEN 210000
    WHEN sp.sku = 'HILLS-SD-ADULT-12KG' THEN 520000
    WHEN sp.sku = 'HILLS-SD-PUPPY-12KG' THEN 550000
    WHEN sp.sku = 'NEXGARD-S-3' THEN 145000
    WHEN sp.sku = 'NEXGARD-M-3' THEN 165000
    WHEN sp.sku = 'NEXGARD-L-3' THEN 180000
    WHEN sp.sku = 'NEXGARD-XL-3' THEN 195000
    WHEN sp.sku = 'BRAVECTO-S-1' THEN 185000
    WHEN sp.sku = 'BRAVECTO-M-1' THEN 210000
    WHEN sp.sku = 'BRAVECTO-L-1' THEN 235000
    WHEN sp.sku = 'BRAVECTO-XL-1' THEN 260000
    WHEN sp.sku = 'FRONTLINE-S-3' THEN 85000
    WHEN sp.sku = 'FRONTLINE-M-3' THEN 95000
    WHEN sp.sku = 'FRONTLINE-L-3' THEN 105000
    WHEN sp.sku = 'PP-DOG-ADULT-15KG' THEN 450000
    WHEN sp.sku = 'PP-DOG-PUPPY-15KG' THEN 480000
    WHEN sp.sku = 'PP-CAT-ADULT-7KG' THEN 295000
    ELSE sp.base_price
  END as sale_price,
  CASE
    WHEN sp.sku = 'RC-DOG-ADULT-MED-15KG' THEN 5
    WHEN sp.sku = 'RC-DOG-ADULT-MED-3KG' THEN 8
    WHEN sp.sku = 'RC-DOG-PUPPY-MED-15KG' THEN 4
    WHEN sp.sku = 'RC-DOG-PUPPY-MED-3KG' THEN 10
    WHEN sp.sku = 'RC-CAT-ADULT-4KG' THEN 6
    WHEN sp.sku = 'RC-CAT-KITTEN-4KG' THEN 5
    WHEN sp.sku = 'HILLS-SD-ADULT-12KG' THEN 3
    WHEN sp.sku = 'HILLS-SD-PUPPY-12KG' THEN 3
    WHEN sp.sku = 'NEXGARD-S-3' THEN 10
    WHEN sp.sku = 'NEXGARD-M-3' THEN 15
    WHEN sp.sku = 'NEXGARD-L-3' THEN 12
    WHEN sp.sku = 'NEXGARD-XL-3' THEN 8
    WHEN sp.sku = 'BRAVECTO-S-1' THEN 8
    WHEN sp.sku = 'BRAVECTO-M-1' THEN 10
    WHEN sp.sku = 'BRAVECTO-L-1' THEN 10
    WHEN sp.sku = 'BRAVECTO-XL-1' THEN 6
    WHEN sp.sku = 'FRONTLINE-S-3' THEN 15
    WHEN sp.sku = 'FRONTLINE-M-3' THEN 15
    WHEN sp.sku = 'FRONTLINE-L-3' THEN 12
    WHEN sp.sku = 'PP-DOG-ADULT-15KG' THEN 4
    WHEN sp.sku = 'PP-DOG-PUPPY-15KG' THEN 4
    WHEN sp.sku = 'PP-CAT-ADULT-7KG' THEN 5
    ELSE 5
  END as min_stock_level,
  CASE
    WHEN sp.sku LIKE 'RC-%' THEN 'Estante A1'
    WHEN sp.sku LIKE 'HILLS-%' THEN 'Estante A3'
    WHEN sp.sku LIKE 'NEXGARD-%' OR sp.sku LIKE 'BRAVECTO-%' THEN 'Vitrina 1'
    WHEN sp.sku LIKE 'FRONTLINE-%' THEN 'Vitrina 2'
    WHEN sp.sku LIKE 'PP-%' THEN 'Estante A4'
    ELSE NULL
  END as location,
  sp.requires_prescription,
  true as is_active
FROM public.store_products sp
WHERE sp.sku IN (
  'RC-DOG-ADULT-MED-15KG', 'RC-DOG-ADULT-MED-3KG', 'RC-DOG-PUPPY-MED-15KG', 'RC-DOG-PUPPY-MED-3KG',
  'RC-CAT-ADULT-4KG', 'RC-CAT-KITTEN-4KG', 'HILLS-SD-ADULT-12KG', 'HILLS-SD-PUPPY-12KG',
  'NEXGARD-S-3', 'NEXGARD-M-3', 'NEXGARD-L-3', 'NEXGARD-XL-3',
  'BRAVECTO-S-1', 'BRAVECTO-M-1', 'BRAVECTO-L-1', 'BRAVECTO-XL-1',
  'FRONTLINE-S-3', 'FRONTLINE-M-3', 'FRONTLINE-L-3',
  'PP-DOG-ADULT-15KG', 'PP-DOG-PUPPY-15KG', 'PP-CAT-ADULT-7KG'
)
AND sp.tenant_id IS NULL
ON CONFLICT (tenant_id, catalog_product_id)
DO UPDATE SET
  sale_price = EXCLUDED.sale_price,
  min_stock_level = EXCLUDED.min_stock_level,
  location = EXCLUDED.location;
