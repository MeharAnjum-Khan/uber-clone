const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratings.controller');
const { verifyToken, authMiddleware } = require('../middleware/auth.middleware');

// POST /ratings/submit
router.post('/submit', verifyToken, authMiddleware, ratingsController.submitRating);

// GET /ratings/ride/:rideId
router.get('/ride/:rideId', verifyToken, authMiddleware, ratingsController.getRideRatings);

// GET /ratings/user/:userId/average
// Note: This might be public or protected. Assuming protected to keep consistency with other modules.
router.get('/user/:userId/average', verifyToken, authMiddleware, ratingsController.getUserAverage);

// GET /ratings/mine - get logged in user's received reviews
router.get('/mine', verifyToken, authMiddleware, ratingsController.getUserReviews);

module.exports = router;
