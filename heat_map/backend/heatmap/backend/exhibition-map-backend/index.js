const express = require('express');
const cors = require('cors');
const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());



 
// ===============================
// FEATURE-BASED ROUTES
// ===============================

// Register each feature router
app.use('/heatmap', require('./routes/heatmap'));       // Heatmap data from CCTV
app.use('/api', require('./routes/sample_buildings'));  // Demo building data
app.get('/', (req, res) => res.json({ msg: "Hello from backend!" }));            // Home route
// ===============================
// SERVER STARTUP
// ===============================
const PORT = process.env.PORT || process.env.BACKEND_HEATMAP_SERVICE_PORT || 3897;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
