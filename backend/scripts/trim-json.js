const fs = require('fs');
const path = require('path');
const { parser } = require('stream-json');
const { pick } = require('stream-json/filters/Pick');
const StreamArray = require('stream-json/streamers/StreamArray');

// Input / output files (work on trimmed dataset by default)
const IN_PATH = path.join(__dirname, '..', '..', 'foodNutrientDatabase_trimmed.json');
const OUT_PATH = path.join(__dirname, '..', '..', 'foodNutrientDatabase_trimmed.json');

// Nutrient codes to keep (strings)
const KEEP_CODES = new Set([
  '208','203','205','204','291','269', // macros
  '301','303','304','305','306','307','309', // minerals
  '320','328','323','430','415','418','417','406' // vitamins
]);

// Brand/restaurant patterns to exclude
const BRANDS_REGEX = /PIZZA HUT|PAPA JOHN|PAPA JOHNS|PAPAJOHNS|MCDONALD|BURGER KING|WENDY|DOMINO|KFC|TACO BELL|SUBWAY|STARBUCKS|CHIPOTLE|PIZZA|RESTAURANT|HUT|JOHNS|MCDONALD'S/i;

function normalizePortion(p) {
  if (!p) return null;
  return {
    gramWeight: p.gramWeight != null ? Number(p.gramWeight) : null,
    label: p.modifier || p.amount || p.measureUnit?.name || null,
    amount: p.amount ?? p.value ?? 1,
    measureUnit: p.measureUnit?.name || null
  };
}

function filterNutrients(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(n => {
      const code = n?.nutrient?.number ? String(n.nutrient.number) : (n?.number ? String(n.number) : null);
      return code && KEEP_CODES.has(code);
    })
    .map(n => ({
      nutrient: { number: n.nutrient?.number, name: n.nutrient?.name },
      amount: n.amount ?? n.value ?? 0
    }));
}

async function run() {
  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(OUT_PATH, { encoding: 'utf8' });
    outStream.write('{"foods":[');

    // Simpler: read entire file and parse (safer for this one-off trimming script).
    const raw = fs.readFileSync(IN_PATH, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return reject(new Error('JSON parse failed: ' + err.message));
    }

    let foods = [];
    if (Array.isArray(parsed)) foods = parsed;
    else if (Array.isArray(parsed.foods)) foods = parsed.foods;
    else {
      // find first array property inside the root object
      for (const k of Object.keys(parsed)) {
        if (Array.isArray(parsed[k])) {
          foods = parsed[k];
          break;
        }
      }
    }
    let first = true;
    for (const value of foods) {
      try {
        const desc = (value.description || '').toString();
        const dataType = value.dataType || '';
        const brandOwner = value.brandOwner || value.brand_name || '';

        if (dataType && String(dataType).toLowerCase().includes('branded')) continue;
        if (brandOwner && BRANDS_REGEX.test(String(brandOwner))) continue;
        if (BRANDS_REGEX.test(desc)) continue;

        const item = {
          fdcId: value.fdcId ?? value.fdc_id ?? value.ndbNumber ?? null,
          description: value.description || 'Unknown',
          foodCategory: value.foodCategory?.description || value.foodCategory || null,
          foodPortions: Array.isArray(value.foodPortions) ? value.foodPortions.map(normalizePortion).filter(Boolean) : [],
          foodNutrients: filterNutrients(value.foodNutrients || [])
        };

        const text = (first ? '\n' : ',\n') + JSON.stringify(item);
        first = false;
        outStream.write(text);
      } catch (err) {
        // skip
      }
    }

    outStream.end('\n]}', 'utf8', () => resolve());
  });
}

run().then(() => {
  const { size } = fs.statSync(OUT_PATH);
  console.log('Trimmed file written to', OUT_PATH, 'size:', (size / (1024*1024)).toFixed(1), 'MB');
}).catch(err => {
  console.error('Trim failed:', err);
  process.exit(1);
});
