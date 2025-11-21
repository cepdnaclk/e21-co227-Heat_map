// routes/sample_buildings.js
const express = require("express");

const router = express.Router();

// Sample building data with building_id in B## format and id as integer
const sampleBuildings = [
  { id: 1, building_id: "B1", Build_Name: "Engineering Carpentry Shop", total_count: 30 },
  { id: 2, building_id: "B2", Build_Name: "Engineering Workshop", total_count: 10 },
  { id: 3, building_id: "B3", Build_Name: "", total_count: 0 },
  { id: 4, building_id: "B4", Build_Name: "Generator Room", total_count: 30 },
  { id: 5, building_id: "B5", Build_Name: "", total_count: 70 },
  { id: 6, building_id: "B6", Build_Name: "Structure Lab", total_count: 90 },
  { id: 7, building_id: "B7", Build_Name: "Administrative Building", total_count: 90 },
  { id: 8, building_id: "B8", Build_Name: "Canteen", total_count: 40 },
  { id: 9, building_id: "B9", Build_Name: "Lecture Room 10/11", total_count: 40 },
  { id: 10, building_id: "B10", Build_Name: "Engineering Library", total_count: 0 },
  { id: 11, building_id: "B11", Build_Name: "Department of Chemical and process Engineering", total_count: 0 },
  { id: 12, building_id: "B12", Build_Name: "Security Unit", total_count: 40 },
  { id: 13, building_id: "B13", Build_Name: "Drawing Office 2", total_count: 70 },
  { id: 14, building_id: "B14", Build_Name: "Faculty Canteen", total_count: 0 },
  { id: 15, building_id: "B15", Build_Name: "Department of Manufacturing and Industrial Engineering", total_count: 0 },
  { id: 16, building_id: "B16", Build_Name: "Professor E.O.E. Perera Theater", total_count: 50 },
  { id: 17, building_id: "B17", Build_Name: "Electronic Lab", total_count: 0 },
  { id: 18, building_id: "B18", Build_Name: "Washrooms", total_count: 0 },
  { id: 19, building_id: "B19", Build_Name: "Electrical and Electronic Workshop", total_count: 66 },
  { id: 20, building_id: "B20", Build_Name: "Department of Computer Engineering", total_count: 0 },
  { id: 21, building_id: "B21", Build_Name: "", total_count: 67 },
  { id: 22, building_id: "B22", Build_Name: "Environmental Lab", total_count: 33 },
  { id: 23, building_id: "B23", Build_Name: "Applied Mechanics Lab", total_count: 0 },
  { id: 24, building_id: "B24", Build_Name: "New Mechanics Lab", total_count: 80 },
  { id: 25, building_id: "B25", Build_Name: "", total_count: 100 },
  { id: 26, building_id: "B26", Build_Name: "", total_count: 0 },
  { id: 27, building_id: "B27", Build_Name: "", total_count: 0 },
  { id: 28, building_id: "B28", Build_Name: "Materials Lab", total_count: 0 },
  { id: 29, building_id: "B29", Build_Name: "Thermodynamics Lab", total_count: 0 },
  { id: 30, building_id: "B30", Build_Name: "Fluids Lab", total_count: 20 },
  { id: 31, building_id: "B31", Build_Name: "Surveying and Soil Lab", total_count: 0 },
  { id: 32, building_id: "B32", Build_Name: "Department of Engineering Mathematics", total_count: 68 },
  { id: 33, building_id: "B33", Build_Name: "Drawing Office 1", total_count: 0 },
  { id: 34, building_id: "B34", Build_Name: "Department of Electrical and Electronic Engineering ", total_count: 70 }
];

// Route to return building data
router.get("/buildings", (req, res) => {
  res.json({
    success: true,
    count: sampleBuildings.length,
    data: sampleBuildings,
  });
});

module.exports = router;
