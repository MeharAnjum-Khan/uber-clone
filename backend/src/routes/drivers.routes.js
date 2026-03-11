const express = require('express');
const router = express.Router();
const driversController = require('../controllers/drivers.controller');
const { verifyToken, authMiddleware } = require('../middleware/auth.middleware');

// POST /drivers/register
router.post('/register', verifyToken, authMiddleware, driversController.registerDriver);

// GET /drivers/me
router.get('/me', verifyToken, authMiddleware, driversController.getMe);

// PATCH /drivers/status
router.patch('/status', verifyToken, authMiddleware, driversController.updateStatus);

// PATCH /drivers/location
router.patch('/location', verifyToken, authMiddleware, driversController.updateLocation);

// GET /drivers/nearby
router.get('/nearby', verifyToken, authMiddleware, driversController.getNearbyDrivers);

module.exports = router;
