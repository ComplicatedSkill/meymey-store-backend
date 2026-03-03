import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const tables = [
  'sales_order_items',
  'sales_orders',
  'purchase_inventory',
  'purchase_orders',
  'stock_movements',
  'stock_adjustments',
  'stock_batches',
  'product_variants',
  'products',
  'categories',
  'uom',
  'customers',
  'suppliers',
  'payment_methods',
  'taxes',
  'exchange_rates',
  'notifications',
  'invoices',
  'stores',
];

async function cleanup() {
  console.log('🚀 Starting Database Cleanup...');

  for (const table of tables) {
    console.log(`🧹 Clearing ${table}...`);
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error(`❌ Error clearing ${table}:`, error.message);
    }
  }

  console.log('✅ Database cleanup completed!');
}

cleanup().catch((err) => {
  console.error('💥 Fatal error during cleanup:', err);
  process.exit(1);
});
