-- Migration: Accounts Payable (money we owe suppliers, from credit purchases)
-- Run this once in your Supabase SQL editor.

CREATE TABLE IF NOT EXISTS accounts_payable (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          UUID,
  supplier_id       UUID REFERENCES suppliers (id) ON DELETE SET NULL,
  purchase_order_id UUID REFERENCES purchase_orders (id) ON DELETE CASCADE,

  ap_number         TEXT NOT NULL UNIQUE,

  issue_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date          DATE,

  currency          TEXT DEFAULT 'USD',
  total_amount      NUMERIC NOT NULL DEFAULT 0,
  amount_paid       NUMERIC NOT NULL DEFAULT 0,
  balance           NUMERIC NOT NULL DEFAULT 0,

  -- open | partial | paid | overdue | cancelled
  status            TEXT NOT NULL DEFAULT 'open',

  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One payable per purchase order (partial index so manual AP rows are still allowed)
CREATE UNIQUE INDEX IF NOT EXISTS uq_ap_purchase_order
  ON accounts_payable (purchase_order_id)
  WHERE purchase_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ap_store    ON accounts_payable (store_id);
CREATE INDEX IF NOT EXISTS idx_ap_supplier ON accounts_payable (supplier_id);
CREATE INDEX IF NOT EXISTS idx_ap_status   ON accounts_payable (status);

-- Payments made against a payable
CREATE TABLE IF NOT EXISTS ap_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ap_id             UUID NOT NULL REFERENCES accounts_payable (id) ON DELETE CASCADE,
  store_id          UUID,
  amount            NUMERIC NOT NULL,
  payment_method_id UUID REFERENCES payment_methods (id) ON DELETE SET NULL,
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  reference         TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ap_payments_ap ON ap_payments (ap_id);

-- Selector on the purchase order: 'AP' (credit purchase) vs 'COMPLETE' (paid in full)
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'COMPLETE';
