const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { verifyToken, authMiddleware } = require('../middleware/auth.middleware');

// POST /payments/create-intent
router.post('/create-intent', verifyToken, authMiddleware, paymentsController.createIntent);

// POST /payments/webhook
// Critical: Stripe requires the raw body to verify the signature.
// We use express.raw matches the application/json content type from Stripe via config or generic match
router.post(
  '/webhook', 
  express.raw({ type: 'application/json' }), 
  paymentsController.handleWebhook
);

// GET /payments/history
router.get('/history', verifyToken, authMiddleware, paymentsController.getHistory);

module.exports = router;
