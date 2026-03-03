// seed-categories.js
// Run: node scripts/seed-categories.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yovxwufpkomcsdzadpib.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvdnh3dWZwa29tY3NkemFkcGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTcyMjQwNiwiZXhwIjoyMDg1Mjk4NDA2fQ.98TAy9hjj-Az6hPnOkez3oGhiW0q8cO28vqvnymwEKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const categories = [
  { name: 'Body Lotion' },
  { name: 'Sun Screen' },
  { name: 'Lotion UV' },
  { name: 'Serum' },
  { name: 'Oil' },
  { name: 'Tooth' },
  { name: 'Body Wash' },
  { name: 'Shampoo' },
  { name: 'Conditioner' },
  { name: 'Hair Set' },
  { name: 'Sheet Mask' },
  { name: 'Mask' },
  { name: 'Cream/Moisturizer' },
  { name: 'Essence' },
  { name: 'Hair Color' },
  { name: 'Foam' },
  { name: 'Scrubs' },
  { name: 'Lip Stick' },
  { name: 'Pimple Patch' },
  { name: 'Vitamins' },
  { name: 'Face UV' },
  { name: 'Night Cream' },
  { name: 'BB' },
  { name: 'Armpit' },
  { name: 'Cushion' },
  { name: 'Blush' },
  { name: 'Cleansing Water' },
  { name: 'Cleansing Oil' },
  { name: 'F&B' },
  { name: 'Make Up Tools' },
  { name: 'Women Treatment' },
];

async function seed() {
  // Fetch existing category names to avoid duplicates
  const { data: existing, error: fetchError } = await supabase
    .from('categories')
    .select('name');

  if (fetchError) {
    console.error('❌ Error fetching existing categories:', fetchError.message);
    process.exit(1);
  }

  const existingNames = new Set(
    (existing || []).map((c) => c.name.trim().toLowerCase()),
  );

  const toInsert = categories.filter(
    (c) => !existingNames.has(c.name.trim().toLowerCase()),
  );

  if (toInsert.length === 0) {
    console.log('✅ All categories already exist. Nothing to insert.');
    return;
  }

  console.log(`Inserting ${toInsert.length} new categories...`);

  const { data, error } = await supabase
    .from('categories')
    .insert(toInsert)
    .select();

  if (error) {
    console.error('❌ Error inserting categories:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} categories:`);
  data.forEach((c) => console.log(`  - [${c.id}] ${c.name}`));
}

seed();
