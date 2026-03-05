const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');

// Middleware Placeholder - Ensure these are implemented in your auth module
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /messages/send
router.post('/send', authMiddleware, messagesController.send);

// GET /messages/ride/:rideId
router.get('/ride/:rideId', authMiddleware, messagesController.getHistory);

module.exports = router;
