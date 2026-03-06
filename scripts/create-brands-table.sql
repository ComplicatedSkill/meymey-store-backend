-- Run this in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/yovxwufpkomcsdzadpib/editor

CREATE TABLE IF NOT EXISTS public.brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow public read (for website display without auth)
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_public_read" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "brands_auth_write" ON public.brands
  FOR ALL USING (auth.role() = 'service_role');
