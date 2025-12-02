const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'foodNutrientDatabase_trimmed.json');
const BACKUP = path.join(__dirname, '..', '..', 'foodNutrientDatabase_trimmed_backup.json');

function containsApplebee(x) {
  if (!x) return false;
  const s = (String(x)).toLowerCase();
  return s.includes("applebee") || s.includes("applebee's") || s.includes("applebees");
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
    return !(containsApplebee(desc) || containsApplebee(brand));
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
