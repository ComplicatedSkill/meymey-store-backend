-- Migration: Accounts Receivable (money customers owe us, from credit sales)
-- Run this once in your Supabase SQL editor.

CREATE TABLE IF NOT EXISTS accounts_receivable (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       UUID,
  customer_id    UUID REFERENCES customers (id) ON DELETE SET NULL,
  sales_order_id UUID REFERENCES sales_orders (id) ON DELETE CASCADE,

  ar_number      TEXT NOT NULL UNIQUE,

  issue_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE,

  currency       TEXT DEFAULT 'USD',
  total_amount   NUMERIC NOT NULL DEFAULT 0,
  amount_paid    NUMERIC NOT NULL DEFAULT 0,
  balance        NUMERIC NOT NULL DEFAULT 0,

  -- open | partial | paid | overdue | cancelled
  status         TEXT NOT NULL DEFAULT 'open',

  notes          TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One receivable per sales order (partial index so manual AR rows are still allowed)
CREATE UNIQUE INDEX IF NOT EXISTS uq_ar_sales_order
  ON accounts_receivable (sales_order_id)
  WHERE sales_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ar_store    ON accounts_receivable (store_id);
CREATE INDEX IF NOT EXISTS idx_ar_customer ON accounts_receivable (customer_id);
CREATE INDEX IF NOT EXISTS idx_ar_status   ON accounts_receivable (status);

-- Receipts applied against a receivable
CREATE TABLE IF NOT EXISTS ar_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ar_id             UUID NOT NULL REFERENCES accounts_receivable (id) ON DELETE CASCADE,
  store_id          UUID,
  amount            NUMERIC NOT NULL,
  payment_method_id UUID REFERENCES payment_methods (id) ON DELETE SET NULL,
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  reference         TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ar_payments_ar ON ar_payments (ar_id);

-- Selector on the sales order: 'AR' (credit sale) vs 'COMPLETE' (paid in full)
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'COMPLETE';
