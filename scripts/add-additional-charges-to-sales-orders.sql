-- Migration: add additional_charges JSONB column to sales_orders
-- Run this once in your Supabase SQL editor.

ALTER TABLE sales_orders
  ADD COLUMN IF NOT EXISTS additional_charges JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Optional: add a comment describing the shape
COMMENT ON COLUMN sales_orders.additional_charges IS
  'Array of {id, label, amount} objects representing extra charges (delivery fee, tax, etc.)';
