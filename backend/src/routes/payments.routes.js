const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');

// Middleware Placeholder - Ensure these are implemented in your auth module
const authMiddleware = (req, res, next) => {
  // Logic to verify Clerk token and populate req.user
  // e.g., req.user = { id: 'user_123', role: 'rider' };
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /payments/create-intent
router.post('/create-intent', authMiddleware, paymentsController.createIntent);

// POST /payments/webhook
// Critical: Stripe requires the raw body to verify the signature.
// We use express.raw matches the application/json content type from Stripe via config or generic match
router.post(
  '/webhook', 
  express.raw({ type: 'application/json' }), 
  paymentsController.handleWebhook
);

// GET /payments/history
router.get('/history', authMiddleware, paymentsController.getHistory);

module.exports = router;
