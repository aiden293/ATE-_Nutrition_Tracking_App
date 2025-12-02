require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
let db;
let jsonDb;
try {
  db = require('./db');
} catch (e) {
  // db module missing or not configured
}
try {
  jsonDb = require('./jsonDb');
} catch (e) {
  // jsonDb may not exist
}

// Flexible detection for JSON mode: accept '1','true','yes' (case-insensitive)
const _useJsonEnv = process.env.USE_JSON_DB;
const envJsonTrue = typeof _useJsonEnv === 'string' && !['0', 'false', 'no', ''].includes(_useJsonEnv.toLowerCase());
const JSON_MODE = envJsonTrue;

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// Health endpoint to diagnose JSON vs SQL mode and file availability
app.get('/api/health', (req, res) => {
  const jsonPath = path.join(__dirname, '../foodNutrientDatabase_trimmed.json');
  const jsonExists = fs.existsSync(jsonPath);
  res.json({
    mode: JSON_MODE ? 'json' : (db ? 'sql' : 'none'),
    jsonExists,
    jsonPath,
    dbLoaded: !!db
  });
});

app.get('/api/foods', async (req, res) => {
  // If USE_JSON_DB is set (flexibly) or no SQL db configured, use the JSON file.
  const useJson = JSON_MODE || !db;
  if (useJson && jsonDb) {
    try {
      const items = await jsonDb.streamFind(100);
      return res.json(items);
    } catch (err) {
      console.error('JSON foods fetch error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (!db) return res.status(500).json({ error: 'No database configured' });

  try {
    const [rows] = await db.query(`
      SELECT DISTINCT
        f.cn_code as id,
        f.descriptor as name,
        CONCAT(w.amount, ' ', w.measure_description) as unit,
        -- Macronutrients
        MAX(CASE WHEN n.nutrient_code = 208 THEN nv.nutrient_value ELSE 0 END) as calories,
        MAX(CASE WHEN n.nutrient_code = 203 THEN nv.nutrient_value ELSE 0 END) as protein,
        MAX(CASE WHEN n.nutrient_code = 205 THEN nv.nutrient_value ELSE 0 END) as carbs,
        MAX(CASE WHEN n.nutrient_code = 204 THEN nv.nutrient_value ELSE 0 END) as fat,
        MAX(CASE WHEN n.nutrient_code = 291 THEN nv.nutrient_value ELSE 0 END) as fiber,
        MAX(CASE WHEN n.nutrient_code = 269 THEN nv.nutrient_value ELSE 0 END) as sugar,
        -- Minerals (mg)
        MAX(CASE WHEN n.nutrient_code = 301 THEN nv.nutrient_value ELSE 0 END) as calcium,
        MAX(CASE WHEN n.nutrient_code = 303 THEN nv.nutrient_value ELSE 0 END) as iron,
        MAX(CASE WHEN n.nutrient_code = 304 THEN nv.nutrient_value ELSE 0 END) as magnesium,
        MAX(CASE WHEN n.nutrient_code = 305 THEN nv.nutrient_value ELSE 0 END) as phosphorus,
        MAX(CASE WHEN n.nutrient_code = 306 THEN nv.nutrient_value ELSE 0 END) as potassium,
        MAX(CASE WHEN n.nutrient_code = 307 THEN nv.nutrient_value ELSE 0 END) as sodium,
        MAX(CASE WHEN n.nutrient_code = 309 THEN nv.nutrient_value ELSE 0 END) as zinc,
        -- Vitamins
        MAX(CASE WHEN n.nutrient_code = 320 THEN nv.nutrient_value ELSE 0 END) as vitaminA,
        MAX(CASE WHEN n.nutrient_code = 401 THEN nv.nutrient_value ELSE 0 END) as vitaminC,
        MAX(CASE WHEN n.nutrient_code = 328 THEN nv.nutrient_value ELSE 0 END) as vitaminD,
        MAX(CASE WHEN n.nutrient_code = 323 THEN nv.nutrient_value ELSE 0 END) as vitaminE,
        MAX(CASE WHEN n.nutrient_code = 430 THEN nv.nutrient_value ELSE 0 END) as vitaminK,
        MAX(CASE WHEN n.nutrient_code = 415 THEN nv.nutrient_value ELSE 0 END) as vitaminB6,
        MAX(CASE WHEN n.nutrient_code = 418 THEN nv.nutrient_value ELSE 0 END) as vitaminB12,
        MAX(CASE WHEN n.nutrient_code = 417 THEN nv.nutrient_value ELSE 0 END) as folate,
        MAX(CASE WHEN n.nutrient_code = 406 THEN nv.nutrient_value ELSE 0 END) as niacin
      FROM cndb_fdes f
      LEFT JOIN cndb_nutval nv ON f.cn_code = nv.cn_code
      LEFT JOIN cndb_nutdes n ON nv.nutrient_code = n.nutrient_code
      LEFT JOIN cndb_wght w ON f.cn_code = w.cn_code AND w.weights_sequence_number = 1
      WHERE f.descriptor IS NOT NULL
      GROUP BY f.cn_code, f.descriptor, w.amount, w.measure_description
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error('Foods fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/foods/search/:query', async (req, res) => {
  const useJson = JSON_MODE || !db;
  const q = req.params.query || '';
  if (useJson && jsonDb) {
    try {
      const items = await jsonDb.streamSearch(q, 50);
      return res.json(items);
    } catch (err) {
      console.error('JSON food search error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (!db) return res.status(500).json({ error: 'No database configured' });

  try {
    // Support multi-term searches: split query into tokens and require each token to appear (AND)
    const tokens = q.split(/\s+/).filter(Boolean);
    let sql = `
      SELECT DISTINCT
        f.cn_code as id,
        f.descriptor as name,
        CONCAT(COALESCE(w.amount, 100), ' ', COALESCE(w.measure_description, 'g')) as unit,
        -- Macronutrients
        MAX(CASE WHEN n.nutrient_code = 208 THEN nv.nutrient_value ELSE 0 END) as calories,
        MAX(CASE WHEN n.nutrient_code = 203 THEN nv.nutrient_value ELSE 0 END) as protein,
        MAX(CASE WHEN n.nutrient_code = 205 THEN nv.nutrient_value ELSE 0 END) as carbs,
        MAX(CASE WHEN n.nutrient_code = 204 THEN nv.nutrient_value ELSE 0 END) as fat,
        MAX(CASE WHEN n.nutrient_code = 291 THEN nv.nutrient_value ELSE 0 END) as fiber,
        MAX(CASE WHEN n.nutrient_code = 269 THEN nv.nutrient_value ELSE 0 END) as sugar,
        -- Minerals (mg)
        MAX(CASE WHEN n.nutrient_code = 301 THEN nv.nutrient_value ELSE 0 END) as calcium,
        MAX(CASE WHEN n.nutrient_code = 303 THEN nv.nutrient_value ELSE 0 END) as iron,
        MAX(CASE WHEN n.nutrient_code = 304 THEN nv.nutrient_value ELSE 0 END) as magnesium,
        MAX(CASE WHEN n.nutrient_code = 305 THEN nv.nutrient_value ELSE 0 END) as phosphorus,
        MAX(CASE WHEN n.nutrient_code = 306 THEN nv.nutrient_value ELSE 0 END) as potassium,
        MAX(CASE WHEN n.nutrient_code = 307 THEN nv.nutrient_value ELSE 0 END) as sodium,
        MAX(CASE WHEN n.nutrient_code = 309 THEN nv.nutrient_value ELSE 0 END) as zinc,
        -- Vitamins
        MAX(CASE WHEN n.nutrient_code = 320 THEN nv.nutrient_value ELSE 0 END) as vitaminA,
        MAX(CASE WHEN n.nutrient_code = 401 THEN nv.nutrient_value ELSE 0 END) as vitaminC,
        MAX(CASE WHEN n.nutrient_code = 328 THEN nv.nutrient_value ELSE 0 END) as vitaminD,
        MAX(CASE WHEN n.nutrient_code = 323 THEN nv.nutrient_value ELSE 0 END) as vitaminE,
        MAX(CASE WHEN n.nutrient_code = 430 THEN nv.nutrient_value ELSE 0 END) as vitaminK,
        MAX(CASE WHEN n.nutrient_code = 415 THEN nv.nutrient_value ELSE 0 END) as vitaminB6,
        MAX(CASE WHEN n.nutrient_code = 418 THEN nv.nutrient_value ELSE 0 END) as vitaminB12,
        MAX(CASE WHEN n.nutrient_code = 417 THEN nv.nutrient_value ELSE 0 END) as folate,
        MAX(CASE WHEN n.nutrient_code = 406 THEN nv.nutrient_value ELSE 0 END) as niacin
      FROM cndb_fdes f
      LEFT JOIN cndb_nutval nv ON f.cn_code = nv.cn_code
      LEFT JOIN cndb_nutdes n ON nv.nutrient_code = n.nutrient_code
      LEFT JOIN cndb_wght w ON f.cn_code = w.cn_code AND w.weights_sequence_number = 1
    `;

    const params = [];
    if (tokens.length > 0) {
      const likeClauses = tokens.map(() => `f.descriptor LIKE ?`).join(' AND ');
      sql += ` WHERE ${likeClauses}`;
      for (const t of tokens) params.push(`%${t}%`);
    }

    sql += ` GROUP BY f.cn_code, f.descriptor, w.amount, w.measure_description LIMIT 50`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meals', async (req, res) => {
  const { userId, date, items, totalNutrients } = req.body;
  console.log('Meal saved:', { userId, date, items, totalNutrients });
  
  res.json({ 
    success: true, 
    mealId: Date.now(),
    message: '식사가 저장되었습니다 (임시)'
  });
});

app.get('/api/meals/:userId', async (req, res) => {
  res.json([]);
});

// Meal suggestion endpoint - suggests meals based on nutrient deficiencies
app.post('/api/suggest-meals', async (req, res) => {
  const { deficiencies, allergies } = req.body; // deficiencies: Array of {nutrient, deficit, target}, allergies: string
  
  if (!deficiencies || !Array.isArray(deficiencies) || deficiencies.length === 0) {
    return res.json([]);
  }

  try {
    const mealTemplates = require('./mealTemplates');
    const useJson = JSON_MODE || !db;
    
    if (!useJson || !jsonDb) {
      return res.status(500).json({ error: 'Meal suggestions require JSON database mode' });
    }

    // Parse allergies into array of lowercase terms
    const allergyList = allergies 
      ? allergies.toLowerCase().split(',').map(a => a.trim()).filter(Boolean)
      : [];

    // Helper to search for a food and pick best match
    const findFood = async (searchTerm) => {
      const results = await jsonDb.streamSearch(searchTerm, 5);
      return results[0] || null; // Pick first match
    };

    // Process each meal template
    const enrichedMeals = await Promise.all(
      mealTemplates.map(async (template) => {
        try {
          // Look up each food in the template
          const foodDataPromises = template.foods.map(async (foodSpec) => {
            const food = await findFood(foodSpec.search);
            if (!food) return null;
            
            // Food database has nutrients per 100g, need to scale properly
            let multiplier = 1; // Default to 1x (100g portion)
            
            // For gram amounts, divide by 100 since DB is per 100g
            if (foodSpec.unit === 'g') {
              multiplier = (foodSpec.amount || 100) / 100;
            }
            // For count-based units, use much smaller multipliers
            else if (['large', 'medium', 'small'].includes(foodSpec.unit)) {
              multiplier = foodSpec.amount * 0.5; // Each unit ~= 50g
            }
            else if (['slice', 'pieces', 'whole', 'patty', 'shells', 'tortillas', 'roll', 'cloves'].includes(foodSpec.unit)) {
              multiplier = foodSpec.amount * 0.3; // Each unit ~= 30g
            }
            else if (['cup', 'tbsp', 'tsp'].includes(foodSpec.unit)) {
              multiplier = foodSpec.amount * 0.5; // Conservative estimate
            }
            
            return {
              name: food.name,
              amount: foodSpec.amount,
              unit: foodSpec.unit,
              nutrients: {
                calories: (food.calories || 0) * multiplier,
                protein: (food.protein || 0) * multiplier,
                carbs: (food.carbs || 0) * multiplier,
                fat: (food.fat || 0) * multiplier,
                fiber: (food.fiber || 0) * multiplier,
                sugar: (food.sugar || 0) * multiplier,
                calcium: (food.calcium || 0) * multiplier,
                iron: (food.iron || 0) * multiplier,
                magnesium: (food.magnesium || 0) * multiplier,
                phosphorus: (food.phosphorus || 0) * multiplier,
                potassium: (food.potassium || 0) * multiplier,
                sodium: (food.sodium || 0) * multiplier,
                zinc: (food.zinc || 0) * multiplier,
                vitaminA: (food.vitaminA || 0) * multiplier,
                vitaminC: (food.vitaminC || 0) * multiplier,
                vitaminD: (food.vitaminD || 0) * multiplier,
                vitaminE: (food.vitaminE || 0) * multiplier,
                vitaminK: (food.vitaminK || 0) * multiplier,
                vitaminB6: (food.vitaminB6 || 0) * multiplier,
                vitaminB12: (food.vitaminB12 || 0) * multiplier,
                folate: (food.folate || 0) * multiplier,
                niacin: (food.niacin || 0) * multiplier
              }
            };
          });

          const foodData = (await Promise.all(foodDataPromises)).filter(Boolean);
          
          if (foodData.length === 0) return null;

          // Check for allergens - if any food name contains an allergen, skip this meal
          if (allergyList.length > 0) {
            const mealContainsAllergen = foodData.some(food => 
              allergyList.some(allergen => food.name.toLowerCase().includes(allergen))
            );
            if (mealContainsAllergen) {
              return null; // Skip this meal
            }
          }

          // Calculate total nutrients for the meal
          const totalNutrients = foodData.reduce((acc, food) => {
            Object.keys(food.nutrients).forEach(key => {
              acc[key] = (acc[key] || 0) + (food.nutrients[key] || 0);
            });
            return acc;
          }, {});

          // Score meal based on deficiency coverage
          let coverageScore = 0;
          let deficitsCovered = 0;
          
          deficiencies.forEach(deficit => {
            const nutrientValue = totalNutrients[deficit.nutrient] || 0;
            const coveragePercent = (nutrientValue / deficit.deficit) * 100;
            if (coveragePercent >= 20) { // Meal provides at least 20% of deficit
              coverageScore += coveragePercent;
              deficitsCovered++;
            }
          });

          return {
            id: template.id,
            name: template.name,
            category: template.category,
            foods: foodData,
            totalNutrients,
            coverageScore,
            deficitsCovered
          };
        } catch (err) {
          console.error(`Error processing template ${template.name}:`, err);
          return null;
        }
      })
    );

    // Filter out failed templates and sort by coverage score
    const validMeals = enrichedMeals
      .filter(meal => meal !== null && meal.deficitsCovered > 0)
      .sort((a, b) => b.coverageScore - a.coverageScore)
      .slice(0, 5); // Return top 5 meals

    res.json(validMeals);
  } catch (error) {
    console.error('Meal suggestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resilient listen with automatic port fallback if in use
const basePort = Number(PORT);
const attemptListen = (p, tries = 0) => {
  const server = app.listen(p, () => {
    console.log(`🚀 Backend server running on http://localhost:${p}`);
    console.log(`📊 Using database: ${process.env.DB_NAME || 'cndb_sql_db'}`);
    if (p !== basePort) {
      console.log(`⚠️ Started on fallback port (original ${basePort} was busy).`);
    }
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && tries < 3) {
      const next = p + 1;
      console.warn(`Port ${p} in use, retrying on ${next}...`);
      attemptListen(next, tries + 1);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
};

attemptListen(basePort);