-- Temporary store tables setup
CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  images TEXT[],
  target_species TEXT[],
  requires_prescription BOOLEAN DEFAULT false,
  is_global_catalog BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.store_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Add foreign key columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_products' AND column_name = 'store_categories_id') THEN
    ALTER TABLE public.store_products ADD COLUMN store_categories_id UUID REFERENCES public.store_categories(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_products' AND column_name = 'store_brands_id') THEN
    ALTER TABLE public.store_products ADD COLUMN store_brands_id UUID REFERENCES public.store_brands(id);
  END IF;
END $$;

-- Insert some test data
INSERT INTO public.store_products (tenant_id, sku, name, base_price, is_global_catalog, is_active)
VALUES
  (NULL, 'TEST001', 'Producto de Prueba 1', 10000, true, true),
  (NULL, 'TEST002', 'Producto de Prueba 2', 25000, true, true)
ON CONFLICT (sku) DO NOTHING;
