-- Migration to add missing customer columns to sales_orders
-- Run this in the Supabase SQL Editor

ALTER TABLE sales_orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS source TEXT;
