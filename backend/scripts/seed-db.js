const fs = require('fs');
const path = require('path');
require('dotenv').config();
const StreamArray = require('stream-json/streamers/StreamArray');
const db = require('../db');

const filePath = path.join(__dirname, '../../foodNutrientDatabase_trimmed.json');

const BATCH_SIZE = 500;
let batch = [];

async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS seed_raw_json (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await db.query(createSql);
}

async function insertBatch(items) {
  if (!items.length) return;
  const placeholders = items.map(() => '(?)').join(',');
  const values = items.map(i => JSON.stringify(i));
  const sql = `INSERT INTO seed_raw_json (data) VALUES ${placeholders}`;
  await db.query(sql, values);
}

(async () => {
  console.log('Seeding DB from', filePath);
  try {
    await ensureTable();
  } catch (err) {
    console.error('Failed creating seed table:', err.message || err);
    process.exit(1);
  }

  const stream = fs.createReadStream(filePath).pipe(StreamArray.withParser());

  stream.on('data', async ({key, value}) => {
    stream.pause();
    try {
      batch.push(value);
      if (batch.length >= BATCH_SIZE) {
        await insertBatch(batch);
        console.log(`Inserted ${batch.length} items...`);
        batch = [];
      }
    } catch (err) {
      console.error('Insert error:', err);
      process.exit(1);
    } finally {
      stream.resume();
    }
  });

  stream.on('end', async () => {
    try {
      if (batch.length) {
        await insertBatch(batch);
        console.log(`Inserted final ${batch.length} items.`);
      }
      console.log('Seeding complete.');
      process.exit(0);
    } catch (err) {
      console.error('Final insert error:', err);
      process.exit(1);
    }
  });

  stream.on('error', err => {
    console.error('Stream error:', err);
    process.exit(1);
  });
})().catch(err => {
  console.error(err);
  process.exit(1);
});
