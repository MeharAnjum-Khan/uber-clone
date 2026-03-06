const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');

// Middleware Placeholder
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /promo-codes - Create
router.post('/', authMiddleware, promoController.create);

// GET /promo-codes/:code - Get Details
router.get('/:code', authMiddleware, promoController.getDetails);

// POST /promo-codes/validate - Validate Code
router.post('/validate', authMiddleware, promoController.validate);

// DELETE /promo-codes/:code - Delete
router.delete('/:code', authMiddleware, promoController.remove);

module.exports = router;
