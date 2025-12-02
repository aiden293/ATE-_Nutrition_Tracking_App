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
const PORT = 5000;


app.use(cors());
app.use(express.json());

// Health endpoint to diagnose JSON vs SQL mode and file availability
app.get('/api/health', (req, res) => {
  const jsonPath = path.join(__dirname, '../foodNutrientDatabase.json');
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
        MAX(CASE WHEN n.nutrient_code = 208 THEN nv.nutrient_value ELSE 0 END) as calories,
        MAX(CASE WHEN n.nutrient_code = 203 THEN nv.nutrient_value ELSE 0 END) as protein,
        MAX(CASE WHEN n.nutrient_code = 205 THEN nv.nutrient_value ELSE 0 END) as carbs,
        MAX(CASE WHEN n.nutrient_code = 204 THEN nv.nutrient_value ELSE 0 END) as fat,
        MAX(CASE WHEN n.nutrient_code = 291 THEN nv.nutrient_value ELSE 0 END) as fiber,
        MAX(CASE WHEN n.nutrient_code = 269 THEN nv.nutrient_value ELSE 0 END) as sugar
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
    const searchTerm = `%${q}%`;
    const [rows] = await db.query(`
      SELECT DISTINCT
        f.cn_code as id,
        f.descriptor as name,
        CONCAT(COALESCE(w.amount, 100), ' ', COALESCE(w.measure_description, 'g')) as unit,
        MAX(CASE WHEN n.nutrient_code = 208 THEN nv.nutrient_value ELSE 0 END) as calories,
        MAX(CASE WHEN n.nutrient_code = 203 THEN nv.nutrient_value ELSE 0 END) as protein,
        MAX(CASE WHEN n.nutrient_code = 205 THEN nv.nutrient_value ELSE 0 END) as carbs,
        MAX(CASE WHEN n.nutrient_code = 204 THEN nv.nutrient_value ELSE 0 END) as fat,
        MAX(CASE WHEN n.nutrient_code = 291 THEN nv.nutrient_value ELSE 0 END) as fiber,
        MAX(CASE WHEN n.nutrient_code = 269 THEN nv.nutrient_value ELSE 0 END) as sugar
      FROM cndb_fdes f
      LEFT JOIN cndb_nutval nv ON f.cn_code = nv.cn_code
      LEFT JOIN cndb_nutdes n ON nv.nutrient_code = n.nutrient_code
      LEFT JOIN cndb_wght w ON f.cn_code = w.cn_code AND w.weights_sequence_number = 1
      WHERE f.descriptor LIKE ?
      GROUP BY f.cn_code, f.descriptor, w.amount, w.measure_description
      LIMIT 50
    `, [searchTerm]);
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

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Using database: ${process.env.DB_NAME || 'cndb_sql_db'}`);
});