// dedup-categories.js
// Keeps the OLDEST entry for each category name, deletes newer duplicates.
// Run: node scripts/dedup-categories.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yovxwufpkomcsdzadpib.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvdnh3dWZwa29tY3NkemFkcGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTcyMjQwNiwiZXhwIjoyMDg1Mjk4NDA2fQ.98TAy9hjj-Az6hPnOkez3oGhiW0q8cO28vqvnymwEKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function dedup() {
  // Fetch all categories ordered oldest first
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Failed to fetch categories:', error.message);
    process.exit(1);
  }

  // Group by name — first occurrence is the keeper
  const seen = new Map();
  const toDelete = [];

  for (const cat of data) {
    const key = cat.name.trim().toLowerCase();
    if (seen.has(key)) {
      toDelete.push(cat.id);
    } else {
      seen.set(key, cat.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`Found ${toDelete.length} duplicate(s) to remove...`);

  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .in('id', toDelete);

  if (deleteError) {
    console.error('❌ Failed to delete duplicates:', deleteError.message);
    process.exit(1);
  }

  console.log(`✅ Removed ${toDelete.length} duplicate(s). Database is clean!`);
}

dedup();
