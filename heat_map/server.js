const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_MAIN_SERVER_PORT || process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'peraverse',
  password: process.env.DB_PASSWORD || 'MND=mano#99', // replace with your password
  port: process.env.DB_PORT || 5432,
});

// Building configuration with capacity limits
const buildings = [
  { buildingId: 1, buildingName: "Faculty Canteen", baseCount: 60, capacity: 120, color: "#ff6384" },
  { buildingId: 2, buildingName: "Lecture Hall 1", baseCount: 40, capacity: 100, color: "#36a2eb" },
  { buildingId: 3, buildingName: "Drawing Office 1", baseCount: 90, capacity: 150, color: "#cc65fe" },
  { buildingId: 4, buildingName: "Library", baseCount: 75, capacity: 200, color: "#aaff80" },
  { buildingId: 5, buildingName: "Lab 1", baseCount: 50, capacity: 80, color: "#f57c00" },
  { buildingId: 6, buildingName: "Lecture Hall 2", baseCount: 30, capacity: 90, color: "#7cb342" },
  { buildingId: 7, buildingName: "Drawing Office 2", baseCount: 85, capacity: 130, color: "#323cc3ff" },
  // Added new buildings for testing
  { buildingId: 8, buildingName: "Auditorium", baseCount: 55, capacity: 110, color: "#ffb300" },
  { buildingId: 9, buildingName: "Sports Complex", baseCount: 35, capacity: 140, color: "#00bcd4" },
  { buildingId: 10, buildingName: "Staff Room", baseCount: 20, capacity: 60, color: "#8bc34a" }
];

// Store the last generated counts to create smoother transitions
let lastCounts = buildings.reduce((acc, building) => {
  acc[building.buildingId] = {
    current: building.baseCount,
    predicted: building.baseCount
  };
  return acc;
}, {});

// Generate more realistic crowd data
function generateCrowdData() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timestamp = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
  
  return buildings.map(building => {
    // Get last counts for this building
    const last = lastCounts[building.buildingId];
    
    // Generate new current count with small random change (-5 to +5)
    const randomChange = Math.floor(Math.random() * 11) - 5;
    const currentCount = Math.max(10, Math.min(building.capacity, last.current + randomChange));
    
    // More realistic prediction logic:
    let predictedCount;
    
    // Time-based factors (e.g., lunch rush at canteen)
    const isLunchHour = hour >= 12 && hour < 14;
    const isEveningHour = hour >= 17 && hour <= 19;
    const isMorningRush = hour >= 8 && hour < 10;
    
    // Building-specific patterns
    if (building.buildingName.includes("Canteen") && isLunchHour) {
      // Canteen during lunch - predict increasing crowd
      predictedCount = currentCount + Math.floor(Math.random() * 20) + 5;
    } else if (building.buildingName.includes("Library") && isEveningHour) {
      // Library in evening - predict increasing crowd
      predictedCount = currentCount + Math.floor(Math.random() * 15) + 3;
    } else if (building.buildingName.includes("Lecture Hall") && isMorningRush) {
      // Lecture halls in morning - predict filling up
      predictedCount = currentCount + Math.floor(Math.random() * 25) + 10;
    } else {
      // Default prediction logic:
      // 60% chance of increase, 30% chance of decrease, 10% chance of stable
      const predictionType = Math.random();
      
      if (predictionType < 0.6) {
        // Increasing (most common)
        predictedCount = currentCount + Math.floor(Math.random() * 10) + 1;
      } else if (predictionType < 0.9) {
        // Decreasing
        predictedCount = Math.max(5, currentCount - Math.floor(Math.random() * 8));
      } else {
        // Stable
        predictedCount = currentCount;
      }
    }
    
    // Ensure prediction doesn't exceed capacity
    predictedCount = Math.min(building.capacity, predictedCount);
    
    // Store these counts for next time
    lastCounts[building.buildingId] = {
      current: currentCount,
      predicted: predictedCount
    };
    
    return {
      buildingId: building.buildingId,
      buildingName: building.buildingName,
      currentCount,
      predictedCount,
      color: building.color,
      timestamp
    };
  });
}

// API endpoint - now with random data
app.get('/api/crowd', async (req, res) => {
  // Generate fresh random data
  const dataSet = generateCrowdData();
  res.json(dataSet);

  // Store each building's data in the database
  for (const d of dataSet) {
    try {
      await pool.query(
        'INSERT INTO crowd_history (building_name, current_count, predicted_count, timestamp) VALUES ($1, $2, $3, $4)',
        [d.buildingName, d.currentCount, d.predictedCount, d.timestamp]
      );
    } catch (err) {
      console.error('DB insert error:', err.message);
    }
  }
});

// Save crowd data
app.post('/api/crowd-history', async (req, res) => {
  const { buildingName, currentCount, predictedCount, timestamp } = req.body;
  try {
    await pool.query(
      'INSERT INTO crowd_history (building_name, current_count, predicted_count, timestamp) VALUES ($1, $2, $3, $4)',
      [buildingName, currentCount, predictedCount, timestamp]
    );
    res.status(201).json({ message: 'Data saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all crowd history
app.get('/api/crowd-history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM crowd_history');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get crowd history for a specific building - last 120 SECONDS of data (2 minutes)
app.get('/api/building-history/:buildingName', async (req, res) => {
  try {
    const { buildingName } = req.params;
    
    // Get the most recent 120 seconds of data
    // Since data is collected every 5 seconds: 120 ÷ 5 = 24 entries
    const result = await pool.query(
      `SELECT * FROM crowd_history 
       WHERE building_name = $1 
       ORDER BY id DESC LIMIT 24`, // 24 entries = 120 seconds at 5-second intervals
      [buildingName]
    );
    
    // Return in ascending timestamp order (oldest first)
    res.json(result.rows.reverse());
    
  } catch (err) {
    console.error('Error fetching building history:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});