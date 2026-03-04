const express = require('express');
const router = express.Router();
const ridesController = require('../controllers/rides.controller');

// Middleware Placeholder - Ensure these are implemented in your auth module
const authMiddleware = (req, res, next) => {
  // Logic to verify Clerk token and populate req.user
  // e.g., req.user = { id: 'user_123', role: 'rider' };
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};


// GET /rides/estimate
router.get('/estimate', authMiddleware, ridesController.getEstimate);

// POST /rides/request
router.post('/request', authMiddleware, ridesController.requestRide);

// GET /rides/:id
router.get('/:id', authMiddleware, ridesController.getRide);

// PATCH /rides/:id/status
router.patch('/:id/status', authMiddleware, ridesController.updateStatus);

module.exports = router;
