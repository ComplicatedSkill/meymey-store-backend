-- Migration: product_uom_conversions table
-- Allows a product to be sold/purchased in multiple units of measure.
-- Stock is always tracked in BASE units (e.g. sheets).
-- conversion_factor = how many base units make 1 of this UOM (e.g. 1 box = 10 sheets → factor = 10)

CREATE TABLE IF NOT EXISTS product_uom_conversions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  uom_id            uuid NOT NULL REFERENCES uom(id) ON DELETE RESTRICT,
  conversion_factor decimal(10, 4) NOT NULL DEFAULT 1,  -- base units per 1 of this UOM
  price             decimal(12, 2) NOT NULL DEFAULT 0,  -- selling price per this UOM
  is_base_uom       boolean NOT NULL DEFAULT false,     -- true for the smallest unit (factor must be 1)
  is_purchase_uom   boolean NOT NULL DEFAULT false,     -- true for the unit we use when purchasing
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Each product can only have one base UOM and one purchase UOM
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_uom_conv_base
  ON product_uom_conversions (product_id)
  WHERE is_base_uom = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_uom_conv_purchase
  ON product_uom_conversions (product_id)
  WHERE is_purchase_uom = true;

-- A product+uom combo should be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_uom_conv_unique
  ON product_uom_conversions (product_id, uom_id);

-- Enable RLS
ALTER TABLE product_uom_conversions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "service role full access" ON product_uom_conversions
  FOR ALL
  USING (true)
  WITH CHECK (true);
