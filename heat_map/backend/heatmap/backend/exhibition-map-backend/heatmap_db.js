// db.js - PostgreSQL Connection Pool Setup

const { Pool } = require('pg');

// Create a new PostgreSQL pool using your local database credentials
const pool = new Pool({
  user: 'postgres',           // PostgreSQL username (default: 'postgres')
  host: 'localhost',          // Database server host (default: 'localhost')
  database: 'heatmap_db',     // Database name (the one you created in pgAdmin)
  password: 'SuRo1415$',  // Your chosen password
  port: process.env.DATABASE_PORT || 5432,                 // PostgreSQL server port (default: 5432)
});

// Test the connection when the module is loaded
pool.connect()
  .then(client => {
    console.log('✅ Successfully connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to the database:', err.message);
    console.error('Full error:', err);
  });

// Export the pool to use in your API routes
module.exports = pool;
