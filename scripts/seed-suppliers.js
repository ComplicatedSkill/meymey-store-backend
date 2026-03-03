// seed-suppliers.js
// Inserts suppliers for a specific store.
// Run: node scripts/seed-suppliers.js
//
// By default it inserts into the FIRST store found.
// Pass a store_id as an argument to target a specific store:
//   node scripts/seed-suppliers.js <store_id>

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yovxwufpkomcsdzadpib.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvdnh3dWZwa29tY3NkemFkcGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTcyMjQwNiwiZXhwIjoyMDg1Mjk4NDA2fQ.98TAy9hjj-Az6hPnOkez3oGhiW0q8cO28vqvnymwEKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SUPPLIER_NAMES = [
  'Srey Pich',
  'SR',
  'BoBo',
  'Church',
  'Default Supplier',
];

async function seed() {
  // Resolve store_id
  let storeId = process.argv[2];

  if (!storeId) {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, store_name')
      .limit(10);

    if (error || !stores?.length) {
      console.error('❌ Could not find any stores:', error?.message);
      process.exit(1);
    }

    if (stores.length === 1) {
      storeId = stores[0].id;
      console.log(`Using store: "${stores[0].store_name}" (${storeId})`);
    } else {
      console.log('Multiple stores found. Pass a store_id as an argument:\n');
      stores.forEach((s) =>
        console.log(
          `  node scripts/seed-suppliers.js ${s.id}  # ${s.store_name}`,
        ),
      );
      console.log('\nOr specify the store directly in this script.');
      process.exit(0);
    }
  }

  // Fetch existing suppliers for this store to skip duplicates
  const { data: existing, error: fetchError } = await supabase
    .from('suppliers')
    .select('name')
    .eq('store_id', storeId);

  if (fetchError) {
    console.error('❌ Error fetching existing suppliers:', fetchError.message);
    process.exit(1);
  }

  const existingNames = new Set(
    (existing || []).map((s) => s.name.trim().toLowerCase()),
  );

  const toInsert = SUPPLIER_NAMES.filter(
    (name) => !existingNames.has(name.trim().toLowerCase()),
  ).map((name) => ({ name, store_id: storeId }));

  if (toInsert.length === 0) {
    console.log('✅ All suppliers already exist. Nothing to insert.');
    return;
  }

  console.log(`Inserting ${toInsert.length} supplier(s)...`);

  const { data, error } = await supabase
    .from('suppliers')
    .insert(toInsert)
    .select();

  if (error) {
    console.error('❌ Error inserting suppliers:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} supplier(s):`);
  data.forEach((s) => console.log(`  - [${s.id}] ${s.name}`));
}

seed();
