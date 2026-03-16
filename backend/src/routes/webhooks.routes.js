const express = require('express');
const router = express.Router();
const webhooksController = require('../controllers/webhooks.controller');

// Clerk webhooks require raw body for signature verification; we use application/json raw parser here
router.post('/clerk', express.raw({ type: 'application/json' }), webhooksController.handleClerkWebhook);

module.exports = router;
