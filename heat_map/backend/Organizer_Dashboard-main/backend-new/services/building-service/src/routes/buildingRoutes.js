const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');

// Get all buildings
router.get('/', buildingController.getBuildings);

// Get buildings by tag (new route) - MUST be before /:id route
router.get('/filterByTag', buildingController.getBuildingsByTag);

// Get building by ID
router.get('/:id', buildingController.getBuildingById);

// Create new building
router.post('/', buildingController.createBuilding);

// Update building
router.put('/:id', buildingController.updateBuilding);

// Delete building
router.delete('/:id', buildingController.deleteBuilding);

module.exports = router;
