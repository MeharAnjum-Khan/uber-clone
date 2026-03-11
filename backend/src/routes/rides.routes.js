const express = require('express');
const router = express.Router();
const ridesController = require('../controllers/rides.controller');
const { verifyToken, authMiddleware } = require('../middleware/auth.middleware');

// GET /rides/estimate
router.get('/estimate', verifyToken, authMiddleware, ridesController.getEstimate);

// GET /rides/history
router.get('/history', verifyToken, authMiddleware, ridesController.getHistory);

// POST /rides/request
router.post('/request', verifyToken, authMiddleware, ridesController.requestRide);

// GET /rides/:id
router.get('/:id', verifyToken, authMiddleware, ridesController.getRide);

// PATCH /rides/:id/status
router.patch('/:id/status', verifyToken, authMiddleware, ridesController.updateStatus);

module.exports = router;
