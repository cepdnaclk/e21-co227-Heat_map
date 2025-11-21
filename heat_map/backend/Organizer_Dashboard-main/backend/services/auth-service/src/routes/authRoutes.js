const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { approveOrganizer } = require('../utils/approveOrganizer');

// Register a new organizer
router.post('/register', register);

// Login an organizer and return JWT
router.post('/login', login);

module.exports = router;

// Admin approval endpoint
router.get('/approve/:organizerId', approveOrganizer); // email link
router.put('/approve/:organizerId', approveOrganizer); // admin dashboard / Postman