const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

let db;

async function getDb() {
  if (db) return db;
  db = await open({
    filename: process.env.DB_PATH || './database.sqlite',
    driver: sqlite3.Database
  });
  return db;
}

async function initDb() {
  const database = await getDb();
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT, -- Hashed
      gender TEXT, -- 'male', 'female'
      age INTEGER,
      weight REAL, -- kg
      height REAL, -- cm
      activity_level REAL, -- PAL
      bmr REAL,
      goal_calories REAL,
      ai_provider TEXT DEFAULT 'gemini' -- 'gemini' or 'openai'
    );
    
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT, -- 'food' or 'sport'
      name TEXT,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT, -- 'food' or 'sport'
      name TEXT,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  console.log('Database initialized');
  return database;
}

module.exports = { getDb, initDb };
