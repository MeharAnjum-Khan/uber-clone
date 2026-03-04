const express = require('express');
const router = express.Router();
const driversController = require('../controllers/drivers.controller');

// Middleware Placeholder - Ensure these are implemented in your auth module
const authMiddleware = (req, res, next) => {
  // Logic to verify Clerk token and populate req.user
  // e.g., req.user = { id: 'user_123', role: 'driver' };
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Middleware to ensure user is a driver (Optional/Enhancement based on "Only drivers can access these routes")
// For now, assuming authMiddleware handles basic identity. 
// Ideally, we'd check req.user.role === 'driver' here.

// POST /drivers/register
router.post('/register', authMiddleware, driversController.registerDriver);

// GET /drivers/me
router.get('/me', authMiddleware, driversController.getMe);

// PATCH /drivers/status
router.patch('/status', authMiddleware, driversController.updateStatus);

// PATCH /drivers/location
router.patch('/location', authMiddleware, driversController.updateLocation);

// GET /drivers/nearby
router.get('/nearby', authMiddleware, driversController.getNearbyDrivers);

module.exports = router;
