-- Migration to add how_to_use and ingredients fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS how_to_use TEXT,
ADD COLUMN IF NOT EXISTS ingredients TEXT;
