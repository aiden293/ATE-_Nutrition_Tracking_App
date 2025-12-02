const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'foodNutrientDatabase_trimmed.json');
const BACKUP = path.join(__dirname, '..', '..', 'foodNutrientDatabase_trimmed_backup_chains.json');

// Common chains / fast food / restaurant brands (case-insensitive)
const CHAIN_PATTERNS = [
  "PIZZA HUT","PAPA JOHN","PAPA JOHNS","PAPAJOHNS","DOMINO","DOMINO'S","MCDONALD","MCDONALD'S","BURGER KING","WENDY","KFC","TACO BELL","SUBWAY","STARBUCKS","CHIPOTLE","POPEYES","APPLEBEE","P.F. CHANG","P F CHANG","PANERA","IHOP","DUNKIN","DUNKIN'","SHAKE SHACK","CARLS JR","CARL'S JR","SONIC","JACK IN THE BOX","PIZZERIA","RESTAURANT","BRANDED","COMMERCIAL","COMMERCIALY PREPARED","COMMERCIALLY PREPARED"
];

const chainRegex = new RegExp(CHAIN_PATTERNS.map(s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'), 'i');

function containsChain(x) {
  if (!x) return false;
  const s = String(x).toLowerCase();
  return chainRegex.test(s);
}

try {
  const raw = fs.readFileSync(FILE, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.foods)) {
    console.error('Unexpected format: top-level "foods" array missing');
    process.exit(2);
  }
  fs.writeFileSync(BACKUP, JSON.stringify(parsed, null, 2), 'utf8');
  const originalCount = parsed.foods.length;

  const filtered = parsed.foods.filter(item => {
    const desc = item.description || '';
    const brand = item.brandOwner || item.brand_owner || item.brand || '';
    const dataType = item.dataType || item.data_type || '';
    const category = item.foodCategory || '';

    // Remove if brand/description/category/dataType indicates chain/fast-food/branded/commercial
    if (containsChain(desc)) return false;
    if (containsChain(brand)) return false;
    if (containsChain(dataType)) return false;
    if (containsChain(category)) return false;

    // Also remove if explicit 'branded' in dataType (case-insensitive)
    if (String(dataType).toLowerCase().includes('branded')) return false;

    return true;
  });

  const removed = originalCount - filtered.length;
  parsed.foods = filtered;
  fs.writeFileSync(FILE, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`Removed ${removed} items. New count: ${filtered.length}`);
  console.log(`Backup written to: ${BACKUP}`);
} catch (err) {
  console.error('Error:', err && err.message);
  process.exit(1);
}
