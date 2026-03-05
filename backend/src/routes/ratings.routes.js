const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratings.controller');

// Middleware Placeholder - Ensure these are implemented in your auth module
const authMiddleware = (req, res, next) => {
  // Logic to verify Clerk token and populate req.user
  // e.g., req.user = { id: 'user_123', role: 'rider' };
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /ratings/submit
router.post('/submit', authMiddleware, ratingsController.submitRating);

// GET /ratings/ride/:rideId
router.get('/ride/:rideId', authMiddleware, ratingsController.getRideRatings);

// GET /ratings/user/:userId/average
// Note: This might be public or protected. Assuming protected to keep consistency with other modules.
router.get('/user/:userId/average', authMiddleware, ratingsController.getUserAverage);

module.exports = router;
