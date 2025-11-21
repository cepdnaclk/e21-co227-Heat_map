const express = require("express");
const axios = require("axios");
const pool = require('../heatmap_db'); // pg Pool instance

const router = express.Router();

// URL of the API that gives building data
//this is for local testing with sample_buildings.js
//add correct API URL when deploying
const CCTV_API_URL = process.env.CCTV_API_URL || process.env.VITE_KIOSK_NOTIFICATION_API_URL || "http://localhost:3000/api/buildings";

// Define API base URL for QR API
const API_BASE_URL = "https://ulckzxbsufwjlsyxxzoz.supabase.co/rest/v1";

// Define headers
const headers = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsY2t6eGJzdWZ3amxzeXh4em96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTAwODcsImV4cCI6MjA3MzU4NjA4N30.J8MMNsdLQh6dw7QC1pFtWIZsYV5e2S2iRfWD_vWMsPM",
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsY2t6eGJzdWZ3amxzeXh4em96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTAwODcsImV4cCI6MjA3MzU4NjA4N30.J8MMNsdLQh6dw7QC1pFtWIZsYV5e2S2iRfWD_vWMsPM"
};



//module.exports = getMapID;

// Function to calculate heatmap color
function getHeatmapColor(current, capacity) {
  if (capacity <= 0) return "#cccccc"; // gray for invalid capacity
  const ratio = current / capacity;

  if (ratio < 0.5) return "#22c55e"; // green
  if (ratio < 0.8) return "#ffbf00ff"; // yellow
  if (ratio < 0.9) return "#f97816ff"; // orange
  //if (ratio < 0.9) return "#ff0808ff"; // red
  return "#ff0000ff"; // red
}
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      if(key=="Build_Name") result["building_name"] = obj[key];
      if(key=="building_id") result["building_id"] = obj[key];
      if(key=="total_count") result["current_crowd"] = obj[key];
      
      //result[key] = obj[key];
    }
    return result;
  }, {});
}
async function fetchCapacities() {
  const capacityResult = await pool.query("SELECT building_id, building_capacity FROM buildings");
  const capacityMap = {};
  for (let row of capacityResult.rows) {
    capacityMap[row.building_id] = row.building_capacity;
  }
  return capacityMap;
}



// Route to serve map data with caching
router.get("/map-data", async (req, res) => {
  try {
    // 1️ Check if cached data is recent (less than 1 minutes)
    const dbResult = await pool.query("SELECT b.building_id,b.building_name,cs.current_crowd,b.building_capacity,cs.color,cs.status_timestamp FROM buildings b JOIN current_status cs ON b.building_id = cs.building_id");
    const now = new Date();
    const capacityMap = await fetchCapacities();

    let useCache = true;

    if (dbResult.rows.length > 0) {
      // check if any row is older than 1 minutes
      console.log("--------------------------------------");
      for (let row of dbResult.rows) {
        const diff = (now - new Date(row.status_timestamp)) / 1000 / 60; // diff in minutes
        console.log(`Building ${row.building_id} data age: ${diff.toFixed(2)} minutes`);
        if (diff > 0.002) {
          useCache = false;
          console.log(`Cache expired for building_id ${row.building_id}, fetching fresh data.`);
          break;
        }
      }
    } else {
      useCache = false; // no data in DB
    }

    if (useCache) {
      // Return cached data from DB
      return res.json({
        success: true,
        source: "Database Cache",
        data: dbResult.rows
      });
    }

    // 2️ Otherwise fetch from API
    console.log("Fetching fresh data from Buildings API...");
    //for testing use this fetch.this takes response from sample_buildings.js not real QR API
    //const response = await axios.get(CCTV_API_URL);

    //This gets response from real QR API
    const response = await axios.get(`${API_BASE_URL}/BUILDING`, { headers });


    const buildings = response.data.data || response.data;
    //console.log(`Fetched ${buildings} buildings from API.`);
    
    const coloredBuildings = [];

    for (let building of buildings) {
      const color = getHeatmapColor(building.total_count, capacityMap[building.building_id] );
      const timestamp = new Date().toLocaleString();

      coloredBuildings.push({ ...pick(building, ["building_id","Build_Name", "total_count"]),building_capacity:capacityMap[building.building_id] , color, status_timestamp: timestamp });

      //console.log(building.total_count,building.building_id);
      // Insert or update current_status table
      await pool.query(
        `INSERT INTO current_status (building_id, current_crowd, color, status_timestamp)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (building_id)
         DO UPDATE SET current_crowd = EXCLUDED.current_crowd,
                       color = EXCLUDED.color,
                       status_timestamp = EXCLUDED.status_timestamp`,
        [building.building_id, building.total_count, color, timestamp]
      );
    }

    res.json({
      success: true,
      source: "Buildings API",
      data: coloredBuildings,
    });

  } catch (error) {
    console.error("Error fetching building data:", error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;

