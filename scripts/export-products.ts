import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function exportPurchaseOrderTemplate() {
  console.log('Fetching products...');

  const { data: products, error } = await supabase
    .from('products')
    .select(
      'id, name, sku, cost, price, reorder_level, category:categories!products_category_id_fkey(name), brand:brands(name), uom:uom(name, abbreviation), variants:product_variants(id, name, sku)',
    )
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message);
    process.exit(1);
  }

  console.log(`Found ${products.length} products.`);

  // ── Sheet 1: Purchase Order Template ──────────────────────────────────────
  // One row per product (no variants), ready to fill in quantity + unit_price
  const rows: any[] = [];

  for (const p of products as any[]) {
    const hasVariants = p.variants && p.variants.length > 0;

    if (hasVariants) {
      // One row per variant
      for (const v of p.variants) {
        rows.push({
          // ── Read-only reference (do not change) ──
          product_id: p.id,
          variant_id: v.id,
          product_name: p.name,
          variant_name: v.name ?? '',
          sku: v.sku || p.sku,
          category: p.category?.name ?? '',
          brand: p.brand?.name ?? '',
          uom: p.uom?.abbreviation ?? p.uom?.name ?? '',
          current_cost: p.cost ?? '',
          reorder_level: p.reorder_level ?? '',
          // ── Fill these in ──
          quantity: '',
          unit_price: '',
        });
      }
    } else {
      rows.push({
        // ── Read-only reference (do not change) ──
        product_id: p.id,
        variant_id: '',
        product_name: p.name,
        variant_name: '',
        sku: p.sku,
        category: p.category?.name ?? '',
        brand: p.brand?.name ?? '',
        uom: p.uom?.abbreviation ?? p.uom?.name ?? '',
        current_cost: p.cost ?? '',
        reorder_level: p.reorder_level ?? '',
        // ── Fill these in ──
        quantity: '',
        unit_price: '',
      });
    }
  }

  // ── Sheet 2: Purchase Order Header ────────────────────────────────────────
  const headerRows = [
    {
      order_number: '',        // e.g. PO-2026-001
      supplier_id: '',         // leave blank if not using supplier IDs
      supplier_name: '',       // supplier name
      status: 'pending',       // pending | approved | received | cancelled
      order_date: new Date().toISOString().split('T')[0],
      expected_date: '',       // e.g. 2026-04-10
      notes: '',
    },
  ];

  // ── Build workbook ─────────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();

  // Sheet 1 – PO Items template
  const wsItems = XLSX.utils.json_to_sheet(rows, {
    header: [
      'product_id',
      'variant_id',
      'product_name',
      'variant_name',
      'sku',
      'category',
      'brand',
      'uom',
      'current_cost',
      'reorder_level',
      'quantity',
      'unit_price',
    ],
  });

  // Make columns wider for readability
  wsItems['!cols'] = [
    { wch: 38 }, // product_id
    { wch: 38 }, // variant_id
    { wch: 30 }, // product_name
    { wch: 20 }, // variant_name
    { wch: 18 }, // sku
    { wch: 18 }, // category
    { wch: 18 }, // brand
    { wch: 8  }, // uom
    { wch: 12 }, // current_cost
    { wch: 14 }, // reorder_level
    { wch: 10 }, // quantity       ← fill in
    { wch: 12 }, // unit_price     ← fill in
  ];

  XLSX.utils.book_append_sheet(wb, wsItems, 'PO Items');

  // Sheet 2 – PO Header template
  const wsHeader = XLSX.utils.json_to_sheet(headerRows);
  wsHeader['!cols'] = [
    { wch: 18 }, // order_number
    { wch: 38 }, // supplier_id
    { wch: 25 }, // supplier_name
    { wch: 12 }, // status
    { wch: 14 }, // order_date
    { wch: 14 }, // expected_date
    { wch: 30 }, // notes
  ];
  XLSX.utils.book_append_sheet(wb, wsHeader, 'PO Header');

  // ── Write file ─────────────────────────────────────────────────────────────
  const exportsDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir);

  const outputPath = path.join(exportsDir, `purchase-order-template-${Date.now()}.xlsx`);
  XLSX.writeFile(wb, outputPath);

  console.log(`\nExported to: ${outputPath}`);
  console.log(`  PO Items rows : ${rows.length}`);
  console.log('\nHow to use:');
  console.log('  1. Fill in "quantity" and "unit_price" for items you want to order');
  console.log('  2. Delete rows you do not need');
  console.log('  3. Fill in the PO Header sheet (order_number, supplier, dates)');
  console.log('  4. Import back via the API or share the file');
}

exportPurchaseOrderTemplate().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
