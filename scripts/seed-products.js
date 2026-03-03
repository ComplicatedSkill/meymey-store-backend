// seed-products.js
// Inserts products for a specific store with auto-generated SKUs.
// Run: node scripts/seed-products.js
// Or for a specific store: node scripts/seed-products.js <store_id>

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yovxwufpkomcsdzadpib.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvdnh3dWZwa29tY3NkemFkcGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTcyMjQwNiwiZXhwIjoyMDg1Mjk4NDA2fQ.98TAy9hjj-Az6hPnOkez3oGhiW0q8cO28vqvnymwEKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// SKU prefix — change if you want e.g. 'MM' for MeyMey
const SKU_PREFIX = 'PRD';

// columns: name | reorder_level (qty) | cost | price
const PRODUCTS = [
  { name: 'PH care 150ml', reorder_level: 6, cost: 3.25, price: 4.5 },
  { name: 'PH care 50ml', reorder_level: 6, cost: 1.6, price: 2.75 },
  { name: 'PH klen 50ml', reorder_level: 6, cost: 1.25, price: 2.5 },
  { name: 'PH klen 150ml', reorder_level: 6, cost: 2.5, price: 3.5 },
  {
    name: 'Augeao shampoo conditioner',
    reorder_level: 3,
    cost: 2.4,
    price: 3.5,
  },
  { name: 'Fino Conditioner', reorder_level: 3, cost: 6.5, price: 7.5 },
  { name: 'Fino Shampoo', reorder_level: 3, cost: 6.5, price: 7.5 },
  { name: 'U well Conditioner', reorder_level: 3, cost: 5.1, price: 6.25 },
  { name: 'U well Shampoo', reorder_level: 3, cost: 5.1, price: 6.25 },
  { name: 'Japan Shampoo conditioner', reorder_level: 3, cost: 3.2, price: 5 },
  { name: 'Clear shampoo ចាក់', reorder_level: 6, cost: 2.4, price: 3.5 },
  { name: 'Clear ចុច', reorder_level: 3, cost: 5.1, price: 6.25 },
  {
    name: 'Shampoo 2&1 conditioner',
    reorder_level: 3,
    cost: 10.4,
    price: 12.5,
  },
  { name: 'Saforelle', reorder_level: 3, cost: 4.4, price: 5.5 },
  { name: 'Pha Pha', reorder_level: 5, cost: 6, price: 7 },
  { name: 'Lucaci mask', reorder_level: 6, cost: 4.1, price: 5.5 },
  { name: 'Miss cushion', reorder_level: 6, cost: 15.5, price: 16.5 },
  { name: 'Yura scrub', reorder_level: 6, cost: 3, price: 4 },
  { name: 'Gojo mask red', reorder_level: 6, cost: 6.9, price: 8 },
  { name: 'Cosrx cream', reorder_level: 3, cost: 8.7, price: 10 },
  { name: 'Cosrx essences', reorder_level: 3, cost: 7.8, price: 9 },
  { name: 'Soko color', reorder_level: 12, cost: 2.5, price: 3.5 },
  { name: 'Hito foam', reorder_level: 6, cost: 1.9, price: 3 },
  { name: 'Pop scrub', reorder_level: 6, cost: 4.4, price: 5.5 },
  { name: 'Peach Peeling', reorder_level: 6, cost: 4.8, price: 6 },
  { name: 'HK7 Cafe សម្រក', reorder_level: 6, cost: 5.7, price: 7 },
  { name: 'ថ្នាំដុស NNP', reorder_level: 6, cost: 1, price: 2 },
  { name: 'Serum The Elf', reorder_level: 3, cost: 3.5, price: 4.5 },
  { name: 'ដុសធ្មេញ EE', reorder_level: 6, cost: 3.4, price: 4.5 },
  { name: 'ដុសធ្មេញ stand', reorder_level: 6, cost: 2.9, price: 4 },
  { name: 'Kekemood ឈូក ថ្មី', reorder_level: 12, cost: 0.5, price: 2 },
  { name: 'Kekemood soft mist mouse', reorder_level: 12, cost: 0.5, price: 2 },
  { name: 'Kekemood', reorder_level: 9, cost: 0.7, price: 2 },
  { name: 'អប់មុខសារាយទឹកឃ្មុំ', reorder_level: 6, cost: 1.9, price: 3 },
  { name: 'ជ្រូកក្រហមបិទមុន', reorder_level: 3, cost: 1.5, price: 2.5 },
  { name: 'OG-night cream small', reorder_level: 12, cost: 6.7, price: 8 },
  { name: 'OG-serum', reorder_level: 12, cost: 10.5, price: 11.5 },
  { name: 'OG-vitamin', reorder_level: 12, cost: 10.5, price: 11.5 },
  { name: 'OG-night cream VIP', reorder_level: 12, cost: 9.2, price: 10.5 },
  { name: 'B-OG-UV Red', reorder_level: 6, cost: 6, price: 7 },
  { name: 'B-OG-UV white', reorder_level: 6, cost: 6, price: 7 },
  { name: 'OG-serum VIP', reorder_level: 12, cost: 6.7, price: 8 },
  { name: 'ព្រះច័ន្ទ Body lotion', reorder_level: 12, cost: 3.7, price: 5 },
  { name: 'ចៀម Lotion 500g', reorder_level: 12, cost: 20.9, price: 22 },
  { name: 'ចៀម ស្ពាថ្មី', reorder_level: 12, cost: 3.1, price: 4.5 },
  {
    name: 'B-ចៀម-Body Essence សេរ៉ូមថ្មី',
    reorder_level: 12,
    cost: 6.8,
    price: 8,
  },
  { name: 'ចៀម UV body lotion', reorder_level: 12, cost: 12.8, price: 14 },
  { name: 'ចៀម ប្រេង', reorder_level: 12, cost: 11.7, price: 13 },
  { name: 'Jinji យប់ Nutrient', reorder_level: 12, cost: 6.8, price: 8 },
  { name: 'Jinji-សេរ៉ូម យប់', reorder_level: 12, cost: 6.8, price: 8 },
  { name: 'Miss-BB', reorder_level: 12, cost: 5.4, price: 7 },
  { name: 'Miss Armpit តូច', reorder_level: 12, cost: 3.45, price: 4.5 },
  { name: 'Miss body oil', reorder_level: 12, cost: 8.5, price: 9.5 },
  { name: 'Miss Armpit ធំ', reorder_level: 12, cost: 9.6, price: 11 },
  { name: 'Miss face Foam', reorder_level: 12, cost: 6.1, price: 7.5 },
  { name: 'SO-Y-body Lotion ចាស់', reorder_level: 12, cost: 10.5, price: 11.5 },
  { name: 'SO-Y-scrub New', reorder_level: 12, cost: 4.7, price: 6 },
  { name: 'P-SO-Y-ស្ពា', reorder_level: 12, cost: 2.65, price: 4 },
  { name: 'Nececa Cushion Mate', reorder_level: 24, cost: 10.1, price: 11.5 },
  { name: 'Nececa Cushion glow', reorder_level: 24, cost: 10.1, price: 11.5 },
  { name: 'Nececa Blush', reorder_level: 12, cost: 6.6, price: 8 },
  { name: 'Mojo serum Red', reorder_level: 12, cost: 8.5, price: 9.5 },
  { name: 'Mojo Mask Red', reorder_level: 12, cost: 6.9, price: 8 },
  { name: 'P24-UV', reorder_level: 12, cost: 4.2, price: 5.5 },
  { name: 'P24-BB', reorder_level: 12, cost: 4.2, price: 5.5 },
  { name: 'P24-Cleansing Water', reorder_level: 12, cost: 5.5, price: 6.5 },
  { name: 'P24 Toner Pad', reorder_level: 24, cost: 4.7, price: 6 },
  { name: 'P24 Mask', reorder_level: 12, cost: 4.5, price: 5.5 },
  { name: 'P24 night cream', reorder_level: 12, cost: 3.5, price: 4.5 },
  { name: 'Felix body lotion', reorder_level: 12, cost: 20.3, price: 21.5 },
  { name: 'Felix-Armpit Big', reorder_level: 12, cost: 8.2, price: 9.5 },
  { name: 'Felix-Armpit small', reorder_level: 12, cost: 39, price: 4.5 },
  { name: 'Felix VIP ស្រ្កាប់ពន្លៃ', reorder_level: 12, cost: 8.2, price: 9.5 },
  { name: 'Felix Cushion 21', reorder_level: 12, cost: 9.2, price: 10.5 },
  { name: 'Felix-cushion 23', reorder_level: 12, cost: 9.2, price: 10.5 },
  { name: 'Felix-UV', reorder_level: 12, cost: 8.2, price: 9.5 },
  { name: 'Mamiza-UV ខៀវ', reorder_level: 12, cost: 4.8, price: 6 },
  { name: 'Mamiza-BB Pink', reorder_level: 12, cost: 4.2, price: 5.5 },
  { name: 'Mamiza soap', reorder_level: 12, cost: 18, price: 2.5 },
  { name: 'Mamiza Foam', reorder_level: 12, cost: 2.8, price: 4 },
  { name: 'Mamiza mask blue', reorder_level: 12, cost: 4.4, price: 6 },
  { name: 'Mamiza Cleaning Water', reorder_level: 12, cost: 6, price: 7 },
  { name: 'Mamiza Serum blue', reorder_level: 12, cost: 6.7, price: 8 },
  { name: 'Mamiza night cream small', reorder_level: 12, cost: 18, price: 2.5 },
  { name: 'MN-BB', reorder_level: 12, cost: 7.9, price: 9 },
  { name: 'MN-serum', reorder_level: 12, cost: 3.4, price: 4.5 },
  { name: 'MN-យប់', reorder_level: 12, cost: 3.3, price: 4.5 },
  { name: 'MN-UV', reorder_level: 12, cost: 7.9, price: 9 },
  { name: 'Pop Serum', reorder_level: 12, cost: 2.5, price: 3.5 },
  { name: 'Yasaka Body lotion', reorder_level: 12, cost: 14.7, price: 16 },
  { name: 'Yasaka Scrub', reorder_level: 12, cost: 7.7, price: 9 },
  { name: 'P-Yasaka-Spa', reorder_level: 12, cost: 3.4, price: 4.5 },
  { name: 'S-Yasaka Oil', reorder_level: 12, cost: 7.7, price: 9 },
  { name: 'RDR Sheet mask', reorder_level: 6, cost: 5, price: 6 },
  { name: 'RDR Vitamin C Body Lotion', reorder_level: 12, cost: 5.9, price: 7 },
  {
    name: 'RDR Moisturizing Body Lotion',
    reorder_level: 12,
    cost: 5.9,
    price: 7,
  },
  { name: 'RDR Night Cream 200', reorder_level: 6, cost: 3.7, price: 5 },
  { name: 'RDR Sun Cream', reorder_level: 6, cost: 4.2, price: 5.5 },
  { name: 'RDR Cleansing Foam 100', reorder_level: 6, cost: 2.5, price: 3.5 },
  { name: 'RDR Double Serum 100', reorder_level: 6, cost: 3.5, price: 4.5 },
  { name: 'AITA UV Bright Body Serum', reorder_level: 10, cost: 5, price: 6 },
  { name: 'AITA Whitening Body Lotion', reorder_level: 10, cost: 5, price: 6 },
  { name: 'Pichy Spa', reorder_level: 6, cost: 2.6, price: 4 },
  { name: 'Pichy Body Lotion ធំ', reorder_level: 6, cost: 17.2, price: 18.5 },
  { name: 'Miss Body Lotion', reorder_level: 6, cost: 16.3, price: 17.5 },
  { name: 'Moon Shampoo', reorder_level: 6, cost: 4.2, price: 5.5 },
  { name: 'Moon Conditioner', reorder_level: 6, cost: 4.2, price: 5.5 },
  { name: 'Moon Hair Serum', reorder_level: 6, cost: 2.7, price: 4 },
  { name: 'លម្អងស្រ្កាប់ក្រូច តូច', reorder_level: 12, cost: 0.95, price: 2 },
  { name: 'លម្អងស្រ្កាប់ តូច', reorder_level: 12, cost: 0.95, price: 2 },
  { name: 'Colatin Conditioner', reorder_level: 6, cost: 6.6, price: 8 },
  { name: 'Colatin Shampoo', reorder_level: 6, cost: 6.6, price: 8 },
  { name: 'Lucaci Acne Mask', reorder_level: 12, cost: 4.2, price: 5.5 },
  { name: 'Felix Conditioner តូច', reorder_level: 6, cost: 4.4, price: 5.5 },
  { name: 'Felix Shampoo តូច', reorder_level: 6, cost: 4.4, price: 5.5 },
  { name: 'Felix Conditioner ធំ', reorder_level: 6, cost: 5.8, price: 7 },
  { name: 'Felix Shampoo ធំ', reorder_level: 6, cost: 5.8, price: 7 },
  { name: 'MBK BB Filter', reorder_level: 6, cost: 10.5, price: 11.5 },
  {
    name: 'Justin Body Lotion ឡេរខៀវ',
    reorder_level: 12,
    cost: 5.75,
    price: 7,
  },
  { name: 'Logan Shower Gel ខៀវ', reorder_level: 2, cost: 4, price: 5 },
  { name: 'Logan Shower Gel ឈូក', reorder_level: 2, cost: 4, price: 5 },
  { name: 'Logan Shower Gel លឿង', reorder_level: 2, cost: 4, price: 5 },
  { name: 'KONI Conditioner', reorder_level: 6, cost: 8.2, price: 9.5 },
  { name: 'KONI Shampoo', reorder_level: 6, cost: 8.2, price: 9.5 },
  { name: 'NC scrub កាហ្វេ', reorder_level: 6, cost: 5.7, price: 7 },
  { name: 'ZOSO Jelly ចាហួយសម្រក', reorder_level: 12, cost: 2.5, price: 3.5 },
  {
    name: 'Mamiza Night Cream ធំ 200',
    reorder_level: 12,
    cost: 4.2,
    price: 5.5,
  },
  { name: 'Soko Hair Treatment', reorder_level: 6, cost: 3, price: 4 },
  { name: 'Reluce Serum Prism lily', reorder_level: 6, cost: 8.44, price: 9 },
  {
    name: 'Reluce Serum shiny Freesia',
    reorder_level: 6,
    cost: 8.45,
    price: 9.5,
  },
  {
    name: 'Reluce Milk Lotion Prism lily',
    reorder_level: 6,
    cost: 7.14,
    price: 8.5,
  },
  {
    name: 'Reluce Milk Lotion Shiny Freesia',
    reorder_level: 6,
    cost: 8.51,
    price: 10,
  },
  { name: 'Cosrx Aloe sun cream', reorder_level: 6, cost: 5.7, price: 7 },
  { name: 'Cosrx Low pH foam', reorder_level: 6, cost: 5, price: 6 },
  { name: 'Cosrx Salicylic Acid foam', reorder_level: 6, cost: 4.8, price: 6 },
  { name: 'NACECA Lip Balm Pink', reorder_level: 6, cost: 6.6, price: 8 },
  { name: 'NACECA Lip Balm Orange', reorder_level: 6, cost: 6.6, price: 8 },
  {
    name: 'NACECA Liquid Eyeliner Pen Mix',
    reorder_level: 6,
    cost: 3.2,
    price: 4.5,
  },
  { name: 'Dove Scrub Korea', reorder_level: 6, cost: 6.9, price: 8 },
  { name: 'Dove Scrub Slovaki', reorder_level: 2, cost: 6, price: 7 },
  { name: 'Dove Scrub Mango Slovaki', reorder_level: 2, cost: 6, price: 7 },
  { name: 'Pelican Body Scrub', reorder_level: 6, cost: 12, price: 13 },
  { name: 'ម៉ាសអង្ករជប៉ុន', reorder_level: 6, cost: 6, price: 7 },
  {
    name: 'MediAnswer Pore Collagen Mask',
    reorder_level: 3,
    cost: 7.3,
    price: 8.5,
  },
  {
    name: 'MedAnswer Calming Collagen Mask',
    reorder_level: 3,
    cost: 7.3,
    price: 8.5,
  },
  {
    name: 'MediAnswer Vita Collagen Mask',
    reorder_level: 3,
    cost: 7.3,
    price: 8.5,
  },
  { name: 'បិទមុនជ្រូកក្រហម', reorder_level: 6, cost: 1.4, price: 2.5 },
  { name: 'Vaseline USA Calm Healing', reorder_level: 2, cost: 3.84, price: 5 },
  { name: 'Vaseline USA Advanced', reorder_level: 2, cost: 3.75, price: 5 },
  {
    name: 'Vaseline USA Cocoa Radiant',
    reorder_level: 2,
    cost: 3.75,
    price: 5,
  },
  { name: 'Vaseline USA Essential', reorder_level: 2, cost: 3.75, price: 5 },
  { name: 'Vaseline USA Daily', reorder_level: 2, cost: 3.75, price: 5 },
  { name: 'Vaseline USA Soothing', reorder_level: 2, cost: 3.75, price: 5 },
  {
    name: 'Vaseline Lotion Korea 1000ml ១',
    reorder_level: 2,
    cost: 6.2,
    price: 7.5,
  },
  {
    name: 'Vaseline Lotion Korea 1000ml ២',
    reorder_level: 2,
    cost: 6.2,
    price: 7.5,
  },
  {
    name: 'Vaseline Lotion Korea 1000ml ៣',
    reorder_level: 2,
    cost: 6.2,
    price: 7.5,
  },
  { name: 'Dove Spray Go Fresh ១', reorder_level: 2, cost: 2, price: 3 },
  { name: 'Dove Spray Go Fresh ២', reorder_level: 2, cost: 2, price: 3 },
  { name: 'Dove Spray Go Fresh ៣', reorder_level: 2, cost: 2, price: 3 },
  { name: 'Dove Spray Invisible Care', reorder_level: 2, cost: 2, price: 3 },
  { name: 'Dove Spray Original', reorder_level: 2, cost: 2, price: 3 },
  { name: 'Dove Spray ១', reorder_level: 2, cost: 2, price: 3 },
  { name: 'Dove Spray ២', reorder_level: 2, cost: 2, price: 3 },
  {
    name: 'Beauty of Joseon Serum Revive',
    reorder_level: 6,
    cost: 6.77,
    price: 8,
  },
  {
    name: 'Beauty of Joseon Glow Serum',
    reorder_level: 6,
    cost: 6.7,
    price: 8,
  },
  {
    name: 'Beauty of Joseon Glow Deep Serum',
    reorder_level: 6,
    cost: 7.09,
    price: 8.5,
  },
  {
    name: 'Mary May Collagen Charcoal Pore Mask',
    reorder_level: 1,
    cost: 7.5,
    price: 8.5,
  },
  {
    name: 'Mary May Collagen Red Ginseng Mask',
    reorder_level: 6,
    cost: 7.5,
    price: 8.5,
  },
  {
    name: 'Mary May Collagen Fresh Aloe Mask',
    reorder_level: 6,
    cost: 7.5,
    price: 8.5,
  },
  { name: 'Mary & May Intense Cream', reorder_level: 6, cost: 7.7, price: 9 },
  {
    name: 'Mary May Retinol 0.1% Cica Serum',
    reorder_level: 6,
    cost: 8.5,
    price: 9.5,
  },
  { name: 'Mary & May Cica Sun Cream', reorder_level: 6, cost: 6.7, price: 8 },
  {
    name: 'Mary & May Collagen Peptide Mask',
    reorder_level: 1,
    cost: 6.7,
    price: 8,
  },
  {
    name: 'Mary & May Soothing Gel Cream',
    reorder_level: 6,
    cost: 7.5,
    price: 8.5,
  },
  {
    name: 'Mary & May Wash Off Pack Lemon',
    reorder_level: 7,
    cost: 8,
    price: 9,
  },
  {
    name: 'Skin1004 PROBIO-CICA Enrich Cream',
    reorder_level: 2,
    cost: 11.53,
    price: 12.5,
  },
  {
    name: 'Skin1004 HYALU-CICA Jelly-fit Pad',
    reorder_level: 6,
    cost: 8.5,
    price: 9.5,
  },
  {
    name: 'Skin1004 Poremizing Clay Stick Mask',
    reorder_level: 6,
    cost: 8.2,
    price: 9.5,
  },
  {
    name: 'Skin1004 Centella Cleansing Oil 30ml',
    reorder_level: 6,
    cost: 3,
    price: 4,
  },
  {
    name: 'Skin1004 Retinol 0.2% Ampoule',
    reorder_level: 6,
    cost: 7.96,
    price: 9,
  },
  {
    name: 'Skin1004 Matrixyl 10% Ampoule',
    reorder_level: 6,
    cost: 9.85,
    price: 11,
  },
  { name: 'Skin1004 Tea-Trica BHA Foam', reorder_level: 6, cost: 7, price: 8 },
  {
    name: 'Skin1004 HYALU-CICA Brightening Toner',
    reorder_level: 6,
    cost: 7.96,
    price: 9,
  },
  {
    name: 'Skin1004 PROBIO-CICA Essence Toner',
    reorder_level: 2,
    cost: 7.86,
    price: 9,
  },
  {
    name: 'Skin1004 CENTELLA Suncream Plus',
    reorder_level: 2,
    cost: 7.83,
    price: 9,
  },
  {
    name: 'Skin1004 Poremizing Sunscreen',
    reorder_level: 2,
    cost: 8,
    price: 9,
  },
  { name: 'Round Lab Sunscreen ឈូក', reorder_level: 2, cost: 8.5, price: 9.5 },
  { name: 'Round Lab Sunscreen បៃតង', reorder_level: 2, cost: 8.5, price: 9.5 },
  {
    name: 'Makeup Miya 3D Sunflower Eyelash Curler',
    reorder_level: 6,
    cost: 1.75,
    price: 3,
  },
  {
    name: 'Makeup Miya Eyelash Curler',
    reorder_level: 6,
    cost: 1.75,
    price: 3,
  },
  {
    name: 'Makeup Miya Sky-High Curling Eyelash Curler',
    reorder_level: 6,
    cost: 1.75,
    price: 3,
  },
];

async function seed() {
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
          `  node scripts/seed-products.js ${s.id}  # ${s.store_name}`,
        ),
      );
      process.exit(0);
    }
  }

  // Skip existing products by name to avoid duplicates
  const { data: existing } = await supabase
    .from('products')
    .select('name')
    .eq('store_id', storeId);

  const existingNames = new Set(
    (existing || []).map((p) => p.name.trim().toLowerCase()),
  );

  const toInsert = PRODUCTS.filter(
    (p) => !existingNames.has(p.name.trim().toLowerCase()),
  ).map((p, i) => ({
    name: p.name,
    sku: `${SKU_PREFIX}-${String(i + 1).padStart(3, '0')}`,
    price: p.price,
    cost: p.cost,
    reorder_level: p.reorder_level,
    store_id: storeId,
  }));

  if (toInsert.length === 0) {
    console.log('✅ All products already exist. Nothing to insert.');
    return;
  }

  console.log(`Inserting ${toInsert.length} products...`);

  // Insert in batches of 50 to avoid request size limits
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select('id, name, sku');

    if (error) {
      console.error(
        `❌ Error inserting batch starting at ${i}:`,
        error.message,
      );
      process.exit(1);
    }
    inserted += data.length;
    data.forEach((p) => console.log(`  ✓ [${p.sku}] ${p.name}`));
  }

  console.log(`\n✅ Successfully inserted ${inserted} products!`);
}

seed();
