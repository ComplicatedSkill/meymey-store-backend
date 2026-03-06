const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RAW_PRODUCTS = `
"ANUA_Heartleaf Quercetinol Pore Deep Cleansing Foam 150ML" 6
THE FACE SHOP_Natural Mask Sheet #Aloe 0.75
THE FACE SHOP_Natural Mask Sheet #Green Tea 0.75
THE FACE SHOP_Natural Mask Sheet #Red Ginseng 0.75
MEDICUBE_PDRN Pink Collagen Capsule Cream 11
BEAUTY OF JOSEON_Relief Sun Aqua Fresh Rice + B5 SPF 50+ PA++++ 50ML 7.8
"BEAUTY OF JOSEON_Relief Sun Rice Probiotics SPF 50+ PA++++ 50ML" 7.8
MEDICUBE_PDRN Pink Tone Up Sun Cream SPF50+ PA++++ 7.8
"GOWOON HARU_Calendula Retinol Daily Mask Box 30EA" 6.1
GOWOON HARU_Rice Glutathione Brightening Mask Box 30EA 6.1
GOWOON HARU_Chamomile Azulene Calming Mask Box 30EA 6.1
SKIN1004_Hyalu Cica Water Fit Sun Serum SPF50+ PA++++ 50ML 7.7
SKIN1004_Probio Cica Glow Sun Ampoule SPF50+ PA++++ 50ML 9
SKIN1004_Probio Cica Intensive Ampoule 95ML 12.6
SKIN1004_Tone Brightening Capsule Ampoule 100ML 8.8
SKIN1004_Tone Brightening Boosting Toner 210ML 8.3
SKIN1004_Tone Brightening Capsule Cream 75ML 10.5
SKIN1004_Tone Brightening Cleansing Gel Foam 125ML 6.8
SKIN1004_Tone Brightening Tone Up Sunscreen SPF50+ PA++++ 50ML 9
MEDICUBE_PDRN Pink Peptide Serum 30ML 8.8
HEIMISH_All Clean Balm 120ML 7.8
"MEDICUBE_PDRN Pink Hyaluronic Moisturizing Cream 50ML" 8
ROUNDLAB_Mugwort Calming Cleanser 150ML 6
ROUNDLAB_Soybean Cleanser 150ML 6
ROUNDLAB_Pine Calming Cica Cream 50ML 10
ROUNDLAB_Birch Juice Moisturizing Sun Cream 50ML 7.7
ISNTREE_Hyaluronic Acid Watery Sun Gel 50ML 7.7
ISNTREE_Hyaluronic Acid Natural Sunscreen 50ML 7.7
ISNTREE_Hyaluronic Acid Fresh Sun Serum SPF50+ PA++++ 7.7
ISNTREE_Hyaluronic Acid Water Mist 100ML 6.3
ISNTREE_Hyaluronic Acid Moist Cream 100ML 7.5
"ISNTREE_Hyaluronic Acid Low PH Cleansing Foam 150ML" 6.5
`;

async function insertProducts() {
  // Get store ID
  const { data: stores, error: storeError } = await supabase
    .from('stores')
    .select('id, store_name');
  if (storeError || !stores.length) {
    console.error(
      '❌ Error fetching stores:',
      storeError?.message || 'No stores found',
    );
    process.exit(1);
  }

  const storeId = stores[0].id;
  console.log(`Using store: ${stores[0].store_name} (${storeId})`);

  const lines = RAW_PRODUCTS.trim().split('\n');
  const products = [];

  // Get last SKU number to increment
  const { data: lastProducts } = await supabase
    .from('products')
    .select('sku')
    .ilike('sku', 'PRD-%')
    .order('sku', { ascending: false })
    .limit(1);

  let skuIndex = 1;
  if (lastProducts && lastProducts.length > 0) {
    const lastSku = lastProducts[0].sku;
    const match = lastSku.match(/PRD-(\d+)/);
    if (match) {
      skuIndex = parseInt(match[1]) + 1;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Pattern: "Name" Cost or Name Cost
    // Using regex to grab the numeric cost at the end
    const match = trimmed.match(/^(?:"?)(.*?)(?:"?)\s+([\d.]+)$/);
    if (match) {
      const name = match[1].trim();
      const cost = parseFloat(match[2]);
      const price = cost + 1;
      const sku = `PRD-${String(skuIndex++).padStart(4, '0')}`;

      products.push({
        name,
        sku,
        cost,
        price,
        store_id: storeId,
        reorder_level: 5, // Default reorder level
      });
    } else {
      console.warn(`⚠️ Could not parse line: ${line}`);
    }
  }

  if (products.length === 0) {
    console.error('❌ No products parsed.');
    return;
  }

  console.log(`Inserting ${products.length} products...`);

  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) {
    console.error('❌ Error inserting products:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} products!`);
  data.forEach((p) =>
    console.log(
      `  - [${p.sku}] ${p.name} (Cost: ${p.cost}, Price: ${p.price})`,
    ),
  );
}

insertProducts();
