-- Migration: link sales_orders to the payment method used to pay for them.
-- Run this once in your Supabase SQL editor.

ALTER TABLE sales_orders
  ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_method ON sales_orders (payment_method_id);

COMMENT ON COLUMN sales_orders.payment_method_id IS
  'Which payment method (cash, bank transfer, etc.) the customer paid with. Nullable — draft/AR orders may not have one yet.';
