// seed-brands.js
// Run: node scripts/seed-brands.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yovxwufpkomcsdzadpib.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvdnh3dWZwa29tY3NkemFkcGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTcyMjQwNiwiZXhwIjoyMDg1Mjk4NDA2fQ.98TAy9hjj-Az6hPnOkez3oGhiW0q8cO28vqvnymwEKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Default logo: letter-based avatar using ui-avatars.com
const defaultLogo = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256&bold=true&format=png`;

const brands = [
  { name: 'Beauty Of Josoen' },
  { name: 'Felix' },
  { name: 'Yasaka' },
  { name: 'COSRX' },
  { name: 'Mary & May' },
  { name: 'Lucaci' },
  { name: 'AITA' },
  { name: 'ANUA' },
  { name: 'Augeao' },
  { name: 'Black Sheep' },
  { name: 'Clear' },
  { name: 'Colatin' },
  { name: 'Dove' },
  { name: 'EE' },
  { name: 'Fino' },
  { name: 'Gowoon Haru' },
  { name: 'HEIMISH' },
  { name: 'Hitomugi' },
  { name: 'HK7' },
  { name: 'ISNTREE' },
  { name: 'Japan' },
  { name: 'Jinji' },
  { name: 'Justin' },
  { name: 'Kekemood' },
  { name: 'Koni' },
  { name: 'Logan' },
  { name: 'Mamiza' },
  { name: 'MediAnswer' },
  { name: 'Medicube' },
  { name: 'Miss Sunflower' },
  { name: 'MN' },
  { name: 'Mojo' },
  { name: 'Moon' },
  { name: 'NECECA' },
  { name: 'Nai' },
  { name: 'NC' },
  { name: 'NNP' },
  { name: 'OG' },
  { name: 'P24' },
  { name: 'Peach Peeling' },
  { name: 'Pelica' },
  { name: 'PH-Care' },
  { name: 'Pha Pha' },
  { name: 'Pichy' },
  { name: 'Pimple Patch' },
  { name: 'Pop' },
  { name: 'RDR' },
  { name: 'Reluce' },
  { name: 'Roundlab' },
  { name: 'Skin 1004' },
  { name: 'SO-Y' },
  { name: 'Soko' },
  { name: 'The Elf' },
  { name: 'The Face Shop' },
  { name: 'U-Well' },
  { name: 'Vaseline' },
  { name: 'Zoso' },
].map((b) => ({ ...b, logo_url: defaultLogo(b.name) }));

async function seed() {
  // Fetch existing brand names to skip duplicates
  const { data: existing, error: fetchError } = await supabase
    .from('brands')
    .select('name');

  if (fetchError) {
    console.error('❌ Error fetching existing brands:', fetchError.message);
    process.exit(1);
  }

  const existingNames = new Set(
    (existing || []).map((b) => b.name.trim().toLowerCase()),
  );

  const toInsert = brands.filter(
    (b) => !existingNames.has(b.name.trim().toLowerCase()),
  );

  if (toInsert.length === 0) {
    console.log('✅ All brands already exist. Nothing to insert.');
    return;
  }

  console.log(`Inserting ${toInsert.length} new brands...`);

  const { data, error } = await supabase
    .from('brands')
    .insert(toInsert)
    .select();

  if (error) {
    console.error('❌ Error inserting brands:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} brands:\n`);
  data.forEach((b) => console.log(`  - [${b.id}] ${b.name}`));
}

seed();
