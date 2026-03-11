const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { verifyToken, authMiddleware } = require('../middleware/auth.middleware');

// POST /support/tickets - Create a support ticket
router.post('/tickets', verifyToken, authMiddleware, supportController.createTicket);

// GET /support/tickets - List my tickets
router.get('/tickets', verifyToken, authMiddleware, supportController.getMyTickets);

// GET /support/tickets/:id - View ticket details
router.get('/tickets/:id', verifyToken, authMiddleware, supportController.getTicketDetails);

module.exports = router;
