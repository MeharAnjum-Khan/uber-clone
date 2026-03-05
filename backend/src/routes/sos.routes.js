const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');

// Middleware Placeholder - Ensure these are implemented in your auth module
const authMiddleware = (req, res, next) => {
  // Logic to verify Clerk token and populate req.user
  // e.g., req.user = { id: 'user_123', role: 'rider' };
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /sos/trigger
router.post('/trigger', authMiddleware, sosController.triggerSOS);

// GET /sos/ride/:rideId
router.get('/ride/:rideId', authMiddleware, sosController.getRideAlerts);

// PATCH /sos/:id/resolve
router.patch('/:id/resolve', authMiddleware, sosController.resolveAlert);

module.exports = router;
