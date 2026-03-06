-- Run this in Supabase Dashboard → SQL Editor
-- This adds the brand_id column to products and links it to the brands table

-- 1. Add the brand_id column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- 2. Create an index for performance
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

-- 3. Notify PostgREST to reload the schema cache (happens automatically but good to know)
-- You can also run: NOTIFY pgrst, 'reload schema'; 
-- if the error persists for a few seconds.
