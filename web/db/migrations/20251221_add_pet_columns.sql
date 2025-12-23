-- Migration applied on 2025-12-21 to align database with application code
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS diet_category TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS diet_notes TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS temperament TEXT;
