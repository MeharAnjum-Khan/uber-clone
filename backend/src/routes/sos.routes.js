const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');
const { verifyToken, authMiddleware } = require('../middleware/auth.middleware');

// POST /sos/trigger
router.post('/trigger', verifyToken, authMiddleware, sosController.triggerSOS);

// GET /sos/ride/:rideId
router.get('/ride/:rideId', verifyToken, authMiddleware, sosController.getRideAlerts);

// PATCH /sos/:id/resolve
router.patch('/:id/resolve', verifyToken, authMiddleware, sosController.resolveAlert);

module.exports = router;
